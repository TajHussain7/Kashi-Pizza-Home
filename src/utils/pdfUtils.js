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

export const checkExistingPDF = async (invoiceNumber) => {
  try {
    const indexedDBResult = await retrievePDFFromIndexedDB(invoiceNumber);
    if (indexedDBResult) {
      return {
        exists: true,
        source: "IndexedDB",
        data: indexedDBResult,
      };
    }

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

    const tempFooter = document.createElement("div");
    tempFooter.id = "temp-pdf-footer-professional";
    tempFooter.style.cssText = `
      margin-top: 30px;
      padding: 15px 0;
      text-align: center;
      font-size: 11px;
      color: #666;
      border-top: 2px solid #ddd;
      page-break-inside: avoid;
      font-family: Arial, sans-serif;
    `;
    tempFooter.innerHTML = `
      <div style="font-weight: bold;">
        Developed by: Tajamal Hussain | Contact: +92 343 8002540
      </div>
    `;
    invoiceElement.appendChild(tempFooter);

    const opt = {
      margin: [0.3, 0.25, 0.3, 0.25],
      filename: filename,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
        compress: true,
        putOnlyUsedFonts: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
      },
    };

    const pdfResult = await html2pdf()
      .set(opt)
      .from(invoiceElement)
      .outputPdf("blob");

    const footerToRemove = document.getElementById(
      "temp-pdf-footer-professional"
    );
    if (footerToRemove) {
      footerToRemove.remove();
    }

    const storedInIndexedDB = await storePDFInIndexedDB(invoiceData, pdfResult);

    if (!storedInIndexedDB) {
      const pdfDataUrl = URL.createObjectURL(pdfResult);
      storePDFInLocalStorage(invoiceData, pdfDataUrl);
    }

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
    if (!forceRegenerate) {
      const existingPDF = await checkExistingPDF(invoiceData.invoiceNumber);
      if (existingPDF.exists) {
        return await downloadExistingPDF(invoiceData.invoiceNumber);
      }
    }

    const invoiceElement = document.getElementById("invoice-content");
    if (!invoiceElement) {
      throw new Error("Invoice content element not found");
    }

    const opt = {
      margin: [0.3, 0.25, 0.3, 0.25],
      filename: filename,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
        compress: true,
        putOnlyUsedFonts: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
      },
    };

    const footer = document.createElement("div");
    footer.style.cssText = `
      margin-top: 30px;
      padding: 15px 0;
      text-align: center;
      font-size: 11px;
      color: #666;
      border-top: 2px solid #ddd;
      page-break-inside: avoid;
      font-family: Arial, sans-serif;
    `;
    footer.innerHTML = `
      <div style="font-weight: bold;">
        Developed by: Tajamal Hussain | Contact: +92 343 8002540
      </div>
    `;
    footer.id = "temp-pdf-footer";

    invoiceElement.appendChild(footer);

    const pdfResult = await html2pdf()
      .set(opt)
      .from(invoiceElement)
      .outputPdf("blob");

    const tempFooter = document.getElementById("temp-pdf-footer");
    if (tempFooter) {
      tempFooter.remove();
    }

    const storedInIndexedDB = await storePDFInIndexedDB(invoiceData, pdfResult);
    if (!storedInIndexedDB) {
      const pdfDataUrl = URL.createObjectURL(pdfResult);
      storePDFInLocalStorage(invoiceData, pdfDataUrl);
    }

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

    const footer = document.createElement("div");
    footer.style.cssText = `
      margin-top: 30px;
      padding: 15px 0;
      text-align: center;
      font-size: 11px;
      color: #666;
      border-top: 2px solid #ddd;
      page-break-inside: avoid;
      font-family: Arial, sans-serif;
    `;
    footer.innerHTML = `
      <div style="font-weight: bold;">
        Developed by: Tajamal Hussain | Contact: +92 343 8002540
      </div>
    `;
    footer.id = "temp-pdf-footer-canvas";

    element.appendChild(footer);

    const canvas = await html2canvas(element, {
      scale: 2.2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const tempFooter = document.getElementById("temp-pdf-footer-canvas");
    if (tempFooter) {
      tempFooter.remove();
    }

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      putOnlyUsedFonts: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 8;
    const contentWidth = pdfWidth - 2 * margin;
    const contentHeight = pdfHeight - 2 * margin;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= contentHeight) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
      let yOffset = 0;
      let remainingHeight = imgHeight;
      let pageNumber = 1;

      while (remainingHeight > 0) {
        if (pageNumber > 1) {
          pdf.addPage();
        }

        const currentPageHeight = Math.min(contentHeight, remainingHeight);

        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d");

        pageCanvas.width = canvas.width;
        pageCanvas.height = (currentPageHeight * canvas.width) / imgWidth;

        pageCtx.drawImage(
          canvas,
          0,
          (yOffset * canvas.width) / imgWidth,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height
        );

        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(
          pageImgData,
          "JPEG",
          margin,
          margin,
          imgWidth,
          currentPageHeight
        );

        remainingHeight -= contentHeight;
        yOffset += contentHeight;
        pageNumber++;
      }
    }

    const pdfBlob = pdf.output("blob");

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

    const pdfDoc = await PDFDocument.create();

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let { width, height } = page.getSize();

    const fontSize = 11;
    const headerFontSize = 18;
    const subHeaderFontSize = 14;
    const footerFontSize = 9;

    const margin = 50;
    const contentWidth = width - 2 * margin;

    let yPosition = height - margin;

    page.drawText("KASHI PIZZA HOME", {
      x: margin,
      y: yPosition,
      size: headerFontSize,
      color: rgb(0.8, 0.6, 0),
    });

    yPosition -= 30;

    page.drawText("INVOICE", {
      x: margin,
      y: yPosition,
      size: subHeaderFontSize,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;

    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPosition -= 20;

    const invoiceInfo = [
      `Invoice Number: ${invoiceNumber}`,
      `Date: ${invoiceDate}`,
      `Customer: ${customerName || "N/A"}`,
    ];

    invoiceInfo.forEach((info) => {
      page.drawText(info, {
        x: margin,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;
    });

    yPosition -= 10;

    page.drawText("Items:", {
      x: margin,
      y: yPosition,
      size: subHeaderFontSize,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;

    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPosition -= 20;

    const groupedItems = {};
    items.forEach((item) => {
      if (!groupedItems[item.name]) {
        groupedItems[item.name] = { ...item };
      } else {
        groupedItems[item.name].quantity += item.quantity;
      }
    });

    const itemsArray = Object.values(groupedItems);
    let itemsOnCurrentPage = 0;
    const maxItemsPerPage = 20;

    itemsArray.forEach((item, index) => {
      if (yPosition < 150 || itemsOnCurrentPage >= maxItemsPerPage) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = height - margin;
        itemsOnCurrentPage = 0;

        page.drawText("KASHI PIZZA HOME - Invoice Continued", {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(0.8, 0.6, 0),
        });
        yPosition -= 40;
      }

      const itemText = `${item.name}`;
      const qtyText = `Qty: ${item.quantity}`;
      const priceText = `@ PKR ${item.price}`;
      const totalText = `PKR ${(item.price * item.quantity).toFixed(2)}`;

      page.drawText(itemText, {
        x: margin,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText(qtyText, {
        x: margin + 200,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText(priceText, {
        x: margin + 300,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText(totalText, {
        x: width - margin - 80,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      yPosition -= 18;
      itemsOnCurrentPage++;
    });

    yPosition -= 10;

    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 2,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;

    page.drawText(`GRAND TOTAL: PKR ${total.toFixed(2)}`, {
      x: width - margin - 150,
      y: yPosition,
      size: subHeaderFontSize,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    const addressLines = [
      "Address: Awan Shareef Road, Dawood Plazza",
      "near Akhtar Public School, JalalPur Sobtain",
      "Gujrat, Pakistan",
      "Phone: +92304-0600910, +92313-6978075",
    ];

    addressLines.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize - 1,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 15;
    });

    yPosition -= 10;
    page.drawText("Thank you for your order!", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    const footerY = 60;

    page.drawLine({
      start: { x: margin, y: footerY + 25 },
      end: { x: width - margin, y: footerY + 25 },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });

    page.drawText("Developed by: Tajamal Hussain", {
      x: width / 2 - 85,
      y: footerY + 10,
      size: footerFontSize + 1,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText("Contact: +92 343 8002540", {
      x: width / 2 - 75,
      y: footerY - 5,
      size: footerFontSize,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const storedInIndexedDB = await storePDFInIndexedDB(invoiceData, blob);
    if (!storedInIndexedDB) {
      const pdfDataUrl = URL.createObjectURL(blob);
      storePDFInLocalStorage(invoiceData, pdfDataUrl);
    }

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
  invoiceText += `Thank you for your Order!\n\n`;
  invoiceText += `--------------------------------\n`;
  invoiceText += `Developed by: Tajamal Hussain\n`;
  invoiceText += `Contact: +92 343 8002540\n`;
  invoiceText += `--------------------------------\n`;

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
    await initPDFDatabase();

    await cleanupOldPDFs(20);

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
    const mongoRecord = {
      invoiceNumber: invoiceData.invoiceNumber,
      customerName: invoiceData.customerName,
      date: invoiceData.invoiceDate,
      createdAt: new Date().toISOString(),
      pdfSize: pdfBlob.size,
      stored: "browser",
    };

    const mongoLog = JSON.parse(localStorage.getItem("mongoInvoices") || "[]");

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
