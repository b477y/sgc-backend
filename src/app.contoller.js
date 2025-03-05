import connect2db from "./db/connection.js";

const bootstrap = (app, express) => {

  app.use(express.json());

  connect2db();
};

export default bootstrap;
