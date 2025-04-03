import UserModel from "../../../db/models/User.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import {
  Currency,
  Countries,
  Cities,
  PropertyPurpose,
  FurnishedStatus,
} from "../../../utils/enum/enums.js";
import RequestedPropertyModel from "../../../db/models/RequestedProperty.model.js";
import CategoryModel from "../../../db/models/Category.model.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return next(
      new Error(language === "ar" ? "المستخدم غير موجود" : "User not found", {
        cause: 404,
      })
    );
  }

  const responseMessage =
    language === "ar"
      ? "تم استرجاع الملف الشخصي بنجاح"
      : "Profile retrieved successfully";

  successResponse({
    res,
    status: 200,
    message: responseMessage,
    data: {
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        language: Languages[user.language]?.[language] || user.language,
        currency: Currency[user.currency]?.[language] || user.currency,
        likedProperties: user.likedProperties,
        agency: user.agency,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

export const getLikedProperties = asyncHandler(async (req, res, next) => {
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const user = await UserModel.findById(req.user._id)
    .populate("likedProperties")
    .lean();

  if (!user) {
    return next(
      new Error(language === "ar" ? "المستخدم غير موجود" : "User not found", {
        cause: 404,
      })
    );
  }

  const localizedProperties = user.likedProperties.map((property) => ({
    _id: property._id,
    title: property.title,
    description: property.description,
    price: property.price,
    price_currency:
      Currency[property.price_currency]?.[language] || property.price_currency,
    country: Countries[property.country]?.[language] || property.country,
    city: Cities[property.city]?.[language] || property.city,
    purpose: PropertyPurpose[property.purpose]?.[language] || property.purpose,
    furnished:
      FurnishedStatus[property.furnished]?.[language] || property.furnished,
    image: property.images?.[0]?.secure_url || null,
    createdAt: property.createdAt,
  }));

  successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع العقارات المفضلة بنجاح"
        : "Liked properties retrieved successfully",
    data: { likedProperties: localizedProperties },
  });
});

export const getRequestedProperties = asyncHandler(async (req, res, next) => {
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  // Fetch the requested properties for the user
  const userRequestedProperties = await RequestedPropertyModel.find({
    createdBy: req.user._id,
  }).lean();

  if (!userRequestedProperties || userRequestedProperties.length === 0) {
    return next(
      new Error(
        language === "ar"
          ? "لا توجد عقارات مطلوبة"
          : "No requested properties found",
        {
          cause: 404,
        }
      )
    );
  }

  const categories = await CategoryModel.find().lean();

  const getLocalizedCategory = (categoryKey) => {
    const category = categories.find((cat) => cat.categoryName === categoryKey);
    if (!category) return categoryKey;
    return category.label[language] || category.label.en;
  };

  const getLocalizedType = (categoryKey, typeKey) => {
    const category = categories.find((cat) => cat.categoryName === categoryKey);
    if (category) {
      const subcategory = category.subcategories.find(
        (sub) => sub.key === typeKey
      );
      if (subcategory) {
        return subcategory.label[language] || subcategory.label.en;
      }
    }
    return typeKey;
  };

  const localizedProperties = userRequestedProperties.map((property) => ({
    _id: property._id,
    title: property.title,
    description: property.description,
    price: property.price,
    price_currency:
      Currency[property.price_currency]?.[language] || property.price_currency,
    country: Countries[property.country]?.[language] || property.country,
    city: Cities[property.city]?.[language] || property.city,
    purpose: PropertyPurpose[property.purpose]?.[language] || property.purpose,
    furnished:
      FurnishedStatus[property.furnished]?.[language] || property.furnished,
    createdAt: property.createdAt,
    category: getLocalizedCategory(property.category),
    type: getLocalizedType(property.category, property.type),
  }));

  successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع العقارات المطلوبة بنجاح"
        : "Requested properties retrieved successfully",
    data: { requestedProperties: localizedProperties },
  });
});
