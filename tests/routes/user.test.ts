import request from 'supertest';
import app from '../../src';
import { initializeDB } from '../../src/db';
import sql from 'mssql'
import * as mail from '../../src/utils/mail';
import * as mobile from '../../src/utils/mobile_message'

let pool : sql.ConnectionPool;

//added some placeholder tests , please add proper tests and remove this comment - vs
describe('User Routes', () => {
    beforeAll(async () => {
        jest.spyOn(mail, "default").mockImplementation(async (options, callback) => { callback({messageId:"test_messsage"}); });
        jest.spyOn(mobile, "default").mockImplementation(async (recipient: string,otp:string) => { console.log("Mobile OTP sent successfully"); });
        pool = await initializeDB();
        app.locals.db = pool;
    })
    it('should return 200 OK when accessing the /user endpoint', async () => {
        const response = await request(app).get('/user');
        expect(response.status).toBe(200);
    });

    it('should return 200 OK when accessing the /user/changepassword endpoint', async () => {
        const response = await request(app).post('/user/changepassword');
        expect(response.status).toBe(200);
    });

    it('should return 200 OK when accessing the /user/generateResetOtp endpoint', async () => {
        const response = await request(app).post('/user/generateResetOtp');
        expect(response.status).toBe(200);
    });

    it('should return 200 OK when accessing the /user/resetPassword endpoint', async () => {
        const response = await request(app).post('/user/resetPassword');
        expect(response.status).toBe(200);
    });

    afterAll(async () => {
        await pool.close();
    });
});
