import CategoryModel from "../../../db/models/Category.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getCategories = asyncHandler(async (req, res, next) => {
  // Get the language from the 'Accept-Language' header, default to 'en' if not provided
  const language = req.headers['accept-language']?.split(',')[0] || 'en';

  const categories = await CategoryModel.find();

  if (!categories.length) {
    return next(new Error("No categories found", { cause: 404 }));
  }

  // Map categories to include IDs and correct labels based on the chosen language
  const data = categories.map(category => ({
    _id: category._id, // Include the category ID
    categoryName: category.categoryName,
    label: category.label[language] || category.label.en, // Default to English if language is missing
    subcategories: category.subcategories.map(sub => ({
      _id: sub._id, // Include the subcategory ID
      key: sub.key,
      label: sub.label[language] || sub.label.en, // Default to English if language is missing
    })),
  }));

  return successResponse({
    res,
    status: 200,
    message: "Categories & subcategories retrieved successfully",
    data,
  });
});

export default getCategories;
