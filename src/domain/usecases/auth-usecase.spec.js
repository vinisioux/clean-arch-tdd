class AuthUseCase {
  async auth(email) {
    if (!email) {
      throw new Error();
    }
  }
}

describe("Auth UseCase", () => {
  test("should throw if no email is provided", async () => {
    const sut = new AuthUseCase();

    expect(async () => {
      await sut.auth();
    }).rejects.toThrow();
  });
});