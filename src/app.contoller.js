import connect2db from "./db/connection.js";
import errorHandlingMiddleware from "./middlewares/errorHandling.middleware.js";
import authController from "./modules/auth/auth.controller.js";
import propertiesController from "./modules/property/properties.controller.js";
import servicesController from "./modules/serviceCategory/servicesCategories.controller.js";
import servicesProviderController from "./modules/serviceProvider/servicesProviders.controller.js";
import agencyController from "./modules/agency/agencies.controller.js";
import agentController from "./modules/agent/agent.controller.js";
import staticController from "./modules/static/static.controller.js";
import userController from "./modules/user/user.controller.js";
import cors from "cors";

const bootstrap = (app, express) => {
  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.use("/api/auth", authController);
  app.use("/api/static", staticController);
  app.use("/api/properties", propertiesController);
  app.use("/api/services", servicesController);
  app.use("/api/services-providers", servicesProviderController);
  app.use("/api/agency", agencyController);
  app.use("/api/agent", agentController);
  app.use("/api/user", userController);

  app.get("", (req, res, next) => {
    return res.status(200).json({ message: "SGC" });
  });

  app.all("*", (req, res) => {
    return res.status(404).json({ message: "Invalid routing" });
  });

  app.use(errorHandlingMiddleware);

  connect2db();
};

export default bootstrap;
