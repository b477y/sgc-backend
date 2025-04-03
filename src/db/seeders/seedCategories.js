import mongoose from "mongoose";
import CategoryModel from "../models/Category.model.js";

const categories = [
  {
    categoryName: "RESIDENTIAL",
    label: { en: "Residential", ar: "سكني" },
    subcategories: [
      { key: "APARTMENT", label: { en: "Apartment", ar: "شقة" } },
      { key: "HOUSE", label: { en: "House", ar: "منزل" } },
      { key: "FARM", label: { en: "Farm", ar: "مزرعة" } },
      {
        key: "RESIDENTIAL_BUILDING",
        label: { en: "Residential Building", ar: "مبنى سكني" },
      },
      { key: "TOURISM", label: { en: "Tourism", ar: "سياحة" } },
    ],
  },
  {
    categoryName: "PLOT",
    label: { en: "Plot", ar: "قطعة أرض" },
    subcategories: [
      {
        key: "COMMERCIAL_PLOT",
        label: { en: "Commercial Plot", ar: "قطعة تجارية" },
      },
      {
        key: "INDUSTRIAL_LAND",
        label: { en: "Industrial Land", ar: "أرض صناعية" },
      },
      {
        key: "RESIDENTIAL_PLOT",
        label: { en: "Residential Plot", ar: "قطعة سكنية" },
      },
      {
        key: "AGRICULTURAL_PLOT",
        label: { en: "Agricultural Plot", ar: "أرض زراعية" },
      },
    ],
  },
  {
    categoryName: "COMMERCIAL",
    label: { en: "Commercial", ar: "تجاري" },
    subcategories: [
      { key: "OFFICE", label: { en: "Office", ar: "مكتب" } },
      { key: "SHOP", label: { en: "Shop", ar: "متجر" } },
      { key: "WAREHOUSE", label: { en: "Warehouse", ar: "مستودع" } },
      {
        key: "COMMERCIAL_FLOOR",
        label: { en: "Commercial Floor", ar: "طابق تجاري" },
      },
      {
        key: "COMMERCIAL_BUILDING",
        label: { en: "Commercial Building", ar: "مبنى تجاري" },
      },
      { key: "FACTORY", label: { en: "Factory", ar: "مصنع" } },
      { key: "SHOWROOM", label: { en: "Showroom", ar: "معرض" } },
      { key: "RESTAURANT", label: { en: "Restaurant", ar: "مطعم" } },
      { key: "HOTEL", label: { en: "Hotel", ar: "فندق" } },
      { key: "SCHOOL", label: { en: "School", ar: "مدرسة" } },
      { key: "BEAUTY_SALON", label: { en: "Beauty Salon", ar: "صالون تجميل" } },
    ],
  },
];

async function seedCategories() {
  try {
    console.log("Connecting to database");
    await mongoose.connect("your_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");
    console.log("Deleting existing categories");
    await CategoryModel.deleteMany();

    console.log("Inserting new categories");
    await CategoryModel.insertMany(categories);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

seedCategories();
