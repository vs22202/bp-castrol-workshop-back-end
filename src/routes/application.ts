import { Router, Request, Response } from 'express';
import { Application } from '../models/application';


//use express-validator for validating fields 
// Link : https://dev.to/wizdomtek/typescript-express-building-robust-apis-with-nodejs-1fln

/**
 * The application upload module
 */
const router = Router();

router.post('/', (req: Request, res: Response) => {
    const application: Application = {
        Workshop_Name: req.body.workshop_name,
        User_Name: req.body.user_name,
    };
    Application.insert(application).then((application_id) => {
        res.status(200).json(application_id);
    });
});

router.get('/', (req: Request, res: Response) => {
    Application.findAll().then((result) => {
        res.json(result);
    });
    
});

export default router;