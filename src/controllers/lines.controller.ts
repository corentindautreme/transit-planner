import LinesService from '../services/lines.service';
import { Request, Response } from 'express';
import { Stop } from '../models/stop';
import { LineNotFoundError } from '../models/error/line-not-found';
import { StopNotFound } from '../models/error/stop-not-found';

export default class LinesController {
    private readonly linesService: LinesService;

    constructor(linesService: LinesService) {
        this.linesService = linesService;
    }

    async getAllLines(req: Request, res: Response) {
        res.status(200).json(await this.linesService.getAllLines());
    }

    async describeLineRoute(req: Request, res: Response) {
        const {name, direction, from} = req.query as { name: string, direction: string, from?: string };
        this.linesService.describeLineRoute(name, direction, from)
            .then((route: Stop[]) => res.status(200).json(route))
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
                    // TODO chain promise from prisma request and log error in a catch there (and not at controller level)
                    console.error(err);
                    status = 500;
                    errorMessage = err.message;
                }
                res.status(status).json({error: errorMessage});
            });
    }

    async describeLine(req: Request, res: Response) {
        const {name} = req.query as { name: string };
        this.linesService.describeLine(name)
            .then(lines => res.status(200).json(lines))
            .catch((err: Error) => {
                res.status(500).json({error: err.message});
            });
    }

    async describeAllLines(req: Request, res: Response) {
        this.linesService.describeLines()
            .then(lines => res.status(200).json(lines))
            .catch((err: Error) => {
                res.status(500).json({error: err.message});
            });
    }
}