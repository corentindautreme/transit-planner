import { Request, Response } from 'express';
import DeparturesService from '../services/departures.service';

export default class DeparturesController {
    private readonly departuresService: DeparturesService;

    constructor(departuresService: DeparturesService) {
        this.departuresService = departuresService;
    }

    async getScheduledDepartures(req: Request, res: Response) {
        const {from, line, direction, after, limit} = req.query as {
            from: string,
            line: string | undefined,
            direction: string | undefined,
            after: string | undefined,
            limit: number | undefined
        };
        const departures = await this.departuresService.getScheduledDepartures(from, line, direction, after, limit);
        if (departures) {
            res.status(200).json(departures);
        } else {
            res.status(404).json({'error': `No departures found for stop ${from}`});
        }
    }

    async getNextDepartures(req: Request, res: Response) {
        const {from, line, direction, limit} = req.query as {
            from: string,
            line: string | undefined,
            direction: string | undefined,
            limit: number | undefined
        };
        const departures = await this.departuresService.getNextDepartures(from, line, direction, limit);
        if (departures) {
            res.status(200).json(departures);
        } else {
            res.status(404).json({'error': `No departures found for stop ${from}`});
        }
    }
}