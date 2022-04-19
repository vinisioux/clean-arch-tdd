const { LoginRouter } = require("./login-router");
const { MissingParamError } = require("../helpers/missing-param-error");
const { InvalidParamError } = require("../helpers/invalid-param-error");
const { UnauthorizedError } = require("../helpers/unauthorized-error");
const { ServerError } = require("../helpers/server-error");

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
      return this.isEmailValid;
    }
  }

  const emailValidorSpy = new EmailValidorSpy();
  emailValidorSpy.isEmailValid = true;

  return emailValidorSpy;
};

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase();
  const emailValidatorSpy = makeEmailValidator();

  authUseCaseSpy.accessToken = "valid_token";

  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy);

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

  test("Should return 500 if AuthUseCase is not provided", async () => {
    const sut = new LoginRouter();
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

  test("Should return 500 if AuthUseCase has no auth method", async () => {
    class AuthUseCaseSpy {}
    const authUseCaseSpy = new AuthUseCaseSpy();

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
});
