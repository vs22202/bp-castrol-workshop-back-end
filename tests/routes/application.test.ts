import request from 'supertest';
import app from '../../src';
import { initializeDB } from '../../src/db';
import sql from 'mssql'
import * as mail from '../../src/utils/mail';
import * as authenticate from '../../src/utils/authenticate';
import { Options } from 'nodemailer/lib/mailer';
import { Request, Response, NextFunction } from 'express';


let pool: sql.ConnectionPool;
describe('Application Router', () => {

    beforeAll(async () => {
        jest.spyOn(authenticate, "authenticateJWT")
            .mockImplementation(async (req: Request, res: Response, next: NextFunction) => {
                next();
            });
        jest.spyOn(mail, "default")
            .mockImplementation(async (options: Options, callback: any) => {
                callback({ messageId: "test_messsage" });
            });

        pool = await initializeDB();
        app.locals.db = pool;
    });

    describe('POST /', () => {
        it('Should upload application data successfully', async () => {
            const response = await request(app)
                .post('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsImlhdCI6MTcxMDEzNDY0NH0.Utx7oLEkzwlvIUOI_-5dn0jfNr37mt1oiB9pizlzn-8")
                .field({
                    workshop_name: 'Test Workshop',
                    workshop_post_code: '12345',
                    address: '123 Main Street',
                    state: 'Sample State',
                    city: 'Sample City',
                    user_name: 'John Doe',
                    user_mobile: '1234567890',
                    bay_count: 5,
                    services_offered: 'Sample Services',
                    expertise: 'Sample Expertise',
                    brands: 'Sample Brands',
                    consent_process_data: true,
                    consent_being_contacted: true,
                    consent_receive_info: true,
                })
                .attach('files', 'src/uploads/1707294310151-pexels-pixabay-207498.jpg');

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ output: 'success', msg: 'Application inserted successfully' });
        }, 15000);

        it('Should handle error during application data upload', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .post('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsImlhdCI6MTcxMDEzNDY0NH0.Utx7oLEkzwlvIUOI_-5dn0jfNr37mt1oiB9pizlzn-8")
                .field({
                    workshop_name: 'Test Workshop 1',
                    workshop_post_code: '12345',
                    address: '123 Main Street',
                    state: 'Sample State 1',
                    city: 'Sample City 1',
                    user_name: 'John Doe 1',
                    user_mobile: '1234567891',
                    bay_count: 5,
                    services_offered: 'Sample Services 1',
                    expertise: 'Sample Expertise 1',
                    brands: 'Sample Brands 1',
                    consent_process_data: true,
                    consent_being_contacted: true,
                    consent_receive_info: true,
                })
                .attach('files', 'src/uploads/1707294310151-pexels-pixabay-207498.jpg');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting application' });
            app.locals.db = pool;
        }, 15000);
    });

    describe('GET /', () => {
        it('Should fetch application data successfully', async () => {
            const response = await request(app)
                .get('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsImlhdCI6MTcxMDEzNDY0NH0.Utx7oLEkzwlvIUOI_-5dn0jfNr37mt1oiB9pizlzn-8");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Record fetched successfully', result: expect.any(Object) });
        });

        it('Should handle error during application data fetch', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .get('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsImlhdCI6MTcxMDEzNDY0NH0.Utx7oLEkzwlvIUOI_-5dn0jfNr37mt1oiB9pizlzn-8");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error in fetching data' });
            app.locals.db = pool;
        });
    });

    /*
    describe('POST /edit', () => {
        it('Should edit application successfully', async () => {
            // Assuming you have a valid token and application data in your testing database
            const response = await request(app)
                .post('/edit')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsImlhdCI6MTcxMDEzNDY0NH0.Utx7oLEkzwlvIUOI_-5dn0jfNr37mt1oiB9pizlzn-8")
                .field({
                    workshop_name: 'Test Workshop',
                    application_status: 'Pending',
                    brands: 'Sample brands updated'
                })
                .attach('files', 'src/uploads/1707294310151-pexels-pixabay-207498.jpg');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'application updated successfully' });
        });

        it('Should handle error during application edit', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .post('/edit')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDUsImlhdCI6MTcxMDEzNDY0NH0.Utx7oLEkzwlvIUOI_-5dn0jfNr37mt1oiB9pizlzn-8")
                .field({
                    workshop_name: 'Test Workshop',
                    application_status: 'Pending'
                })
                .attach('files', 'path_to_file');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting application' });
            app.locals.db = pool;
        });
    });
    */

    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];
        // ['yulmaharka@gufum.com'].forEach(async (user_email) => {
        //     const cleanupRequest = pool.request()
        //         .input('user_email', sql.NVarChar, user_email);
        //     const sqlQuery = `DELETE FROM Applications WHERE user_email = @user_email;`;
        //     databasePromises.push(cleanupRequest.query(sqlQuery));
        // });
        ['1234567890', '1234567891'].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Applications WHERE user_mobile = @user_mobile;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    });
});
