import {
  Amenities,
  Cities,
  RealEstateSituation,
} from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import CategoryModel from "../../../db/models/Category.model.js";

export const getRealEstateSituations = asyncHandler(async (req, res, next) => {
  try {
    const language = req.headers["accept-language"]?.split(",")[0] || "en";

    if (!RealEstateSituation || Object.keys(RealEstateSituation).length === 0) {
      return next(new Error("No real estate situations found", { cause: 404 }));
    }

    const data = Object.entries(RealEstateSituation).map(([key, value]) => {
      const label = value[language] || value["en"];
      return {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
    });

    return successResponse({
      res,
      status: 200,
      message: "Real Estate situations retrieved successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
});

export const getCities = asyncHandler((req, res, next) => {
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  if (!Cities || Object.keys(Cities).length === 0) {
    return next(new Error("No cities found", { cause: 404 }));
  }

  const data = Object.entries(Cities).map(([key, value]) => ({
    key,
    label: value[language] || value.en,
  }));

  return successResponse({
    res,
    status: 200,
    message: "Cities retrieved successfully",
    data,
  });
});

export const getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const category = await CategoryModel.findById(categoryId);

  if (!category) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  const data = {
    _id: category._id,
    categoryName: category.categoryName,
    label: category.label[language] || category.label.en,
    subcategories: category.subcategories.map((sub) => ({
      _id: sub._id,
      key: sub.key,
      label: sub.label[language] || sub.label.en,
    })),
  };

  return successResponse({
    res,
    status: 200,
    message: "Category retrieved successfully",
    data,
  });
});

export const getCategories = asyncHandler(async (req, res, next) => {
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const categories = await CategoryModel.find();

  if (!categories.length) {
    return next(new Error("No categories found", { cause: 404 }));
  }

  const data = categories.map((category) => ({
    _id: category._id,
    categoryName: category.categoryName,
    label: category.label[language] || category.label.en,
    subcategories: category.subcategories.map((sub) => ({
      _id: sub._id,
      key: sub.key,
      label: sub.label[language] || sub.label.en,
    })),
  }));

  return successResponse({
    res,
    status: 200,
    message: "Categories & subcategories retrieved successfully",
    data,
  });
});

export const getAmenities = asyncHandler(async (req, res, next) => {
  try {
    const language = req.headers["accept-language"]?.split(",")[0] || "en";

    if (!Amenities || Object.keys(Amenities).length === 0) {
      return next(new Error("No amenities found", { cause: 404 }));
    }

    const data = Object.entries(Amenities).map(([key, value]) => {
      const label = value[language] || value["en"];
      return {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
    });

    return successResponse({
      res,
      status: 200,
      message: "Amenities retrieved successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
});
