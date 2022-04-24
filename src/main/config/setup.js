const { cors } = require("../middlewares/cors");
const { jsonParser } = require("../middlewares/json-pareser");

module.exports = (app) => {
  app.disable("x-powered-by");
  app.use(cors);
  app.use(jsonParser);
};
