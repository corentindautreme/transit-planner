export class DepartureNotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}