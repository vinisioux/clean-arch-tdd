const { LoginRouter } = require("./login-router");
const { ServerError, UnauthorizedError } = require("../errors");
const { MissingParamError, InvalidParamError } = require("../../utils/errors");

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth(email, password) {
      this.email = email;
      this.password = password;
      return this.accessToken;
    }
  }

  return new AuthUseCaseSpy();
};

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth() {
      throw new Error();
    }
  }

  return new AuthUseCaseSpy();
};

const makeEmailValidator = () => {
  class EmailValidorSpy {
    isValid(email) {
      this.email = email;
      return this.isEmailValid;
    }
  }

  const emailValidorSpy = new EmailValidorSpy();
  emailValidorSpy.isEmailValid = true;

  return emailValidorSpy;
};
const makeEmailValidatorWithError = () => {
  class EmailValidorSpy {
    isValid() {
      throw new Error();
    }
  }

  return new EmailValidorSpy();
};

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase();
  const emailValidatorSpy = makeEmailValidator();

  authUseCaseSpy.accessToken = "valid_token";

  const sut = new LoginRouter({
    authUseCase: authUseCaseSpy,
    emailValidator: emailValidatorSpy,
  });

  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy,
  };
};

describe("Login Router", () => {
  test("Should return 400 if email is not provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        password: "123123",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if password is not provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        email: "test@test.com",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 500 if httpRequest is not provided", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route();

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest body is not provided", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route({});

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call AuthUseCase with correct params", async () => {
    const { sut, authUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        email: "test@test.com",
        password: "123123",
      },
    };

    await sut.route(httpRequest);

    expect(authUseCaseSpy.email).toBe(httpRequest.body.email);
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password);
  });

  test("Should return 401 when invalid credentials are provided", async () => {
    const { sut, authUseCaseSpy } = makeSut();

    authUseCaseSpy.accessToken = null;

    const httpRequest = {
      body: {
        email: "invalid_email@test.com",
        password: "invalid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual(new UnauthorizedError());
  });

  test("Should return 200 when valid credentials are provided", async () => {
    const { sut, authUseCaseSpy } = makeSut();

    const httpRequest = {
      body: {
        email: "valid_email@test.com",
        password: "valid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken);
  });

  test("Should return 500 if AuthUseCase throws", async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError();

    const sut = new LoginRouter(authUseCaseSpy);

    const httpRequest = {
      body: {
        email: "test@test.com",
        password: "123123",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 400 if invalid email is provided", async () => {
    const { sut, emailValidatorSpy } = makeSut();
    emailValidatorSpy.isEmailValid = false;

    const httpRequest = {
      body: {
        email: "invalid_email@test.com",
        password: "123123123",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });

  test("Should return 500 if EmailValidator throws", async () => {
    const authUseCaseSpy = makeAuthUseCase();
    const emailValidatorSpy = makeEmailValidatorWithError();

    const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy);

    const httpRequest = {
      body: {
        email: "test@test.com",
        password: "123123",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call EmailValidator with correct params", async () => {
    const { sut, emailValidatorSpy } = makeSut();
    const httpRequest = {
      body: {
        email: "test@test.com",
        password: "123123",
      },
    };

    await sut.route(httpRequest);

    expect(emailValidatorSpy.email).toBe(httpRequest.body.email);
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const invalid = {};
    const authUseCase = makeAuthUseCase();
    const suts = [].concat(
      new LoginRouter(),
      new LoginRouter({}),
      new LoginRouter({
        authUseCase: invalid,
      }),
      new LoginRouter({
        authUseCase,
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: invalid,
      })
    );
    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: "any_email@mail.com",
          password: "any_password",
        },
      };
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});
