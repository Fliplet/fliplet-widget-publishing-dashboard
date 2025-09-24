/**
 * ErrorHandler - Comprehensive error management for Publishing Dashboard middleware
 *
 * Provides error categorization, user-friendly message mapping, recovery strategies,
 * and centralized error handling with logging and notification capabilities.
 *
 * @class ErrorHandler
 * @extends BaseMiddleware
 */

// Ensure BaseMiddleware is available in the Jest/jsdom environment
const ensureBaseMiddleware = () => {
  if (typeof window !== 'undefined' && window.BaseMiddleware) {
    return window.BaseMiddleware;
  }
  try {
    require('./BaseMiddleware.js');
    if (typeof window !== 'undefined' && window.BaseMiddleware) {
      return window.BaseMiddleware;
    }
  } catch (e) {}
  throw new Error('BaseMiddleware is not available');
};

const BaseMiddlewareClass = ensureBaseMiddleware();

class ErrorHandler extends BaseMiddlewareClass {
  /**
   * Creates an instance of ErrorHandler
   * @param {Object} dependencies - Injected dependencies
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Error categories and mappings
    this.errorCategories = new Map();
    this.errorMessages = new Map();
    this.recoveryStrategies = new Map();
    this.customHandlers = new Map();

    // Error history and statistics
    this.errorHistory = [];
    this.errorStats = {
      total: 0,
      byCategory: {},
      byType: {},
      byPlatform: {}
    };

    // Configuration
    this.maxHistorySize = this.getConfig('errorHandler.maxHistorySize', 100);
    this.enableErrorReporting = this.getConfig('errorHandler.enableReporting', true);
    this.autoRetryEnabled = this.getConfig('errorHandler.autoRetry', true);
    this.maxRetryAttempts = this.getConfig('errorHandler.maxRetryAttempts', 3);

    // Bind methods
    this.handleError = this.handleError.bind(this);
    this.categorizeError = this.categorizeError.bind(this);
    this.formatUserMessage = this.formatUserMessage.bind(this);
  }

  /**
   * Required dependencies for ErrorHandler
   * @returns {string[]} Array of dependency names
   */
  getRequiredDependencies() {
    return []; // ErrorHandler can work independently
  }

  /**
   * Initialize ErrorHandler - set up error categories and messages
   * @returns {Promise<void>}
   */
  async setup() {
    this.initializeErrorCategories();
    this.initializeErrorMessages();
    this.initializeRecoveryStrategies();
    this.emit('error-handler-ready', {
      categories: this.errorCategories.size,
      messages: this.errorMessages.size,
      strategies: this.recoveryStrategies.size
    });
  }

  /**
   * Initialize error categories
   */
  initializeErrorCategories() {
    // API Errors
    this.addErrorCategory('API_ERROR', {
      severity: 'high',
      retryable: true,
      userVisible: true,
      logLevel: 'error'
    });

    // Validation Errors
    this.addErrorCategory('VALIDATION_ERROR', {
      severity: 'medium',
      retryable: false,
      userVisible: true,
      logLevel: 'warn'
    });

    // Network Errors
    this.addErrorCategory('NETWORK_ERROR', {
      severity: 'high',
      retryable: true,
      userVisible: true,
      logLevel: 'error'
    });

    // Business Logic Errors
    this.addErrorCategory('BUSINESS_LOGIC_ERROR', {
      severity: 'medium',
      retryable: false,
      userVisible: true,
      logLevel: 'warn'
    });

    // Configuration Errors
    this.addErrorCategory('CONFIGURATION_ERROR', {
      severity: 'high',
      retryable: false,
      userVisible: true,
      logLevel: 'error'
    });

    // Authentication Errors
    this.addErrorCategory('AUTH_ERROR', {
      severity: 'high',
      retryable: false,
      userVisible: true,
      logLevel: 'error'
    });

    // Permission Errors
    this.addErrorCategory('PERMISSION_ERROR', {
      severity: 'medium',
      retryable: false,
      userVisible: true,
      logLevel: 'warn'
    });

    // File Operation Errors
    this.addErrorCategory('FILE_ERROR', {
      severity: 'medium',
      retryable: true,
      userVisible: true,
      logLevel: 'warn'
    });

    // System Errors
    this.addErrorCategory('SYSTEM_ERROR', {
      severity: 'critical',
      retryable: false,
      userVisible: false,
      logLevel: 'error'
    });

    // User Input Errors
    this.addErrorCategory('USER_INPUT_ERROR', {
      severity: 'low',
      retryable: false,
      userVisible: true,
      logLevel: 'info'
    });
  }

  /**
   * Initialize user-friendly error messages
   */
  initializeErrorMessages() {
    // API Error Messages
    this.addErrorMessage('MISSING_API_KEY_CONFIGURATION', {
      category: 'CONFIGURATION_ERROR',
      title: 'API Key Configuration Missing',
      message: 'API key configuration is missing. Please set up your App Store Connect API key in the settings.',
      actions: ['Configure API Key', 'Contact Support'],
      severity: 'high'
    });

    this.addErrorMessage('INVALID_CERTIFICATE', {
      category: 'CONFIGURATION_ERROR',
      title: 'Certificate Validation Failed',
      message: 'Certificate validation failed. Please check your certificate files or generate a new one.',
      actions: ['Generate New Certificate', 'Upload Certificate', 'Contact Support'],
      severity: 'high'
    });

    this.addErrorMessage('MISSING_REQUIRED_METADATA', {
      category: 'VALIDATION_ERROR',
      title: 'Required Information Missing',
      message: 'Required information is missing. Please complete all required fields before proceeding.',
      actions: ['Review Required Fields', 'Go Back'],
      severity: 'medium'
    });

    this.addErrorMessage('FAILED_STORE_CONFIG', {
      category: 'BUSINESS_LOGIC_ERROR',
      title: 'Version Validation Failed',
      message: 'New version must be higher than the current App Store version.',
      actions: ['Update Version Number', 'Check Current Version'],
      severity: 'medium'
    });

    this.addErrorMessage('INVALID_PUSH_CONFIG', {
      category: 'CONFIGURATION_ERROR',
      title: 'Push Notification Configuration Invalid',
      message: 'Push notification configuration is invalid. Please check your settings.',
      actions: ['Review Push Settings', 'Reset Configuration'],
      severity: 'medium'
    });

    this.addErrorMessage('MAX_CERTIFICATES_REACHED', {
      category: 'BUSINESS_LOGIC_ERROR',
      title: 'Certificate Limit Reached',
      message: 'Maximum certificates reached. Please revoke unused certificates in App Store Connect.',
      actions: ['Open App Store Connect', 'Contact Support'],
      severity: 'high'
    });

    this.addErrorMessage('INSUFFICIENT_PERMISSIONS', {
      category: 'PERMISSION_ERROR',
      title: 'Insufficient Permissions',
      message: 'API key lacks required permissions. Please check App Store Connect permissions.',
      actions: ['Update Permissions', 'Contact Administrator'],
      severity: 'medium'
    });

    this.addErrorMessage('INVALID_KEYSTORE', {
      category: 'FILE_ERROR',
      title: 'Invalid Keystore File',
      message: 'Invalid keystore file or incorrect password. Please check your keystore file and password.',
      actions: ['Upload New Keystore', 'Check Password', 'Contact Support'],
      severity: 'medium'
    });

    this.addErrorMessage('DOWNLOAD_ERROR', {
      category: 'NETWORK_ERROR',
      title: 'Download Failed',
      message: 'Failed to download file. Please check your connection and try again.',
      actions: ['Retry Download', 'Check Connection'],
      severity: 'medium'
    });

    this.addErrorMessage('BUILD_FAILED', {
      category: 'SYSTEM_ERROR',
      title: 'Build Process Failed',
      message: 'The build process failed. Please check your configuration and try again.',
      actions: ['Retry Build', 'Review Configuration', 'Contact Support'],
      severity: 'high'
    });

    this.addErrorMessage('NETWORK_TIMEOUT', {
      category: 'NETWORK_ERROR',
      title: 'Connection Timeout',
      message: 'The request timed out. Please check your internet connection and try again.',
      actions: ['Retry', 'Check Connection'],
      severity: 'medium'
    });

    this.addErrorMessage('SUBMISSION_ALREADY_EXISTS', {
      category: 'BUSINESS_LOGIC_ERROR',
      title: 'Submission In Progress',
      message: 'A submission for this app and platform is already in progress. Please complete the existing submission or cancel it.',
      actions: ['Continue Existing Submission', 'Cancel Current Submission'],
      severity: 'medium'
    });

    // Generic error messages
    this.addErrorMessage('GENERIC_API_ERROR', {
      category: 'API_ERROR',
      title: 'API Request Failed',
      message: 'An error occurred while communicating with the server. Please try again.',
      actions: ['Retry', 'Contact Support'],
      severity: 'medium'
    });

    this.addErrorMessage('GENERIC_VALIDATION_ERROR', {
      category: 'VALIDATION_ERROR',
      title: 'Validation Failed',
      message: 'Please check your input and try again.',
      actions: ['Review Input', 'Go Back'],
      severity: 'low'
    });

    this.addErrorMessage('GENERIC_SYSTEM_ERROR', {
      category: 'SYSTEM_ERROR',
      title: 'System Error',
      message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      actions: ['Retry', 'Contact Support'],
      severity: 'high'
    });
  }

  /**
   * Initialize recovery strategies
   */
  initializeRecoveryStrategies() {
    // Auto-retry strategy for retryable errors
    this.addRecoveryStrategy('AUTO_RETRY', {
      description: 'Automatically retry the failed operation',
      condition: (error) => error.retryable && error.retryCount < this.maxRetryAttempts,
      action: async (error, context) => {
        await this.delay(Math.pow(2, error.retryCount) * 1000); // Exponential backoff
        return { shouldRetry: true, delay: 0 };
      },
      priority: 1
    });

    // Refresh authentication strategy
    this.addRecoveryStrategy('REFRESH_AUTH', {
      description: 'Refresh authentication tokens',
      condition: (error) => error.category === 'AUTH_ERROR',
      action: async (error, context) => {
        // Refresh authentication if available
        if (context.refreshAuth && typeof context.refreshAuth === 'function') {
          await context.refreshAuth();
          return { shouldRetry: true, delay: 1000 };
        }
        return { shouldRetry: false };
      },
      priority: 2
    });

    // Fallback to cached data strategy
    this.addRecoveryStrategy('USE_CACHE', {
      description: 'Use cached data when available',
      condition: (error) => error.category === 'NETWORK_ERROR' && error.context?.cacheAvailable,
      action: async (error, context) => {
        if (context.getCachedData && typeof context.getCachedData === 'function') {
          const cachedData = context.getCachedData();
          if (cachedData) {
            this.emit('cache-fallback-used', { error: error.code, cachedData });
            return { shouldRetry: false, fallbackData: cachedData };
          }
        }
        return { shouldRetry: false };
      },
      priority: 3
    });

    // Reset state strategy for corrupted state
    this.addRecoveryStrategy('RESET_STATE', {
      description: 'Reset application state to recover from corruption',
      condition: (error) => error.category === 'SYSTEM_ERROR' && error.context?.stateCorrupted,
      action: async (error, context) => {
        if (context.resetState && typeof context.resetState === 'function') {
          await context.resetState();
          this.emit('state-reset-recovery', { error: error.code });
          return { shouldRetry: false, stateReset: true };
        }
        return { shouldRetry: false };
      },
      priority: 4
    });

    // User intervention strategy
    this.addRecoveryStrategy('USER_INTERVENTION', {
      description: 'Require user action to resolve the error',
      condition: (error) => !error.retryable || error.category === 'USER_INPUT_ERROR',
      action: async (error, context) => {
        return {
          shouldRetry: false,
          requiresUserAction: true,
          actions: error.message?.actions || ['Try Again', 'Contact Support']
        };
      },
      priority: 5
    });
  }

  /**
   * Main error handling method
   * @param {Error|Object} error - Error object or error data
   * @param {Object} context - Error context
   * @returns {Object} Error handling result
   */
  async handleError(error, context = {}) {
    try {
      // Normalize error object
      const normalizedError = this.normalizeError(error, context);

      // Categorize error
      const category = this.categorizeError(normalizedError);
      normalizedError.category = category.name;
      normalizedError.retryable = category.retryable;

      // Get user-friendly message
      const userMessage = this.formatUserMessage(normalizedError);

      // Log error
      this.logError(normalizedError, category);

      // Update statistics
      this.updateErrorStats(normalizedError);

      // Add to history
      this.addToHistory(normalizedError);

      // Attempt recovery
      const recoveryResult = await this.attemptRecovery(normalizedError, context);

      // Prepare result
      const result = {
        error: normalizedError,
        userMessage,
        category: category.name,
        recovery: recoveryResult,
        timestamp: Date.now(),
        handled: true
      };

      // Emit error event
      this.emit('error-handled', result);

      return result;

    } catch (handlingError) {
      // Error occurred while handling error
      console.error('Error in error handler:', handlingError);
      this.emit('error-handler-failed', {
        originalError: error,
        handlingError: handlingError.message
      });

      return {
        error: this.normalizeError(error, context),
        userMessage: this.getGenericErrorMessage(),
        category: 'SYSTEM_ERROR',
        recovery: { strategy: null, success: false },
        timestamp: Date.now(),
        handled: false
      };
    }
  }

  /**
   * Normalize error to consistent format
   * @param {Error|Object} error - Error to normalize
   * @param {Object} context - Error context
   * @returns {Object} Normalized error object
   */
  normalizeError(error, context) {
    const normalized = {
      id: this.generateId(),
      timestamp: Date.now(),
      context: { ...context }
    };

    if (error instanceof Error) {
      normalized.message = error.message;
      normalized.stack = error.stack;
      normalized.name = error.name;
    } else if (typeof error === 'object') {
      Object.assign(normalized, error);
    } else {
      normalized.message = String(error);
    }

    // Extract error code from message or use provided code
    normalized.code = normalized.code || this.extractErrorCode(normalized.message);

    // Set retry count
    normalized.retryCount = normalized.retryCount || 0;

    // Add platform context if available
    if (context.platform) {
      normalized.platform = context.platform;
    }

    // Add step context if available
    if (context.step) {
      normalized.step = context.step;
    }

    return normalized;
  }

  /**
   * Categorize error based on its properties
   * @param {Object} error - Normalized error object
   * @returns {Object} Error category information
   */
  categorizeError(error) {
    // Check for specific error codes first
    if (error.code) {
      const codeCategory = this.getCategoryByCode(error.code);
      if (codeCategory) {
        return codeCategory;
      }
    }

    // Check for HTTP status codes
    if (error.status) {
      const statusCategory = this.getCategoryByStatus(error.status);
      if (statusCategory) {
        return statusCategory;
      }
    }

    // Check message patterns
    const messageCategory = this.getCategoryByMessage(error.message);
    if (messageCategory) {
      return messageCategory;
    }

    // Default category
    return this.errorCategories.get('SYSTEM_ERROR') || {
      name: 'SYSTEM_ERROR',
      severity: 'high',
      retryable: false,
      userVisible: false,
      logLevel: 'error'
    };
  }

  /**
   * Get error category by error code
   * @param {string} code - Error code
   * @returns {Object|null} Category information
   */
  getCategoryByCode(code) {
    const codeMapping = {
      'MISSING_API_KEY_CONFIGURATION': 'CONFIGURATION_ERROR',
      'INVALID_CERTIFICATE': 'CONFIGURATION_ERROR',
      'MISSING_REQUIRED_METADATA': 'VALIDATION_ERROR',
      'FAILED_STORE_CONFIG': 'BUSINESS_LOGIC_ERROR',
      'INVALID_PUSH_CONFIG': 'CONFIGURATION_ERROR',
      'MAX_CERTIFICATES_REACHED': 'BUSINESS_LOGIC_ERROR',
      'INSUFFICIENT_PERMISSIONS': 'PERMISSION_ERROR',
      'INVALID_KEYSTORE': 'FILE_ERROR',
      'DOWNLOAD_ERROR': 'NETWORK_ERROR',
      'BUILD_FAILED': 'SYSTEM_ERROR',
      'NETWORK_TIMEOUT': 'NETWORK_ERROR',
      'SUBMISSION_ALREADY_EXISTS': 'BUSINESS_LOGIC_ERROR'
    };

    const categoryName = codeMapping[code];
    return categoryName ? this.errorCategories.get(categoryName) : null;
  }

  /**
   * Get error category by HTTP status code
   * @param {number} status - HTTP status code
   * @returns {Object|null} Category information
   */
  getCategoryByStatus(status) {
    if (status >= 400 && status < 500) {
      if (status === 401 || status === 403) {
        return this.errorCategories.get('AUTH_ERROR');
      } else if (status === 422) {
        return this.errorCategories.get('VALIDATION_ERROR');
      } else {
        return this.errorCategories.get('API_ERROR');
      }
    } else if (status >= 500) {
      return this.errorCategories.get('API_ERROR');
    } else if (status === 0 || !status) {
      return this.errorCategories.get('NETWORK_ERROR');
    }

    return null;
  }

  /**
   * Get error category by message content
   * @param {string} message - Error message
   * @returns {Object|null} Category information
   */
  getCategoryByMessage(message) {
    if (!message) return null;

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('connection') ||
        lowerMessage.includes('timeout') || lowerMessage.includes('fetch')) {
      return this.errorCategories.get('NETWORK_ERROR');
    }

    if (lowerMessage.includes('validation') || lowerMessage.includes('required') ||
        lowerMessage.includes('invalid')) {
      return this.errorCategories.get('VALIDATION_ERROR');
    }

    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('forbidden')) {
      return this.errorCategories.get('PERMISSION_ERROR');
    }

    if (lowerMessage.includes('file') || lowerMessage.includes('upload') ||
        lowerMessage.includes('download')) {
      return this.errorCategories.get('FILE_ERROR');
    }

    return null;
  }

  /**
   * Extract error code from error message
   * @param {string} message - Error message
   * @returns {string} Extracted error code or generic code
   */
  extractErrorCode(message) {
    if (!message) return 'UNKNOWN_ERROR';

    // Look for existing error codes in message
    const codeMatch = message.match(/([A-Z_]+_ERROR|[A-Z_]+_CONFIGURATION|[A-Z_]+_CONFIG)/);
    if (codeMatch) {
      return codeMatch[1];
    }

    // Generate code based on message content
    if (message.toLowerCase().includes('network')) return 'NETWORK_ERROR';
    if (message.toLowerCase().includes('validation')) return 'VALIDATION_ERROR';
    if (message.toLowerCase().includes('permission')) return 'PERMISSION_ERROR';
    if (message.toLowerCase().includes('file')) return 'FILE_ERROR';

    return 'GENERIC_ERROR';
  }

  /**
   * Format user-friendly error message
   * @param {Object} error - Normalized error object
   * @returns {Object} Formatted user message
   */
  formatUserMessage(error) {
    const messageConfig = this.errorMessages.get(error.code);

    if (messageConfig) {
      return {
        title: messageConfig.title,
        message: messageConfig.message,
        actions: messageConfig.actions || [],
        severity: messageConfig.severity || 'medium',
        type: 'specific'
      };
    }

    // Use category-based generic message
    const category = this.errorCategories.get(error.category);
    if (category) {
      return this.getGenericMessageForCategory(error.category, error);
    }

    return this.getGenericErrorMessage();
  }

  /**
   * Get generic error message for category
   * @param {string} categoryName - Category name
   * @param {Object} error - Error object
   * @returns {Object} Generic message for category
   */
  getGenericMessageForCategory(categoryName, error) {
    const genericMessages = {
      'API_ERROR': {
        title: 'API Request Failed',
        message: 'An error occurred while communicating with the server. Please try again.',
        actions: ['Retry', 'Contact Support'],
        severity: 'medium'
      },
      'VALIDATION_ERROR': {
        title: 'Validation Failed',
        message: 'Please check your input and try again.',
        actions: ['Review Input', 'Go Back'],
        severity: 'low'
      },
      'NETWORK_ERROR': {
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        actions: ['Retry', 'Check Connection'],
        severity: 'medium'
      },
      'CONFIGURATION_ERROR': {
        title: 'Configuration Error',
        message: 'There is an issue with the configuration. Please review your settings.',
        actions: ['Review Settings', 'Contact Support'],
        severity: 'high'
      },
      'PERMISSION_ERROR': {
        title: 'Permission Denied',
        message: 'You do not have permission to perform this action.',
        actions: ['Contact Administrator', 'Review Permissions'],
        severity: 'medium'
      }
    };

    return {
      ...genericMessages[categoryName] || genericMessages['API_ERROR'],
      type: 'generic'
    };
  }

  /**
   * Get fallback generic error message
   * @returns {Object} Generic error message
   */
  getGenericErrorMessage() {
    return {
      title: 'Error Occurred',
      message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      actions: ['Retry', 'Contact Support'],
      severity: 'medium',
      type: 'fallback'
    };
  }

  /**
   * Attempt error recovery
   * @param {Object} error - Normalized error object
   * @param {Object} context - Error context
   * @returns {Object} Recovery result
   */
  async attemptRecovery(error, context) {
    const applicableStrategies = this.getApplicableRecoveryStrategies(error);

    for (const strategy of applicableStrategies) {
      try {
        const result = await strategy.action(error, context);

        if (result.shouldRetry) {
          error.retryCount++;
          this.emit('error-recovery-attempted', {
            error: error.code,
            strategy: strategy.description,
            retryCount: error.retryCount
          });

          return {
            strategy: strategy.description,
            success: true,
            action: 'retry',
            delay: result.delay || 0
          };
        } else if (result.fallbackData) {
          return {
            strategy: strategy.description,
            success: true,
            action: 'fallback',
            data: result.fallbackData
          };
        } else if (result.stateReset) {
          return {
            strategy: strategy.description,
            success: true,
            action: 'reset'
          };
        } else if (result.requiresUserAction) {
          return {
            strategy: strategy.description,
            success: false,
            action: 'user_intervention',
            actions: result.actions
          };
        }
      } catch (recoveryError) {
        console.warn(`Recovery strategy '${strategy.description}' failed:`, recoveryError);
        continue;
      }
    }

    return {
      strategy: null,
      success: false,
      action: 'none'
    };
  }

  /**
   * Get applicable recovery strategies for error
   * @param {Object} error - Error object
   * @returns {Array} Applicable strategies sorted by priority
   */
  getApplicableRecoveryStrategies(error) {
    const applicable = [];

    for (const [name, strategy] of this.recoveryStrategies) {
      if (strategy.condition(error)) {
        applicable.push(strategy);
      }
    }

    return applicable.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Log error with appropriate level
   * @param {Object} error - Error object
   * @param {Object} category - Error category
   */
  logError(error, category) {
    const logData = {
      id: error.id,
      code: error.code,
      message: error.message,
      category: category.name,
      severity: category.severity,
      platform: error.platform,
      step: error.step,
      timestamp: error.timestamp
    };

    switch (category.logLevel) {
      case 'error':
        console.error('ErrorHandler:', logData);
        break;
      case 'warn':
        console.warn('ErrorHandler:', logData);
        break;
      case 'info':
        console.info('ErrorHandler:', logData);
        break;
      default:
        console.log('ErrorHandler:', logData);
    }

    this.emit('error-logged', logData);
  }

  /**
   * Update error statistics
   * @param {Object} error - Error object
   */
  updateErrorStats(error) {
    this.errorStats.total++;

    // By category
    if (!this.errorStats.byCategory[error.category]) {
      this.errorStats.byCategory[error.category] = 0;
    }
    this.errorStats.byCategory[error.category]++;

    // By type (error code)
    if (!this.errorStats.byType[error.code]) {
      this.errorStats.byType[error.code] = 0;
    }
    this.errorStats.byType[error.code]++;

    // By platform
    if (error.platform) {
      if (!this.errorStats.byPlatform[error.platform]) {
        this.errorStats.byPlatform[error.platform] = 0;
      }
      this.errorStats.byPlatform[error.platform]++;
    }
  }

  /**
   * Add error to history
   * @param {Object} error - Error object
   */
  addToHistory(error) {
    this.errorHistory.push({
      id: error.id,
      code: error.code,
      category: error.category,
      platform: error.platform,
      step: error.step,
      timestamp: error.timestamp,
      retryCount: error.retryCount
    });

    // Maintain history size limit
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Add error category
   * @param {string} name - Category name
   * @param {Object} config - Category configuration
   */
  addErrorCategory(name, config) {
    this.errorCategories.set(name, { name, ...config });
  }

  /**
   * Add error message
   * @param {string} code - Error code
   * @param {Object} config - Message configuration
   */
  addErrorMessage(code, config) {
    this.errorMessages.set(code, config);
  }

  /**
   * Add recovery strategy
   * @param {string} name - Strategy name
   * @param {Object} config - Strategy configuration
   */
  addRecoveryStrategy(name, config) {
    this.recoveryStrategies.set(name, config);
  }

  /**
   * Add custom error handler
   * @param {string} code - Error code to handle
   * @param {Function} handler - Custom handler function
   */
  addCustomHandler(code, handler) {
    this.customHandlers.set(code, handler);
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    return { ...this.errorStats };
  }

  /**
   * Get error history
   * @param {number} [limit] - Maximum number of entries to return
   * @returns {Array} Error history
   */
  getErrorHistory(limit = null) {
    if (limit) {
      return this.errorHistory.slice(-limit);
    }
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = [];
    this.emit('error-history-cleared', { timestamp: Date.now() });
  }

  /**
   * Reset error statistics
   */
  resetErrorStats() {
    this.errorStats = {
      total: 0,
      byCategory: {},
      byType: {},
      byPlatform: {}
    };
    this.emit('error-stats-reset', { timestamp: Date.now() });
  }

  /**
   * Delay utility for retry strategies
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error handler information for debugging
   * @returns {Object} Handler information
   */
  getErrorHandlerInfo() {
    return {
      categories: Array.from(this.errorCategories.keys()),
      messages: Array.from(this.errorMessages.keys()),
      strategies: Array.from(this.recoveryStrategies.keys()),
      customHandlers: Array.from(this.customHandlers.keys()),
      stats: this.errorStats,
      historySize: this.errorHistory.length
    };
  }

  /**
   * Cleanup method - clear history and statistics
   */
  cleanup() {
    this.errorHistory = [];
    this.resetErrorStats();
    this.errorCategories.clear();
    this.errorMessages.clear();
    this.recoveryStrategies.clear();
    this.customHandlers.clear();
    super.cleanup();
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
