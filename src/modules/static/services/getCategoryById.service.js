import CategoryModel from "../../../db/models/Category.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const language = req.headers['accept-language']?.split(',')[0] || 'en';

  const category = await CategoryModel.findById(categoryId);

  if (!category) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  // Format response based on selected language
  const data = {
    _id: category._id, // Include the category ID
    categoryName: category.categoryName,
    label: category.label[language] || category.label.en, // Default to English if missing
    subcategories: category.subcategories.map(sub => ({
      _id: sub._id, // Include the subcategory ID
      key: sub.key,
      label: sub.label[language] || sub.label.en, // Default to English if missing
    })),
  };

  return successResponse({
    res,
    status: 200,
    message: "Category retrieved successfully",
    data,
  });
});

export default getCategoryById;

