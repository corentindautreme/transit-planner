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
        expect(lines).toHaveLength(3);
        expect(lines[0].name).toEqual('1');
        expect(lines[0].type).toEqual('tram');
        expect(lines[1].name).toEqual('2');
        expect(lines[1].type).toEqual('tram');
        expect(lines[2].name).toEqual('100');
        expect(lines[2].type).toEqual('trolleybus');
    });

    it('should properly describe all lines of the network', async () => {
        const describedLines = await linesService.describeLines();
        expect(describedLines).toHaveLength(3);

        const line1 = describedLines.find(l => l.name === '1')!;
        expect(line1.directions).toEqual(expect.arrayContaining(['Train Station', 'Suburb']));
        expect(line1.routes).toHaveLength(2);
        const line1Routes = line1.routes.map(route => route.stops.map(stop => stop.name));
        expect(line1Routes).toEqual(expect.arrayContaining([
            ['Suburb', 'Gate', 'City', 'Old Town', 'Bank', 'Train Station'],
            ['Train Station', 'Bank', 'Old Town', 'City', 'Gate', 'Suburb']
        ]));
        // expect City to have 2 connections (on both routes)
        const cityLine1Route1Stop = line1.routes[0].stops.find(s => s.name === 'City')!;
        const cityLine1Route2Stop = line1.routes[1].stops.find(s => s.name === 'City')!;
        expect(cityLine1Route1Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['2', '100']));
        expect(cityLine1Route2Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['2', '100']));
        // expect all other stops on both routes to have 0 connection
        expect(line1.routes
            .map(route => route.stops
                .filter(s => s.name !== 'City')
                .map(s => s.connections)
                .flat()
            ).flat()
        ).toHaveLength(0);

        const line2 = describedLines.find(l => l.name === '2')!;
        expect(line2.directions).toStrictEqual(expect.arrayContaining(['Bridge', 'Airport']));
        expect(line2.routes).toHaveLength(2);
        const line2Routes = line2.routes.map(route => route.stops.map(stop => stop.name));
        expect(line2Routes).toEqual(expect.arrayContaining([
            ['Airport', 'Court', 'Hospital', 'City', 'Residential', 'Bridge'],
            ['Bridge', 'Residential', 'City', 'Hospital', 'Court', 'Airport']
        ]));
        // expect City to have 2 connections (on both routes)
        const cityLine2Route1Stop = line2.routes[0].stops.find(s => s.name === 'City')!;
        const cityLine2Route2Stop = line2.routes[1].stops.find(s => s.name === 'City')!;
        expect(cityLine2Route1Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['1', '100']));
        expect(cityLine2Route2Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['1', '100']));
        // expect all other stops on both routes to have 0 connection
        expect(line2.routes.map(route => route.stops.filter(s => s.name !== 'City').map(s => s.connections).flat()).flat()).toHaveLength(0);

        const line100 = describedLines.find(l => l.name === '100')!;
        expect(line100.directions).toStrictEqual(expect.arrayContaining(['Bus Terminal', 'Lake']));
        expect(line100.routes).toHaveLength(2);
        const line100Routes = line100.routes.map(route => route.stops.map(stop => stop.name));
        expect(line100Routes).toEqual(expect.arrayContaining([
            ['Lake', 'City', 'University', 'Bus Terminal'],
            ['Bus Terminal', 'University', 'City', 'Lake']
        ]));
        // expect City to have 2 connections (on both routes)
        const cityLine100Route1Stop = line100.routes[0].stops.find(s => s.name === 'City')!;
        const cityLine100Route2Stop = line100.routes[1].stops.find(s => s.name === 'City')!;
        expect(cityLine100Route1Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['1', '2']));
        expect(cityLine100Route2Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['1', '2']));
        // expect all other stops on both routes to have 0 connection
        expect(line100.routes.map(route => route.stops.filter(s => s.name !== 'City').map(s => s.connections).flat()).flat()).toHaveLength(0);
    });
    
    it('should properly describe line 1', async() => {
        const describedLine = await linesService.describeLine('1');
        expect(describedLine).toBeInstanceOf(Object);
        expect(describedLine.directions).toStrictEqual(['Suburb', 'Train Station']);
        expect(describedLine.routes).toHaveLength(2);
        const routes = describedLine.routes.map(route => route.stops.map(stop => stop.name));
        expect(routes).toEqual(expect.arrayContaining([
            ['Train Station', 'Bank', 'Old Town', 'City', 'Gate', 'Suburb'],
            ['Suburb', 'Gate', 'City', 'Old Town', 'Bank', 'Train Station']
        ]));
        // expect City to have 2 connections (on both routes)
        const cityRoute1Stop = describedLine.routes[0].stops.find(s => s.name === 'City')!;
        const cityRoute2Stop = describedLine.routes[1].stops.find(s => s.name === 'City')!;
        expect(cityRoute1Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['2', '100']));
        expect(cityRoute2Stop.connections.map(c => c.line)).toStrictEqual(expect.arrayContaining(['2', '100']));
        // expect all other stops on both routes to have 0 connection
        expect(describedLine.routes.map(route => route.stops.filter(s => s.name !== 'City').map(s => s.connections).flat()).flat()).toHaveLength(0);
    });

    it('should throw error since line A does not exist', async() => {
        await expect(async () => await linesService.describeLine('A')).rejects.toThrow('Unable to find any of the following lines: A');
    });

    it('should throw error since lines B, C, and 999 do not exist', async() => {
        await expect(async () => await linesService.describeLines(['B', 'C', '999'])).rejects.toThrow('Unable to find any of the following lines: B,C,999');
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