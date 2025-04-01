import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import RequestedPropertyModel from "../../../db/models/RequestedProperty.model.js";
import { Categories } from "../../../utils/enum/enums.js"; // Import categories

export const getUserProperties = asyncHandler(async (req, res, next) => {
  const properties = await PropertyModel.find({ createdBy: req.user._id })
    .select(
      "purpose country city category type title description price_currency price bedrooms bathrooms livingrooms kitchen balconies floor_number orientation monthly_service_currency monthly_service real_estate_situation furnished area amenities images.secure_url contact createdAt"
    )
    .lean();

  if (!properties.length) {
    return next(new Error("There are no properties", { cause: 404 }));
  }

  // Extract only the first image URL
  properties.forEach((property) => {
    property.image =
      property.images.length > 0 ? property.images[0].secure_url : null;
    delete property.images; // Remove images array if not needed
  });

  return successResponse({
    res,
    status: 200,
    message: "Properties retrieved successfully",
    data: properties,
  });
});

export const getProperty = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;

  const property = await PropertyModel.findById(propertyId)
    .select(
      "purpose country city category type title description price_currency price bedrooms bathrooms livingrooms kitchen balconies floor_number orientation monthly_service_currency monthly_service real_estate_situation furnished area amenities images.secure_url contact createdAt"
    )
    .lean();

  if (!property) {
    return next(new Error("Property not found.", { cause: 404 }));
  }

  // Transform images array to include only secure_url
  property.images = property.images.map((img) => img.secure_url);

  return successResponse({
    res,
    status: 200,
    message: "Property retrieved successfully",
    data: property, // No need to wrap in an extra object
  });
});

const transformToEnumFormat = (value) =>
  value?.trim().replace(/\s+/g, "_").toUpperCase();

const findValidSubcategory = (category, type) => {
  if (!category || !type) return type;
  const availableTypes = Categories[category]?.options || {};
  return (
    Object.keys(availableTypes).find(
      (key) => key.toLowerCase() === type.toLowerCase()
    ) || type
  );
};

export const requestProperty = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const normalizedCategory = transformToEnumFormat(data.category);
  const normalizedType = findValidSubcategory(normalizedCategory, data.type);

  const transformedData = {
    wanted_for: transformToEnumFormat(data.wanted_for),
    country: transformToEnumFormat(data.country),
    city: transformToEnumFormat(data.city),
    category: normalizedCategory,
    type: normalizedType,
    installments_available: data.installments_available,
    specific_requirements: data.specific_requirements?.trim(),
    price_range: {
      min: data.price_range?.min,
      max: data.price_range?.max,
      currency: transformToEnumFormat(data.price_range?.currency),
    },
  };

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
