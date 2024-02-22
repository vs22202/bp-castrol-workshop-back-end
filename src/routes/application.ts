import { Router, Request, Response } from 'express';
import { Application } from '../models/application';
import sql, { ConnectionPool } from 'mssql';
import multer from 'multer';
import { fileStorage } from '../utils/multer';
import fse from 'fs-extra';

// Define required variables
const router = Router();
const upload = multer({ storage: fileStorage });

/**
 * Router
 *      POST  - To upload application data
 *      GET   - To show current table entries
 */

router.post('/', upload.any(), async (req: Request, res: Response) => {
    // Create Application object
    const application = new Application(req.body, req.files as Express.Multer.File[]);

    try {
        // Create a new request
        const pool: ConnectionPool = req.app.locals.db;
        const request = pool.request();

        // Add parameters to the request
        request.input('workshop_name', sql.NVarChar, application.workshop_name);
        request.input('workshop_post_code', sql.NVarChar, application.workshop_post_code);
        request.input('address', sql.NVarChar, application.address);
        request.input('state', sql.NVarChar, application.state);
        request.input('city', sql.NVarChar, application.city);
        request.input('user_name', sql.NVarChar, application.user_name);
        request.input('user_email', sql.NVarChar, application.user_email);
        request.input('user_mobile', sql.NVarChar, application.user_mobile);
        request.input('bay_count', sql.Int, application.bay_count);
        request.input('services_offered', sql.NVarChar, application.services_offered);
        request.input('expertise', sql.NVarChar, application.expertise);
        request.input('brands', sql.NVarChar, application.brands);
        request.input('consent_process_data', sql.Bit, application.consent_process_data);
        request.input('consent_being_contacted', sql.Bit, application.consent_being_contacted);
        request.input('consent_receive_info', sql.Bit, application.consent_receive_info);
        request.input('file_paths', sql.NVarChar, JSON.stringify(application.file_paths))

        // Prepare the SQL query
        const sqlQuery = `
            INSERT INTO Applications 
            (workshop_name, workshop_post_code, address, state, city, user_name, user_email, user_mobile, bay_count, services_offered, expertise, brands, consent_process_data, consent_being_contacted, consent_receive_info, file_paths) 
            VALUES (@workshop_name, @workshop_post_code, @address, @state, @city, @user_name, @user_email, @user_mobile, @bay_count, @services_offered, @expertise, @brands, @consent_process_data, @consent_being_contacted, @consent_receive_info, @file_paths)
        `;

        // Execute the query
        const result = await request.query(sqlQuery);
        console.log('Application inserted successfully:', result.rowsAffected);

        // Send the response
        res.status(201).json({ msg: 'Application inserted successfully' });

    } catch (error) {
        // Delete uploaded files
        application.file_paths.forEach((path : string) => {
            fse.remove(path, (err) => {
                if(err)
                    console.log("Could not delete file at path : ", path);
            });
        });

        // Handle error
        console.log('Error inserting application:', error);
        res.status(500).json({ msg: 'Error inserting application' });
    }

});

router.get('/', async (req: Request, res: Response) => {
    try {
        // Create request and execute query
        const pool: ConnectionPool = req.app.locals.db;
        const result = await pool.request().query('SELECT * FROM Applications');

        // Send the response
        res.status(200).json({ msg: 'Record fetched successfully', result: result });

    } catch (err: any) {
        // Handle error
        console.log(err);
        res.status(500).json({ msg: 'Error in fetching data' });
    }
});

module.exports = router;