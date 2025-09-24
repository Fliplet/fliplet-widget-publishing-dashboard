/**
 * ApiClient - Wrapper for Fliplet.API.request() with authentication, retry logic, and custom apiUrl/auth_token support
 *
 * Features:
 * - Authentication token management
 * - Custom API URL support
 * - Retry logic with exponential backoff
 * - Request timeout handling
 * - Error categorization and handling
 * - Request statistics tracking
 * - State management integration
 */

// Ensure BaseMiddleware is available for inheritance
const ensureBaseMiddleware = () => {
  if (typeof window !== 'undefined' && window.BaseMiddleware) {
    return window.BaseMiddleware;
  }
  try {
    require('../core/BaseMiddleware.js');
    if (typeof window !== 'undefined' && window.BaseMiddleware) {
      return window.BaseMiddleware;
    }
  } catch (e) {}
  throw new Error('BaseMiddleware is not available');
};

const BaseMiddlewareClass = ensureBaseMiddleware();

class ApiClient extends BaseMiddlewareClass {
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validate required dependencies
    if (!dependencies.errorHandler) {
      throw new Error('ApiClient requires errorHandler dependency');
    }
    if (!dependencies.stateManager) {
      throw new Error('ApiClient requires stateManager dependency');
    }

    // Store dependencies
    this.errorHandler = dependencies.errorHandler;
    this.stateManager = dependencies.stateManager;

    // Default configuration
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    // Authentication and API URL - check Fliplet.Navigate.query for overrides
    this.authToken = null;
    this.apiUrl = null; // Will be set only if custom apiUrl is provided

    // Check for custom API URL and auth token from Fliplet.Navigate.query
    if (typeof Fliplet !== 'undefined' && Fliplet.Navigate && Fliplet.Navigate.query) {
      if (Fliplet.Navigate.query.apiUrl) {
        this.apiUrl = Fliplet.Navigate.query.apiUrl;
      }
      if (Fliplet.Navigate.query.auth_token) {
        this.authToken = Fliplet.Navigate.query.auth_token;
      }
    }

    // Request statistics
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retryCount: 0
    };

    // Bind methods
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.request = this.request.bind(this);
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   * @returns {string|null} Current authentication token
   */
  getAuthToken() {
    return this.authToken;
  }

  /**
   * Set custom API URL
   * @param {string} url - Custom API URL
   */
  setApiUrl(url) {
    this.apiUrl = url;
  }

  /**
   * Get current API URL
   * @returns {string} Current API URL
   */
  getApiUrl() {
    return this.apiUrl;
  }

  /**
   * Check if client is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!this.authToken;
  }

  /**
   * Build request URL with query parameters
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {string} Complete request URL
   */
  buildRequestUrl(endpoint, params = {}) {
    // If no custom apiUrl, return endpoint without leading slash - Fliplet.API.request() adds base URL with trailing slash
    if (!this.apiUrl) {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      let url = cleanEndpoint;

      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
      }

      return url;
    }

    // Custom apiUrl provided - build full URL
    const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    let url = `${baseUrl}${cleanEndpoint}`;

    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Build request headers
   * @param {Object} customHeaders - Additional custom headers
   * @returns {Object} Request headers
   */
  buildRequestHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    if (this.authToken) {
      headers['Auth-token'] = this.authToken;
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} params - Query parameters
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Request result
   */
  async request(method, endpoint, data = null, params = {}, customHeaders = {}) {
    const url = this.buildRequestUrl(endpoint, params);
    const headers = this.buildRequestHeaders(customHeaders);

    const requestConfig = {
      url,
      method: method.toUpperCase(),
      headers
    };

    // Add custom apiUrl if provided
    if (this.apiUrl) {
      requestConfig.apiUrl = this.apiUrl;
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestConfig.data = data;
    }

    // Update request statistics
    this.requestStats.totalRequests++;

    // Store request info in state
    this.stateManager.setState('lastApiRequest', {
      endpoint,
      method: method.toUpperCase(),
      timestamp: Date.now()
    });

    let lastError;
    let attempts = 0;
    const maxAttempts = this.config.retryAttempts + 1;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await global.Fliplet.API.request(requestConfig);

        // Success - update statistics
        this.requestStats.successfulRequests++;
        return result;
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt
        if (attempts >= maxAttempts) {
          break;
        }

        // Categorize error for retry decision
        const errorCategory = this.errorHandler.categorizeError(error);

        // Only retry on certain error types
        if (!['VALIDATION_ERROR', 'AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR'].includes(errorCategory)) {
          this.requestStats.retryCount++;

          // Exponential backoff delay
          const delay = this.config.retryDelay * Math.pow(2, attempts - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Don't retry for these error types
          break;
        }
      }
    }

    // All retries failed - update statistics and handle error
    this.requestStats.failedRequests++;
    this.errorHandler.categorizeError(lastError);
    throw lastError;
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Request result
   */
  async get(endpoint, params = {}, customHeaders = {}) {
    return this.request('GET', endpoint, null, params, customHeaders);
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} params - Query parameters
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Request result
   */
  async post(endpoint, data = {}, params = {}, customHeaders = {}) {
    return this.request('POST', endpoint, data, params, customHeaders);
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} params - Query parameters
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Request result
   */
  async put(endpoint, data = {}, params = {}, customHeaders = {}) {
    return this.request('PUT', endpoint, data, params, customHeaders);
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Request result
   */
  async delete(endpoint, params = {}, customHeaders = {}) {
    return this.request('DELETE', endpoint, null, params, customHeaders);
  }

  /**
   * Get request statistics
   * @returns {Object} Request statistics
   */
  getRequestStats() {
    return { ...this.requestStats };
  }

  /**
   * Reset request statistics
   */
  resetStats() {
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retryCount: 0
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
