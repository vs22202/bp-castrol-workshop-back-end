import app from "../../src";
import request from "supertest";
import { Application } from "../../src/models/application";
describe("Application API", () => {
    it('GET /application', async () => {
        const response = await request(app).get("/application");
        console.log(response.body[0]);
        const temp: Application = {
            Application_Id: expect.any(Number),
            Workshop_Name: expect.any(String),
            User_Name: expect.any(String)
        }
        expect(response.body[0]).toMatchObject(temp);
    });
});
