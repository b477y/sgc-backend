import { Cities } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getCities = asyncHandler((req, res, next) => {
  const language = req.headers["accept-language"]?.split(",")[0] || "en"; // Default to English if no language is provided

  if (!Cities || Object.keys(Cities).length === 0) {
    return next(new Error("No cities found", { cause: 404 }));
  }

  // Format cities based on selected language
  const data = Object.entries(Cities).map(([key, value]) => ({
    key,
    label: value[language] || value.en, // Default to English if language is missing
  }));

  return successResponse({
    res,
    status: 200,
    message: "Cities retrieved successfully",
    data,
  });
});

export default getCities;
