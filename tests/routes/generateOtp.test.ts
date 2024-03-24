import request from 'supertest';
import app from '../../src';
import sql from 'mssql'
import { initializeDB } from '../../src/db';
import * as mail from '../../src/utils/mail';
import * as whatsapp from '../../src/utils/mobile_message';
import bcrypt from "bcryptjs";
import { Options } from 'nodemailer/lib/mailer';

let pool: sql.ConnectionPool;
describe('generateOtp Router', () => {

    beforeAll(async () => {
        jest.spyOn(mail, "default")
            .mockImplementation(async (options: Options, callback: any) => {
                callback({ messageId: "test_messsage" });
            });
        jest.spyOn(whatsapp, "default")
            .mockImplementation(async (recipient: string, otp: string) => {
                console.log('WhatsApp message sent');
            });

        pool = await initializeDB();
        app.locals.db = pool;

        let sqlQuery: string;
        sqlQuery = `INSERT INTO Users (user_email, password, verified) 
                    VALUES (@user_email, @password , @verified)`;
        const setupRequest = pool.request()
            .input('user_email', sql.NVarChar, 'jane@example.com')
            .input('password', sql.NVarChar, await bcrypt.hash('password123', 10))
            .input('verified', sql.Bit, 1);
        await setupRequest.query(sqlQuery);
        const setOtpRequest = pool.request()
            .input('otp', sql.NVarChar, '123456')
            .input('user_email', sql.NVarChar, 'updateotp@gmail.com')
            .input('generate_time', sql.DateTime, new Date());
        sqlQuery = `INSERT INTO Otp_Verification (user_email, otp, generate_time) 
                    VALUES (@user_email, @otp , @generate_time)`;
        await setOtpRequest.query(sqlQuery);

        sqlQuery = `INSERT INTO Users (user_mobile, password, verified) 
                    VALUES (@user_mobile, @password , @verified)`;
        const setupMobileRequest = pool.request()
            .input('user_mobile', sql.BigInt, 1234567892)
            .input('password', sql.NVarChar, await bcrypt.hash('password123', 10))
            .input('verified', sql.Bit, 1);
        await setupMobileRequest.query(sqlQuery);
        const setOtpMobileRequest = pool.request()
            .input('otp', sql.NVarChar, '123456')
            .input('user_mobile', sql.BigInt, 1234567893)
            .input('generate_time', sql.DateTime, new Date());
        sqlQuery = `INSERT INTO Otp_Verification (user_mobile, otp, generate_time) 
                    VALUES (@user_mobile, @otp , @generate_time)`;
        await setOtpMobileRequest.query(sqlQuery);
    })

/**
 * Email tests
 */

    it('Should successfully generate and send OTP', async () => {
        const response = await request(app)
            .post('/generateOtp')
            .field('user_email', 'tempmail@gmail.com');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'OTP sent successfully' });
    });

    it('Should successfully update and send OTP', async () => {
        const response = await request(app)
            .post('/generateOtp')
            .field('user_email', 'updateotp@gmail.com');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'OTP sent successfully' });
    });

    it('Should handle user already verified error', async () => {
        const response = await request(app)
            .post('/generateOtp')
            .field('user_email', 'jane@example.com');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'User already verified' });
    });

    it('Should handle SQL error during OTP generation', async () => {
        app.locals.db = undefined;
        const response = await request(app)
            .post('/generateOtp')
            .field('user_email', 'test@example.com');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server error' });
        app.locals.db = pool;
    });

/**
 * Mobile tests
 */

    it('Should successfully generate and send OTP for mobile', async () => {
        const response = await request(app)
            .post('/generateOtp/mobile')
            .field('user_mobile', 1234567891);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'OTP sent successfully' });
    });

    it('Should successfully update and send OTP for mobile', async () => {
        const response = await request(app)
            .post('/generateOtp/mobile')
            .field('user_mobile', 1234567893);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'OTP sent successfully' });
    });

    it('Should handle user already verified error for mobile', async () => {
        const response = await request(app)
            .post('/generateOtp/mobile')
            .field('user_mobile', 1234567892);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'User already verified' });
    });

    it('Should handle SQL error during OTP generation for mobile', async () => {
        app.locals.db = undefined;
        const response = await request(app)
            .post('/generateOtp/mobile')
            .field('user_mobile', 1234567894);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server error' });
        app.locals.db = pool;
    });

    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];
        ['tempmail@gmail.com', 'jane@example.com', 'updateotp@gmail.com'].forEach(async (user_email) => {
            const cleanupRequest = pool.request()
                .input('user_email', sql.NVarChar, user_email);
            const sqlQuery = `DELETE FROM Users WHERE user_email = @user_email;
                              DELETE FROM Otp_Verification WHERE user_email = @user_email;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });
        [1234567891, 1234567892, 1234567893].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Users WHERE user_mobile = @user_mobile; 
                              DELETE FROM Otp_Verification WHERE user_mobile = @user_mobile;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    })
});

