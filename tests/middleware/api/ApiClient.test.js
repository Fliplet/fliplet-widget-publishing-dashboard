/**
 * @jest-environment jsdom
 */

// Mock Fliplet.API before importing ApiClient
global.Fliplet = {
  API: {
    request: jest.fn()
  }
};

// Import ApiClient after mocking
const { ApiClient } = require('../../../src/middleware/api/ApiClient.js');

describe('ApiClient', () => {
  let apiClient;
  let mockDependencies;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset Fliplet.API.request mock
    global.Fliplet.API.request.mockClear();

    // Mock dependencies
    mockDependencies = {
      errorHandler: {
        handleError: jest.fn(),
        categorizeError: jest.fn()
      },
      stateManager: {
        getState: jest.fn(() => ({})),
        setState: jest.fn()
      }
    };

    // Create ApiClient instance
    apiClient = new ApiClient(mockDependencies, {
      baseUrl: 'https://api.fliplet.com',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with default configuration', () => {
      const defaultClient = new ApiClient(mockDependencies);

      expect(defaultClient.config.timeout).toBe(30000);
      expect(defaultClient.config.retryAttempts).toBe(3);
      expect(defaultClient.config.retryDelay).toBe(1000);
      expect(defaultClient.apiUrl).toBeNull();
      expect(defaultClient.authToken).toBeNull();
    });

    test('should not set baseUrl by default (Fliplet.API.request() handles it)', () => {
      // Mock Fliplet.Env.get
      global.Fliplet = {
        ...global.Fliplet,
        Env: {
          get: jest.fn((key) => key === 'apiUrl' ? 'https://custom.env.api.com' : undefined)
        }
      };

      const client = new ApiClient(mockDependencies);

      expect(client.apiUrl).toBeNull();
      expect(client.config.baseUrl).toBeUndefined();
    });

    test('should use custom apiUrl from Fliplet.Navigate.query', () => {
      // Mock Fliplet.Navigate.query
      global.Fliplet = {
        ...global.Fliplet,
        Navigate: {
          query: {
            apiUrl: 'https://custom.query.api.com',
            auth_token: 'custom-token-123'
          }
        }
      };

      const client = new ApiClient(mockDependencies);

      expect(client.apiUrl).toBe('https://custom.query.api.com');
      expect(client.authToken).toBe('custom-token-123');
    });

    test('should initialize with custom configuration', () => {
      const customConfig = {
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        retryAttempts: 5,
        retryDelay: 2000
      };

      const customClient = new ApiClient(mockDependencies, customConfig);

      expect(customClient.config.baseUrl).toBe('https://custom.api.com');
      expect(customClient.config.timeout).toBe(60000);
      expect(customClient.config.retryAttempts).toBe(5);
      expect(customClient.config.retryDelay).toBe(2000);
    });

    test('should require errorHandler dependency', () => {
      expect(() => {
        new ApiClient({ stateManager: {} });
      }).toThrow('ApiClient requires errorHandler dependency');
    });

    test('should require stateManager dependency', () => {
      expect(() => {
        new ApiClient({ errorHandler: {} });
      }).toThrow('ApiClient requires stateManager dependency');
    });
  });

  describe('Authentication', () => {
    test('should set authentication token', () => {
      const token = 'test-auth-token';
      apiClient.setAuthToken(token);

      expect(apiClient.authToken).toBe(token);
    });

    test('should set custom API URL', () => {
      const customUrl = 'https://custom.api.com';
      apiClient.setApiUrl(customUrl);

      expect(apiClient.apiUrl).toBe(customUrl);
    });

    test('should get current authentication token', () => {
      const token = 'test-token';
      apiClient.setAuthToken(token);

      expect(apiClient.getAuthToken()).toBe(token);
    });

    test('should get current API URL', () => {
      const customUrl = 'https://custom.api.com';
      apiClient.setApiUrl(customUrl);

      expect(apiClient.getApiUrl()).toBe(customUrl);
    });
  });

  describe('Request Building', () => {
    test('should build request URL without base URL (Fliplet.API.request() handles it)', () => {
      const endpoint = '/v1/submissions';
      const url = apiClient.buildRequestUrl(endpoint);

      expect(url).toBe('v1/submissions');
    });

    test('should build request URL with custom API URL', () => {
      apiClient.setApiUrl('https://custom.api.com');
      const endpoint = '/v1/submissions';
      const url = apiClient.buildRequestUrl(endpoint);

      expect(url).toBe('https://custom.api.com/v1/submissions');
    });

    test('should build request URL with query parameters', () => {
      const endpoint = '/v1/submissions';
      const params = { page: 1, limit: 10, status: 'active' };
      const url = apiClient.buildRequestUrl(endpoint, params);

      expect(url).toContain('v1/submissions');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('status=active');
    });

    test('should build request headers with authentication', () => {
      apiClient.setAuthToken('test-token');
      const headers = apiClient.buildRequestHeaders();

      expect(headers).toHaveProperty('Auth-token', 'test-token');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
      expect(headers).toHaveProperty('Accept', 'application/json');
    });

    test('should build request headers without authentication', () => {
      const headers = apiClient.buildRequestHeaders();

      expect(headers).not.toHaveProperty('Auth-token');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
      expect(headers).toHaveProperty('Accept', 'application/json');
    });

    test('should build request headers with custom headers', () => {
      const customHeaders = { 'X-Custom-Header': 'value' };
      const headers = apiClient.buildRequestHeaders(customHeaders);

      expect(headers).toHaveProperty('X-Custom-Header', 'value');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  describe('Successful API Requests', () => {
    test('should make successful GET request', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/v1/submissions');

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'v1/submissions',
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      });
      expect(result).toEqual(mockResponse);
    });

    test('should make successful POST request with data', async () => {
      const mockResponse = { data: { id: 1, created: true } };
      const requestData = { name: 'Test Submission' };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.post('/v1/submissions', requestData);

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'v1/submissions',
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        data: requestData
      });
      expect(result).toEqual(mockResponse);
    });

    test('should make successful PUT request', async () => {
      const mockResponse = { data: { id: 1, updated: true } };
      const requestData = { name: 'Updated Submission' };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.put('/v1/submissions/1', requestData);

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'v1/submissions/1',
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        data: requestData
      });
      expect(result).toEqual(mockResponse);
    });

    test('should make successful DELETE request', async () => {
      const mockResponse = { data: { deleted: true } };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('/v1/submissions/1');

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'v1/submissions/1',
        method: 'DELETE',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      });
      expect(result).toEqual(mockResponse);
    });

    test('should make request with query parameters', async () => {
      const mockResponse = { data: [] };
      const params = { page: 1, limit: 10 };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/v1/submissions', params);

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: expect.stringContaining('page=1'),
        method: 'GET',
        headers: expect.any(Object)
      });
      expect(result).toEqual(mockResponse);
    });

    test('should make request with custom headers', async () => {
      const mockResponse = { data: {} };
      const customHeaders = { 'X-Custom-Header': 'value' };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/v1/submissions', {}, customHeaders);

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'v1/submissions',
        method: 'GET',
        headers: expect.objectContaining({
          'X-Custom-Header': 'value',
          'Content-Type': 'application/json'
        })
      });
      expect(result).toEqual(mockResponse);
    });

    test('should pass custom apiUrl to Fliplet.API.request when different from baseUrl', async () => {
      const mockResponse = { data: {} };
      apiClient.setApiUrl('https://custom.api.com');
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/v1/submissions');

      expect(global.Fliplet.API.request).toHaveBeenCalledWith({
        url: 'https://custom.api.com/v1/submissions',
        method: 'GET',
        apiUrl: 'https://custom.api.com',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    test('should handle API request errors', async () => {
      const error = new Error('Network error');
      global.Fliplet.API.request.mockRejectedValue(error);

      await expect(apiClient.get('/v1/submissions')).rejects.toThrow('Network error');
    });

    test('should categorize and handle errors through errorHandler', async () => {
      const error = { code: 'NETWORK_ERROR', message: 'Connection failed' };
      mockDependencies.errorHandler.categorizeError.mockReturnValue('NETWORK_ERROR');
      global.Fliplet.API.request.mockRejectedValue(error);

      try {
        await apiClient.get('/v1/submissions');
      } catch (e) {
        // Expected to throw
      }

      expect(mockDependencies.errorHandler.categorizeError).toHaveBeenCalledWith(error);
    });
  });

  describe('Retry Logic', () => {
    test('should retry failed requests up to configured attempts', async () => {
      const error = new Error('Temporary failure');
      global.Fliplet.API.request
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: 'success' });

      const result = await apiClient.get('/v1/submissions');

      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    test('should fail after max retry attempts', async () => {
      const error = new Error('Persistent failure');
      global.Fliplet.API.request.mockRejectedValue(error);

      await expect(apiClient.get('/v1/submissions')).rejects.toThrow('Persistent failure');
      expect(global.Fliplet.API.request).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    test('should use exponential backoff for retry delays', async () => {
      const error = new Error('Temporary failure');
      global.Fliplet.API.request.mockRejectedValue(error);

      const startTime = Date.now();

      try {
        await apiClient.get('/v1/submissions');
      } catch (e) {
        // Expected to fail
      }

      const elapsedTime = Date.now() - startTime;
      // Should take at least 1000ms + 2000ms = 3000ms for retries
      expect(elapsedTime).toBeGreaterThanOrEqual(2900); // Allow some tolerance
    });
  });

  describe('Request Timeout', () => {
    test('should handle request timeout', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'TIMEOUT';
      global.Fliplet.API.request.mockRejectedValue(timeoutError);

      await expect(apiClient.get('/v1/submissions')).rejects.toThrow('Request timeout');
    });
  });

  describe('State Management Integration', () => {
    test('should update state with request information', async () => {
      const mockResponse = { data: { id: 1 } };
      global.Fliplet.API.request.mockResolvedValue(mockResponse);

      await apiClient.get('/v1/submissions');

      expect(mockDependencies.stateManager.setState).toHaveBeenCalledWith(
        'lastApiRequest',
        expect.objectContaining({
          endpoint: '/v1/submissions',
          method: 'GET',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Utility Methods', () => {
    test('should check if client is authenticated', () => {
      expect(apiClient.isAuthenticated()).toBe(false);

      apiClient.setAuthToken('test-token');
      expect(apiClient.isAuthenticated()).toBe(true);
    });

    test('should get request statistics', () => {
      const stats = apiClient.getRequestStats();

      expect(stats).toHaveProperty('totalRequests', 0);
      expect(stats).toHaveProperty('successfulRequests', 0);
      expect(stats).toHaveProperty('failedRequests', 0);
      expect(stats).toHaveProperty('retryCount', 0);
    });

    test('should reset request statistics', () => {
      // Make some requests to generate stats
      apiClient.requestStats.totalRequests = 5;
      apiClient.requestStats.successfulRequests = 3;
      apiClient.requestStats.failedRequests = 2;

      apiClient.resetStats();

      const stats = apiClient.getRequestStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(0);
    });
  });
});
