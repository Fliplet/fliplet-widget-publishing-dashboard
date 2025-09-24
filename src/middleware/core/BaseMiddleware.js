/**
 * BaseMiddleware - Foundation class for the Publishing Dashboard middleware system
 *
 * Provides core functionality including dependency injection, event handling,
 * and common utilities for all middleware components.
 *
 * @class BaseMiddleware
 */
class BaseMiddleware {
  /**
   * Creates an instance of BaseMiddleware
   * @param {Object} dependencies - Injected dependencies
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    this.dependencies = dependencies;
    this.config = config;
    this.eventListeners = new Map();
    this.isInitialized = false;

    // Bind methods to preserve context
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
  }

  /**
   * Initialize the middleware component
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.validateDependencies();
      await this.setup();
      this.isInitialized = true;
      this.emit('initialized', { component: this.constructor.name });
    } catch (error) {
      this.emit('error', {
        component: this.constructor.name,
        error: error.message,
        phase: 'initialization'
      });
      throw error;
    }
  }

  /**
   * Setup method to be overridden by subclasses
   * @returns {Promise<void>}
   */
  async setup() {
    // Override in subclasses
  }

  /**
   * Validate required dependencies
   * @throws {Error} If required dependencies are missing
   */
  validateDependencies() {
    const requiredDependencies = this.getRequiredDependencies();
    const missing = requiredDependencies.filter(dep => !this.dependencies[dep]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required dependencies for ${this.constructor.name}: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Get list of required dependencies - to be overridden by subclasses
   * @returns {string[]} Array of required dependency names
   */
  getRequiredDependencies() {
    return [];
  }

  /**
   * Get current state from StateManager if available
   * @returns {Object|null} Current state or null if no StateManager
   */
  getState() {
    const stateManager = this.dependencies.stateManager;
    return stateManager ? stateManager.getState() : null;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback function to remove
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event);
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Get dependency by name
   * @param {string} name - Dependency name
   * @returns {*} Dependency instance or undefined
   */
  getDependency(name) {
    return this.dependencies[name];
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  getConfig(key, defaultValue = undefined) {
    return this.getNestedValue(this.config, key, defaultValue);
  }

  /**
   * Utility method to get nested object value using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path (e.g., 'api.timeout')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Found value or default
   */
  getNestedValue(obj, path, defaultValue = undefined) {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }

    return result;
  }

  /**
   * Generate unique ID for tracking purposes
   * @returns {string} Unique identifier
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Safe JSON parsing with error handling
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed object or default value
   */
  safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to parse JSON:', error.message);
      return defaultValue;
    }
  }

  /**
   * Safe JSON stringification with error handling
   * @param {*} obj - Object to stringify
   * @param {string} defaultValue - Default value if stringification fails
   * @returns {string} JSON string or default value
   */
  safeJsonStringify(obj, defaultValue = '{}') {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.warn('Failed to stringify object:', error.message);
      return defaultValue;
    }
  }

  /**
   * Cleanup method - removes event listeners and clears references
   */
  cleanup() {
    this.eventListeners.clear();
    this.isInitialized = false;
    this.emit('cleanup', { component: this.constructor.name });
  }

  /**
   * Get component info for debugging
   * @returns {Object} Component information
   */
  getComponentInfo() {
    return {
      name: this.constructor.name,
      isInitialized: this.isInitialized,
      dependencies: Object.keys(this.dependencies),
      eventListeners: Array.from(this.eventListeners.keys())
    };
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.BaseMiddleware = BaseMiddleware;
}