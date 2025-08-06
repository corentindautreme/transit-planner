import app from '../src/app';
import request from 'supertest';
import { createNetwork } from './util/it-utils';

describe('Departures API tests', () => {
    beforeEach(async () => {
        // Line A: Main Station <-(1 min)-> Center <-(2 min)-> Business <-(3 min) -> Pleasant Suburb <-(7 min) -> Airport
        //         deps: 05:15                                                                                    deps: 05:30
        //               07:15                                                                                          07:30
        //               09:15                                                                                          09:30
        //               11:15                                                                                          11:30
        //               13:15                                                                                          13:30
        //               15:15                                                                                          15:30
        //               17:15                                                                                          17:30
        await createNetwork([{
            name: 'A',
            type: 'bus',
            route: ['Main Station', 'Center', 'Business', 'Pleasant Suburb', 'Airport'],
            delays: [1, 2, 3, 7],
            departures: [
                ['1969-12-31T04:15:00.000Z', '1969-12-31T06:15:00.000Z', '1969-12-31T08:15:00.000Z', '1969-12-31T10:15:00.000Z', '1969-12-31T12:15:00.000Z', '1969-12-31T14:15:00.000Z', '1969-12-31T16:15:00.000Z'],
                ['1969-12-31T04:30:00.000Z', '1969-12-31T06:30:00.000Z', '1969-12-31T08:30:00.000Z', '1969-12-31T10:30:00.000Z', '1969-12-31T12:30:00.000Z', '1969-12-31T14:30:00.000Z', '1969-12-31T16:30:00.000Z'],
            ]
        }]);
    });

    it('should return 200 and all 7 departures from Business on line A in both directions when requesting GET /departures/scheduled', async () => {
        const response = await request(app).get('/departures/scheduled?from=3&line=A');
        expect(response.status).toBe(200);
        const nowDate = new Date().toLocaleDateString('se-SE');
        expect(response.body).toEqual({
            stop: {
                id: 3,
                name: 'Business',
                connections: [
                    {
                        'directions': [
                            'Airport',
                            'Main Station'
                        ],
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
                                scheduledAt: nowDate + 'T03:18:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T05:18:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T07:18:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T09:18:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T11:18:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T13:18:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T15:18:00.000Z'
                            }
                        ],
                        'Main Station': [
                            {
                                scheduledAt: nowDate + 'T03:40:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T05:40:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T07:40:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T09:40:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T11:40:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T13:40:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T15:40:00.000Z'
                            }
                        ]
                    }
                }
            }
        });
    });

    it('should return 200 and 4 departures from Center on line A towards Main Station after 09:00 UTC when requesting GET /departures/scheduled', async () => {
        const nowDate = new Date().toLocaleDateString('se-SE');
        const response = await request(app).get(`/departures/scheduled?from=2&line=A&direction=Main%20Station&after=${nowDate}T09%3A00%3A00.000Z`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            stop: {
                id: 2,
                name: 'Center',
                connections: [
                    {
                        'directions': [
                            'Airport',
                            'Main Station'
                        ],
                        'line': 'A',
                        'type': 'bus'
                    }
                ],
            },
            departures: {
                A: {
                    type: 'bus',
                    departures: {
                        'Main Station': [
                            {
                                scheduledAt: nowDate + 'T09:42:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T11:42:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T13:42:00.000Z'
                            },
                            {
                                scheduledAt: nowDate + 'T15:42:00.000Z'
                            }
                        ]
                    }
                }
            }
        });
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
});