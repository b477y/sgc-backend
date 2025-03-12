import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getProperties = asyncHandler(async (req, res, next) => {
  const properties = await PropertyModel.find({});

  if (!properties.length) {
    return next(new Error("No properties found.", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Properties retrieved successfully",
    data: { properties },
  });
});

export default getProperties;
