import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import multer from 'multer';
import sql, { ConnectionPool } from 'mssql';
import { User } from '../models/user';

// Define requeired variables
const router = Router();
const upload = multer({ storage: fileStorage });

/**
 * Router
 *      POST - To register new user in database
 */

router.post('/', upload.any(), async (req: Request, res: Response) => {
    // Create user object
    const user: User = new User(req.body.user_email, req.body.password);
    const otp = req.body.otp;
    let sqlQuery: string;

    try {
        // Create a new request
        const pool: ConnectionPool = req.app.locals.db;


        // Verify OTP from Otp_Verification table
        const retriveOtpRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email);
        sqlQuery = `SELECT otp,generate_time FROM Otp_Verification WHERE user_email=@user_email`;
        const retriveOtpResult = await retriveOtpRequest.query(sqlQuery);
        if (Date.now() - retriveOtpResult.recordset[0].generate_time > 300000) {
            res.status(400).json({ output: 'fail', msg: 'OTP expired, please regenrate' });
            return;
        }
        else if (otp !== retriveOtpResult.recordset[0].otp) {
            res.status(400).json({ output: 'fail', msg: 'Invalid OTP' });
            return;
        }
        else {
            user.verified = true;
        }


        // Update Otp_Verification table
        const deleteOtpRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email);
        sqlQuery = `DELETE FROM Otp_Verification WHERE user_email=@user_email`;
        const deleteOtpResult = await deleteOtpRequest.query(sqlQuery);
        if (deleteOtpResult.rowsAffected[0] !== 1)
            throw new Error('Could not delete from Otp_Verification table');


        // Save data to Users table
        const insertUserRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email)
            .input('password', sql.NVarChar, user.password)
            .input('verified', sql.Bit, user.verified);
        sqlQuery = `INSERT INTO Users (user_email, password, verified) VALUES (@user_email, @password, @verified)`;
        const insertUserResult = await insertUserRequest.query(sqlQuery);
        if (insertUserResult.rowsAffected[0] !== 1)
            throw new Error('Error adding user to Users table');


        // Send response
        res.status(201).json({ output: 'success', msg: 'User registerd successfully' });

    } catch (error) {
        // Handle error
        console.log(error);
        res.status(500).json({ output: 'fail', msg: 'Error inserting data' });
    }

});

module.exports = router;