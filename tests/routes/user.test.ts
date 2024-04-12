import request from 'supertest';
import app from '../../src';
import { initializeDB } from '../../src/db';
import sql from 'mssql';
import * as mail from '../../src/utils/mail';
import * as mobile from '../../src/utils/mobile_message';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

let pool: sql.ConnectionPool;
let accessTokens: string[] = [];
let user_ids: number[] = [];


describe('User Router', () => {

    beforeAll(async () => {
        jest.spyOn(mail, "default")
            .mockImplementation(async (options, callback) => {
                callback({ messageId: "test_messsage" });
            });
        jest.spyOn(mobile, "default")
            .mockImplementation(async (recipient: string, otp: string) => {
                console.log("Mobile OTP sent successfully");
            });
        pool = await initializeDB();
        app.locals.db = pool;

        let sqlQuery: string;
        for(let i=1;i<=8;i++) {
            sqlQuery = `INSERT INTO Users (user_email, password, verified) 
                        VALUES (@user_email, @password , @verified)`;
            const request = pool.request()
                .input('user_email', sql.NVarChar, `user${i}@gmail.com`)
                .input('password', sql.NVarChar, await bcrypt.hash(`password${i}`, 10))
                .input('verified', sql.Bit, 1);
            await request.query(sqlQuery);
        }

        sqlQuery = `INSERT INTO Users (user_mobile, password, verified) 
                    VALUES (@user_mobile, @password , @verified)`;
        const req13 = pool.request()
            .input('user_mobile', sql.BigInt, 1234567890)
            .input('password', sql.NVarChar, await bcrypt.hash('password4', 10))
            .input('verified', sql.Bit, 1);
        await req13.query(sqlQuery);
        const req14 = pool.request()
            .input('user_mobile', sql.BigInt, 1234567891)
            .input('password', sql.NVarChar, await bcrypt.hash('password6', 10))
            .input('verified', sql.Bit, 1);
        await req14.query(sqlQuery);

        // Get all user_id from the inserted data
        user_ids.push(0);
        for(let i=1;i<9;i++) {
            const result = await pool.request()
                .input('user_email', sql.NVarChar, `user${i}@gmail.com`)
                .query(`SELECT user_id,user_email FROM Users WHERE user_email=@user_email`);
            user_ids.push(result.recordset[0].user_id);
        }
        let result = await pool.request()
            .input('user_mobile', sql.BigInt, 1234567890)
            .query(`SELECT user_id,user_mobile FROM Users WHERE user_mobile=@user_mobile`);
        user_ids.push(result.recordset[0].user_id);
        result = await pool.request()
            .input('user_mobile', sql.BigInt, 1234567891)
            .query(`SELECT user_id,user_mobile FROM Users WHERE user_mobile=@user_mobile`);
        user_ids.push(result.recordset[0].user_id);


        sqlQuery = `INSERT INTO Otp_Verification (user_email, otp, generate_time) 
                    VALUES (@user_email, @otp , @generate_time)`;
        const req9 = pool.request()
            .input('user_email', sql.NVarChar, 'user5@gmail.com')
            .input('otp', sql.NVarChar, '123455')
            .input('generate_time', sql.DateTime2, new Date());
        await req9.query(sqlQuery);
        const req11 = pool.request()
            .input('user_email', sql.NVarChar, 'user7@gmail.com')
            .input('otp', sql.NVarChar, '123457')
            .input('generate_time', sql.DateTime2, new Date(2002, 2, 22));
        await req11.query(sqlQuery);
        const req12 = pool.request()
            .input('user_email', sql.NVarChar, 'user8@gmail.com')
            .input('otp', sql.NVarChar, '123455')
            .input('generate_time', sql.DateTime2, new Date());
        await req12.query(sqlQuery);

        sqlQuery = `INSERT INTO Otp_Verification (user_mobile, otp, generate_time) 
                    VALUES (@user_mobile, @otp , @generate_time)`;
        const req10 = pool.request()
            .input('user_mobile', sql.BigInt, 1234567891)
            .input('otp', sql.NVarChar, '123456')
            .input('generate_time', sql.DateTime2, new Date());
        await req10.query(sqlQuery);


        for(let i=0;i<11;i++) {
            accessTokens.push(jwt.sign({ userId: user_ids[i] }, process.env.ACCESS_TOKEN_SECRET || 'access'));
        }
    });

    describe('GET /', () => {
        it('Should successfully fetch the user data', async () => {
            const response = await request(app).get('/user')
                .set('Authorization', accessTokens[1]);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: "success", msg: "User data was avaliable", result: expect.any(Object) });
        });

        it('Should handle no record error', async () => {
            const response = await request(app).get('/user')
                .set('Authorization', accessTokens[0]);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ output: "error", msg: "User data was not found" });
        });

        it('Should handle server side error', async () => {
            app.locals.db = undefined;
            const response = await request(app).get('/user')
                .set('Authorization', accessTokens[0]);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: "fail", msg: 'Internal Server Error' });
            app.locals.db = pool;
        });
    });

    describe('POST /CHANGEPASSWORD ', () => {
        it('Should successfully change password', async () => {
            const response = await request(app).post('/user/changepassword')
                .set('Authorization', accessTokens[2])
                .field({
                    old_password: 'password2',
                    new_password: 'new_password'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: "success", msg: "Password was changes successfully" });
        });

        it('Should handle user not found error', async () => {
            const response = await request(app).post('/user/changepassword')
                .set('Authorization', accessTokens[0])
                .field({
                    old_password: 'old_password',
                    new_password: 'new_password'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ output: "error", msg: "User data was not found" });
        });

        it('Should handle incorrect old password error', async () => {
            const response = await request(app).post('/user/changepassword')
                .set('Authorization', accessTokens[1])
                .field({
                    old_password: 'wrong_password', // Incorrect old password
                    new_password: 'new_password'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ output: "error", msg: "Old password does not match" });
        });

        it('Should handle server side error', async () => {
            app.locals.db = undefined;
            const response = await request(app).post('/user/changepassword')
                .set('Authorization', accessTokens[0])
                .field({
                    old_password: 'old_password',
                    new_password: 'new_password'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: "fail", msg: 'Internal Server Error' });
            app.locals.db = pool;
        });

    });

    describe('POST /RESETOTP', () => {
        it('Should successfully generate reset OTP for email', async () => {
            const response = await request(app).post('/user/generateResetOtp')
                .set('Authorization', accessTokens[3])
                .field({
                    user_email: 'user3@gmail.com'
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Reset OTP sent successfully' });
        });
    
        it('Should successfully generate reset OTP for mobile', async () => {
            const response = await request(app).post('/user/generateResetOtp')
                .set('Authorization', accessTokens[9])
                .field({
                    user_mobile: 1234567890
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Reset OTP sent successfully' });
        });
    
        it('Should handle user email not found error', async () => {
            const response = await request(app).post('/user/generateResetOtp')
                .set('Authorization', accessTokens[0])
                .field({
                    user_email: 'nonexistent@example.com'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ output: 'fail', msg: 'This email does not exist, please sign up instead.' });
        });
    
        it('Should handle user mobile not found error', async () => {
            const response = await request(app).post('/user/generateResetOtp')
                .set('Authorization', accessTokens[0])
                .field({
                    user_mobile: 1234567800
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ output: 'fail', msg: 'This mobile number does not exist, please sign up instead.' });
        });
    
        it('Should handle server side error', async () => {
            app.locals.db = undefined;
            const response = await request(app).post('/user/generateResetOtp')
                .set('Authorization', accessTokens[0])
                .field({
                    user_email: 'example@example.com'
                });
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Server error' });
            app.locals.db = pool;
        });
    });

    describe('POST /RESETPASSWORD', () => {
        it('Should successfully reset password for email', async () => {
            const response = await request(app).post('/user/resetPassword')
                .set('Authorization', accessTokens[5])
                .field({
                    user_email: 'user5@gmail.com',
                    otp: '123455',
                    password: 'new_password'
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Password reset successfully' });
        });
    
        it('Should successfully reset password for mobile', async () => {
            const response = await request(app).post('/user/resetPassword')
                .set('Authorization', accessTokens[10])
                .field({
                    user_mobile: 1234567891,
                    otp: '123456',
                    password: 'new_password'
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Password reset successfully' });
        });
    
        it('Should handle OTP expired error', async () => {
            const response = await request(app).post('/user/resetPassword')
                .set('Authorization', accessTokens[7])
                .field({
                    user_email: 'user7@gmail.com',
                    otp: '123457',
                    password: 'new_password'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ output: 'fail', msg: 'OTP expired, please regenerate' });
        });
    
        it('Should handle invalid OTP error', async () => {
            const response = await request(app).post('/user/resetPassword')
                .set('Authorization', accessTokens[8])
                .field({
                    user_email: 'user8@gmail.com',
                    otp: '000000',
                    password: 'new_password'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ output: 'fail', msg: 'Invalid OTP' });
        });
    
        it('Should handle server side error', async () => {
            app.locals.db = undefined;
            const response = await request(app).post('/user/resetPassword')
                .set('Authorization', accessTokens[0])
                .field({
                    user_email: 'example@example.com',
                    otp: '123456',
                    password: 'new_password'
                });
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting data' });
            app.locals.db = pool;
        });
    });


    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];

        ['user1@gmail.com','user2@gmail.com','user3@gmail.com','user4@gmail.com','user5@gmail.com','user6@gmail.com','user7@gmail.com','user8@gmail.com'].forEach(async (user_email) => {
            const cleanupRequest = pool.request()
                .input('user_email', sql.NVarChar, user_email);
            const sqlQuery = `DELETE FROM Otp_Verification WHERE user_email = @user_email;
                              DELETE FROM Users WHERE user_email = @user_email;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });
        [1234567890, 1234567891].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Otp_Verification WHERE user_mobile = @user_mobile;
                              DELETE FROM Users WHERE user_mobile = @user_mobile;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    });
});
