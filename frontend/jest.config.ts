/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: undefined,

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  setupFilesAfterEnv: ["./jest.setup.ts"],

  // Whether to use watchman for file crawling
  // watchman: true,
};

export default createJestConfig(config);
