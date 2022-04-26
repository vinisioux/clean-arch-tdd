const MongoHelper = require("../../infra/helpers/mongo-helper");
const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../config/app");
let userModel;

describe("Login Routes", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
    userModel = await MongoHelper.getCollection("users");
  });

  beforeEach(async () => {
    await userModel.deleteMany();
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Should return 200 when valid credentials are provided", async () => {
    const fakeUserData = {
      email: "valid_email@email.com",
      password: bcrypt.hashSync("hashed_password", 8),
    };

    await userModel.insertOne(fakeUserData);

    await request(app)
      .post("/api/login")
      .send({
        email: fakeUserData.email,
        password: "hashed_password",
      })
      .expect(200);
  });

  test("Should return 401 when invalid credentials are provided", async () => {
    await request(app)
      .post("/api/login")
      .send({
        email: "valid_email@mail.com",
        password: "hashed_password",
      })
      .expect(401);
  });
});
