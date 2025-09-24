module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/*.test.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/middleware/**/*.js',
    '!src/middleware/**/*.test.js',
    '!**/node_modules/**'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true
};
