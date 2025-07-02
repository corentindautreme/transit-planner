import { Router } from 'express';
import StopsController from '../controllers/stops.controller';
import StopsService from '../services/stops.service';

class StopsRoute {
    public readonly router: Router;
    private readonly stopsController: StopsController;

    constructor() {
        this.router = Router();
        this.stopsController = new StopsController(new StopsService());
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get('/', this.stopsController.getAllStops.bind(this.stopsController));
    }
}

export default new StopsRoute().router;