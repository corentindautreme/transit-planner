import { Request, Response } from 'express';
import DeparturesService from '../services/departures.service';

export default class DeparturesController {
    private readonly departuresService: DeparturesService;

    constructor(departuresService: DeparturesService) {
        this.departuresService = departuresService;
    }

    async getScheduledDepartures(req: Request, res: Response) {
        const {from, after} = req.query as {from: string, after?: string};
        const departures = await this.departuresService.getScheduledDepartures(from, after);
        if (departures) {
            res.status(200).json(departures);
        } else {
            res.status(404).json({'error': `No departures found for stop ${from}`});
        }
    }
}