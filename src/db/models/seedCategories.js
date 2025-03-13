import mongoose from "mongoose";
import CategoryModel from "./Category.model.js"; // Adjust path as needed

const categories = [
  {
    categoryName: "RESIDENTIAL",
    label: "Residential",
    subcategories: [
      { key: "APARTMENT", label: "Apartment" },
      { key: "HOUSE", label: "House" },
      { key: "FARM", label: "Farm" },
      { key: "RESIDENTIAL_BUILDING", label: "Residential Building" },
      { key: "TOURISM", label: "Tourism" },
    ],
  },
  {
    categoryName: "PLOT",
    label: "Plot",
    subcategories: [
      { key: "COMMERCIAL_PLOT", label: "Commercial Plot" },
      { key: "INDUSTRIAL_LAND", label: "Industrial Land" },
      { key: "RESIDENTIAL_PLOT", label: "Residential Plot" },
      { key: "AGRICULTURAL_PLOT", label: "Agricultural Plot" },
    ],
  },
  {
    categoryName: "COMMERCIAL",
    label: "Commercial",
    subcategories: [
      { key: "OFFICE", label: "Office" },
      { key: "SHOP", label: "Shop" },
      { key: "WAREHOUSE", label: "Warehouse" },
      { key: "COMMERCIAL_FLOOR", label: "Commercial Floor" },
      { key: "COMMERCIAL_BUILDING", label: "Commercial Building" },
      { key: "FACTORY", label: "Factory" },
      { key: "SHOWROOM", label: "Showroom" },
      { key: "RESTAURANT", label: "Restaurant" },
      { key: "HOTEL", label: "Hotel" },
      { key: "SCHOOL", label: "School" },
      { key: "BEAUTY_SALON", label: "Beauty Salon" },
    ],
  },
];

async function seedCategories() {
  try {
    await mongoose.connect("mongodb+srv://sgcatsyria:JjzTk9BhRWnrKGGg@sgccluster.louc2.mongodb.net/sgc?retryWrites=true&w=majority");

    console.log("🌱 Connected to database...");

    await CategoryModel.deleteMany(); // Clear existing data
    console.log("🗑️ Existing categories removed.");

    await CategoryModel.insertMany(categories); // Insert new categories
    console.log("✅ Categories inserted successfully!");

    mongoose.connection.close(); // Close connection
    console.log("🔌 Disconnected from database.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    mongoose.connection.close();
  }
}

seedCategories();
