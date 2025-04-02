import { Amenities } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getAmenities = asyncHandler(async (req, res, next) => {
  try {
    const language = req.headers["accept-language"]?.split(",")[0] || "en";

    if (!Amenities || Object.keys(Amenities).length === 0) {
      return next(new Error("No amenities found", { cause: 404 }));
    }

    const data = Object.entries(Amenities).map(([key, value]) => {
      const label = value[language] || value["en"];
      return {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
    });

    return successResponse({
      res,
      status: 200,
      message: "Amenities retrieved successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
});

export default getAmenities;
