jest.mock("jsonwebtoken", () => ({
  token: "any_token",
  id: "",
  secret: "",
  sign(payload, secret) {
    this.payload = payload;
    this.secret = secret;
    return this.token;
  },
}));

const jwt = require("jsonwebtoken");
const { MissingParamError } = require("../errors/missing-param-error");
const { TokenGenerator } = require("./token-generator");

const makeSut = () => {
  const sut = new TokenGenerator("secret");

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

    expect(jwt.payload).toEqual({ _id: "any_id" });
    expect(jwt.secret).toBe(sut.secret);
  });

  test("Should throws if no secret is provided", async () => {
    const sut = new TokenGenerator();

    expect(async () => {
      await sut.generate("any_id");
    }).rejects.toThrow(new MissingParamError("secret"));
  });

  test("Should throws if no id is provided", async () => {
    const { sut } = makeSut();

    expect(async () => {
      await sut.generate();
    }).rejects.toThrow(new MissingParamError("id"));
  });
});
