import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
});

const CategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    enum: ["RESIDENTIAL", "PLOT", "COMMERCIAL"], // Ensure valid values
    required: true,
  },
  label: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  subcategories: { type: [SubcategorySchema], required: true }, // Fixed array issue
});

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;
