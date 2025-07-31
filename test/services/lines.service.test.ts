import LinesService from '../../src/services/lines.service';
import { prismaMock } from '../config/prisma.mock';
import { DescribedLine, Line } from '../../src/models/line';
import { PrismaPromise } from '../../generated/prisma';
import * as util from 'node:util';

const linesService: LinesService = new LinesService();

describe('Get All Lines Tests', () => {
    it('should return a list of Line objects when getting all lines from the database', async () => {
        const mockLineData = [
            {
                id: 1,
                name: '3',
                type: 'tram',
                line_stop: [
                    {stop: {name: 'Baščaršija'}},
                    {stop: {name: 'Ilidža'}}
                ]
            },
            {
                id: 2,
                name: '103',
                type: 'trolleybus',
                line_stop: [
                    {stop: {name: 'Trg Austrije'}},
                    {stop: {name: 'Dobrinja'}}
                ]
            }
        ];
        prismaMock.line.findMany.mockResolvedValue(mockLineData);
        const lines: Line[] = await linesService.getAllLines();
        expect(lines.length).toBe(2);
        expect(lines[0]).toEqual({name: '3', type: 'tram', directions: ['Baščaršija', 'Ilidža']});
        expect(lines[1]).toEqual({name: '103', type: 'trolleybus', directions: ['Trg Austrije', 'Dobrinja']});
    });
});

describe('Describe Lines Tests', () => {
    it('should return a list of DescribedLine objects when describing all lines based on line_stop data', async () => {
        const expectedQuery = {
            select: {
                line: {select: {name: true, type: true}},
                direction: true,
                stop: {
                    select: {
                        id: true,
                        name: true,
                        line_stop: {select: {line: {select: {name: true, type: true}}, direction: true, order: true}}
                    }
                },
            },
            where: undefined,
            orderBy: {order: 'asc'}
        };
        const mockLineStopData = [
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Ilidža',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 20
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 0
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Kasindolska',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 19
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 1
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Energoinvest',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 18
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Stup',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 17
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 3
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Avaz',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 4
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 16
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Nedžarići',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 15
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 5
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Alipašino Polje',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 14
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 6
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'RTV',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 13
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 7
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Alipašin Most',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 8
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 12
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Otoka',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 9
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 11
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Čengić Vila',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 10
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 10
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Dolac Malta',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 9
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 11
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Socijalno',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 8
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 12
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Pofalići',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 13
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 7
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Univerzitet',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 6
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 14
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Muzeji',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 15
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Marijin Dvor',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 16
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 4
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Skenderija',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 17
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Pošta',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 18
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Drvenija',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 19
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Latinska Ćuprija',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 20
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Vijećnica',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 21
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Baščaršija',
                'stop': {
                    'name': 'Baščaršija',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 22
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Baščaršija',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 22
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Katedrala',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 1
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Banka',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Park',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 3
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Marijin Dvor',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 16
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 4
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Tehnička Škola',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 5
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Univerzitet',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 6
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 14
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Pofalići',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 13
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 7
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Socijalno',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 8
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 12
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Dolac Malta',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 9
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 11
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Čengić Vila',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 10
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 10
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Otoka',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 9
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 11
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Alipašin Most',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 8
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 12
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'RTV',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 13
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 7
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Alipašino Polje',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 14
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 6
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Nedžarići',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 15
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 5
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Avaz',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 4
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 16
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Stup',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 17
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 3
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Energoinvest',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 18
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Kasindolska',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 19
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 1
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '3',
                    'type': 'tram'
                },
                'direction': 'Ilidža',
                'stop': {
                    'name': 'Ilidža',
                    'line_stop': [
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Ilidža',
                            'order': 20
                        },
                        {
                            'line': {
                                'name': '3',
                                'type': 'tram'
                            },
                            'direction': 'Baščaršija',
                            'order': 0
                        }
                    ]
                }
            }
        ];
        prismaMock.line_stop.findMany.mockImplementation((query) => {
            return Promise.resolve(util.isDeepStrictEqual(query, expectedQuery) ? mockLineStopData : []) as PrismaPromise<any>
        });
        const describedLines: DescribedLine[] = await linesService.describeLines();
        expect(describedLines).toHaveLength(1);
        const line = describedLines[0];
        expect(line.name).toBe('3');
        expect(line.type).toBe('tram');
        expect(line.routes).toHaveLength(2);

        const route1 = line.routes[0];
        expect(route1.direction).toBe('Baščaršija');
        expect(route1.stops).toHaveLength(23);
        expect(route1.stops.map(s => s.name)).toStrictEqual([
            'Ilidža',
            'Kasindolska',
            'Energoinvest',
            'Stup',
            'Avaz',
            'Nedžarići',
            'Alipašino Polje',
            'RTV',
            'Alipašin Most',
            'Otoka',
            'Čengić Vila',
            'Dolac Malta',
            'Socijalno',
            'Pofalići',
            'Univerzitet',
            'Muzeji',
            'Marijin Dvor',
            'Skenderija',
            'Pošta',
            'Drvenija',
            'Latinska Ćuprija',
            'Vijećnica',
            'Baščaršija'
        ]);
        expect(route1.stops.some(s => s.connections.length > 0)).toBe(false);

        const route2 = line.routes[1];
        expect(route2.direction).toBe('Ilidža');
        expect(route2.stops).toHaveLength(21);
        expect(route2.stops.map(s => s.name)).toStrictEqual([
            'Baščaršija',
            'Katedrala',
            'Banka',
            'Park',
            'Marijin Dvor',
            'Tehnička Škola',
            'Univerzitet',
            'Pofalići',
            'Socijalno',
            'Dolac Malta',
            'Čengić Vila',
            'Otoka',
            'Alipašin Most',
            'RTV',
            'Alipašino Polje',
            'Nedžarići',
            'Avaz',
            'Stup',
            'Energoinvest',
            'Kasindolska',
            'Ilidža'
        ]);
        expect(route2.stops.some(s => s.connections.length > 0)).toBe(false);
    });


    it('should return all lines as a a list of DescribedLine with connections when describing all lines based on data for multiple lines', async () => {
        const mockLineStopData = [
            // Line A Airport -> City -> Train Station
            // Line A Train Station -> City -> Airport
            // Line B Airport -> Houses -> City -> Apartments -> Bus Terminal
            // Line B Bus Terminal -> Apartments -> City -> Houses -> Airport
            // Line 100 Train Station -> Highway -> Suburb
            // Line 100 Suburb -> Highway -> Train Station
            // order = 0
            {
                'line': {
                    'name': 'A',
                    'type': 'tram'
                },
                'direction': 'Train Station',
                'stop': {
                    'name': 'Airport',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 4
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'A',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'Train Station',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '100',
                    'type': 'bus'
                },
                'direction': 'Suburb',
                'stop': {
                    'name': 'Train Station',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Bus Terminal',
                'stop': {
                    'name': 'Airport',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 4
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'Bus Terminal',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 4
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 0
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '100',
                    'type': 'bus'
                },
                'direction': 'Train Station',
                'stop': {
                    'name': 'Suburb',
                    'line_stop': [
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 0
                        }
                    ]
                }
            },
            // order = 1
            {
                'line': {
                    'name': 'A',
                    'type': 'tram'
                },
                'direction': 'Train Station',
                'stop': {
                    'name': 'City',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'A',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'City',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Bus Terminal',
                'stop': {
                    'name': 'Houses',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 3
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'Apartments',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 3
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 1
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '100',
                    'type': 'bus'
                },
                'direction': 'Suburb',
                'stop': {
                    'name': 'Highway',
                    'line_stop': [
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 1
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '100',
                    'type': 'bus'
                },
                'direction': 'Train Station',
                'stop': {
                    'name': 'Highway',
                    'line_stop': [
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 1
                        }
                    ]
                }
            },
            // order = 2
            {
                'line': {
                    'name': 'A',
                    'type': 'tram'
                },
                'direction': 'Train Station',
                'stop': {
                    'name': 'Train Station',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'A',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'Airport',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 4
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Bus Terminal',
                'stop': {
                    'name': 'City',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'City',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '100',
                    'type': 'bus'
                },
                'direction': 'Suburb',
                'stop': {
                    'name': 'Suburb',
                    'line_stop': [
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 0
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': '100',
                    'type': 'bus'
                },
                'direction': 'Train Station',
                'stop': {
                    'name': 'Train Station',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Suburb',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': '100',
                                'type': 'bus'
                            },
                            'direction': 'Train Station',
                            'order': 2
                        }
                    ]
                }
            },
            // order = 3
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Bus Terminal',
                'stop': {
                    'name': 'Apartments',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 3
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 1
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'Houses',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 1
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 3
                        }
                    ]
                }
            },
            // order = 4
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Bus Terminal',
                'stop': {
                    'name': 'Bus Terminal',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 4
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 0
                        }
                    ]
                }
            },
            {
                'line': {
                    'name': 'B',
                    'type': 'tram'
                },
                'direction': 'Airport',
                'stop': {
                    'name': 'Airport',
                    'line_stop': [
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Train Station',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'A',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 2
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Bus Terminal',
                            'order': 0
                        },
                        {
                            'line': {
                                'name': 'B',
                                'type': 'tram'
                            },
                            'direction': 'Airport',
                            'order': 4
                        }
                    ]
                }
            }
        ];
        prismaMock.line_stop.findMany.mockImplementation(() => Promise.resolve(mockLineStopData) as PrismaPromise<any>);
        const describedLines: DescribedLine[] = await linesService.describeLines();
        expect(describedLines).toHaveLength(3);

        const line100 = describedLines[0];
        expect(line100.name).toBe('100');
        expect(line100.type).toBe('bus');
        expect(line100.routes).toHaveLength(2);

        const line100Route1 = line100.routes[0];
        expect(line100Route1.direction).toBe('Suburb');
        expect(line100Route1.stops).toHaveLength(3);
        expect(line100Route1.stops.map(s => s.name)).toStrictEqual(['Train Station', 'Highway', 'Suburb']);
        const line100Route1Connections = line100Route1.stops.map(s => s.connections.map(c => c.line)).flat();
        expect(line100Route1Connections).toHaveLength(1);
        expect(line100Route1Connections).toContain('A');

        const line100Route2 = line100.routes[1];
        expect(line100Route2.direction).toBe('Train Station');
        expect(line100Route2.stops).toHaveLength(3);
        expect(line100Route2.stops.map(s => s.name)).toStrictEqual(['Suburb', 'Highway', 'Train Station']);
        const line100Route2Connections = line100Route2.stops.map(s => s.connections.map(c => c.line)).flat();
        expect(line100Route2Connections).toHaveLength(1);
        expect(line100Route2Connections).toContain('A');

        const lineA = describedLines[1];
        expect(lineA.name).toBe('A');
        expect(lineA.type).toBe('tram');

        const lineARoute1 = lineA.routes[0];
        expect(lineARoute1.direction).toBe('Train Station');
        expect(lineARoute1.stops).toHaveLength(3);
        expect(lineARoute1.stops.map(s => s.name)).toStrictEqual(['Airport', 'City', 'Train Station']);
        const lineARoute1Connections = [...new Set(lineARoute1.stops.map(s => s.connections.map(c => c.line)).flat())];
        expect(lineARoute1Connections).toHaveLength(2);
        expect(lineARoute1Connections).toContain('100');
        expect(lineARoute1Connections).toContain('B');

        const lineARoute2 = lineA.routes[1];
        expect(lineARoute2.direction).toBe('Airport');
        expect(lineARoute2.stops).toHaveLength(3);
        expect(lineARoute2.stops.map(s => s.name)).toStrictEqual(['Train Station', 'City', 'Airport']);
        const lineARoute2Connections = [...new Set(lineARoute2.stops.map(s => s.connections.map(c => c.line)).flat())];
        expect(lineARoute2Connections).toHaveLength(2);
        expect(lineARoute2Connections).toContain('100');
        expect(lineARoute2Connections).toContain('B');

        const lineB = describedLines[2];
        expect(lineB.name).toBe('B');
        expect(lineB.type).toBe('tram');

        const lineBRoute1 = lineB.routes[0];
        expect(lineBRoute1.direction).toBe('Bus Terminal');
        expect(lineBRoute1.stops).toHaveLength(5);
        expect(lineBRoute1.stops.map(s => s.name)).toStrictEqual(['Airport', 'Houses', 'City', 'Apartments', 'Bus Terminal']);
        const lineBRoute1Connections = [...new Set(lineBRoute1.stops.map(s => s.connections.map(c => c.line)).flat())];
        expect(lineBRoute1Connections).toHaveLength(1);
        expect(lineBRoute1Connections).toContain('A');

        const lineBRoute2 = lineB.routes[1];
        expect(lineBRoute2.direction).toBe('Airport');
        expect(lineBRoute2.stops).toHaveLength(5);
        expect(lineBRoute2.stops.map(s => s.name)).toStrictEqual(['Bus Terminal', 'Apartments', 'City', 'Houses', 'Airport']);
        const lineBRoute2Connections = [...new Set(lineBRoute2.stops.map(s => s.connections.map(c => c.line)).flat())];
        expect(lineBRoute2Connections).toHaveLength(1);
        expect(lineBRoute2Connections).toContain('A');
    });
});