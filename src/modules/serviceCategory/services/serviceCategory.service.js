import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";
import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";

export const addServiceCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const newServiceCategory = await ServiceCategoryModel.create({ name });
  return successResponse({
    res,
    status: 201,
    message: "New service category added successfully",
    data: { newServiceCategory },
  });
});

export const getServiceProvidersByCategory = asyncHandler(
  async (req, res, next) => {
    const { serviceId } = req.params;

    const service = await ServiceCategoryModel.findById(serviceId).select(
      "name -_id"
    );

    const serviceProviders = await ServiceProviderModel.find({
      serviceCategory: serviceId,
    })
      .populate({
        path: "serviceCategory",
        select: "name -_id",
      })
      .lean();

    if (!serviceProviders.length) {
      return next(
        new Error("No service providers found for this category", {
          cause: 404,
        })
      );
    }

    const formattedProviders = serviceProviders.map((provider) => ({
      _id: provider._id,
      name: provider.name,
      about: provider.about,
      email: provider.email,
      website: provider.website || null,
      phone: provider.phone,
      city: provider.city,
      socialMediaLinks: provider.socialMediaLinks || {},
      serviceCategory: provider.serviceCategory?.name || null,
      images: provider.images?.map((img) => img.secure_url) || [],
      logo: provider.logo?.secure_url || null,
      createdAt: provider.createdAt,
      __v: provider.__v,
    }));

    return successResponse({
      res,
      status: 200,
      message: "Service providers retrieved successfully",
      data: { service: service.name, serviceProviders: formattedProviders },
    });
  }
);

export const getServiceCategories = asyncHandler(async (req, res, next) => {
  try {
    const language = req.headers["accept-language"]?.split(",")[0] || "en";

    const services = await ServiceCategoryModel.find().select(
      `name.${language}`
    );

    return successResponse({
      res,
      status: 200,
      message: "Service categories retrieved successfully",
      data: { services },
    });
  } catch (error) {
    next(error);
  }
});
