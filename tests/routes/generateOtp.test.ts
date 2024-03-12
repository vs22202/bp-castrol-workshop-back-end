import request from 'supertest';
import app from '../../src';
import sql from 'mssql'
import { initializeDB } from '../../src/db';
import * as mail from '../../src/utils/mail';

let pool: sql.ConnectionPool;
describe('generateOtp Router', () => {

    
    //write the beofer all function to initialize the database
    beforeAll(async () => {
        jest.spyOn(mail, "default").mockImplementation(async (options, callback) => { callback({messageId:"test_messsage"}); });
        pool = await initializeDB();
        app.locals.db = pool;
    })

    it('should successfully generate and send OTP', async () => {
        const response = await request(app)
            .post('/generateOtp')
            .field('user_email','adam@example.com');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'OTP send successfully' });
    });

    it('should handle user already verified error', async () => {
        // Assuming you have already verified the user in your testing database
        const response = await request(app)
            .post('/generateOtp')
            .field('user_email','jane@example.com');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'User already verified' });
    });

    it('should handle SQL error during OTP generation', async () => {
        // Close the testing database connection to simulate an error
        const pool = app.locals.db;
        // await pool.close();

        const response = await request(app)
            .post('/generateOtp')
            .field('user_email', 'test@example.com' );

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server error' });
    });

    /*it('should handle error during OTP sendMail', async () => {
        // Assuming you have reopened the testing database connection

        const response = await request(server)
            .post('/generateOtp')
            .send({ user_email: 'test@example.com' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server error' });
    });*/
    afterAll(async () => {
        await pool.close();
    })
});

