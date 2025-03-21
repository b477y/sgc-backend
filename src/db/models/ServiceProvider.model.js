import mongoose from "mongoose";
import { Cities, Countries } from "../../utils/enum/enums.js";

const ServiceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    about: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    website: { type: String },
    phone: { type: String, required: true },
    country: {
      type: String,
      required: true,
      enum: Object.keys(Countries),
    },
    city: {
      type: String,
      required: true,
      enum: Object.keys(Cities),
    },
    socialMediaLinks: {
      facebook: { type: String },
      x: { type: String },
      linkedin: { type: String },
    },
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    images: [{ secure_url: String, public_id: String }],
    logo: { secure_url: String, public_id: String },
  },
  { timestamps: true }
);

const ServiceProviderModel =
  mongoose.models.ServiceProvider ||
  mongoose.model("ServiceProvider", ServiceProviderSchema);
export default ServiceProviderModel;
