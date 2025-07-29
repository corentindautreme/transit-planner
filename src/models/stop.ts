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