import type { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../db/client';

const AUTH_GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(AUTH_GOOGLE_CLIENT_ID);

async function isUserWhitelisted(email?: string) {
    if (!email) {
        return false;
    }
    const user = await prisma.whitelist.findFirst({
        where: {
            email: email
        }
    });
    return user != null;
}

async function verifyGoogleToken(token: string) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: AUTH_GOOGLE_CLIENT_ID,
        });
        if (await isUserWhitelisted(ticket.getPayload()?.email)) {
            return ticket.getPayload();
        }
        return null;
    } catch (error) {
        console.error('Error verifying Google ID token:', error);
        return null;
    }
}

export async function authenticatedUser(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
        const payload = await verifyGoogleToken(req.headers.authorization.slice(7));
        if (payload) {
            return next();
        } else {
            res.status(403).json({error: 'Unauthorized'});
        }
    } else {
        res.status(401).json({error: 'Unauthenticated'});
    }
}