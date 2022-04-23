const { MissingParamError, InvalidParamError } = require("../../utils/errors");
const { AuthUseCase } = require("./auth-usecase");

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare(password, hashedPassowrd) {
      this.password = password;
      this.hashedPassowrd = hashedPassowrd;

      return this.isValid;
    }
  }
  const encrypterSpy = new EncrypterSpy();
  encrypterSpy.isValid = true;

  return encrypterSpy;
};

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare() {
      throw new Error();
    }
  }

  return new EncrypterSpy();
};

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email;

      return this.user;
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  loadUserByEmailRepositorySpy.user = {
    id: "any_id",
    password: "hashed_password",
  };

  return loadUserByEmailRepositorySpy;
};

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load() {
      throw new Error();
    }
  }

  return new LoadUserByEmailRepositorySpy();
};

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate(userId) {
      this.userId = userId;

      return this.accessToken;
    }
  }

  const tokenGeneratorSpy = new TokenGeneratorSpy();

  tokenGeneratorSpy.accessToken = "any_token";

  return tokenGeneratorSpy;
};

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate() {
      throw new Error();
    }
  }

  return new TokenGeneratorSpy();
};

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async update(userId, accessToken) {
      this.userId = userId;
      this.accessToken = accessToken;
    }
  }

  return new UpdateAccessTokenRepositorySpy();
};

const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepositorySpy {
    async update() {
      throw new Error();
    }
  }

  return new UpdateAccessTokenRepositorySpy();
};

const makeSut = () => {
  const encrypterSpy = makeEncrypter();
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository();
  const tokenGeneratorSpy = makeTokenGenerator();
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository();

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy,
  });

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy,
  };
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

  test("should return null if na invalid email is provided", async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();
    loadUserByEmailRepositorySpy.user = null;

    const accessToken = await sut.auth("invalid@email.com", "anypassword");

    expect(accessToken).toBeNull();
  });

  test("should return null if na invalid password is provided", async () => {
    const { sut, encrypterSpy } = makeSut();

    encrypterSpy.isValid = false;

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

  test("should call TokenGenerator with correct userId ", async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut();

    await sut.auth("valid@email.com", "valid_password");

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id);
  });

  test("should return an accessToken if correct credentials are provided ", async () => {
    const { sut, tokenGeneratorSpy } = makeSut();

    const accessToken = await sut.auth("valid@email.com", "valid_password");

    expect(accessToken).toBe(tokenGeneratorSpy.accessToken);
    expect(accessToken).toBeTruthy();
  });

  test("should call UpdateAccessTokenRepository with correct values", async () => {
    const {
      sut,
      loadUserByEmailRepositorySpy,
      tokenGeneratorSpy,
      updateAccessTokenRepositorySpy,
    } = makeSut();

    await sut.auth("valid@email.com", "valid_password");

    expect(updateAccessTokenRepositorySpy.userId).toBe(
      loadUserByEmailRepositorySpy.user.id
    );
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(
      tokenGeneratorSpy.accessToken
    );
  });

  test("should throws if invalid dependencies are provided", async () => {
    const invalid = {};
    const loadUserByEmailRepository = makeLoadUserByEmailRepository();
    const encrypter = makeEncrypter();
    const tokenGenerator = makeTokenGenerator();

    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator: null,
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: null,
        tokenGenerator: null,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null,
        tokenGenerator: null,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid,
        tokenGenerator: null,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: null,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: null,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: null,
      })
    );

    for (const sut of suts) {
      expect(async () => {
        await sut.auth("any_email@email.com", "anypassword");
      }).rejects.toThrow();
    }
  });

  test("should throws if dependency throws", async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository();
    const encrypter = makeEncrypter();
    const tokenGenerator = makeTokenGenerator();

    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError(),
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError(),
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: makeTokenGeneratorWithError(),
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: makeUpdateAccessTokenRepositoryWithError(),
      })
    );

    for (const sut of suts) {
      expect(async () => {
        await sut.auth("any_email@email.com", "anypassword");
      }).rejects.toThrow();
    }
  });
});
