const request = require("supertest");
const { app } = require("../config/app");

describe("CORS middleware", () => {
  test("Should enable cors", async () => {
    app.get("/test_cors", (req, res) => {
      return res.send("");
    });

    const response = await request(app).get("/test_cors");

    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"]).toBe("*");
    expect(response.headers["access-control-allow-headers"]).toBe("*");
  });
});
