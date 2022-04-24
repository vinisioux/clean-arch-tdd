const request = require("supertest");
const { app } = require("../config/app");

describe("JSON Parser middleware", () => {
  test("Should parse body as JSON", async () => {
    app.post("/test_json_parser", (req, res) => {
      return res.send(req.body);
    });

    const response = await request(app)
      .post("/test_json_parser")
      .send({ name: "test name" })
      .expect({ name: "test name" });
  });
});
