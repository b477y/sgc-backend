import asyncHandler from "../../../utils/response/error.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";
import successResponse from "../../../utils/response/success.response.js";

const getServiceCategories = asyncHandler(async (req, res, next) => {
  const services = await ServiceCategoryModel.find().select("name");
  return successResponse({
    res,
    status: 200,
    message: "Service categories retrieved successfully",
    data: { services },
  });
});

export default getServiceCategories;
