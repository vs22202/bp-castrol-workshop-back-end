import { Router, Request, Response } from 'express';
import { generateHTML } from '../utils/mail';
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const htmlContent = await generateHTML(req.query.auth_token as string);
    res.contentType('text/html');
    res.send(htmlContent);
});

export default router;
