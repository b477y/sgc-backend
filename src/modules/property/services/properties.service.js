import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

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
