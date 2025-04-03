import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
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
import CategoryModel from "../../../db/models/Category.model.js";

const getProperty = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;
  const language = req.headers["accept-language"]?.split(",")[0] || "en"; // Default to English

  const property = await PropertyModel.findById(propertyId).lean();

  if (!property) {
    return next(
      new Error(language === "ar" ? "العقار غير موجود" : "Property not found", {
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
  const localizedProperty = {
    _id: property._id,
    title: property.title,
    description: property.description,
    price: property.price,
    price_currency:
      Currency[property.price_currency]?.[language] || property.price_currency,
    country: Countries[property.country]?.[language] || property.country,
    city: Cities[property.city]?.[language] || property.city,
    category: getLocalizedCategory(property.category),
    type: getLocalizedType(property.type),
    area: property.area,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    purpose: PropertyPurpose[property.purpose]?.[language] || property.purpose,
    furnished:
      FurnishedStatus[property.furnished]?.[language] || property.furnished,
    createdAt: property.createdAt,
    images: property.images?.map((img) => img.secure_url) || [],
    contact: property.contact,
  };

  // Add optional fields if they exist
  if (property.livingrooms !== undefined)
    localizedProperty.livingrooms = property.livingrooms;
  if (property.kitchen !== undefined)
    localizedProperty.kitchen = property.kitchen;
  if (property.balconies !== undefined)
    localizedProperty.balconies = property.balconies;
  if (property.floor_number !== undefined)
    localizedProperty.floor_number = property.floor_number;
  if (property.orientation !== undefined) {
    localizedProperty.orientation =
      Orientation[property.orientation]?.[language] || property.orientation;
  }
  if (property.monthly_service !== undefined)
    localizedProperty.monthly_service = property.monthly_service;
  if (property.monthly_service_currency !== undefined) {
    localizedProperty.monthly_service_currency =
      Currency[property.monthly_service_currency]?.[language] ||
      property.monthly_service_currency;
  }
  if (property.real_estate_situation !== undefined) {
    localizedProperty.real_estate_situation =
      RealEstateSituation[property.real_estate_situation]?.[language] ||
      property.real_estate_situation;
  }
  if (property.amenities !== undefined) {
    localizedProperty.amenities = property.amenities.map(
      (amenity) => Amenities[amenity]?.[language] || amenity
    );
  }

  return successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع العقار بنجاح"
        : "Property retrieved successfully",
    data: localizedProperty,
  });
});

export default getProperty;
