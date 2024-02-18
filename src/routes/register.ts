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
        // Create a new request
        const pool : ConnectionPool = req.app.locals.db;
        const request = await pool.request();
        
        request.input('user_email', sql.NVarChar, user.user_email);
        request.input('password', sql.NVarChar, user.password);

        const sqlQuery = `
            INSERT INTO Users (user_email, password) VALUES (@user_email, @password)
        `;
        
        // Execute the query
        const result = await request.query(sqlQuery);
        console.log('User registerd successfully:', result.rowsAffected);
        res.status(201).json({msg : 'User registerd successfully'});

    } catch(error) {
        console.log(error);
        res.status(500).json({msg : 'Error inserting data'});
    }

});

module.exports = router;