/**
 * SubmissionApiService Tests
 * Tests for the SubmissionApiService class that wraps submission-related API endpoints
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

describe('SubmissionApiService', () => {
  let submissionApiService;

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
    require('../../../src/middleware/api/SubmissionApiService.js');
    submissionApiService = new window.SubmissionApiService(mockDependencies, { appId: 123 });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with dependencies and config', () => {
      const config = { appId: 123 };
      const service = new window.SubmissionApiService(mockDependencies, config);

      expect(service.apiClient).toBe(mockApiClient);
      expect(service.errorHandler).toBe(mockErrorHandler);
      expect(service.stateManager).toBe(mockStateManager);
      expect(service.validationEngine).toBe(mockValidationEngine);
      expect(service.dataMapper).toBe(mockDataMapper);
      expect(service.config.appId).toBe(123);
    });

    test('should require apiClient dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.apiClient;

      expect(() => {
        new window.SubmissionApiService(invalidDependencies);
      }).toThrow('SubmissionApiService requires apiClient dependency');
    });

    test('should require errorHandler dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.errorHandler;

      expect(() => {
        new window.SubmissionApiService(invalidDependencies);
      }).toThrow('SubmissionApiService requires errorHandler dependency');
    });

    test('should require stateManager dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.stateManager;

      expect(() => {
        new window.SubmissionApiService(invalidDependencies);
      }).toThrow('SubmissionApiService requires stateManager dependency');
    });

    test('should require validationEngine dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.validationEngine;

      expect(() => {
        new window.SubmissionApiService(invalidDependencies);
      }).toThrow('SubmissionApiService requires validationEngine dependency');
    });

    test('should require dataMapper dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.dataMapper;

      expect(() => {
        new window.SubmissionApiService(invalidDependencies);
      }).toThrow('SubmissionApiService requires dataMapper dependency');
    });
  });

  describe('Initialize Submission', () => {
    test('should initialize submission successfully', async () => {
      const mockResponse = {
        status: 'INITIALIZED',
        message: 'Publishing process initialized',
        submission: {
          id: 12345,
          data: {
            submissionType: 'appStore',
            status: 'INITIALIZED',
            isV2Submission: true,
            teamId: 'AFIG8RX79F'
          },
          platform: 'ios',
          status: 'started',
          appId: 123,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await submissionApiService.initializeSubmission({
        platform: 'ios',
        type: 'appStore',
        teamId: 'AFIG8RX79F'
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v2/apps/123/submissions/initialize',
        {
          platform: 'ios',
          type: 'appStore',
          teamId: 'AFIG8RX79F'
        }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'submission',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle initialization errors', async () => {
      const error = new Error('Invalid platform');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.initializeSubmission({
        platform: 'invalid',
        type: 'appStore'
      })).rejects.toThrow('Invalid platform');

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'initializeSubmission',
        platform: 'invalid',
        type: 'appStore'
      });
    });

    test('should validate required fields before initialization', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.SubmissionApiService(mockDependencies, { appId: 123 });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['Platform is required']
      });

      await expect(testService.initializeSubmission({})).rejects.toThrow('Validation failed: Platform is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'submission_initialize',
        {},
        { platform: 'ios' }
      );
    });
  });

  describe('Submit Metadata', () => {
    test('should submit metadata successfully', async () => {
      const mockResponse = {
        status: 'METADATA_SUBMITTED',
        message: 'Metadata for the app has been submitted',
        submission: {
          id: 12345,
          data: {
            status: 'METADATA_SUBMITTED',
            appIcon: 'https://cdn.fliplet.com/apps/20/icon.jpg',
            splashScreen: {
              url: 'https://cdn.fliplet.com/splash.png',
              isEncrypted: true
            },
            'fl-store-iconName': 'Example App'
          }
        }
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const metadata = {
        validationType: 'APP_METADATA',
        data: {
          appIcon: 'https://cdn.fliplet.com/apps/20/icon.jpg',
          splashScreen: {
            url: 'https://cdn.fliplet.com/splash.png',
            isEncrypted: true
          },
          'fl-store-iconName': 'Example App'
        }
      };

      const result = await submissionApiService.submitMetadata(12345, metadata);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        'v2/apps/123/submissions/12345/metadata',
        metadata
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'submission',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle metadata submission errors', async () => {
      const error = new Error('Missing required fields');
      mockApiClient.put.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.submitMetadata(12345, {})).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'submitMetadata',
        submissionId: 12345
      });
    });
  });

  describe('Trigger Build', () => {
    test('should trigger build successfully', async () => {
      const mockResponse = {
        status: 'BUILD_TRIGGERED',
        message: 'Build process has been triggered successfully',
        submission: {
          id: 12345,
          data: {
            status: 'BUILD_TRIGGERED',
            'fl-store-bundleId': 'com.fliplet.app',
            'fl-store-versionNumber': '1.1.0'
          }
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await submissionApiService.triggerBuild(12345, { debug: false });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v2/apps/123/submissions/12345/build',
        { debug: false }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'submission',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle build trigger errors', async () => {
      const error = new Error('Build failed');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.triggerBuild(12345)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'triggerBuild',
        submissionId: 12345
      });
    });
  });

  describe('Get Submissions', () => {
    test('should get submissions list successfully', async () => {
      const mockResponse = {
        submissions: [
          {
            id: 246,
            data: {
              status: 'BUILD_TRIGGERED',
              appIcon: 'https://cdn.fliplet.com/icon.jpg'
            },
            platform: 'android',
            status: 'started',
            createdAt: '2024-01-15T10:30:00.000Z'
          }
        ]
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await submissionApiService.getSubmissions({
        platform: 'android',
        status: 'started,processing'
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/apps/123/submissions/',
        {
          platform: 'android',
          status: 'started,processing'
        }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'submissions_list',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle get submissions errors', async () => {
      const error = new Error('Platform is required');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.getSubmissions({})).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getSubmissions'
      });
    });
  });

  describe('Get Latest Submission', () => {
    test('should get latest submission successfully', async () => {
      const mockResponse = {
        id: 246,
        data: {
          status: 'STORE_CONFIG_SUBMITTED',
          'fl-store-bundleId': 'com.fliplet.app'
        },
        platform: 'ios',
        status: 'started'
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await submissionApiService.getLatestSubmission({
        platform: 'ios'
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/apps/123/submissions/latest',
        { platform: 'ios' }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'submission',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle get latest submission errors', async () => {
      const error = new Error('No submissions found');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.getLatestSubmission({
        platform: 'android'
      })).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getLatestSubmission',
        platform: 'android'
      });
    });
  });

  describe('Get Submission By ID', () => {
    test('should get submission by ID successfully', async () => {
      const mockResponse = {
        submission: {
          id: 246,
          data: {
            status: 'BUILD_TRIGGERED',
            appIcon: 'https://cdn.fliplet.com/icon.jpg'
          },
          platform: 'ios',
          status: 'started'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await submissionApiService.getSubmissionById(246);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/apps/123/submissions/246'
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'submission',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle get submission by ID errors', async () => {
      const error = new Error('Submission not found');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.getSubmissionById(999)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getSubmissionById',
        submissionId: 999
      });
    });
  });

  describe('Cancel Submission', () => {
    test('should cancel submission successfully', async () => {
      const mockResponse = {};

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await submissionApiService.cancelSubmission(12345);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        'v1/apps/123/submissions/12345'
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle cancel submission errors', async () => {
      const error = new Error('Cannot cancel completed submission');
      mockApiClient.delete.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(submissionApiService.cancelSubmission(12345)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'cancelSubmission',
        submissionId: 12345
      });
    });
  });

  describe('State Management Integration', () => {
    test('should update state with submission data', async () => {
      const mockResponse = {
        submission: {
          id: 12345,
          data: { status: 'INITIALIZED' }
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await submissionApiService.initializeSubmission({
        platform: 'ios',
        type: 'appStore',
        teamId: 'AFIG8RX79F'
      });

      expect(mockStateManager.setState).toHaveBeenCalledWith('currentSubmission', {
        id: 12345,
        data: { status: 'INITIALIZED' }
      });
    });
  });

  describe('Utility Methods', () => {
    test('should get service information', () => {
      const info = submissionApiService.getInfo();

      expect(info).toHaveProperty('name', 'SubmissionApiService');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('endpoints');
      expect(info.endpoints).toContain('initializeSubmission');
      expect(info.endpoints).toContain('submitMetadata');
      expect(info.endpoints).toContain('triggerBuild');
      expect(info.endpoints).toContain('getSubmissions');
      expect(info.endpoints).toContain('getLatestSubmission');
      expect(info.endpoints).toContain('getSubmissionById');
      expect(info.endpoints).toContain('cancelSubmission');
    });
  });
});
