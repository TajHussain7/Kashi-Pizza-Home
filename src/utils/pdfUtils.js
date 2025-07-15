// PDF generation utilities using multiple libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import { PDFDocument, rgb } from "pdf-lib";

// IndexedDB for PDF storage
const PDF_DB_NAME = "KashiPizzaInvoicePDFs";
const PDF_DB_VERSION = 1;
const PDF_STORE_NAME = "invoices";

// Initialize IndexedDB for PDF storage
const initPDFDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PDF_DB_NAME, PDF_DB_VERSION);

    request.onerror = () => {
      resolve(null);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        const store = db.createObjectStore(PDF_STORE_NAME, {
          keyPath: "invoiceNumber",
        });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("customerName", "customerName", { unique: false });
      }
    };
  });
};

// Store PDF in IndexedDB
const storePDFInIndexedDB = async (invoiceData, pdfBlob) => {
  try {
    const db = await initPDFDatabase();
    if (!db) return false;

    const transaction = db.transaction([PDF_STORE_NAME], "readwrite");
    const store = transaction.objectStore(PDF_STORE_NAME);

    const pdfRecord = {
      invoiceNumber: invoiceData.invoiceNumber,
      customerName: invoiceData.customerName,
      date: invoiceData.invoiceDate,
      createdAt: new Date().toISOString(),
      pdfBlob: pdfBlob,
      size: pdfBlob.size,
    };

    await store.put(pdfRecord);
    return true;
  } catch (error) {
    console.error("Error storing PDF in IndexedDB:", error);
    return false;
  }
};

// Retrieve PDF from IndexedDB
const retrievePDFFromIndexedDB = async (invoiceNumber) => {
  try {
    const db = await initPDFDatabase();
    if (!db) return null;

    const transaction = db.transaction([PDF_STORE_NAME], "readonly");
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.get(invoiceNumber);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error retrieving PDF from IndexedDB:", error);
    return null;
  }
};

// Fallback: Store PDF metadata in localStorage
const storePDFInLocalStorage = (invoiceData, pdfDataUrl) => {
  try {
    const pdfStorage = JSON.parse(localStorage.getItem("invoicePDFs") || "{}");
    pdfStorage[invoiceData.invoiceNumber] = {
      invoiceNumber: invoiceData.invoiceNumber,
      customerName: invoiceData.customerName,
      date: invoiceData.invoiceDate,
      createdAt: new Date().toISOString(),
      dataUrl: pdfDataUrl,
      size: pdfDataUrl.length,
    };

    // Keep only last 10 PDFs to avoid localStorage quota issues
    const sortedPDFs = Object.values(pdfStorage).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (sortedPDFs.length > 10) {
      const keepPDFs = sortedPDFs.slice(0, 10);
      const newStorage = {};
      keepPDFs.forEach((pdf) => {
        newStorage[pdf.invoiceNumber] = pdf;
      });
      localStorage.setItem("invoicePDFs", JSON.stringify(newStorage));
    } else {
      localStorage.setItem("invoicePDFs", JSON.stringify(pdfStorage));
    }

    return true;
  } catch (error) {
    console.error("Error storing PDF in localStorage:", error);
    return false;
  }
};

// Check if PDF already exists
export const checkExistingPDF = async (invoiceNumber) => {
  try {
    // Try IndexedDB first
    const indexedDBResult = await retrievePDFFromIndexedDB(invoiceNumber);
    if (indexedDBResult) {
      return {
        exists: true,
        source: "IndexedDB",
        data: indexedDBResult,
      };
    }

    // Fallback to localStorage
    const localStoragePDFs = JSON.parse(
      localStorage.getItem("invoicePDFs") || "{}"
    );
    if (localStoragePDFs[invoiceNumber]) {
      return {
        exists: true,
        source: "localStorage",
        data: localStoragePDFs[invoiceNumber],
      };
    }

    return { exists: false };
  } catch (error) {
    console.error("Error checking existing PDF:", error);
    return { exists: false };
  }
};

// Download existing PDF
export const downloadExistingPDF = async (invoiceNumber) => {
  try {
    const existingPDF = await checkExistingPDF(invoiceNumber);

    if (!existingPDF.exists) {
      throw new Error("PDF not found");
    }

    if (existingPDF.source === "IndexedDB" && existingPDF.data.pdfBlob) {
      saveAs(existingPDF.data.pdfBlob, `invoice_${invoiceNumber}.pdf`);
      return true;
    }

    if (existingPDF.source === "localStorage" && existingPDF.data.dataUrl) {
      const response = await fetch(existingPDF.data.dataUrl);
      const blob = await response.blob();
      saveAs(blob, `invoice_${invoiceNumber}.pdf`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error downloading existing PDF:", error);
    return false;
  }
};

// Optimized PDF generation

// Method 1: Using html2pdf.js (browser-based) - Main implementation with storage
export const generatePDFWithHtml2PDF = async (
  elementId,
  invoiceData,
  forceRegenerate = false
) => {
  const filename = `invoice_${invoiceData.invoiceNumber}.pdf`;

  try {
    // Check if PDF already exists and not forcing regeneration
    if (!forceRegenerate) {
      const existingPDF = await checkExistingPDF(invoiceData.invoiceNumber);
      if (existingPDF.exists) {
        const downloaded = await downloadExistingPDF(invoiceData.invoiceNumber);
        if (downloaded) {
          return { success: true, reused: true };
        }
      }
    }

    const invoiceElement = document.getElementById(elementId);
    if (!invoiceElement) {
      throw new Error("Element not found");
    }

    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate PDF and get the blob
    const pdfResult = await html2pdf()
      .set(opt)
      .from(invoiceElement)
      .outputPdf("blob");

    // Store the PDF for future use
    const storedInIndexedDB = await storePDFInIndexedDB(invoiceData, pdfResult);

    if (!storedInIndexedDB) {
      // Fallback to localStorage with data URL
      const pdfDataUrl = URL.createObjectURL(pdfResult);
      storePDFInLocalStorage(invoiceData, pdfDataUrl);
    }

    // Download the PDF
    saveAs(pdfResult, filename);

    return { success: true, reused: false };
  } catch (error) {
    console.error("Error generating PDF with html2pdf:", error);
    throw error;
  }
};

// Alternative method using html2pdf.js with custom options and storage
export const handleGeneratePDF = async (
  invoiceData,
  forceRegenerate = false
) => {
  const filename = `invoice_${invoiceData.invoiceNumber}.pdf`;

  try {
    // Check if PDF already exists
    if (!forceRegenerate) {
      const existingPDF = await checkExistingPDF(invoiceData.invoiceNumber);
      if (existingPDF.exists) {
        return await downloadExistingPDF(invoiceData.invoiceNumber);
      }
    }

    const invoiceElement = document.getElementById("invoice-content");

    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate and store PDF
    const pdfResult = await html2pdf()
      .set(opt)
      .from(invoiceElement)
      .outputPdf("blob");

    // Store for future use
    const storedInIndexedDB = await storePDFInIndexedDB(invoiceData, pdfResult);
    if (!storedInIndexedDB) {
      const pdfDataUrl = URL.createObjectURL(pdfResult);
      storePDFInLocalStorage(invoiceData, pdfDataUrl);
    }

    // Download
    saveAs(pdfResult, filename);
    return true;
  } catch (error) {
    console.error("Error in handleGeneratePDF:", error);
    return false;
  }
};

// Method 2: Using jsPDF + html2canvas with storage optimization
export const generatePDF = async (
  elementId,
  invoiceData,
  forceRegenerate = false
) => {
  const filename = `invoice_${invoiceData.invoiceNumber}.pdf`;

  try {
    // Check existing PDF first
    if (!forceRegenerate) {
      const existingPDF = await checkExistingPDF(invoiceData.invoiceNumber);
      if (existingPDF.exists) {
        return await downloadExistingPDF(invoiceData.invoiceNumber);
      }
    }

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Element not found");
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Convert to blob and store
    const pdfBlob = pdf.output("blob");

    // Store for future use
    const storedInIndexedDB = await storePDFInIndexedDB(invoiceData, pdfBlob);
    if (!storedInIndexedDB) {
      const pdfDataUrl = URL.createObjectURL(pdfBlob);
      storePDFInLocalStorage(invoiceData, pdfDataUrl);
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Method 3: Using pdf-lib for programmatic PDF creation
export const generatePDFWithPDFLib = async (
  invoiceData,
  filename = "invoice.pdf"
) => {
  try {
    const { invoiceNumber, invoiceDate, customerName, items, total } =
      invoiceData;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

    const { width, height } = page.getSize();
    const fontSize = 12;
    const headerFontSize = 16;

    // Add content to PDF
    page.drawText("KASHI PIZZA HOME", {
      x: 50,
      y: height - 50,
      size: headerFontSize,
      color: rgb(0.8, 0.6, 0),
    });

    // Add items and details
    let yPosition = height - 100;
    page.drawText(`Invoice: ${invoiceNumber}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;
    page.drawText(`Date: ${invoiceDate}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 20;
    page.drawText(`Customer: ${customerName}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
    });
    yPosition -= 40;

    items.forEach((item) => {
      const itemText = `${item.name} x${item.quantity} @ PKR ${item.price}`;
      page.drawText(itemText, { x: 50, y: yPosition, size: fontSize });
      yPosition -= 20;
    });

    page.drawText(`Total: PKR ${total}`, {
      x: 50,
      y: yPosition - 20,
      size: fontSize,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, filename);

    return pdfBytes;
  } catch (error) {
    console.error("Error generating PDF with pdf-lib:", error);
    throw error;
  }
};

export const downloadInvoiceText = (invoiceData) => {
  const { invoiceNumber, invoiceDate, customerName, items, total } =
    invoiceData;

  // Group items with the same name
  const groupedItems = {};
  items.forEach((item) => {
    if (!groupedItems[item.name]) {
      groupedItems[item.name] = { ...item };
    } else {
      groupedItems[item.name].quantity += item.quantity;
    }
  });

  const formatPrice = (price) => {
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  let invoiceText = "";
  invoiceText += `KASHI PIZZA HOME\n`;
  invoiceText += `================================\n`;
  invoiceText += `Invoice Number: ${invoiceNumber}\n`;
  invoiceText += `Date: ${invoiceDate}\n`;
  invoiceText += `Customer Name: ${customerName}\n`;
  invoiceText += `================================\n`;
  invoiceText += `Item Name                Qty   Price   Subtotal\n`;
  invoiceText += `--------------------------------\n`;

  Object.values(groupedItems).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    invoiceText += `${item.name.padEnd(24)} ${String(item.quantity).padEnd(
      5
    )} PKR ${formatPrice(item.price).padEnd(7)} PKR ${formatPrice(
      itemTotal
    )}\n`;
  });

  invoiceText += `================================\n`;
  invoiceText += `Grand Total: PKR ${formatPrice(total)}\n`;
  invoiceText += `================================\n`;
  invoiceText += `Address: Awan Shareef Road, Dawood Plazza\n`;
  invoiceText += `near Akhtar Public School, JalalPur Sobtain\n`;
  invoiceText += `Gujrat, Pakistan\n`;
  invoiceText += `Phone: +92304-0600910, +92313-6978075\n\n`;
  invoiceText += `Thank you for your Order!\n`;

  // Download as text file
  const blob = new Blob([invoiceText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Invoice_${invoiceNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveInvoiceLog = (invoiceData) => {
  try {
    const existingLog = localStorage.getItem("invoiceLog") || "";
    const newInvoiceText = generateInvoiceText(invoiceData);
    const updatedLog = existingLog + newInvoiceText + "\n\n";

    localStorage.setItem("invoiceLog", updatedLog);
    return updatedLog;
  } catch (error) {
    console.error("Error saving invoice log:", error);
    throw error;
  }
};

const generateInvoiceText = (invoiceData) => {
  const { invoiceNumber, invoiceDate, customerName, items, total } =
    invoiceData;

  const formatPrice = (price) => {
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  let text = `Invoice: ${invoiceNumber} | Date: ${invoiceDate} | Customer: ${customerName}\n`;
  items.forEach((item) => {
    text += `- ${item.name} x${item.quantity} @ PKR ${formatPrice(
      item.price
    )} = PKR ${formatPrice(item.price * item.quantity)}\n`;
  });
  text += `Total: PKR ${formatPrice(total)}`;

  return text;
};

// PDF management utilities

// List all stored PDFs
export const listStoredPDFs = async () => {
  try {
    const result = { indexedDB: [], localStorage: [] };

    // Get from IndexedDB
    try {
      const db = await initPDFDatabase();
      if (db) {
        const transaction = db.transaction([PDF_STORE_NAME], "readonly");
        const store = transaction.objectStore(PDF_STORE_NAME);
        const request = store.getAll();

        const indexedDBPDFs = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        result.indexedDB = indexedDBPDFs.map((pdf) => ({
          invoiceNumber: pdf.invoiceNumber,
          customerName: pdf.customerName,
          date: pdf.date,
          createdAt: pdf.createdAt,
          size: pdf.size,
          source: "IndexedDB",
        }));
      }
    } catch (error) {
      console.warn("Error accessing IndexedDB:", error);
    }

    // Get from localStorage
    try {
      const localStoragePDFs = JSON.parse(
        localStorage.getItem("invoicePDFs") || "{}"
      );
      result.localStorage = Object.values(localStoragePDFs).map((pdf) => ({
        invoiceNumber: pdf.invoiceNumber,
        customerName: pdf.customerName,
        date: pdf.date,
        createdAt: pdf.createdAt,
        size: pdf.size,
        source: "localStorage",
      }));
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
    }

    return result;
  } catch (error) {
    console.error("Error listing stored PDFs:", error);
    return { indexedDB: [], localStorage: [] };
  }
};

// Delete a specific PDF
export const deletePDF = async (invoiceNumber) => {
  try {
    let deleted = false;

    // Delete from IndexedDB
    try {
      const db = await initPDFDatabase();
      if (db) {
        const transaction = db.transaction([PDF_STORE_NAME], "readwrite");
        const store = transaction.objectStore(PDF_STORE_NAME);
        await store.delete(invoiceNumber);
        deleted = true;
      }
    } catch (error) {
      console.warn("Error deleting from IndexedDB:", error);
    }

    // Delete from localStorage
    try {
      const localStoragePDFs = JSON.parse(
        localStorage.getItem("invoicePDFs") || "{}"
      );
      if (localStoragePDFs[invoiceNumber]) {
        delete localStoragePDFs[invoiceNumber];
        localStorage.setItem("invoicePDFs", JSON.stringify(localStoragePDFs));
        deleted = true;
      }
    } catch (error) {
      console.warn("Error deleting from localStorage:", error);
    }

    return deleted;
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return false;
  }
};

// Clean up old PDFs (keep only recent ones)
export const cleanupOldPDFs = async (keepCount = 20) => {
  try {
    let cleanedCount = 0;

    // Cleanup IndexedDB
    try {
      const db = await initPDFDatabase();
      if (db) {
        const transaction = db.transaction([PDF_STORE_NAME], "readwrite");
        const store = transaction.objectStore(PDF_STORE_NAME);
        const request = store.getAll();

        const allPDFs = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (allPDFs.length > keepCount) {
          // Sort by creation date, keep newest
          allPDFs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const toDelete = allPDFs.slice(keepCount);

          for (const pdf of toDelete) {
            await store.delete(pdf.invoiceNumber);
            cleanedCount++;
          }
        }
      }
    } catch (error) {
      console.warn("Error cleaning IndexedDB:", error);
    }

    // Cleanup localStorage (already implemented in storePDFInLocalStorage)
    try {
      const localStoragePDFs = JSON.parse(
        localStorage.getItem("invoicePDFs") || "{}"
      );
      const sortedPDFs = Object.values(localStoragePDFs).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      if (sortedPDFs.length > keepCount) {
        const keepPDFs = sortedPDFs.slice(0, keepCount);
        const newStorage = {};
        keepPDFs.forEach((pdf) => {
          newStorage[pdf.invoiceNumber] = pdf;
        });
        localStorage.setItem("invoicePDFs", JSON.stringify(newStorage));
        cleanedCount += sortedPDFs.length - keepCount;
      }
    } catch (error) {
      console.warn("Error cleaning localStorage:", error);
    }

    return cleanedCount;
  } catch (error) {
    console.error("Error cleaning up old PDFs:", error);
    return 0;
  }
};

// Get storage statistics
export const getStorageStats = async () => {
  try {
    const stats = {
      indexedDB: { count: 0, totalSize: 0 },
      localStorage: { count: 0, totalSize: 0 },
    };

    // IndexedDB stats
    try {
      const db = await initPDFDatabase();
      if (db) {
        const transaction = db.transaction([PDF_STORE_NAME], "readonly");
        const store = transaction.objectStore(PDF_STORE_NAME);
        const request = store.getAll();

        const indexedDBPDFs = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        stats.indexedDB.count = indexedDBPDFs.length;
        stats.indexedDB.totalSize = indexedDBPDFs.reduce(
          (total, pdf) => total + (pdf.size || 0),
          0
        );
      }
    } catch (error) {
      console.warn("Error getting IndexedDB stats:", error);
    }

    // localStorage stats
    try {
      const localStoragePDFs = JSON.parse(
        localStorage.getItem("invoicePDFs") || "{}"
      );
      const localPDFs = Object.values(localStoragePDFs);
      stats.localStorage.count = localPDFs.length;
      stats.localStorage.totalSize = localPDFs.reduce(
        (total, pdf) => total + (pdf.size || 0),
        0
      );
    } catch (error) {
      console.warn("Error getting localStorage stats:", error);
    }

    return stats;
  } catch (error) {
    console.error("Error getting storage stats:", error);
    return {
      indexedDB: { count: 0, totalSize: 0 },
      localStorage: { count: 0, totalSize: 0 },
    };
  }
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Initialize cleanup on app start (optional)
export const initializePDFStorage = async () => {
  try {
    // Initialize IndexedDB
    await initPDFDatabase();

    // Cleanup old files (keep last 20)
    await cleanupOldPDFs(20);

    // Get storage stats
    const stats = await getStorageStats();

    return true;
  } catch (error) {
    console.error("Error initializing PDF storage:", error);
    return false;
  }
};

// MongoDB integration (server-side simulation)

// For when backend is involved - store PDF metadata in MongoDB
export const uploadPDFToMongoDB = async (invoiceData, pdfBlob) => {
  try {
    // This would typically be called from a serverless function
    // For now, we'll store a reference and the actual PDF in browser storage
    const mongoRecord = {
      invoiceNumber: invoiceData.invoiceNumber,
      customerName: invoiceData.customerName,
      date: invoiceData.invoiceDate,
      createdAt: new Date().toISOString(),
      pdfSize: pdfBlob.size,
      stored: "browser", // Indicates it's stored in browser storage
    };

    // Store metadata in localStorage for MongoDB simulation
    const mongoLog = JSON.parse(localStorage.getItem("mongoInvoices") || "[]");

    // Remove existing record for same invoice
    const filteredLog = mongoLog.filter(
      (record) => record.invoiceNumber !== invoiceData.invoiceNumber
    );

    filteredLog.push(mongoRecord);
    localStorage.setItem("mongoInvoices", JSON.stringify(filteredLog));

    return true;
  } catch (error) {
    console.error("Error uploading to MongoDB:", error);
    return false;
  }
};

// Retrieve PDF metadata from MongoDB simulation
export const getPDFFromMongoDB = async (invoiceNumber) => {
  try {
    const mongoLog = JSON.parse(localStorage.getItem("mongoInvoices") || "[]");
    const record = mongoLog.find(
      (record) => record.invoiceNumber === invoiceNumber
    );
    return record || null;
  } catch (error) {
    console.error("Error retrieving from MongoDB:", error);
    return null;
  }
};
