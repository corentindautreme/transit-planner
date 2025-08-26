import DeparturesService from '../../src/services/departures.service';
import { createNetwork } from '../util/it-utils';
import StopsService from '../../src/services/stops.service';

const departuresService = new DeparturesService();
const stopsService = new StopsService();

describe('With existing departures', () => {
    beforeEach(async () => {
        // Line 1: Station <-(1 min)-> Airport <-(2 min)-> Ferry Terminal
        //     deps: 00:00 CET                            deps: 00:04 CET
        //           00:10                                      00:14
        //           00:20                                      00:24
        //           00:30                                      00:34
        //           00:40                                      00:44
        await createNetwork([{
            name: '1',
            type: 'tram',
            route: ['Station', 'Airport', 'Ferry Terminal'],
            delays: [1, 2],
            departures: [
                // TODO re-insert these as Dec 31 UTC datetimes
                ['1970-01-01T00:00:00.000+01:00', '1970-01-01T00:10:00.000+01:00', '1970-01-01T00:20:00.000+01:00', '1970-01-01T00:30:00.000+01:00', '1970-01-01T00:40:00.000+01:00'],
                ['1970-01-01T00:04:00.000+01:00', '1970-01-01T00:14:00.000+01:00', '1970-01-01T00:24:00.000+01:00', '1970-01-01T00:34:00.000+01:00', '1970-01-01T00:44:00.000+01:00']
            ]
        }]);
    });

    it('should return 5 departures from Airport to Station (at 00:X1) and Ferry Terminal (and 00:X6) each (Bosnian winter time)', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-01-05T09:24:37.667+01:00'));
            const stops = await stopsService.getAllStops();
            const departures = await departuresService.getScheduledDepartures(stops.filter(s => s.name === 'Airport')[0].id!);
            expect(departures.stop.name).toBe('Airport');
            expect(departures.departures['1'].departures['Station']).toBeDefined();
            expect(departures.departures['1'].departures['Ferry Terminal']).toBeDefined();
            expect(departures.departures['1'].departures['Station']).toHaveLength(5);
            expect(departures.departures['1'].departures['Station']).toStrictEqual([
                {scheduledAt: '2025-01-05T23:06:00.000Z'},
                {scheduledAt: '2025-01-05T23:16:00.000Z'},
                {scheduledAt: '2025-01-05T23:26:00.000Z'},
                {scheduledAt: '2025-01-05T23:36:00.000Z'},
                {scheduledAt: '2025-01-05T23:46:00.000Z'}
            ]);
            expect(departures.departures['1'].departures['Ferry Terminal']).toStrictEqual([
                {scheduledAt: '2025-01-05T23:01:00.000Z'},
                {scheduledAt: '2025-01-05T23:11:00.000Z'},
                {scheduledAt: '2025-01-05T23:21:00.000Z'},
                {scheduledAt: '2025-01-05T23:31:00.000Z'},
                {scheduledAt: '2025-01-05T23:41:00.000Z'}
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return the 00:20 and 00:30 departures when requesting the next 2 departures from Station towards Ferry Terminal at 00:17 winter time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-02-13T00:17:35.264+01:00'));
            const nextDepartures = await departuresService.getNextDepartures(1, '1', 'Ferry Terminal', 2);
            expect(nextDepartures.stop.name).toBe('Station');
            expect(Object.keys(nextDepartures.departures)).toStrictEqual(['1']);
            expect(Object.keys(nextDepartures.departures['1'].departures)).toStrictEqual(['Ferry Terminal']);
            expect(nextDepartures.departures['1'].departures['Ferry Terminal']).toHaveLength(2);
            expect(nextDepartures.departures['1'].departures['Ferry Terminal']).toStrictEqual([
                {scheduledAt: '2025-02-12T23:20:00.000Z'},
                {scheduledAt: '2025-02-12T23:30:00.000Z'}
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return the 00:41, D+1 00:01, and D+2 00:11 departures when requesting the next 3 departures from Airport towards Ferry Terminal at 00:33 winter time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-02-13T00:33:02.534+01:00'));
            const nextDepartures = await departuresService.getNextDepartures(2, '1', 'Ferry Terminal', 3);
            expect(nextDepartures.stop.name).toBe('Airport');
            expect(Object.keys(nextDepartures.departures)).toStrictEqual(['1']);
            expect(Object.keys(nextDepartures.departures['1'].departures)).toStrictEqual(['Ferry Terminal']);
            expect(nextDepartures.departures['1'].departures['Ferry Terminal']).toHaveLength(3);
            expect(nextDepartures.departures['1'].departures['Ferry Terminal']).toStrictEqual([
                {scheduledAt: '2025-02-12T23:41:00.000Z'},
                {scheduledAt: '2025-02-13T23:01:00.000Z'},
                {scheduledAt: '2025-02-13T23:11:00.000Z'}
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return the 00:36, 00:46, and D+1 00:06, departures when requesting the next 3 departures from Airport towards Station at 00:29 summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-07-13T00:29:15.786+02:00'));
            const nextDepartures = await departuresService.getNextDepartures(2, '1', 'Station', 3);
            expect(nextDepartures.stop.name).toBe('Airport');
            expect(Object.keys(nextDepartures.departures)).toStrictEqual(['1']);
            expect(Object.keys(nextDepartures.departures['1'].departures)).toStrictEqual(['Station']);
            expect(nextDepartures.departures['1'].departures['Station']).toHaveLength(3);
            expect(nextDepartures.departures['1'].departures['Station']).toStrictEqual([
                {scheduledAt: '2025-07-12T22:36:00.000Z'},
                {scheduledAt: '2025-07-12T22:46:00.000Z'},
                {scheduledAt: '2025-07-13T22:06:00.000Z'}
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return the 00:04, 00:14 and 00:24 departures when requesting the next 3 departures from Ferry Terminal towards Station at 17:30 summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-06-13T17:30:00.264+02:00'));
            const nextDepartures = await departuresService.getNextDepartures(3, '1', 'Station', 3);
            expect(nextDepartures.stop.name).toBe('Ferry Terminal');
            expect(Object.keys(nextDepartures.departures)).toStrictEqual(['1']);
            expect(Object.keys(nextDepartures.departures['1'].departures)).toStrictEqual(['Station']);
            expect(nextDepartures.departures['1'].departures['Station']).toHaveLength(3);
            expect(nextDepartures.departures['1'].departures['Station']).toStrictEqual([
                {scheduledAt: '2025-06-13T22:04:00.000Z'},
                {scheduledAt: '2025-06-13T22:14:00.000Z'},
                {scheduledAt: '2025-06-13T22:24:00.000Z'}
            ]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('should return the 00:34, 00:44, and D+1 00:04, departures when requesting the next 3 departures from Ferry Terminal towards Station at 00:29 summer time', async () => {
        try {
            jest.useFakeTimers().setSystemTime(new Date('2025-08-01T00:29:15.786+02:00'));
            const nextDepartures = await departuresService.getNextDepartures(3, '1', 'Station', 3);
            expect(nextDepartures.stop.name).toBe('Ferry Terminal');
            expect(Object.keys(nextDepartures.departures)).toStrictEqual(['1']);
            expect(Object.keys(nextDepartures.departures['1'].departures)).toStrictEqual(['Station']);
            expect(nextDepartures.departures['1'].departures['Station']).toHaveLength(3);
            expect(nextDepartures.departures['1'].departures['Station']).toStrictEqual([
                {scheduledAt: '2025-07-31T22:34:00.000Z'},
                {scheduledAt: '2025-07-31T22:44:00.000Z'},
                {scheduledAt: '2025-08-01T22:04:00.000Z'}
            ]);
        } finally {
            jest.useRealTimers();
        }
    });
})