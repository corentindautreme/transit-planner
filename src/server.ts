import app from './app';
import { config } from 'dotenv';
import http from 'http';

config();

const PORT: number = parseInt(process.env.PORT || '4000', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';

const server = new http.Server(app);

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
server.listen(PORT, () => {
    console.log(`
        Server running in ${NODE_ENV} mode
        Listening on port ${PORT}
        Ready to handle requests
    `);
});

