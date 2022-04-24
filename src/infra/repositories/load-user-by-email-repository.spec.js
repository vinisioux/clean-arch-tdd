const MongoHelper = require("../helpers/mongo-helper");
const { MissingParamError } = require("../../utils/errors/missing-param-error");
const {
  LoadUserByEmailRepository,
} = require("./load-user-by-email-repository");
let db;

const makeSut = () => {
  const userModel = db.collection("users");
  const sut = new LoadUserByEmailRepository(userModel);
  return {
    userModel,
    sut,
  };
};

describe("LoadUserByEmail Repository", () => {
  beforeAll(async () => {
    db = await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    await db.collection("users").deleteMany();
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

  test("Should throws if no userModel is provided", async () => {
    const sut = new LoadUserByEmailRepository();

    expect(async () => {
      await sut.load("any_email@email.com");
    }).rejects.toThrow();
  });

  test("Should throws if no email is provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.load();
    }).rejects.toThrow(new MissingParamError("email"));
  });
});
