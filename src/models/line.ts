import { TransportType } from './transport-type';
import { Stop } from './stop';

export interface Line {
    id?: number;
    name: string;
    type: TransportType;
    directions: string[];
}

export interface Route {
    direction: string;
    stops: Stop[];
}

export interface DescribedLine extends Line {
    routes: Route[];
}