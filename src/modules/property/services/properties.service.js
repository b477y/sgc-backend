import PropertyModel from "../../../db/models/Property.model.js";
import RequestedPropertyModel from "../../../db/models/RequestedProperty.model.js";
import CategoryModel from "../../../db/models/Category.model.js";
import UserModel from "../../../db/models/User.model.js";

import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import paginate from "../../../utils/pagination/pagination.js";

import {
  Categories,
  RentalFrequencies,
  UserRole,
  PropertyPurpose,
  FurnishedStatus,
  Orientation,
  Currency,
  Countries,
  Cities,
  Amenities,
  RealEstateSituation,
} from "../../../utils/enum/enums.js";

const transformToEnumFormat = (value) =>
  value.trim().replace(/\s+/g, "_").toUpperCase();

const findValidSubcategory = (category, type) => {
  if (!category || !type) return type;
  const availableTypes = Categories[category]?.options || {};
  return (
    Object.keys(availableTypes).find(
      (key) => key.toLowerCase() === type.toLowerCase()
    ) || type
  );
};

export const addPropertyByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;

  let agencyId = null;

  const userData = await UserModel.findById(req.user._id);

  if (userData.role === UserRole.AGENT && userData.agency) {
    agencyId = userData.agency;
  }

  let images = [];

  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  const categoryName = category.categoryName.toUpperCase();

  if (!["RENT", "SALE"].includes(req.body.purpose?.toUpperCase())) {
    return next(
      new Error("Invalid purpose. Allowed: RENT, SALE", { cause: 400 })
    );
  }

  const purpose = req.body.purpose.toUpperCase();

  if (
    purpose === "RENT" &&
    !["RESIDENTIAL", "COMMERCIAL"].includes(categoryName)
  ) {
    return next(
      new Error(
        "Invalid category for RENT. Only RESIDENTIAL and COMMERCIAL are allowed.",
        { cause: 400 }
      )
    );
  }

  if (
    purpose === "SALE" &&
    !["RESIDENTIAL", "COMMERCIAL", "PLOT"].includes(categoryName)
  ) {
    return next(
      new Error(
        "Invalid category for SALE. Only RESIDENTIAL, COMMERCIAL, and PLOT are allowed.",
        { cause: 400 }
      )
    );
  }

  if (purpose === "RENT") {
    if (
      !req.body.rental_frequency ||
      !Object.keys(RentalFrequencies).includes(
        req.body.rental_frequency.toUpperCase()
      )
    ) {
      return next(
        new Error(
          "Invalid rental frequency. Allowed: Daily, Weekly, Monthly, Yearly",
          { cause: 400 }
        )
      );
    }
  }

  let subcategoryName = null;
  if (subcategoryId) {
    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return next(new Error("Subcategory not found", { cause: 404 }));
    }
    subcategoryName = subcategory.key;
  }

  const data = req.body;

  const allowedFields = {
    RESIDENTIAL: [
      "city",
      "country",
      "purpose",
      "rental_frequency",
      "title",
      "description",
      "price_currency",
      "price",
      "bedrooms",
      "livingrooms",
      "kitchen",
      "bathrooms",
      "balconies",
      "floor_number",
      "monthly_service_currency",
      "monthly_service",
      "real_estate_situation",
      "orientation",
      "area",
      "furnished",
      "amenities",
      "contact",
      "images",
    ],
    COMMERCIAL: [
      "city",
      "country",
      "purpose",
      "rental_frequency",
      "title",
      "description",
      "price_currency",
      "price",
      "bedrooms",
      "livingrooms",
      "kitchen",
      "bathrooms",
      "balconies",
      "floor_number",
      "monthly_service_currency",
      "monthly_service",
      "real_estate_situation",
      "orientation",
      "area",
      "furnished",
      "amenities",
      "contact",
      "images",
    ],
    PLOT: [
      "city",
      "country",
      "purpose",
      "title",
      "description",
      "price_currency",
      "price",
      "orientation",
      "monthly_service_currency",
      "monthly_service",
      "real_estate_situation",
      "furnished",
      "area",
      "amenities",
      "contact",
      "images",
    ],
  };

  if (!allowedFields[categoryName]) {
    return next(new Error("Invalid property category", { cause: 400 }));
  }

  let transformedData = Object.keys(data)
    .filter((key) => allowedFields[categoryName].includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  const excludeFromTransformation = ["title", "description"];
  Object.keys(transformedData).forEach((key) => {
    if (
      typeof transformedData[key] === "string" &&
      !excludeFromTransformation.includes(key)
    ) {
      transformedData[key] = transformToEnumFormat(transformedData[key]);
    } else if (Array.isArray(transformedData[key])) {
      transformedData[key] = transformedData[key].map((item) =>
        typeof item === "string" ? transformToEnumFormat(item) : item
      );
    }
  });

  transformedData.category = categoryName;
  transformedData.type = subcategoryName || transformedData.type;

  const existingProperty = await PropertyModel.findOne({
    title: data.title,
    address: data.address,
  });

  if (existingProperty) {
    return next(
      new Error("A property with this title and address already exists.", {
        cause: 400,
      })
    );
  }

  try {
    if (req.files?.images?.length) {
      const uploadPromises = req.files.images.map((file) =>
        cloud.uploader.upload(file.path, {
          folder: `${process.env.APP_NAME}/properties/${data.title}/images`,
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);
      images = uploadedImages.map(({ secure_url, public_id }) => ({
        secure_url,
        public_id,
      }));
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error uploading files", stack: error.message });
  }

  const newProperty = await PropertyModel.create({
    ...transformedData,
    createdBy: req.user._id,
    agency: agencyId,
    images,
  });

  if (!newProperty) {
    return next(
      new Error("An error occurred while adding the new property", {
        cause: 400,
      })
    );
  }

  return successResponse({
    res,
    status: 201,
    message: "Property added successfully",
    data: newProperty,
  });
});

export const getProperties = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const { city, purpose, type, furnished, sort, page, limit } = req.query;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";
  const filter = {};

  let categoryName = null;
  let subcategoryName = null;

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

  const sortOptions = {
    newest: { createdAt: -1 },
    highestPrice: { price: -1 },
    lowestPrice: { price: 1 },
  };
  const sortOrder = sortOptions[sort] || {};

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

export const getUserProperties = asyncHandler(async (req, res, next) => {
  const { sort, page, limit } = req.query;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const sortOptions = {
    newest: { createdAt: -1 },
    highestPrice: { price: -1 },
    lowestPrice: { price: 1 },
  };
  const sortOrder = sortOptions[sort] || { createdAt: -1 };

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

  const categories = await CategoryModel.find().lean();

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

export const requestProperty = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const normalizedCategory = transformToEnumFormat(data.category);
  const normalizedType = findValidSubcategory(normalizedCategory, data.type);

  const transformedData = {
    wanted_for: transformToEnumFormat(data.wanted_for),
    country: transformToEnumFormat(data.country),
    city: transformToEnumFormat(data.city),
    category: normalizedCategory,
    type: normalizedType,
    installments_available: data.installments_available,
    specific_requirements: data.specific_requirements?.trim(),
    price_range: {
      min: data.price_range?.min,
      max: data.price_range?.max,
      currency: transformToEnumFormat(data.price_range?.currency),
    },
    createdBy: req.user._id,
  };

  const requestedProperty = await RequestedPropertyModel.create(
    transformedData
  );

  return successResponse({
    res,
    status: 201,
    message: "Property requested successfully",
    data: requestedProperty,
  });
});

export const getProperty = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const property = await PropertyModel.findById(propertyId).lean();

  if (!property) {
    return next(
      new Error(language === "ar" ? "العقار غير موجود" : "Property not found", {
        cause: 404,
      })
    );
  }

  const categories = await CategoryModel.find().lean();

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

export const toggleLike = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user._id;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const user = await UserModel.findById(userId);
  if (!user) {
    return next(
      new Error(language === "ar" ? "المستخدم غير موجود" : "User not found", {
        cause: 404,
      })
    );
  }

  let message;
  if (user.likedProperties.includes(propertyId)) {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { likedProperties: propertyId },
    });
    message =
      language === "ar"
        ? "تم إلغاء الإعجاب بالعقار"
        : "Property unliked successfully";
  } else {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { likedProperties: propertyId },
    });
    message =
      language === "ar" ? "تم الإعجاب بالعقار" : "Property liked successfully";
  }

  return successResponse({
    res,
    status: 200,
    message,
  });
});
