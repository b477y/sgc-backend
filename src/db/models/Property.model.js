import mongoose, { Schema } from "mongoose";
import {
  Amenities,
  Categories,
  Cities,
  Countries,
  Currency,
  FurnishedStatus,
  Orientation,
  PropertyPurpose,
  RealEstateSituation,
  RentalFrequencies,
} from "../../utils/enum/enums.js";

// Extract main categories
const mainCategories = Object.keys(Categories); // ["RESIDENTIAL", "PLOT", "COMMERCIAL"]

// Extract subcategories correctly
const subcategories = Object.entries(Categories).flatMap(([main, sub]) =>
  Object.entries(sub.options).map(([key, value]) => ({
    key,
    value,
    mainCategory: main,
  }))
);

const PropertySchema = new Schema(
  {
    purpose: {
      type: String,
      enum: Object.keys(PropertyPurpose),
      required: true,
    },
    country: { type: String, enum: Object.keys(Countries), required: true },
    city: { type: String, enum: Object.keys(Cities), required: true },
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
          return subcategories.some(
            (s) => s.key === value && s.mainCategory === this.category
          );
        },
        message: (props) =>
          `${props.value} is not a valid subcategory for ${props.instance.category}`,
      },
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price_currency: {
      type: String,
      required: true,
      enum: Object.keys(Currency),
    },
    price: { type: Number, required: true },
    bedrooms: {
      type: Number,
      required: function () {
        return this.category !== "PLOT";
      },
    },
    bathrooms: {
      type: Number,
      required: function () {
        return this.category !== "PLOT";
      },
    },
    livingrooms: {
      type: Number,
      required: function () {
        return this.category !== "PLOT";
      },
    },
    kitchen: {
      type: Number,
      required: function () {
        return this.category !== "PLOT";
      },
    },
    balconies: {
      type: Number,
      required: function () {
        return this.category !== "PLOT";
      },
    },
    floor_number: {
      type: Number,
      required: function () {
        return this.category !== "PLOT";
      },
    },
    rental_frequency: {
      type: String,
      required: function () {
        return this.purpose === "RENT";
      },
      enum: Object.keys(RentalFrequencies),
    },
    orientation: {
      type: String,
      required: true,
      enum: Object.keys(Orientation),
    },
    monthly_service_currency: {
      type: String,
      required: true,
      enum: Object.keys(Currency),
    },
    monthly_service: { type: Number, required: true },
    real_estate_situation: {
      type: String,
      required: true,
      enum: Object.keys(RealEstateSituation),
    },
    furnished: {
      type: String,
      required: true,
      enum: Object.keys(FurnishedStatus),
    },
    area: { type: Number, required: true }, // Property area in square meters
    amenities: [{ type: String, enum: Object.keys(Amenities), required: true }],
    images: [{ secure_url: String, public_id: String }],
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

// Ensure uniqueness for title & address
PropertySchema.index({ title: 1, country: 1 }, { unique: true });

// Pre-validation normalization (case-insensitive matching)
PropertySchema.pre("validate", function (next) {
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

  if (this.amenities && Array.isArray(this.amenities)) {
    this.amenities = this.amenities
      .flat() // Flatten nested arrays
      .map((a) => (typeof a === "string" ? a.split(",") : [])) // Split comma-separated values
      .flat(); // Flatten again after splitting
  }

  next();
});

PropertySchema.pre("save", function (next) {
  if (this.price_currency)
    this.price_currency = this.price_currency.toUpperCase();
  if (this.monthly_service_currency)
    this.monthly_service_currency = this.monthly_service_currency.toUpperCase();
  if (this.orientation)
    this.orientation = this.orientation.replace(/\s/g, "_").toUpperCase();
  if (this.real_estate_situation)
    this.real_estate_situation = this.real_estate_situation
      .replace(/\s/g, "_")
      .toUpperCase();
  if (this.furnished) this.furnished = this.furnished.toUpperCase();
  if (this.amenities && Array.isArray(this.amenities)) {
    this.amenities = this.amenities.map((amenity) =>
      amenity.replace(/\s/g, "_").toUpperCase()
    );
  }
  next();
});

PropertySchema.pre("save", function (next) {
  if (this.category === "PLOT") {
    this.set("bedrooms", undefined);
    this.set("bathrooms", undefined);
    this.set("livingrooms", undefined);
    this.set("kitchen", undefined);
    this.set("balconies", undefined);
    this.set("floor_number", undefined);
  }
  next();
});

const PropertyModel =
  mongoose.models.Property || mongoose.model("Property", PropertySchema);

export default PropertyModel;
