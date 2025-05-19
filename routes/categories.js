/**
 * Express router for category-related operations.
 */
const express = require("express");
const Category = require("../models/category");
const Product = require("../models/product"); // Import the Product model
const router = express.Router();

/**
 * @route POST /add
 * @description Add a new category to the database.
 * @param {Object} req - The request object containing the category data in `req.body`.
 * @param {string} req.body.name - The name of the category to add.
 * @param {Object} res - The response object used to send back the created category or an error message.
 */
router.post("/add", (req, res) => {
  const { name } = req.body;

  // Log request body to verify the category name is received correctly
  console.log("Category data being sent:", req.body);

  Category.findOne({ name })
    .then(existingCategory => {
      if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const newCategory = new Category({ name });

      newCategory
        .save()
        .then(category => {
          console.log("New category added:", category);
          res.status(201).json(category); // Send back the created category
        })
        .catch(error => {
          console.error("Error adding category:", error); // Log the error
          res.status(500).json({ message: "Error adding category", error });
        });
    })
    .catch(error => {
      console.error("Error checking category:", error); // Log any error in the process
      res.status(500).json({ message: "Error checking category", error });
    });
});

/**
 * @route GET /
 * @description Fetch all categories from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object used to send back the list of categories or an error message.
 */
router.get("/", (req, res) => {
  Category.find()
    .then(categories => res.status(200).json(categories)) // Return all categories
    .catch(error => {
      console.error("Error fetching categories:", error); // Log error
      res.status(500).json({ message: "Error fetching categories", error });
    });
});

/**
 * @route GET /:id
 * @description Fetch a specific category by its ID.
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the category to fetch.
 * @param {Object} res - The response object used to send back the category or an error message.
 */
// GET /v1/categories/:id
router.get("/:id", (req, res) => {
  const categoryId = req.params.id;
  Category.findById(categoryId)
    .then(category => {
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json(category); // Return category details
    })
    .catch(error => {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Error fetching category", error });
    });
});

// GET /v1/products?category=<categoryId>
// Check if any products are associated with a category before deletion
router.get("/check-products/:categoryId", (req, res) => {
  const categoryId = req.params.categoryId; // Get category ID from route parameter
  Product.find({ categoryInput: categoryId })
    .then(products => {
      res.status(200).json(products); // Return products associated with the category
    })
    .catch(error => {
      console.error("Error checking category products:", error);
      res.status(500).json({ message: "Error checking products", error });
    });
});

// DELETE /v1/categories/:id - Delete category by ID
router.delete("/:id", (req, res) => {
  const categoryId = req.params.id;
  Category.findByIdAndDelete(categoryId)
    .then(() => {
      res.status(200).json({ message: "Category deleted successfully" });
    })
    .catch(error => {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Error deleting category", error });
    });
});

module.exports = router;
