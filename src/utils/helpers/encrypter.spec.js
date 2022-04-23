const bcrypt = require("bcrypt");
const { MissingParamError } = require("../errors");
const { Encrypter } = require("./encrypter");

const makeSut = () => {
  const sut = new Encrypter();

  return { sut };
};

describe("Encrypter", () => {
  test("Should return true if bcrypt returns true", async () => {
    const { sut } = makeSut();

    const isValid = await sut.compare("any_value", "hashed_value");

    expect(isValid).toBe(true);
  });

  test("Should return false if bcrypt returns false", async () => {
    const { sut } = makeSut();

    bcrypt.isValid = false;

    const isValid = await sut.compare("any_value", "hashed_value");

    expect(isValid).toBe(false);
  });

  test("Should call bcrypt with correct values", async () => {
    const { sut } = makeSut();

    await sut.compare("any_value", "hashed_value");

    expect(bcrypt.value).toBe("any_value");
    expect(bcrypt.hashedValue).toBe("hashed_value");
  });

  test("Should throw if no params are provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.compare();
    }).rejects.toThrow(new MissingParamError("value"));
    expect(async () => {
      await sut.compare("any_value");
    }).rejects.toThrow(new MissingParamError("hashedValue"));
  });
});
