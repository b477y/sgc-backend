import mongoose from "mongoose";

const ServiceProvider = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  About: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: {
    type: String,
    required: true,
  },
  socialMediaLinks: [{ type: String }],
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
  },
  images: [{ secure_url: String, public_id: String }],
  logo: { secure_url: String, public_id: String },
  createdAt: { type: Date, default: Date.now },
});

const ServiceProviderModel =
  mongoose.models.ServiceProvider || mongoose.model("ServiceProvider", ServiceProvider);
export default ServiceProviderModel;
