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
            res.status(400).json({ output: 'fail', msg: 'User not verified' });
            return;
        }


        // Login user
        const loginRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email)
            .input('password', sql.NVarChar, user.password);
        sqlQuery = `SELECT user_id,user_email FROM Users WHERE user_email = @user_email AND password = @password`;
        loginRequest.query(sqlQuery).then((result) => {
            if (result.recordset.length == 0) {
                res.status(400).json({ output: 'fail', msg: 'Invalid Email/Password' });
                return;
            }
            res.status(200).json({ output: 'success', msg: 'Login Success', user:result.recordset[0]});

        })
        

        // console.log(loginResult.recordset[0])
        // // Send response
        // if (count > 0)
        //     res.status(200).json({ output: 'success', msg: 'Login Success', });
        // else
        //     res.status(400).json({ output: 'fail', msg: 'Invalid Email/Password' });

    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ output: 'fail', msg: 'Server side error' });
    }

});

module.exports = router;