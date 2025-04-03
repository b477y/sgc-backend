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

const getUserProperties = asyncHandler(async (req, res, next) => {
  const { sort, page, limit } = req.query;
  const language = req.headers["accept-language"]?.split(",")[0] || "en"; // Default to English

  // Sorting mechanism
  const sortOptions = {
    newest: { createdAt: -1 },
    highestPrice: { price: -1 },
    lowestPrice: { price: 1 },
  };
  const sortOrder = sortOptions[sort] || { createdAt: -1 }; // Default to newest

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
    filter: { createdBy: req.user._id },
    sort: sortOrder,
  });

  if (!properties.length) {
    return next(
      new Error(language === "ar" ? "لا توجد عقارات" : "No properties found", {
        cause: 404,
      })
    );
  }

  // Load all categories for localization
  const categories = await CategoryModel.find().lean();

  // Helper functions for localization
  const getLocalizedCategory = (categoryKey) => {
    const category = categories.find((cat) => cat.categoryName === categoryKey);
    if (!category) return categoryKey;
    return language === "ar"
      ? category.label.ar
      : category.label.en || categoryKey;
  };

  const getLocalizedType = (typeKey) => {
    for (const category of categories) {
      const subcategory = category.subcategories.find(
        (sub) => sub.key === typeKey
      );
      if (subcategory) {
        return language === "ar"
          ? subcategory.label.ar
          : subcategory.label.en || typeKey;
      }
    }
    return typeKey;
  };

  // Localize property data
  const localizedProperties = properties.map((property) => {
    const localizedProp = {
      _id: property._id,
      title: property.title,
      description: property.description,
      price: property.price,
      price_currency:
        Currency[property.price_currency]?.[language] ||
        property.price_currency,
      country: Countries[property.country]?.[language] || property.country,
      city: Cities[property.city]?.[language] || property.city,
      category: getLocalizedCategory(property.category),
      type: getLocalizedType(property.type),
      area: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      purpose:
        PropertyPurpose[property.purpose]?.[language] || property.purpose,
      furnished:
        FurnishedStatus[property.furnished]?.[language] || property.furnished,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      image: property.images?.[0]?.secure_url || null,
    };

    // Add additional fields if they exist
    if (property.livingrooms !== undefined)
      localizedProp.livingrooms = property.livingrooms;
    if (property.kitchen !== undefined)
      localizedProp.kitchen = property.kitchen;
    if (property.balconies !== undefined)
      localizedProp.balconies = property.balconies;
    if (property.floor_number !== undefined)
      localizedProp.floor_number = property.floor_number;
    if (property.orientation !== undefined) {
      localizedProp.orientation =
        Orientation[property.orientation]?.[language] || property.orientation;
    }
    if (property.monthly_service !== undefined)
      localizedProp.monthly_service = property.monthly_service;
    if (property.monthly_service_currency !== undefined) {
      localizedProp.monthly_service_currency =
        Currency[property.monthly_service_currency]?.[language] ||
        property.monthly_service_currency;
    }
    if (property.real_estate_situation !== undefined) {
      localizedProp.real_estate_situation =
        RealEstateSituation[property.real_estate_situation]?.[language] ||
        property.real_estate_situation;
    }
    if (property.amenities !== undefined) {
      localizedProp.amenities = property.amenities.map(
        (amenity) => Amenities[amenity]?.[language] || amenity
      );
    }
    if (property.contact !== undefined)
      localizedProp.contact = property.contact;

    return localizedProp;
  });

  return successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع عقاراتك بنجاح"
        : "Your properties retrieved successfully",
    data: localizedProperties,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export default getUserProperties;
