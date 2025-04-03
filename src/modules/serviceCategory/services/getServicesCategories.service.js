import asyncHandler from "../../../utils/response/error.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";
import successResponse from "../../../utils/response/success.response.js";

const getServiceCategories = asyncHandler(async (req, res, next) => {
  try {
    const language = req.headers['accept-language']?.split(',')[0] || 'en';

    const services = await ServiceCategoryModel.find().select(`name.${language}`);

    return successResponse({
      res,
      status: 200,
      message: "Service categories retrieved successfully",
      data: { services },
    });
  } catch (error) {
    next(error);
  }
});

export default getServiceCategories;
