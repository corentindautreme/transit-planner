import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import linesRoute from './routes/lines.route';
import * as OpenApiValidator from 'express-openapi-validator';
import { ValidationError } from 'express-openapi-validator/dist/framework/types';
import departuresRoute from './routes/departures.route';

const app = express();

app.use(OpenApiValidator.middleware({
    apiSpec: 'openapi.yaml'
}))

app.use(helmet());
app.use(express.json());
app.use(express.static("public"));

// API Routes
app.use('/lines', linesRoute);
app.use('/departures', departuresRoute);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// app.use((err: ValidationError, req: Request, res: Response, next: NextFunction) => {
//     // format error
//     res.status(err.status || 500).json({
//         message: err.message,
//         errors: err.errors,
//     });
// });

export default app;