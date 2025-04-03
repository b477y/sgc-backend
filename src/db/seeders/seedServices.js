import mongoose from "mongoose";
import ServiceCategoryModel from "../models/ServiceCategory.model.js";

const services = [
  { name: { en: "Cleaning", ar: "تنظيف" } },
  { name: { en: "Architecture", ar: "الهندسة المعمارية" } },
  { name: { en: "Curtain", ar: "ستارة" } },
  { name: { en: "Moving", ar: "الانتقال" } },
  { name: { en: "Legal", ar: "قانوني" } },
  { name: { en: "Furniture", ar: "الأثاث" } },
  { name: { en: "Paint", ar: "الدهان" } },
  { name: { en: "House Construction", ar: "بناء المنازل" } },
  { name: { en: "Custom Built House", ar: "منزل مخصص" } },
  { name: { en: "Construction", ar: "البناء" } },
  { name: { en: "Air Conditioner", ar: "مكيف الهواء" } },
  { name: { en: "Interior Design", ar: "تصميم داخلي" } },
  { name: { en: "Plumbing", ar: "السباكة" } },
  { name: { en: "Security", ar: "الأمن" } },
  { name: { en: "Internet", ar: "الإنترنت" } },
  { name: { en: "Electronic Appliance", ar: "الأجهزة الإلكترونية" } },
  { name: { en: "Wallpaper", ar: "ورق الجدران" } },
  { name: { en: "Lighting", ar: "الإضاءة" } },
  { name: { en: "External Design", ar: "التصميم الخارجي" } },
  {
    name: { en: "Manufacturing Door And Window", ar: "تصنيع الأبواب والنوافذ" },
  },
  { name: { en: "Central Heating", ar: "التدفئة المركزية" } },
  { name: { en: "Kitchen", ar: "المطبخ" } },
  { name: { en: "Smart Home Automation", ar: "أتمتة المنزل الذكي" } },
  {
    name: {
      en: "Organizing Exhibitions and Conferences",
      ar: "تنظيم المعارض والمؤتمرات",
    },
  },
  { name: { en: "Gas Sector", ar: "قطاع الغاز" } },
  { name: { en: "Building System Product", ar: "منتجات أنظمة البناء" } },
  { name: { en: "Printing and Advertising", ar: "الطباعة والإعلانات" } },
];

async function seedServices() {
  try {
    console.log("Connecting to database");
    await mongoose.connect("your_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");
    console.log("Deleting existing service categories");
    await ServiceCategoryModel.deleteMany();

    console.log("Inserting new service categories");
    await ServiceCategoryModel.insertMany(services);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

seedServices();
