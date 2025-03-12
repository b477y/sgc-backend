import { Categories } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getCategories = asyncHandler((req, res, next) => {
  if (!Categories || Object.keys(Categories).length === 0) {
    return next(new Error("No categories found", { cause: 404 }));
  }

  const data = Object.entries(Categories).map(([key, category]) => ({
    key,
    label: category.label,
    subcategories: Object.entries(category.options).map(([subKey, subLabel]) => ({
      key: subKey,
      label: subLabel,
    })),
  }));

  return successResponse({
    res,
    status: 200,
    message: "Categories retrieved successfully",
    data,
  });
});

export default getCategories;
