import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";

const getServiceProvidersByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.query; // Read category from query params

  let filter = {};

  if (category) {
    // 1️⃣ Find the category document by name
    const categoryDoc = await ServiceCategoryModel.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") }, // Case-insensitive search
    });

    if (!categoryDoc) {
      return next(new Error("Invalid category name", { cause: 404 }));
    }

    // 2️⃣ Filter service providers by category ID
    filter.serviceCategory = categoryDoc._id;
  }

  // 3️⃣ Fetch service providers based on the filter
  const serviceProviders = await ServiceProviderModel.find(filter)
    .populate({
      path: "serviceCategory",
      select: "name -_id",
    })
    .lean();

  // 4️⃣ Transform response to show `serviceCategory` as a string
  const formattedProviders = serviceProviders.map((provider) => ({
    ...provider,
    serviceCategory: provider.serviceCategory?.name || null,
  }));

  if (!formattedProviders.length) {
    return next(
      new Error("No service providers found for this category", { cause: 404 })
    );
  }

  return successResponse({
    res,
    status: 200,
    message: "Service providers retrieved successfully",
    data: { serviceProviders: formattedProviders },
  });
});

export default getServiceProvidersByCategory;
