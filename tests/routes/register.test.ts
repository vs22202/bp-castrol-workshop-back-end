import request from 'supertest';
import { initializeDB } from '../../src/db';
import app from '../../src';
import sql from 'mssql'
import * as mail from '../../src/utils/mail';



let pool: sql.ConnectionPool;
describe('Register Router', () => {

    beforeAll(async () => {
        jest.spyOn(mail, "default").mockImplementation(async (options, callback) => { callback({ messageId: "test_messsage" }); });
        pool = await initializeDB();
        app.locals.db = pool;
        const setupRequest = pool.request()
            .input('otp', sql.NVarChar, '345678')
            .input('user_email', sql.NVarChar, 'test@example.com')
            .input('generate_time', sql.DateTime, new Date());
        const sqlQuery = `INSERT INTO Otp_Verification (user_email, otp, generate_time) 
                      VALUES (@user_email, @otp , @generate_time)`;
        await setupRequest.query(sqlQuery);
        const setupInvalidRequest = pool.request()
            .input('otp', sql.NVarChar, '346678')
            .input('user_email', sql.NVarChar, 'invalidtest@example.com')
            .input('generate_time', sql.DateTime, new Date());
        await setupInvalidRequest.query(sqlQuery);
        const setupExpiredRequest = pool.request()
            .input('otp', sql.NVarChar, '346678')
            .input('user_email', sql.NVarChar, 'expiredtest@example.com')
            .input('generate_time', sql.DateTime, new Date(2002, 2, 22));
        await setupExpiredRequest.query(sqlQuery);
    })
    it('should successfully register a user with valid OTP', async () => {
        // Assuming you have a valid OTP and user details in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'test@example.com',
                password: 'testpassword',
                otp: '345678',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'User registered successfully' });
    });

    it('should fail registration with an invalid OTP', async () => {
        // Assuming you have an expired OTP in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'invalidtest@example.com',
                password: 'testpassword',
                otp: '234567',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid OTP' });
    });

    it('should fail registration with an expired OTP', async () => {
        // Assuming you have an invalid OTP in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'expiredtest@example.com',
                password: 'testpassword',
                otp: '346678',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'OTP expired, please regenrate'});
    });

    it('should handle SQL error during registration', async () => {
        app.locals.db = undefined;
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'test@example.com',
                password: 'testpassword',
                otp: 'validotp',
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting data' });
        app.locals.db = pool;

    });
    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];
        ['test@example.com', 'invalidtest@example.com', 'expiredtest@example.com'].forEach( async (user_email) => {
            const cleanupRequest = pool.request()
                .input('user_email', sql.NVarChar, user_email);
            const sqlQuery = `DELETE FROM Otp_Verification WHERE user_email = @user_email`;
            databasePromises.push( cleanupRequest.query(sqlQuery));
        })
        await Promise.all(databasePromises);
        await pool.close();
    });

});

