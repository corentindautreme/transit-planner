import { PrismaClient } from '../../../../generated/prisma';
import { execSync } from "child_process";
import { join } from "path";
import { URL } from "url";
import { v4 } from "uuid";

const generateDatabaseURL = (schema: string) => {
    if (!process.env.DATABASE_URL) {
        throw new Error("please provide a database url");
    }
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.append("schema", schema);
    return url.toString();
};

const schemaId = `test-${v4()}`;
console.log(`Running ITs on PostgreSQL schema ${schemaId}`);
const prismaBinary = join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "node_modules",
    ".bin",
    "prisma",
);

const url = generateDatabaseURL(schemaId);
process.env.DATABASE_URL = url;

const prisma = new PrismaClient({
    datasources: { db: { url } }
});
export default prisma;

beforeEach(() => {
    execSync(`${prismaBinary} db push`, {
        env: {
            ...process.env,
            DATABASE_URL: generateDatabaseURL(schemaId),
        },
    });
});
afterEach(async () => {
    await prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE;`,
    );
    await prisma.$disconnect();
});