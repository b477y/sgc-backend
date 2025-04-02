import { RealEstateSituation } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getRealEstateSituations = asyncHandler(async (req, res, next) => {
  try {
    // Get the language from the 'Accept-Language' header, default to 'en' if not provided
    const language = req.headers["accept-language"]?.split(",")[0] || "en"; // Using the first language in the header

    // Check if RealEstateSituation is defined and has keys
    if (!RealEstateSituation || Object.keys(RealEstateSituation).length === 0) {
      return next(new Error("No real estate situations found", { cause: 404 }));
    }

    // Map RealEstateSituation to include the correct label based on the chosen language
    const data = Object.entries(RealEstateSituation).map(([key, value]) => {
      const label = value[language] || value["en"]; // Default to 'en' if the chosen language key doesn't exist
      return {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1), // Capitalize the first letter
      };
    });

    // Send success response if everything is fine
    return successResponse({
      res,
      status: 200,
      message: "Real Estate situations retrieved successfully",
      data,
    });
  } catch (error) {
    // Forward any error to the error handling middleware
    return next(error);
  }
});

export default getRealEstateSituations;
