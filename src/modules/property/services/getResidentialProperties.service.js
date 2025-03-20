import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import CategoryModel from "../../../db/models/Category.model.js";

// Utility function to transform input to case-insensitive regex
const transformToRegex = (value) => ({
  $regex: `^${value.replace(/\s+/g, "_").toUpperCase()}$`,
  $options: "i",
});

const getResidentialProperties = asyncHandler(async (req, res, next) => {
  
  const { categoryId, subcategoryId } = req.params;
  const { city, purpose, type, furnished, sort } = req.query;
  const filter = {};
  console.log("🚀 Incoming Params:", req.params);
  console.log("🔹 categoryId Type:", typeof req.params.categoryId);

  // Fetch category details
  const category = await CategoryModel.findById(categoryId).lean();
  if (!category) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  const categoryName = category.categoryName;

  // Find the corresponding subcategory key
  const subcategory = category.subcategories.find(
    (sub) => sub._id.toString() === subcategoryId
  );
  const subcategoryName = subcategory ? subcategory.key : null; // Extract 'key' for filtering

  // Define fields to filter dynamically
  const fields = {
    city,
    purpose,
    type,
    furnished,
    category: categoryName,
    type: subcategoryName,
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key]) {
      filter[key] = transformToRegex(fields[key]);
    }
  });

  // Sorting mechanism
  const sortOptions = {
    newest: { createdAt: -1 },
    highestPrice: { price: -1 },
    lowestPrice: { price: 1 },
  };

  const sortOrder = sortOptions[sort] || {};

  // Fetch properties with filtering & sorting
  const properties = await PropertyModel.find(filter)
    .select(
      "title price_currency price category type country city area bedrooms bathrooms images.secure_url"
    )
    .sort(sortOrder)
    .lean();

  if (!properties.length) {
    return next(new Error("No properties found.", { cause: 404 }));
  }

  // Format images: Extract first image only
  properties.forEach((property) => {
    property.image = property.images?.[0]?.secure_url || null;
    delete property.images; // Remove full images array
  });

  return successResponse({
    res,
    status: 200,
    message: "Residential properties retrieved successfully",
    data: properties,
  });
});

export default getResidentialProperties;
