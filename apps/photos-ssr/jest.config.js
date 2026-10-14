module.exports = {
  preset: "../../jest.preset.js",
  coverageDirectory: "../../coverage/apps/photos-ssr",
  globals: { "ts-jest": { tsConfig: "<rootDir>/tsconfig.spec.json" } },
  displayName: "photos-ssr",
  testEnvironment: "node",
  moduleNameMapper: {
    // react-markdown / rehype-raw ship ESM-only code that ts-jest cannot parse in
    // the node environment; the SSR bundle includes the real packages via webpack.
    "^react-markdown$": "<rootDir>/src/test-stubs/react-markdown.ts",
    "^rehype-raw$": "<rootDir>/src/test-stubs/rehype-raw.ts",
  },
};
