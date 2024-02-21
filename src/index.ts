import { initializeDB } from './db';
import express, { Request, Response } from 'express';


const app = express();
const port = process.env.PORT || 3000;

// Initialize Database
initializeDB()
    .then((pool) => {
        app.locals.db = pool;
    });

//  Routes
app.use('/application', require('./routes/application'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/emailVerification', require('./routes/emailVerification'));

app.get('/', (req: Request, res: Response) => {
    res.send('Application started');
});


// Listen on PORT
if (process.env.TEST != 'true') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

export default app;