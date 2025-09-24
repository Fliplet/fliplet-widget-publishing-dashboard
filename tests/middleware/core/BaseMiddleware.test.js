/**
 * BaseMiddleware Tests
 */

// Import the BaseMiddleware class
require('../../../src/middleware/core/BaseMiddleware.js');

describe('BaseMiddleware', () => {
  let baseMiddleware;
  let mockDependencies;
  let mockConfig;

  beforeEach(() => {
    mockDependencies = createMockDependencies();
    mockConfig = createMockConfig();
    baseMiddleware = new window.BaseMiddleware(mockDependencies, mockConfig);
  });

  afterEach(() => {
    if (baseMiddleware) {
      baseMiddleware.cleanup();
    }
  });

  describe('Constructor', () => {
    test('should initialize with dependencies and config', () => {
      expect(baseMiddleware.dependencies).toBe(mockDependencies);
      expect(baseMiddleware.config).toBe(mockConfig);
      expect(baseMiddleware.eventListeners).toBeInstanceOf(Map);
      expect(baseMiddleware.isInitialized).toBe(false);
    });

    test('should initialize with empty dependencies and config', () => {
      const middleware = new window.BaseMiddleware();
      expect(middleware.dependencies).toEqual({});
      expect(middleware.config).toEqual({});
      expect(middleware.eventListeners).toBeInstanceOf(Map);
    });
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      const emitSpy = jest.spyOn(baseMiddleware, 'emit');

      await baseMiddleware.initialize();

      expect(baseMiddleware.isInitialized).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith('initialized', {
        component: 'BaseMiddleware'
      });
    });

    test('should not initialize twice', async () => {
      await baseMiddleware.initialize();
      const setupSpy = jest.spyOn(baseMiddleware, 'setup');

      await baseMiddleware.initialize();

      expect(setupSpy).not.toHaveBeenCalled();
    });

    test('should emit error on initialization failure', async () => {
      const error = new Error('Test initialization error');
      jest.spyOn(baseMiddleware, 'setup').mockRejectedValue(error);
      const emitSpy = jest.spyOn(baseMiddleware, 'emit');

      await expect(baseMiddleware.initialize()).rejects.toThrow(error);

      expect(emitSpy).toHaveBeenCalledWith('error', {
        component: 'BaseMiddleware',
        error: 'Test initialization error',
        phase: 'initialization'
      });
    });
  });

  describe('Dependency Management', () => {
    test('should validate dependencies successfully when none required', () => {
      expect(() => baseMiddleware.validateDependencies()).not.toThrow();
    });

    test('should throw error for missing required dependencies', () => {
      jest.spyOn(baseMiddleware, 'getRequiredDependencies').mockReturnValue(['stateManager', 'missing']);

      expect(() => baseMiddleware.validateDependencies()).toThrow(
        'Missing required dependencies for BaseMiddleware: missing'
      );
    });

    test('should get dependency by name', () => {
      const dependency = baseMiddleware.getDependency('stateManager');
      expect(dependency).toBe(mockDependencies.stateManager);
    });

    test('should return undefined for non-existent dependency', () => {
      const dependency = baseMiddleware.getDependency('nonExistent');
      expect(dependency).toBeUndefined();
    });
  });

  describe('Event System', () => {
    test('should add and emit events', () => {
      const callback = jest.fn();
      const eventData = { test: 'data' };

      baseMiddleware.on('test-event', callback);
      baseMiddleware.emit('test-event', eventData);

      expect(callback).toHaveBeenCalledWith(eventData);
    });

    test('should remove event listeners', () => {
      const callback = jest.fn();

      baseMiddleware.on('test-event', callback);
      baseMiddleware.off('test-event', callback);
      baseMiddleware.emit('test-event', {});

      expect(callback).not.toHaveBeenCalled();
    });

    test('should handle multiple listeners for same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      baseMiddleware.on('test-event', callback1);
      baseMiddleware.on('test-event', callback2);
      baseMiddleware.emit('test-event', {});

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    test('should handle errors in event listeners gracefully', () => {
      const errorCallback = jest.fn(() => { throw new Error('Listener error'); });
      const goodCallback = jest.fn();

      baseMiddleware.on('test-event', errorCallback);
      baseMiddleware.on('test-event', goodCallback);

      expect(() => baseMiddleware.emit('test-event', {})).not.toThrow();
      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    test('should get configuration values', () => {
      const value = baseMiddleware.getConfig('api.timeout');
      expect(value).toBe(30000);
    });

    test('should return default value for missing config', () => {
      const value = baseMiddleware.getConfig('missing.key', 'default');
      expect(value).toBe('default');
    });

    test('should handle nested configuration paths', () => {
      const value = baseMiddleware.getConfig('api.baseUrl');
      expect(value).toBe('https://api.fliplet.test');
    });
  });

  describe('State Management', () => {
    test('should get state from StateManager', () => {
      const mockState = { test: 'state' };
      mockDependencies.stateManager.getState.mockReturnValue(mockState);

      const state = baseMiddleware.getState();

      expect(state).toBe(mockState);
      expect(mockDependencies.stateManager.getState).toHaveBeenCalled();
    });

    test('should return null when no StateManager available', () => {
      const middleware = new window.BaseMiddleware({}, mockConfig);
      const state = middleware.getState();
      expect(state).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    test('should get nested values correctly', () => {
      const obj = {
        level1: {
          level2: {
            value: 'test'
          }
        }
      };

      const value = baseMiddleware.getNestedValue(obj, 'level1.level2.value');
      expect(value).toBe('test');
    });

    test('should return default for missing nested values', () => {
      const obj = { level1: {} };
      const value = baseMiddleware.getNestedValue(obj, 'level1.missing.value', 'default');
      expect(value).toBe('default');
    });

    test('should generate unique IDs', () => {
      const id1 = baseMiddleware.generateId();
      const id2 = baseMiddleware.generateId();

      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
    });

    test('should parse JSON safely', () => {
      const validJson = '{"test": "value"}';
      const invalidJson = '{invalid json}';

      const parsed = baseMiddleware.safeJsonParse(validJson);
      const failed = baseMiddleware.safeJsonParse(invalidJson, null);

      expect(parsed).toEqual({ test: 'value' });
      expect(failed).toBeNull();
    });

    test('should stringify JSON safely', () => {
      const obj = { test: 'value' };
      const circular = {};
      circular.self = circular;

      const stringified = baseMiddleware.safeJsonStringify(obj);
      const failed = baseMiddleware.safeJsonStringify(circular, '{}');

      expect(stringified).toBe('{"test":"value"}');
      expect(failed).toBe('{}');
    });
  });

  describe('Component Info', () => {
    test('should return component information', () => {
      baseMiddleware.on('test-event', () => {});

      const info = baseMiddleware.getComponentInfo();

      expect(info).toEqual({
        name: 'BaseMiddleware',
        isInitialized: false,
        dependencies: Object.keys(mockDependencies),
        eventListeners: ['test-event']
      });
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources', () => {
      const emitSpy = jest.spyOn(baseMiddleware, 'emit');
      baseMiddleware.on('test-event', () => {});

      baseMiddleware.cleanup();

      expect(baseMiddleware.eventListeners.size).toBe(0);
      expect(baseMiddleware.isInitialized).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('cleanup', {
        component: 'BaseMiddleware'
      });
    });
  });
});