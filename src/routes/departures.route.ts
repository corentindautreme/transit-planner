import { Router } from 'express';
import LinesController from '../controllers/lines.controller';
import LinesService from '../services/lines.service';
import DeparturesController from '../controllers/departures.controller';
import DeparturesService from '../services/departures.service';

class DeparturesRoute {
    public readonly router: Router;
    private readonly departuresController: DeparturesController;

    constructor() {
        this.router = Router();
        this.departuresController = new DeparturesController(new DeparturesService());
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get('/scheduled', this.departuresController.getScheduledDepartures.bind(this.departuresController));
    }
}

export default new DeparturesRoute().router;