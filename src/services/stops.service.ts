import DataAccessService from './data.access.service';
import { Stop } from '../models/stop';

export default class StopsService extends DataAccessService {
    constructor() {
        super();
    }

    async getAllStops(): Promise<Stop[]> {
        return this.prismaClient.stop.findMany({
            select: {name: true},
            orderBy: {name: 'asc'}
        }).then(lines => lines as Stop[]);
    }
}