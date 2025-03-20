import mongoose, { Schema } from "mongoose";
import {
  Categories,
  Cities,
  Countries,
  Currency,
  PropertyPurpose,
} from "../../utils/enum/enums.js";

// Extract main categories
const mainCategories = Object.keys(Categories); // ["RESIDENTIAL", "PLOT", "COMMERCIAL"]

// Extract subcategories correctly
const subcategories = Object.entries(Categories).flatMap(([main, sub]) =>
  Object.keys(sub.options).map((key) => ({
    key,
    mainCategory: main,
  }))
);

const RequestedPropertySchema = new Schema(
  {
    country: { type: String, enum: Object.keys(Countries), required: true },
    city: { type: String, enum: Object.keys(Cities), required: true },
    wanted_for: {
      type: String,
      enum: Object.keys(PropertyPurpose),
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: mainCategories, // Only allows valid main categories
    },
    type: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (!this.category) return false; // Prevent undefined category error
          return subcategories.some(
            (s) => s.key === value && s.mainCategory === this.category
          );
        },
        message: (props) =>
          `${props.value} is not a valid subcategory for ${
            props.instance?.category || "unknown category"
          }`,
      },
    },
    price_range: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: null },
      currency: { type: String, enum: Object.keys(Currency), required: true },
    },
    installments_available: { type: Boolean, default: false, required: true },
    specific_requirements: { type: String },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Pre-validation normalization (case-insensitive matching)
RequestedPropertySchema.pre("validate", function (next) {
  if (this.category) {
    this.category =
      Object.keys(Categories).find(
        (c) => c.toLowerCase() === this.category.toLowerCase()
      ) || this.category;
  }

  if (this.type && this.category && Categories[this.category]) {
    this.type =
      Object.keys(Categories[this.category].options).find(
        (t) => t.toLowerCase() === this.type.toLowerCase()
      ) || this.type;
  }

  next();
});

const RequestedPropertyModel =
  mongoose.models.RequestedProperty ||
  mongoose.model("RequestedProperty", RequestedPropertySchema);

export default RequestedPropertyModel;
