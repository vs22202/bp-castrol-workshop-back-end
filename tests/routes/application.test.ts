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
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3MTA4NTM2Njl9.mO7lYbQHaBrhHH0ZfIjGz1AsmqZpOlmqPbU-980_T6I")
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
        }, 30000);

        it('Should handle error during application data upload', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .post('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3MTA4NTM2Njl9.mO7lYbQHaBrhHH0ZfIjGz1AsmqZpOlmqPbU-980_T6I")
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
        }, 30000);
    });

    describe('GET /', () => {
        it('Should fetch application data successfully', async () => {
            const response = await request(app)
                .get('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3MTA4NTM1NzJ9.7TayaqdsMGd8MsDfyfiM4P28JGI-wDfU5b0QXYqs4MA");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Record fetched successfully', result: expect.any(Object) });
        });

        it('Should handle error during application data fetch', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .get('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3MTA4NTM1NzJ9.7TayaqdsMGd8MsDfyfiM4P28JGI-wDfU5b0QXYqs4MA");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error in fetching data' });
            app.locals.db = pool;
        });
    });

    
    describe('POST /edit', () => {
        it('Should edit application successfully', async () => {
            // Assuming you have a valid token and application data in your testing database
            const response = await request(app)
                .post('/application/edit')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU4LCJpYXQiOjE3MTA4NTM2NDJ9.-w2MNB0LMdxWcWbBSAYvh1nnwa--ZPOuhugd-MFaoMQ")
                .field({
                    workshop_name: 'edited workshop',
                    brands: 'Sample brands updated'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'application updated successfully' });
        });

        it('Should handle error during application edit', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .post('/application/edit')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU4LCJpYXQiOjE3MTA4NTM2NDJ9.-w2MNB0LMdxWcWbBSAYvh1nnwa--ZPOuhugd-MFaoMQ")
                .field({
                    workshop_name: 'Test Workshop 2',
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error inserting application' });
            app.locals.db = pool;
        });
    });
    
    describe('GET USER /', () => {
        it('Should fetch application data of perticular user successfully', async () => {
            const response = await request(app)
                .get('/application/getUserApplication')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3MTA4NTM1NzJ9.7TayaqdsMGd8MsDfyfiM4P28JGI-wDfU5b0QXYqs4MA");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Record fetched successfully', result: expect.any(Object) });
        });

        it('Should handle user with no applications', async () => {
            const response = await request(app)
                .get('/application/getUserApplication')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYwLCJpYXQiOjE3MTA4NTY4Nzh9.zR0ul7hvXRkImj0-deEZfSIJC7nBDvxT_uDmoIvJfmY");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'no records', msg: 'No application found', result: expect.any(Object) });
        });

        it('Should handle error during application data of perticular user', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .get('/application')
                .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3MTA4NTM1NzJ9.7TayaqdsMGd8MsDfyfiM4P28JGI-wDfU5b0QXYqs4MA");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error in fetching data' });
            app.locals.db = pool;
        });
    });

    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];

        /**
         * Sample emails and applications with tokes
         * 
         * fakemail1@gmail.com , password1, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3MTA4NTM1NzJ9.7TayaqdsMGd8MsDfyfiM4P28JGI-wDfU5b0QXYqs4MA
         * 
         * lacev33817@fryshare.com, password 2, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU4LCJpYXQiOjE3MTA4NTM2NDJ9.-w2MNB0LMdxWcWbBSAYvh1nnwa--ZPOuhugd-MFaoMQ
         * 
         * adam@example.com, password3, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3MTA4NTM2Njl9.mO7lYbQHaBrhHH0ZfIjGz1AsmqZpOlmqPbU-980_T6I
         * 
         * norecordmail@gmail.com, password4, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYwLCJpYXQiOjE3MTA4NTY4Nzh9.zR0ul7hvXRkImj0-deEZfSIJC7nBDvxT_uDmoIvJfmY
         */

        ['1234567890'].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Applications WHERE user_mobile = @user_mobile;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    });
});
