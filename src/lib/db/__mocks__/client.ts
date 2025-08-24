import { execSync } from 'child_process';
import { join } from 'path';
import * as fs from 'node:fs';

const schema = join(__dirname, '..', '..', '..', '..', 'prisma', 'schema.prisma');
const integrationSchema = join(__dirname, '..', '..', '..', '..', 'prisma', 'schema.integration.test.prisma');

const schemaContent = fs.readFileSync(schema, 'utf8');
const schemaForIntegration = schemaContent
    .replace(/generated\/prisma/g, 'generated/integration/prisma')
    .replace(/postgresql/g, 'sqlite')
    .replace(/(, )*map: "[A-Za-z0-9_]+"/g, '')              // named keys and constraints
    .replace(/@db\.[A-Za-z0-9()]+/g, '')                    // @db types
    .replace(/onDelete: NoAction/g, 'onDelete: Cascade');   // cascade delete on FKs to ease post-suite clean up
fs.writeFileSync(integrationSchema, schemaForIntegration, 'utf8');

const dbPath = join(__dirname, '..', '..', '..', '..', 'prisma', 'dev.db');

const url = `file:${dbPath}`;
process.env.DATABASE_URL = url;

const prismaBinary = join(__dirname, '..', '..', '..', '..', 'node_modules', '.bin', 'prisma');

execSync(`${prismaBinary} generate --schema ${integrationSchema}`);

import { Prisma, PrismaClient } from '../../../../generated/integration/prisma';

const prisma = new PrismaClient({
    datasources: {db: {url}}
});
export default prisma;

beforeAll(() => {
    execSync(`${prismaBinary} db push --schema ${integrationSchema}`, {
        env: {
            ...process.env,
            DATABASE_URL: url,
        }
    });
});

afterAll(async () => {
    await prisma.$disconnect();
    execSync(`rm ${dbPath}`);
});

beforeEach(async () => {
    const tables = await prisma.$queryRaw`SELECT name
                                          FROM sqlite_master
                                          WHERE type = 'table'
                                            AND name NOT LIKE 'sqlite_%'` as { name: string }[];
    for (const table of tables) {
        await prisma.$executeRaw`DELETE
                                 FROM ${Prisma.raw(table.name)}`;
    }
})