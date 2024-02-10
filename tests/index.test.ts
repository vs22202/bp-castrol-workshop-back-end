import app from "../src/index";
import request from "supertest";

describe("GET /", () => {
  it('responds with "Welcome to unit testing guide for nodejs, typescript and express!', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});