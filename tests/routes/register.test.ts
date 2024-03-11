import request from 'supertest';
import { initializeDB } from '../../src/db';
import app from '../../src';

describe('Register Router', () => {
    
    it('should successfully register a user with valid OTP', async () => {
        // Assuming you have a valid OTP and user details in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'mike@example.com',
                password: 'testpassword',
                otp: '345678',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'User registered successfully' });
    });

    it('should fail registration with an expired OTP', async () => {
        // Assuming you have an expired OTP in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'nonexistent1@example.com',
                password: 'testpassword',
                otp: '234567',
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'OTP expired, please regenerate' });
    });

    it('should fail registration with an invalid OTP', async () => {
        // Assuming you have an invalid OTP in your testing database
        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'nonexistent2@example.com',
                password: 'testpassword',
                otp: '123456',
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid OTP' });
    });

    it('should handle SQL error during registration', async () => {
        // Close the testing database connection to simulate an error
        const pool = app.locals.db;
        // await pool.close();

        const response = await request(app)
            .post('/register')
            .field({
                user_email: 'test@example.com',
                password: 'testpassword',
                otp: 'validotp',
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting data' });
        // initializeDB()
        //     .then((pool) => {
        //         app.locals.db = pool;
        //     });
    });

});

