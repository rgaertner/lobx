module.exports = {
  verbose: true,
  testEnvironment: "node",
  // testEnvironmentOptions: {
  // resources: 'usable',
  //  runScripts: 'dangerously'
  // },
  preset: "ts-jest",
  testMatch: ["<rootDir>/**/*.test.ts"],
  globals: {
    window: false
  }
};
