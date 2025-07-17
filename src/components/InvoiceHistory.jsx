import React, { useState, useEffect } from "react";
import LocalStorageManager from "../utils/localStorageUtils";

export default function InvoiceHistory({ onClose }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadInvoiceHistory();
  }, [filters.page, filters.search, filters.dateFrom, filters.dateTo]);

  const loadInvoiceHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const historyResult = LocalStorageManager.getInvoiceHistory({
        page: filters.page,
        limit: filters.limit,
      });

      let filteredInvoices = historyResult.invoices.filter(
        (invoice) => invoice.status !== "deleted"
      );

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredInvoices = filteredInvoices.filter(
          (invoice) =>
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm) ||
            invoice.customerName?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.dateFrom || filters.dateTo) {
        filteredInvoices = filteredInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.savedAt || invoice.timestamp);
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
          const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

          return (
            (!fromDate || invoiceDate >= fromDate) &&
            (!toDate || invoiceDate <= toDate)
          );
        });
      }

      filteredInvoices.sort(
        (a, b) =>
          new Date(b.savedAt || b.timestamp) -
          new Date(a.savedAt || a.timestamp)
      );

      setInvoices(filteredInvoices);

      setPagination({
        page: filters.page,
        total: Math.ceil(filteredInvoices.length / filters.limit),
        totalItems: filteredInvoices.length,
        hasMore: historyResult.hasMore,
      });

      const totalRevenue = filteredInvoices.reduce(
        (sum, invoice) => sum + (invoice.totalAmount || invoice.total || 0),
        0
      );
      setSummary({
        totalRevenue,
        totalInvoices: filteredInvoices.length,
      });
    } catch (err) {
      console.error("Error loading invoice history:", err);
      setError("Failed to load invoice history");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleDateFilter = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadInvoiceHistory();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
      limit: 20,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const deleteInvoice = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const success = LocalStorageManager.deleteInvoice(invoiceId);
        if (success) {
          loadInvoiceHistory();
        } else {
          alert("Failed to delete invoice");
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Error deleting invoice");
      }
    }
  };

  const formatPrice = (price) => {
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">Loading invoice history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Invoice History - localStorage
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600">
                PKR {formatPrice(summary.totalRevenue || 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Invoices</h3>
              <p className="text-2xl font-bold text-blue-600">
                {summary.totalInvoices || 0}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Invoice number or customer name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2 items-end">
                <button
                  onClick={handleDateFilter}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Invoice Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Invoice #</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Items</th>
                  <th className="px-4 py-2 text-left">Total (PKR)</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice.id || invoice.invoiceNumber}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-2">{invoice.customerName}</td>
                      <td className="px-4 py-2">
                        {formatDate(invoice.savedAt || invoice.timestamp)}
                      </td>
                      <td className="px-4 py-2">
                        {invoice.itemCount || invoice.items?.length || 0}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {formatPrice(invoice.totalAmount || invoice.total || 0)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          localStorage
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {filters.page} of {pagination.total}
              </span>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= pagination.total}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
