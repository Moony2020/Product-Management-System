// DOM element references
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const discountInput = document.getElementById("discount");
const totalDisplay = document.getElementById("total");
const countInput = document.getElementById("count");
const categoryInput = document.getElementById("category");
const create = document.getElementById("submit");
const searchInput = document.getElementById("search");
const searchTitleButton = document.getElementById("searchTitle");
const searchCategoryButton = document.getElementById("searchCatogory");
const tableBody = document.querySelector("table tbody");
const deleteAllButton = document.getElementById("deleteAllButton"); // Add this for Delete All button
let mood = "create"; // This is to switch between Create and Update button modes
let tmp; // Used to store index during product update
let searchProduct = "name"; // Default search mode is by name

/**
 * Calculates the total price of the product by applying the discount.
 * Updates the totalDisplay element on the page.
 */
function calculateTotal() {
  if (priceInput.value != "") {
    let total = priceInput.value - discountInput.value;
    totalDisplay.textContent = `${total} kr`;
    totalDisplay.style.background = "#32CD32"; // Green background when there is a price
  } else {
    totalDisplay.textContent = "";
    totalDisplay.style.background = "#A52A2A"; // Red background when price is empty
  }
}

/**
 * Handles the creation of a new product or updating an existing product.
 * Sends data to the server and updates the UI accordingly.
 */
create.onclick = function() {
  let count = parseInt(countInput.value);
  let categoryId = categoryInput.value; // Get selected category ID
  let name = nameInput.value.trim();
  let price = parseFloat(priceInput.value); // Get the price
  let discount = parseFloat(discountInput.value); // Get the discount

  // Validate required fields
  if (!name || !categoryId) {
    showValidationModal(
      "Please provide both name and category before adding a product."
    );
    return;
  }

  // Validate count
  if (isNaN(count) || count <= 0) {
    showValidationModal("Please enter a valid count.");
    return;
  }

  // Validate price
  if (isNaN(price) || price <= 0) {
    showValidationModal("Please enter a valid price.");
    return;
  }

  // Validate discount
  if (isNaN(discount) || discount < 0) {
    showValidationModal("Please enter a valid discount.");
    return;
  }

  let product = {
    nameInput: name.toLowerCase(),
    priceInput: price,
    discountInput: discount,
    totalDisplay: totalDisplay.textContent,
    countInput: countInput.value,
    categoryInput: categoryId // Use selected category ID
  };

  /**
   * Clears input fields after product is added or updated.
   */
  const clearInputs = () => {
    nameInput.value = "";
    priceInput.value = "";
    discountInput.value = "";
    totalDisplay.textContent = "";
    countInput.value = "";
    categoryInput.value = "";
    calculateTotal();
  };
  // Handle product update or creation based on 'mood'
  if (mood === "update") {
    fetch(`http://localhost:3000/v1/products/${tmp}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })
      .then(response => response.json())
      .then(data => {
        console.log("Product updated:", data);
        showProductData();
        clearInputs();
        mood = "create";
        create.innerHTML = "Create";
        countInput.style.display = "block"; // Show count input in create mode

        // Show success message for update
        showMessage("Product updated successfully");
      })
      .catch(error => console.error("Error:", error));
  } else {
    // Adding new products with the specified count
    for (let i = 0; i < count; i++) {
      fetch("http://localhost:3000/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      })
        .then(response => response.json())
        .then(data => {
          console.log("Product added:", data);
          showProductData();
          clearInputs();
          countInput.style.display = "block"; // Show count input in create mode
          // Show success message for product creation
          showMessage("Product created successfully");
        })
        .catch(error => {
          console.error("Error:", error);
          alert("Failed to add product. Please check the server logs.");
        });
    }
  }
};

window.onload = function() {
  // Clear input fields when the page is loaded
  nameInput.value = "";
  priceInput.value = "";
  discountInput.value = "";
  totalDisplay.textContent = "";
  countInput.value = "";
  categoryInput.value = "";

  const modal = document.getElementById("confirmModal");
  modal.style.display = "none"; // Hide the modal on page load by default
  loadCategories(); // Load categories when the page is loaded
};

// Function to display the modal with a specific message
function showValidationModal(message) {
  const modal = document.getElementById("validationModal");
  const validationMessage = document.getElementById("validationMessage");
  const closeModalButton = document.getElementById("closeModalButton");

  // Set the message
  validationMessage.textContent = message;

  // Show the modal
  modal.style.display = "block";

  // Add an event listener to close the modal when the button is clicked
  closeModalButton.onclick = function() {
    modal.style.display = "none";
  };
}

/**
 * Fetches all products from the server and displays them in the table.
 */
// Function to load products and add checkboxes to the table
function showProductData() {
  fetch("http://localhost:3000/v1/products")
    .then(response => response.json())
    .then(data => {
      let table = "";
      data.forEach((product, index) => {
        let userFriendlyId = index + 1; // Adjust the index for user-friendly ID

        table += `
          <tr>
            <td><input type="checkbox" class="product-checkbox" data-id="${product._id}" /></td>
            <td>${userFriendlyId}</td>
            <td>${product.nameInput}</td>
            <td>${product.priceInput}</td>
            <td>${product.discountInput}</td>
            <td>${product.totalDisplay}</td>
            <td>${product.categoryInput
              ? product.categoryInput.name
              : "No Category"}</td>
            <td>
              <button class="update-btn" onclick="updateProductData('${product._id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
            </td>
            <td>
              <button class="delete-btn" onclick="deleteProductData('${product._id}', '${userFriendlyId}', '${product.nameInput}')">
                <i class="ri-delete-bin-line"></i>
              </button>
            </td>
          </tr>
        `;
      });

      document.getElementById("tbody").innerHTML = table;
      // Update the total products count
      document.getElementById("totalProductsCount").textContent = data.length;
    })
    .catch(error => console.error("Error fetching products:", error));
}

// Function to delete selected products
document.getElementById("deleteSelectedButton").onclick = function() {
  const selectedCheckboxes = document.querySelectorAll(
    ".product-checkbox:checked"
  );

  if (selectedCheckboxes.length === 0) {
    showMessage("Please select products to delete");
    return;
  }

  const productIds = Array.from(selectedCheckboxes).map(checkbox =>
    checkbox.getAttribute("data-id")
  );

  const message = `Delete ${productIds.length} selected product(s)?`;
  
  showDeleteConfirmation(message, function() {
    fetch("http://localhost:3000/v1/products/delete-selected", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Products deleted:", data);
      showProductData();
      showMessage(`${productIds.length} product(s) deleted successfully`);
    })
    .catch(error => {
      console.error("Error deleting selected products:", error);
      showMessage("Failed to delete selected products");
    });
  });
};

/**
 * Shows a confirmation modal for delete operations.
 * @param {string} message - The confirmation message to display.
 * @param {function} onConfirm - Callback function when user confirms deletion.
 */
function showDeleteConfirmation(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  
  // Set the confirmation message
  confirmMessage.innerHTML = message;
  modal.style.display = "flex"; // Show the modal

  // Clear previous event listeners
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");
  
  confirmYes.onclick = null;
  confirmNo.onclick = null;

  // Set new event listeners
  confirmYes.onclick = function() {
    onConfirm();
    modal.style.display = "none"; // Hide the modal after confirmation
  };

  confirmNo.onclick = function() {
    modal.style.display = "none"; // Hide the modal without action
  };
}

/**
 * Ensures modal is hidden and categories are loaded when the page is loaded.
 */
window.onload = function() {
  const modal = document.getElementById("confirmModal");
  modal.style.display = "none"; // Hide the modal on page load by default
  loadCategories(); // Load categories when the page is loaded
};

/**
 * Adds a new category to the server and refreshes the category dropdown.
 */
document.getElementById("addCategoryButton").onclick = function() {
  let categoryName = document.getElementById("newCategory").value.trim();
  if (categoryName !== "") {
    fetch("http://localhost:3000/v1/categories/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: categoryName })
    })
      .then(response => response.json())
      .then(data => {
        showMessage("Category added successfully!"); // Success message
        loadCategories(); // Refresh the categories dropdown
        // Clear the category input field after adding a category
        document.getElementById("newCategory").value = "";
      })
      .catch(error => console.error("Error adding category:", error));
  } else {
    showValidationModal("Please enter a category name.");
    return;
  }
};

window.onload = function() {
  loadCategories(); // Load categories when the page is loaded
};

/**
 * Category deletion functionality
 */
document.getElementById("deleteCategoryButton").onclick = function(name) {
  const categoryId = document.getElementById("category").value;
  const categoryName = document.getElementById("category").selectedOptions[0]?.textContent;

  if (!categoryId) {
    showValidationModal("Please select a category to delete.");
    return;
  }

  // Check if the category is associated with products
  fetch(`http://localhost:3000/v1/categories/check-products/${categoryId}`)
    .then(response => response.json())
    .then(products => {
      if (products.length > 0) {
        // Show validation modal if the category is associated with products
        showValidationModal(
         `Category ${categoryName} is linked  to products and can't be deleted.`
        );
        return; // Exit without showing confirmation modal
      }

      // Show the confirmation modal since the category has no associated products
      const modal = document.getElementById("confirmModal");
      const confirmMessage = document.getElementById("confirmMessage");
      modal.style.display = "flex"; // Display the modal
      confirmMessage.innerHTML = "Delete category?";

      // Bind Yes button action
      document.getElementById("confirmYes").onclick = function() {
        fetch(`http://localhost:3000/v1/categories/${categoryId}`, {
          method: "DELETE"
        })
          .then(response => response.json())
          .then(() => {
            showMessage("Category deleted successfully!");
            loadCategories(); // Reload categories
            modal.style.display = "none"; // Hide modal after success
          })
          .catch(error => {
            console.error("Error deleting category:", error);
            alert("Failed to delete category. Please check the server logs.");
          });
      };

      // Bind No button action
      document.getElementById("confirmNo").onclick = function() {
        modal.style.display = "none"; // Close the modal without deleting
      };
    })
    .catch(error => {
      console.error("Error checking category products:", error);
      alert("Failed to check category products.");
    });
};

/**
 * Loads all categories from the server and populates the category dropdown.
 */
function loadCategories() {
  fetch("http://localhost:3000/v1/categories")
    .then(response => response.json())
    .then(data => {
      let categorySelect = document.getElementById("category");
      categorySelect.innerHTML = ""; // Clear the current dropdown options

      // Default option
      let defaultOption = document.createElement("option");
      defaultOption.textContent = "Select category";
      defaultOption.value = "";
      categorySelect.appendChild(defaultOption);

      // Populate categories in the dropdown
      data.forEach(category => {
        let option = document.createElement("option");
        option.value = category._id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });

      categorySelect.onchange = function() {
        const selectedCategory = categorySelect.value;
        document.getElementById(
          "deleteCategoryButton"
        ).disabled = !selectedCategory;
      };
    })
    .catch(error => console.error("Error loading categories:", error));
}

/**
 * Switches between search modes (by name or category) based on the selected button.
 * @param {string} id - The ID of the selected button.
 */
function searchMode(id) {
  if (id === "searchTitle") {
    searchProduct = "name";
    searchInput.placeholder = "Search by name"; // Set the placeholder text
  } else if (id === "searchCatogory") {
    searchProduct = "category";
    searchInput.placeholder = "Search by category"; // Set the placeholder text
  }
  searchInput.focus();
  searchInput.value = "";
  showProductData(); // Show all products when switching mode
}

/**
 * Fetches the details of a product by its ID and populates the input fields for updating.
 * @param {string} id - The ID of the product to be updated.
 */
function updateProductData(id) {
  console.log("Updating product with ID:", id);

  // Fetch the product by its MongoDB _id (use the correct port: 3000)
  fetch(`http://localhost:3000/v1/products/${id}`, {
    method: "GET"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Product not found");
      }
      return response.json();
    })
    .then(data => {
      console.log("Fetched product data:", data);
      nameInput.value = data.nameInput;
      priceInput.value = data.priceInput;
      discountInput.value = data.discountInput;
      countInput.value = data.countInput; // Set the countInput to the current value from the database
      calculateTotal();

      // Set the category dropdown to the product's current category
      if (data.categoryInput) {
          // If categoryInput is populated (from .populate())
      const categoryId = data.categoryInput._id || data.categoryInput;
      categoryInput.value = categoryId; // Set the category dropdown to the correct category
      }

      create.innerHTML = "Update";
      mood = "update";
      tmp = data._id; // Store the MongoDB _id for later use in the update
      countInput.style.display = "none"; // Hide count input in update mode

      // Scroll to the input section
      document.querySelector(".input").scrollIntoView({
        behavior: "smooth", // Smooth scrolling effect
        block: "start" // Scroll to the start of the element
      });
    })
    .catch(error => {
      console.error("Error updating product:", error);
      alert("Error updating product. Please check the server logs.");
    });
}

/**
 * Deletes a product from the server and updates the product list.
 * @param {string} mongoId - The MongoDB ID of the product to be deleted.
 * @param {string} userFriendlyId - A user-friendly ID for display purposes.
 * @param {string} name - The name of the product to be deleted.
 */
function deleteProductData(mongoId, userFriendlyId, name) {
  const message = `Delete product? <br><br><strong>ID (${userFriendlyId})</strong> : <strong>${name}</strong>`;
  
  showDeleteConfirmation(message, function() {
    fetch(`http://localhost:3000/v1/products/${mongoId}`, {
      method: "DELETE"
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to delete product");
      return response.json();
    })
    .then(data => {
      console.log(`Deleted product with MongoDB ID: ${mongoId}`);
      showProductData(); // Refresh the product list
      showMessage("Product deleted successfully");
    })
    .catch(error => {
      console.error("Error deleting product:", error);
      showMessage("Failed to delete product");
    });
  });
}

/**
 * Deletes all products from the server after confirmation.
 */
deleteAllButton.onclick = function() {
  fetch("http://localhost:3000/v1/products")
    .then(response => response.json())
    .then(data => {
      const productCount = data.length;
      if (productCount === 0) {
        showMessage("No products to delete");
        return;
      }

      const message = `Delete all ${productCount} products?`;
      
      showDeleteConfirmation(message, function() {
        fetch("http://localhost:3000/v1/products", {
          method: "DELETE"
        })
        .then(response => {
          if (!response.ok) throw new Error("Failed to delete all products");
          return response.json();
        })
        .then(data => {
          console.log("Deleted all products:", data.message);
          showProductData();
          showMessage("All products deleted successfully");
        })
        .catch(error => {
          console.error("Error deleting all data:", error);
          showMessage("Failed to delete all products");
        });
      });
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      showMessage("Failed to load products");
    });
};

/**
 * Displays a temporary success message with fade-in and fade-out effect.
 * @param {string} message - The message to display.
 */
function showMessage(message) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = message; // Set the message text
  messageBox.style.display = "block"; // Show the message box

  // Hide the message after 3 seconds
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000);
}

/**
 * Handles search functionality by name or category.
 * Filters products based on the search query and selected search mode.
 * @param {string} value - The search query entered by the user.
 */
function searchData(value) {
  fetch("http://localhost:3000/v1/products")
    .then(response => response.json())
    .then(data => {
      let filteredData;
      if (searchProduct === "name") {
        filteredData = data.filter(product =>
          product.nameInput.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredData = data.filter(
          product =>
            product.categoryInput &&
            product.categoryInput.name
              .toLowerCase()
              .includes(value.toLowerCase().trim()) // Access category name for search
        );
      }

      let table = "";
      filteredData.forEach((product, i) => {
        let userFriendlyId = i + 1; // Adjust the index for filtered results
        table += `
          <tr>
            <td><input type="checkbox" class="product-checkbox" data-id="${product._id}" /></td>
            <td>${userFriendlyId}</td>
            <td>${product.nameInput}</td>
            <td>${product.priceInput}</td>
            <td>${product.discountInput}</td>
            <td>${product.totalDisplay}</td>
            <td>${product.categoryInput
              ? product.categoryInput.name
              : "No Category"}</td>
            <td>
              <button class="update-btn" onclick="updateProductData('${product._id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
            </td>
            <td>
              <button class="delete-btn" onclick="deleteProductData('${product._id}', '${userFriendlyId}', '${product.nameInput}')">
                <i class="ri-delete-bin-line"></i>
              </button>
            </td>
          </tr>
        `;
      });

      document.getElementById("tbody").innerHTML = table;
    })
    .catch(error => console.error("Error fetching products:", error));
}

// Attach search handlers
searchInput.onkeyup = function() {
  const query = searchInput.value;
  if (query.length > 0) {
    searchData(query);
  } else {
    showProductData(); // Show all products if the search query is empty
  }
};

// Switch search mode using buttons
searchTitleButton.onclick = function() {
  searchMode("searchTitle");
};

searchCategoryButton.onclick = function() {
  searchMode("searchCatogory");
};

window.onload = function() {
  // Clear input fields when the page is loaded
  nameInput.value = "";
  priceInput.value = "";
  discountInput.value = "";
  totalDisplay.textContent = "";
  countInput.value = "";
  categoryInput.value = "";
  document.getElementById("newCategory").value = ""; // Clear the new category input

  // Clear the search input value
  searchInput.value = ""; // This will clear the search bar
  const modal = document.getElementById("confirmModal");
  modal.style.display = "none"; // Hide the modal on page load by default
  loadCategories(); // Load categories when the page is loaded
};

// Initialize product data display
showProductData();
