module.exports = {
  preset: "../../jest.preset.js",
  coverageDirectory: "../../coverage/apps/photos-ssr",
  globals: { "ts-jest": { tsConfig: "<rootDir>/tsconfig.spec.json" } },
  displayName: "photos-ssr",
};
