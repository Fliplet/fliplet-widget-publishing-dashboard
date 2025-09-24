/**
 * ApiKeyService Tests
 * Tests for the ApiKeyService class that wraps API key management endpoints
 */

// Mock dependencies
const mockApiClient = {
  post: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  delete: jest.fn()
};

const mockErrorHandler = {
  handleError: jest.fn(),
  categorizeError: jest.fn()
};

const mockStateManager = {
  setState: jest.fn(),
  getState: jest.fn()
};

const mockValidationEngine = {
  validate: jest.fn()
};

const mockDataMapper = {
  transformApiResponse: jest.fn()
};

const mockDependencies = {
  apiClient: mockApiClient,
  errorHandler: mockErrorHandler,
  stateManager: mockStateManager,
  validationEngine: mockValidationEngine,
  dataMapper: mockDataMapper
};

describe('ApiKeyService', () => {
  let apiKeyService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset global mocks
    global.Fliplet = {
      API: {
        request: jest.fn()
      }
    };

    // Setup validation mock to return proper structure
    mockValidationEngine.validate.mockReturnValue({
      isValid: true,
      errors: []
    });

    // Load the class
    require('../../../src/middleware/api/ApiKeyService.js');
    apiKeyService = new window.ApiKeyService(mockDependencies, { organizationId: 'org123' });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with dependencies and config', () => {
      const config = { organizationId: 'org123' };
      const service = new window.ApiKeyService(mockDependencies, config);

      expect(service.apiClient).toBe(mockApiClient);
      expect(service.errorHandler).toBe(mockErrorHandler);
      expect(service.stateManager).toBe(mockStateManager);
      expect(service.validationEngine).toBe(mockValidationEngine);
      expect(service.dataMapper).toBe(mockDataMapper);
      expect(service.config.organizationId).toBe('org123');
    });

    test('should require apiClient dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.apiClient;

      expect(() => {
        new window.ApiKeyService(invalidDependencies);
      }).toThrow('ApiKeyService requires apiClient dependency');
    });

    test('should require errorHandler dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.errorHandler;

      expect(() => {
        new window.ApiKeyService(invalidDependencies);
      }).toThrow('ApiKeyService requires errorHandler dependency');
    });

    test('should require stateManager dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.stateManager;

      expect(() => {
        new window.ApiKeyService(invalidDependencies);
      }).toThrow('ApiKeyService requires stateManager dependency');
    });

    test('should require validationEngine dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.validationEngine;

      expect(() => {
        new window.ApiKeyService(invalidDependencies);
      }).toThrow('ApiKeyService requires validationEngine dependency');
    });

    test('should require dataMapper dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.dataMapper;

      expect(() => {
        new window.ApiKeyService(invalidDependencies);
      }).toThrow('ApiKeyService requires dataMapper dependency');
    });
  });

  describe('List API Keys', () => {
    test('should list all API keys successfully', async () => {
      const mockResponse = {
        apiKeys: [
          {
            teamId: 'team123',
            keyId: 'ABC123DEF4',
            issuerId: '57246b42-0bad-4034-a4c8-123456789012',
            updatedAt: '2024-01-15T10:30:00.000Z',
            createdFromUserId: 123,
            name: 'Production API Key'
          },
          {
            teamId: 'team456',
            keyId: 'DEF456GHI7',
            issuerId: '8a9b7c6d-5e4f-3g2h-1i0j-987654321098',
            updatedAt: '2024-01-17T09:15:00.000Z',
            createdFromUserId: 456,
            name: 'Team 456 API Key'
          }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.listApiKeys();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-keys'
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'api_keys_list',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle empty API keys list', async () => {
      const mockResponse = { apiKeys: [] };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.listApiKeys();

      expect(result.apiKeys).toEqual([]);
    });

    test('should handle list API keys errors', async () => {
      const error = new Error('Error retrieving API keys');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(apiKeyService.listApiKeys()).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'listApiKeys'
      });
    });
  });

  describe('Create API Key', () => {
    test('should create API key successfully', async () => {
      const mockResponse = {
        teamId: 'AFIG8RX79F',
        config: {
          keyId: '977G8RX79F',
          issuerId: '69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1',
          teamId: 'AFIG8RX79F',
          updatedAt: '2024-01-15T10:30:00.000Z',
          name: 'Fliplet org'
        },
        message: 'API key configuration saved successfully'
      };

      const apiKeyData = {
        apiKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----',
        issuerId: '69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1',
        keyId: '977G8RX79F',
        teamId: 'AFIG8RX79F',
        name: 'Fliplet org'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.createApiKey(apiKeyData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-key',
        apiKeyData
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'api_key',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before creation', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.ApiKeyService(mockDependencies, { organizationId: 'org123' });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['API key is required', 'Team ID is required']
      });

      await expect(testService.createApiKey({})).rejects.toThrow('Validation failed: API key is required, Team ID is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'api_key_create',
        {},
        { platform: 'ios' }
      );
    });

    test('should handle create API key errors', async () => {
      const error = new Error('API key validation failed');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const apiKeyData = {
        apiKey: 'invalid-key',
        teamId: 'AFIG8RX79F',
        name: 'Test Key'
      };

      await expect(apiKeyService.createApiKey(apiKeyData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'createApiKey',
        teamId: 'AFIG8RX79F'
      });
    });
  });

  describe('Get API Key by Team', () => {
    test('should get API key by team ID successfully', async () => {
      const mockResponse = {
        teamId: 'team123',
        keyId: 'ABC123DEF4',
        issuerId: '57246b42-0bad-4034-a4c8-123456789012',
        hasApiKey: true,
        name: 'Production API Key',
        updatedAt: '2024-01-15T10:30:00.000Z',
        createdFromUserId: 123
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.getApiKeyByTeam('team123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-keys/teams/team123',
        {}
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'api_key',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should get API key with sensitive data when requested', async () => {
      const mockResponse = {
        teamId: 'team123',
        keyId: 'ABC123DEF4',
        issuerId: '57246b42-0bad-4034-a4c8-123456789012',
        apiKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...',
        name: 'Production API Key',
        updatedAt: '2024-01-15T10:30:00.000Z',
        createdFromUserId: 123
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.getApiKeyByTeam('team123', { includeSensitiveData: true });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-keys/teams/team123',
        { includeSensitiveData: true }
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle get API key by team errors', async () => {
      const error = new Error('API key configuration not found');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(apiKeyService.getApiKeyByTeam('team999')).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getApiKeyByTeam',
        teamId: 'team999'
      });
    });
  });

  describe('Validate API Key', () => {
    test('should validate API key successfully', async () => {
      const mockResponse = {
        isValid: true,
        message: 'API key is valid'
      };

      const apiKeyData = {
        apiKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----',
        issuerId: '69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1',
        keyId: '977G8RX79F',
        teamId: 'AFIG8RX79F'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.validateApiKey(apiKeyData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-key/validate',
        apiKeyData
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'api_key_validation',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle invalid API key validation', async () => {
      const mockResponse = {
        isValid: false,
        message: 'API key is not valid',
        details: 'Invalid key format or credentials'
      };

      const apiKeyData = {
        apiKey: 'invalid-key',
        issuerId: '69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1',
        keyId: '977G8RX79F',
        teamId: 'AFIG8RX79F'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.validateApiKey(apiKeyData);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('API key is not valid');
    });

    test('should handle validation errors', async () => {
      const error = new Error('API key validation error');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const apiKeyData = {
        apiKey: 'invalid-key',
        teamId: 'AFIG8RX79F'
      };

      await expect(apiKeyService.validateApiKey(apiKeyData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'validateApiKey',
        teamId: 'AFIG8RX79F'
      });
    });
  });

  describe('Update API Key', () => {
    test('should update API key name successfully', async () => {
      const mockResponse = {
        teamId: 'AFIG8RX79F',
        config: {
          keyId: 'ABC123DEF4',
          issuerId: '57246b42-0bad-4034-a4c8-123456789012',
          teamId: 'AFIG8RX79F',
          updatedAt: '2024-01-15T10:30:00.000Z',
          name: 'Updated API Key Name'
        },
        message: 'API key name updated successfully'
      };

      const updateData = { name: 'Updated API Key Name' };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await apiKeyService.updateApiKey('AFIG8RX79F', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-keys/teams/AFIG8RX79F',
        updateData
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'api_key',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle update API key errors', async () => {
      const error = new Error('API key configuration not found');
      mockApiClient.put.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const updateData = { name: 'New Name' };

      await expect(apiKeyService.updateApiKey('team999', updateData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'updateApiKey',
        teamId: 'team999'
      });
    });
  });

  describe('Delete API Key', () => {
    test('should delete API key successfully', async () => {
      const mockResponse = {
        message: 'API key configuration deleted successfully'
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await apiKeyService.deleteApiKey('AFIG8RX79F');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/api-keys/teams/AFIG8RX79F'
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle delete API key errors', async () => {
      const error = new Error('API key configuration not found');
      mockApiClient.delete.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(apiKeyService.deleteApiKey('team999')).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'deleteApiKey',
        teamId: 'team999'
      });
    });
  });

  describe('State Management Integration', () => {
    test('should update state with API keys list', async () => {
      const mockResponse = {
        apiKeys: [
          {
            teamId: 'team123',
            keyId: 'ABC123DEF4',
            name: 'Production API Key'
          }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await apiKeyService.listApiKeys();

      expect(mockStateManager.setState).toHaveBeenCalledWith('apiKeys', mockResponse.apiKeys);
    });

    test('should update state with created API key', async () => {
      const mockResponse = {
        teamId: 'AFIG8RX79F',
        config: {
          keyId: '977G8RX79F',
          name: 'New API Key'
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await apiKeyService.createApiKey({
        apiKey: 'test-key',
        teamId: 'AFIG8RX79F',
        name: 'New API Key'
      });

      expect(mockStateManager.setState).toHaveBeenCalledWith('currentApiKey', mockResponse);
    });
  });

  describe('Utility Methods', () => {
    test('should get service information', () => {
      const info = apiKeyService.getInfo();

      expect(info).toHaveProperty('name', 'ApiKeyService');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('endpoints');
      expect(info.endpoints).toContain('listApiKeys');
      expect(info.endpoints).toContain('createApiKey');
      expect(info.endpoints).toContain('getApiKeyByTeam');
      expect(info.endpoints).toContain('validateApiKey');
      expect(info.endpoints).toContain('updateApiKey');
      expect(info.endpoints).toContain('deleteApiKey');
    });
  });
});
