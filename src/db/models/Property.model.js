import mongoose, { Schema } from "mongoose";
import { Amenities, Categories } from "../../utils/enum/enums.js";

// Extract main categories and their subcategories
const mainCategories = Object.keys(Categories); // ["Residential", "Plot", "Commercial"]
const subcategories = Object.entries(Categories).flatMap(([main, sub]) =>
  Object.entries(sub).map(([key, value]) => ({
    key,
    value,
    mainCategory: main,
  }))
);

const PropertySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    area: { type: Number, required: true }, // Property area in square meters
    category: {
      type: String,
      required: true,
      enum: mainCategories, // Only allows valid main categories
    },
    type: {
      type: String,
      required: true,
      enum: subcategories.map((s) => s.key), // Only allows valid subcategories
    },
    balconies: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postedOn: { type: Date, default: Date.now() },
    totalrooms: { type: Number, required: true },
    floorNumber: { type: Number, required: true },
    amenities: [{ type: String, enum: Object.keys(Amenities) }],
    purpose: { type: String },
  },
  { timestamps: true }
);

PropertySchema.index({ title: 1, address: 1 }, { unique: true });

PropertySchema.pre("validate", function (next) {
  // Normalize category to match enum keys (case-insensitive)
  if (this.category) {
    const matchedCategory = Object.keys(Categories).find(
      (c) => c.toLowerCase() === this.category.toLowerCase()
    );
    if (matchedCategory) {
      this.category = matchedCategory; // Ensure it's stored in uppercase
    }
  }

  // Normalize type (subcategory) to match enum keys (case-insensitive)
  if (this.type && this.category && Categories[this.category]) {
    const matchedType = Object.keys(Categories[this.category]).find(
      (t) => t.toLowerCase() === this.type.toLowerCase()
    );
    if (matchedType) {
      this.type = matchedType; // Ensure it's stored in uppercase
    }
  }

  // Normalize amenities to match enum keys (case-insensitive)
  if (this.amenities && Array.isArray(this.amenities)) {
    this.amenities = this.amenities.map((a) => {
      const matchedAmenity = Object.keys(Amenities).find(
        (key) => Amenities[key].toLowerCase() === a.toLowerCase()
      );
      return matchedAmenity || a; // Keep original if no match (to trigger validation error)
    });
  }

  next();
});

const PropertyModel =
  mongoose.models.Property || mongoose.model("Property", PropertySchema);
export default PropertyModel;
