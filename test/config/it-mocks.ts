import { NextFunction, Request, Response } from 'express';

jest.mock('../../src/lib/db/client');

jest.mock('../../src/lib/auth/auth.middleware', () => ({
    authenticatedUser: (req: Request, res: Response, next: NextFunction) => next()
}));

