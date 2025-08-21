import { authenticatedUser } from '../../src/lib/auth/auth.middleware';
import { prismaMock } from './prisma.mock';
import { PrismaPromise } from '../../generated/prisma';
import util from 'node:util';
import * as authMiddleware from '../../src/lib/auth/auth.middleware';
import type { NextFunction, Request, Response } from 'express';

jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => ({
        verifyIdToken: jest.fn().mockImplementation((options: { idToken: string }) => {
            // default token injected into all unauthenticated incoming requests
            if (options.idToken === 'authorized') {
                return {getPayload: () => ({email: 'authorized@user.com'})};
            }
            // to force unhappy flow 1 - no email included by the OAuth2 backend in the returned payload
            else if (options.idToken === 'no_email') {
                return {getPayload: () => ({})};
            }
            // to force unhappy flow 2 - calling the OAuth2 backend raises an error
            else if (options.idToken === 'force_error') {
                throw new Error('Oh no');
            }
            // no token, or none of the above cases => unauthorized user
            else {
                return {getPayload: () => ({email: 'unauthorized@user.com'})};
            }
        })
    }))
}));

export const authenticatedUserSpy = jest.spyOn(authMiddleware, 'authenticatedUser');

beforeEach(() => {
    // inject a valid Bearer token if no Authorization header is present, then call the real middleware function to go
    // through the authorization flow
    authenticatedUserSpy.mockImplementation(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization) {
            req.headers.authorization = 'Bearer authorized';
        }
        authenticatedUserSpy.mockRestore();
        return authenticatedUser(req, res, next);
    });

    // a single user 'authorized@user.com' to the whitelist
    prismaMock.whitelist.findFirst.mockImplementation((query) => {
        return Promise.resolve(
            util.isDeepStrictEqual(query, {where: {email: 'authorized@user.com'}}) ? {id: 1, email: 'authorized@user.com'} : null
        ) as PrismaPromise<any>;
    });
});

