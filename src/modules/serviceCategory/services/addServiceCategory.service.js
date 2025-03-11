import asyncHandler from "../../../utils/response/error.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";
import successResponse from "../../../utils/response/success.response.js";

const addServiceCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const newServiceCategory = await ServiceCategoryModel.create({ name });
  return successResponse({
    res,
    status: 201,
    message: "New service category added successfully",
    data: { newServiceCategory },
  });
});

export default addServiceCategory;
