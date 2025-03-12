import {
  Cities,
  Categories,
  Currency,
  Orientation,
  RealEstateSituation,
  FurnishedStatus,
  Amenities,
  Countries,
  PropertyPurpose,
} from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

// Function to format labels properly
const formatLabel = (key) => {
  return key
    .toLowerCase() // Convert everything to lowercase
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

// Generate options dynamically
const generateOptions = (obj) =>
  Object.keys(obj).map((key) => ({
    key,
    label: formatLabel(key),
  }));

// Generate number options from 1 to 10
const numberOptions = Array.from({ length: 10 }, (_, i) => ({
  key: (i + 1).toString(),
  label: (i + 1).toString(),
}));

const getResidentialFormData = asyncHandler(async (req, res, next) => {
  if (!Cities || Object.keys(Cities).length === 0) {
    return next(new Error("No cities found", { cause: 404 }));
  }

  const formData = {
    purpose: {
      key: "purpose",
      options: Object.entries(PropertyPurpose).map(([key, label]) => ({
        key,
        label,
      })),
    },
    country: {
      key: "country",
      options: generateOptions(Countries),
    },
    city: {
      key: "city",
      options: generateOptions(Cities),
    },
    category: {
      key: "category",
      options: generateOptions(Categories),
    },
    type: {
      key: "type",
      options: Object.entries(Categories).reduce(
        (acc, [mainKey, mainValue]) => {
          acc[mainKey] = generateOptions(mainValue.options);
          return acc;
        },
        {}
      ),
    },
    title: {
      key: "title",
      label: "Title",
    },
    description: {
      key: "description",
      label: "Description",
    },
    price_currency: {
      key: "price_currency",
      options: generateOptions(Currency),
    },
    price: {
      key: "price",
      label: "Price",
    },
    bedrooms: {
      key: "bedrooms",
      options: numberOptions,
    },
    bathrooms: {
      key: "bathrooms",
      options: numberOptions,
    },
    livingrooms: {
      key: "livingrooms",
      options: numberOptions,
    },
    kitchen: {
      key: "kitchen",
      options: numberOptions,
    },
    balconies: {
      key: "balconies",
      options: numberOptions,
    },
    floor_number: {
      key: "floor_number",
      options: numberOptions,
    },
    orientation: {
      key: "orientation",
      options: generateOptions(Orientation),
    },
    monthly_service_currency: {
      key: "monthly_service_currency",
      options: generateOptions(Currency),
    },
    monthly_service: {
      key: "monthly_service",
      label: "Monthly Service Charge",
    },
    real_estate_situation: {
      key: "real_estate_situation",
      options: generateOptions(RealEstateSituation),
    },
    furnished: {
      key: "furnished",
      options: generateOptions(FurnishedStatus),
    },
    area: {
      key: "area",
      label: "Area (m²)",
    },
    amenities: {
      key: "amenities",
      options: generateOptions(Amenities),
    },
    images: {
      key: "images",
      label: "Property Images",
    },
    contact: {
      key: "contact",
      label: "Contact",
    },
  };

  return successResponse({
    res,
    status: 200,
    message: "Form data retrieved successfully",
    data: { formData },
  });
});

export default getResidentialFormData;
