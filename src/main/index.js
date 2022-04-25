require("dotenv/config");
const MongoHelper = require("../infra/helpers/mongo-helper");
const { mongoUrl } = require("./config/env");

MongoHelper.connect(mongoUrl)
  .then(() => {
    console.log("MongoDB Started");

    const { app } = require("./config/app");

    app.listen(3333, () => {
      console.log("Server running on port 3333");
    });
  })
  .catch((error) => {
    console.error(error);
  });
