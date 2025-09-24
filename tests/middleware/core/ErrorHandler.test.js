/**
 * ErrorHandler Tests
 */

// Import the ErrorHandler class
require('../../../src/middleware/core/ErrorHandler.js');

describe('ErrorHandler', () => {
  let errorHandler;
  let mockDependencies;
  let mockConfig;

  beforeEach(() => {
    mockDependencies = createMockDependencies();
    mockConfig = createMockConfig();
    errorHandler = new window.ErrorHandler(mockDependencies, mockConfig);
  });

  afterEach(() => {
    if (errorHandler) {
      errorHandler.cleanup();
    }
  });

  describe('Constructor', () => {
    test('should initialize with dependencies and config', () => {
      expect(errorHandler.dependencies).toBe(mockDependencies);
      expect(errorHandler.config).toBe(mockConfig);
      expect(errorHandler.errorCategories).toBeInstanceOf(Map);
      expect(errorHandler.errorMessages).toBeInstanceOf(Map);
      expect(errorHandler.recoveryStrategies).toBeInstanceOf(Map);
      expect(errorHandler.customHandlers).toBeInstanceOf(Map);
      expect(errorHandler.errorHistory).toBeInstanceOf(Array);
      expect(errorHandler.errorStats).toBeDefined();
    });

    test('should set configuration values from config', () => {
      const customConfig = {
        ...mockConfig,
        errorHandler: {
          maxHistorySize: 50,
          enableReporting: false,
          autoRetry: false,
          maxRetryAttempts: 5
        }
      };
      const handler = new window.ErrorHandler(mockDependencies, customConfig);

      expect(handler.maxHistorySize).toBe(50);
      expect(handler.enableErrorReporting).toBe(false);
      expect(handler.autoRetryEnabled).toBe(false);
      expect(handler.maxRetryAttempts).toBe(5);
    });
  });

  describe('Initialization', () => {
    test('should initialize and setup error handling', async () => {
      const emitSpy = jest.spyOn(errorHandler, 'emit');

      await errorHandler.initialize();

      expect(errorHandler.isInitialized).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith('error-handler-ready',
        expect.objectContaining({
          categories: expect.any(Number),
          messages: expect.any(Number),
          strategies: expect.any(Number)
        })
      );
    });

    test('should load error categories during setup', async () => {
      await errorHandler.initialize();

      expect(errorHandler.errorCategories.has('API_ERROR')).toBe(true);
      expect(errorHandler.errorCategories.has('VALIDATION_ERROR')).toBe(true);
      expect(errorHandler.errorCategories.has('NETWORK_ERROR')).toBe(true);
      expect(errorHandler.errorCategories.has('AUTH_ERROR')).toBe(true);
    });

    test('should load error messages during setup', async () => {
      await errorHandler.initialize();

      expect(errorHandler.errorMessages.has('MISSING_API_KEY_CONFIGURATION')).toBe(true);
      expect(errorHandler.errorMessages.has('INVALID_CERTIFICATE')).toBe(true);
      expect(errorHandler.errorMessages.has('BUILD_FAILED')).toBe(true);
    });

    test('should load recovery strategies during setup', async () => {
      await errorHandler.initialize();

      expect(errorHandler.recoveryStrategies.has('AUTO_RETRY')).toBe(true);
      expect(errorHandler.recoveryStrategies.has('REFRESH_AUTH')).toBe(true);
      expect(errorHandler.recoveryStrategies.has('USE_CACHE')).toBe(true);
    });
  });

  describe('Error Normalization', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should normalize Error objects', () => {
      const error = new Error('Test error message');
      error.stack = 'Error stack trace';
      const context = { platform: 'ios', step: 'build' };

      const normalized = errorHandler.normalizeError(error, context);

      expect(normalized.message).toBe('Test error message');
      expect(normalized.stack).toBe('Error stack trace');
      expect(normalized.name).toBe('Error');
      expect(normalized.platform).toBe('ios');
      expect(normalized.step).toBe('build');
      expect(normalized.id).toBeDefined();
      expect(normalized.timestamp).toBeDefined();
      expect(normalized.retryCount).toBe(0);
    });

    test('should normalize error objects', () => {
      const error = {
        code: 'API_ERROR',
        message: 'API request failed',
        status: 500
      };
      const context = { platform: 'android' };

      const normalized = errorHandler.normalizeError(error, context);

      expect(normalized.code).toBe('API_ERROR');
      expect(normalized.message).toBe('API request failed');
      expect(normalized.status).toBe(500);
      expect(normalized.platform).toBe('android');
    });

    test('should normalize string errors', () => {
      const error = 'Simple error string';
      const context = {};

      const normalized = errorHandler.normalizeError(error, context);

      expect(normalized.message).toBe('Simple error string');
      expect(normalized.code).toBeDefined();
    });

    test('should extract error codes from messages', () => {
      const error = 'NETWORK_ERROR: Connection failed';

      const normalized = errorHandler.normalizeError(error, {});
      expect(normalized.code).toBe('NETWORK_ERROR');
    });
  });

  describe('Error Categorization', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should categorize by error code', () => {
      const error = { code: 'MISSING_API_KEY_CONFIGURATION' };

      const category = errorHandler.categorizeError(error);
      expect(category.name).toBe('CONFIGURATION_ERROR');
    });

    test('should categorize by HTTP status', () => {
      const error401 = { status: 401 };
      const error422 = { status: 422 };
      const error500 = { status: 500 };

      expect(errorHandler.categorizeError(error401).name).toBe('AUTH_ERROR');
      expect(errorHandler.categorizeError(error422).name).toBe('VALIDATION_ERROR');
      expect(errorHandler.categorizeError(error500).name).toBe('API_ERROR');
    });

    test('should categorize by message content', () => {
      const networkError = { message: 'Network connection failed' };
      const validationError = { message: 'Validation failed for field' };
      const permissionError = { message: 'Permission denied for action' };

      expect(errorHandler.categorizeError(networkError).name).toBe('NETWORK_ERROR');
      expect(errorHandler.categorizeError(validationError).name).toBe('VALIDATION_ERROR');
      expect(errorHandler.categorizeError(permissionError).name).toBe('PERMISSION_ERROR');
    });

    test('should use default category for unknown errors', () => {
      const unknownError = { message: 'Unknown error type' };

      const category = errorHandler.categorizeError(unknownError);
      expect(category.name).toBe('SYSTEM_ERROR');
    });
  });

  describe('Error Message Formatting', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should format specific error messages', () => {
      const error = { code: 'MISSING_API_KEY_CONFIGURATION' };

      const userMessage = errorHandler.formatUserMessage(error);
      expect(userMessage.title).toBe('API Key Configuration Missing');
      expect(userMessage.message).toContain('API key configuration is missing');
      expect(userMessage.actions).toContain('Configure API Key');
      expect(userMessage.type).toBe('specific');
    });

    test('should format generic messages by category', () => {
      const error = { category: 'NETWORK_ERROR', code: 'UNKNOWN_NETWORK_ERROR' };

      const userMessage = errorHandler.formatUserMessage(error);
      expect(userMessage.title).toBe('Connection Error');
      expect(userMessage.message).toContain('check your internet connection');
      expect(userMessage.type).toBe('generic');
    });

    test('should provide fallback error message', () => {
      const error = { category: 'UNKNOWN_CATEGORY', code: 'UNKNOWN_CODE' };

      const userMessage = errorHandler.formatUserMessage(error);
      expect(userMessage.title).toBe('Error Occurred');
      expect(userMessage.message).toContain('unexpected error occurred');
      expect(userMessage.type).toBe('fallback');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should handle error completely', async () => {
      const error = new Error('Test error');
      const context = { platform: 'ios', step: 'build' };
      const emitSpy = jest.spyOn(errorHandler, 'emit');

      const result = await errorHandler.handleError(error, context);

      expect(result.handled).toBe(true);
      expect(result.error).toBeDefined();
      expect(result.userMessage).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.recovery).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(emitSpy).toHaveBeenCalledWith('error-handled', result);
    });

    test('should update error statistics', async () => {
      const error = { code: 'TEST_ERROR' }; // Let categorization assign category
      const context = { platform: 'ios' };

      await errorHandler.handleError(error, context);

      expect(errorHandler.errorStats.total).toBeGreaterThan(0);
      expect(errorHandler.errorStats.byType['TEST_ERROR']).toBeGreaterThan(0);
      expect(errorHandler.errorStats.byPlatform['ios']).toBeGreaterThan(0);
      // Check that some category was assigned
      expect(Object.keys(errorHandler.errorStats.byCategory).length).toBeGreaterThan(0);
    });

    test('should add error to history', async () => {
      const error = new Error('Test error');
      const context = { platform: 'android' };

      const initialHistorySize = errorHandler.errorHistory.length;
      await errorHandler.handleError(error, context);

      expect(errorHandler.errorHistory.length).toBe(initialHistorySize + 1);
      const latestError = errorHandler.errorHistory[errorHandler.errorHistory.length - 1];
      expect(latestError.platform).toBe('android');
    });

    test('should handle error handling failures gracefully', async () => {
      const error = new Error('Test error');
      const emitSpy = jest.spyOn(errorHandler, 'emit');

      // Force an error in categorization
      jest.spyOn(errorHandler, 'categorizeError').mockImplementation(() => {
        throw new Error('Categorization failed');
      });

      const result = await errorHandler.handleError(error, {});

      expect(result.handled).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('error-handler-failed',
        expect.objectContaining({
          originalError: error,
          handlingError: 'Categorization failed'
        })
      );
    });
  });

  describe('Recovery Strategies', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should attempt auto retry for retryable errors', async () => {
      const error = {
        code: 'NETWORK_ERROR',
        category: 'NETWORK_ERROR',
        retryable: true,
        retryCount: 0
      };
      const context = {};

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.strategy).toBe('Automatically retry the failed operation');
      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
      expect(error.retryCount).toBe(1);
    });

    test('should not retry when max attempts exceeded', async () => {
      const error = {
        code: 'NETWORK_ERROR',
        category: 'NETWORK_ERROR',
        retryable: true,
        retryCount: 3 // Equals maxRetryAttempts
      };
      const context = {};

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.success).toBe(false);
      expect(result.action).toBe('none');
    });

    test('should attempt auth refresh for auth errors', async () => {
      const error = { category: 'AUTH_ERROR', retryCount: 0 };
      const context = {
        refreshAuth: jest.fn().mockResolvedValue(true)
      };

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.strategy).toBe('Refresh authentication tokens');
      expect(result.success).toBe(true);
      expect(result.action).toBe('retry');
      expect(context.refreshAuth).toHaveBeenCalled();
    });

    test('should use cached data for network errors when available', async () => {
      const error = {
        category: 'NETWORK_ERROR',
        retryCount: 0,
        context: { cacheAvailable: true }
      };
      const cachedData = { data: 'cached response' };
      const context = {
        getCachedData: jest.fn().mockReturnValue(cachedData)
      };

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.strategy).toBe('Use cached data when available');
      expect(result.success).toBe(true);
      expect(result.action).toBe('fallback');
      expect(result.data).toBe(cachedData);
    });

    test('should reset state for system errors', async () => {
      const error = {
        category: 'SYSTEM_ERROR',
        retryCount: 0,
        context: { stateCorrupted: true }
      };
      const context = {
        resetState: jest.fn().mockResolvedValue(true)
      };

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.strategy).toBe('Reset application state to recover from corruption');
      expect(result.success).toBe(true);
      expect(result.action).toBe('reset');
      expect(context.resetState).toHaveBeenCalled();
    });

    test('should require user intervention for non-retryable errors', async () => {
      const error = {
        category: 'USER_INPUT_ERROR',
        retryable: false,
        retryCount: 0,
        message: { actions: ['Fix Input', 'Try Again'] }
      };
      const context = {};

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.strategy).toBe('Require user action to resolve the error');
      expect(result.success).toBe(false);
      expect(result.action).toBe('user_intervention');
      expect(result.actions).toEqual(['Fix Input', 'Try Again']);
    });

    test('should handle recovery strategy failures', async () => {
      const error = { category: 'AUTH_ERROR', retryCount: 0 };
      const context = {
        refreshAuth: jest.fn().mockRejectedValue(new Error('Auth refresh failed'))
      };
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await errorHandler.attemptRecovery(error, context);

      expect(result.success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Recovery strategy \'Refresh authentication tokens\' failed'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Statistics', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should track error statistics', async () => {
      await errorHandler.handleError({ code: 'ERROR1' }, { platform: 'ios' });
      await errorHandler.handleError({ code: 'ERROR2' }, { platform: 'android' });
      await errorHandler.handleError({ code: 'ERROR1' }, { platform: 'ios' });

      const stats = errorHandler.getErrorStats();
      expect(stats.total).toBe(3);
      expect(stats.byType['ERROR1']).toBe(2);
      expect(stats.byType['ERROR2']).toBe(1);
      expect(stats.byPlatform['ios']).toBe(2);
      expect(stats.byPlatform['android']).toBe(1);
    });

    test('should reset error statistics', () => {
      errorHandler.errorStats.total = 5;
      errorHandler.errorStats.byCategory['TEST'] = 3;

      errorHandler.resetErrorStats();

      expect(errorHandler.errorStats.total).toBe(0);
      expect(errorHandler.errorStats.byCategory).toEqual({});
      expect(errorHandler.errorStats.byType).toEqual({});
      expect(errorHandler.errorStats.byPlatform).toEqual({});
    });
  });

  describe('Error History', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should maintain error history', async () => {
      const error1 = { code: 'ERROR1' };
      const error2 = { code: 'ERROR2' };

      await errorHandler.handleError(error1, {});
      await errorHandler.handleError(error2, {});

      const history = errorHandler.getErrorHistory();
      expect(history.length).toBe(2);
      expect(history[1].code).toBe('ERROR2');
    });

    test('should limit history size', async () => {
      // Set small history limit
      errorHandler.maxHistorySize = 2;

      await errorHandler.handleError({ code: 'ERROR1' }, {});
      await errorHandler.handleError({ code: 'ERROR2' }, {});
      await errorHandler.handleError({ code: 'ERROR3' }, {});

      const history = errorHandler.getErrorHistory();
      expect(history.length).toBe(2);
      expect(history[0].code).toBe('ERROR2'); // First error should be removed
      expect(history[1].code).toBe('ERROR3');
    });

    test('should get limited history', async () => {
      await errorHandler.handleError({ code: 'ERROR1' }, {});
      await errorHandler.handleError({ code: 'ERROR2' }, {});
      await errorHandler.handleError({ code: 'ERROR3' }, {});

      const limitedHistory = errorHandler.getErrorHistory(2);
      expect(limitedHistory.length).toBe(2);
      expect(limitedHistory[0].code).toBe('ERROR2');
      expect(limitedHistory[1].code).toBe('ERROR3');
    });

    test('should clear error history', () => {
      errorHandler.errorHistory = [{ id: '1' }, { id: '2' }];
      const emitSpy = jest.spyOn(errorHandler, 'emit');

      errorHandler.clearErrorHistory();

      expect(errorHandler.errorHistory.length).toBe(0);
      expect(emitSpy).toHaveBeenCalledWith('error-history-cleared',
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
    });
  });

  describe('Custom Error Handling', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should add custom error categories', () => {
      errorHandler.addErrorCategory('CUSTOM_ERROR', {
        severity: 'low',
        retryable: false,
        userVisible: true,
        logLevel: 'info'
      });

      expect(errorHandler.errorCategories.has('CUSTOM_ERROR')).toBe(true);
      const category = errorHandler.errorCategories.get('CUSTOM_ERROR');
      expect(category.severity).toBe('low');
    });

    test('should add custom error messages', () => {
      errorHandler.addErrorMessage('CUSTOM_CODE', {
        category: 'CUSTOM_ERROR',
        title: 'Custom Error',
        message: 'This is a custom error message',
        actions: ['Custom Action'],
        severity: 'low'
      });

      expect(errorHandler.errorMessages.has('CUSTOM_CODE')).toBe(true);
      const message = errorHandler.errorMessages.get('CUSTOM_CODE');
      expect(message.title).toBe('Custom Error');
    });

    test('should add custom recovery strategies', () => {
      const customStrategy = {
        description: 'Custom recovery strategy',
        condition: () => true,
        action: async () => ({ shouldRetry: false }),
        priority: 10
      };

      errorHandler.addRecoveryStrategy('CUSTOM_STRATEGY', customStrategy);

      expect(errorHandler.recoveryStrategies.has('CUSTOM_STRATEGY')).toBe(true);
    });

    test('should add custom error handlers', () => {
      const customHandler = jest.fn();
      errorHandler.addCustomHandler('CUSTOM_ERROR_CODE', customHandler);

      expect(errorHandler.customHandlers.has('CUSTOM_ERROR_CODE')).toBe(true);
      expect(errorHandler.customHandlers.get('CUSTOM_ERROR_CODE')).toBe(customHandler);
    });
  });

  describe('Error Logging', () => {
    beforeEach(async () => {
      await errorHandler.initialize();
    });

    test('should log errors with appropriate levels', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      const errorError = { id: '1', code: 'ERROR1', message: 'Error message' };
      const warnError = { id: '2', code: 'ERROR2', message: 'Warning message' };
      const infoError = { id: '3', code: 'ERROR3', message: 'Info message' };

      const errorCategory = { name: 'ERROR', severity: 'high', logLevel: 'error' };
      const warnCategory = { name: 'WARN', severity: 'medium', logLevel: 'warn' };
      const infoCategory = { name: 'INFO', severity: 'low', logLevel: 'info' };

      errorHandler.logError(errorError, errorCategory);
      errorHandler.logError(warnError, warnCategory);
      errorHandler.logError(infoError, infoCategory);

      expect(consoleErrorSpy).toHaveBeenCalledWith('ErrorHandler:', expect.objectContaining({
        id: '1',
        code: 'ERROR1'
      }));
      expect(consoleWarnSpy).toHaveBeenCalledWith('ErrorHandler:', expect.objectContaining({
        id: '2',
        code: 'ERROR2'
      }));
      expect(consoleInfoSpy).toHaveBeenCalledWith('ErrorHandler:', expect.objectContaining({
        id: '3',
        code: 'ERROR3'
      }));

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });
  });

  describe('Utility Methods', () => {
    test('should get error handler information', async () => {
      await errorHandler.initialize();

      const info = errorHandler.getErrorHandlerInfo();
      expect(info.categories).toBeInstanceOf(Array);
      expect(info.messages).toBeInstanceOf(Array);
      expect(info.strategies).toBeInstanceOf(Array);
      expect(info.customHandlers).toBeInstanceOf(Array);
      expect(info.stats).toBeDefined();
      expect(info.historySize).toBe(0);
    });

    test('should provide delay utility', async () => {
      const start = Date.now();
      await errorHandler.delay(10);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources', async () => {
      await errorHandler.initialize();

      errorHandler.errorHistory = [{ id: '1' }, { id: '2' }];
      errorHandler.errorStats.total = 5;
      errorHandler.addErrorCategory('TEST', {});
      errorHandler.addErrorMessage('TEST', {});

      expect(errorHandler.errorHistory.length).toBe(2);
      expect(errorHandler.errorCategories.size).toBeGreaterThan(0);

      errorHandler.cleanup();

      expect(errorHandler.errorHistory.length).toBe(0);
      expect(errorHandler.errorStats.total).toBe(0);
      expect(errorHandler.errorCategories.size).toBe(0);
      expect(errorHandler.errorMessages.size).toBe(0);
      expect(errorHandler.recoveryStrategies.size).toBe(0);
      expect(errorHandler.customHandlers.size).toBe(0);
    });
  });
});
