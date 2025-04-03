import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import { Countries, Cities } from "../../../utils/enum/enums.js";

const getServiceProviderById = asyncHandler(async (req, res, next) => {
  const { serviceProviderId } = req.params;

  const lang = req.headers['accept-language']?.split(',')[0] || "en";

  const serviceProvider = await ServiceProviderModel.findById(serviceProviderId)
    .populate({
      path: "serviceCategory",
      select: "name -_id",
    })
    .lean();

  if (!serviceProvider) {
    return next(new Error("Service provider not found", { cause: 404 }));
  }

  const transformedProvider = {
    ...serviceProvider,
    serviceCategory: serviceProvider.serviceCategory?.name?.[lang] || serviceProvider.serviceCategory?.name?.en || null,
    images: serviceProvider.images?.map((img) => img.secure_url) || [],
    logo: serviceProvider.logo?.secure_url || null,
    city: Cities[serviceProvider.city]?.[lang] || serviceProvider.city,
    country: Countries[serviceProvider.country]?.[lang] || serviceProvider.country,
  };

  return successResponse({
    res,
    status: 200,
    message: lang === "ar" ? "تم استرجاع مزود الخدمة بنجاح" : "Service provider retrieved successfully",
    data: { serviceProvider: transformedProvider },
  });
});

export default getServiceProviderById;
