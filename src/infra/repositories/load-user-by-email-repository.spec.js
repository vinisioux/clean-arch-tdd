require("dotenv/config");
const { MongoClient } = require("mongodb");

class LoadUserByEmailRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }
  async load(email) {
    const user = this.userModel.findOne({ email });

    return user;
  }
}

describe("LoadUserByEmail Repository", () => {
  let client, db;

  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db = await client.db();
  });

  beforeEach(async () => {
    await db.collection("users").deleteMany();
  });

  afterAll(async () => {
    await client.close();
  });

  test("Should return null if user not found", async () => {
    const userModel = db.collection("users");

    const sut = new LoadUserByEmailRepository(userModel);
    const user = await sut.load("invalid_email@email.com");

    expect(user).toBe(null);
  });

  test("Should return an user if user is found", async () => {
    const userModel = db.collection("users");

    await userModel.insertOne({
      email: "valid_email@email.com",
    });

    const sut = new LoadUserByEmailRepository(userModel);

    const user = await sut.load("valid_email@email.com");

    expect(user.email).toBe("valid_email@email.com");
  });
});
