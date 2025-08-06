import { TransportType } from '../../src/models/transport-type';
import prisma from '../../src/lib/db/client';

/**
 * Inserts all required stop, line, line_stop entries into the database to implement the transport network described by
 * the provided lines parameter.
 *  - First, all stops are extracted from each line route and inserted in the stop table
 *  - Then, all lines are inserted in the line table
 *  - Finally, using the stop and line IDs generated earlier, 2 entries are inserted into the line_stop table, based on
 *  the route of the line - one in each direction
 *      - e.g. if you defined line 1 with route ['A', 'B', 'C'], the following sets of order=stop will be inserted:
 *      0=A, 1=B, 2=C, and 0=C, 1=B, 2=A
 * @param lines a list of basic line descriptors made of:
 *  - name: the name of the line
 *  - type: the type of the line (see {@link TransportType})
 *  - route: the route followed by the line, as an array of stop names
 *  - delays (optional): the time it takes to travel between each station. Expects an array of size route.length - 1,
 *  will be considered as not provided if this condition isn't met
 *  - departures (opt): UTC departure times, represented as an array of 2 arrays of yyyy-MM-ddTHH:mm:SS.SSSZ string, one
 *  array for each edge of the line. Will be considered not provided if not an array of length 2
 */
export const createNetwork = async (
    lines: {
        name: string,
        type: TransportType,
        route: string[],
        delays?: number[]
        departures?: string[][]
    }[]
) => {
    // insert stops
    const stopData = [...new Set(lines.map(line => line.route).flat())].map((stop, index) => ({
        id: index + 1,
        name: stop
    }));
    await prisma.stop.createMany({
        data: stopData
    });
    const stopToId = stopData.reduce((stopIdByName, stop) => {
        stopIdByName[stop.name] = stop.id;
        return stopIdByName;
    }, {} as { [stop: string]: number });

    // insert lines
    const lineData = lines.map((line, index) => ({id: index + 1, name: line.name, type: line.type}));
    await prisma.line.createMany({
        data: lineData
    });
    const lineToId = lineData.reduce((lineIdByName, line) => {
        lineIdByName[line.name] = line.id;
        return lineIdByName;
    }, {} as { [line: string]: number });

    // insert lines composition into line_stop
    const lineStopData = lines.map(line => [
        // one way
        ...line.route.map((stop, index) => ({
            id_line: lineToId[line.name],
            id_stop: stopToId[stop],
            order: index,
            direction: line.route[line.route.length - 1]
        })),
        // return way
        ...line.route.toReversed().map((stop, index) => ({
            id_line: lineToId[line.name],
            id_stop: stopToId[stop],
            order: index,
            direction: line.route.toReversed()[line.route.length - 1]
        }))
    ]).flat();
    await prisma.line_stop.createMany({
        data: lineStopData.map((lineStop, index) => ({...lineStop, id: index + 1}))
    });

    // insert departure_delay entries
    const departureDelaysData = lines.map(line => {
        if (!line.delays || line.delays.length !== line.route.length - 1) {
            console.log(`No delay or not enough/too many delays provided for line ${line.name} - will not insert any departure_delay for this line`);
            return [];
        } else {
            // delays are provided as travel time between 2 consecutive stations => we need to accumulate them to
            // insert them as delays from origin
            const accumulatedDelaysRoute1 = line.delays.reduce((accumulated, delay, index) => {
                accumulated.push(index === 0 ? delay : accumulated[index - 1] + delay);
                return accumulated;
            }, [] as number[]);
            const accumulatedDelaysRoute2 = line.delays.toReversed().reduce((accumulated, delay, index) => {
                accumulated.push(index === 0 ? delay : accumulated[index - 1] + delay);
                return accumulated;
            }, [] as number[]);
            return [
                ...line.route.map((stop, index) => ({
                    id_line: lineToId[line.name],
                    id_stop: stopToId[stop],
                    direction: line.route[line.route.length - 1],
                    delay: index === 0 ? 0 : accumulatedDelaysRoute1[index - 1]
                })),
                ...line.route.toReversed().map((stop, index) => ({
                    id_line: lineToId[line.name],
                    id_stop: stopToId[stop],
                    direction: line.route.toReversed()[line.route.length - 1],
                    delay: index === 0 ? 0 : accumulatedDelaysRoute2[index - 1]
                }))
            ];
        }
    }).flat();
    await prisma.departure_delay.createMany({
        data: departureDelaysData.map((departureDelay, index) => ({...departureDelay, id: index + 1}))
    });

    // insert departure entries
    const departureData = lines.map(line => {
        if (!line.departures || line.departures.length !== 2) {
            console.log(`No departure or not enough/too many departures provided for line ${line.name} - will not insert any departure for this line`);
            return [];
        } else {
            return [
                ...line.departures[0].map(departure => ({
                    id_line: lineToId[line.name],
                    id_stop: stopToId[line.route[0]],
                    direction: line.route[line.route.length - 1],
                    time_utc: departure
                })),
                ...line.departures[1].map(departure => ({
                    id_line: lineToId[line.name],
                    id_stop: stopToId[line.route[line.route.length - 1]],
                    direction: line.route[0],
                    time_utc: departure
                }))
            ];
        }
    }).flat();
    await prisma.departure.createMany({
        data: departureData.map((departure, index) => ({...departure, id: index + 1}))
    });
}