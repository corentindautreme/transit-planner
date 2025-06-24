import { Router } from 'express';
import LinesController from '../controllers/lines.controller';
import LinesService from '../services/lines.service';

class LinesRoute {
    public readonly router: Router;
    private readonly linesController: LinesController;

    constructor() {
        this.router = Router();
        this.linesController = new LinesController(new LinesService());
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get('/', this.linesController.getAllLines.bind(this.linesController));
        this.router.get('/describe', this.linesController.describeLineRoute.bind(this.linesController));
        this.router.get('/describe-line', this.linesController.describeLine.bind(this.linesController));
        this.router.get('/describe-all', this.linesController.describeAllLines.bind(this.linesController));
    }
}

export default new LinesRoute().router;