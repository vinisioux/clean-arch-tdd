class LoginRouter {
  route(httpRequest) {
    if (!httpRequest.body.email || !httpRequest.body.password) {
      return {
        statusCode: 400,
      };
    }
  }
}

describe("Login Router", () => {
  test("Should return 400 if email is not provided", () => {
    const sut = new LoginRouter();

    const httpRequest = {
      body: {
        password: "123123",
      },
    };

    const httpResponse = sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
  });

  test("Should return 400 if password is not provided", () => {
    const sut = new LoginRouter();

    const httpRequest = {
      body: {
        email: "test@test.com",
      },
    };

    const httpResponse = sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
  });
});
