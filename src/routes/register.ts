import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import multer from 'multer';
import sql, { ConnectionPool } from 'mssql';
import { User } from '../models/user';
import crypto from 'crypto';
import SENDMAIL from '../utils/mail';
import { Options } from 'nodemailer/lib/mailer';

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
    let sqlQuery: string;

    try {
        // Create a new request
        const pool: ConnectionPool = req.app.locals.db;


        // Save user data
        const insertUserRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email)
            .input('password', sql.NVarChar, user.password);
        sqlQuery = `INSERT INTO Users (user_email, password) VALUES (@user_email, @password)`;
        const result1 = await insertUserRequest.query(sqlQuery);
        if (result1.rowsAffected[0] !== 1)
            throw new Error('Error adding user to Users table');


        // Add hash string for email verification
        const hashString = crypto.createHash('md5').update(user.user_email + process.env.HASH_CONSTANT).digest('hex');
        const addHashRequest = pool.request()
            .input('hash_key', sql.NVarChar, hashString)
            .input('user_email', sql.NVarChar, user.user_email);
        sqlQuery = `INSERT INTO email_verification (hash_key, user_email) VALUES (@hash_key, @user_email)`;
        const result2 = await addHashRequest.query(sqlQuery);
        if (result2.rowsAffected[0] !== 1)
            throw new Error('Error adding user to email verification table');


        // Mail clickable link to user for verification
        const options: Options = {
            from: process.env.SENDER_EMAIL,
            to: user.user_email,
            subject: "Email Verification",
            text: "This is sample test mail"
        };
        SENDMAIL(options, (info: any) => {
            console.log("Email sent successfully");
            console.log("MESSAGE ID: ", info.messageId);
        });


        // Send response
        res.status(201).json({ msg: 'User registerd successfully' });

    } catch (error) {
        // Handle error
        console.log(error);
        res.status(500).json({ msg: 'Error inserting data' });
    }

});

module.exports = router;