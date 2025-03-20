import PropertyModel from "../../../db/models/Property.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import successResponse from "../../../utils/response/success.response.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";

const addResidential = asyncHandler(async (req, res, next) => {
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

  let images = [];

  try {
    // Process multiple images in parallel (if they exist)
    if (req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map((file) =>
        cloud.uploader.upload(file.path, {
          folder: `${process.env.APP_NAME}/properties/${data.title}/images`,
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);
      images = uploadedImages.map(({ secure_url, public_id }) => ({
        secure_url,
        public_id,
      }));
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error uploading files", stack: error.message });
  }

  const newProperty = await PropertyModel.create({ ...data, images });

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

export default addResidential;
