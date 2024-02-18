// Database 
import { initializeDB } from './db';
// Functions, variables
import express, { Request, Response, NextFunction } from 'express';
// Routes
const applicationRoute = require('./routes/application');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Database
initializeDB()
    .then( (sqlPool) => {
        app.locals.db = sqlPool;
    });

//  Routes
app.use('/application', applicationRoute);

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