const request = require("supertest");
const { app } = require("./app");

describe("App Setup", () => {
  test("Should disable x-powered-by", async () => {
    app.get("/test_x_powered_by", (req, res) => {
      return res.send("");
    });

    const response = await request(app).get("/test_x_powered_by");

    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("Should enable cores", async () => {
    app.get("/test_cors", (req, res) => {
      return res.send("");
    });

    const response = await request(app).get("/test_cors");

    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"]).toBe("*");
    expect(response.headers["access-control-allow-headers"]).toBe("*");
  });
});
