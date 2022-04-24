const MongoHelper = require("../helpers/mongo-helper");
const { MissingParamError } = require("../../utils/errors/missing-param-error");
let db;

class UpdateAccessTokenRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async update(userId, accessToken) {
    await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          accessToken,
        },
      }
    );
  }
}

const makeSut = () => {
  const userModel = db.collection("users");
  const sut = new UpdateAccessTokenRepository(userModel);

  return {
    sut,
    userModel,
  };
};

describe("UpdateAccessTokenRepository", () => {
  beforeAll(async () => {
    db = await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    await db.collection("users").deleteMany();
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Should updated the user with the given accessToken", async () => {
    const { sut, userModel } = makeSut();

    const fakeUserData = {
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    };

    await userModel.insertOne(fakeUserData);

    await sut.update(fakeUserData._id, "valid_token");

    const updatedFakeUser = await userModel.findOne({ _id: fakeUserData._id });

    expect(updatedFakeUser.accessToken).toBe("valid_token");
  });

  test("Should throws if no userModel is provided", async () => {
    const sut = new UpdateAccessTokenRepository();
    const userModel = db.collection("users");

    const fakeUserData = {
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    };

    await userModel.insertOne(fakeUserData);

    expect(async () => {
      await sut.update("valid_id", "valid_token");
    }).rejects.toThrow();
  });
});
