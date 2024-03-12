import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import multer, { Multer } from 'multer';
import sql, { ConnectionPool } from 'mssql';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv = require('dotenv');
import { authenticateJWTLogin } from '../utils/authenticate';
import bcrypt from "bcryptjs"
dotenv.config();

// Define required variables
const router: Router = Router();
const upload: Multer = multer({ storage: fileStorage });

/**
 * Router
 *      POST - To validate user login details from database
 */

router.post('/', [upload.any(),authenticateJWTLogin], async (req: Request, res: Response) => {
    // Create user object
    const user: User = new User(req.body.password,req.body.user_email);
    let sqlQuery: string;
    try {
        // Get database connection
        const pool: ConnectionPool = req.app.locals.db;

        // Check if user email is verified
        const verifiedStatusRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email);
        sqlQuery = `SELECT * 
                    FROM Users 
                    WHERE user_email=@user_email`;
        const verifiedStatus = await verifiedStatusRequest.query(sqlQuery);
        if (verifiedStatus.recordset[0].verified === false) {
            res.status(400).json({ output: 'fail', msg: 'User not verified' });
            return;
        }


        // Login user
        const loginRequest = pool.request()
            .input('user_email', sql.NVarChar, user.user_email);
        sqlQuery = `SELECT user_id,user_email,password 
                    FROM Users 
                    WHERE user_email = @user_email`;
        loginRequest.query(sqlQuery)
            .then(async (result) => {
                if (result.recordset.length == 0)
                    res.status(400).json({ output: 'fail', msg: 'Invalid Email/Password' });
                else {
                    const passwordMatch = await bcrypt.compare(user.password, result.recordset[0].password);
                    if (passwordMatch) {
                        const accessToken = jwt.sign({userId: result.recordset[0].user_id}, process.env.ACCESS_TOKEN_SECRET || 'access');
                        res.status(200).json({ output: 'success', msg: 'Login Success', user: result.recordset[0], auth_token: accessToken});
                    }
                    else {
                        res.status(400).json({ output: 'fail', msg: 'Invalid Email/Password' });
                    }
                }
                    
            })


    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ output: 'fail', msg: 'Server side error' });
    }

});
/**
 * Router
 *      POST - To validate user login details from database
 */

router.post('/mobile', [upload.any(),authenticateJWTLogin], async (req: Request, res: Response) => {
    // Create user object
    const user: User = new User(req.body.password,undefined,req.body.user_mobile);
    let sqlQuery: string;
    try {
        // Get database connection
        const pool: ConnectionPool = req.app.locals.db;

        // Login user
        const loginRequest = pool.request()
            .input('user_mobile', sql.BigInt, user.user_mobile);
        sqlQuery = `SELECT user_id,user_mobile,password 
                    FROM Users 
                    WHERE user_mobile = @user_mobile`;
        loginRequest.query(sqlQuery)
            .then(async (result) => {
                if (result.recordset.length == 0)
                    res.status(400).json({ output: 'fail', msg: 'Invalid Mobile No./Password' });
                else {
                    const passwordMatch = await bcrypt.compare(user.password, result.recordset[0].password);
                    if (passwordMatch) {
                        const accessToken = jwt.sign({userId: result.recordset[0].user_id}, process.env.ACCESS_TOKEN_SECRET || 'access');
                        res.status(200).json({ output: 'success', msg: 'Login Success', user: result.recordset[0], auth_token: accessToken});
                    }
                    else {
                        res.status(400).json({ output: 'fail', msg: 'Invalid Mobile No./Password' });
                    }
                }
                    
            })


    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ output: 'fail', msg: 'Server side error' });
    }

});

export default router;