import { Cities } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getCities = asyncHandler((req, res, next) => {
  if (!Cities || Object.keys(Cities).length === 0) {
    return next(new Error("No cities found", { cause: 404 }));
  }

  const data = Object.entries(Cities).map(([key, value]) => ({
    key,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  return successResponse({
    res,
    status: 200,
    message: "Cities retrieved successfully",
    data,
  });
});

export default getCities;
