import { PrismaClient } from '../../generated/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../../src/lib/db/client';

jest.mock('../../src/lib/db/client', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
    mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;