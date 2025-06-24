import { TransportType } from './transport-type';

export interface Line {
    id: number;
    name: string;
    type: TransportType;
}