import app from "../../src";
import request from "supertest";
import { Application } from "../../src/models/application";
describe("Application APC", () => {
    it('GET /application', async () => {
        const response = await request(app).get("/application");
        const temp: Application = {
            Application_Id: expect.any(Number),
            Workshop_Name: expect.any(String),
            User_Name: expect.any(String)
        }
        expect(response.body[0]).toMatchObject(temp);
    });
});
