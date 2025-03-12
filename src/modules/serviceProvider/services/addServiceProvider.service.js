import successResponse from "../../../utils/response/success.response.js";
import ServiceProviderModel from "../../../db/models/ServiceProvider.model.js";
import asyncHandler from "../../../utils/response/error.response.js";
import ServiceCategoryModel from "../../../db/models/ServiceCategory.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";

const addServiceProvider = asyncHandler(async (req, res, next) => {
  const {
    name,
    about,
    email,
    phone,
    city,
    serviceCategoryName,
    website,
    facebook,
    x,
    linkedin,
  } = req.body;

  // Find the service category by name
  const serviceCategory = await ServiceCategoryModel.findOne({
    name: { $regex: new RegExp(`^${serviceCategoryName}$`, "i") },
  });

  if (!serviceCategory) {
    return res.status(400).json({ message: "Invalid service category name" });
  }

  let images = [];
  let logo = null;

  try {
    // Process logo upload (single file)
    if (req.files.logo && req.files.logo.length > 0) {
      const { secure_url, public_id } = await cloud.uploader.upload(
        req.files.logo[0].path,
        {
          folder: `${process.env.APP_NAME}/serviceProviders/${name}/logo`,
        }
      );
      logo = { secure_url, public_id };
    }

    // Process multiple images in parallel (if they exist)
    if (req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map((file) =>
        cloud.uploader.upload(file.path, {
          folder: `${process.env.APP_NAME}/serviceProviders/${name}/images`,
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

  const socialMediaLinks = {};
  if (facebook) socialMediaLinks.facebook = facebook;
  if (x) socialMediaLinks.x = x;
  if (linkedin) socialMediaLinks.linkedin = linkedin;

  // Create the service provider with the correct category ID
  const serviceProvider = await ServiceProviderModel.create({
    name,
    about,
    email,
    phone,
    city,
    serviceCategory: serviceCategory._id,
    // createdBy: req.user._id,
    images,
    logo,
    website,
    socialMediaLinks,
  });

  return successResponse({
    res,
    status: 201,
    message: "Service provider added successfully",
    data: serviceProvider,
  });
});

export default addServiceProvider;
