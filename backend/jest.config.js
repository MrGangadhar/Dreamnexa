module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  globalSetup: '<rootDir>/tests/globalSetup.js',
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  // The whole suite shares one SQLite file (see tests/helpers/paths.js).
  // Running workers in parallel would let two test files' transactions
  // interleave against that shared file in confusing ways, so we force
  // serial execution — the suite is small enough that this costs little.
  maxWorkers: 1,
  verbose: true,
  testTimeout: 15000,
  forceExit: true,
};

