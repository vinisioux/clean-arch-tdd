const MongoHelper = require("../helpers/mongo-helper");
const { MissingParamError } = require("../../utils/errors/missing-param-error");
const {
  UpdateAccessTokenRepository,
} = require("./update-access-token-repository");

let userModel;

const makeSut = () => {
  const sut = new UpdateAccessTokenRepository();

  return {
    sut,
  };
};

describe("UpdateAccessTokenRepository", () => {
  let fakeUserId;
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
    userModel = await MongoHelper.getCollection("users");
  });

  beforeEach(async () => {
    await userModel.deleteMany();
    const fakeUserData = {
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    };

    await userModel.insertOne(fakeUserData);
    fakeUserId = fakeUserData._id;
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Should updated the user with the given accessToken", async () => {
    const { sut } = makeSut();

    await sut.update(fakeUserId, "valid_token");

    const updatedFakeUser = await userModel.findOne({ _id: fakeUserId });

    expect(updatedFakeUser.accessToken).toBe("valid_token");
  });

  test("Should throws if no params are provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.update();
    }).rejects.toThrow(new MissingParamError("userId"));
    expect(async () => {
      await sut.update(fakeUserId);
    }).rejects.toThrow(new MissingParamError("accessToken"));
  });
});
