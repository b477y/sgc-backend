import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getServiceProviderById = asyncHandler(async (req, res, next) => {
  const { serviceProviderId } = req.params;
  const serviceProvider = await ServiceProviderModel.findById(serviceProviderId)
    .populate({
      path: "serviceCategory",
      select: "name -_id",
    })
    .lean(); // Converts Mongoose documents to plain JavaScript objects

  if (!serviceProvider) {
    return next(new Error("Service provider not found", { cause: 404 }));
  }

  const transformedProvider = {
    ...serviceProvider,
    serviceCategory: serviceProvider.serviceCategory?.name || null,
    images: serviceProvider.images?.map((img) => img.secure_url) || [],
    logo: serviceProvider.logo?.secure_url || null,
  };

  return successResponse({
    res,
    status: 200,
    message: "Service provider retrieved successfully",
    data: { serviceProvider: transformedProvider },
  });
});

export default getServiceProviderById;
