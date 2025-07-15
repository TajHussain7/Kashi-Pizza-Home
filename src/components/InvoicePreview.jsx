import React, { useState } from "react";
import {
  generatePDFWithHtml2PDF,
  checkExistingPDF,
  downloadExistingPDF,
  formatFileSize,
} from "../utils/pdfUtils";

export default function InvoicePreview({ invoiceData, onPrint, onBack }) {
  const [pdfStatus, setPdfStatus] = useState({ loading: false, exists: false });
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

  // Check if PDF exists when component mounts
  React.useEffect(() => {
    const checkPDFStatus = async () => {
      const existingPDF = await checkExistingPDF(invoiceNumber);
      setPdfStatus((prev) => ({ ...prev, exists: existingPDF.exists }));
    };
    checkPDFStatus();
  }, [invoiceNumber]);

  const handleGeneratePDF = async (forceRegenerate = false) => {
    setPdfStatus({ loading: true, exists: false });

    try {
      const result = await generatePDFWithHtml2PDF(
        "invoice-content",
        invoiceData,
        forceRegenerate
      );

      if (result.success) {
        setPdfStatus({ loading: false, exists: true });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfStatus({ loading: false, exists: false });

      // Fallback to print
      alert("PDF generation failed. Opening print dialog instead.");
      window.print();
    }
  };

  const handleDownloadExisting = async () => {
    setPdfStatus((prev) => ({ ...prev, loading: true }));

    try {
      const success = await downloadExistingPDF(invoiceNumber);
      if (!success) {
        throw new Error("Failed to download existing PDF");
      }
    } catch (error) {
      console.error("Error downloading existing PDF:", error);
      // Try generating new PDF
      await handleGeneratePDF(true);
    }

    setPdfStatus((prev) => ({ ...prev, loading: false }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Print Controls */}
      <div className="max-w-4xl mx-auto mb-4 no-print">
        {/* PDF Status Indicator */}
        {pdfStatus.exists && (
          <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
            PDF already exists in browser storage for Invoice #{invoiceNumber}.
            You can download the existing file or generate a new one.
          </div>
        )}

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={onPrint}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Print Invoice
            </button>

            {pdfStatus.exists && !pdfStatus.loading && (
              <button
                onClick={handleDownloadExisting}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                title="Download existing PDF (saved in browser)"
              >
                ⬇ Download PDF
              </button>
            )}

            <button
              onClick={() => handleGeneratePDF(false)}
              disabled={pdfStatus.loading}
              className={`px-6 py-2 rounded transition-colors ${
                pdfStatus.loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : pdfStatus.exists
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-purple-500 hover:bg-purple-600"
              } text-white`}
              title={
                pdfStatus.exists
                  ? "PDF exists in browser storage. Click to download existing or force regenerate."
                  : "Generate new PDF"
              }
            >
              {pdfStatus.loading
                ? "⏳ Processing..."
                : pdfStatus.exists
                ? "🔄 Generate New PDF"
                : "📄 Generate PDF"}
            </button>

            {pdfStatus.exists && (
              <button
                onClick={() => handleGeneratePDF(true)}
                disabled={pdfStatus.loading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                title="Force regenerate PDF (overwrite existing)"
              >
                � Force Regenerate
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Invoice Content - A4 Sized */}
      <div className="a4-invoice-container mx-auto bg-white shadow-lg print:shadow-none">
        <div
          id="invoice-content"
          className="a4-size p-6 print:p-4"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            minHeight: "297mm",
            maxWidth: "210mm",
            margin: "0 auto",
            border: "1px solid #ddd",
            backgroundColor: "white",
          }}
        >
          {/* Header: Logo and Business Name */}
          <div className="flex items-center justify-between mb-4 print:mb-2">
            <img
              src="/Logo.png"
              alt="Shop Logo"
              className="h-16 w-16 print:h-12 print:w-12 object-contain shop-logo"
            />
            <div className="text-center flex-1">
              <h2 className="text-3xl print:text-2xl font-bold text-yellow-600 mb-1 print:mb-0">
                Kashi Pizza Home
              </h2>
            </div>
          </div>

          {/* Invoice Info Table */}
          <table className="w-full mb-4 print:mb-2 text-sm print:text-xs border-collapse">
            <tbody>
              <tr>
                <td className="font-bold w-1/4 p-2 print:p-1 border border-gray-800">
                  Invoice Number:
                </td>
                <td className="w-1/4 p-2 print:p-1 border border-gray-800">
                  {invoiceNumber}
                </td>
                <td className="font-bold w-1/4 p-2 print:p-1 border border-gray-800">
                  Invoice Date:
                </td>
                <td className="w-1/4 p-2 print:p-1 border border-gray-800">
                  {invoiceDate}
                </td>
              </tr>
              <tr>
                <td className="font-bold p-2 print:p-1 border border-gray-800">
                  Customer Name:
                </td>
                <td
                  colSpan="3"
                  className="text-red-600 font-bold p-2 print:p-1 border border-gray-800"
                >
                  {customerName}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Items Table */}
          <table className="w-full border-collapse mb-4 print:mb-2 text-sm print:text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 print:p-1 border border-gray-800 text-left">
                  Item Name
                </th>
                <th className="p-2 print:p-1 border border-gray-800 text-right">
                  Price
                </th>
                <th className="p-2 print:p-1 border border-gray-800 text-right">
                  Quantity
                </th>
                <th className="p-2 print:p-1 border border-gray-800 text-right">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedItems).map((item, index) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <tr key={index}>
                    <td className="p-2 print:p-1 border border-gray-800">
                      {item.name}
                    </td>
                    <td className="p-2 print:p-1 border border-gray-800 text-right">
                      PKR {formatPrice(item.price)}
                    </td>
                    <td className="p-2 print:p-1 border border-gray-800 text-right">
                      {item.quantity}
                    </td>
                    <td className="p-2 print:p-1 border border-gray-800 text-right">
                      PKR {formatPrice(itemTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan="3"
                  className="p-2 print:p-1 border border-gray-800 text-right font-bold"
                >
                  Total Price
                </td>
                <td className="p-2 print:p-1 border border-gray-800 text-right font-bold">
                  PKR {formatPrice(total)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Address and Footer */}
          <div className="mt-4 print:mt-2 text-sm print:text-xs text-gray-700 address-section">
            <div className="mb-2 print:mb-1 font-bold">Shop Address:</div>
            <div className="mb-1 print:mb-0 font-bold">
              Awan Shareef Road, Dawood Plazza, near Akhtar Public School,
              JalalPur Sobtain, Gujrat, Pakistan
            </div>
            <div className="mb-2 print:mb-1 font-bold">
              Phone: +92304-0600910, +92313-6978075
            </div>
            <div className="font-bold text-yellow-600 text-center print:text-black">
              Thank you for your Order!
            </div>
          </div>
        </div>{" "}
        {/* Close a4-size div */}
      </div>{" "}
      {/* Close a4-invoice-container div */}
      {/* A4 Print Styles */}
      <style jsx>{`
        .a4-size {
          width: 210mm;
          height: 297mm;
          margin: auto;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .a4-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            box-shadow: none !important;
            margin: 0;
            padding: 0;
          }

          .a4-size {
            width: 210mm;
            height: 297mm;
            margin: auto;
            padding: 15mm !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 12pt;
            line-height: 1.4;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }

          /* Optimize text sizes for print */
          h2 {
            font-size: 24pt !important;
            margin-bottom: 8pt !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 12pt !important;
          }

          td,
          th {
            padding: 6pt !important;
            font-size: 11pt !important;
            border: 1px solid #000 !important;
          }

          .shop-logo {
            height: 60pt !important;
            width: 60pt !important;
          }

          /* Address section */
          .address-section {
            font-size: 10pt !important;
            margin-top: 12pt !important;
          }
        }
      `}</style>
    </div>
  );
}
