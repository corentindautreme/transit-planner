import { DescribedLine, Line, Route } from '../models/line';
import DataAccessService from './data.access.service';
import { Connection, Stop } from '../models/stop';
import { LineNotFoundError } from '../models/error/line-not-found';
import { StopNotFound } from '../models/error/stop-not-found';

export default class LinesService extends DataAccessService {
    constructor() {
        super();
    }

    async getAllLines(): Promise<Line[]> {
        return this.prismaClient.line.findMany({
            select: {
                name: true,
                type: true,
                line_stop: {
                    select: {stop: {select: {name: true}}},
                    where: {
                        order: 0
                    }
                }
            }
        }).then(lines => lines as (Omit<Line, 'directions'> & {
            line_stop: { stop: { name: string } }[]
        })[]).then(lines => lines.map(line => ({
            name: line.name,
            type: line.type,
            directions: line.line_stop.map(ls => ls.stop.name)
        } as Line)));
    }

    async describeLineRoute(name: string, direction: string, from?: string): Promise<Stop[]> {
        return this.prismaClient.line_stop.findMany({
            select: {
                line: {select: {name: true}},
                stop: {
                    select: {
                        name: true,
                        line_stop: {
                            select: {
                                line: {select: {name: true, type: true}},
                                direction: true
                            }
                        }
                    }
                }
            },
            where: {
                line: {name: name},
                direction: direction
            },
            orderBy: {order: 'asc'}
        }).then(lineStops => lineStops as ({
                line: { name: string },
                stop: Stop & { line_stop: { line: { name: string, type: string }, direction: string } [] }
            })[]
        ).then(lineStops => {
            if (lineStops.length == 0) {
                throw new LineNotFoundError(`Unable to find line ${name} with direction ${direction}`)
            }
            return lineStops;
        }).then(lineStops => lineStops.map(ls => ({
                name: ls.stop.name,
                connections: Object
                    .entries(ls.stop.line_stop
                        // don't list the current line as a connection at that stop
                        .filter(s => s.line.name != ls.line.name)
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
            } as Stop))
        ).then(route => {
            if (!!from) {
                const indexOfFrom = route.findIndex((s: Stop) => s.name === from);
                if (indexOfFrom > -1) {
                    return route.slice(indexOfFrom);
                }
                throw new StopNotFound(`Stop ${from} does not exist on line ${name} in direction of ${direction}`);
            }
            return route;
        }).catch((err: Error) => {
            if (!(err instanceof LineNotFoundError || err instanceof StopNotFound)) {
                console.error(err);
            }
            throw err;
        });
    }

    async describeLine(name: string): Promise<DescribedLine> {
        return this.describeLines([name]).then(lines => lines[0]);
    }

// TODO have directions returned in the same order as in getAllLines
    async describeLines(names ?: string[]): Promise<DescribedLine[]> {
        return this.prismaClient.line_stop.findMany({
            select: {
                line: {select: {name: true, type: true}},
                direction: true,
                stop: {
                    select: {
                        name: true,
                        line_stop: {
                            select: {
                                line: {select: {name: true, type: true}},
                                direction: true,
                                order: true
                            }
                        }
                    }
                },
            },
            where: !!names ? {line: {name: {in: names}}} : undefined,
            orderBy: {order: 'asc'}
        }).then(lineStops => lineStops as {
            line: { name: string, type: string },
            direction: string,
            stop: (Stop & { line_stop: { order: number, line: { name: string, type: string }, direction: string }[] })
        }[]).then(lineStops => lineStops.reduce((lineStopsByLineAndDirection, lineStop) => {
            if (!Object.keys(lineStopsByLineAndDirection).includes(lineStop.line.name)) {
                lineStopsByLineAndDirection[lineStop.line.name] = {type: lineStop.line.type, routes: {}};
            }
            if (!Object.keys(lineStopsByLineAndDirection[lineStop.line.name].routes).includes(lineStop.direction)) {
                lineStopsByLineAndDirection[lineStop.line.name].routes[lineStop.direction] = [];
            }
            lineStopsByLineAndDirection[lineStop.line.name].routes[lineStop.direction].push({
                name: lineStop.stop.name,
                connections: Object
                    .entries(lineStop.stop.line_stop
                        // don't list the current line as a connection at that stop
                        .filter(s => s.line.name != lineStop.line.name)
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
            });
            return lineStopsByLineAndDirection;
        }, {} as {
            [line: string]: {
                type: string,
                routes: {
                    [direction: string]: Stop[]
                }
            }
        })).then(lineStopsByLineAndDirection => {
            return Object.entries(lineStopsByLineAndDirection).map(([name, line]) => ({
                name: name,
                type: line.type,
                directions: Object.keys(line.routes),
                routes: Object.entries(line.routes).map(([direction, stops]) => ({
                    direction: direction,
                    stops: stops
                }) as Route)
            }) as DescribedLine);
        }).catch((err: Error) => {
            console.error(err);
            throw err;
        });
    }
}