import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import { Countries, Cities } from "../../../utils/enum/enums.js";

const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  try {
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    // Retrieve all service providers
    const serviceProviders = await ServiceProviderModel.find()
      .populate({
        path: "serviceCategory",
        select: `name.${lang} -_id`, // Dynamically select based on language
      })
      .lean();

    if (!serviceProviders.length) {
      return next(
        new Error(
          lang === "ar" ? "لا توجد مزودي خدمة" : "There are no service providers",
          { cause: 404 }
        )
      );
    }

    const transformedProviders = serviceProviders.map((provider) => ({
      ...provider,
      serviceCategory: provider.serviceCategory?.name || null,
      images: provider.images?.map((img) => img.secure_url) || [],
      logo: provider.logo?.secure_url || null,
      city: Cities[provider.city]?.[lang] || provider.city,
      country: Countries[provider.country]?.[lang] || provider.country,
    }));

    return successResponse({
      res,
      status: 200,
      message:
        lang === "ar"
          ? "تم استرجاع مزودي الخدمة بنجاح"
          : "Service providers retrieved successfully",
      data: { serviceProviders: transformedProviders },
    });
  } catch (error) {
    next(error);
  }
});

export default getAllServiceProviders;
