import request from 'supertest';
import app from '../../src';
import { initializeDB } from '../../src/db';
import sql from 'mssql'
import * as mail from '../../src/utils/mail';
import * as firebase from '../../src/utils/firebase';
import { Options } from 'nodemailer/lib/mailer';
import jwt from 'jsonwebtoken';
import { ApplicationStatus } from '../../src/models/application';


let pool: sql.ConnectionPool;
let accessTokens: string[] = [];

describe('Application Router', () => {

    beforeAll(async () => {
        jest.spyOn(mail, "default")
            .mockImplementation(async (options: Options, callback: any) => {
                callback({ messageId: "test_messsage" });
            });

        jest.spyOn(firebase, "deleteFileFromStorage")
            .mockImplementation(async (fileUrl: string) => {
                console.log('entered mock function');
            });
        

        pool = await initializeDB();
        app.locals.db = pool;

        for (let i = 0; i < 4; i++) {
            accessTokens.push(jwt.sign({ userId: i }, process.env.ACCESS_TOKEN_SECRET || 'access'));
        }

        let sqlQuery: string;
        let request: sql.Request;
        let sampelData = [
            {
                workshop_name: 'Sample Workshop 1',
                workshop_post_code: '123456',
                address: '123 Main Street',
                state: 'Sample State',
                city: 'Sample City',
                user_name: 'User 1',
                user_mobile: '1234567891',
                bay_count: 50,
                services_offered: 'Sample Services',
                expertise: 'Sample Expertise',
                brands: 'Sample Brands',
                consent_process_data: true,
                consent_being_contacted: true,
                consent_receive_info: true,
                file_paths: [],
                user_id: 1
            },
            {
                workshop_name: 'Sample Workshop 2',
                workshop_post_code: '123457',
                address: '123 Main Street',
                state: 'Sample State',
                city: 'Sample City',
                user_name: 'User 2',
                user_mobile: '1234567892',
                bay_count: 5,
                services_offered: 'Sample Services',
                expertise: 'Sample Expertise',
                brands: 'Sample Brands',
                consent_process_data: true,
                consent_being_contacted: false,
                consent_receive_info: false,
                file_paths: [],
                user_id: 2
            }
        ]
        sqlQuery = `
                INSERT INTO Applications 
                (workshop_name, workshop_post_code, address, state, city, user_name, user_mobile, bay_count, services_offered, expertise, brands, consent_process_data, consent_being_contacted, consent_receive_info, file_paths, application_status, last_modified_date,user_id) 
                VALUES (@workshop_name, @workshop_post_code, @address, @state, @city, @user_name, @user_mobile, @bay_count, @services_offered, @expertise, @brands, @consent_process_data, @consent_being_contacted, @consent_receive_info, @file_paths, @application_status, @last_modified_date,@user_id)
            `;

        sampelData.forEach(async (data) => {
            request = pool.request()
                .input('workshop_name', sql.NVarChar, data.workshop_name)
                .input('workshop_post_code', sql.NVarChar, data.workshop_post_code)
                .input('address', sql.NVarChar, data.address)
                .input('state', sql.NVarChar, data.state)
                .input('city', sql.NVarChar, data.city)
                .input('user_name', sql.NVarChar, data.user_name)
                .input('user_mobile', sql.NVarChar, data.user_mobile)
                .input('bay_count', sql.Int, data.bay_count)
                .input('services_offered', sql.NVarChar, data.services_offered)
                .input('expertise', sql.NVarChar, data.expertise)
                .input('brands', sql.NVarChar, data.brands)
                .input('consent_process_data', sql.Bit, data.consent_process_data)
                .input('consent_being_contacted', sql.Bit, data.consent_being_contacted)
                .input('consent_receive_info', sql.Bit, data.consent_receive_info)
                .input('file_paths', sql.NVarChar, JSON.stringify(data.file_paths))
                .input('application_status', sql.NVarChar, ApplicationStatus.Pending)
                .input('last_modified_date', sql.DateTime2, (new Date()).toISOString())
                .input('user_id', sql.Int, data.user_id)
            await request.query(sqlQuery);
        })
    });

    describe('POST /', () => {
        it('Should upload application data successfully', async () => {
            const response = await request(app)
                .post('/application')
                .set("Authorization", accessTokens[0])
                .field({
                    workshop_name: 'Test Workshop',
                    workshop_post_code: '123458',
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
                .set("Authorization", accessTokens[0])
                .field({
                    workshop_name: 'Test Workshop 1',
                    workshop_post_code: '123456',
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
                .set("Authorization", accessTokens[1]);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Record fetched successfully', result: expect.any(Object) });
        });

        it('Should handle error during application data fetch', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .get('/application')
                .set("Authorization", accessTokens[1]);

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
                .set("Authorization", accessTokens[2])
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
                .set("Authorization", accessTokens[2])
                .field({
                    workshop_name: 'Test Workshop 2',
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error editing application' });
            app.locals.db = pool;
        });
    });

    describe('GET USER /', () => {
        it('Should fetch application data of perticular user successfully', async () => {
            const response = await request(app)
                .get('/application/getUserApplication')
                .set("Authorization", accessTokens[1]);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'success', msg: 'Record fetched successfully', result: expect.any(Object) });
        });

        it('Should handle user with no applications', async () => {
            const response = await request(app)
                .get('/application/getUserApplication')
                .set("Authorization", accessTokens[3]);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ output: 'no records', msg: 'No application found', result: expect.any(Object) });
        });

        it('Should handle error during application data of perticular user', async () => {
            app.locals.db = undefined;
            const response = await request(app)
                .get('/application')
                .set("Authorization", accessTokens[1]);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ output: 'fail', msg: 'Error in fetching data' });
            app.locals.db = pool;
        });
    });

    afterAll(async () => {
        const databasePromises: Promise<sql.IResult<any>>[] = [];

        ['1234567890', '1234567891', '1234567892'].forEach(async (user_mobile) => {
            const cleanupRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            const sqlQuery = `DELETE FROM Applications WHERE user_mobile = @user_mobile;`;
            databasePromises.push(cleanupRequest.query(sqlQuery));
        });

        await Promise.all(databasePromises);
        await pool.close();
    });
});
