import mongoose from "mongoose";

const ServiceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const ServiceCategoryModel =
  mongoose.models.ServiceCategory ||
  mongoose.model("ServiceCategory", ServiceCategorySchema);
export default ServiceCategoryModel;
