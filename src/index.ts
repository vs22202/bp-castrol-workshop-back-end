import express, { Request, Response, NextFunction } from 'express';
import applicationRoutes from './routes/application';
import { fileStorage } from './utils/multer';
import multer from 'multer';

const app = express();
const port = process.env.PORT || 3000;

app.use(multer({ storage: fileStorage}).array('photos', 12));
app.use('/application', applicationRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Welcome!');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});
if (process.env.TEST != 'true') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
export default app;