import express, { Request, Response } from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.static("public"));

// API Routes

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

export default app;