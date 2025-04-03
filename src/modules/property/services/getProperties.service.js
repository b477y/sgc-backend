import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import CategoryModel from "../../../db/models/Category.model.js";
import paginate from "../../../utils/pagination/pagination.js";
import {
  PropertyPurpose,
  FurnishedStatus,
  Orientation,
  Currency,
  Countries,
  Cities,
  Amenities,
  RealEstateSituation,
} from "../../../utils/enum/enums.js";

const transformToRegex = (value) => ({
  $regex: `^${value.replace(/\s+/g, "_").toUpperCase()}$`,
  $options: "i",
});

const getProperties = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const { city, purpose, type, furnished, sort, page, limit } = req.query;
  const language = req.headers["accept-language"]?.split(",")[0] || "en"; // Default to English
  const filter = {};

  let categoryName = null;
  let subcategoryName = null;

  // Load all categories for localization
  const categories = await CategoryModel.find().lean();

  if (categoryId) {
    const category = categories.find(
      (cat) => cat._id.toString() === categoryId
    );
    if (!category) {
      return next(
        new Error(
          language === "ar" ? "الفئة غير موجودة" : "Category not found",
          { cause: 404 }
        )
      );
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
    model: PropertyModel,
    filter,
    sort: sortOrder,
  });

  if (!properties.length) {
    return next(
      new Error(language === "ar" ? "لا توجد عقارات" : "No properties found", {
        cause: 404,
      })
    );
  }

  // Helper functions for localization
  const getLocalizedCategory = (categoryKey) => {
    const category = categories.find((cat) => cat.categoryName === categoryKey);
    return category ? category.label[language] : categoryKey;
  };

  const getLocalizedType = (typeKey) => {
    const category = categories.find((cat) =>
      cat.subcategories.some((sub) => sub.key === typeKey)
    );
    const subcategory = category?.subcategories.find(
      (sub) => sub.key === typeKey
    );
    return subcategory ? subcategory.label[language] : typeKey;
  };

  // Localize property data
  const localizedProperties = properties.map((property) => ({
    _id: property._id,
    purpose:
      language === "ar"
        ? PropertyPurpose[property.purpose]?.ar
        : PropertyPurpose[property.purpose]?.en,
    country:
      language === "ar"
        ? Countries[property.country]?.ar
        : Countries[property.country]?.en,
    city:
      language === "ar" ? Cities[property.city]?.ar : Cities[property.city]?.en,
    category: getLocalizedCategory(property.category),
    type: getLocalizedType(property.type),
    title: property.title,
    description: property.description,
    price_currency:
      language === "ar"
        ? Currency[property.price_currency]?.ar
        : property.price_currency,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    livingrooms: property.livingrooms,
    kitchen: property.kitchen,
    balconies: property.balconies,
    floor_number: property.floor_number,
    orientation:
      language === "ar"
        ? Orientation[property.orientation]?.ar
        : Orientation[property.orientation]?.en,
    monthly_service_currency:
      language === "ar"
        ? Currency[property.monthly_service_currency]?.ar
        : property.monthly_service_currency,
    monthly_service: property.monthly_service,
    real_estate_situation:
      language === "ar"
        ? RealEstateSituation[property.real_estate_situation]?.ar ||
          property.real_estate_situation
        : RealEstateSituation[property.real_estate_situation]?.en ||
          property.real_estate_situation,
    furnished:
      language === "ar"
        ? FurnishedStatus[property.furnished]?.ar
        : FurnishedStatus[property.furnished]?.en,
    area: property.area,
    amenities: property.amenities.map((amenity) =>
      language === "ar" ? Amenities[amenity]?.ar : Amenities[amenity]?.en
    ),
    contact: property.contact,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    image: property.images?.[0]?.secure_url || null,
  }));

  return successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع العقارات بنجاح"
        : "Properties retrieved successfully",
    data: localizedProperties,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export default getProperties;
