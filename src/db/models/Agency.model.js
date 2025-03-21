import mongoose from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";

const AgencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    properties: [{ type: mongoose.Types.ObjectId, ref: "Property" }],
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
    agents: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    deletedAt: Date,
    logo: { secure_url: String, public_id: String },
  },
  { timestamps: true }
);

AgencySchema.pre("save", async function (next) {
  if (this.isAgent && !this.agency) {
    return next(new Error("Agents must be associated with an agency."));
  }
  if (!this.isAgent && this.agency) {
    return next(
      new Error("Non-agents should not be associated with an agency.")
    );
  }

  if (this.isModified("password")) {
    this.password = await generateHash({ plaintext: this.password });
  }

  next();
});

const AgencyModel =
  mongoose.models.Agency || mongoose.model("Agency", AgencySchema);
export default AgencyModel;
