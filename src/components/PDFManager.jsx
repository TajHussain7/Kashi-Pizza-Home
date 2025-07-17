import React, { useState, useEffect } from "react";
import {
  listStoredPDFs,
  deletePDF,
  downloadExistingPDF,
  getStorageStats,
  formatFileSize,
  cleanupOldPDFs,
} from "../utils/pdfUtils";

export default function PDFManager({ onClose }) {
  const [storedPDFs, setStoredPDFs] = useState({
    indexedDB: [],
    localStorage: [],
  });
  const [storageStats, setStorageStats] = useState({
    indexedDB: { count: 0, totalSize: 0 },
    localStorage: { count: 0, totalSize: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPDFData();
  }, []);

  const loadPDFData = async () => {
    setLoading(true);
    try {
      const [pdfs, stats] = await Promise.all([
        listStoredPDFs(),
        getStorageStats(),
      ]);
      setStoredPDFs(pdfs);
      setStorageStats(stats);
    } catch (error) {
      console.error("Error loading PDF data:", error);
    }
    setLoading(false);
  };

  const handleDownload = async (invoiceNumber) => {
    try {
      await downloadExistingPDF(invoiceNumber);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF");
    }
  };

  const handleDelete = async (invoiceNumber) => {
    if (
      confirm(
        `Are you sure you want to delete PDF for invoice ${invoiceNumber}?`
      )
    ) {
      try {
        await deletePDF(invoiceNumber);
        await loadPDFData(); // Refresh the list
      } catch (error) {
        console.error("Error deleting PDF:", error);
        alert("Failed to delete PDF");
      }
    }
  };

  const handleCleanup = async () => {
    if (confirm("This will delete ALL stored PDFs. Continue?")) {
      try {
        const deletedCount = await cleanupOldPDFs(0);
        alert(`Deleted ${deletedCount} PDFs`);
        await loadPDFData(); // Refresh the list
      } catch (error) {
        console.error("Error cleaning up PDFs:", error);
        alert("Failed to cleanup PDFs");
      }
    }
  };

  const allPDFs = [...storedPDFs.indexedDB, ...storedPDFs.localStorage].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">Loading PDF data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">PDF Storage Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Storage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">IndexedDB Storage</h3>
              <p className="text-sm text-blue-600">
                {storageStats.indexedDB.count} files (
                {formatFileSize(storageStats.indexedDB.totalSize)})
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">localStorage</h3>
              <p className="text-sm text-green-600">
                {storageStats.localStorage.count} files (
                {formatFileSize(storageStats.localStorage.totalSize)})
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={loadPDFData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleCleanup}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              🧹 Cleanup Old PDFs
            </button>
          </div>

          {/* PDF List */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Invoice #</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Storage</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPDFs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No stored PDFs found
                    </td>
                  </tr>
                ) : (
                  allPDFs.map((pdf) => (
                    <tr
                      key={`${pdf.source}-${pdf.invoiceNumber}`}
                      className="border-t"
                    >
                      <td className="px-4 py-2 font-mono">
                        {pdf.invoiceNumber}
                      </td>
                      <td className="px-4 py-2">{pdf.customerName}</td>
                      <td className="px-4 py-2">{pdf.date}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            pdf.source === "IndexedDB"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {pdf.source}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {formatFileSize(pdf.size || 0)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(pdf.invoiceNumber)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            ⬇ Download
                          </button>
                          <button
                            onClick={() => handleDelete(pdf.invoiceNumber)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
