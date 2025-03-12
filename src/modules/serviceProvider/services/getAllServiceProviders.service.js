import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  const serviceProviders = await ServiceProviderModel.find()
    .populate({
      path: "serviceCategory",
      select: "name -_id",
    })
    .lean(); // Converts Mongoose documents to plain JavaScript objects

  if (!serviceProviders.length) {
    return next(new Error("There are no service providers", { cause: 404 }));
  }

  // Transform serviceProviders to return serviceCategory as a string
  const transformedProviders = serviceProviders.map((provider) => ({
    ...provider,
    serviceCategory: provider.serviceCategory?.name || null, // Extract the name directly
  }));

  return successResponse({
    res,
    status: 200,
    message: "Service providers retrieved successfully",
    data: { serviceProviders: transformedProviders },
  });
});

export default getAllServiceProviders;
