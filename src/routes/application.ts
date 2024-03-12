import { Router, Request, Response } from 'express';
import { Application, UpdateApplication } from '../models/application';
import sql, { ConnectionPool } from 'mssql';
import multer, { Multer } from 'multer';
import { fileStorage } from '../utils/multer';
import fse from 'fs-extra';
import { CustomRequest, authenticateJWT } from '../utils/authenticate'
import SENDMAIL, { generateHTML, generateHTMLUpdate } from '../utils/mail';
import { Options } from 'nodemailer/lib/mailer';
// Define required variables
const router: Router = Router();
const upload: Multer = multer({ storage: fileStorage });

/**
 * Router
 *      POST  - To upload application data
 *      GET   - To show current table entries
 */

router.post('/',[authenticateJWT,upload.any()], async (req: Request, res: Response) => {
    // Create Application object
    const application: Application = new Application(req.body);
    const user_id = parseInt((req as CustomRequest).token.userId)
    application.uploadFiles(req.files as Express.Multer.File[]).then(async () => {

        try {
            // Create a new request
            const pool: ConnectionPool = req.app.locals.db;
            const request: sql.Request = pool.request();
            // Add parameters to the request
            request.input('workshop_name', sql.NVarChar, application.workshop_name);
            request.input('workshop_post_code', sql.NVarChar, application.workshop_post_code);
            request.input('address', sql.NVarChar, application.address);
            request.input('state', sql.NVarChar, application.state);
            request.input('city', sql.NVarChar, application.city);
            request.input('user_name', sql.NVarChar, application.user_name);
            request.input('user_mobile', sql.NVarChar, application.user_mobile);
            request.input('bay_count', sql.Int, application.bay_count);
            request.input('services_offered', sql.NVarChar, application.services_offered);
            request.input('expertise', sql.NVarChar, application.expertise);
            request.input('brands', sql.NVarChar, application.brands);
            request.input('consent_process_data', sql.Bit, application.consent_process_data);
            request.input('consent_being_contacted', sql.Bit, application.consent_being_contacted);
            request.input('consent_receive_info', sql.Bit, application.consent_receive_info);
            request.input('file_paths', sql.NVarChar, JSON.stringify(application.file_paths));
            request.input('application_status', sql.NVarChar, application.application_status);
            request.input('last_modified_date', sql.DateTime2, application.last_modified_date);
            request.input('user_id', sql.Int, user_id);

            // Prepare the SQL query
            const sqlQuery = `
                INSERT INTO Applications 
                (workshop_name, workshop_post_code, address, state, city, user_name, user_mobile, bay_count, services_offered, expertise, brands, consent_process_data, consent_being_contacted, consent_receive_info, file_paths, application_status, last_modified_date,user_id) 
                VALUES (@workshop_name, @workshop_post_code, @address, @state, @city, @user_name, @user_mobile, @bay_count, @services_offered, @expertise, @brands, @consent_process_data, @consent_being_contacted, @consent_receive_info, @file_paths, @application_status, @last_modified_date,@user_id)
            `;

            // Execute the query
            const result = await request.query(sqlQuery);
            console.log('Application inserted successfully:', result.rowsAffected);
            //Send New Application Added Alert
            const options: Options = {
                from: process.env.SENDER_EMAIL,
                to: process.env.CASTROL_ADMIN_EMAIL,
                subject: `New Certificate Application Submitted by ${application.workshop_name}`,
                text: `A new workshop has submitted an application. The workshop name is ${application.workshop_name}.`,
                html: `<html>
                <div style="padding-block: 32px;padding-inline: 72px;text-transform: capitalize;">
                  <h2 style="margin: 0;padding: 0;font-size: 40;font-weight: bold;color: rgba(0, 153, 0, 1);">
                    A New Application For Certification Has Been Submitted By A Workshop
                  </h2>
                  <h3 style="margin: 0;padding: 0;color: rgba(102, 102, 102, 1);font-size: 28px;font-weight: 500;">The Submitted Data is attached below.</h3>
                </div>
            </html>`,
                attachments: [
                    {
                        filename: 'WorkshopData.html',
                        content:generateHTML(application)
                    }
                ]
            };
            SENDMAIL(options, (info: any) => {
                console.log("Application Created Email sent successfully");
                console.log("MESSAGE ID: ", info.messageId);
            });
            // Send the response
            res.status(201).json({ output: 'success', msg: 'Application inserted successfully' });

        } catch (error) {
            // Delete uploaded files
            application.file_paths.forEach((path: string) => {
                fse.remove(path, (err) => {
                    if (err)
                        console.log("Could not delete file at path : ", path);
                });
            });

            // Handle error
            console.log('Error inserting application:', error);
            res.status(500).json({ output: 'fail', msg: 'Error inserting application' });
        }
    })

});

router.get('/', authenticateJWT, async (req: Request, res: Response) => {
    try {
        // Create request and execute query
        const pool: ConnectionPool = req.app.locals.db;

        const result = await pool.request().query('SELECT * FROM Applications');

        // Send the response
        res.status(200).json({ output: 'success', msg: 'Record fetched successfully', result: result });

    } catch (err: any) {
        // Handle error
        console.log(err);
        res.status(500).json({ output: 'fail', msg: 'Error in fetching data' });
    }
});
router.post("/edit", [authenticateJWT,upload.any()], async (req: Request, res: Response) => {
    const application: UpdateApplication = new UpdateApplication(req.body);
    const user_id = parseInt((req as CustomRequest).token.userId)
    application.uploadFiles(req.files as Express.Multer.File[]).then(async () => {
        try {
            const pool: ConnectionPool = req.app.locals.db;
            const request: sql.Request = pool.request();
            if (application.filesOld) {
                application.file_paths = application.file_paths?.concat(application.filesOld)
            }
            let field: keyof UpdateApplication;
            let setUpdates = 'SET '
            for (field in application) {
                if (field == "filesOld" || field == "uploadFiles") continue;
                setUpdates += `${field} = @${field}, `
                if (field == 'file_paths') {
                    application.setSQLInput(request, field, JSON.stringify(application[field]))
                    continue;
                }
                application.setSQLInput(request, field, application[field])
            }
            request.input("user_id",sql.Int,user_id)
            setUpdates = setUpdates.slice(0, -2);
            const sqlQuery = `UPDATE Applications ${setUpdates} WHERE user_id = @user_id`
            const result = await request.query(sqlQuery);
            console.log('Application updated successfully:', result.rowsAffected);
            //Send New Application Added Alert
            const request2 = pool.request();
            request2.input('user_id', sql.Int, user_id);
            const sqlQuery2 = "SELECT workshop_name,application_status FROM Applications WHERE user_id = @user_id"
            const result2 = await request2.query(sqlQuery2);
            if (result2.recordset[0].application_status != "Pending") {
                const options: Options = {
                    from: process.env.SENDER_EMAIL,
                    to: process.env.CASTROL_ADMIN_EMAIL,
                    subject: `New Update Has Been Submitted by ${result2.recordset[0].workshop_name}`,
                    text: `A new update has been made to an application. The workshop name is ${result2.recordset[0].workshop_name}.`,
                    html: `<html>
                    <div style="padding-block: 32px;padding-inline: 72px;text-transform: capitalize;">
                      <h2 style="margin: 0;padding: 0;font-size: 40;font-weight: bold;color: rgba(0, 153, 0, 1);">
                        A New Update Has Been Made By A Workshop
                      </h2>
                      <h3 style="margin: 0;padding: 0;color: rgba(102, 102, 102, 1);font-size: 28px;font-weight: 500;">Find the changes attached below.</h3>
                    </div>
                </html>`,
                    attachments: [
                        {
                            filename: 'WorkshopDataUpdate.html',
                            content:generateHTMLUpdate(application)
                        }
                    ]
                };
                SENDMAIL(options, (info: any) => {
                    console.log("Application Edited Email sent successfully");
                    console.log("MESSAGE ID: ", info.messageId);
                });
            }
            
            res.status(200).json({ output: 'success', msg: 'application updated successfully' });
        }
        catch (error) {
            console.log('Error inserting application:', error);
            res.status(500).json({ output: 'fail', msg: 'Error inserting application' });
        }
    })
})
router.get('/getUserApplication', authenticateJWT, async (req: Request, res: Response) => {
    const user_id = parseInt((req as CustomRequest).token.userId)
    try {
        // Create request and execute query
        const pool: ConnectionPool = req.app.locals.db;
        const request: sql.Request = pool.request()
        request.input('user_id', sql.Int, user_id);
        const sqlQuery = 'SELECT * FROM Applications WHERE user_id=@user_id'
        const result = await request.query(sqlQuery);
        if (result.recordset.length == 0) {
            res.status(200).json({ output: 'no records', msg: 'No application found', result: result });
            return;
        }
        // Send the response
        res.status(200).json({ output: 'success', msg: 'Record fetched successfully', result: result.recordset[0] });

    } catch (err: any) {
        // Handle error
        console.log(err);
        res.status(500).json({ output: 'fail', msg: 'Error in fetching data' });
    }
})

export default router;