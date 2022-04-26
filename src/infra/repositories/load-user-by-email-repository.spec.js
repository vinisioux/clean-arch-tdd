const MongoHelper = require("../helpers/mongo-helper");
const { MissingParamError } = require("../../utils/errors/missing-param-error");
const {
  LoadUserByEmailRepository,
} = require("./load-user-by-email-repository");
let userModel;

const makeSut = () => {
  const sut = new LoadUserByEmailRepository();
  return {
    sut,
  };
};

describe("LoadUserByEmail Repository", () => {
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

  test("Should return null if user not found", async () => {
    const { sut } = makeSut();
    const user = await sut.load("invalid_email@email.com");

    expect(user).toBe(null);
  });

  test("Should return an user if user is found", async () => {
    const { sut } = makeSut();

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

  test("Should throws if no email is provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.load();
    }).rejects.toThrow(new MissingParamError("email"));
  });
});
