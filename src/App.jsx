import React, { useState, useEffect } from "react";
import ItemManagement from "./components/ItemManagement";
import InvoiceGenerator from "./components/InvoiceGenerator";
import InvoicePreview from "./components/InvoicePreview";
import PDFManager from "./components/PDFManager";
import InvoiceHistory from "./components/InvoiceHistory";
import Footer from "./components/Footer";
import { initializePDFStorage } from "./utils/pdfUtils";
import LocalStorageManager from "./utils/localStorageUtils";

export default function App() {
  const [currentView, setCurrentView] = useState("itemManagement");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPDFManager, setShowPDFManager] = useState(false);
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Force window to 75% size on load and resize
  useEffect(() => {
    const forceWindowSize = () => {
      const targetWidth = Math.floor(window.screen.availWidth * 0.75);
      const targetHeight = Math.floor(window.screen.availHeight * 0.75);

      // Only resize if window size is significantly different from target
      if (
        Math.abs(window.outerWidth - targetWidth) > 50 ||
        Math.abs(window.outerHeight - targetHeight) > 50
      ) {
        window.resizeTo(targetWidth, targetHeight);

        // Center the window
        const left = (window.screen.availWidth - targetWidth) / 2;
        const top = (window.screen.availHeight - targetHeight) / 2;
        window.moveTo(left, top);
      }
    };

    // Apply on load
    forceWindowSize();

    // Apply on resize with debounce
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(forceWindowSize, 500);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Complete menu based on KPH menu images
  const defaultCategories = [
    "Burgers",
    "Wraps",
    "KPH Super Deals",
    "Regular Pizzas",
    "Special Pizzas",
    "Starters",
    "Fries & Sides",
    "Cold Drinks",
  ];

  const defaultItems = [
    // Burger Zone
    { id: 1, name: "Zinger Burger", price: 320, category: "Burgers" },
    { id: 2, name: "Zinger Cheese Burger", price: 380, category: "Burgers" },
    { id: 3, name: "Chicken Burger", price: 250, category: "Burgers" },
    { id: 4, name: "Chicken Tikka Burger", price: 250, category: "Burgers" },
    { id: 5, name: "Pizza Burger", price: 400, category: "Burgers" },
    { id: 6, name: "Tower Burger", price: 600, category: "Burgers" },
    { id: 7, name: "Signature Burger", price: 320, category: "Burgers" },
    { id: 8, name: "Grill Burger", price: 450, category: "Burgers" },
    { id: 9, name: "Mighty Zest", price: 450, category: "Burgers" },

    // Wraps
    { id: 10, name: "Chicken Shawarma (S)", price: 180, category: "Wraps" },
    { id: 11, name: "Chicken Shawarma (L)", price: 250, category: "Wraps" },
    { id: 12, name: "Zinger Shawarma", price: 320, category: "Wraps" },
    { id: 13, name: "Arabian Shawarma", price: 280, category: "Wraps" },
    { id: 14, name: "Kababish Shawarma", price: 300, category: "Wraps" },
    { id: 15, name: "Turkish Wraps", price: 350, category: "Wraps" },
    { id: 16, name: "Twister", price: 350, category: "Wraps" },
    { id: 17, name: "Chicken Paratha", price: 300, category: "Wraps" },
    { id: 18, name: "Paratha Doner Kabab", price: 400, category: "Wraps" },

    // Regular Pizzas
    {
      id: 19,
      name: "Chicken Tikka",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },
    {
      id: 20,
      name: "Chicken Fajita",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },
    {
      id: 21,
      name: "Hot & Spicy",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },
    {
      id: 22,
      name: "Chicken Achari",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },
    {
      id: 23,
      name: "Chicken Tandoori",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },
    {
      id: 24,
      name: "Chicken Supreme",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },
    {
      id: 25,
      name: "Chicken Lover Pizza",
      price: 550,
      category: "Regular Pizzas",
      sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
    },

    // Special Pizzas
    {
      id: 26,
      name: "Malai Boti Pizza",
      price: 600,
      category: "Special Pizzas",
      sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
    },
    {
      id: 27,
      name: "Kabab Crust Pizza",
      price: 600,
      category: "Special Pizzas",
      sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
    },
    {
      id: 28,
      name: "Special Kabab Pizza",
      price: 600,
      category: "Special Pizzas",
      sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
    },
    {
      id: 29,
      name: "Crown Crust Pizza",
      price: 600,
      category: "Special Pizzas",
      sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
    },
    {
      id: 30,
      name: "Lazania Pizza",
      price: 600,
      category: "Special Pizzas",
      sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
    },
    {
      id: 31,
      name: "Cheese Crust Pizza",
      price: 600,
      category: "Special Pizzas",
      sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
    },
    {
      id: 32,
      name: "One Meter Long Pizza (3 Different Flavour)",
      price: 2600,
      category: "Special Pizzas",
    },

    // Starters
    { id: 33, name: "Hot Wings (5 Piece)", price: 300, category: "Starters" },
    { id: 34, name: "Hot Wings (10 Piece)", price: 500, category: "Starters" },
    { id: 35, name: "Hot Shots (5 Piece)", price: 300, category: "Starters" },
    { id: 36, name: "Hot Shots (10 Piece)", price: 500, category: "Starters" },
    { id: 37, name: "Nuggets (5 Piece)", price: 300, category: "Starters" },
    { id: 38, name: "Nuggets (10 Piece)", price: 500, category: "Starters" },
    { id: 39, name: "Platter", price: 500, category: "Starters" },
    { id: 40, name: "Kabab Bites", price: 550, category: "Starters" },

    // Fries & Sides
    { id: 41, name: "Fries Masrow", price: 350, category: "Fries & Sides" },
    { id: 42, name: "Loaded Fries", price: 500, category: "Fries & Sides" },
    { id: 43, name: "Pasta", price: 500, category: "Fries & Sides" },

    // KPH Super Deals
    {
      id: 44,
      name: "KPH-1: 1 Large Pizza + 4 Zinger + 10 Piece Wings + 1.5 Ltr Drink",
      price: 3200,
      category: "KPH Super Deals",
    },
    {
      id: 45,
      name: "KPH-2: 1 Large Pizza + 2 Zinger + 5 Piece Wings + 1.5 Ltr Drink",
      price: 2400,
      category: "KPH Super Deals",
    },
    {
      id: 46,
      name: "KPH-3: 1 Medium Pizza + 10 Hotshots + 1.5 Ltr Drink",
      price: 1600,
      category: "KPH Super Deals",
    },
    {
      id: 47,
      name: "KPH-4: 4 Small Pizza + 1.5 Ltr Drink",
      price: 2200,
      category: "KPH Super Deals",
    },
    {
      id: 48,
      name: "KPH-5: 1 Zinger Burger + Half Fries + 1 Reg Drink",
      price: 450,
      category: "KPH Super Deals",
    },
    {
      id: 49,
      name: "KPH-6: 1 Chicken Burger + Half Fries + 1 Reg Drink",
      price: 400,
      category: "KPH Super Deals",
    },
    {
      id: 50,
      name: "KPH-7: 10 Hot Wings + 10 Nuggets + 1 Ltr Drink",
      price: 1100,
      category: "KPH Super Deals",
    },
    {
      id: 51,
      name: "KPH-8: 3 Zinger + 5 Hotshot + 1 Fries + 1 Drinks 1 Ltr",
      price: 1500,
      category: "KPH Super Deals",
    },
    {
      id: 52,
      name: "KPH-9: 5 Zinger Burger + 10 Hot Wings + 2 Fries + 2 Drinks 1.5 Ltr",
      price: 2700,
      category: "KPH Super Deals",
    },
    {
      id: 53,
      name: "Shawarma Deal: 5 Shawarma (L) + 1 Ltr Drink",
      price: 1300,
      category: "KPH Super Deals",
    },

    // Cold Drinks (Common drinks with estimated prices)
    { id: 54, name: "Pepsi 1.5 Ltr", price: 150, category: "Cold Drinks" },
    { id: 55, name: "Pepsi 1 Ltr", price: 120, category: "Cold Drinks" },
    { id: 56, name: "Pepsi Can", price: 80, category: "Cold Drinks" },
    { id: 57, name: "7UP 1.5 Ltr", price: 150, category: "Cold Drinks" },
    { id: 58, name: "7UP 1 Ltr", price: 120, category: "Cold Drinks" },
    { id: 59, name: "Water Bottle", price: 50, category: "Cold Drinks" },
  ];

  // Load data from localStorage on component mount with real-time sync
  useEffect(() => {
    // Initialize with defaults if localStorage is empty
    LocalStorageManager.initializeWithDefaults(defaultItems, defaultCategories);

    // Load current data
    const savedItems = LocalStorageManager.getItems();
    const savedCategories = LocalStorageManager.getCategories();
    const savedOrder = LocalStorageManager.getCurrentOrder();

    setItems(savedItems);
    setCategories(savedCategories);
    setCurrentOrder(savedOrder);

    // Initialize PDF storage system
    initializePDFStorage();
  }, []);

  // Real-time localStorage sync - save whenever data changes
  useEffect(() => {
    if (items.length > 0) {
      LocalStorageManager.saveItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (categories.length > 0) {
      LocalStorageManager.saveCategories(categories);
    }
  }, [categories]);

  useEffect(() => {
    LocalStorageManager.saveCurrentOrder(currentOrder);
  }, [currentOrder]);

  const handleGenerateInvoice = async (customerName) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toLocaleDateString();

    const newInvoiceData = {
      invoiceNumber,
      invoiceDate,
      customerName: customerName || "N/A",
      items: currentOrder,
      total: currentOrder.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    };

    setInvoiceData(newInvoiceData);
    setShowInvoice(true);

    // Save invoice using localStorage manager with real-time sync
    try {
      const invoiceRecord = {
        ...newInvoiceData,
        savedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalAmount: newInvoiceData.total,
        itemCount: newInvoiceData.items ? newInvoiceData.items.length : 0,
        status: "active",
        source: "localStorage-dashboard",
      };

      const savedInvoice = LocalStorageManager.saveInvoice(invoiceRecord);
      if (savedInvoice) {
        // Invoice saved successfully to localStorage
      }
    } catch (error) {
      console.error("Error saving invoice to localStorage:", error);
    }
  };

  const handlePrintInvoice = () => {
    // Traditional print function
    window.print();

    // Reset order after printing
    setCurrentOrder([]);
    setShowInvoice(false);
    setInvoiceData(null);
  };

  const handleGeneratePDF = async () => {
    try {
      await generatePDFWithHtml2PDF(
        "invoice-content",
        `invoice_${invoiceData.invoiceNumber}.pdf`
      );

      // Reset order after PDF generation
      setCurrentOrder([]);
      setShowInvoice(false);
      setInvoiceData(null);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try printing instead.");
    }
  };

  if (showInvoice && invoiceData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <InvoicePreview
          invoiceData={invoiceData}
          onPrint={handlePrintInvoice}
          onBack={() => setShowInvoice(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50"
      style={{ width: "100%", height: "100vh", margin: "0", padding: "0" }}
    >
      {/* Header */}
      <header className="bg-white shadow-lg p-2">
        <div className="w-full flex justify-between items-center px-5">
          <div>
            <img
              src="/Logo.png"
              alt="Kashi Pizza Home Logo"
              className="h-36 w-36 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-yellow-600">
            Kashi Pizza Home
          </h1>
          <div className="flex items-center space-x-2">
            <a
              href="https://wa.me/923040600910"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-lg font-medium"
            >
              Contact Us
            </a>
            <span className="text-yellow-600 text-lg font-bold">
              Timing: 11:00 AM - 12:00 PM
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex justify-center space-x-8 my-8">
        <button
          onClick={() => setCurrentView("itemManagement")}
          className={`px-8 py-4 rounded-xl text-xl font-semibold transition-colors shadow-lg ${
            currentView === "itemManagement"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Manage Items
        </button>
        <button
          onClick={() => setCurrentView("invoiceGenerator")}
          className={`px-8 py-4 rounded-xl text-xl font-semibold transition-colors shadow-lg ${
            currentView === "invoiceGenerator"
              ? "bg-green-600 text-white"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          Invoice Generator
        </button>
        <button
          onClick={() => setShowPDFManager(true)}
          className="bg-purple-500 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-purple-600 transition-colors shadow-lg"
        >
          📄 PDF Storage
        </button>
        <button
          onClick={() => setShowInvoiceHistory(true)}
          className="bg-indigo-500 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-indigo-600 transition-colors shadow-lg"
        >
          Invoice History
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full p-8 min-h-[65vh]">
        {currentView === "itemManagement" ? (
          <ItemManagement
            items={items}
            setItems={setItems}
            categories={categories}
            setCategories={setCategories}
          />
        ) : (
          <InvoiceGenerator
            items={items}
            categories={categories}
            currentOrder={currentOrder}
            setCurrentOrder={setCurrentOrder}
            onGenerateInvoice={handleGenerateInvoice}
          />
        )}
      </div>

      {/* PDF Manager Modal */}
      {showPDFManager && (
        <PDFManager onClose={() => setShowPDFManager(false)} />
      )}

      {/* Invoice History Modal */}
      {showInvoiceHistory && (
        <InvoiceHistory onClose={() => setShowInvoiceHistory(false)} />
      )}

      <Footer />
    </div>
  );
}
