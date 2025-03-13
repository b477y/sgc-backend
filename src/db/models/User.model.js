import mongoose, { Schema, Types, model } from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";

export const genderTypes = { male: "Male", female: "Female" };

export const roleTypes = {
  user: "User",
  admin: "Admin",
  superAdmin: "SuperAdmin",
};
export const providerTypes = { google: "Google", system: "System" };

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },
    address: String,
    image: { secure_url: String, public_id: String },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.male,
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    deletedAt: Date,
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    changeCredentialsTime: Date,
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next, docs) {
  this.password = await generateHash({ plaintext: this.password });
  next();
});

const UserModel = mongoose.models.User || model("User", userSchema);
export default UserModel;
