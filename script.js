// Helper Functions
function formatPrice(price) {
  return Number.isInteger(price) ? price.toString() : price.toFixed(2);
}

// DOM Elements
// const categoryFilter = document.getElementById("categoryFilter"); // Removed: Element does not exist
const invoiceCategoryFilter = document.getElementById("invoiceCategoryFilter");
const itemNameInput = document.getElementById("itemName");
const itemPriceInput = document.getElementById("itemPrice");
const managedItemsListBody = document.getElementById("managedItemsListBody");
const invoiceItemSelect = document.getElementById("invoiceItemSelect");
const itemPricePreview = document.createElement("div");
itemPricePreview.className = "text-sm text-gray-600 mt-2";
invoiceItemSelect.parentElement.appendChild(itemPricePreview);
const invoiceItemQuantityInput = document.getElementById("invoiceItemQuantity");
const addItemToInvoiceBtn = document.getElementById("addItemToInvoiceBtn");
const currentInvoiceItemsListBody = document.getElementById(
  "currentInvoiceItemsListBody"
);
const currentInvoiceTotalElement = document.getElementById(
  "currentInvoiceTotal"
);
const customerNameInput = document.getElementById("customerName");
const generateFinalInvoiceBtn = document.getElementById(
  "generateFinalInvoiceBtn"
);
const navToItemManagement = document.getElementById("navToItemManagement");
const navToInvoiceGenerator = document.getElementById("navToInvoiceGenerator");
const invoiceElement = document.getElementById("invoice");
const invoiceNumberElement = document.getElementById("invoiceNumber");
const invoiceDateElement = document.getElementById("invoiceDate");
const invoiceCustomerNameElement = document.getElementById(
  "invoiceCustomerName"
);
const invoiceItemsTableBodyElement = document.getElementById(
  "invoiceItemsTableBody"
);
const invoiceGrandTotalElement = document.getElementById("invoiceGrandTotal");

// Data Storage
let items = JSON.parse(localStorage.getItem("items")) || [
  { id: Date.now(), name: "Zinger Burger", price: 320, category: "Burgers" },
  {
    id: Date.now() + 1,
    name: "Zinger Cheese Burger",
    price: 380,
    category: "Burgers",
  },
  {
    id: Date.now() + 2,
    name: "Chicken Burger",
    price: 250,
    category: "Burgers",
  },
  {
    id: Date.now() + 3,
    name: "Chicken Tikka Burger",
    price: 250,
    category: "Burgers",
  },
  { id: Date.now() + 4, name: "Pizza Burger", price: 400, category: "Burgers" },
  { id: Date.now() + 5, name: "Tower Burger", price: 600, category: "Burgers" },
  {
    id: Date.now() + 6,
    name: "Signature Burger",
    price: 320,
    category: "Burgers",
  },
  { id: Date.now() + 7, name: "Grill Burger", price: 450, category: "Burgers" },
  { id: Date.now() + 8, name: "Mighty Zest", price: 450, category: "Burgers" },
  {
    id: Date.now() + 9,
    name: "Chicken Shawarma (S)",
    price: 180,
    category: "Wraps",
  },
  {
    id: Date.now() + 10,
    name: "Chicken Shawarma (L)",
    price: 250,
    category: "Wraps",
  },
  {
    id: Date.now() + 11,
    name: "Zinger Shawarma",
    price: 320,
    category: "Wraps",
  },
  {
    id: Date.now() + 12,
    name: "Arabian Shawarma",
    price: 280,
    category: "Wraps",
  },
  {
    id: Date.now() + 13,
    name: "Kababish Shawarma",
    price: 300,
    category: "Wraps",
  },
  { id: Date.now() + 14, name: "Twister Wraps", price: 350, category: "Wraps" },
  {
    id: Date.now() + 15,
    name: "Chicken Paratha",
    price: 300,
    category: "Wraps",
  },
  {
    id: Date.now() + 16,
    name: "Paratha Donner Kabab",
    price: 400,
    category: "Wraps",
  },
  {
    id: Date.now() + 17,
    name: "Chicken Tikka",
    price: 550,
    category: "Pizzas",
    sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
  },
  {
    id: Date.now() + 18,
    name: "Hot & Spicy",
    price: 550,
    category: "Pizzas",
    sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
  },
  {
    id: Date.now() + 19,
    name: "Chicken Fajita",
    price: 550,
    category: "Pizzas",
    sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
  },
  {
    id: Date.now() + 20,
    name: "Chicken Tandoori",
    price: 550,
    category: "Pizzas",
    sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
  },
  {
    id: Date.now() + 21,
    name: "Chicken Supreme",
    price: 550,
    category: "Pizzas",
    sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
  },
  {
    id: Date.now() + 22,
    name: "Chicken Lover Pizza",
    price: 550,
    category: "Pizzas",
    sizePrices: { Small: 550, Medium: 1000, Large: 1400, Family: 2000 },
  },
  {
    id: Date.now() + 23,
    name: "Malai Boti Pizza",
    price: 600,
    category: "Pizzas",
    sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
  },
  {
    id: Date.now() + 24,
    name: "Kabab Crust Pizza",
    price: 600,
    category: "Pizzas",
    sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
  },
  {
    id: Date.now() + 25,
    name: "Special Kabab Pizza",
    price: 600,
    category: "Pizzas",
    sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
  },
  {
    id: Date.now() + 26,
    name: "Crown Crust Pizza",
    price: 600,
    category: "Pizzas",
    sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
  },
  {
    id: Date.now() + 27,
    name: "Lazania Pizza",
    price: 600,
    category: "Pizzas",
    sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
  },
  {
    id: Date.now() + 28,
    name: "Cheese Crust Pizza",
    price: 600,
    category: "Pizzas",
    sizePrices: { Small: 600, Medium: 1100, Large: 1600, Family: 2200 },
  },
  {
    id: Date.now() + 29,
    name: "One Meter Long Pizza",
    price: 2600,
    category: "Pizzas",
  },
  {
    id: Date.now() + 30,
    name: "Hot Wings (5-Piece)",
    price: 300,
    category: "Starters",
  },
  {
    id: Date.now() + 31,
    name: "Hot Wings (10-Piece)",
    price: 500,
    category: "Starters",
  },
  {
    id: Date.now() + 32,
    name: "Hot Shots (5-Piece)",
    price: 300,
    category: "Starters",
  },
  {
    id: Date.now() + 33,
    name: "Hot Shots (10-Piece)",
    price: 500,
    category: "Starters",
  },
  {
    id: Date.now() + 34,
    name: "Nuggets (5-Piece)",
    price: 300,
    category: "Starters",
  },
  {
    id: Date.now() + 35,
    name: "Nuggets (10-Piece)",
    price: 500,
    category: "Starters",
  },
  { id: Date.now() + 36, name: "Platter", price: 500, category: "Starters" },
  {
    id: Date.now() + 37,
    name: "Kabab Bites",
    price: 550,
    category: "Starters",
  },
  { id: Date.now() + 38, name: "Fries", price: 200, category: "Fries" },
  { id: Date.now() + 39, name: "Loaded Fries", price: 500, category: "Fries" },
  { id: Date.now() + 40, name: "Macroni", price: 350, category: "Fries" },
  { id: Date.now() + 41, name: "Pasta", price: 500, category: "Fries" },
  {
    id: Date.now() + 42,
    name: "KPH-1",
    price: 3200,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 43,
    name: "KPH-2",
    price: 2400,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 44,
    name: "KPH-3",
    price: 1600,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 45,
    name: "KPH-4",
    price: 2200,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 46,
    name: "KPH-5",
    price: 450,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 47,
    name: "KPH-6",
    price: 400,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 48,
    name: "KPH-7",
    price: 1100,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 49,
    name: "KPH-8",
    price: 1500,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 50,
    name: "KPH-9",
    price: 2700,
    category: "KPH Super Deals",
  },
  {
    id: Date.now() + 51,
    name: "5 Shawarma (L) + 1 Ltr Drink",
    price: 1300,
    category: "Shawarma Deal",
  },
];
let currentOrder = JSON.parse(localStorage.getItem("currentOrder")) || [];

// --- Dynamic Category Management ---
const defaultCategories = [
  "Burgers",
  "Wraps",
  "KPH Super Deals",
  "Pizzas",
  "Special Pizza",
  "Starters",
  "Fries",
  "Cold Drinks",
];
let categories =
  JSON.parse(localStorage.getItem("categories")) || defaultCategories;

const categoryNav = document.getElementById("categoryNav");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const itemCategorySelect = document.getElementById("itemCategorySelect");

function renderCategoryNav() {
  categoryNav.innerHTML = "";
  categories.forEach((cat, idx) => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className =
      "category-btn bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-semibold py-2 px-4 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-500";
    btn.onclick = () => showCategory(cat);
    categoryNav.appendChild(btn);
    // Add delete button for owner
    if (cat !== "Burgers" && cat !== "Pizzas") {
      // Example: Prevent deletion of core categories
      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.className = "ml-2 text-red-500 hover:text-red-700 text-xs";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (
          confirm(
            `Delete category '${cat}'? This will not delete items, but they will become uncategorized until reassigned.`
          )
        ) {
          categories.splice(idx, 1);
          localStorage.setItem("categories", JSON.stringify(categories));
          renderCategoryNav();
          renderCategorySelects();
          loadAndDisplayManagedItems(); // Refresh item list, might show uncategorized if any
        }
      };
      btn.appendChild(delBtn);
    }
  });
}

addCategoryBtn.onclick = () => {
  const newCat = prompt("Enter new category name:");
  if (newCat && newCat.trim() !== "" && !categories.includes(newCat.trim())) {
    categories.push(newCat.trim());
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategoryNav();
    renderCategorySelects();
  } else if (newCat && categories.includes(newCat.trim())) {
    alert("Category already exists.");
  }
};

function renderCategorySelects() {
  const currentItemCatValue = itemCategorySelect.value;
  const currentInvoiceCatValue = invoiceCategoryFilter.value;

  itemCategorySelect.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  if (categories.includes(currentItemCatValue)) {
    itemCategorySelect.value = currentItemCatValue;
  } else if (categories.length > 0) {
    itemCategorySelect.value = categories[0];
  }

  invoiceCategoryFilter.innerHTML =
    `<option value="all">All Categories</option>` +
    categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
  if (categories.includes(currentInvoiceCatValue)) {
    invoiceCategoryFilter.value = currentInvoiceCatValue;
  } else {
    invoiceCategoryFilter.value = "all";
  }
}

function showCategory(cat) {
  itemCategorySelect.value = cat; // Synchronize dropdown
  loadAndDisplayManagedItems(cat);
  showView("itemManagementView");
}

// --- Enhanced Item Management Module ---
function loadAndDisplayManagedItems(selectedCat = null) {
  managedItemsListBody.innerHTML = "";

  let categoryToDisplay = selectedCat;
  if (!categoryToDisplay && itemCategorySelect) {
    categoryToDisplay = itemCategorySelect.value;
  }
  if (!categoryToDisplay && categories.length > 0) {
    categoryToDisplay = categories[0];
  }

  if (!categoryToDisplay) {
    // console.warn("No category available to display items for item management.");
    return;
  }

  // Ensure itemCategorySelect dropdown reflects the category being displayed.
  if (itemCategorySelect && itemCategorySelect.value !== categoryToDisplay) {
    itemCategorySelect.value = categoryToDisplay;
  }

  const filteredItems = items.filter(
    (item) => item.category === categoryToDisplay
  );
  filteredItems.forEach((item) => {
    let displayName = item.name;
    let displayPrice = item.price;
    if (item.category === "Pizzas" && item.sizePrices) {
      for (const size in item.sizePrices) {
        const row = document.createElement("tr");
        displayName = `${item.name} (${size})`;
        displayPrice = item.sizePrices[size];
        row.innerHTML = `
          <td class="p-2 border text-sm font-medium">${item.category}</td>
          <td class="p-2 border">${displayName}</td>
          <td class="p-2 border">PKR ${formatPrice(displayPrice)}</td>
          <td class="p-2 border">
            <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2" onclick="editItem(${
              item.id
            }, '${size}')">Update</button>
            <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteItem(${
              item.id
            }, '${size}')">Delete</button>
          </td>
        `;
        managedItemsListBody.appendChild(row);
      }
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2 border text-sm font-medium">${item.category}</td>
        <td class="p-2 border">${displayName}</td>
        <td class="p-2 border">PKR ${formatPrice(displayPrice)}</td>
        <td class="p-2 border">
          <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2" onclick="editItem(${
            item.id
          })">Update</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteItem(${
            item.id
          })">Delete</button>
        </td>
      `;
      managedItemsListBody.appendChild(row);
    }
  });
}

// --- Enhanced Invoice Generator Tab ---
function populateInvoiceItemSelect() {
  const previouslySelectedItemValue = invoiceItemSelect.value;
  invoiceItemSelect.innerHTML = '<option value="">Select Item</option>';
  itemPricePreview.textContent = ""; // Clear price preview on category change

  const selectedCategory = invoiceCategoryFilter.value;
  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  filteredItems.forEach((item) => {
    if (item.category === "Pizzas" && item.sizePrices) {
      for (const size in item.sizePrices) {
        const option = document.createElement("option");
        option.value = `${item.id}_${size}`;
        option.textContent = `${item.name} (${size}) - PKR ${formatPrice(
          item.sizePrices[size]
        )}`;
        invoiceItemSelect.appendChild(option);
      }
    } else {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} - PKR ${formatPrice(item.price)}`;
      invoiceItemSelect.appendChild(option);
    }
  });
  // Try to reselect previous item if it's still in the list
  if (
    Array.from(invoiceItemSelect.options).some(
      (opt) => opt.value === previouslySelectedItemValue
    )
  ) {
    invoiceItemSelect.value = previouslySelectedItemValue;
    // Manually trigger price update if an item is reselected
    const event = new Event("change");
    invoiceItemSelect.dispatchEvent(event);
  }
}

function handleAddItemToInvoice() {
  const selectedValue = invoiceItemSelect.value;
  const quantity = parseInt(invoiceItemQuantityInput.value);
  if (!selectedValue) {
    alert("Please select an item.");
    return;
  }
  if (isNaN(quantity) || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }
  let itemId, size;
  if (selectedValue.includes("_")) {
    [itemId, size] = selectedValue.split("_");
    itemId = parseInt(itemId);
  } else {
    itemId = parseInt(selectedValue);
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
      quantity,
    };
    const existingOrderItem = currentOrder.find(
      (
        orderItm // Renamed to avoid conflict
      ) =>
        orderItm.id === item.id &&
        (!size || orderItm.name === `${item.name} (${size})`)
    );
    if (existingOrderItem) {
      existingOrderItem.quantity += quantity;
    } else {
      currentOrder.push(orderItem);
    }
    localStorage.setItem("currentOrder", JSON.stringify(currentOrder));
    renderCurrentInvoiceItems();
    invoiceItemQuantityInput.value = "1";
    invoiceItemSelect.value = "";
    itemPricePreview.textContent = ""; // Clear price preview
  }
}

function renderCurrentInvoiceItems() {
  currentInvoiceItemsListBody.innerHTML = "";
  let total = 0;
  currentOrder.forEach((item, index) => {
    // Added index for unique key in potential React versions
    const subtotal = item.price * item.quantity;
    total += subtotal;
    const row = document.createElement("tr");
    // Ensure item name is correctly captured for removal, especially with sizes
    const itemNameForRemoval = item.name.includes(" (")
      ? item.name.substring(item.name.lastIndexOf(" ("))
      : "";

    row.innerHTML = `
      <td class="p-2 border">${item.name}</td>
      <td class="p-2 border">${item.quantity}</td>
      <td class="p-2 border">PKR ${formatPrice(item.price)}</td>
      <td class="p-2 border">PKR ${formatPrice(subtotal)}</td>
      <td class="p-2 border">
        <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="removeItemFromInvoice(${
          item.id
        }, '${itemNameForRemoval.replace(/[()]/g, "")}')">Remove</button>
      </td>
    `;
    currentInvoiceItemsListBody.appendChild(row);
  });
  currentInvoiceTotalElement.textContent = `PKR ${formatPrice(total)}`;
}

window.removeItemFromInvoice = (id, sizeString = "") => {
  currentOrder = currentOrder.filter((item) => {
    const isMatchingId = item.id === id;
    if (!isMatchingId) return true; // Keep if ID doesn't match

    // If sizeString is provided, item name must include it (e.g., "(Small)")
    if (sizeString) {
      return !item.name.includes(`(${sizeString})`);
    }
    // If no sizeString, it's a non-sized item or we remove all sizes of this ID (depends on desired logic)
    // Current logic: if it's a sized item, sizeString should be passed. If not, it means non-sized.
    return item.name.includes(" ("); // This would keep sized items if sizeString is empty. Let's adjust.
  });

  // Refined filter logic for removal
  currentOrder = currentOrder.filter((item) => {
    const baseName = item.name.replace(
      /\s\((Small|Medium|Large|Family)\)$/,
      ""
    );
    const itemSize =
      item.name.match(/\((Small|Medium|Large|Family)\)$/)?.[1] || null;

    if (item.id !== id) return true; // Not the item to remove

    if (sizeString) {
      // Trying to remove a sized item
      return itemSize !== sizeString;
    } else {
      // Trying to remove a non-sized item
      return itemSize !== null; // Keep if it's a sized item, remove if it's non-sized
    }
  });

  localStorage.setItem("currentOrder", JSON.stringify(currentOrder));
  renderCurrentInvoiceItems();
};

function handleGenerateAndPrintInvoice() {
  if (currentOrder.length === 0) {
    alert("Cannot generate an invoice with no items.");
    return;
  }
  const customerName = customerNameInput.value.trim();
  invoiceNumberElement.textContent = `INV-${Date.now()}`;
  invoiceDateElement.textContent = new Date().toLocaleDateString();
  // Set customer name in one row, no line breaks
  invoiceCustomerNameElement.textContent = customerName || "N/A";
  invoiceItemsTableBodyElement.innerHTML = "";
  let grandTotal = 0;

  // --- Group items with the same name into one row ---
  const groupedItems = {};
  currentOrder.forEach((item) => {
    if (!groupedItems[item.name]) {
      groupedItems[item.name] = { ...item };
    } else {
      groupedItems[item.name].quantity += item.quantity;
      groupedItems[item.name].price = item.price; // keep latest price
    }
  });
  Object.values(groupedItems).forEach((item) => {
    const row = invoiceItemsTableBodyElement.insertRow();
    const itemTotal = item.price * item.quantity;
    grandTotal += itemTotal;
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.quantity;
    row.insertCell().textContent = `PKR ${formatPrice(item.price)}`;
    row.insertCell().textContent = `PKR ${formatPrice(itemTotal)}`;
  });
  invoiceGrandTotalElement.textContent = `PKR ${formatPrice(grandTotal)}`;

  // --- Ensure all invoice info is on one page, add tagline ---
  let tagline = document.getElementById("invoiceTagline");
  if (!tagline) {
    tagline = document.createElement("p");
    tagline.id = "invoiceTagline";
    tagline.className = "text-center text-yellow-700 font-semibold mb-2";
    tagline.textContent = "Adding Taste to your Life";
    invoiceElement.insertBefore(tagline, invoiceElement.firstChild.nextSibling);
  }

  // Show the invoice section and hide others for printing
  invoiceElement.classList.remove("hidden");
  document.getElementById("categoryManagementSection").classList.add("hidden");
  document.getElementById("invoiceGeneratorView").classList.add("hidden");

  // Print
  window.print();

  // After print, hide invoice and show main UI again
  invoiceElement.classList.add("hidden");
  document
    .getElementById("categoryManagementSection")
    .classList.remove("hidden");
  document.getElementById("invoiceGeneratorView").classList.remove("hidden");

  // Reset order
  currentOrder = [];
  localStorage.removeItem("currentOrder");
  renderCurrentInvoiceItems();
  customerNameInput.value = "";
}

// --- Item Management Functions ---
function addItem(name, price) {
  const selectedCategory = itemCategorySelect.value;
  if (!selectedCategory) {
    alert("Please select a valid category before adding an item.");
    return false;
  }
  if (
    items.some(
      (item) =>
        item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        item.category === selectedCategory &&
        !item.sizePrices // Avoid conflict for simple items
    )
  ) {
    alert(
      "Item with this name already exists in this category (as a non-sized item)!"
    );
    return false;
  }
  const newItem = {
    id: Date.now(),
    name: name,
    price: parseFloat(price),
    category: selectedCategory,
  };
  // Logic for Pizzas or sized items - assuming "Pizzas" implies multiple sizes
  if (selectedCategory === "Pizzas") {
    const defaultSize = prompt(
      "Enter default size for this pizza (e.g., Small, Medium, Large):",
      "Medium"
    );
    if (defaultSize) {
      newItem.sizePrices = { [defaultSize]: parseFloat(price) };
      delete newItem.price; // Price is now per size
    } else {
      // Treat as a single-price item if no size given, or handle error
    }
  }

  items.push(newItem);
  localStorage.setItem("items", JSON.stringify(items));
  return true;
}

function updateItem(id, name, price, size = null) {
  const itemIndex = items.findIndex((i) => i.id === id);
  if (itemIndex === -1) return false;

  const item = items[itemIndex];
  if (size && item.sizePrices) {
    item.sizePrices[size] = parseFloat(price);
  } else {
    item.name = name;
    item.price = parseFloat(price);
  }
  localStorage.setItem("items", JSON.stringify(items));
  return true;
}

window.editItem = (id, size = null) => {
  const item = items.find((item) => item.id === id);
  if (item) {
    itemNameInput.value = item.name; // Keep full name for editing, including size if applicable
    itemPriceInput.value =
      size && item.sizePrices ? item.sizePrices[size] : item.price;
    itemCategorySelect.value = item.category; // Also set category dropdown

    itemNameInput.setAttribute("data-edit-id", id);
    if (size) {
      itemNameInput.setAttribute("data-edit-size", size);
      // Potentially disable item name editing if editing a specific size of a multi-size item
      // itemNameInput.readOnly = true; // Or handle display of "Item Name (Size)" separately
    } else {
      itemNameInput.removeAttribute("data-edit-size");
      // itemNameInput.readOnly = false;
    }
    document.getElementById("addItemBtn").classList.add("hidden");
    document.getElementById("updateItemBtn").classList.remove("hidden");
  }
};

function resetItemForm() {
  itemNameInput.removeAttribute("data-edit-id");
  itemNameInput.removeAttribute("data-edit-size");
  itemNameInput.value = "";
  itemPriceInput.value = "";
  // itemNameInput.readOnly = false;
  if (categories.length > 0) {
    itemCategorySelect.value = categories[0]; // Reset to first category
  }
  document.getElementById("addItemBtn").classList.remove("hidden");
  document.getElementById("updateItemBtn").classList.add("hidden");
}

window.deleteItem = (id, size = null) => {
  const itemIndex = items.findIndex((i) => i.id === id);
  if (itemIndex === -1) return;

  if (
    confirm(
      `Are you sure you want to delete "${items[itemIndex].name}${
        size ? ` (${size})` : ""
      }"?`
    )
  ) {
    if (size && items[itemIndex].sizePrices) {
      delete items[itemIndex].sizePrices[size];
      // If no sizes left, remove the item entirely
      if (Object.keys(items[itemIndex].sizePrices).length === 0) {
        items.splice(itemIndex, 1);
      }
    } else {
      // Not a sized item or deleting the whole item entry regardless of sizes
      items.splice(itemIndex, 1);
    }

    localStorage.setItem("items", JSON.stringify(items));
    loadAndDisplayManagedItems(itemCategorySelect.value); // Refresh with current category
    populateInvoiceItemSelect(); // Refresh invoice items
  }
};

// --- Data Migration: Move special pizzas to Special Pizza category and rename Pizza category ---
function migratePizzaCategories() {
  // Rename 'Pizzas' to 'Regular Pizza' in categories array
  const pizzaIndex = categories.indexOf("Pizzas");
  if (pizzaIndex !== -1) {
    categories[pizzaIndex] = "Regular Pizza";
  }
  // Add 'Special Pizza' to categories if not present
  if (!categories.includes("Special Pizza")) {
    categories.push("Special Pizza");
  }
  // Move special pizzas to 'Special Pizza' category
  const specialPizzas = [
    "Malai Boti Pizza",
    "Kabab Crust Pizza",
    "Special Kabab Pizza",
    "Crown Crust Pizza",
    "Lazania Pizza",
  ];
  let changed = false;
  items.forEach((item) => {
    // Only change the category, do NOT remove sizePrices
    if (item.category === "Pizzas" && specialPizzas.includes(item.name)) {
      item.category = "Special Pizza";
      changed = true;
    }
    // Also update any old 'Pizzas' category to 'Regular Pizza' (but keep sizePrices)
    if (item.category === "Pizzas" && !specialPizzas.includes(item.name)) {
      item.category = "Regular Pizza";
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("categories", JSON.stringify(categories));
  }
}

// --- Call migration on load ---
document.addEventListener("DOMContentLoaded", () => {
  migratePizzaCategories();
  fixItemCategories();
  renderCategoryNav();
  renderCategorySelects();
  setupEventListeners();
  // Initial load: use the value from itemCategorySelect if set, or default to first category
  const initialCategory =
    itemCategorySelect.value || (categories.length > 0 ? categories[0] : null);
  if (initialCategory) {
    loadAndDisplayManagedItems(initialCategory);
    showCategory(initialCategory); // This also calls loadAndDisplayManagedItems and sets view
  }
  populateInvoiceItemSelect();
  renderCurrentInvoiceItems();
  // Removed: categoryFilter.addEventListener("change", loadAndDisplayManagedItems);
});

function setupEventListeners() {
  if (navToItemManagement) {
    navToItemManagement.addEventListener("click", () =>
      showView("itemManagementView")
    );
  }
  if (navToInvoiceGenerator) {
    navToInvoiceGenerator.addEventListener("click", () =>
      showView("invoiceGeneratorView")
    );
  }
  if (document.getElementById("addItemBtn")) {
    document.getElementById("addItemBtn").addEventListener("click", (e) => {
      e.preventDefault();
      const name = itemNameInput.value.trim();
      const price = parseFloat(itemPriceInput.value);
      if (name && !isNaN(price) && price >= 0) {
        if (addItem(name, price)) {
          resetItemForm();
          loadAndDisplayManagedItems(itemCategorySelect.value);
          populateInvoiceItemSelect();
        }
      } else {
        alert("Please enter valid item name and price.");
      }
    });
  }
  if (document.getElementById("updateItemBtn")) {
    document.getElementById("updateItemBtn").addEventListener("click", (e) => {
      e.preventDefault();
      const name = itemNameInput.value.trim();
      const price = parseFloat(itemPriceInput.value);
      const editId = itemNameInput.getAttribute("data-edit-id");
      const editSize = itemNameInput.getAttribute("data-edit-size");
      if (name && !isNaN(price) && price >= 0 && editId) {
        if (updateItem(Number(editId), name, price, editSize)) {
          resetItemForm();
          loadAndDisplayManagedItems(itemCategorySelect.value);
          populateInvoiceItemSelect();
        }
      } else {
        alert("Please enter valid item details for update.");
      }
    });
  }
  if (addItemToInvoiceBtn) {
    addItemToInvoiceBtn.addEventListener("click", handleAddItemToInvoice);
  }
  if (generateFinalInvoiceBtn) {
    generateFinalInvoiceBtn.addEventListener(
      "click",
      handleGenerateAndPrintInvoice
    );
  }

  if (invoiceItemSelect) {
    invoiceItemSelect.addEventListener("change", () => {
      const selectedValue = invoiceItemSelect.value;
      if (!selectedValue) {
        itemPricePreview.textContent = "";
        return;
      }
      let itemId, size;
      if (selectedValue.includes("_")) {
        [itemId, size] = selectedValue.split("_");
        itemId = parseInt(itemId);
      } else {
        itemId = parseInt(selectedValue);
      }
      const item = items.find((i) => i.id === itemId);
      if (item) {
        const price =
          size && item.sizePrices ? item.sizePrices[size] : item.price;
        itemPricePreview.textContent = `Price: PKR ${formatPrice(price)}`;
      } else {
        itemPricePreview.textContent = "";
      }
    });
  }

  if (invoiceCategoryFilter) {
    invoiceCategoryFilter.addEventListener("change", () => {
      populateInvoiceItemSelect();
    });
  }

  // Listener for item management category dropdown
  if (itemCategorySelect) {
    itemCategorySelect.addEventListener("change", () => {
      loadAndDisplayManagedItems(itemCategorySelect.value);
    });
  }
  // On page load, always select the first category if none is selected
  if (
    itemCategorySelect &&
    !itemCategorySelect.value &&
    categories.length > 0
  ) {
    itemCategorySelect.value = categories[0];
    loadAndDisplayManagedItems(categories[0]);
  }
}

function fixItemCategories() {
  let changed = false;
  items.forEach((item) => {
    if (
      !item.category ||
      item.category === "Uncategorized" ||
      item.category === "undefined"
    ) {
      item.category = categories.length > 0 ? categories[0] : "Burgers"; // Default to first available category or 'Burgers'
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("items", JSON.stringify(items));
  }
}

function showView(viewId) {
  document.getElementById("categoryManagementSection").classList.add("hidden");
  document.getElementById("invoiceGeneratorView").classList.add("hidden");

  if (viewId === "itemManagementView") {
    document
      .getElementById("categoryManagementSection")
      .classList.remove("hidden");
    // Ensure the item list reflects the current dropdown selection or default
    const currentCat =
      itemCategorySelect.value ||
      (categories.length > 0 ? categories[0] : null);
    if (currentCat) {
      loadAndDisplayManagedItems(currentCat);
    }
  } else if (viewId === "invoiceGeneratorView") {
    document.getElementById("invoiceGeneratorView").classList.remove("hidden");
    populateInvoiceItemSelect(); // Ensure items are populated for current invoice category filter
  }
}

// Ensure print styles are specific enough
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @media print {
    body.print-invoice-active > *:not(#invoice) {
      display: none !important;
      visibility: hidden !important;
    }
    #invoice, #invoice * {
      visibility: visible !important;
      display: block !important; /* Ensure elements in invoice are block or as intended */
    }
    #invoice {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important; /* Use 100% instead of 100vw for print usually */
      min-height: auto !important; /* auto or unset for print */
      background: #fff !important;
      z-index: 9999 !important;
      box-shadow: none !important;
      padding: 20px !important; /* Add some padding for print */
      margin: 0 !important;
      border: none !important;
    }
    #invoice table {
      width: 100% !important;
      font-size: 12pt !important; /* Adjust print font size */
      border-collapse: collapse !important;
    }
    #invoice th, #invoice td {
      border: 1px solid #333 !important;
      padding: 6px !important; /* Adjust padding */
      text-align: left !important;
    }
    #invoice h2 {
      margin-top: 0 !important;
      margin-bottom: 0.5rem !important;
      font-size: 16pt !important;
    }
    #invoice p, #invoice span {
      font-size: 10pt !important;
      line-height: 1.4 !important;
    }
    #invoice .text-center {
      text-align: center !important;
    }
    #invoice .mb-2, #invoice .mb-4 {
      margin-bottom: 0.5rem !important;
    }
    #printLogo {
        width: 70px !important; /* Adjust logo size for print */
        height: 70px !important;
        margin-bottom: 10px !important;
    }
  }
`;
document.head.appendChild(styleSheet);
