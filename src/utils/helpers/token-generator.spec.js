class TokenGenerator {
  async generate(id) {
    return null;
  }
}

describe("Token Generator", () => {
  test("Should return null if jwt lib returns null", async () => {
    const sut = new TokenGenerator();

    const token = await sut.generate("any_id");

    expect(token).toBe(null);
  });
});
