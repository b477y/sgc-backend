import mongoose, { Schema, Types, model } from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";
import { Currency, Languages } from "../../utils/enum/enums.js";

export const genderTypes = { male: "Male", female: "Female" };

export const roleTypes = {
  user: "User",
  admin: "Admin",
  superAdmin: "SuperAdmin",
};
export const providerTypes = { google: "Google", system: "System" };

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    language: {
      type: String,
      enum: Object.keys(Languages),
      default: Languages.EN,
    },
    currency: {
      type: String,
      enum: Object.keys(Currency),
      default: Currency.USD,
    },
    likedProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    deletedAt: Date,
    changeCredentialsTime: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next, docs) {
  this.password = await generateHash({ plaintext: this.password });
  next();
});

const UserModel = mongoose.models.User || model("User", UserSchema);
export default UserModel;
