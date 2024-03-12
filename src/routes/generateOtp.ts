import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import sql, { ConnectionPool } from 'mssql';
import multer, { Multer } from 'multer';
import SENDMAIL from '../utils/mail';
import { Options } from 'nodemailer/lib/mailer';
import generateOTP from '../utils/generateOtp';

// Define requeired variables
const router: Router = Router();
const upload: Multer = multer({ storage: fileStorage });
/**
 * Router
 *      POST - generate OTP and store in table
 * 
 * Otp_Verification table
 *      user_email (@primary)   - string
 *      otp                     - string
 *      generate_time           - datetime2
 */

router.post('/', upload.any(), async (req: Request, res: Response) => {
    const user_email = req.body.user_email;
    let sqlQuery: string;

    try {
        // Create a new request
        const pool: ConnectionPool = req.app.locals.db;


        // Check if user is verified
        const verifiedStatusRequest = pool.request()
            .input('user_email', sql.NVarChar, user_email);
        sqlQuery = `SELECT * 
                    FROM Users 
                    WHERE user_email=@user_email`;
        const verifiedStatus = await verifiedStatusRequest.query(sqlQuery);
        if (verifiedStatus.recordset[0]?.verified === true) {
            res.status(400).json({ output: 'fail', msg: 'User already verified' });
            return;
        }


        // Generate OTP
        const otp: string = generateOTP()
        // Check OTP table
        const checkOtpExistRequest = pool.request()
            .input('user_email', sql.NVarChar, user_email);
        sqlQuery = `SELECT COUNT(*) AS count 
                    FROM Otp_Verification 
                    WHERE user_email=@user_email`;
        const checkOtpExistsResult = await checkOtpExistRequest.query(sqlQuery);

        if (checkOtpExistsResult.recordset[0].count > 0) {
            // Update OTP in table
            const updateOtpRequest = pool.request()
                .input('otp', sql.NVarChar, otp)
                .input('user_email', sql.NVarChar, user_email)
                .input('generate_time', sql.DateTime, new Date());
            sqlQuery = `UPDATE Otp_Verification 
                        SET otp=@otp, generate_time=@generate_time 
                        WHERE user_email=@user_email`;
            const updateOtpResult = await updateOtpRequest.query(sqlQuery);
            if (updateOtpResult.rowsAffected[0] !== 1)
                throw new Error('Error updating OTP');
        }
        else {
            // Insert OTP to table
            const addOtpRequest = pool.request()
                .input('otp', sql.NVarChar, otp)
                .input('user_email', sql.NVarChar, user_email)
                .input('generate_time', sql.DateTime, new Date());
            sqlQuery = `INSERT INTO Otp_Verification (user_email, otp, generate_time) 
                        VALUES (@user_email, @otp , @generate_time)`;
            const addOtpResult = await addOtpRequest.query(sqlQuery);
            if (addOtpResult.rowsAffected[0] !== 1)
                throw new Error('Error inserting OTP');
        }


        // Mail OTP to user for verification
        const options: Options = {
            from: process.env.SENDER_EMAIL,
            to: user_email,
            subject: "Email Verification",
            text: `Your OTP for email verification is ${otp}.\nDo not share the OTP with anyone.\n`
        };
        SENDMAIL(options, (info: any) => {
            console.log("OTP Generated Email sent successfully");
            console.log("MESSAGE ID: ", info.messageId);
        });


        // Send response
        res.status(200).json({ output: 'success', msg: 'OTP send successfully' });

    } catch (error) {
        // Handle error
        console.log(error);
        res.status(500).json({ output: 'fail', msg: 'Server error' });
    }

});

export default router;