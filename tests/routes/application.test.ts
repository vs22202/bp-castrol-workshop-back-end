import request from 'supertest';
import app from '../../src';
import { initializeDB } from '../../src/db';

describe('Application Router', () => {
    let pool = app.locals.db;
    describe('POST /', () => {
        it('should upload application data successfully', async () => {
            const response = await request(app)
            .post('/application')
            .field('workshop_name', 'Test Workshop')
            .field('workshop_post_code', '12345') // Replace with actual workshop post code
            .field('address', '123 Main Street') // Replace with actual address
            .field('state', 'Sample State') // Replace with actual state
            .field('city', 'Sample City') // Replace with actual city
            .field('user_name', 'John Doe')
            .field('user_email', 'john.doe@example.com') // Replace with actual email
            .field('user_mobile', 1234567890) // Replace with actual mobile number
            .field('bay_count', 5) // Replace with actual bay count
            .field('services_offered', 'Sample Services') // Replace with actual services
            .field('expertise', 'Sample Expertise') // Replace with actual expertise
            .field('brands', 'Sample Brands') // Replace with actual brands
            .field('consent_process_data', true)
            .field('consent_being_contacted', true)
            .field('consent_receive_info', true)
            .attach('files', 'D:\\capstone project\\bp-castrol-workshop-back-end\\src\\uploads\\1707294310151-pexels-pixabay-207498.jpg');

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ output: 'success', msg: 'Application inserted successfully' });
        });

        it('should handle error during application data upload', async () => {
            
            const response = await request(app)
                .post('/application')
                .field('workshop_name', 'Test Workshop')
                .field('username', 'John Doe')
                .attach('files', 'D:\\capstone project\\bp-castrol-workshop-back-end\\src\\uploads\\1707294310151-pexels-pixabay-207498.jpg');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting application' });
        });
    });

    describe('GET /', () => {
        it('should fetch application data successfully', async () => {
            const response = await request(app).get('/application');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Record fetched successfully', result: expect.any(Object) });
        });

        it('should handle error during application data fetch', async () => {
            // Close the testing database connection to simulate an error
            // await pool.close();

            const response = await request(app).get('/application');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error in fetching data' });
            // initializeDB()
            // .then((pool) => {
            //     app.locals.db = pool;
            // });
        });
    });
});
