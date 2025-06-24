export interface Stop {
    name: string;
    connections?: Connection[];
}

export interface Connection {
    line: string;
    type: string;
    direction: string;
}