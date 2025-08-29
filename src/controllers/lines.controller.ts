import LinesService from '../services/lines.service';
import { Request, Response } from 'express';
import { Stop } from '../models/stop';
import { LineNotFoundError } from '../models/error/line-not-found';
import { StopNotFoundError } from '../models/error/stop-not-found';

export default class LinesController {
    private readonly linesService: LinesService;

    constructor(linesService: LinesService) {
        this.linesService = linesService;
    }

    async getAllLines(req: Request, res: Response) {
        this.linesService.getAllLines()
            .then(lines => res.status(200).json(lines))
            .catch((err: Error) => {
                res.status(500).json({error: "An internal error occurred and your request could not be processed"});
            });
    }

    async describeLineRoute(req: Request, res: Response) {
        const {name, direction} = req.query as { name: string, direction: string };
        const from = 'from' in req.query ? parseInt(req.query.from as string) : undefined;
        this.linesService.describeLineRoute(name, direction, from)
            .then((route: Stop[]) => res.status(200).json(route))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof LineNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else if (err instanceof StopNotFoundError) {
                    status = 400;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = "An internal error occurred and your request could not be processed";
                }
                res.status(status).json({error: errorMessage});
            });
    }

    async describeLine(req: Request, res: Response) {
        const {name} = req.query as { name: string };
        this.linesService.describeLine(name)
            .then(lines => res.status(200).json(lines))
            .catch((err: Error) => {
                let errorMessage: string;
                let status: number;
                if (err instanceof LineNotFoundError) {
                    status = 404;
                    errorMessage = err.message;
                } else {
                    status = 500;
                    errorMessage = "An internal error occurred and your request could not be processed";
                }
                res.status(status).json({error: errorMessage});
            });
    }

    async describeAllLines(req: Request, res: Response) {
        this.linesService.describeLines()
            .then(lines => res.status(200).json(lines))
            .catch((err: Error) => {
                res.status(500).json({error: "An internal error occurred and your request could not be processed"});
            });
    }
}