import { PrismaClient } from '../../generated/prisma';
import prisma from '../lib/db/client';

export default abstract class DataAccessService {
    protected readonly prismaClient: PrismaClient;

    protected constructor() {
        this.prismaClient = prisma;
    }
}