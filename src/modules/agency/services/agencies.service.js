import AgencyModel from "../../../db/models/Agency.model.js";
import PropertyModel from "../../../db/models/Property.model.js";
import CategoryModel from "../../../db/models/Category.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import paginate from "../../../utils/pagination/pagination.js";
import UserModel from "../../../db/models/User.model.js";
import { UserRole } from "../../../utils/enum/enums.js";
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

export const getAgencyProperties = asyncHandler(async (req, res, next) => {
  const { agencyId } = req.params;
  const { city, purpose, type, furnished, sort, page, limit } = req.query;
  const language = req.headers["accept-language"]?.split(",")[0] || "en";

  const filter = { agency: agencyId };

  const agencyExists = await AgencyModel.findById(agencyId).lean();
  if (!agencyExists) {
    return next(
      new Error(language === "ar" ? "الوكالة غير موجودة" : "Agency not found", {
        cause: 404,
      })
    );
  }

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
          ? "لا توجد عقارات لهذه الوكالة"
          : "No properties found for this agency",
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
        ? "تم استرجاع العقارات الخاصة بالوكالة بنجاح"
        : "Agency properties retrieved successfully",
    data: localizedProperties,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const createAgencyWithOwner = asyncHandler(async (req, res, next) => {
  const {
    agencyOwnerName,
    agencyName,
    agencyOwnerEmail,
    agencyEmail,
    password,
    agencyPhone,
    country,
    city,
    description,
  } = req.body;

  const adminId = req.user._id;
  let logo;

  const formattedAgencyName = agencyName.trim();
  const formattedCountry = country.trim().toUpperCase();
  const formattedCity = city.trim().toUpperCase();

  const existingUser = await UserModel.findOne({ email: agencyOwnerEmail });
  if (existingUser) {
    return next(new Error("Email already registered", { cause: 400 }));
  }

  if (req.files?.logo) {
    try {
      const uploadedLogo = await cloud.uploader.upload(req.files.logo[0].path, {
        folder: `${process.env.APP_NAME}/agencies/${formattedAgencyName}/logo`,
      });
      logo = {
        secure_url: uploadedLogo.secure_url,
        public_id: uploadedLogo.public_id,
      };
    } catch (error) {
      return next(new Error("Error uploading logo", { cause: 500 }));
    }
  }

  const newAgency = await AgencyModel.create({
    name: formattedAgencyName,
    email: agencyEmail,
    phone: agencyPhone,
    country: formattedCountry,
    city: formattedCity,
    description,
    logo,
    createdBy: adminId,
  });

  const newAgencyOwner = await UserModel.create({
    name: agencyOwnerName.trim(),
    email: agencyOwnerEmail.toLowerCase(),
    password,
    role: UserRole.AGENCY_OWNER,
    agency: newAgency._id,
  });

  newAgency.owner = newAgencyOwner._id;
  await newAgency.save();

  return successResponse({
    res,
    status: 201,
    message: "Agency owner and agency created successfully",
    data: {
      agencyOwner: {
        id: newAgencyOwner._id,
        name: newAgencyOwner.name,
        email: newAgencyOwner.email,
        role: newAgencyOwner.role,
      },
      agency: newAgency,
    },
  });
});

export const addAgent = asyncHandler(async (req, res, next) => {
  const { agencyId } = req.params;
  const { name, email, password, phone } = req.body;

  const agency = await AgencyModel.findOne({
    _id: agencyId,
    owner: req.user._id,
  });
  if (!agency) {
    return next(new Error("Agency not found", { cause: 404 }));
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return next(new Error("Email already registered", { cause: 400 }));
  }

  const newAgent = await UserModel.create({
    name,
    email,
    password,
    phone,
    role: UserRole.AGENT,
    agency: agency._id,
    createdBy: req.user._id,
  });

  const addAgent = await AgencyModel.findByIdAndUpdate(agency._id, {
    $addToSet: { agents: req.user._id },
  });

  return successResponse({
    res,
    status: 201,
    message: "Agent added successfully",
    data: {
      id: newAgent._id,
      name: newAgent.name,
      email: newAgent.email,
      role: newAgent.role,
      agency: newAgent.agency,
    },
  });
});

export const getAgencies = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const lang = req.headers["accept-language"]?.split(",")[0] || "en";

  const agencies = await AgencyModel.find({})
    .skip(skip)
    .limit(Number(limit))
    .populate("agents", "name")
    .lean();

  if (!agencies.length) {
    return next(
      new Error(lang === "ar" ? "لا توجد وكالات" : "There are no agencies", {
        cause: 404,
      })
    );
  }

  const total = await AgencyModel.countDocuments();

  const formattedAgencies = agencies.map(
    ({ logo, agents, country, city, ...agency }) => ({
      ...agency,
      logo: logo?.secure_url || null,
      country:
        lang === "ar"
          ? Countries[country]?.ar || country
          : Countries[country]?.en || country,
      city: lang === "ar" ? Cities[city]?.ar || city : Cities[city]?.en || city,
      agents: agents.map((agent) => ({
        _id: agent._id,
        name: agent.name,
      })),
    })
  );

  return successResponse({
    res,
    status: 200,
    message:
      lang === "ar"
        ? "تم استرجاع الوكالات بنجاح"
        : "Agencies retrieved successfully",
    data: {
      agencies: formattedAgencies,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAgencyDetails = asyncHandler(async (req, res, next) => {
  const { agencyId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const lang = req.headers["accept-language"]?.split(",")[0] || "en";

  const agency = await AgencyModel.findById(agencyId).lean();

  if (!agency) {
    return next(
      new Error(lang === "ar" ? "الوكالة غير موجودة" : "Agency not found", {
        cause: 404,
      })
    );
  }

  const agencyWithoutOwner = {
    ...agency,
    agents: agency.agents.filter(
      (agentId) => agentId !== agency.owner.toString()
    ),
  };

  const agents = await UserModel.find({
    agency: agencyId,
    role: { $ne: "Agency Owner" },
  })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  if (!agents.length) {
    return next(
      new Error(
        lang === "ar"
          ? "لا توجد وكلاء لهذه الوكالة"
          : "No agents found for this agency",
        { cause: 404 }
      )
    );
  }

  const total = await UserModel.countDocuments({
    agency: agencyId,
    role: { $ne: "Agency Owner" },
  });

  const formattedAgency = {
    ...agencyWithoutOwner,
    logo: agency.logo?.secure_url || null,
    country:
      lang === "ar"
        ? Countries[agency.country]?.ar || agency.country
        : Countries[agency.country]?.en || agency.country,
    city:
      lang === "ar"
        ? Cities[agency.city]?.ar || agency.city
        : Cities[agency.city]?.en || agency.city,
  };

  const formattedAgents = agents.map((agent) => ({
    _id: agent._id,
    name: agent.name,
    role: agent.role,
  }));

  return successResponse({
    res,
    status: 200,
    message:
      lang === "ar"
        ? "تم استرجاع تفاصيل الوكالة بنجاح"
        : "Agency details retrieved successfully",
    data: {
      agency: formattedAgency,
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