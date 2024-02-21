import { Router, Request, Response } from 'express';
import sql, { ConnectionPool } from 'mssql';

// Define requeired variables
const router = Router();

/**
 * Router
 *      GET - verify user email
 * 
 * email_verification table
 *      hash_key (@primary)     - string
 *      user_email              - string
 */

router.get('/', async (req: Request, res: Response) => {
    const { user_email, hash_key } = req.query;
    let sqlQuery: string;

    try {
        // Create a new request
        const pool: ConnectionPool = req.app.locals.db;


        // Check if user is verified
        const verifiedStatusRequest = pool.request()
            .input('user_email', sql.NVarChar, user_email);
        sqlQuery = `SELECT verified FROM Users WHERE user_email=@user_email`;
        const verifiedStatus: any = await verifiedStatusRequest.query(sqlQuery);
        if (verifiedStatus === 1)
            res.status(200).json({ msg: 'User already verified' });


        // Get user_email from hash_key
        const getMailRequest = pool.request()
            .input('hash_key', sql.NVarChar, hash_key);
        sqlQuery = `SELECT user_email FROM email_verification WHERE hash_key=@hash_key`;
        const storedMail: any = await getMailRequest.query(sqlQuery);
        if (storedMail !== user_email)
            res.status(400).json({ msg: 'Invalid verification link' });


        // Set user as verified
        const verifyUserRequest = pool.request()
            .input('user_email', sql.NVarChar, storedMail);
        sqlQuery = `UPDATE Users SET verified=1 WHERE user_email=@user_email`;
        const result1 = await verifyUserRequest.query(sqlQuery);
        if (result1.rowsAffected[0] !== 1)
            throw new Error('Could not update Users table');


        // Update email_verification table
        const deleteKeyRequest = pool.request()
            .input('hash_key', sql.NVarChar, hash_key);
        sqlQuery = `DELETE FROM email_verification WHERE hash_key=@hash_key`;
        const result2 = await deleteKeyRequest.query(sqlQuery);
        if (result2.rowsAffected[0] !== 1)
            throw new Error('Could not update email_verification table');


        // Send response
        res.status(200).json({ msg: 'Email verified successfully' });

    } catch (error) {
        // Handle error
        console.log(error);
        res.status(500).json({ msg: 'Server error' });
    }

});

module.exports = router;