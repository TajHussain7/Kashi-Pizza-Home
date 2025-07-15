import React, { useState, useEffect } from "react";

export default function ItemManagement({
  items,
  setItems,
  categories,
  setCategories,
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editingSize, setEditingSize] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // For items with size variants (pizzas)
  const [hasSizes, setHasSizes] = useState(false);
  const [sizePrices, setSizePrices] = useState({
    Small: "",
    Medium: "",
    Large: "",
    Family: "",
  });
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const formatPrice = (price) => {
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  const getFilteredItems = () => {
    let filtered = items;

    if (filterCategory !== "all") {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleAddCategory = () => {
    if (
      newCategoryName &&
      newCategoryName.trim() !== "" &&
      !categories.includes(newCategoryName.trim())
    ) {
      const updatedCategories = [...categories, newCategoryName.trim()];
      setCategories(updatedCategories);
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      setNewCategoryName("");
      alert("Category added successfully!");
    } else if (newCategoryName && categories.includes(newCategoryName.trim())) {
      alert("Category already exists.");
    } else {
      alert("Please enter a valid category name.");
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (
      confirm(
        `Delete category '${categoryToDelete}'? Items in this category will need to be reassigned.`
      )
    ) {
      const updatedCategories = categories.filter(
        (cat) => cat !== categoryToDelete
      );
      setCategories(updatedCategories);
      localStorage.setItem("categories", JSON.stringify(updatedCategories));

      // Update items that were in the deleted category
      const updatedItems = items.map((item) =>
        item.category === categoryToDelete
          ? { ...item, category: "Uncategorized" }
          : item
      );
      setItems(updatedItems);
      localStorage.setItem("items", JSON.stringify(updatedItems));
    }
  };

  const resetForm = () => {
    setItemName("");
    setItemPrice("");
    setHasSizes(false);
    setSizePrices({
      Small: "",
      Medium: "",
      Large: "",
      Family: "",
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleAddItem = () => {
    if (!itemName.trim() || (!itemPrice && !hasSizes)) {
      alert("Please enter item name and price(s).");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      category: selectedCategory,
    };

    if (hasSizes) {
      // Validate that at least one size has a price
      const validSizes = Object.entries(sizePrices).filter(
        ([size, price]) => price && !isNaN(price)
      );
      if (validSizes.length === 0) {
        alert("Please enter at least one size price.");
        return;
      }

      newItem.sizePrices = {};
      validSizes.forEach(([size, price]) => {
        newItem.sizePrices[size] = parseFloat(price);
      });
      newItem.price = validSizes[0][1]; // Set default price to first valid size
    } else {
      if (isNaN(itemPrice) || itemPrice <= 0) {
        alert("Please enter a valid price.");
        return;
      }
      newItem.price = parseFloat(itemPrice);
    }

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    resetForm();
    alert("Item added successfully!");
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setSelectedCategory(item.category);

    if (item.sizePrices) {
      setHasSizes(true);
      setSizePrices({
        Small: item.sizePrices.Small || "",
        Medium: item.sizePrices.Medium || "",
        Large: item.sizePrices.Large || "",
        Family: item.sizePrices.Family || "",
      });
    } else {
      setHasSizes(false);
      setItemPrice(item.price.toString());
    }
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (!itemName.trim() || (!itemPrice && !hasSizes)) {
      alert("Please enter item name and price(s).");
      return;
    }

    const updatedItem = {
      ...editingItem,
      name: itemName.trim(),
      category: selectedCategory,
    };

    if (hasSizes) {
      const validSizes = Object.entries(sizePrices).filter(
        ([size, price]) => price && !isNaN(price)
      );
      if (validSizes.length === 0) {
        alert("Please enter at least one size price.");
        return;
      }

      updatedItem.sizePrices = {};
      validSizes.forEach(([size, price]) => {
        updatedItem.sizePrices[size] = parseFloat(price);
      });
      updatedItem.price = validSizes[0][1];
    } else {
      if (isNaN(itemPrice) || itemPrice <= 0) {
        alert("Please enter a valid price.");
        return;
      }
      updatedItem.price = parseFloat(itemPrice);
      delete updatedItem.sizePrices;
    }

    const updatedItems = items.map((item) =>
      item.id === editingItem.id ? updatedItem : item
    );
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    resetForm();
    alert("Item updated successfully!");
  };

  const handleDeleteItem = (itemToDelete) => {
    if (confirm(`Delete item '${itemToDelete.name}'?`)) {
      const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
      setItems(updatedItems);
      localStorage.setItem("items", JSON.stringify(updatedItems));
      alert("Item deleted successfully!");
    }
  };

  const handleEditPrice = (item, newPrice, size = null) => {
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    const updatedItems = items.map((currentItem) => {
      if (currentItem.id === item.id) {
        if (size && currentItem.sizePrices) {
          return {
            ...currentItem,
            sizePrices: {
              ...currentItem.sizePrices,
              [size]: parseFloat(newPrice),
            },
          };
        } else {
          return {
            ...currentItem,
            price: parseFloat(newPrice),
          };
        }
      }
      return currentItem;
    });

    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    setEditingItem(null);
    setEditingSize(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-1/4 bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>

        {/* Category List */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setFilterCategory("all")}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              filterCategory === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="font-medium">All Items</span>
            <span className="text-sm opacity-75 ml-2">({items.length})</span>
          </button>

          {categories.map((category) => {
            const categoryItems = items.filter(
              (item) => item.category === category
            );
            return (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  filterCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="font-medium">{category}</span>
                <span className="text-sm opacity-75 ml-2">
                  ({categoryItems.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4 space-y-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            + Add New Item
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {filterCategory === "all" ? "All Menu Items" : filterCategory}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({getFilteredItems().length} items)
              </span>
            </h2>

            {/* Search Box */}
            <div className="w-full max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Add/Edit Item Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Enter item name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasSizes}
                    onChange={(e) => setHasSizes(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Has multiple sizes (like pizzas)
                  </span>
                </label>
              </div>

              {hasSizes ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {Object.entries(sizePrices).map(([size, price]) => (
                    <div key={size}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {size} Price
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) =>
                          setSizePrices({
                            ...sizePrices,
                            [size]: e.target.value,
                          })
                        }
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Menu Items ({getFilteredItems().length})
            </h3>

            {getFilteredItems().length === 0 ? (
              <p className="text-gray-500">
                No items found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4">
                {getFilteredItems().map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Category: {item.category}
                        </p>

                        {item.sizePrices ? (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">
                              Sizes & Prices:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                              {Object.entries(item.sizePrices).map(
                                ([size, price]) => (
                                  <div key={size} className="text-sm">
                                    <span className="font-medium">{size}:</span>{" "}
                                    {editingItem?.id === item.id &&
                                    editingSize === size ? (
                                      <input
                                        type="number"
                                        defaultValue={price}
                                        onBlur={(e) =>
                                          handleEditPrice(
                                            item,
                                            e.target.value,
                                            size
                                          )
                                        }
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            handleEditPrice(
                                              item,
                                              e.target.value,
                                              size
                                            );
                                          }
                                        }}
                                        className="w-16 px-1 py-0 border border-gray-300 rounded text-xs"
                                        autoFocus
                                      />
                                    ) : (
                                      <span
                                        className="text-green-600 cursor-pointer hover:underline"
                                        onClick={() => {
                                          setEditingItem(item);
                                          setEditingSize(size);
                                        }}
                                      >
                                        PKR {formatPrice(price)}
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Price:{" "}
                            </span>
                            {editingItem?.id === item.id && !editingSize ? (
                              <input
                                type="number"
                                defaultValue={item.price}
                                onBlur={(e) =>
                                  handleEditPrice(item, e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleEditPrice(item, e.target.value);
                                  }
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus
                              />
                            ) : (
                              <span
                                className="text-lg font-semibold text-green-600 cursor-pointer hover:underline"
                                onClick={() => {
                                  setEditingItem(item);
                                  setEditingSize(null);
                                }}
                              >
                                PKR {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Management */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Category Management</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{category}</span>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Delete category"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add New Category
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
