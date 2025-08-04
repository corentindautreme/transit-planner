import DeparturesService from '../../src/services/departures.service';
import { createNetwork } from '../util/it-utils';
import StopsService from '../../src/services/stops.service';

const departuresService = new DeparturesService();
const stopsService = new StopsService();

describe('With existing departures', () => {
    beforeEach(async () => {
        // Line 1: Station <-(1 min)-> Airport <-(2 min)-> Ferry Terminal
        //     deps: 00:00                                    deps: 00:04
        //           00:10                                          00:14
        //           00:20                                          00:24
        //           00:30                                          00:34
        //           00:40                                          00:44
        await createNetwork([{
            name: '1',
            type: 'tram',
            route: ['Station', 'Airport', 'Ferry Terminal'],
            delays: [1, 2],
            departures: [
                ['1969-12-31T23:00:00.000Z', '1969-12-31T23:10:00.000Z', '1969-12-31T23:20:00.000Z', '1969-12-31T23:30:00.000Z', '1969-12-31T23:40:00.000Z'],
                ['1969-12-31T23:04:00.000Z', '1969-12-31T23:14:00.000Z', '1969-12-31T23:24:00.000Z', '1969-12-31T23:34:00.000Z', '1969-12-31T23:44:00.000Z']
            ]
        }]);
    });

    it('should return 5 departures from Airport to Station (at 00:X1) and Ferry Terminal (and 00:X6) each (Bosnian time)', async () => {
        const stops = await stopsService.getAllStops();
        const departures = await departuresService.getScheduledDepartures(stops.filter(s => s.name === 'Airport')[0].id!);
        expect(departures.stop.name).toBe('Airport');
        expect(departures.departures['1'].departures['Station']).toBeDefined();
        expect(departures.departures['1'].departures['Ferry Terminal']).toBeDefined();
        expect(departures.departures['1'].departures['Station']).toHaveLength(5);
        expect(departures.departures['1'].departures['Station'].map(d => new Date(d.scheduledAt).toLocaleString('bs-BA', {timeStyle: 'short'}))).toStrictEqual(['00:06', '00:16', '00:26', '00:36', '00:46']);
        expect(departures.departures['1'].departures['Ferry Terminal'].map(d => new Date(d.scheduledAt).toLocaleString('bs-BA', {timeStyle: 'short'}))).toStrictEqual(['00:01', '00:11', '00:21', '00:31', '00:41']);
    });

    it('should return the 00:20 and 00:30 departures when requesting the next 2 departures from Station towards Ferry Terminal', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2025-06-13T00:17:35.264+02:00'));
        const nextDepartures = await departuresService.getNextDepartures(1, '1', 'Ferry Terminal', 2);
        expect(nextDepartures.stop.name).toBe('Station');
        expect(Object.keys(nextDepartures.departures)).toStrictEqual(['1']);
        expect(Object.keys(nextDepartures.departures['1'].departures)).toStrictEqual(['Ferry Terminal']);
        expect(nextDepartures.departures['1'].departures['Ferry Terminal']).toHaveLength(2);
        expect(nextDepartures.departures['1'].departures['Ferry Terminal'].map(d => new Date(d.scheduledAt).toLocaleString('bs-BA', {timeStyle: 'short'}))).toStrictEqual(['00:20', '00:30'])
        jest.useRealTimers();
    });
})