import app from '../src/app';
import request from 'supertest';
import { createNetwork } from './util/it-utils';

describe('Stops API tests', () => {
    beforeEach(async () => {
        // line 1: Train Station <> Bank <> Old Town <> City <> Gate <> Suburb
        // line 2: Bridge <> Residential <> City <> Hospital <> Court <> Airport
        // line 100: Bus Terminal <> University <> City <> Lake
        await createNetwork([
            {name: '1', type: 'tram', route: ['Train Station', 'Bank', 'Old Town', 'City', 'Gate', 'Suburb']},
            {name: '2', type: 'tram', route: ['Bridge', 'Residential', 'City', 'Hospital', 'Court', 'Airport']},
            {name: '100', type: 'trolleybus', route: ['Bus Terminal', 'University', 'City', 'Lake']}
        ]);
    });

    it('should return 200 and all stops sorted by name when requesting GET /stops', async () => {
        const response = await request(app).get('/stops');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                id: 11,
                name: 'Airport',
                connections: [
                    {line: '2', type: 'tram', directions: ['Airport', 'Bridge']}
                ]
            },
            {
                id: 2,
                name: 'Bank',
                connections: [
                    {line: '1', type: 'tram', directions: ['Suburb', 'Train Station']}
                ]
            },
            {
                id: 7,
                name: 'Bridge',
                connections: [
                    {line: '2', type: 'tram', directions: ['Airport', 'Bridge']}
                ]
            },
            {
                id: 12,
                name: 'Bus Terminal',
                connections: [
                    {line: '100', type: 'trolleybus', directions: ['Bus Terminal', 'Lake']}
                ]
            },
            {
                id: 4,
                name: 'City',
                connections: [
                    {line: '1', type: 'tram', directions: ['Suburb', 'Train Station']},
                    {line: '100', type: 'trolleybus', directions: ['Bus Terminal', 'Lake']},
                    {line: '2', type: 'tram', directions: ['Airport', 'Bridge']}
                ]
            },
            {
                id: 10,
                name: 'Court',
                connections: [
                    {line: '2', type: 'tram', directions: ['Airport', 'Bridge']}
                ]
            },
            {
                id: 5,
                name: 'Gate',
                connections: [
                    {line: '1', type: 'tram', directions: ['Suburb', 'Train Station']}
                ]
            },
            {
                id: 9,
                name: 'Hospital',
                connections: [
                    {line: '2', type: 'tram', directions: ['Airport', 'Bridge']}
                ]
            },
            {
                id: 14,
                name: 'Lake',
                connections: [
                    {line: '100', type: 'trolleybus', directions: ['Bus Terminal', 'Lake']}
                ]
            },
            {
                id: 3,
                name: 'Old Town',
                connections: [
                    {line: '1', type: 'tram', directions: ['Suburb', 'Train Station']}
                ]
            },
            {
                id: 8,
                name: 'Residential',
                connections: [
                    {line: '2', type: 'tram', directions: ['Airport', 'Bridge']}
                ]
            },
            {
                id: 6,
                name: 'Suburb',
                connections: [
                    {line: '1', type: 'tram', directions: ['Suburb', 'Train Station']}
                ]
            },
            {
                id: 1,
                name: 'Train Station',
                connections: [
                    {line: '1', type: 'tram', directions: ['Suburb', 'Train Station']}
                ]
            },
            {
                id: 13,
                name: 'University',
                connections: [
                    {line: '100', type: 'trolleybus', directions: ['Bus Terminal', 'Lake']}
                ]
            }
        ]);
    });
});