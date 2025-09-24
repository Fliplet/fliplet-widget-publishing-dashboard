/**
 * Jest test setup file
 * Configures global mocks and utilities for middleware testing
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] || null
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Fliplet API
global.Fliplet = {
  API: {
    request: jest.fn()
  },
  Navigate: {
    query: {}
  }
};

// Mock window globals that middleware classes expect
global.window = {
  ...global.window,
  BaseMiddleware: undefined,
  StateManager: undefined,
  ValidationEngine: undefined,
  ErrorHandler: undefined,
  DataMapper: undefined
};

// Mock console methods to reduce test noise
global.console = {
  ...global.console,
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  log: jest.fn()
};

// Utility function to create mock dependencies
global.createMockDependencies = (overrides = {}) => {
  return {
    stateManager: {
      getState: jest.fn(() => ({})),
      setState: jest.fn(() => Promise.resolve(true)),
      updateWorkflowState: jest.fn(() => Promise.resolve(true)),
      on: jest.fn(),
      emit: jest.fn()
    },
    validationEngine: {
      validate: jest.fn(() => ({ isValid: true, errors: [] })),
      validateField: jest.fn(() => ({ isValid: true, errors: [] })),
      on: jest.fn(),
      emit: jest.fn()
    },
    errorHandler: {
      handleError: jest.fn(() => Promise.resolve({
        error: {},
        userMessage: { title: 'Error', message: 'Test error' },
        category: 'TEST_ERROR',
        recovery: { strategy: null, success: false }
      })),
      on: jest.fn(),
      emit: jest.fn()
    },
    dataMapper: {
      transformApiResponse: jest.fn((data) => data),
      transformToState: jest.fn((data) => data),
      transformFromState: jest.fn((data) => data),
      on: jest.fn(),
      emit: jest.fn()
    },
    ...overrides
  };
};

// Utility function to create mock config
global.createMockConfig = (overrides = {}) => {
  return {
    api: {
      baseUrl: 'https://api.fliplet.test',
      timeout: 30000,
      retryAttempts: 3
    },
    storage: {
      key: 'test-publishing-dashboard-state',
      autoSave: true
    },
    validation: {
      cacheTimeout: 5000,
      enableValidation: true,
      strictMode: false
    },
    errorHandler: {
      maxHistorySize: 100,
      enableReporting: true,
      autoRetry: true,
      maxRetryAttempts: 3
    },
    dataMapper: {
      enableValidation: true,
      strictMode: false,
      preserveRawData: true
    },
    ...overrides
  };
};

// Utility to wait for async operations
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clean up after each test
afterEach(() => {
  // Clear localStorage
  localStorage.clear();

  // Clear console mocks
  console.warn.mockClear();
  console.error.mockClear();
  console.info.mockClear();
  console.log.mockClear();

  // Clear Fliplet API mocks
  Fliplet.API.request.mockClear();
  if (Fliplet.Navigate) {
    Fliplet.Navigate.query = {};
  }
});

// Set up global test timeout
jest.setTimeout(10000);
