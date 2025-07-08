import { Request, Response } from 'express';
import DeparturesService from '../services/departures.service';
import { DepartureByLine } from '../models/departures';
import { LineNotFoundError } from '../models/error/line-not-found';
import { StopNotFound } from '../models/error/stop-not-found';

export default class DeparturesController {
    private readonly departuresService: DeparturesService;

    constructor(departuresService: DeparturesService) {
        this.departuresService = departuresService;
    }

    async getScheduledDepartures(req: Request, res: Response) {
        const from = parseInt(req.query.from as string);
        const {line, direction, after, limit} = req.query as {
            line: string | undefined,
            direction: string | undefined,
            after: string | undefined,
            limit: number | undefined
        };
        this.departuresService.getScheduledDepartures(from, line, direction, after, limit)
            .then((departures: DepartureByLine) => res.status(200).json(departures))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof LineNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else if (err instanceof StopNotFound) {
                    status = 400;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = err.message;
                }
                res.status(status).json({error: errorMessage});
            });
    }

    async getNextDepartures(req: Request, res: Response) {
        const from = parseInt(req.query.from as string);
        const {line, direction, limit} = req.query as {
            line: string | undefined,
            direction: string | undefined,
            limit: number | undefined
        };
        this.departuresService.getNextDepartures(from, line, direction, limit)
            .then((departures: DepartureByLine) => res.status(200).json(departures))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof LineNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else if (err instanceof StopNotFound) {
                    status = 400;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = err.message;
                }
                res.status(status).json({error: errorMessage});
            });
    }
}