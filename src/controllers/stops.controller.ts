import { Request, Response } from 'express';
import StopsService from '../services/stops.service';

export default class StopsController {
    private readonly stopsService: StopsService;

    constructor(stopsService: StopsService) {
        this.stopsService = stopsService;
    }

    async getAllStops(req: Request, res: Response) {
        this.stopsService.getAllStops()
            .then(stops => res.status(200).json(stops))
            .catch((err: Error) => {
                res.status(500).json({error: "An internal error occurred and your request could not be processed"});
            });
    }
}