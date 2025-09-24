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

  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'vue'],

  // Transform Vue files
  transform: {
    '.*\\.(vue)$': '<rootDir>/tests/vue-transform.js'
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Module name mapper for assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/style-mock.js'
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true
};
