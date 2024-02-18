import { Router, Request, Response } from 'express';
import { fileStorage } from '../utils/multer';
import multer from 'multer';
import sql, { ConnectionPool } from 'mssql';
import { User } from '../models/user';

const router = Router();
const upload = multer({storage : fileStorage});

router.post('/', upload.any() , async (req: Request, res: Response) => {
    const user : User = new User(req.body.user_email, req.body.password);
    
    try {
        // Get database connection
        const pool: ConnectionPool = req.app.locals.db;
        const request = await pool.request();

        // Add parameters to request
        request.input('user_email', sql.NVarChar, user.user_email);
        request.input('password', sql.NVarChar, user.password);

        // Prepare query
        const sqlQuery = `
            SELECT COUNT(*) AS count FROM Users WHERE user_email = @user_email AND password = @password
        `;

        // Execute sql querry
        const result = await request.query(sqlQuery);
        const count = result.recordset[0].count;

        if(count>0)
            res.status(200).json({msg : 'Login Success'});
        else    
            res.status(200).json({msg : 'Invalid Email/Password'});
        
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({msg : 'Server side error'})
    }

});

module.exports = router;