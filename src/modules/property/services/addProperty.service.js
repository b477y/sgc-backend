import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";

const addProperty = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const existingProperty = await PropertyModel.findOne({
    title: data.title,
    address: data.address,
  });

  if (existingProperty) {
    return next(
      new Error(
        "A property with this title and address already exists. Please modify the details or check your listings.",
        { cause: 400 }
      )
    );
  }

  const newProperty = await PropertyModel.create({ ...data });

  if (!newProperty) {
    return next(
      new Error("An error occured while adding the the new property", {
        cause: 400,
      })
    );
  }

  return successResponse({
    res,
    status: 201,
    message: "Property added successfully",
    data: newProperty,
  });
});

export default addProperty;
