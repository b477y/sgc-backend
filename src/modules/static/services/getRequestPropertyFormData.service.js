import {
  Cities,
  Categories,
  Currency,
  Countries,
  PropertyPurpose,
} from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

// Function to format labels properly
const formatLabel = (key) => {
  return key
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Generate options dynamically
const generateOptions = (obj) =>
  Object.keys(obj).map((key) => ({
    key,
    label: formatLabel(key),
  }));

const getRequestPropertyFormData = asyncHandler(async (req, res, next) => {
  if (!Cities || Object.keys(Cities).length === 0) {
    return next(new Error("No cities found", { cause: 404 }));
  }

  const formData = {
    wanted_for: {
      key: "wanted_for",
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
    price_range: {
      key: "price_range",
      fields: {
        min: { key: "min", label: "Minimum Price" },
        max: { key: "max", label: "Maximum Price" },
        currency: {
          key: "currency",
          options: generateOptions(Currency),
        },
      },
    },
    installments_available: {
      key: "installments_available",
      label: "Installments Available",
      options: [
        { key: "true", label: "Yes" },
        { key: "false", label: "No" },
      ],
    },
    specific_requirements: {
      key: "specific_requirements",
      label: "Specific Requirements",
    },
  };

  return successResponse({
    res,
    status: 200,
    message: "Form data retrieved successfully",
    data: { formData },
  });
});

export default getRequestPropertyFormData;
