
module.exports = {
  testPathIgnorePatterns: [
    "/__tests__/fixtures",
    "/__tests__/utils",
    "/__tests__/__mocks__"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  testEnvironment: "node",
  coverageReporters: ["json", "lcov", "text", "clover"],
};