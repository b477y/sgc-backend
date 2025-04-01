import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import CategoryModel from "../../../db/models/Category.model.js";
import paginate from "../../../utils/pagination/pagination.js";

const transformToRegex = (value) => ({
  $regex: `^${value.replace(/\s+/g, "_").toUpperCase()}$`,
  $options: "i",
});

const getProperties = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const { city, purpose, type, furnished, sort, page, limit } = req.query;
  const filter = {};

  let categoryName = null;
  let subcategoryName = null;

  if (categoryId) {
    const category = await CategoryModel.findById(categoryId).lean();
    if (!category) {
      return next(new Error("Category not found", { cause: 404 }));
    }

    categoryName = category.categoryName;

    if (subcategoryId) {
      const subcategory = category.subcategories.find(
        (sub) => sub._id.toString() === subcategoryId
      );
      subcategoryName = subcategory ? subcategory.key : null;
    }
  }

  const fields = { city, purpose, type, furnished };
  if (categoryName) fields.category = categoryName;
  if (subcategoryName) fields.type = subcategoryName;

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

  // Fetch properties with pagination
  const {
    data: properties,
    page: currentPage,
    limit: pageSize,
    total,
  } = await paginate({
    page,
    limit,
    model: PropertyModel, // Pass the model (not an executed query!)
    filter,
    sort: sortOrder,
  });

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
    message: "Properties retrieved successfully",
    data: properties,
    meta: {
      page: currentPage,
      limit: pageSize,
      total, // Include total count
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export default getProperties;
