// Pure localStorage utility for Fast Food Dashboard
// No database connections - everything stored locally

const STORAGE_KEYS = {
  ITEMS: "items",
  CATEGORIES: "categories",
  INVOICES: "savedInvoices",
  CURRENT_ORDER: "currentOrder",
  PDF_DATA: "pdfData",
};

// Real-time localStorage operations
export class LocalStorageManager {
  static getItems() {
    try {
      const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error("Error getting items from localStorage:", error);
      return [];
    }
  }

  static saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error("Error saving items to localStorage:", error);
      return false;
    }
  }

  static getCategories() {
    try {
      const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error("Error getting categories from localStorage:", error);
      return [];
    }
  }

  static saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error("Error saving categories to localStorage:", error);
      return false;
    }
  }

  static getCurrentOrder() {
    try {
      const order = localStorage.getItem(STORAGE_KEYS.CURRENT_ORDER);
      return order ? JSON.parse(order) : [];
    } catch (error) {
      console.error("Error getting current order from localStorage:", error);
      return [];
    }
  }

  static saveCurrentOrder(order) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORDER, JSON.stringify(order));
      return true;
    } catch (error) {
      console.error("Error saving current order to localStorage:", error);
      return false;
    }
  }

  static getInvoices() {
    try {
      const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return invoices ? JSON.parse(invoices) : [];
    } catch (error) {
      console.error("Error getting invoices from localStorage:", error);
      return [];
    }
  }

  static saveInvoice(invoiceData) {
    try {
      const existingInvoices = this.getInvoices();
      const newInvoice = {
        ...invoiceData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        source: "localStorage",
      };

      existingInvoices.unshift(newInvoice);
      localStorage.setItem(
        STORAGE_KEYS.INVOICES,
        JSON.stringify(existingInvoices)
      );
      return newInvoice;
    } catch (error) {
      console.error("Error saving invoice to localStorage:", error);
      return null;
    }
  }

  static deleteInvoice(invoiceId) {
    try {
      const invoices = this.getInvoices();
      const filteredInvoices = invoices.filter((inv) => inv.id !== invoiceId);
      localStorage.setItem(
        STORAGE_KEYS.INVOICES,
        JSON.stringify(filteredInvoices)
      );
      return true;
    } catch (error) {
      console.error("Error deleting invoice from localStorage:", error);
      return false;
    }
  }

  static getInvoiceHistory(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const allInvoices = this.getInvoices();

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedInvoices = allInvoices.slice(startIndex, endIndex);

      return {
        invoices: paginatedInvoices,
        total: allInvoices.length,
        page,
        totalPages: Math.ceil(allInvoices.length / limit),
        hasMore: endIndex < allInvoices.length,
      };
    } catch (error) {
      console.error("Error getting invoice history from localStorage:", error);
      return {
        invoices: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      };
    }
  }

  static clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  static initializeWithDefaults(defaultItems = [], defaultCategories = []) {
    try {
      const existingItems = this.getItems();
      const existingCategories = this.getCategories();

      if (existingItems.length === 0 && defaultItems.length > 0) {
        this.saveItems(defaultItems);
      }

      if (existingCategories.length === 0 && defaultCategories.length > 0) {
        this.saveCategories(defaultCategories);
      }

      return true;
    } catch (error) {
      console.error("Error initializing with defaults:", error);
      return false;
    }
  }

  static getStorageStats() {
    try {
      const stats = {};
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const data = localStorage.getItem(storageKey);
        stats[key] = {
          exists: !!data,
          size: data ? data.length : 0,
          count: data ? JSON.parse(data).length || 0 : 0,
        };
      });
      return stats;
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {};
    }
  }
}

export const saveInvoiceToMongoDB = (invoiceData) => {
  return LocalStorageManager.saveInvoice(invoiceData);
};

export const getInvoiceHistory = (options) => {
  return LocalStorageManager.getInvoiceHistory(options);
};

export default LocalStorageManager;
