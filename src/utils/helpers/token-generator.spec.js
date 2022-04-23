const jwt = require("jsonwebtoken");
class TokenGenerator {
  constructor({ secret }) {
    this.secret = secret;
  }

  async generate(id) {
    return jwt.sign(id, this.secret);
  }
}

const makeSut = () => {
  const sut = new TokenGenerator({ secret: "secret" });

  return { sut };
};

describe("Token Generator", () => {
  test("Should return null if jwt lib returns null", async () => {
    const { sut } = makeSut();
    jwt.token = null;
    const token = await sut.generate("any_id");

    expect(token).toBe(null);
  });

  test("Should return a token if jwt lib returns token", async () => {
    const { sut } = makeSut();

    const token = await sut.generate("any_id");

    expect(token).toBe(jwt.token);
  });

  test("Should call jwt lib with correct values", async () => {
    const { sut } = makeSut();

    await sut.generate("any_id");

    expect(jwt.id).toBe("any_id");
    expect(jwt.secret).toBe(sut.secret);
  });
});
