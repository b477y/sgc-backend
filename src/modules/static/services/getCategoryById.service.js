import CategoryModel from "../../../db/models/Category.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await CategoryModel.findById(categoryId);

  return successResponse({
    res,
    status: 200,
    message: "Category retrieved successfully",
    data: category,
  });
});

export default getCategoryById;
