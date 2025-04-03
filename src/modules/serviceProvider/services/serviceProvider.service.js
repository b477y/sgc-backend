import successResponse from "../../../utils/response/success.response.js";
import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { Cities, Countries } from "../../../utils/enum/enums.js";

const transformToEnumFormat = (value) =>
  value.trim().replace(/\s+/g, "_").toUpperCase();

export const getServiceProvidersByCategory = asyncHandler(
  async (req, res, next) => {
    const { category } = req.query;

    let filter = {};

    if (category) {
      const categoryDoc = await ServiceCategoryModel.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });

      if (!categoryDoc) {
        return next(new Error("Invalid category name", { cause: 404 }));
      }

      filter.serviceCategory = categoryDoc._id;
    }

    const serviceProviders = await ServiceProviderModel.find(filter)
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
      ...provider,
      serviceCategory: provider.serviceCategory?.name || null,
      images: provider.images?.map((img) => img.secure_url) || [],
      logo: provider.logo?.secure_url || null,
    }));

    return successResponse({
      res,
      status: 200,
      message: "Service providers retrieved successfully",
      data: { service: category, serviceProviders: formattedProviders },
    });
  }
);

export const getServiceProviderById = asyncHandler(async (req, res, next) => {
  const { serviceProviderId } = req.params;

  const lang = req.headers["accept-language"]?.split(",")[0] || "en";

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
    serviceCategory:
      serviceProvider.serviceCategory?.name?.[lang] ||
      serviceProvider.serviceCategory?.name?.en ||
      null,
    images: serviceProvider.images?.map((img) => img.secure_url) || [],
    logo: serviceProvider.logo?.secure_url || null,
    city: Cities[serviceProvider.city]?.[lang] || serviceProvider.city,
    country:
      Countries[serviceProvider.country]?.[lang] || serviceProvider.country,
  };

  return successResponse({
    res,
    status: 200,
    message:
      lang === "ar"
        ? "تم استرجاع مزود الخدمة بنجاح"
        : "Service provider retrieved successfully",
    data: { serviceProvider: transformedProvider },
  });
});

export const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"]?.split(",")[0] || "en";

    const serviceProviders = await ServiceProviderModel.find()
      .populate({
        path: "serviceCategory",
        select: `name.${lang} -_id`,
      })
      .lean();

    if (!serviceProviders.length) {
      return next(
        new Error(
          lang === "ar"
            ? "لا توجد مزودي خدمة"
            : "There are no service providers",
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

export const addServiceProvider = asyncHandler(async (req, res, next) => {
  const {
    name,
    about,
    email,
    phone,
    city,
    country,
    serviceCategoryName,
    website,
    facebook,
    x,
    linkedin,
  } = req.body;

  const cityNormalized = transformToEnumFormat(city);
  const countryNormalized = transformToEnumFormat(country);

  if (!Object.keys(Countries).includes(countryNormalized)) {
    return res.status(400).json({ message: "Invalid country" });
  }

  if (!Object.keys(Cities).includes(cityNormalized)) {
    return res.status(400).json({ message: "Invalid city" });
  }

  const serviceCategoryNameTrimmed = serviceCategoryName.trim();

  const serviceCategory = await ServiceCategoryModel.findOne({
    $or: [
      {
        "name.en": {
          $regex: new RegExp(`^${serviceCategoryNameTrimmed}$`, "i"),
        },
      },
      {
        "name.ar": {
          $regex: new RegExp(`^${serviceCategoryNameTrimmed}$`, "i"),
        },
      },
    ],
  });

  if (!serviceCategory) {
    return res.status(400).json({ message: "Invalid service category name" });
  }

  let images = [];
  let logo = null;

  try {
    if (req.files.logo && req.files.logo.length > 0) {
      const { secure_url, public_id } = await cloud.uploader.upload(
        req.files.logo[0].path,
        {
          folder: `${process.env.APP_NAME}/serviceProviders/${name}/logo`,
        }
      );
      logo = { secure_url, public_id };
    }

    if (req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map((file) =>
        cloud.uploader.upload(file.path, {
          folder: `${process.env.APP_NAME}/serviceProviders/${name}/images`,
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);
      images = uploadedImages.map(({ secure_url, public_id }) => ({
        secure_url,
        public_id,
      }));
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error uploading files", stack: error.message });
  }

  const socialMediaLinks = {};
  if (facebook) socialMediaLinks.facebook = facebook;
  if (x) socialMediaLinks.x = x;
  if (linkedin) socialMediaLinks.linkedin = linkedin;

  const serviceProvider = await ServiceProviderModel.create({
    name,
    about,
    email,
    phone,
    city: cityNormalized,
    country: countryNormalized,
    serviceCategory: serviceCategory._id,
    images,
    logo,
    website,
    socialMediaLinks,
  });

  return successResponse({
    res,
    status: 201,
    message: "Service provider added successfully",
    data: serviceProvider,
  });
});
