/**
 * Vue test setup configuration
 */

// Mock Vue-specific Fliplet integrations
global.Fliplet = {
  ...global.Fliplet,
  User: {
    getCachedSession: jest.fn(() => ({
      name: 'Test User',
      email: 'test@example.com'
    })),
    getAuthToken: jest.fn(() => 'mock-auth-token')
  },
  App: {
    get: jest.fn(() => ({
      id: 123,
      name: 'Test App'
    }))
  },
  Env: {
    get: jest.fn((key) => {
      const env = {
        environment: 'test'
      };
      return env[key];
    })
  },
  Navigate: {
    url: jest.fn(),
    query: {}
  }
};

// Mock PublishingMiddleware
global.PublishingMiddleware = {
  isInitialized: false,
  initialize: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  getComponent: jest.fn(),
  getController: jest.fn(),
  getService: jest.fn()
};

// Vue Test Utils configuration
const Vue = require('vue');

// Suppress Vue production tip
Vue.config.productionTip = false;

// Suppress Vue warnings in tests
Vue.config.silent = true;

// Helper to create a component instance with props
global.createComponent = (Component, propsData = {}, options = {}) => {
  const Constructor = Vue.extend(Component);
  const vm = new Constructor({
    propsData,
    ...options
  }).$mount();
  return vm;
};

// Helper to trigger events
global.triggerEvent = (element, eventType, options = {}) => {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...options
  });
  element.dispatchEvent(event);
};

// Helper to wait for Vue updates
global.nextTick = () => Vue.nextTick();

// Helper to wait for async operations
global.flushPromises = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};

// Clean up after each test
afterEach(() => {
  // Clear Vue component instances
  document.body.innerHTML = '';
});