import mongoose from "mongoose";
import { Cities, Countries } from "../../utils/enum/enums.js";

const AgencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
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
    agents: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    deletedAt: Date,
    logo: { secure_url: String, public_id: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const AgencyModel =
  mongoose.models.Agency || mongoose.model("Agency", AgencySchema);
export default AgencyModel;
