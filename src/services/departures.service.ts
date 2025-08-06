import DataAccessService from './data.access.service';
import { Departure, DepartureByLine, DeparturesAtStop } from '../models/departures';
import { TransportType } from '../models/transport-type';
import { Connection } from '../models/stop';
import { DepartureNotFoundError } from '../models/error/departure-not-found';

export default class DeparturesService extends DataAccessService {
    constructor() {
        super();
    }

    async getScheduledDepartures(from: number, line?: string, direction?: string, after?: string | Date, limit?: number): Promise<DeparturesAtStop> {
        return this.prismaClient.line_stop.findMany({
            select: {
                direction: true,
                line: {select: {name: true, type: true}},
                stop: {
                    select: {
                        id: true,
                        name: true,
                        departure: {
                            select: {time_utc: true, line: {select: {name: true}}, direction: true},
                            orderBy: {time_utc: 'asc'}
                        },
                        departure_delay: {
                            select: {
                                line: {select: {name: true}},
                                direction: true,
                                delay: true
                            },
                            orderBy: {direction: 'asc'}
                        },
                        line_stop: {
                            select: {
                                line: {select: {name: true, type: true}},
                                direction: true
                            }
                        }
                    }
                },
            },
            // get the selected fields of the initial line_stop of a route (order = 0) or for the line_stop at "from"
            // (the stop from which we're trying to get departures), potentially for a given line/direction
            where: {
                direction: direction,
                line: {name: line},
                OR: [
                    {
                        order: 0,
                        line: {
                            line_stop: {
                                some: {
                                    id_stop: from
                                },
                            }
                        }
                    },
                    {
                        id_stop: from
                    }
                ]
            }
        }).then(lineStops => lineStops as {
                line: { name: string, type: TransportType },
                stop: {
                    id: number
                    name: string,
                    departure: { line: { name: string }, direction: string, time_utc: Date }[],
                    departure_delay: {
                        direction: string,
                        delay: number,
                        line: { name: string }
                    }[],
                    line_stop: { line: { name: string, type: string }, direction: string } []
                },
                direction: string,
            }[]
        ).then(lineStops => {
            if (lineStops.length == 0) {
                let message = `Unable to find departures from stop with internal ID ${from}`;
                if (line) {
                    message += ` on line ${line}`;
                }
                if (direction) {
                    message += ` in direction of ${direction}`;
                }
                throw new DepartureNotFoundError(message);
            }
            return lineStops;
        }).then(lineStops => lineStops.filter(lineStop => lineStop.direction != lineStop.stop.name) // discard departures from a stop that's a final stop
        ).then(lineStops => {
            // extract the departures from all edges of all lines that are serving our stop
            const departuresByLine = lineStops
                .filter(lineStop => lineStop.stop.departure.length > 0)
                .reduce((departuresByLine, lineStop) => {
                    if (!(lineStop.line.name in departuresByLine)) {
                        departuresByLine[lineStop.line.name] = {
                            type: lineStop.line.type as TransportType,
                            departures: {} as { [direction: string]: Date[] }
                        };
                    }
                    lineStop.stop.departure
                        // only keep the departures for the line of the line_stop we're considering this iteration
                        // otherwise we end up inserting departures from Otoka for line 105 as departures for line 101
                        .filter(departure => departure.line.name === lineStop.line.name)
                        .forEach(departure => {
                            // reset the date to make sure a date with time 00:29 CET (= 23:29 UTC) doesn't get
                            // interpreted as a D+1 date
                            departure.time_utc.setFullYear(1970, 0, 1);
                            if (!departuresByLine[lineStop.line.name].departures[departure.direction]) {
                                departuresByLine[lineStop.line.name].departures[departure.direction] = [departure.time_utc];
                            } else {
                                departuresByLine[lineStop.line.name].departures[departure.direction].push(departure.time_utc)
                            }
                        });
                    return departuresByLine;
                }, {} as {
                    [line: string]: {
                        type: TransportType;
                        departures: { [direction: string]: Date[] };
                    }
                });

            let getAfter: Date | undefined;
            if (after) {
                getAfter = new Date(after);
                getAfter.setFullYear(1970, 0, 1);
            }

            // apply the delay to the edges' departure times and return the result as a DepartureByLine (line name ->
            // direction -> datetimes)
            const now = new Date();
            const lineStopOccurrences = lineStops.filter(d => d.stop.id === from);
            return {
                stop: {
                    id: lineStopOccurrences[0].stop.id,
                    name: lineStopOccurrences[0].stop.name,
                    connections: Object
                        .entries(lineStopOccurrences[0].stop.line_stop
                            // map as a line => line_stop[] object
                            .reduce((connectionsByLine, lineStop) => {
                                if (!(lineStop.line.name in connectionsByLine)) {
                                    connectionsByLine[lineStop.line.name] = [];
                                }
                                connectionsByLine[lineStop.line.name].push(lineStop);
                                return connectionsByLine;
                            }, {} as { [line: string]: { line: { name: string, type: string }, direction: string }[] })
                        )
                        // map as a list of connections and sort them by type, then line name
                        .map(([lineName, lineStops]) => ({
                            line: lineName,
                            type: lineStops[0].line.type,
                            directions: lineStops.map(ls => ls.direction)
                        } as Connection))
                        .sort((c1, c2) => c1.type != c2.type ? c1.type.localeCompare(c2.type) : c1.line.localeCompare(c2.line))
                },
                departures: lineStopOccurrences
                    .filter(d => Object.keys(departuresByLine).includes(d.line.name))
                    .map(r => {
                        const delay: number = r.stop.departure_delay.filter(delay => delay.line.name == r.line.name && delay.direction == r.direction)[0]?.delay || 0;
                        const lineDepartures = Object.keys(departuresByLine).includes(r.line.name) ? departuresByLine[r.line.name].departures : {};
                        const times = (Object.keys(lineDepartures).includes(r.direction) ? lineDepartures[r.direction] : [])
                            .map(d => new Date(d.getTime() + delay * 60_000))
                            .filter(d => !getAfter || d >= getAfter);
                        const departures = !limit ? times : times.slice(0, limit);
                        return {
                            line: r.line.name,
                            type: r.line.type,
                            direction: r.direction,
                            departures: departures
                        };
                    })
                    .reduce((out, departure) => {
                        if (!(departure.line in out)) {
                            out[departure.line] = {
                                type: departure.type,
                                departures: {} as { [direction: string]: Departure[] }
                            };
                        }
                        departure.departures.forEach(d => d.setFullYear(now.getFullYear(), now.getMonth(), now.getDate()));
                        out[departure.line].departures[departure.direction] = departure.departures
                            .map(d => ({'scheduledAt': d.toISOString()}));
                        return out;
                    }, {} as DepartureByLine)
            } as DeparturesAtStop;
        }).catch((err: Error) => {
            console.error(err);
            throw err;
        });
    }

    async getNextDepartures(from: number, line?: string, direction?: string, limit?: number): Promise<DeparturesAtStop> {
        const after = new Date();
        after.setSeconds(0, 0);
        return this.getScheduledDepartures(from, line, direction, after, limit || 5);
    }
}