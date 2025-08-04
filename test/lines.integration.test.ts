import app from '../src/app';
import request from 'supertest';
import { createNetwork } from './util/it-utils';

describe('Lines API tests', () => {
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

    it('should return 200 and all lines when requesting GET /lines', async () => {
        const response = await request(app).get('/lines');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: '1',
                type: 'tram',
                directions: ['Train Station', 'Suburb']
            },
            {
                name: '2',
                type: 'tram',
                directions: ['Bridge', 'Airport']
            },
            {
                name: '100',
                type: 'trolleybus',
                directions: ['Bus Terminal', 'Lake']
            }
        ]);
    });

    it('should return 200 and properly describe all lines of the network when requesting GET /lines/describe-all', async () => {
        const response = await request(app).get('/lines/describe-all');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: '1',
                type: 'tram',
                directions: ['Train Station', 'Suburb'],
                routes: [
                    {
                        direction: 'Train Station',
                        stops: [
                            {
                                id: 6,
                                name: 'Suburb',
                                connections: []
                            },
                            {
                                id: 5,
                                name: 'Gate',
                                connections: []
                            },
                            {
                                id: 4,
                                name: 'City',
                                connections: [
                                    {
                                        line: '2',
                                        type: 'tram',
                                        directions: ['Airport', 'Bridge']
                                    },
                                    {
                                        line: '100',
                                        type: 'trolleybus',
                                        directions: ['Lake', 'Bus Terminal']
                                    }
                                ]
                            },
                            {
                                id: 3,
                                name: 'Old Town',
                                connections: []
                            },
                            {
                                id: 2,
                                name: 'Bank',
                                connections: []
                            },
                            {
                                id: 1,
                                name: 'Train Station',
                                connections: []
                            }
                        ]
                    },
                    {
                        direction: 'Suburb',
                        stops: [
                            {
                                id: 1,
                                name: 'Train Station',
                                connections: []
                            },
                            {
                                id: 2,
                                name: 'Bank',
                                connections: []
                            },
                            {
                                id: 3,
                                name: 'Old Town',
                                connections: []
                            },
                            {
                                id: 4,
                                name: 'City',
                                connections: [
                                    {
                                        line: '2',
                                        type: 'tram',
                                        directions: ['Airport', 'Bridge']
                                    },
                                    {
                                        line: '100',
                                        type: 'trolleybus',
                                        directions: ['Lake', 'Bus Terminal']
                                    }
                                ]
                            },
                            {
                                id: 5,
                                name: 'Gate',
                                connections: []
                            },
                            {
                                id: 6,
                                name: 'Suburb',
                                connections: []
                            }
                        ]
                    }
                ]
            },
            {
                name: '2',
                type: 'tram',
                directions: ['Bridge', 'Airport'],
                routes: [
                    {
                        direction: 'Bridge',
                        stops: [
                            {
                                id: 11,
                                name: 'Airport',
                                connections: []
                            },
                            {
                                id: 10,
                                name: 'Court',
                                connections: []
                            },
                            {
                                id: 9,
                                name: 'Hospital',
                                connections: []
                            },
                            {
                                id: 4,
                                name: 'City',
                                connections: [
                                    {
                                        line: '1',
                                        type: 'tram',
                                        directions: ['Suburb', 'Train Station']
                                    },
                                    {
                                        line: '100',
                                        type: 'trolleybus',
                                        directions: ['Lake', 'Bus Terminal']
                                    }
                                ]
                            },
                            {
                                id: 8,
                                name: 'Residential',
                                connections: []
                            },
                            {
                                id: 7,
                                name: 'Bridge',
                                connections: []
                            }
                        ]
                    },
                    {
                        direction: 'Airport',
                        stops: [
                            {
                                id: 7,
                                name: 'Bridge',
                                connections: []
                            },
                            {
                                id: 8,
                                name: 'Residential',
                                connections: []
                            },
                            {
                                id: 4,
                                name: 'City',
                                connections: [
                                    {
                                        line: '1',
                                        type: 'tram',
                                        directions: ['Suburb', 'Train Station']
                                    },
                                    {
                                        line: '100',
                                        type: 'trolleybus',
                                        directions: ['Lake', 'Bus Terminal']
                                    }
                                ]
                            },
                            {
                                id: 9,
                                name: 'Hospital',
                                connections: []
                            },
                            {
                                id: 10,
                                name: 'Court',
                                connections: []
                            },
                            {
                                id: 11,
                                name: 'Airport',
                                connections: []
                            }
                        ]
                    }
                ]
            },
            {
                name: '100',
                type: 'trolleybus',
                directions: ['Bus Terminal', 'Lake'],
                routes: [
                    {
                        direction: 'Bus Terminal',
                        stops: [
                            {
                                id: 14,
                                name: 'Lake',
                                connections: []
                            },
                            {
                                id: 4,
                                name: 'City',
                                connections: [
                                    {
                                        line: '1',
                                        type: 'tram',
                                        directions: ['Suburb', 'Train Station']
                                    },
                                    {
                                        line: '2',
                                        type: 'tram',
                                        directions: ['Airport', 'Bridge']
                                    }
                                ]
                            },
                            {
                                id: 13,
                                name: 'University',
                                connections: []
                            },
                            {
                                id: 12,
                                name: 'Bus Terminal',
                                connections: []
                            }
                        ]
                    },
                    {
                        direction: 'Lake',
                        stops: [
                            {
                                id: 12,
                                name: 'Bus Terminal',
                                connections: []
                            },
                            {
                                id: 13,
                                name: 'University',
                                connections: []
                            },
                            {
                                id: 4,
                                name: 'City',
                                connections: [
                                    {
                                        line: '1',
                                        type: 'tram',
                                        directions: ['Suburb', 'Train Station']
                                    },
                                    {
                                        line: '2',
                                        type: 'tram',
                                        directions: ['Airport', 'Bridge']
                                    }
                                ]
                            },
                            {
                                id: 14,
                                name: 'Lake',
                                connections: []
                            }
                        ]
                    }
                ]
            }
        ]);
    });

    it('should return 200 and properly describe line 1 when requesting GET /lines/describe-line for line 1', async () => {
        const response = await request(app).get('/lines/describe-line?name=1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            name: '1',
            type: 'tram',
            directions: ['Suburb', 'Train Station'],
            routes: [
                {
                    direction: 'Suburb',
                    stops: [
                        {
                            id: 1,
                            name: 'Train Station',
                            connections: []
                        },
                        {
                            id: 2,
                            name: 'Bank',
                            connections: []
                        },
                        {
                            id: 3,
                            name: 'Old Town',
                            connections: []
                        },
                        {
                            id: 4,
                            name: 'City',
                            connections: [
                                {
                                    line: '2',
                                    type: 'tram',
                                    directions: ['Airport', 'Bridge']
                                },
                                {
                                    line: '100',
                                    type: 'trolleybus',
                                    directions: ['Lake', 'Bus Terminal']
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: 'Gate',
                            connections: []
                        },
                        {
                            id: 6,
                            name: 'Suburb',
                            connections: []
                        }
                    ]
                },
                {
                    direction: 'Train Station',
                    stops: [
                        {
                            id: 6,
                            name: 'Suburb',
                            connections: []
                        },
                        {
                            id: 5,
                            name: 'Gate',
                            connections: []
                        },
                        {
                            id: 4,
                            name: 'City',
                            connections: [
                                {
                                    line: '2',
                                    type: 'tram',
                                    directions: ['Airport', 'Bridge']
                                },
                                {
                                    line: '100',
                                    type: 'trolleybus',
                                    directions: ['Lake', 'Bus Terminal']
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Old Town',
                            connections: []
                        },
                        {
                            id: 2,
                            name: 'Bank',
                            connections: []
                        },
                        {
                            id: 1,
                            name: 'Train Station',
                            connections: []
                        }
                    ]
                }
            ]
        });
    });

    it('should return 404 when requesting GET /lines/describe-line for a non-existing line', async () => {
        const response = await request(app).get('/lines/describe-line?name=line');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find any of the following lines: line'});
    });

    it('should return 200 and a list of Old Town, Bank, and Train Station when requesting GET /lines/describe-route for line 1 from Old Town towards Train Station', async () => {
        const response = await request(app).get('/lines/describe-route?name=1&from=3&direction=Train%20Station');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                id: 3,
                name: 'Old Town',
                connections: []
            },
            {
                id: 2,
                name: 'Bank',
                connections: []
            },
            {
                id: 1,
                name: 'Train Station',
                connections: []
            }
        ]);
    });

    it('should return 400 and an error when requesting GET /lines/describe-route without a line nor a direction', async () => {
        const response = await request(app).get('/lines/describe-route');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            'errors': [
                {
                    'errorCode': 'required.openapi.validation',
                    'message': 'must have required property \'name\'',
                    'path': '/query/name',
                },
            ],
            'message': 'request/query must have required property \'name\''
        });
    });

    it('should return 400 and an error when requesting GET /lines/describe-route without a direction', async () => {
        const response = await request(app).get('/lines/describe-route?name=1');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            'errors': [
                {
                    'errorCode': 'required.openapi.validation',
                    'message': 'must have required property \'direction\'',
                    'path': '/query/direction',
                },
            ],
            'message': 'request/query must have required property \'direction\''
        });
    });

    it('should return 200 and a list with all stops of the line when requesting GET /lines/describe-route for line 2 Airport without an origin', async () => {
        const response = await request(app).get('/lines/describe-route?name=2&direction=Airport');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                id: 7,
                name: 'Bridge',
                connections: []
            },
            {
                id: 8,
                name: 'Residential',
                connections: []
            },
            {
                id: 4,
                name: 'City',
                connections: [
                    {
                        line: '1',
                        type: 'tram',
                        directions: ['Suburb', 'Train Station']
                    },
                    {
                        line: '100',
                        type: 'trolleybus',
                        directions: ['Lake', 'Bus Terminal']
                    }
                ]
            },
            {
                id: 9,
                name: 'Hospital',
                connections: []
            },
            {
                id: 10,
                name: 'Court',
                connections: []
            },
            {
                id: 11,
                name: 'Airport',
                connections: []
            }
        ]);
    });

    it('should return 404 when requesting GET /lines/describe-route for an non-existing line', async () => {
        const response = await request(app).get('/lines/describe-route?name=3&direction=Airport');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find line 3 with direction Airport'});
    });

    it('should return 404 when requesting GET /lines/describe-route for an existing line with an invalid direction', async () => {
        const response = await request(app).get('/lines/describe-route?name=1&direction=Airport');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Unable to find line 1 with direction Airport'});
    });

    it('should return 400 when requesting GET /lines/describe-route with an origin stop that is not on the line', async () => {
        const response = await request(app).get('/lines/describe-route?name=2&direction=Airport&from=999');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: 'A stop with internal ID 999 does not exist on line 2 in direction of Airport'});
    });
});