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
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    temporaryEmail: {
      type: String,
    },
    temporaryEmailOTP: { type: String },
    confirmEmailOTP: { type: String },
    resetPasswordOTP: String,
    otpCreatedAt: {
      type: Date,
      default: (data) => {
        return data?.provider === providerTypes.google ? undefined : Date.now();
      },
    },
    otpAttempts: {
      type: Number,
      default: (data) => {
        return data?.provider === providerTypes.google ? undefined : 0;
      },
      max: 5,
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
    DOB: Date,
    image: { secure_url: String, public_id: String },
    friends: [{ type: Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Types.ObjectId, ref: "User" }],
    coverImages: [{ secure_url: String, public_id: String }],
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
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    changeCredentialsTime: Date,
    updatedBy: { type: Types.ObjectId, ref: "User" },
    viewers: [
      {
        viewer: { type: Types.ObjectId, ref: "User" },
        time: Date,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next, docs) {
  this.password = await generateHash({ plaintext: this.password });
  next();
});

export const userModel = mongoose.models.User || model("User", userSchema);
