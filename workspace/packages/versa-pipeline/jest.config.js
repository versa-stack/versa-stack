const { compilerOptions } = require("./tsconfig");
const { pathsToModuleNameMapper } = require("ts-jest");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  modulePaths: [compilerOptions.baseUrl],
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
