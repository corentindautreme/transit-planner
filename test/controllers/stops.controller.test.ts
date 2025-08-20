import { prismaMock } from '../config/prisma.mock';
import app from '../../src/app';
import request from 'supertest';
import { PrismaPromise } from '../../generated/prisma';

describe('Stops controller error handling tests', () => {
    it('should return 500 and a generic error message when an unexpected Error is throw when requesting GET /stops', async () => {
        prismaMock.line_stop.findMany.mockImplementation(() => {
            return Promise.reject(new Error('Oh no!')) as PrismaPromise<any>;
        });
        const response = await request(app).get('/stops');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({error: 'An internal error occurred and your request could not be processed'});
    });
});