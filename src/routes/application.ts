import { Router, Request, Response } from 'express';
import { Application } from '../models/application';
import sql, { ConnectionPool } from 'mssql';
import multer from 'multer';
import { fileStorage } from '../utils/multer';

const router = Router();
const upload = multer({storage : fileStorage});

//use express-validator for validating fields 
// Link : https://dev.to/wizdomtek/typescript-express-building-robust-apis-with-nodejs-1fln

/**
 * The application upload module
 */

router.post('/', upload.any(), async (req: Request, res: Response) => {
    // Application.insert(application).then((application_id) => {
        //     res.status(200).json(application_id);
        // });
        
    // try {
    //     const application: Application = new Application(JSON.stringify(req.body));
    //     const pool = await req.app.locals.db;
    //     const result = await pool.request()
    //                             .input('workshop_name',sql.VarChar(50) , application.workshop_name)
    //                             .input('user_name' , sql.VarChar(50) , application.user_name)
    //                             .query('INSERT INTO Applications VALUES (@workshop_name,@user_name);');

    //     console.log(result);
    //     res.status(200).json({msg : 'Record inserted successfully'});

    // } catch(err : any) {
    //     console.log(err);
    //     res.status(500).json({msg : err.stack});
    // }

    const application = new Application(req.body, req.files as Express.Multer.File[]);

    try {
        // Create a new request
        const pool : ConnectionPool = req.app.locals.db;
        const request = await pool.request();
        
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
            (workshop_name, workshop_post_code, address, state, constructority, user_name, user_email, user_mobile, bay_count, services_offered, expertise, brands, consent_process_data, consent_being_contacted, consent_receive_info, file_paths) 
            VALUES (@workshop_name, @workshop_post_code, @address, @state, @city, @user_name, @user_email, @user_mobile, @bay_count, @services_offered, @expertise, @brands, @consent_process_data, @consent_being_contacted, @consent_receive_info, @file_paths)
        `;
        
        // Execute the query
        const result = await request.query(sqlQuery);
        console.log('Application inserted successfully:', result.rowsAffected);
        res.status(201).json({msg : 'Application inserted successfully'});
        
    } catch (error) {
        console.error('Error inserting application:', error);
        res.status(500).json({msg : 'Error inserting application'});
    }

});

router.get('/', async (req: Request, res: Response) => {
    // Application.findAll().then((result) => {
    //     res.json(result);
    // });
    
    try {
        // Create request
        const pool : ConnectionPool = req.app.locals.db;
        const result = await pool.request().query('SELECT * FROM Applications');
        
        // Send response
        res.status(200).json({msg : 'Record fetched successfully', result : result});

    } catch(err : any) {
        console.log(err);
        res.status(500).json({msg : 'Error in fetching data'});
    }
});

module.exports = router;