import asyncHandler from "../../../utils/response/error.response.js";
import RequestedPropertyModel from "../../../db/models/RequestedProperty.model.js";
import successResponse from "../../../utils/response/success.response.js";

const requestProperty = asyncHandler(async (req, res, next) => {
  const requestedProperty = await RequestedPropertyModel.create(req.body);
  return successResponse({
    res,
    status: 201,
    message: "Propert requested successfully",
    data: requestedProperty,
  });
});

export default requestProperty;
