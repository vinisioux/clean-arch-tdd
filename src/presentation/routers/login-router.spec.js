const { LoginRouter } = require("./login-router");
const { MissingParamError } = require("../helpers/missing-param-error");

const makeSut = () => {
  class AuthUseCaseSpy {
    auth(email, password) {
      this.email = email;
      this.password = password;
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy();

  const sut = new LoginRouter(authUseCaseSpy);

  return {
    sut,
    authUseCaseSpy,
  };
};

describe("Login Router", () => {
  test("Should return 400 if email is not provided", () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        password: "123123",
      },
    };

    const httpResponse = sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if password is not provided", () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        email: "test@test.com",
      },
    };

    const httpResponse = sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 500 if httpRequest is not provided", () => {
    const { sut } = makeSut();

    const httpResponse = sut.route();

    expect(httpResponse.statusCode).toBe(500);
  });

  test("Should return 500 if httpRequest body is not provided", () => {
    const { sut } = makeSut();
    const httpResponse = sut.route({});

    expect(httpResponse.statusCode).toBe(500);
  });

  test("Should call AuthUseCase with correct params", () => {
    const { sut, authUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        email: "test@test.com",
        password: "123123",
      },
    };

    sut.route(httpRequest);

    expect(authUseCaseSpy.email).toBe(httpRequest.body.email);
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password);
  });
});
