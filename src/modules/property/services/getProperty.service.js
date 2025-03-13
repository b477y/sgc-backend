import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getProperty = asyncHandler(async (req, res, next) => {
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

export default getProperty;
