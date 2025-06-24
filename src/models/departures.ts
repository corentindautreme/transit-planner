import { TransportType } from './transport-type';

export interface Departure {
    scheduledAt: string;
}

export type DepartureByLine = {
    [line: string]: {
        type: TransportType,
        departures: { [direction: string]: Departure[] }
    }
};