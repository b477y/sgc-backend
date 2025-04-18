import PropertyModel from "../../../db/models/Property.model.js";
import CategoryModel from "../../../db/models/Category.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import paginate from "../../../utils/pagination/pagination.js";
import UserModel from "../../../db/models/User.model.js";
import { Languages, UserRole } from "../../../utils/enum/enums.js";
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

export const getPropertiesByAgent = asyncHandler(async (req, res, next) => {
  const { agentId } = req.body;
  const {
    city,
    purpose,
    type,
    furnished,
    sort,
    page = 1,
    limit = 10,
  } = req.query;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  let filter = { createdBy: agentId };

  const categories = await CategoryModel.find().lean();

  const fields = { city, purpose, type, furnished };
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
      new Error(
        language === "ar"
          ? "لا توجد عقارات لهذا الوكيل"
          : "No properties found for this agent",
        { cause: 404 }
      )
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
    createdBy: property.createdBy,
    contact: property.contact,
    agency: property.agency,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    image: property.images?.[0]?.secure_url || null,
  }));

  return successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع العقارات الخاصة بالوكيل بنجاح"
        : "Agent properties retrieved successfully",
    data: localizedProperties,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const getAgents = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const lang = req.headers["accept-language"]?.split(",")[0] || "en";

  const agents = await UserModel.find({ role: UserRole.AGENT })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("agency", "name")
    .lean();

  if (!agents.length) {
    return next(
      new Error(lang === "ar" ? "لا توجد وكلاء" : "No agents found", {
        cause: 404,
      })
    );
  }

  const formattedAgents = agents.map((agent) => ({
    _id: agent._id,
    name: agent.name,
    email: agent.email,
    profilePicture: agent.profilePicture,
    agency: {
      _id: agent.agency._id,
      name: agent.agency.name,
    },
  }));

  const total = await UserModel.countDocuments({ role: UserRole.AGENT });

  return successResponse({
    res,
    status: 200,
    message:
      lang === "ar"
        ? "تم استرجاع الوكلاء بنجاح"
        : "Agents retrieved successfully",
    data: {
      agents: formattedAgents,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAgentProfile = asyncHandler(async (req, res, next) => {
  const { agentId } = req.body;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const agentProfile = await UserModel.findById(agentId).lean();

  if (!agentProfile) {
    return next(
      new Error(
        language === "ar" ? "الوكيل غير موجود" : "Agent not found",
        { cause: 404 }
      )
    );
  }

  const categories = await CategoryModel.find().lean();

  let filter = { createdBy: agentId };
  const { city, purpose, type, furnished, sort, page = 1, limit = 10 } = req.query;

  const fields = { city, purpose, type, furnished };
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

  const { data: properties, total, page: currentPage, limit: pageSize } = await paginate({
    page,
    limit,
    model: PropertyModel,
    filter,
    sort: sortOrder,
  });

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
    createdBy: property.createdBy,
    contact: property.contact,
    agency: property.agency,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    image: property.images?.[0]?.secure_url || null,
  }));

  return successResponse({
    res,
    status: 200,
    message:
      language === "ar"
        ? "تم استرجاع بيانات الوكيل والعقارات بنجاح"
        : "Agent profile and properties retrieved successfully",
    data: {
      profile: {
        _id: agentProfile._id,
        name: agentProfile.name,
        email: agentProfile.email,
        profilePicture: agentProfile.profilePicture,
        language: Languages[agentProfile.language]?.[language] || agentProfile.language,
        currency: Currency[agentProfile.currency]?.[language] || agentProfile.currency,
        agency: agentProfile.agency,
        role: agentProfile.role,
        createdAt: agentProfile.createdAt,
        updatedAt: agentProfile.updatedAt,
      },
      properties: localizedProperties,
      meta: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  });
});
