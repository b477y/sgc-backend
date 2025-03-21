import mongoose from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";
import { Currency, Languages, UserRole } from "../../utils/enum/enums.js";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    language: {
      type: String,
      enum: Object.keys(Languages),
      default: Languages.EN,
    },
    profilePicture: { secure_url: String, public_id: String },
    currency: {
      type: String,
      enum: Object.keys(Currency),
      default: Currency.USD,
    },
    likedProperties: [{ type: mongoose.Types.ObjectId, ref: "Property" }],
    isAgent: {
      type: Boolean,
      default: false,
    },
    agency: {
      type: mongoose.Types.ObjectId,
      ref: "Agency",
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
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

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
