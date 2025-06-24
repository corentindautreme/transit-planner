import { Line } from '../models/line';
import DataAccessService from './data.access.service';
import { Connection, Stop } from '../models/stop';
import { LineNotFoundError } from '../models/error/line-not-found';
import { StopNotFound } from '../models/error/stop-not-found';

export default class LinesService extends DataAccessService {
    constructor() {
        super();
    }

    async getAllLines(): Promise<Line[]> {
        const lines = await this.prismaClient.line.findMany({
            select: {
                name: true,
                type: true
            }
        }) as Line[];
        return lines;
    }

    async describeLineRoute(name: string, direction: string, from?: string): Promise<Stop[]> {
        const lineStops = await this.prismaClient.line_stop.findMany({
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
        }) as ({
            line: { name: string },
            stop: Stop & { line_stop: { line: { name: string, type: string }, direction: string } [] }
        })[];
        if (lineStops.length == 0) {
            return Promise.reject(new LineNotFoundError(`Unable to find line ${name} with direction ${direction}`));
        }
        const route = lineStops.map(ls => ({
            name: ls.stop.name,
            connections: ls.stop.line_stop
                // don't list as a connection at that stop:
                //  * the current line
                //  * a line that ends at that stop
                .filter(s => s.line.name != ls.line.name && s.direction != ls.stop.name)
                .map(s => ({line: s.line.name, type: s.line.type, direction: s.direction} as Connection))
                .sort((c1, c2) => c1.line.localeCompare(c2.line))
        } as Stop));
        if (!!from) {
            const indexOfFrom = route.findIndex((s: Stop) => s.name === from);
            if (indexOfFrom > -1) {
                return route.slice(indexOfFrom);
            }
            return Promise.reject(new StopNotFound(`Stop ${from} does not exist on line ${name}`));
        }
        return route;
    }
}