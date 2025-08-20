import { NextFunction, Request, Response } from 'express';
import { authenticatedUser } from '../../src/lib/auth/auth.middleware';
import { authenticatedUserSpy } from '../config/auth.mock';
import request from 'supertest';
import app from '../../src/app';

describe('Auth middleware tests', () => {
    it('should reject unauthenticated requests with a 401 error', async () => {
        authenticatedUserSpy.mockImplementation(async (req: Request, res: Response, next: NextFunction) => {
            authenticatedUserSpy.mockRestore();
            return authenticatedUser(req, res, next);
        });
        const response = await request(app).get('/stops');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: 'Unauthenticated'});
    });

    it('should reject authenticated but unauthorized requests with a 403 error', async () => {
        const response = await request(app).get('/stops').set('Authorization', 'Bearer clearly not authorized');
        expect(response.status).toBe(403);
        expect(response.body).toEqual({error: 'Unauthorized'});
    });

    it('should reject authenticated requests with a 403 error if no email is returned from the token verification', async () => {
        const response = await request(app).get('/stops').set('Authorization', 'Bearer no_email');
        expect(response.status).toBe(403);
        expect(response.body).toEqual({error: 'Unauthorized'});
    });

    it('should reject authenticated requests with a 403 error if a technical error occurs during token verification', async () => {
        const response = await request(app).get('/stops').set('Authorization', 'Bearer force_error');
        expect(response.status).toBe(403);
        expect(response.body).toEqual({error: 'Unauthorized'});
    });

    it('should accept authenticated and authorized requests', async () => {
        // an Authorization header is injected on requests without Bearer tokens (see auth.mock.ts)
        const response = await request(app).get('/stops');
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
    });
});