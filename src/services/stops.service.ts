import DataAccessService from './data.access.service';
import { Connection, Stop } from '../models/stop';
import { TransportType } from '../models/transport-type';

export default class StopsService extends DataAccessService {
    constructor() {
        super();
    }

    async getAllStops(): Promise<Stop[]> {
        // return this.prismaClient.stop.findMany({
        //     select: {name: true},
        //     orderBy: {name: 'asc'}
        // }).then(stop => stop as Stop[]);
        return this.prismaClient.line_stop.findMany({
            select: {
                stop: {select: {name: true}},
                line: {select: {name: true, type: true}},
                direction: true
            },
            orderBy: [{stop: {name: 'asc'}}, {line: {name: 'asc'}}, {direction: 'asc'}],
            distinct: ['id_line', 'id_stop', 'direction']
        }).then(lineStops => lineStops as ({
                direction: string,
                stop: { name: string },
                line: { name: string, type: TransportType }
            })[]
        ).then(lineStops => lineStops.reduce((stops, ls) => {
                // same stop, new line/direction
                if (stops.length > 0 && stops[stops.length - 1].name == ls.stop.name) {
                    // same line, new direction
                    if (stops[stops.length - 1].connections[stops[stops.length - 1].connections.length - 1].line === ls.line.name) {
                        stops[stops.length - 1].connections[stops[stops.length - 1].connections.length - 1].directions.push(ls.direction);
                    } else {
                        // new line
                        stops[stops.length - 1].connections.push({
                            line: ls.line.name,
                            type: ls.line.type,
                            directions: [ls.direction]
                        });
                    }
                } else {
                    // new stop
                    stops.push({
                        name: ls.stop.name,
                        connections: [{
                            line: ls.line.name,
                            type: ls.line.type,
                            directions: [ls.direction]
                        }]
                    })
                }
                return stops;
            }, [] as Stop[]
        )).then(lineStops => lineStops as Stop[]);
    }
}