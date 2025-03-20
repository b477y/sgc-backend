import { RealEstateSituation } from "../../../utils/enum/enums.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const getRealEstateSituations = asyncHandler((req, res, next) => {
  if (!RealEstateSituation || Object.keys(RealEstateSituation).length === 0) {
    return next(new Error("No real estate situations found", { cause: 404 }));
  }

  const data = Object.entries(RealEstateSituation).map(([key, value]) => ({
    key,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  return successResponse({
    res,
    status: 200,
    message: "Real Estate situations retrieved successfully",
    data,
  });
});

export default getRealEstateSituations;
