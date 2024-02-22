import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import multer from 'multer';
import sql, { ConnectionPool } from 'mssql';
import { User } from '../models/user';

// Define required variables
const router = Router();
const upload = multer({ storage: fileStorage });

/**
 * Router
 *      POST - To validate user login details from database
 */

router.post('/', upload.any(), async (req: Request, res: Response) => {
    // Create user object
    const user: User = new User(req.body.user_email, req.body.password);
    let sqlQuery: string;

    try {
        // Get database connection
        const pool: ConnectionPool = req.app.locals.db;


        // Check if user email is verified
        const verifiedStatusRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email);
        sqlQuery = `SELECT * FROM Users WHERE user_email=@user_email`;
        const verifiedStatus = await verifiedStatusRequest.query(sqlQuery);
        if (verifiedStatus.recordset[0].verified === false) {
            res.status(400).json({ msg: 'User not verified' });
            return;
        }


        // Login user
        const loginRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email)
            .input('password', sql.NVarChar, user.password);
        sqlQuery = `SELECT COUNT(*) AS count FROM Users WHERE user_email = @user_email AND password = @password`;
        const result = await loginRequest.query(sqlQuery);
        const count = result.recordset[0].count;


        // Send response
        if (count > 0)
            res.status(200).json({ msg: 'Login Success' });
        else
            res.status(400).json({ msg: 'Invalid Email/Password' });

    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ msg: 'Server side error' });
    }

});

module.exports = router;