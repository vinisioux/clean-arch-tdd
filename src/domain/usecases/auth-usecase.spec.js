const { MissingParamError } = require("../../utils/errors");

class AuthUseCase {
  constructor(loadUserByEmailRepositorySpy) {
    this.loadUserByEmailRepositorySpy = loadUserByEmailRepositorySpy;
  }

  async auth(email, password) {
    if (!email) {
      throw new MissingParamError("email");
    }

    if (!password) {
      throw new MissingParamError("password");
    }

    await this.loadUserByEmailRepositorySpy.load(email);
  }
}

describe("Auth UseCase", () => {
  test("should throw if no email is provided", async () => {
    const sut = new AuthUseCase();

    expect(async () => {
      await sut.auth();
    }).rejects.toThrow(new MissingParamError("email"));
  });

  test("should throw if no password is provided", async () => {
    const sut = new AuthUseCase();

    expect(async () => {
      await sut.auth("any_email@email.com");
    }).rejects.toThrow(new MissingParamError("password"));
  });

  test("should call LoadUserByEmailRepository with correct email", async () => {
    class LoadUserByEmailRepositorySpy {
      async load(email) {
        this.email = email;
      }
    }
    const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
    const sut = new AuthUseCase(loadUserByEmailRepositorySpy);
    await sut.auth("any_email@email.com", "anypassword");

    expect(loadUserByEmailRepositorySpy.email).toBe("any_email@email.com");
  });
});
