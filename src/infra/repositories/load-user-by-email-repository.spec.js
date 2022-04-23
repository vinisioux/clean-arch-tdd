require("dotenv/config");
const { MongoClient } = require("mongodb");

let client, db;
class LoadUserByEmailRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }
  async load(email) {
    const user = this.userModel.findOne(
      {
        email,
      },
      {
        projection: {
          password: 1,
        },
      }
    );

    return user;
  }
}

const makeSut = () => {
  const userModel = db.collection("users");
  const sut = new LoadUserByEmailRepository(userModel);

  return {
    sut,
    userModel,
  };
};

describe("LoadUserByEmail Repository", () => {
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
    const { sut } = makeSut();
    const user = await sut.load("invalid_email@email.com");

    expect(user).toBe(null);
  });

  test("Should return an user if user is found", async () => {
    const { sut, userModel } = makeSut();

    const fakeUserData = {
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    };

    await userModel.insertOne(fakeUserData);

    const user = await sut.load("valid_email@email.com");

    expect(user).toEqual({
      _id: fakeUserData._id,
      password: fakeUserData.password,
    });
  });
});
