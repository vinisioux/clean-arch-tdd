const { MissingParamError } = require("../../utils/errors");

class AuthUseCase {
  async auth(email, password) {
    if (!email) {
      throw new MissingParamError("email");
    }

    if (!password) {
      throw new MissingParamError("password");
    }
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
});
