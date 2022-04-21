const { MissingParamError, InvalidParamError } = require("../../utils/errors");

class AuthUseCase {
  constructor(loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository;
  }

  async auth(email, password) {
    if (!email) {
      throw new MissingParamError("email");
    }

    if (!password) {
      throw new MissingParamError("password");
    }

    if (!this.loadUserByEmailRepository) {
      throw new MissingParamError("loadUserByEmailRepository");
    }

    if (!this.loadUserByEmailRepository.load) {
      throw new InvalidParamError("loadUserByEmailRepository");
    }

    const user = await this.loadUserByEmailRepository.load(email);

    if (!user) {
      return null;
    }
  }
}

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email;
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy);
  return { sut, loadUserByEmailRepositorySpy };
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

  test("should return null if repository returns null", async () => {
    const { sut } = makeSut();

    const accessToken = await sut.auth("invalid@email.com", "anypassword");

    expect(accessToken).toBeNull();
  });
});
