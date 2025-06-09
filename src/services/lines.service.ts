import { Line } from '../models/line';
import DataAccessService from './data.access.service';
import { Stop } from '../models/stop';

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

    async describeLineRoute(name: string, direction: string, from?: string): Promise<Stop[] | undefined> {
        const route = await this.prismaClient.line_stop.findMany({
            select: {
                stop: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                direction: direction
            },
            orderBy: {
                order: 'asc'
            }
        });
        return route.map(ls => ls.stop! as Stop);
    }
}