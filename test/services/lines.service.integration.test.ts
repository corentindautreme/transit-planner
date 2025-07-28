import LinesService from '../../src/services/lines.service';
import prisma from '../../src/lib/db/client';
import StopsService from '../../src/services/stops.service';
import { createNetwork } from '../util/it-utils';

const linesService = new LinesService();
const stopsService = new StopsService();

describe('With existing line data', () => {
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

    it('should return all lines of the network', async () => {
        expect(await prisma.line.count()).toBe(3);
        const lines = await linesService.getAllLines();
        expect(lines[0].name).toEqual('1');
        expect(lines[0].type).toEqual('tram');
        expect(lines[1].name).toEqual('2');
        expect(lines[1].type).toEqual('tram');
        expect(lines[2].name).toEqual('100');
        expect(lines[2].type).toEqual('trolleybus');
    });

    it('should properly describe all lines of the network', async () => {
        const describedLines = await linesService.describeLines();
        expect(Object.keys(describedLines)).toHaveLength(3);

        const line1 = describedLines[0];
        expect(line1.directions).toStrictEqual(['Train Station', 'Suburb']);
        expect(line1.routes).toHaveLength(2);
        expect(line1.routes[0].stops.map(stop => stop.name)).toStrictEqual(['Suburb', 'Gate', 'City', 'Old Town', 'Bank', 'Train Station']);
        expect(line1.routes[1].stops.map(stop => stop.name)).toStrictEqual(['Train Station', 'Bank', 'Old Town', 'City', 'Gate', 'Suburb']);
        expect(line1.routes[0].stops[2].connections.map(c => c.line)).toStrictEqual(['2', '100']);
        expect(line1.routes.map(route => route.stops.filter(s => s.name !== 'City').map(s => s.connections).flat()).flat()).toHaveLength(0);

        const line2 = describedLines[1];
        expect(line2.directions).toStrictEqual(['Bridge', 'Airport']);
        expect(line2.routes).toHaveLength(2);
        expect(line2.routes[0].stops.map(stop => stop.name)).toStrictEqual(['Airport', 'Court', 'Hospital', 'City', 'Residential', 'Bridge']);
        expect(line2.routes[1].stops.map(stop => stop.name)).toStrictEqual(['Bridge', 'Residential', 'City', 'Hospital', 'Court', 'Airport']);
        expect(line2.routes[0].stops[3].connections.map(c => c.line)).toStrictEqual(['1', '100']);
        expect(line2.routes.map(route => route.stops.filter(s => s.name !== 'City').map(s => s.connections).flat()).flat()).toHaveLength(0);

        const line3 = describedLines[2];
        expect(line3.directions).toStrictEqual(['Bus Terminal', 'Lake']);
        expect(line3.routes).toHaveLength(2);
        expect(line3.routes[0].stops.map(stop => stop.name)).toStrictEqual(['Lake', 'City', 'University', 'Bus Terminal']);
        expect(line3.routes[1].stops.map(stop => stop.name)).toStrictEqual(['Bus Terminal', 'University', 'City', 'Lake']);
        expect(line3.routes[0].stops[1].connections.map(c => c.line)).toStrictEqual(['1', '2']);
        expect(line3.routes.map(route => route.stops.filter(s => s.name !== 'City').map(s => s.connections).flat()).flat()).toHaveLength(0);
    });

    it('should return a route of [Hospital, City, Residential, Bridge]', async () => {
        const stops = await stopsService.getAllStops();
        const stopId = stops.filter(s => s.name === 'Hospital')[0].id;
        const route = await linesService.describeLineRoute('2', 'Bridge', stopId);
        expect(route.map(s => s.name)).toStrictEqual(['Hospital', 'City', 'Residential', 'Bridge']);
    });

    it('should throw error since line 3 does not exist', async () => {
        await expect(async () => await linesService.describeLineRoute('3', 'Nowhere')).rejects.toThrow('Unable to find line 3 with direction Nowhere');
    });

    it('should throw error since line 1 does not have direction Nowhere', async () => {
        await expect(async() => await linesService.describeLineRoute('1', 'Nowhere')).rejects.toThrow("Unable to find line 1 with direction Nowhere");
    });

    it('should throw error since line 1 does not serve stop 999 in direction of Train Station', async () => {
        await expect(async() => await linesService.describeLineRoute('1', 'Train Station', 999)).rejects.toThrow("A stop with internal ID 999 does not exist on line 1 in direction of Train Station");
    });

    it('should throw error since line 100 does not serve Bank in direction of Lake', async () => {const stops = await stopsService.getAllStops();
        const stopId = stops.filter(s => s.name === 'Bank')[0].id;
        await expect(async() => await linesService.describeLineRoute('100', 'Lake', stopId)).rejects.toThrow(`A stop with internal ID ${stopId} does not exist on line 100 in direction of Lake`);
    });
})