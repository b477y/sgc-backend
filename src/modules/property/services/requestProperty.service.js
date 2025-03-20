import asyncHandler from "../../../utils/response/error.response.js";
import RequestedPropertyModel from "../../../db/models/RequestedProperty.model.js";
import successResponse from "../../../utils/response/success.response.js";
import { Categories } from "../../../utils/enum/enums.js"; // Import categories

// Utility function to transform input to uppercase with underscores
const transformToEnumFormat = (value) =>
  value?.trim().replace(/\s+/g, "_").toUpperCase();

// Find a valid subcategory that matches the input type
const findValidSubcategory = (category, type) => {
  if (!category || !type) return type;
  const availableTypes = Categories[category]?.options || {}; // Get valid subcategories
  return Object.keys(availableTypes).find(
    (key) => key.toLowerCase() === type.toLowerCase()
  ) || type; // Return matched type or keep original
};

const requestProperty = asyncHandler(async (req, res, next) => {
  const data = req.body;

  // Normalize category first before using it to find valid subcategories
  const normalizedCategory = transformToEnumFormat(data.category);
  const normalizedType = findValidSubcategory(normalizedCategory, data.type);

  const transformedData = {
    wanted_for: transformToEnumFormat(data.wanted_for),
    country: transformToEnumFormat(data.country),
    city: transformToEnumFormat(data.city),
    category: normalizedCategory, // Normalized category
    type: normalizedType, // Use matched type instead of blindly uppercasing
    installments_available: data.installments_available,
    specific_requirements: data.specific_requirements?.trim(),
    price_range: {
      min: data.price_range?.min,
      max: data.price_range?.max,
      currency: transformToEnumFormat(data.price_range?.currency),
    },
  };

  // Create and save requested property
  const requestedProperty = await RequestedPropertyModel.create(
    transformedData
  );

  return successResponse({
    res,
    status: 201,
    message: "Property requested successfully",
    data: requestedProperty,
  });
});

export default requestProperty;
