import { Departure } from './departures';

export interface Stop {
    id?: number;
    name: string;
    connections: Connection[];
}

export interface Connection {
    line: string;
    type: string;
    directions: string[];
}

export interface StopAndRouteDeparture extends Omit<Stop, 'connections'> {
    departures: Departure[];
}