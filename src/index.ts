import { initializeDB } from './db';
import express, { Request, Response } from 'express';
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

//  Routes
app.use('/application', require('./routes/application').default);
app.use('/register', require('./routes/register').default);
app.use('/login', require('./routes/login').default);
app.use('/generateOtp', require('./routes/generateOtp').default);

app.get('/', (req: Request, res: Response) => {
    res.send('Application started');
});


// Listen on PORT
if (process.env.MODE != 'test') {
    // Initialize Database
    initializeDB()
        .then((pool) => {
            app.locals.db = pool;
            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        });
}
else {
    app.listen(0, async function () {
        // const pool = await initializeDB();
        // app.locals.db = pool;
    });
}

export default app;