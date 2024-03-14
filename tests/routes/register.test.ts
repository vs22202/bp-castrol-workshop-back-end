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

        // Setup testcases
        let sqlQuery: string;
        sqlQuery = `INSERT INTO Otp_Verification (user_email, otp, generate_time) 
                    VALUES (@user_email, @otp , @generate_time)`;
        const setupRequest = pool.request()
            .input('otp', sql.NVarChar, '345678')
            .input('user_email', sql.NVarChar, 'test@example.com')
            .input('generate_time', sql.DateTime, new Date());
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

        sqlQuery = `INSERT INTO Otp_Verification (user_mobile, otp, generate_time) 
                    VALUES (@user_mobile, @otp , @generate_time)`;
        const setupMobileRequest = pool.request()
            .input('otp', sql.NVarChar, '121254')
            .input('user_mobile', sql.BigInt, 1234567891)
            .input('generate_time', sql.DateTime, new Date());
        await setupMobileRequest.query(sqlQuery);
        const setupMobileInvalidRequest = pool.request()
            .input('otp', sql.NVarChar, '125635')
            .input('user_mobile', sql.BigInt, 1234567892)
            .input('generate_time', sql.DateTime, new Date());
        await setupMobileInvalidRequest.query(sqlQuery);
        const setupMobileExpiredRequest = pool.request()
            .input('otp', sql.NVarChar, '125863')
            .input('user_mobile', sql.BigInt, 1234567893)
            .input('generate_time', sql.DateTime, new Date(2002, 2, 22));
        await setupMobileExpiredRequest.query(sqlQuery);

    })

    it('Should successfully register a user with valid OTP', async () => {
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

    it('Should fail registration with an invalid OTP', async () => {
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

    it('Should fail registration with an expired OTP', async () => {
        // Assuming you have an invalid OTP in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'expiredtest@example.com',
                password: 'testpassword',
                otp: '346678',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'OTP expired, please regenerate' });
    });

    it('Should handle SQL error during registration', async () => {
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

    it('Should successfully register a user with valid OTP and mobile number', async () => {
        // Assuming you have a valid OTP and user details with mobile number in your testing database
        const response = await request(app)
            .post('/register/mobile')
            .field({
                user_mobile: 1234567891,
                password: 'testpassword',
                otp: '121254',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'User registered successfully' });
    });

    it('Should fail registration with an invalid OTP for mobile number', async () => {
        // Assuming you have an invalid OTP in your testing database for a mobile number
        const response = await request(app)
            .post('/register/mobile')
            .field({
                user_mobile: 1234567892,
                password: 'testpassword',
                otp: '111111',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid OTP' });
    });

    it('Should fail registration with an expired OTP for mobile number', async () => {
        // Assuming you have an expired OTP in your testing database for a mobile number
        const response = await request(app)
            .post('/register/mobile')
            .field({
                user_mobile: 1234567893,
                password: 'testpassword',
                otp: '125863',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'OTP expired, please regenerate' });
    });

    it('Should handle SQL error during mobile number registration', async () => {
        // Simulate a SQL error by making the database connection undefined
        app.locals.db = undefined;
        const response = await request(app)
            .post('/register/mobile')
            .field({
                user_mobile: 1234567891,
                password: 'testpassword',
                otp: '121254',
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting data' });
        // Restore database connection for subsequent tests
        app.locals.db = pool;
    });

    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];

        ['test@example.com', 'invalidtest@example.com', 'expiredtest@example.com'].forEach(async (user_email) => {
            const cleanupRequest = pool.request()
                .input('user_email', sql.NVarChar, user_email);
            const sqlQuery = `DELETE FROM Otp_Verification WHERE user_email = @user_email`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });
        [1234567891, 1234567892, 1234567893].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Otp_Verification WHERE user_mobile = @user_mobile`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    });

});

