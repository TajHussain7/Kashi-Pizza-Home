import React, { useState, useEffect } from "react";

export default function InvoiceGenerator({
  items,
  categories,
  currentOrder,
  setCurrentOrder,
  onGenerateInvoice,
}) {
  const [customerName, setCustomerName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [itemPricePreview, setItemPricePreview] = useState("");

  const formatPrice = (price) => {
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  const getFilteredItems = () => {
    return selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);
  };

  const handleItemSelection = (value) => {
    setSelectedItem(value);

    if (!value) {
      setItemPricePreview("");
      return;
    }

    let itemId, size;
    if (value.includes("_")) {
      [itemId, size] = value.split("_");
      itemId = parseInt(itemId);
    } else {
      itemId = parseInt(value);
    }

    const item = items.find((i) => i.id === itemId);
    if (item) {
      const price =
        size && item.sizePrices ? item.sizePrices[size] : item.price;
      setItemPricePreview(`Price: PKR ${formatPrice(price)}`);
    } else {
      setItemPricePreview("");
    }
  };

  const handleAddToOrder = () => {
    if (!selectedItem) {
      alert("Please select an item.");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    let itemId, size;
    if (selectedItem.includes("_")) {
      [itemId, size] = selectedItem.split("_");
      itemId = parseInt(itemId);
    } else {
      itemId = parseInt(selectedItem);
      size = null;
    }

    const item = items.find((item) => item.id === itemId);
    if (item) {
      const effectivePrice =
        size && item.sizePrices ? item.sizePrices[size] : item.price;
      const orderItem = {
        id: item.id,
        name: size ? `${item.name} (${size})` : item.name,
        price: effectivePrice,
        quantity: parseInt(quantity),
      };

      const existingOrderItem = currentOrder.find(
        (orderItm) =>
          orderItm.id === item.id &&
          (!size || orderItm.name === `${item.name} (${size})`)
      );

      if (existingOrderItem) {
        existingOrderItem.quantity += parseInt(quantity);
        setCurrentOrder([...currentOrder]);
      } else {
        setCurrentOrder([...currentOrder, orderItem]);
      }

      // Reset form
      setQuantity(1);
      setSelectedItem("");
      setItemPricePreview("");
    }
  };

  const handleRemoveFromOrder = (itemId, itemName) => {
    const updatedOrder = currentOrder.filter((item) => {
      if (item.id !== itemId) return true;
      if (itemName.includes("(") && itemName.includes(")")) {
        // For sized items, match the exact name
        return item.name !== itemName;
      } else {
        // For regular items, just check if it's not the same ID
        return false;
      }
    });
    setCurrentOrder(updatedOrder);
  };

  const calculateTotal = () => {
    return currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleGenerateInvoice = () => {
    if (currentOrder.length === 0) {
      alert("Cannot generate an invoice with no items.");
      return;
    }
    onGenerateInvoice(customerName);
  };

  const renderItemOptions = () => {
    const filteredItems = getFilteredItems();
    const options = [
      <option key="empty" value="">
        Select Item
      </option>,
    ];

    filteredItems.forEach((item) => {
      if (
        (item.category === "Pizzas" || item.category === "Special Pizza") &&
        item.sizePrices
      ) {
        const pizzaSizes = ["Small", "Medium", "Large", "Family"];
        pizzaSizes.forEach((size) => {
          if (item.sizePrices[size]) {
            options.push(
              <option key={`${item.id}_${size}`} value={`${item.id}_${size}`}>
                {`${item.name} (${size}) - PKR ${formatPrice(
                  item.sizePrices[size]
                )}`}
              </option>
            );
          }
        });
      } else {
        options.push(
          <option key={item.id} value={item.id}>
            {`${item.name} - PKR ${formatPrice(item.price)}`}
          </option>
        );
      }
    });

    return options;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-yellow-700 mb-4">
        Invoice Generator
      </h2>

      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        {/* Customer Name */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Customer Name (Optional):
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="p-2 border rounded w-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        {/* Item Selection */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded flex-1 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedItem}
            onChange={(e) => handleItemSelection(e.target.value)}
            className="p-2 border rounded flex-1 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            {renderItemOptions()}
          </select>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            placeholder="Quantity"
            className="p-2 border rounded w-full sm:w-24 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            min="1"
          />

          <button
            onClick={handleAddToOrder}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Add to Bill
          </button>
        </div>

        {/* Price Preview */}
        {itemPricePreview && (
          <div className="text-lg text-red-600 font-semibold mb-4">
            {itemPricePreview}
          </div>
        )}

        {/* Current Bill */}
        <h3 className="text-xl font-semibold mb-2 text-red-600">
          Current Bill
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-100 to-red-100">
                <th className="p-2 border text-yellow-700">Item Name</th>
                <th className="p-2 border text-yellow-700">Quantity</th>
                <th className="p-2 border text-yellow-700">Price (PKR)</th>
                <th className="p-2 border text-yellow-700">Subtotal (PKR)</th>
                <th className="p-2 border text-yellow-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrder.map((item, index) => {
                const subtotal = item.price * item.quantity;
                return (
                  <tr key={index}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border text-center">{item.quantity}</td>
                    <td className="p-2 border text-right">
                      PKR {formatPrice(item.price)}
                    </td>
                    <td className="p-2 border text-right">
                      PKR {formatPrice(subtotal)}
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() =>
                          handleRemoveFromOrder(item.id, item.name)
                        }
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-yellow-100">
                <td colSpan="4" className="p-2 border text-right text-red-600">
                  Total:
                </td>
                <td className="p-2 border text-red-600 text-center">
                  PKR {formatPrice(calculateTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          onClick={handleGenerateInvoice}
          disabled={currentOrder.length === 0}
          className={`w-full sm:w-auto px-6 py-3 rounded font-semibold transition-colors ${
            currentOrder.length === 0
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          Generate & Print Invoice
        </button>
      </div>
    </div>
  );
}
