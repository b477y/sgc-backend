import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";

// Utility function to transform input to enum-compatible format
const transformToEnumFormat = (value) =>
  value.trim().replace(/\s+/g, "_").toUpperCase();

const addProperty = asyncHandler(async (req, res, next) => {
  const data = req.body;
  let images = [];

  // Extract input fields
  const {
    title,
    description,
    price,
    bedrooms,
    livingrooms,
    kitchen,
    balconies,
    floor_number,
    monthly_service,
    area,
    contact,
    ...fields
  } = data;

  const transformedData = {};

  // List of fields to exclude from transformation
  const excludeFromTransformation = ["title", "description"];

  // Convert string values to ENUM format except excluded fields
  Object.keys(fields).forEach((key) => {
    if (
      typeof fields[key] === "string" &&
      !excludeFromTransformation.includes(key)
    ) {
      transformedData[key] = transformToEnumFormat(fields[key]);
    } else if (Array.isArray(fields[key])) {
      transformedData[key] = fields[key].map((item) =>
        typeof item === "string" ? transformToEnumFormat(item) : item
      );
    } else {
      transformedData[key] = fields[key];
    }
  });

  // Preserve title, description, and numeric fields as they are
  transformedData.title = title;
  transformedData.description = description;
  transformedData.price = price;
  transformedData.bedrooms = bedrooms;
  transformedData.livingrooms = livingrooms;
  transformedData.kitchen = kitchen;
  transformedData.balconies = balconies;
  transformedData.floor_number = floor_number;
  transformedData.monthly_service = monthly_service;
  transformedData.area = area;
  transformedData.contact = contact;

  // Check for existing property with the same title and address
  const existingProperty = await PropertyModel.findOne({
    title: data.title,
    address: data.address,
  });

  if (existingProperty) {
    return next(
      new Error(
        "A property with this title and address already exists. Please modify the details or check your listings.",
        { cause: 400 }
      )
    );
  }

  try {
    // Process multiple images in parallel (if they exist)
    if (req.files?.images?.length > 0) {
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

export default addProperty;
