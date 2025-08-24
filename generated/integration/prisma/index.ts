export const Prisma = {
    raw: (s: string) => s
};

export class PrismaClient {
    constructor({datasources}: {datasources: {}}) {};

    $disconnect = () => { return new Promise(() => {})};
    $queryRaw = (s: TemplateStringsArray) => { return new Promise(() => {})};
    $executeRaw = (s: TemplateStringsArray, s2: string) => { return new Promise(() => {})};
}