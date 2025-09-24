/**
 * FileUploadApiService Tests
 * Tests for the FileUploadApiService class that wraps file upload endpoints
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

describe('FileUploadApiService', () => {
  let fileUploadApiService;

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
    require('../../../src/middleware/api/FileUploadApiService.js');
    fileUploadApiService = new window.FileUploadApiService(mockDependencies, {
      appId: 123,
      submissionId: 456
    });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with dependencies and config', () => {
      const config = { appId: 123, submissionId: 456 };
      const service = new window.FileUploadApiService(mockDependencies, config);

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
        new window.FileUploadApiService(invalidDependencies);
      }).toThrow('FileUploadApiService requires apiClient dependency');
    });

    test('should require errorHandler dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.errorHandler;

      expect(() => {
        new window.FileUploadApiService(invalidDependencies);
      }).toThrow('FileUploadApiService requires errorHandler dependency');
    });

    test('should require stateManager dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.stateManager;

      expect(() => {
        new window.FileUploadApiService(invalidDependencies);
      }).toThrow('FileUploadApiService requires stateManager dependency');
    });

    test('should require validationEngine dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.validationEngine;

      expect(() => {
        new window.FileUploadApiService(invalidDependencies);
      }).toThrow('FileUploadApiService requires validationEngine dependency');
    });

    test('should require dataMapper dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.dataMapper;

      expect(() => {
        new window.FileUploadApiService(invalidDependencies);
      }).toThrow('FileUploadApiService requires dataMapper dependency');
    });
  });

  describe('Upload File', () => {
    test('should upload file successfully', async () => {
      const mockResponse = {
        files: [
          {
            id: 8326584,
            name: 'test-file.apk',
            path: 'apps/123/test-file-277-599-0697.apk',
            contentType: 'application/vnd.android.package-archive',
            url: 'https://api.fliplet.com/v1/media/files/8326584/contents/test-file.apk',
            size: 34922039,
            checksum: '78e8d924a141d0a579f04adc59675523'
          }
        ]
      };

      const fileData = {
        name: 'test-file.apk',
        file: new File(['test content'], 'test-file.apk', { type: 'application/vnd.android.package-archive' })
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await fileUploadApiService.uploadFile(fileData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/media/files',
        expect.any(FormData),
        {
          appId: 123,
          name: 'test-file.apk'
        }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'file_upload',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before upload', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.FileUploadApiService(mockDependencies, {
        appId: 123,
        submissionId: 456
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['File name is required', 'File content is required']
      });

      await expect(testService.uploadFile({})).rejects.toThrow('Validation failed: File name is required, File content is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'file_upload',
        {},
        { platform: 'both' }
      );
    });

    test('should handle upload file errors', async () => {
      const error = new Error('No files were uploaded');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const fileData = {
        name: 'test-file.apk',
        file: new File(['test content'], 'test-file.apk')
      };

      await expect(fileUploadApiService.uploadFile(fileData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'uploadFile'
      });
    });
  });

  describe('Upload Keystore', () => {
    test('should upload keystore successfully', async () => {
      const mockResponse = {
        status: 'SUCCESS',
        message: 'Keystore file uploaded and validated successfully'
      };

      const keystoreData = {
        keyStoreFile: {
          id: 176,
          name: 'comflipletstagingAndroidNotification1.jks',
          url: 'https://api.fliplet.test/v1/media/files/176/contents/comflipletstagingAndroidNotification1.jks'
        },
        keyStorePassword: '9MHSZ3feL5'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await fileUploadApiService.uploadKeystore(keystoreData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        'v2/apps/123/submissions/456/keystore',
        keystoreData
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'keystore_upload',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before keystore upload', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.FileUploadApiService(mockDependencies, {
        appId: 123,
        submissionId: 456
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['Keystore file is required', 'Keystore password is required']
      });

      await expect(testService.uploadKeystore({})).rejects.toThrow('Validation failed: Keystore file is required, Keystore password is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'keystore_upload',
        {},
        { platform: 'android' }
      );
    });

    test('should handle upload keystore errors', async () => {
      const error = new Error('Missing required parameters: keyStoreFilePath and keyStorePassword are required');
      mockApiClient.put.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const keystoreData = {
        keyStoreFile: { id: 176, name: 'test.jks' },
        keyStorePassword: 'password'
      };

      await expect(fileUploadApiService.uploadKeystore(keystoreData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'uploadKeystore'
      });
    });
  });

  describe('Upload Google Services', () => {
    test('should upload Google Services file successfully', async () => {
      const mockResponse = {
        files: [
          {
            id: 49,
            name: 'google-services.json',
            url: 'https://api.fliplet.test/v1/media/files/49/contents/google-services%20%2815%29.json',
            contentType: 'application/json',
            size: 712,
            checksum: '2a07737d949a03da8629c4dadd48a3fd'
          }
        ]
      };

      const googleServicesData = {
        name: 'google-services.json',
        file: new File(['{"project_id": "test-project"}'], 'google-services.json', { type: 'application/json' })
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await fileUploadApiService.uploadGoogleServices(googleServicesData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/media/files',
        expect.any(FormData),
        {
          appId: 123,
          name: 'google-services.json'
        }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'google_services_upload',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before Google Services upload', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.FileUploadApiService(mockDependencies, {
        appId: 123,
        submissionId: 456
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['Google Services file is required']
      });

      await expect(testService.uploadGoogleServices({})).rejects.toThrow('Validation failed: Google Services file is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'google_services_upload',
        {},
        { platform: 'android' }
      );
    });

    test('should handle upload Google Services errors', async () => {
      const error = new Error('Filename is required');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const googleServicesData = {
        name: 'google-services.json',
        file: new File(['{}'], 'google-services.json')
      };

      await expect(fileUploadApiService.uploadGoogleServices(googleServicesData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'uploadGoogleServices'
      });
    });
  });

  describe('Upload Certificate', () => {
    test('should upload certificate file successfully', async () => {
      const mockResponse = {
        files: [
          {
            id: 50,
            name: 'certificate.p12',
            url: 'https://api.fliplet.test/v1/media/files/50/contents/certificate.p12',
            contentType: 'application/x-pkcs12',
            size: 2048,
            checksum: 'abc123def456'
          }
        ]
      };

      const certificateData = {
        name: 'certificate.p12',
        file: new File(['certificate content'], 'certificate.p12', { type: 'application/x-pkcs12' })
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await fileUploadApiService.uploadCertificate(certificateData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        'v1/media/files',
        expect.any(FormData),
        {
          appId: 123,
          name: 'certificate.p12'
        }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'certificate_upload',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before certificate upload', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.FileUploadApiService(mockDependencies, {
        appId: 123,
        submissionId: 456
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['Certificate file is required']
      });

      await expect(testService.uploadCertificate({})).rejects.toThrow('Validation failed: Certificate file is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'certificate_upload',
        {},
        { platform: 'ios' }
      );
    });

    test('should handle upload certificate errors', async () => {
      const error = new Error('File with invalid name detected');
      mockApiClient.post.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const certificateData = {
        name: 'certificate.p12',
        file: new File(['cert content'], 'certificate.p12')
      };

      await expect(fileUploadApiService.uploadCertificate(certificateData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'uploadCertificate'
      });
    });
  });

  describe('State Management Integration', () => {
    test('should update state with uploaded file', async () => {
      const mockResponse = {
        files: [
          {
            id: 8326584,
            name: 'test-file.apk',
            url: 'https://api.fliplet.com/v1/media/files/8326584/contents/test-file.apk'
          }
        ]
      };

      mockApiClient.post.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await fileUploadApiService.uploadFile({
        name: 'test-file.apk',
        file: new File(['test'], 'test-file.apk')
      });

      expect(mockStateManager.setState).toHaveBeenCalledWith('uploadedFiles', mockResponse.files);
    });

    test('should update state with keystore upload result', async () => {
      const mockResponse = {
        status: 'SUCCESS',
        message: 'Keystore file uploaded and validated successfully'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await fileUploadApiService.uploadKeystore({
        keyStoreFile: { id: 176, name: 'test.jks' },
        keyStorePassword: 'password'
      });

      expect(mockStateManager.setState).toHaveBeenCalledWith('keystoreUploadResult', mockResponse);
    });
  });

  describe('Utility Methods', () => {
    test('should get service information', () => {
      const info = fileUploadApiService.getInfo();

      expect(info).toHaveProperty('name', 'FileUploadApiService');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('endpoints');
      expect(info.endpoints).toContain('uploadFile');
      expect(info.endpoints).toContain('uploadKeystore');
      expect(info.endpoints).toContain('uploadGoogleServices');
      expect(info.endpoints).toContain('uploadCertificate');
    });
  });
});
