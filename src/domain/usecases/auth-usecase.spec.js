const { MissingParamError, InvalidParamError } = require("../../utils/errors");
const { AuthUseCase } = require("./auth-usecase");

const makeSut = () => {
  class EncrypterSpy {
    async compare(password, hashedPassowrd) {
      this.password = password;
      this.hashedPassowrd = hashedPassowrd;
    }
  }
  const encrypterSpy = new EncrypterSpy();
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email;

      return this.user;
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  loadUserByEmailRepositorySpy.user = {
    password: "hashed_password",
  };

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy);
  return { sut, loadUserByEmailRepositorySpy, encrypterSpy };
};

describe("Auth UseCase", () => {
  test("should throw if no email is provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.auth();
    }).rejects.toThrow(new MissingParamError("email"));
  });

  test("should throw if no password is provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.auth("any_email@email.com");
    }).rejects.toThrow(new MissingParamError("password"));
  });

  test("should call LoadUserByEmailRepository with correct email", async () => {
    const { loadUserByEmailRepositorySpy, sut } = makeSut();

    await sut.auth("any_email@email.com", "anypassword");

    expect(loadUserByEmailRepositorySpy.email).toBe("any_email@email.com");
  });

  test("should throws with no repository is provided", async () => {
    const sut = new AuthUseCase();

    expect(async () => {
      await sut.auth("any_email@email.com", "anypassword");
    }).rejects.toThrow(new MissingParamError("loadUserByEmailRepository"));
  });

  test("should throws with no repository has no load method", async () => {
    const sut = new AuthUseCase({});

    expect(async () => {
      await sut.auth("any_email@email.com", "anypassword");
    }).rejects.toThrow(new InvalidParamError("loadUserByEmailRepository"));
  });

  test("should return null if na invalid email is provided", async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();
    loadUserByEmailRepositorySpy.user = null;

    const accessToken = await sut.auth("invalid@email.com", "anypassword");

    expect(accessToken).toBeNull();
  });

  test("should return null if na invalid password is provided", async () => {
    const { sut } = makeSut();

    const accessToken = await sut.auth("valid@email.com", "invalid_password");

    expect(accessToken).toBeNull();
  });

  test("should call Encrypter with correct values", async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut();

    await sut.auth("valid@email.com", "any_password");

    expect(encrypterSpy.password).toBe("any_password");
    expect(encrypterSpy.hashedPassowrd).toBe(
      loadUserByEmailRepositorySpy.user.password
    );
  });
});
