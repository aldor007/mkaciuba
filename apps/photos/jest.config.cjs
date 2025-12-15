module.exports = {
  preset: "../../jest.preset.js",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  transform: {
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nrwl/react/plugins/jest",
    "^.+\\.[tj]sx?$": "ts-jest",
    '^.+\\.m?js$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.+\\.mjs$|react-markdown|remark.*|unified|bail|is-plain-obj|trough|vfile.*|unist.*|micromark.*|decode-named-character-reference|character-entities|property-information|hast.*|space-separated-tokens|comma-separated-tokens|pretty-bytes|zwitch|html-void-elements|ccount|escape-string-regexp|markdown-table|mdast-util.*|trim-lines|devlop|rehype.*|estree.*))'
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html", "mjs"],
  coverageDirectory: "../../coverage/apps/photos",
  globals: { "ts-jest": { tsconfig: "<rootDir>/tsconfig.spec.json" } },
  displayName: "photos",
};
