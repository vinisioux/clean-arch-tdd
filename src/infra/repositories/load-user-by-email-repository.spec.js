class LoadUserByEmailRepository {
  async load(email) {
    return null;
  }
}

describe("LoadUserByEmail Repository", () => {
  test("Should return null if user not found", async () => {
    const sut = new LoadUserByEmailRepository();
    const user = await sut.load("invalid_email@email.com");

    expect(user).toBe(null);
  });
});
