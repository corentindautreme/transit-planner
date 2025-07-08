import { TransportType } from './transport-type';
import { Stop } from './stop';

export interface Departure {
    scheduledAt: string;
}

export interface DeparturesAtStop {
    stop: Stop;
    departures: DepartureByLine;
}

export type DepartureByLine = {
    [line: string]: {
        type: TransportType,
        departures: { [direction: string]: Departure[] }
    }
};