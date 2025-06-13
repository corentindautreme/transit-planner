import DataAccessService from './data.access.service';
import { DepartureByLine } from '../models/departures';

export default class DeparturesService extends DataAccessService {
    constructor() {
        super();
    }

    async getScheduledDepartures(from: string, after?: string | Date, limit?: number): Promise<DepartureByLine> {
        const res = await this.prismaClient.line_stop.findMany({
            select: {
                direction: true,
                line: {select: {name: true}},
                stop: {
                    select: {
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
                        }
                    }
                },
            },
            // get the selected fields of the initial line_stop of a route (order = 0) or for the line_stop at "from"
            // (the stop from which we're trying to get departures)
            where: {
                OR: [
                    {
                        order: 0,
                        line: {
                            line_stop: {
                                some: {
                                    stop: {
                                        name: from
                                    }
                                },
                            }
                        }
                    },
                    {
                        stop: {
                            name: from
                        }
                    }
                ]
            }
        }) as ({
            line: { name: string },
            stop: {
                name: string,
                departure: { line: { name: string }, direction: string, time_utc: Date }[],
                departure_delay: {
                    direction: string,
                    delay: number,
                    line: { name: string }
                }[]
            },
            direction: string,
        }[]);
        // since we retrieve all the data we need (departures of edge stops, delays at stops) for all stops, regardless
        // of whether we need this data for this stop or not, we end up with not so useful data, such as line_stop data
        // in direction of our stop (coming from stops located on a line accessible from the station we're getting
        // departures from), which would later be interpreted as (TODO finish comment idk why we do this anymore)
        // filter out the departures in direction of our stop (the one we're getting the departures from)
        // console.log(JSON.stringify(res.map(ls => ({...ls, stop: {...ls.stop, departure: ls.stop.departure.slice(0, 5) }})).filter(lineStop => lineStop.direction === from), null, 2))
        const lineStopData = res.filter(lineStop => lineStop.direction != from);

        // extract the departures from all edges of all lines that are serving our stop
        const departuresByLine = lineStopData
            .filter(lineStop => lineStop.stop.departure.length > 0)
            .reduce((departuresByLine, lineStop) => {
                if (!(lineStop.line.name in departuresByLine)) {
                    departuresByLine[lineStop.line.name] = {};
                }
                lineStop.stop.departure
                    // only keep the departures for the line of the line_stop we're considering this iteration
                    // otherwise we end up inserting departures from Otoka for line 105 as departures for line 101
                    .filter(departure => departure.line.name === lineStop.line.name)
                    .forEach(departure => {
                        if (!departuresByLine[lineStop.line.name][departure.direction]) {
                            departuresByLine[lineStop.line.name][departure.direction] = [departure.time_utc];
                        } else {
                            departuresByLine[lineStop.line.name][departure.direction].push(departure.time_utc)
                        }
                    });
                return departuresByLine;
            }, {} as { [line: string]: { [direction: string]: Date[] } });

        let getAfter;
        if (!after) {
            getAfter = new Date(0);
        } else {
            getAfter = new Date(after);
            getAfter.setFullYear(1970, 0, 1);
        }

        // apply the delay to the edges' departure times and return the result as a DepartureByLine (line name ->
        // direction -> times)
        return lineStopData.filter(d => d.stop.name == from)
            .filter(d => Object.keys(departuresByLine).includes(d.line.name))
            .map(r => {
                const delay: number = r.stop.departure_delay.filter(delay => delay.line.name == r.line.name && delay.direction == r.direction)[0]?.delay || 0;
                const lineDepartures = Object.keys(departuresByLine).includes(r.line.name) ? departuresByLine[r.line.name] : {};
                const times = (Object.keys(lineDepartures).includes(r.direction) ? lineDepartures[r.direction] : [])
                    .map(d => new Date(d.getTime() + delay * 60_000))
                    .filter(d => d > getAfter);
                const departures = !limit ? times : times.slice(0, limit);
                return {
                    line: r.line.name,
                    direction: r.direction,
                    departures: departures
                };
            })
            .reduce((out, departure) => {
                if (!(departure.line in out)) {
                    out[departure.line] = {};
                }
                out[departure.line][departure.direction] = departure.departures.map(d => ({'scheduledAt': d.toLocaleString('bs-BA', {timeStyle: 'short'})}));
                return out;
            }, {} as DepartureByLine);
    }

    async getNextDepartures(from: string, limit?: number): Promise<DepartureByLine> {
        const after = new Date();
        return await this.getScheduledDepartures(from, after, limit || 5);
    }
}