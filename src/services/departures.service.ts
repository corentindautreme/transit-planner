import DataAccessService from './data.access.service';
import { DepartureByLine } from '../models/departures';

export default class DeparturesService extends DataAccessService {
    constructor() {
        super();
    }

    async getScheduledDepartures(from: string, after?: string): Promise<DepartureByLine | undefined> {
        const res = await this.prismaClient.line_stop.findMany({
            select: {
                direction: true,
                line: {
                    select: {
                        name: true
                    }
                },
                stop: {
                    select: {
                        name: true,
                        departure: {
                            select: {
                                time_utc: true
                            },
                            orderBy: {
                                time_utc: 'asc'
                            }
                        },
                        departure_delay: {
                            select: {
                                line: true,
                                direction: true,
                                delay: true
                            },
                            orderBy: {
                                direction: 'asc'
                            }
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
        });
        // filter out the departures in direction of our stop (the one we're getting the departures from)
        const data = res.filter(d => d.direction! != from);
        console.log(JSON.stringify(data, null, 2));

        // extract the departures from all edges of all lines that are serving our stop
        const departures = data
            .filter(r => r.stop!.departure!.length > 0)
            .reduce((out, r) => {
                if (!(r.line!.name! in out)) {
                    out[r.line!.name!] = {};
                }
                out[r.line!.name!][r.direction!] = r.stop!.departure.map(d => d.time_utc!);
                return out;
            }, {} as { [line: string]: { [direction: string]: Date[]}});
        console.log(JSON.stringify(departures, null, 2));
        console.log(departures);

        let getAfter;
        if (!after) {
            getAfter = new Date(0);
        } else {
            getAfter = new Date(after);
            getAfter.setFullYear(1970, 0, 1);
        }

        console.log(getAfter);

        // apply the delay to the edges' departure times and return the result as a DepartureByLine (line name ->
        // direction -> times)
        return data.filter(d => d.stop!.name == from)
            .map(r => {
                const delay: number = r.stop!.departure_delay!.filter(delay => delay.line!.name == r.line!.name && delay.direction == r.direction!)[0]?.delay! || 0;
                const times = departures[r.line!.name!][r.direction!]
                    .map(d => new Date(d.getTime() + delay * 60_000))
                    .filter(d => d > getAfter);
                return {
                    line: r.line!.name!,
                    direction: r.direction!,
                    departures: times
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
}