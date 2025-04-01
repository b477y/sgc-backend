import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import CategoryModel from "../../../db/models/Category.model.js";
import { RentalFrequencies, UserRole } from "../../../utils/enum/enums.js";

// Utility function to transform input to case-insensitive ENUM format
const transformToEnumFormat = (value) =>
  value.trim().replace(/\s+/g, "_").toUpperCase();

const addPropertyByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;

  let agencyId = null;

  if (req.user.role === UserRole.AGENT && req.user.agency) {
    agencyId = req.user.agency; // Link property to agency
  }

  let images = [];

  // Fetch category details
  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  const categoryName = category.categoryName.toUpperCase();

  // Validate purpose (must be either RENT or SALE)
  if (!["RENT", "SALE"].includes(req.body.purpose?.toUpperCase())) {
    return next(
      new Error("Invalid purpose. Allowed: RENT, SALE", { cause: 400 })
    );
  }

  const purpose = req.body.purpose.toUpperCase();

  // Validate allowed categories based on purpose
  if (
    purpose === "RENT" &&
    !["RESIDENTIAL", "COMMERCIAL"].includes(categoryName)
  ) {
    return next(
      new Error(
        "Invalid category for RENT. Only RESIDENTIAL and COMMERCIAL are allowed.",
        { cause: 400 }
      )
    );
  }

  if (
    purpose === "SALE" &&
    !["RESIDENTIAL", "COMMERCIAL", "PLOT"].includes(categoryName)
  ) {
    return next(
      new Error(
        "Invalid category for SALE. Only RESIDENTIAL, COMMERCIAL, and PLOT are allowed.",
        { cause: 400 }
      )
    );
  }

  // Validate rental_frequency if purpose is RENT
  if (purpose === "RENT") {
    if (
      !req.body.rental_frequency ||
      !Object.keys(RentalFrequencies).includes(
        req.body.rental_frequency.toUpperCase()
      )
    ) {
      return next(
        new Error(
          "Invalid rental frequency. Allowed: Daily, Weekly, Monthly, Yearly",
          { cause: 400 }
        )
      );
    }
  }

  let subcategoryName = null;
  if (subcategoryId) {
    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return next(new Error("Subcategory not found", { cause: 404 }));
    }
    subcategoryName = subcategory.key;
  }

  const data = req.body;

  // Define allowed fields for each property type
  const allowedFields = {
    RESIDENTIAL: [
      "city",
      "country",
      "purpose",
      "rental_frequency",
      "title",
      "description",
      "price_currency",
      "price",
      "bedrooms",
      "livingrooms",
      "kitchen",
      "bathrooms",
      "balconies",
      "floor_number",
      "monthly_service_currency",
      "monthly_service",
      "real_estate_situation",
      "orientation",
      "area",
      "furnished",
      "amenities",
      "contact",
      "images",
    ],
    COMMERCIAL: [
      "city",
      "country",
      "purpose",
      "rental_frequency",
      "title",
      "description",
      "price_currency",
      "price",
      "bedrooms",
      "livingrooms",
      "kitchen",
      "bathrooms",
      "balconies",
      "floor_number",
      "monthly_service_currency",
      "monthly_service",
      "real_estate_situation",
      "orientation",
      "area",
      "furnished",
      "amenities",
      "contact",
      "images",
    ],
    PLOT: [
      "city",
      "country",
      "purpose",
      "title",
      "description",
      "price_currency",
      "price",
      "orientation",
      "monthly_service_currency",
      "monthly_service",
      "real_estate_situation",
      "furnished",
      "area",
      "amenities",
      "contact",
      "images",
    ],
  };

  if (!allowedFields[categoryName]) {
    return next(new Error("Invalid property category", { cause: 400 }));
  }

  // Filter input data based on allowed fields
  let transformedData = Object.keys(data)
    .filter((key) => allowedFields[categoryName].includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  // Convert string values to ENUM format except excluded fields
  const excludeFromTransformation = ["title", "description"];
  Object.keys(transformedData).forEach((key) => {
    if (
      typeof transformedData[key] === "string" &&
      !excludeFromTransformation.includes(key)
    ) {
      transformedData[key] = transformToEnumFormat(transformedData[key]);
    } else if (Array.isArray(transformedData[key])) {
      transformedData[key] = transformedData[key].map((item) =>
        typeof item === "string" ? transformToEnumFormat(item) : item
      );
    }
  });

  transformedData.category = categoryName;
  transformedData.type = subcategoryName || transformedData.type;

  // Check for existing property with the same title and address
  const existingProperty = await PropertyModel.findOne({
    title: data.title,
    address: data.address,
  });

  if (existingProperty) {
    return next(
      new Error("A property with this title and address already exists.", {
        cause: 400,
      })
    );
  }

  try {
    // Upload images to Cloudinary if provided
    if (req.files?.images?.length) {
      const uploadPromises = req.files.images.map((file) =>
        cloud.uploader.upload(file.path, {
          folder: `${process.env.APP_NAME}/properties/${data.title}/images`,
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);
      images = uploadedImages.map(({ secure_url, public_id }) => ({
        secure_url,
        public_id,
      }));
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error uploading files", stack: error.message });
  }

  // Create new property with transformed data
  const newProperty = await PropertyModel.create({
    ...transformedData,
    createdBy: req.user._id,
    agency: agencyId,
    images,
  });

  if (!newProperty) {
    return next(
      new Error("An error occurred while adding the new property", {
        cause: 400,
      })
    );
  }

  return successResponse({
    res,
    status: 201,
    message: "Property added successfully",
    data: newProperty,
  });
});

export default addPropertyByCategory;
