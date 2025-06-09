import LinesService from '../services/lines.service';
import { Request, Response } from 'express';

export default class LinesController {
    private readonly linesService: LinesService;

    constructor(linesService: LinesService) {
        this.linesService = linesService;
    }

    async getAllLines(req: Request, res: Response) {
        res.status(200).json(await this.linesService.getAllLines());
    }

    async describeLineRoute(req: Request, res: Response) {
        const {name, direction} = req.query as {name: string, direction: string};
        const route = await this.linesService.describeLineRoute(name, direction);
        if (route) {
            res.status(200).json(route);
        } else {
            res.status(404).json({'error': `No line found with name ${name}`});
        }
    }
}