import { prismaMock } from '../config/prisma.mock';
import StopsService from '../../src/services/stops.service';
import { Stop } from '../../src/models/stop';
import { PrismaPromise } from '../../generated/prisma';

const stopsService: StopsService = new StopsService();

describe('Get All Stops Tests', () => {
    it('should return a list of Stop objects when getting all stops from the database', async () => {
        const mockLineStopData = [
            {
                stop: {
                    id: 1,
                    name: 'Station'
                },
                line: {
                    name: 'A',
                    type: 'tram'
                },
                direction: 'Port'
            },
            {
                stop: {
                    id: 1,
                    name: 'Station'
                },
                line: {
                    name: 'A',
                    type: 'tram'
                },
                direction: 'Station'
            },
            {
                stop: {
                    id: 1,
                    name: 'Station'
                },
                line: {
                    name: 'B',
                    type: 'trolleybus'
                },
                direction: 'Forest'
            },
            {
                stop: {
                    id: 1,
                    name: 'Station'
                },
                line: {
                    name: 'B',
                    type: 'trolleybus'
                },
                direction: 'Lake'
            },
            {
                stop: {
                    id: 2,
                    name: 'City'
                },
                line: {
                    name: 'A',
                    type: 'tram'
                },
                direction: 'Port'
            },
            {
                stop: {
                    id: 2,
                    name: 'City'
                },
                line: {
                    name: 'A',
                    type: 'tram'
                },
                direction: 'Station'
            },
            {
                stop: {
                    id: 3,
                    name: 'Port'
                },
                line: {
                    name: 'A',
                    type: 'tram'
                },
                direction: 'Port'
            },
            {
                stop: {
                    id: 3,
                    name: 'Port'
                },
                line: {
                    name: 'A',
                    type: 'tram'
                },
                direction: 'Station'
            },
            {
                stop: {
                    id: 4,
                    name: 'Forest'
                },
                line: {
                    name: 'B',
                    type: 'trolleybus'
                },
                direction: 'Forest'
            },
            {
                stop: {
                    id: 4,
                    name: 'Forest'
                },
                line: {
                    name: 'B',
                    type: 'trolleybus'
                },
                direction: 'Lake'
            },
            {
                stop: {
                    id: 5,
                    name: 'Lake'
                },
                line: {
                    name: 'B',
                    type: 'trolleybus'
                },
                direction: 'Forest'
            },
            {
                stop: {
                    id: 5,
                    name: 'Lake'
                },
                line: {
                    name: 'B',
                    type: 'trolleybus'
                },
                direction: 'Lake'
            }
        ];
        // prismaMock.line_stop.findMany.mockResolvedValue(mockLineStopData);
        prismaMock.line_stop.findMany.mockImplementation(() => {
            return Promise.resolve(mockLineStopData) as PrismaPromise<any>
        });
        const stops: Stop[] = await stopsService.getAllStops();
        expect(stops.length).toBe(5);
        expect(stops[0]).toEqual({
            id: 1,
            name: 'Station',
            connections: [
                {line: 'A', type: 'tram', directions: ['Port', 'Station']},
                {line: 'B', type: 'trolleybus', directions: ['Forest', 'Lake']}
            ]
        });
        expect(stops[1]).toEqual({
            id: 2,
            name: 'City',
            connections: [
                {line: 'A', type: 'tram', directions: ['Port', 'Station']}
            ]
        });
        expect(stops[2]).toEqual({
            id: 3,
            name: 'Port',
            connections: [
                {line: 'A', type: 'tram', directions: ['Port', 'Station']}
            ]
        });
        expect(stops[3]).toEqual({
            id: 4,
            name: 'Forest',
            connections: [
                {line: 'B', type: 'trolleybus', directions: ['Forest', 'Lake']}
            ]
        });
        expect(stops[4]).toEqual({
            id: 5,
            name: 'Lake',
            connections: [
                {line: 'B', type: 'trolleybus', directions: ['Forest', 'Lake']}
            ]
        });
    });
});