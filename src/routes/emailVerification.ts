import { Router, Request, Response } from 'express';
import sql, { ConnectionPool } from 'mssql';

// Define requeired variables
const router = Router();

/**
 * Router
 *      GET - verify user email
 * 
 * Email_Verification table
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
        sqlQuery = `SELECT * FROM Users WHERE user_email=@user_email`;
        const verifiedStatus = await verifiedStatusRequest.query(sqlQuery);
        if (verifiedStatus.recordset[0].verified === true) {
            res.status(200).json({ msg: 'User already verified' });
            return;
        }
        
        
        // Get user_email from hash_key
        const getMailRequest = pool.request()
        .input('hash_key', sql.NVarChar, hash_key);
        sqlQuery = `SELECT * FROM Email_Verification WHERE hash_key=@hash_key`;
        const storedMail = await getMailRequest.query(sqlQuery);
        if (storedMail.recordset[0].user_email !== user_email) {
            res.status(400).json({ msg: 'Invalid verification link' });
            return;
        }


        // Set user as verified
        const verifyUserRequest = pool.request()
            .input('user_email', sql.NVarChar, user_email);
        sqlQuery = `UPDATE Users SET verified=1 WHERE user_email=@user_email`;
        const result1 = await verifyUserRequest.query(sqlQuery);
        if (result1.rowsAffected[0] !== 1)
            throw new Error('Could not update Users table');


        // Update Email_Verification table
        const deleteKeyRequest = pool.request()
            .input('hash_key', sql.NVarChar, hash_key);
        sqlQuery = `DELETE FROM Email_Verification WHERE hash_key=@hash_key`;
        const result2 = await deleteKeyRequest.query(sqlQuery);
        if (result2.rowsAffected[0] !== 1)
            throw new Error('Could not update Email_Verification table');


        // Send response
        res.status(200).json({ msg: 'Email verified successfully' });

    } catch (error) {
        // Handle error
        console.log(error);
        res.status(500).json({ msg: 'Server error' });
    }

});

module.exports = router;