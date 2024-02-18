// Database 
import { initializeDB } from './db';
// Functions, variables
import express, { Request, Response, NextFunction } from 'express';
// Routes
const applicationRoute = require('./routes/application');
const registerUser = require('./routes/register')
const loginUser = require('./routes/login')

const app = express();
const port = process.env.PORT || 3000;

// Initialize Database
initializeDB()
    .then( (sqlPool) => {
        app.locals.db = sqlPool;
    });

//  Routes
app.use('/application', applicationRoute);
app.use('/register', registerUser);
app.use('/login', loginUser);

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