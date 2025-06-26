import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import linesRoute from './routes/lines.route';
import * as OpenApiValidator from 'express-openapi-validator';
import { ValidationError } from 'express-openapi-validator/dist/framework/types';
import departuresRoute from './routes/departures.route';
import * as YAML from 'yaml';
import * as fs from 'node:fs';
import * as SwaggerUI from 'swagger-ui-express';

const app = express();

app.use(OpenApiValidator.middleware({
    apiSpec: 'openapi.yaml',
    // ignorePaths: (path: string) => path.startsWith('/public'),
    ignoreUndocumented: true
}));

const swaggerDoc = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDoc));

app.use(cors());
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

app.use((err: Error | ValidationError, req: Request, res: Response, next: NextFunction) => {
    if (!(err instanceof Error)) {
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        });
    } else {
        console.error(err);
        res.status(500).json({error: err.message});
    }
});

export default app;