import AgencyModel from "../../../db/models/Agency.model.js";
import PropertyModel from "../../../db/models/Property.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import paginate from "../../../utils/pagination/pagination.js"; // Import pagination utility
import UserModel from "../../../db/models/User.model.js";
import { UserRole } from "../../../utils/enum/enums.js";

const transformToRegex = (value) => ({
  $regex: `^${value.replace(/\s+/g, "_").toUpperCase()}$`,
  $options: "i",
});

export const getAgencyProperties = asyncHandler(async (req, res, next) => {
  const { agencyId } = req.params;
  const { city, purpose, type, furnished, sort, page, limit } = req.query;
  const filter = { agency: agencyId }; // Ensure properties belong to the given agency

  // Validate agency exists
  const agencyExists = await AgencyModel.findById(agencyId).lean();
  if (!agencyExists) {
    return next(new Error("Agency not found", { cause: 404 }));
  }

  // Define dynamic filters
  const fields = { city, purpose, type, furnished };
  Object.keys(fields).forEach((key) => {
    if (fields[key]) {
      filter[key] = transformToRegex(fields[key]); // Convert input to case-insensitive regex
    }
  });

  // Sorting options
  const sortOptions = {
    newest: { createdAt: -1 },
    highestPrice: { price: -1 },
    lowestPrice: { price: 1 },
  };
  const sortOrder = sortOptions[sort] || {};

  // Fetch paginated properties
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
      new Error("No properties found for this agency", { cause: 404 })
    );
  }

  // Optimize property data (return only essential fields)
  properties.forEach((property) => {
    property.image = property.images?.[0]?.secure_url || null; // Extract first image only
    delete property.images; // Remove full images array
  });

  return successResponse({
    res,
    status: 200,
    message: "Agency properties retrieved successfully",
    data: properties,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// Passing the agent ID in the parameters to retrieve properties created by the specific agent
export const getPropertiesByAgent = asyncHandler(async (req, res, next) => {
  const { agentId } = req.params;
  const {
    city,
    purpose,
    type,
    furnished,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  // Define the base filter for the properties (only properties created by the specific agent)
  let filter = { createdBy: agentId };

  // Define dynamic filters (based on query parameters)
  const fields = { city, purpose, type, furnished };
  Object.keys(fields).forEach((key) => {
    if (fields[key]) {
      filter[key] = transformToRegex(fields[key]); // Convert input to case-insensitive regex
    }
  });

  // Sorting options
  const sortOptions = {
    newest: { createdAt: -1 },
    highestPrice: { price: -1 },
    lowestPrice: { price: 1 },
  };
  const sortOrder = sortOptions[sort] || {};

  // Fetch paginated properties created by the agent, with filters and sorting
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
      new Error("No properties found for this agent", { cause: 404 })
    );
  }

  // Optimize property data (return only essential fields)
  properties.forEach((property) => {
    property.image = property.images?.[0]?.secure_url || null; // Extract first image only
    delete property.images; // Remove full images array
  });

  // Return paginated properties along with metadata
  return successResponse({
    res,
    status: 200,
    message: "Agent properties retrieved successfully",
    data: properties,
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

  // Standardize input values for consistency
  const formattedAgencyName = agencyName.trim();
  const formattedCountry = country.trim().toUpperCase(); // Store as a string
  const formattedCity = city.trim().toUpperCase(); // Store as a string

  // Check if agency owner email is already registered
  const existingUser = await UserModel.findOne({ email: agencyOwnerEmail });
  if (existingUser) {
    return next(new Error("Email already registered", { cause: 400 }));
  }

  // Upload logo if provided
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

  // Create agency first
  const newAgency = await AgencyModel.create({
    name: formattedAgencyName,
    email: agencyEmail,
    phone: agencyPhone,
    country: formattedCountry, // Store as string
    city: formattedCity, // Store as string
    description,
    logo,
    createdBy: adminId, // Admin creating the agency
  });

  // Create agency owner user and associate with agency
  const newAgencyOwner = await UserModel.create({
    name: agencyOwnerName.trim(),
    email: agencyOwnerEmail.toLowerCase(),
    password,
    role: UserRole.AGENCY_OWNER,
    agency: newAgency._id, // Link owner to agency
  });

  // Update agency with owner ID
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

  // Ensure agency exists
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

  // Create agent
  const newAgent = await UserModel.create({
    name,
    email,
    password,
    phone,
    role: UserRole.AGENT,
    agency: agency._id, // Associate agent with the agency
    createdBy: req.user._id, // Agency Owner
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
  const { page = 1, limit = 10 } = req.query; // Pagination
  const skip = (page - 1) * limit;

  const agencies = await AgencyModel.find({})
    .skip(skip)
    .limit(Number(limit))
    .lean();

  if (!agencies.length) {
    return next(new Error("There are no agencies", { cause: 404 }));
  }

  const total = await AgencyModel.countDocuments(); // Total count

  return successResponse({
    res,
    status: 200,
    message: "Agencies retrieved successfully",
    data: {
      agencies,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAgents = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const agents = await UserModel.find({ role: UserRole.AGENT })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("agency", "name")
    .lean();

  if (!agents.length) {
    return next(new Error("No agents found", { cause: 404 }));
  }

  const total = await UserModel.countDocuments({ role: UserRole.AGENT });

  return successResponse({
    res,
    status: 200,
    message: "Agents retrieved successfully",
    data: {
      agents,
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
  const { page = 1, limit = 10 } = req.query; // Pagination for listing agents

  const agency = await AgencyModel.findById(agencyId).lean();

  if (!agency) {
    return next(new Error("Agency not found", { cause: 404 }));
  }

  // Fetch agents that are associated with a specific agency
  const agents = await UserModel.find({ agency: agencyId })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  if (!agents.length) {
    return next(new Error("No agents found for this agency", { cause: 404 }));
  }

  // Get total count for pagination
  const total = await UserModel.countDocuments({ agency: agencyId });

  return successResponse({
    res,
    status: 200,
    message: "Agency details retrieved successfully",
    data: {
      agency,
      agents,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
