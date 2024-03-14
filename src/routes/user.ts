import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import multer, { Multer } from 'multer';
import { CustomRequest, authenticateJWT } from '../utils/authenticate';
import sql, { ConnectionPool } from 'mssql'
import bcrypt from "bcryptjs"
import { Options } from 'nodemailer/lib/mailer';
import generateOTP from '../utils/generateOtp';
import sendOTPWhatsapp from '../utils/mobile_message';
import SENDMAIL from '../utils/mail';
import { User } from '../models/user';

const router: Router = Router();
const upload: Multer = multer({ storage: fileStorage });
const otpTimeout: number = 300000;

router.get('/', [authenticateJWT], async (req: Request, res: Response) => {
    const user_id = parseInt((req as CustomRequest).token.userId)
    try {
        // Query the database
        const pool: sql.ConnectionPool = req.app.locals.db;

        const request = pool.request();
        request.input('user_id', sql.Int, user_id)
        const result = await request.query('SELECT * FROM Users WHERE user_id=@user_id');
        if (result.recordset.length === 0) {
            return res.status(201).json({ output: "error", msg: "User data was not found" });
        }
        const { password, ...user } = result.recordset[0];
        res.status(200).json({ output: "success", msg: "User data was avaliable", result: user });
    } catch (error) {
        console.error('Error querying users:', error);
        res.status(500).json({ output: "fail", msg: 'Internal Server Error' });
    }
});

router.post('/changepassword', [authenticateJWT, upload.any()], async (req: Request, res: Response) => {
    const user_id = parseInt((req as CustomRequest).token.userId)
    const { old_password, new_password } = req.body;
    try {
        // Query the database
        const pool: sql.ConnectionPool = req.app.locals.db;

        const request = pool.request();
        request.input('user_id', sql.Int, user_id)
        const result = await request.query('SELECT * FROM Users WHERE user_id=@user_id');
        if (result.recordset.length === 0) {
            return res.status(201).json({ output: "error", msg: "User data was not found" });
        }
        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(old_password, user.password);
        if (!passwordMatch) {
            return res.status(201).json({ output: "error", msg: "Old password does not match" });
        }
        const hashed_password = await bcrypt.hash(new_password, 10);
        const updateRequest = pool.request();
        updateRequest.input('user_id', sql.Int, user_id)
        updateRequest.input('new_password', sql.VarChar, hashed_password)
        await updateRequest.query('UPDATE Users SET password=@new_password WHERE user_id=@user_id');
        res.status(200).json({ output: "success", msg: "Password was changes successfully" });
    } catch (error) {
        console.error('Error querying users:', error);
        res.status(500).json({ output: "fail", msg: 'Internal Server Error' });
    }
});

//write a route that handles forgot password and sends an email to the user with a link to reset password
router.post('/generateResetOtp',upload.any(), async (req: Request, res: Response) => {
    if (req.body.user_email) {
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
            if (verifiedStatus.recordset.length == 0) {
                res.status(400).json({ output: 'fail', msg: 'User Email does not exist. Please SignUp' });
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
                subject: "Reset Password",
                text: `Your OTP for reset password is ${otp}.\nDo not share the OTP with anyone.\n`
            };
            SENDMAIL(options, (info: any) => {
                console.log("OTP Generated Email sent successfully");
                console.log("MESSAGE ID: ", info.messageId);
            });


            // Send response
            res.status(200).json({ output: 'success', msg: 'Reset OTP sent successfully' });

        } catch (error) {
            // Handle error
            console.log(error);
            res.status(500).json({ output: 'fail', msg: 'Server error' });
        }

    }
    else if (req.body.user_mobile) {
        const user_mobile = req.body.user_mobile;
        let sqlQuery: string
        try {
            const pool: ConnectionPool = req.app.locals.db;
            // Check if user is verified
            const verifiedStatusRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            sqlQuery = `SELECT * 
                FROM Users 
                WHERE user_mobile=@user_mobile`;
            const verifiedStatus = await verifiedStatusRequest.query(sqlQuery);
            if (verifiedStatus.recordset.length === 0) {
                res.status(400).json({ output: 'fail', msg: 'User Mobile does not exist. Please SignUp Instead.' });
                return;
            }
            // Generate OTP
            const otp: string = generateOTP()
            // Check OTP table
            const checkOtpExistRequest = pool.request()
                .input('user_mobile', sql.BigInt, user_mobile);
            sqlQuery = `SELECT COUNT(*) AS count 
                    FROM Otp_Verification 
                    WHERE user_mobile=@user_mobile`;
            const checkOtpExistsResult = await checkOtpExistRequest.query(sqlQuery);

            if (checkOtpExistsResult.recordset[0].count > 0) {
                // Update OTP in table
                const updateOtpRequest = pool.request()
                    .input('otp', sql.NVarChar, otp)
                    .input('user_mobile', sql.BigInt, user_mobile)
                    .input('generate_time', sql.DateTime, new Date());
                sqlQuery = `UPDATE Otp_Verification 
                        SET otp=@otp, generate_time=@generate_time 
                        WHERE user_mobile=@user_mobile`;
                const updateOtpResult = await updateOtpRequest.query(sqlQuery);
                if (updateOtpResult.rowsAffected[0] !== 1)
                    throw new Error('Error updating OTP');
            }
            else {
                // Insert OTP to table
                const addOtpRequest = pool.request()
                    .input('otp', sql.NVarChar, otp)
                    .input('user_mobile', sql.BigInt, user_mobile)
                    .input('generate_time', sql.DateTime, new Date());
                sqlQuery = `INSERT INTO Otp_Verification (user_mobile, otp, generate_time) 
                        VALUES (@user_mobile, @otp , @generate_time)`;
                const addOtpResult = await addOtpRequest.query(sqlQuery);
                if (addOtpResult.rowsAffected[0] !== 1)
                    throw new Error('Error inserting OTP');
            }

            console.log("Sending whatsapp message to user mobile");
            sendOTPWhatsapp(user_mobile, otp);

            // Send response
            res.status(200).json({ output: 'success', msg: 'Reset OTP sent successfully' });
        } catch (error) {
            // Handle error
            console.log(error);
            res.status(500).json({ output: 'fail', msg: 'Server error' });
        }
    }
    else {
        res.status(500).json({ output: "fail", msg: 'Invalid request' })
    }

})
router.post('/resetPassword',upload.any(), async (req: Request, res: Response) => {
    if (req.body.user_email) {
        // Create user object
        const user: User = new User(req.body.password, req.body.user_email);
        const otp = req.body.otp;
        let sqlQuery: string;

        try {
            // Create a new request
            const pool: ConnectionPool = req.app.locals.db;

            // Retrive OTP from Otp_Verification table
            const retriveOtpRequest = pool.request()
                .input('user_email', sql.NVarChar, user.user_email);
            sqlQuery = `SELECT otp,generate_time 
                    FROM Otp_Verification 
                    WHERE user_email=@user_email`;
            const retriveOtpResult = await retriveOtpRequest.query(sqlQuery);

            // Verify OTP and Timeout
            const generate_time = (new Date(retriveOtpResult.recordset[0].generate_time)).getTime();
            const current_time = (new Date()).getTime();
            if (current_time - generate_time > otpTimeout) {
                res.status(400).json({ output: 'fail', msg: 'OTP expired, please regenrate' });
                return;
            }
            else if (otp !== retriveOtpResult.recordset[0].otp) {
                res.status(400).json({ output: 'fail', msg: 'Invalid OTP' });
                return;
            }

            // Update Otp_Verification table
            const deleteOtpRequest = pool.request()
                .input('user_email', sql.NVarChar, user.user_email);
            sqlQuery = `DELETE FROM Otp_Verification 
                    WHERE user_email=@user_email`;
            const deleteOtpResult = await deleteOtpRequest.query(sqlQuery);
            if (deleteOtpResult.rowsAffected[0] !== 1)
                throw new Error('Could not delete from Otp_Verification table');

            const hashed_password = await bcrypt.hash(user.password, 10);
            // Save data to Users table
            const updateUserRequest = pool.request()
                .input('user_email', sql.NVarChar, user.user_email)
                .input('password', sql.NVarChar, hashed_password)
            sqlQuery = 'UPDATE Users SET password=@password WHERE user_email=@user_email';
            const updateUserResult = await updateUserRequest.query(sqlQuery);
            if (updateUserResult.rowsAffected[0] !== 1)
                throw new Error('Error adding user to Users table');


            // Send response
            res.status(200).json({ output: 'success', msg: 'Password reset successfully' });

        } catch (error) {
            // Handle error
            console.log(error);
            res.status(500).json({ output: 'fail', msg: 'Error inserting data' });
        }

    }
    else if (req.body.user_mobile) {
        const user: User = new User(req.body.password, undefined, req.body.user_mobile);
        const otp = req.body.otp;
        let sqlQuery: string;

        try {
            // Create a new request
            const pool: ConnectionPool = req.app.locals.db;


            // Retrive OTP from Otp_Verification table
            const retriveOtpRequest = pool.request()
                .input('user_mobile', sql.BigInt, user.user_mobile);
            sqlQuery = `SELECT otp,generate_time 
                    FROM Otp_Verification 
                    WHERE user_mobile=@user_mobile`;
            const retriveOtpResult = await retriveOtpRequest.query(sqlQuery);


            // Verify OTP and Timeout
            const generate_time = (new Date(retriveOtpResult.recordset[0].generate_time)).getTime();
            const current_time = (new Date()).getTime();
            if (current_time - generate_time > otpTimeout) {
                res.status(400).json({ output: 'fail', msg: 'OTP expired, please regenrate' });
                return;
            }
            else if (otp !== retriveOtpResult.recordset[0].otp) {
                res.status(400).json({ output: 'fail', msg: 'Invalid OTP' });
                return;
            }

            // Update Otp_Verification table
            const deleteOtpRequest = pool.request()
                .input('user_mobile', sql.BigInt, user.user_mobile);
            sqlQuery = `DELETE FROM Otp_Verification 
                    WHERE user_mobile=@user_mobile`;
            const deleteOtpResult = await deleteOtpRequest.query(sqlQuery);
            if (deleteOtpResult.rowsAffected[0] !== 1)
                throw new Error('Could not delete from Otp_Verification table');

            const hashed_password = await bcrypt.hash(user.password, 10);
            // Save data to Users table
            const updateUserRequest = pool.request()
                .input('user_mobile', sql.BigInt, user.user_mobile)
                .input('password', sql.NVarChar, hashed_password)
            sqlQuery = 'UPDATE Users SET password=@password WHERE user_mobile=@user_mobile';
            const updateUserResult = await updateUserRequest.query(sqlQuery);
            if (updateUserResult.rowsAffected[0] !== 1)
                throw new Error('Error adding user to Users table');


            // Send response
            res.status(200).json({ output: 'success', msg: 'Password reset successfully' });

        } catch (error) {
            // Handle error
            console.log(error);
            res.status(500).json({ output: 'fail', msg: 'Error inserting data' });
        }
    }
    else {
        res.status(500).json({ output: "fail", msg: 'Invalid request' });
    }
})



export default router;