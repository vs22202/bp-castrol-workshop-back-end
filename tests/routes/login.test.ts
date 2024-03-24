import request from 'supertest';
import app from '../../src';
import sql from 'mssql'
import { initializeDB } from '../../src/db';
import bcrypt from "bcryptjs";
import * as authenticate from '../../src/utils/authenticate';
import { Request, Response, NextFunction } from 'express';

let pool: sql.ConnectionPool
describe('Login Router', () => {

    beforeAll(async () => {
        pool = await initializeDB();
        app.locals.db = pool;

        jest.spyOn(authenticate, "authenticateJWTLogin")
            .mockImplementation(async (req: Request, res: Response, next: NextFunction) => {
                next();
            });

        let sqlQuery: string;
        sqlQuery = `INSERT INTO Users (user_email, password, verified) 
                    VALUES (@user_email, @password , @verified)`;
        const setupRequest = pool.request()
            .input('user_email', sql.NVarChar, 'testlogin2@example.com')
            .input('password', sql.NVarChar, await bcrypt.hash('password123', 10))
            .input('verified', sql.Bit, 1);
        await setupRequest.query(sqlQuery);
        const setupRequest2 = pool.request()
            .input('user_email', sql.NVarChar, 'testlogin@example.com')
            .input('password', sql.NVarChar, await bcrypt.hash('password123', 10))
            .input('verified', sql.Bit, 1);
        await setupRequest2.query(sqlQuery);
        const setupUnverifiedUserRequest = pool.request()
            .input('user_email', sql.NVarChar, 'emily@example.com')
            .input('password', sql.NVarChar, await bcrypt.hash('safepassword321', 10))
            .input('verified', sql.Bit, 0);
        await setupUnverifiedUserRequest.query(sqlQuery);

        sqlQuery = `INSERT INTO Users (user_mobile, password, verified) 
                    VALUES (@user_mobile, @password , @verified)`;
        const setupMobileRequest = pool.request()
            .input('user_mobile', sql.BigInt, 1234567891)
            .input('password', sql.NVarChar, await bcrypt.hash('password123', 10))
            .input('verified', sql.Bit, 1);
        await setupMobileRequest.query(sqlQuery);
        const setupUnverifiedMobileUserRequest = pool.request()
            .input('user_mobile', sql.BigInt, 1234567892)
            .input('password', sql.NVarChar, await bcrypt.hash('unverified123', 10))
            .input('verified', sql.Bit, 0);
        await setupUnverifiedMobileUserRequest.query(sqlQuery);
    });

    /**
     * Email tests
     */

    it('Should successfully login with valid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'testlogin2@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'Login Success', user: expect.any(Object), auth_token: expect.any(String) });
    });

    it('Should fail login with invalid password', async () => {
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'testlogin@example.com',
                password: 'password13'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid Password' });
    });

    it('Should fail login with invalid email', async () => {
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'invalidmail@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid Email' });
    });

    it('Should fail login for unverified user', async () => {
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'emily@example.com',
                password: 'safepassword321'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'User not verified' });
    });

    it('Should handle SQL error during login', async () => {
        app.locals.db = undefined;

        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'test@example.com',
                password: 'testpassword'
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server side error' });
        app.locals.db = pool;
    });

    /**
     * Mobile tests
     */

    it('Should successfully mobile login with valid credentials', async () => {
        const response = await request(app)
            .post('/login/mobile')
            .field({
                user_mobile: 1234567891,
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'Login Success', user: expect.any(Object), auth_token: expect.any(String) });
    });

    it('Should fail mobile login with invalid password', async () => {
        const response = await request(app)
            .post('/login/mobile')
            .field({
                user_mobile: 1234567891,
                password: 'invalidpassword'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid Password' });
    });

    it('Should fail mobile login with invalid mobile no.', async () => {
        const response = await request(app)
            .post('/login/mobile')
            .field({
                user_mobile: 1234567890,
                password: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid Mobile No.' });
    });

    it('Should fail mobile login for unverified mobile user', async () => {
        const response = await request(app)
            .post('/login/mobile')
            .field({
                user_mobile: 1234567892,
                password: 'unverified123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'User not verified' });
    });

    it('Should handle SQL error during mobile login', async () => {
        app.locals.db = undefined;

        const response = await request(app)
            .post('/login/mobile')
            .field({
                user_mobile: 1234567891,
                password: 'password123'
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server side error' });
        app.locals.db = pool;
    });

    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];

        ['testlogin2@example.com','testlogin@example.com' , 'emily@example.com'].forEach(async (user_email) => {
            const cleanupRequest = pool.request()
                .input('user_email', sql.NVarChar, user_email);
            const sqlQuery = `DELETE FROM Users WHERE user_email = @user_email`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });
        [1234567891, 1234567892].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Users WHERE user_mobile = @user_mobile`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    })

});
