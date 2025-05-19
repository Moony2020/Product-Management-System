const express = require("express");
const Product = require("../models/product");
const router = express.Router();

/**
 * POST /
 * Adds a new product to the database.
 * @param {Object} req - The request object containing the product details in the body.
 * @param {string} req.body.nameInput - The name of the product.
 * @param {number} req.body.priceInput - The price of the product.
 * @param {number} req.body.discountInput - The discount applied to the product.
 * @param {number} req.body.totalDisplay - The total price after discount.
 * @param {number} req.body.countInput - The quantity of the product.
 * @param {string} req.body.categoryInput - The category ID of the product.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns the created product on success or an error message on failure.
 */
router.post("/", (req, res) => {
  const {
    nameInput,
    priceInput,
    discountInput,
    totalDisplay,
    countInput,
    categoryInput
  } = req.body;

  const newProduct = new Product({
    nameInput,
    priceInput,
    discountInput,
    totalDisplay,
    countInput,
    categoryInput
  });

  newProduct
    .save()
    .then(product => res.status(201).json(product))
    .catch(error => {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Error adding product", error });
    });
});

// DELETE /v1/products/delete-selected
// Deletes selected products from the database
router.post("/delete-selected", (req, res) => {
  const { productIds } = req.body; // Get the product IDs from the request body

  // Use MongoDB's $in operator to delete multiple products by their IDs
  Product.deleteMany({ _id: { $in: productIds } })
    .then(() =>
      res
        .status(200)
        .json({ message: "Selected products deleted successfully" })
    )
    .catch(error => {
      console.error("Error deleting selected products:", error);
      res
        .status(500)
        .json({ message: "Error deleting selected products", error });
    });
});

/**
 * GET /
 * Fetches all products from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Array} - An array of all products with populated category data.
 */
router.get("/", (req, res) => {
  Product.find()
    .populate("categoryInput")
    .then(products => res.status(200).json(products))
    .catch(error => {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products", error });
    });
});

/**
 * GET /:id
 * Fetches a product by its ID.
 * @param {Object} req - The request object containing the product ID in params.
 * @param {string} req.params.id - The ID of the product to fetch.
 * @param {Object} res - The response object.
 * @returns {Object} - The product object if found, or an error message if not.
 */ router.get(
  "/:id",
  (req, res) => {
    Product.findById(req.params.id)
      .populate("categoryInput") // This ensures the category data is included
      .then(product => {
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
      })
      .catch(error => {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product", error });
      });
  }
);

router.get("/:id", (req, res) => {
  Product.findById(req.params.id)
    .then(product => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    })
    .catch(error => {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product", error });
    });
});

/**
 * PUT /:id
 * Updates a product by its ID.
 * @param {Object} req - The request object containing the product ID in params and update data in body.
 * @param {string} req.params.id - The ID of the product to update.
 * @param {Object} req.body - The updated product details.
 * @param {Object} res - The response object.
 * @returns {Object} - The updated product object if successful, or an error message if not.
 */
router.put("/:id", (req, res) => {
  Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedProduct => {
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(updatedProduct);
    })
    .catch(error => {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product", error });
    });
});

/**
 * DELETE /:id
 * Deletes a product by its ID.
 * @param {Object} req - The request object containing the product ID in params.
 * @param {string} req.params.id - The ID of the product to delete.
 * @param {Object} res - The response object.
 * @returns {Object} - A success message if deletion is successful, or an error message if not.
 */
router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then(() =>
      res.status(200).json({ message: "Product deleted successfully" })
    )
    .catch(error => {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product", error });
    });
});

/**
 * DELETE /
 * Deletes all products from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A success message if deletion is successful, or an error message if not.
 */
router.delete("/", (req, res) => {
  Product.deleteMany()
    .then(() =>
      res.status(200).json({ message: "All products deleted successfully" })
    )
    .catch(error => {
      console.error("Error deleting all products:", error);
      res.status(500).json({ message: "Error deleting all products", error });
    });
});

module.exports = router;
