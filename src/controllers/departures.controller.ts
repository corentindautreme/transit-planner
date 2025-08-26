import { Request, Response } from 'express';
import DeparturesService from '../services/departures.service';
import { DeparturesAtStop } from '../models/departures';
import { LineNotFoundError } from '../models/error/line-not-found';
import { StopNotFoundError } from '../models/error/stop-not-found';
import { DepartureNotFoundError } from '../models/error/departure-not-found';
import { StopAndRouteDeparture } from '../models/stop';

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
            .then((departures: DeparturesAtStop) => res.status(200).json(departures))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof DepartureNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = "An internal error occurred and your request could not be processed";
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
            .then((departures: DeparturesAtStop) => res.status(200).json(departures))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof DepartureNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = "An internal error occurred and your request could not be processed";
                }
                res.status(status).json({error: errorMessage});
            });
    }

    async getDeparturesOnRoute(req: Request, res: Response) {
        const line = req.query.line as string;
        const direction = req.query.direction as string;
        const {from, to, includePast, after, limit} = req.query as {
            from: number | undefined,
            to: number | undefined,
            includePast: boolean | undefined,
            after: string | undefined,
            limit: number | undefined
        };
        this.departuresService.getDeparturesOnRoute(line, direction, from, to, includePast, after, limit)
            .then((stops: StopAndRouteDeparture[]) => res.status(200).json(stops))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof StopNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = "An internal error occurred and your request could not be processed";
                }
                res.status(status).json({error: errorMessage});
            });
    }
}