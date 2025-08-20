import { prismaMock } from '../config/prisma.mock';
import app from '../../src/app';
import request from 'supertest';
import { PrismaPromise } from '../../generated/prisma';

describe('Lines controller error handling tests', () => {
    it('should return 500 and a generic error message when an unexpected Error is throw when requesting GET /lines', async () => {
        prismaMock.line.findMany.mockImplementation(() => {
            return Promise.reject(new Error('Oh no!')) as PrismaPromise<any>;
        });
        const response = await request(app).get('/lines');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({error: 'An internal error occurred and your request could not be processed'});
    });

    it('should return 500 and a generic error message when an unexpected Error is throw when requesting GET /lines/describe-route', async () => {
        prismaMock.line_stop.findMany.mockImplementation(() => {
            return Promise.reject(new Error('Oh no!')) as PrismaPromise<any>;
        });
        const response = await request(app).get('/lines/describe-route?name=1&direction=There');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({error: 'An internal error occurred and your request could not be processed'});
    });

    it('should return 500 and a generic error message when an unexpected Error is throw when requesting GET /lines/describe-line', async () => {
        prismaMock.line_stop.findMany.mockImplementation(() => {
            return Promise.reject(new Error('Oh no!')) as PrismaPromise<any>;
        });
        const response = await request(app).get('/lines/describe-line?name=Line');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({error: 'An internal error occurred and your request could not be processed'});
    });

    it('should return 500 and a generic error message when an unexpected Error is throw when requesting GET /lines/describe-all', async () => {
        prismaMock.line_stop.findMany.mockImplementation(() => {
            return Promise.reject(new Error('Oh no!')) as PrismaPromise<any>;
        });
        const response = await request(app).get('/lines/describe-all');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({error: 'An internal error occurred and your request could not be processed'});
    });
});