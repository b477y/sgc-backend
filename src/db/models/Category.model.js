import mongoose from "mongoose";
import { Categories } from "../../utils/enum/enums.js";

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
    enum: Object.keys(Categories),
    required: true,
  },
  label: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  subcategories: { type: [SubcategorySchema], required: true },
});

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;
