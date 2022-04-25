const request = require("supertest");

describe("Content-Type middleware", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    app = require("../config/app").app;
  });

  test("Should return json content type as default", async () => {
    app.get("/test_content_type", (req, res) => {
      return res.send("");
    });

    await request(app).get("/test_content_type").expect("content-type", /json/);
  });

  test("Should return xml content-type", async () => {
    app.get("/test_content_type", (req, res) => {
      res.type("xml");
      return res.send("");
    });

    await request(app).get("/test_content_type").expect("content-type", /xml/);
  });
});
