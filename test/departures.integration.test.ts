import app from '../src/app';
import request from 'supertest';
import { createNetwork } from './util/it-utils';

describe('Departures API tests', () => {
    beforeEach(async () => {
        // Line A: Main Station <-(1 min)-> Center <-(2 min)-> Business <-(3 min)-> Pleasant Suburb <-(7 min)-> Airport
        //         deps: 05:15 CET                                                                       deps: 05:30 CET
        //               07:15                                                                                 07:30
        //               09:15                                                                                 09:30
        //               11:15                                                                                 11:30
        //               13:15                                                                                 13:30
        //               15:15                                                                                 15:30
        //               17:15                                                                                 17:30
        await createNetwork([{
            name: 'A',
            type: 'bus',
            route: ['Main Station', 'Center', 'Business', 'Pleasant Suburb', 'Airport'],
            delays: [1, 2, 3, 7],
            departures: [
                ['1970-01-01T04:15:00.000Z', '1970-01-01T06:15:00.000Z', '1970-01-01T08:15:00.000Z', '1970-01-01T10:15:00.000Z', '1970-01-01T12:15:00.000Z', '1970-01-01T14:15:00.000Z', '1970-01-01T16:15:00.000Z'],
                ['1970-01-01T04:30:00.000Z', '1970-01-01T06:30:00.000Z', '1970-01-01T08:30:00.000Z', '1970-01-01T10:30:00.000Z', '1970-01-01T12:30:00.000Z', '1970-01-01T14:30:00.000Z', '1970-01-01T16:30:00.000Z'],
            ]
        }]);
    });

    it('should return 200 and all 7 departures from Business on line A in both directions when requesting GET /departures/scheduled in winter time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-01-13T00:00:00.000+01:00'));
            const response = await request(app).get('/departures/scheduled?from=3&line=A');
            expect(response.status).toBe(200);
            const nowDate = new Date().toLocaleDateString('sv-SE', {timeZone: process.env.NETWORK_TZ});
            expect(response.body).toEqual({
                stop: {
                    id: 3,
                    name: 'Business',
                    connections: [
                        {
                            'directions': expect.arrayContaining(['Airport', 'Main Station']),
                            'line': 'A',
                            'type': 'bus'
                        }
                    ],
                },
                departures: {
                    A: {
                        type: 'bus',
                        departures: {
                            Airport: [
                                {
                                    scheduledAt: nowDate + 'T04:18:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T06:18:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T08:18:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T10:18:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T12:18:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T14:18:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T16:18:00.000Z'
                                }
                            ],
                            'Main Station': [
                                {
                                    scheduledAt: nowDate + 'T04:40:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T06:40:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T08:40:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T10:40:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T12:40:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T14:40:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate + 'T16:40:00.000Z'
                                }
                            ]
                        }
                    }
                }
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 200 and 4 departures from Center on line A towards Main Station after 10:00 when requesting GET /departures/scheduled in summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-06-13T10:00:00.000+02:00'));
            const nowDate = new Date('2025-06-13T10:00:00.000+02:00');
            const response = await request(app).get(`/departures/scheduled?from=2&line=A&direction=Main%20Station&after=${nowDate.toISOString().replaceAll(':', '%3A')}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                stop: {
                    id: 2,
                    name: 'Center',
                    connections: [
                        {
                            'directions': expect.arrayContaining(['Airport', 'Main Station']),
                            'line': 'A',
                            'type': 'bus'
                        }
                    ]
                },
                departures: {
                    A: {
                        type: 'bus',
                        departures: {
                            'Main Station': [
                                {
                                    scheduledAt: nowDate.toLocaleDateString('sv-SE') + 'T09:42:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate.toLocaleDateString('sv-SE') + 'T11:42:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate.toLocaleDateString('sv-SE') + 'T13:42:00.000Z'
                                },
                                {
                                    scheduledAt: nowDate.toLocaleDateString('sv-SE') + 'T15:42:00.000Z'
                                }
                            ]
                        }
                    }
                }
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 404 when requesting GET /departures/scheduled for a non-existent stop', async () => {
        const response = await request(app).get('/departures/scheduled?from=999');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 999'});
    });

    it('should return 404 when requesting GET /departures/scheduled for a non-existent line', async () => {
        const response = await request(app).get('/departures/scheduled?from=1&line=1');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 1 on line 1'});
    });

    it('should return 404 when requesting GET /departures/scheduled for a non-existent direction', async () => {
        const response = await request(app).get('/departures/scheduled?from=1&direction=Bus%20Station');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 1 in direction of Bus Station'});
    });

    it('should return 404 when requesting GET /departures/scheduled for a non-existent line and direction', async () => {
        const response = await request(app).get('/departures/scheduled?from=1&line=2&direction=Bus%20Station');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 1 on line 2 in direction of Bus Station'});
    });

    it('should return 200 and the next 3 departures from Pleasant Suburb towards Main Station when requesting GET /departures/next at 08:24:45.267 winter time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-12-08T08:24:45.267+01:00'));
            const response = await request(app).get('/departures/next?from=4&direction=Main%20Station&limit=3');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                stop: {
                    id: 4,
                    name: 'Pleasant Suburb',
                    connections: [
                        {
                            'directions': expect.arrayContaining(['Airport', 'Main Station']),
                            'line': 'A',
                            'type': 'bus'
                        }
                    ]
                },
                departures: {
                    A: {
                        type: 'bus',
                        departures: {
                            'Main Station': [
                                {
                                    scheduledAt: '2025-12-08T08:37:00.000Z'
                                },
                                {
                                    scheduledAt: '2025-12-08T10:37:00.000Z'
                                },
                                {
                                    scheduledAt: '2025-12-08T12:37:00.000Z'
                                }
                            ]
                        }
                    }
                }
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 200 and the next 5 departures for the next day from Business towards Airport when requesting GET /departures/next at 20:40:07.967 summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-06-13T20:40:07.967+02:00'));
            const response = await request(app).get('/departures/next?from=3&direction=Airport');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                stop: {
                    id: 3,
                    name: 'Business',
                    connections: [
                        {
                            'directions': expect.arrayContaining(['Airport', 'Main Station']),
                            'line': 'A',
                            'type': 'bus'
                        }
                    ]
                },
                departures: {
                    A: {
                        type: 'bus',
                        departures: {
                            'Airport': [
                                {
                                    scheduledAt: '2025-06-14T03:18:00.000Z'
                                },
                                {
                                    scheduledAt: '2025-06-14T05:18:00.000Z'
                                },
                                {
                                    scheduledAt: '2025-06-14T07:18:00.000Z'
                                },
                                {
                                    scheduledAt: '2025-06-14T09:18:00.000Z'
                                },
                                {
                                    scheduledAt: '2025-06-14T11:18:00.000Z'
                                }
                            ]
                        }
                    }
                }
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 404 when requesting GET /departures/next for a non-existent stop', async () => {
        const response = await request(app).get('/departures/next?from=999');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 999'});
    });

    it('should return 404 when requesting GET /departures/next for a non-existent line', async () => {
        const response = await request(app).get('/departures/next?from=1&line=1');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 1 on line 1'});
    });

    it('should return 404 when requesting GET /departures/next for a non-existent direction', async () => {
        const response = await request(app).get('/departures/next?from=1&direction=Bus%20Station');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 1 in direction of Bus Station'});
    });

    it('should return 404 when requesting GET /departures/next for a non-existent line and direction', async () => {
        const response = await request(app).get('/departures/next?from=1&line=2&direction=Bus%20Station');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find departures from stop with internal ID 1 on line 2 in direction of Bus Station'});
    });

    it('should return 200 and a route with stops at 09:18, 09:21, and 09:28 when requesting GET /departures/stops for a departure from Business towards Airport at 09:18 summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-06-26T09:18:00.000+02:00'));
            const response = await request(app).get('/departures/stops?line=A&direction=Airport&from=3');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                {
                    id: 3,
                    name: 'Business',
                    departures: [{scheduledAt: '2025-06-26T07:18:00.000Z'}]
                },
                {
                    id: 4,
                    name: 'Pleasant Suburb',
                    departures: [{scheduledAt: '2025-06-26T07:21:00.000Z'}]
                },
                {
                    id: 5,
                    name: 'Airport',
                    departures: [{scheduledAt: '2025-06-26T07:28:00.000Z'}]
                }
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 200 and a route with stops at 15:30, 15:37, 15:40, 15:42, and 15:43; 17:30, 17:37, 17:40, 17:42, and 17:43; and 05:30, 05:37, 05:40, 05:42, and 05:43 when requesting GET /departures/stops for the next 3 departures (including past stops) from Pleasant Suburb towards Main Station at 15:30 winter time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-02-26T15:30:02.144+01:00'));
            const response = await request(app).get('/departures/stops?line=A&direction=Main%20Station&from=4&includePast=true&limit=3');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                {
                    id: 5,
                    name: 'Airport',
                    departures: [
                        {scheduledAt: '2025-02-26T14:30:00.000Z'},
                        {scheduledAt: '2025-02-26T16:30:00.000Z'},
                        {scheduledAt: '2025-02-27T04:30:00.000Z'}
                    ]
                },
                {
                    id: 4,
                    name: 'Pleasant Suburb',
                    departures: [
                        {scheduledAt: '2025-02-26T14:37:00.000Z'},
                        {scheduledAt: '2025-02-26T16:37:00.000Z'},
                        {scheduledAt: '2025-02-27T04:37:00.000Z'}
                    ]
                },
                {
                    id: 3,
                    name: 'Business',
                    departures: [
                        {scheduledAt: '2025-02-26T14:40:00.000Z'},
                        {scheduledAt: '2025-02-26T16:40:00.000Z'},
                        {scheduledAt: '2025-02-27T04:40:00.000Z'}
                    ]
                },
                {
                    id: 2,
                    name: 'Center',
                    departures: [
                        {scheduledAt: '2025-02-26T14:42:00.000Z'},
                        {scheduledAt: '2025-02-26T16:42:00.000Z'},
                        {scheduledAt: '2025-02-27T04:42:00.000Z'}
                    ]
                },
                {
                    id: 1,
                    name: 'Main Station',
                    departures: [
                        {scheduledAt: '2025-02-26T14:43:00.000Z'},
                        {scheduledAt: '2025-02-26T16:43:00.000Z'},
                        {scheduledAt: '2025-02-27T04:43:00.000Z'}
                    ]
                }
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 200 and a route with stops at 05:16, 05:18, and 05:21 when requesting GET /departures/stops for a route between Center and Pleasant Suburb towards Airport at 01:24 summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-09-18T01:24:28.083+02:00'));
            const response = await request(app).get('/departures/stops?line=A&direction=Airport&from=2&to=4');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                {
                    id: 2,
                    name: 'Center',
                    departures: [{scheduledAt: '2025-09-18T03:16:00.000Z'}]
                },
                {
                    id: 3,
                    name: 'Business',
                    departures: [{scheduledAt: '2025-09-18T03:18:00.000Z'}]
                },
                {
                    id: 4,
                    name: 'Pleasant Suburb',
                    departures: [{scheduledAt: '2025-09-18T03:21:00.000Z'}]
                }
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return 404 when requesting GET /departures/stops for a non-existent line and direction', async () => {
        const response = await request(app).get('/departures/stops?line=999&direction=Nowhere');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find a route with direction Nowhere on line 999'});
    });

    it('should return 404 when requesting GET /departures/stops for a non-existent direction on an existing line', async () => {
        const response = await request(app).get('/departures/stops?line=A&direction=Nowhere');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find a route with direction Nowhere on line A'});
    });

    it('should return 404 when requesting GET /departures/stops between 2 non-existent stops', async () => {
        const response = await request(app).get('/departures/stops?line=A&direction=Airport&from=99&to=100');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Stops 99 and 100 not served by line A towards Airport'});
    });

    it('should return 404 when requesting GET /departures/stops between Center and a non-existent stop', async () => {
        const response = await request(app).get('/departures/stops?line=A&direction=Airport&from=2&to=100');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Stop 100 not served by line A towards Airport'});
    });

    it('should return 404 when requesting GET /departures/stops between a non-existent stop and Business', async () => {
        const response = await request(app).get('/departures/stops?line=A&direction=Main%20Station&from=999&to=3');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Stop 999 not served by line A towards Main Station'});
    });
});