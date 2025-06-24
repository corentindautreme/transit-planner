export interface Departure {
    scheduledAt: string;
}

export type DepartureByLine = { [line: string]: { [direction: string]: Departure[]}};