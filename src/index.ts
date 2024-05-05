import { initializeDB } from './db';
import express, { Request, Response } from 'express';
import cors from "cors";
import {errorMorgan, infoMorgan} from "./logger/morgan-middleware";
import swaggerUi from 'swagger-ui-express';
import { getOpenApiSpecification } from './utils/openAPI';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

//  Routes
app.use('/application', require('./routes/application').default);
app.use('/register', require('./routes/register').default);
app.use('/login', require('./routes/login').default);
app.use('/generateOtp', require('./routes/generateOtp').default);
app.use('/user', require('./routes/user').default);
app.use('/castrol_admin', require('./routes/castrol_admin').default);

// Serve Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getOpenApiSpecification()));


app.get('/', (req: Request, res: Response) => {
    res.send('Application started');
});
app.get('/dbConnStatus', (req: Request, res: Response) => {
    if (app.locals.db == null) res.send({ output: 'fail', msg: 'Database connection could not be established.' });
    else res.send({ output: 'success', msg: 'Database connection was established.' });
});


// Listen on PORT
if (process.env.MODE != 'test') {
    // Initialize Database
    initializeDB(app)
        .then((pool) => {
            app.locals.db = pool;
            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        });
}

export default app;
