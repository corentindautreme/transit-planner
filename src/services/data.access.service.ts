import { PrismaClient } from '../../generated/prisma';

export default abstract class DataAccessService {
    protected readonly prismaClient: PrismaClient;

    protected constructor() {
        this.prismaClient = new PrismaClient();
    }
}