/**
 * CertificateApiService Tests
 * Tests for the CertificateApiService class that wraps certificate management endpoints
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

describe('CertificateApiService', () => {
  let certificateApiService;

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
    require('../../../src/middleware/api/CertificateApiService.js');
    certificateApiService = new window.CertificateApiService(mockDependencies, {
      appId: 123,
      submissionId: 456
    });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with dependencies and config', () => {
      const config = { appId: 123, submissionId: 456 };
      const service = new window.CertificateApiService(mockDependencies, config);

      expect(service.apiClient).toBe(mockApiClient);
      expect(service.errorHandler).toBe(mockErrorHandler);
      expect(service.stateManager).toBe(mockStateManager);
      expect(service.validationEngine).toBe(mockValidationEngine);
      expect(service.dataMapper).toBe(mockDataMapper);
      expect(service.config.appId).toBe(123);
      expect(service.config.submissionId).toBe(456);
    });

    test('should require apiClient dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.apiClient;

      expect(() => {
        new window.CertificateApiService(invalidDependencies);
      }).toThrow('CertificateApiService requires apiClient dependency');
    });

    test('should require errorHandler dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.errorHandler;

      expect(() => {
        new window.CertificateApiService(invalidDependencies);
      }).toThrow('CertificateApiService requires errorHandler dependency');
    });

    test('should require stateManager dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.stateManager;

      expect(() => {
        new window.CertificateApiService(invalidDependencies);
      }).toThrow('CertificateApiService requires stateManager dependency');
    });

    test('should require validationEngine dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.validationEngine;

      expect(() => {
        new window.CertificateApiService(invalidDependencies);
      }).toThrow('CertificateApiService requires validationEngine dependency');
    });

    test('should require dataMapper dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.dataMapper;

      expect(() => {
        new window.CertificateApiService(invalidDependencies);
      }).toThrow('CertificateApiService requires dataMapper dependency');
    });
  });

  describe('Check Certificate', () => {
    test('should check certificate status successfully', async () => {
      const mockResponse = {
        validCertificate: true,
        message: 'Certificate provided for the app is valid'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.checkCertificate();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v2/apps/123/submissions/456/check-certificate'
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'certificate_check',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle invalid certificate status', async () => {
      const mockResponse = {
        validCertificate: false,
        message: 'Certificate provided for the app is not valid'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.checkCertificate();

      expect(result.validCertificate).toBe(false);
      expect(result.message).toBe('Certificate provided for the app is not valid');
    });

    test('should handle check certificate errors', async () => {
      const error = new Error('Team ID is required');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(certificateApiService.checkCertificate()).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'checkCertificate'
      });
    });
  });

  describe('Generate Certificate', () => {
    test('should generate certificate successfully', async () => {
      const mockResponse = {
        credentials: {
          createdAt: 1730816402422,
          type: 'apple',
          status: 'created',
          email: 'test@example.com',
          teamId: 'H25Z7T6F52',
          teamName: 'Test Team',
          certificateName: 'WJ287HZG6R.p12'
        },
        message: 'Certificate generated successfully'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.generateCertificate();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v2/apps/123/submissions/456/ios-app-store/certificate'
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'certificate',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle generate certificate errors', async () => {
      const error = new Error('Maximum number of certificates reached');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(certificateApiService.generateCertificate()).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'generateCertificate'
      });
    });
  });

  describe('Upload Certificate', () => {
    test('should upload certificate successfully', async () => {
      const mockResponse = {
        credentials: {
          createdAt: 1730816402422,
          type: 'apple',
          status: 'created',
          email: 'test@example.com',
          teamId: 'H25Z7T6F52',
          teamName: 'Test Team',
          certificateName: 'WJ287HZG6R.p12'
        },
        message: 'Certificate generated successfully'
      };

      const certificateData = {
        privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA1gfHx9oOy+wqOCYF6VQKcrKnhCrVZgXxW553D/gu0ZjzAhFd\n3VN6fJKm6lK3V2i0SNcfzImD7JmW6SHQD9lGZrDvZK9J8nI/caWgjca9nyfDO5rM\ndXBMPpPGgSGBqyxmt8UcWX2JxwlvCAw9WeVunQYwb155lxWfnQlHnj3t2/ayCy0t\nS0afovSQeqeU9/9apZ84u3LLJ241E56uzX8d84K1D22Nidsu8gLzYGWa03UjnxvB\ni7wmtYAov12cMEF4tFnUsN/ZUWm4nkDAB+SlURbIFb9biel/SxiBEEsCW0FqpfoO\ncoBIsT/FiZQU6/NXuYC03WYdS6x5y/A5KOqx0QIDAQABAoIBAQCVDdwTEYhmefU5\nHznUsiOIl2TURaRSJeddn/FZHMU2UOdD1GZjQcS2xscZvztR02hipfbOUiKe/qO7\nfkHRF8bQs340x2KfRvNqKSe0NOlP0rhDZV3ol6lxlyaSPYx5cjWi29IPfL8b7zT1\nDNkZJxAuqOXIWaoiDvwWuCS5TnW9Tjz9m5VWCgDEKwLt/2+NfCOG+zyx64IoO/XS\nOGqlJ7gB/XljKdMO1+pWIz9wZrpzjjH4CPIOapCUnPDytUah2ZxSUSIvUJNPM+lH\n3E1frYOJdLFFLZgiJmZKRKkFhwuIjaxnfMSRSgwiuopZb5iHp4CACXT9bN3d7LbL\nlRSC69yFAoGBAPsx5FPKUSSt+A0/XMDiB0ZTybbHFqe4Oaz6hJCvjihXAFOxJtW8\n5Z0bwj/sYUEJ6wEuoeuZlb1zMhyjqMcfha0E6BhaaP5Pr1DaOz147LVNVxZH67+0\nYKiYLU616K/YEvhxNA2Igjt8d9tOym2ktcWlEiNAHzGVLHgxLR0EfY5nAoGBANof\n5JhF9i1JzopwabsdcpRme2anmY...',
        certificate: '-----BEGIN CERTIFICATE-----\nMIIFwzCCBKugAwIBAgIQC7ibXmbzMA6wsrp2H1hNeDANBgkqhkiG9w0BAQsFADB1\nMUQwQgYDVQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBD\nZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTELMAkGA1UECwwCRzMxEzARBgNVBAoMCkFw\ncGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTI1MDQyMzE1MDgwMVoXDTI2MDQyMzE1\nMDgwMFowgZ4xGjAYBgoJkiaJk/IsZAEBDApIMjVaN1Q2RjUyMT8wPQYDVQQDDDZp\nUGhvbmUgRGlzdHJpYnV0aW9uOiBXZWJvbyBPbmxpbmUgTGltaXRlZCAoSDI1WjdU\nNkY1MikxEzARBgNVBAsMCkgyNVo3VDZGNTIxHTAbBgNVBAoMFFdlYm9vIE9ubGlu\nZSBMaW1pdGVkMQswCQYDVQQGEwJHQjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBANYHx8faDsvsKjgmBelUCnKyp4Qq1WYF8Vuedw/4LtGY8wIRXd1TenyS\npupSt1dotEjXH8yJg+yZlukh0A/ZRmaw72SvSfJyP3GloI3GvZ8nwzuazHVwTD6T\nxoEhgassZrfFHFl9iccJbwgMPVnlbp0GMG9eeZcVn50JR5497dv2sgstLUtGn6L0\nkHqnlPf/WqWfOLtyyyduNROers1/HfOCtQ9tjYnbLvIC82BlmtN1I58bwYu8JrWA\nKL9dnDBBeLRZ1LDf2VFpuJ5AwAfkpVEWyBW/W4npf0sYgRBLAltBaqX6DnKASLE/\nxYmUFOvzV7mAtN1mHUusecvwOSjqsdECAwEAAaOCAiMwggIfMAwGA1UdEwEB/wQC\nMAAwHwYDVR0jBBgwFoAUCf7AFZD5r...'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.uploadCertificate(certificateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        'v2/apps/123/submissions/456/ios-app-store/certificate',
        certificateData
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'certificate',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before upload', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.CertificateApiService(mockDependencies, {
        appId: 123,
        submissionId: 456
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['Private key is required', 'Certificate is required']
      });

      await expect(testService.uploadCertificate({})).rejects.toThrow('Validation failed: Private key is required, Certificate is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'certificate_upload',
        {},
        { platform: 'ios' }
      );
    });

    test('should handle upload certificate errors', async () => {
      const error = new Error('Missing required parameters: privateKey and certificate are required');
      mockApiClient.put.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const certificateData = {
        privateKey: 'invalid-key',
        certificate: 'invalid-cert'
      };

      await expect(certificateApiService.uploadCertificate(certificateData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'uploadCertificate'
      });
    });
  });

  describe('Get Bundle IDs', () => {
    test('should get bundle IDs successfully', async () => {
      const mockResponse = {
        apps: [
          {
            appId: '6743122423',
            bundleId: 'com.fliplet.iOsPublishingV2',
            name: 'iOS Publishing V2',
            sku: '1741696667'
          }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.getBundleIds();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/apps/123/submissions/456/bundleId'
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'bundle_ids',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle empty bundle IDs list', async () => {
      const mockResponse = { apps: [] };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.getBundleIds();

      expect(result.apps).toEqual([]);
    });

    test('should handle get bundle IDs errors', async () => {
      const error = new Error('API key config is not found');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(certificateApiService.getBundleIds()).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getBundleIds'
      });
    });
  });

  describe('Get Bundle ID Details', () => {
    test('should get bundle ID details successfully', async () => {
      const mockResponse = {
        appStoreAppId: '6743122423',
        bundleId: 'com.fliplet.iOsPublishingV2',
        name: 'iOS Publishing V2',
        sku: '1741696667',
        appStoreAppDetails: {
          versionNumber: '1.0.0',
          status: 'readyForSale'
        }
      };

      const bundleId = 'com.fliplet.iOsPublishingV2';

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await certificateApiService.getBundleIdDetails(bundleId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/apps/123/submissions/456/bundleId/details',
        { bundleId }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'bundle_id_details',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle get bundle ID details errors', async () => {
      const error = new Error('Bundle ID not found');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const bundleId = 'com.invalid.bundle';

      await expect(certificateApiService.getBundleIdDetails(bundleId)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getBundleIdDetails',
        bundleId
      });
    });
  });

  describe('State Management Integration', () => {
    test('should update state with certificate data', async () => {
      const mockResponse = {
        validCertificate: true,
        message: 'Certificate provided for the app is valid'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await certificateApiService.checkCertificate();

      expect(mockStateManager.setState).toHaveBeenCalledWith('certificateStatus', mockResponse);
    });

    test('should update state with generated certificate', async () => {
      const mockResponse = {
        credentials: {
          teamId: 'H25Z7T6F52',
          certificateName: 'WJ287HZG6R.p12'
        },
        message: 'Certificate generated successfully'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await certificateApiService.generateCertificate();

      expect(mockStateManager.setState).toHaveBeenCalledWith('currentCertificate', mockResponse);
    });
  });

  describe('Utility Methods', () => {
    test('should get service information', () => {
      const info = certificateApiService.getInfo();

      expect(info).toHaveProperty('name', 'CertificateApiService');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('endpoints');
      expect(info.endpoints).toContain('checkCertificate');
      expect(info.endpoints).toContain('generateCertificate');
      expect(info.endpoints).toContain('uploadCertificate');
      expect(info.endpoints).toContain('getBundleIds');
      expect(info.endpoints).toContain('getBundleIdDetails');
    });
  });
});
