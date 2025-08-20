/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: "ts-jest",
    setupFiles: ["dotenv/config"],
    collectCoverage: true,
    collectCoverageFrom: ['**/*.ts'],
    coveragePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/generated/prisma/',
        '<rootDir>/test/',
        '<rootDir>/src/server.ts',
        '<rootDir>/src/lib/db'
    ],
};