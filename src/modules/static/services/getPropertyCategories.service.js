import { Categories } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getPropertyCategories = asyncHandler((req, res, next) => {
  const categories = Object.entries(Categories).map(([main, subs]) => ({
    key: main,
    label: main.charAt(0).toUpperCase() + main.slice(1),
    subcategories: Object.entries(subs).map(([key, value]) => ({
      key,
      label: value,
    })),
  }));

  if (!categories.length) {
    return next(new Error("No categories found", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Categories & types retrieved successfully",
    data: categories,
  });
});

export default getPropertyCategories;
