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
    properties: [{ type: mongoose.Types.ObjectId, ref: "Property" }],
    likedProperties: [{ type: mongoose.Types.ObjectId, ref: "Property" }],
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      default: undefined,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (
    (this.role === UserRole.AGENT || this.role === UserRole.AGENCY_OWNER) &&
    !this.agency
  ) {
    return next(new Error(`${this.role} must be associated with an agency.`));
  }

  if (this.role === UserRole.USER && this.agency) {
    return next(
      new Error("Regular users cannot be associated with an agency.")
    );
  }

  if (
    ![UserRole.AGENT, UserRole.AGENCY_OWNER].includes(this.role) &&
    this.agency
  ) {
    return next(
      new Error(
        "Only agents or agency owners can be associated with an agency."
      )
    );
  }

  if (
    [
      UserRole.USER,
      UserRole.AGENT,
      UserRole.AGENCY_OWNER,
      UserRole.ADMIN,
    ].filter((role) => this.role === role).length > 1
  ) {
    return next(new Error("A user cannot have multiple roles simultaneously."));
  }

  if (this.isModified("password")) {
    this.password = await generateHash({ plaintext: this.password });
  }

  next();
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
