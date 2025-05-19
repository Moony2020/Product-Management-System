const mongoose = require("mongoose");
const Category = require("./category"); // Reference the Category model

const productSchema = new mongoose.Schema({
  nameInput: { type: String, required: true },
  priceInput: { type: Number, required: true },
  discountInput: { type: Number, required: true },
  totalDisplay: { type: String },
  countInput: { type: Number, required: true },
  categoryInput: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  } // Reference to Category
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
