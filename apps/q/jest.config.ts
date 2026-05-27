import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  displayName: "q",
  testEnvironment: "jsdom",
  passWithNoTests: true,
  setupFilesAfterEnv: ["<rootDir>/../../config/jest.setup.ts", "<rootDir>/test/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/e2e/"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules", "<rootDir>/../../node_modules"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@pullim-q/api-client$": "<rootDir>/../../packages/api-client/src/index.ts",
    "^@pullim-q/auth$": "<rootDir>/../../packages/auth/src/index.ts",
    "^@pullim-q/types$": "<rootDir>/../../packages/types/src/index.ts",
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};

export default createJestConfig(config);
