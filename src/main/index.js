require("dotenv/config");
const MongoHelper = require("../infra/helpers/mongo-helper");
const env = require("./config/env");
const { mongoUrl } = require("./config/env");

MongoHelper.connect(mongoUrl)
  .then(() => {
    console.log("MongoDB Started");

    const { app } = require("./config/app");

    app.listen(env.port, () => {
      console.log(`Server running at http://localhost:${env.port}/`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
