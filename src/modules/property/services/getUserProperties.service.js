import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getUserProperties = asyncHandler(async (req, res, next) => {
  const properties = await PropertyModel.find({ createdBy: req.user._id })
    .select(
      "title price country city area bedrooms bathrooms images.secure_url"
    )
    .sort(sortOrder)
    .lean();

  if (!properties.length) {
    return next(new Error("No properties found.", { cause: 404 }));
  }

  // for all images
  // properties.forEach((property) => {
  //   property.images = property.images.map((img) => img.secure_url);
  // });

  // return only the first image in the "image" field
  properties.forEach((property) => {
    if (property.images && property.images.length > 0) {
      property.image = property.images[0].secure_url;
    } else {
      property.image = null;
    }
    delete property.images;
  });

  return successResponse({
    res,
    status: 200,
    message: "Properties retrieved successfully",
    data: properties,
  });
});

export default getUserProperties;
