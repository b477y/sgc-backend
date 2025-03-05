import { Amenities } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getAmenities = asyncHandler((req, res, next) => {
  if (!Amenities || Object.keys(Amenities).length === 0) {
    return next(new Error("No amenities found", { cause: 404 }));
  }

  const data = Object.entries(Amenities).map(([key, value]) => ({
    key,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  return successResponse({
    res,
    status: 200,
    message: "Amenities retrieved successfully",
    data,
  });
});

export default getAmenities;
