import request from 'supertest';
import app from '../../src';

describe('Login Router', () => {
    it('should successfully login with valid credentials', async () => {
        // Assuming you have a user with verified status and valid credentials in your testing database
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'john@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ output: 'success', msg: 'Login Success', user: expect.any });
    });

    it('should fail login with invalid credentials', async () => {
        // Assuming you have a user with verified status but invalid credentials in your testing database
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'test@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'Invalid Email/Password' });
    });

    it('should fail login for unverified user', async () => {
        // Assuming you have an unverified user in your testing database
        const response = await request(app)
            .post('/login')
            .field({
                user_email: 'emily@example.com',
                password: 'safepassword321'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ output: 'fail', msg: 'User not verified' });
    });

    /*it('should handle SQL error during login', async () => {
        // Close the testing database connection to simulate an error
        await pool.close();

        const response = await request(server)
            .post('/login')
            .send({ user_email: 'test@example.com', password: 'testpassword' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ output: 'fail', msg: 'Server side error' });
    });*/

});
