/**
 * PushNotificationApiService Tests
 * Tests for the PushNotificationApiService class that wraps push notification configuration endpoints
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

describe('PushNotificationApiService', () => {
  let pushNotificationApiService;

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
    require('../../../src/middleware/api/PushNotificationApiService.js');
    pushNotificationApiService = new window.PushNotificationApiService(mockDependencies, {
      appId: 123,
      submissionId: 456,
      organizationId: 'org123'
    });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with dependencies and config', () => {
      const config = { appId: 123, submissionId: 456, organizationId: 'org123' };
      const service = new window.PushNotificationApiService(mockDependencies, config);

      expect(service.apiClient).toBe(mockApiClient);
      expect(service.errorHandler).toBe(mockErrorHandler);
      expect(service.stateManager).toBe(mockStateManager);
      expect(service.validationEngine).toBe(mockValidationEngine);
      expect(service.dataMapper).toBe(mockDataMapper);
      expect(service.config.appId).toBe(123);
      expect(service.config.submissionId).toBe(456);
      expect(service.config.organizationId).toBe('org123');
    });

    test('should require apiClient dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.apiClient;

      expect(() => {
        new window.PushNotificationApiService(invalidDependencies);
      }).toThrow('PushNotificationApiService requires apiClient dependency');
    });

    test('should require errorHandler dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.errorHandler;

      expect(() => {
        new window.PushNotificationApiService(invalidDependencies);
      }).toThrow('PushNotificationApiService requires errorHandler dependency');
    });

    test('should require stateManager dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.stateManager;

      expect(() => {
        new window.PushNotificationApiService(invalidDependencies);
      }).toThrow('PushNotificationApiService requires stateManager dependency');
    });

    test('should require validationEngine dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.validationEngine;

      expect(() => {
        new window.PushNotificationApiService(invalidDependencies);
      }).toThrow('PushNotificationApiService requires validationEngine dependency');
    });

    test('should require dataMapper dependency', () => {
      const invalidDependencies = { ...mockDependencies };
      delete invalidDependencies.dataMapper;

      expect(() => {
        new window.PushNotificationApiService(invalidDependencies);
      }).toThrow('PushNotificationApiService requires dataMapper dependency');
    });
  });

  describe('Get Push Configuration', () => {
    test('should get push configuration successfully', async () => {
      const mockResponse = {
        widgetInstance: {
          id: 29057329,
          settings: {
            apn: true,
            apnKeyId: 'CKBB258L37',
            apnTopic: 'com.fliplet.iOsPublishingV2',
            apnTeamId: 'H25Z7T6F52',
            apnAuthKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----'
          }
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await pushNotificationApiService.getPushConfig();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v1/widget-instances/com.fliplet.push-notifications',
        { appId: 123 }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'push_config',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle empty push configuration', async () => {
      const mockResponse = { widgetInstance: null };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await pushNotificationApiService.getPushConfig();

      expect(result.widgetInstance).toBeNull();
    });

    test('should handle get push config errors', async () => {
      const error = new Error('Error retrieving push configuration');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(pushNotificationApiService.getPushConfig()).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getPushConfig'
      });
    });
  });

  describe('Get iOS Push Config by Team', () => {
    test('should get iOS push config by team successfully', async () => {
      const mockResponse = {
        pushConfig: {
          apnKeyId: 'CKBB258L37',
          apnAuthKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----',
          apnTopic: 'com.fliplet.iOsPublishingV2',
          apnTeamId: 'H25Z7T6F52'
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await pushNotificationApiService.getIosPushConfigByTeam('H25Z7T6F52');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        'v2/organizations/org123/credentials/ios-push-config/H25Z7T6F52'
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'ios_push_config',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle empty iOS push config by team', async () => {
      const mockResponse = { pushConfig: {} };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await pushNotificationApiService.getIosPushConfigByTeam('H25Z7T6F52');

      expect(result.pushConfig).toEqual({});
    });

    test('should handle get iOS push config by team errors', async () => {
      const error = new Error('Team ID is required');
      mockApiClient.get.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      await expect(pushNotificationApiService.getIosPushConfigByTeam('H25Z7T6F52')).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'getIosPushConfigByTeam',
        teamId: 'H25Z7T6F52'
      });
    });
  });

  describe('Configure iOS Push Notifications', () => {
    test('should configure iOS push notifications successfully', async () => {
      const mockResponse = {
        status: 'PUSH_NOTIFICATION_CONFIGURED',
        message: 'Push notification data submitted',
        data: {
          platform: 'iOS',
          apn: true,
          apnKeyId: 'CKBB258L37'
        }
      };

      const iosPushData = {
        apnKeyId: 'CKBB258L37',
        apnTopic: 'com.fliplet.iOsPublishingV2',
        apnTeamId: 'H25Z7T6F52',
        apnAuthKey: '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await pushNotificationApiService.configureIosPush(iosPushData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        'v1/widget-instances/com.fliplet.push-notifications/settings',
        {
          submissionId: 456,
          platform: 'ios',
          apn: true,
          ...iosPushData
        },
        { appId: 123 }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'push_config',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before iOS configuration', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.PushNotificationApiService(mockDependencies, {
        appId: 123,
        submissionId: 456,
        organizationId: 'org123'
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['APN Key ID is required', 'APN Topic is required']
      });

      await expect(testService.configureIosPush({})).rejects.toThrow('Validation failed: APN Key ID is required, APN Topic is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'ios_push_config',
        {},
        { platform: 'ios' }
      );
    });

    test('should handle configure iOS push errors', async () => {
      const error = new Error('Required push config is missing');
      mockApiClient.put.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const iosPushData = {
        apnKeyId: 'CKBB258L37',
        apnTopic: 'com.fliplet.iOsPublishingV2'
      };

      await expect(pushNotificationApiService.configureIosPush(iosPushData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'configureIosPush'
      });
    });
  });

  describe('Configure Android Push Notifications', () => {
    test('should configure Android push notifications successfully', async () => {
      const mockResponse = {
        status: 'PUSH_NOTIFICATION_CONFIGURED',
        message: 'Push notification data submitted',
        data: {
          platform: 'Android',
          fcm: true,
          project_id: 'android-notification-d2684'
        }
      };

      const androidPushData = {
        project_id: 'android-notification-d2684',
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQD6py4sjCnkYuwq\nz9V5vsJjQ5sjKqdi9JkF78O8lwvCsFmgVj8aPB/gz+8Xeenhtn76DqdU9rT4gEUR\nmyfQcHD6MDfkP21y8KvV2pG9cFjIgCTTb9n4oTu/g3XTuEHE5969Ouq1h4gdOjd4\nP/I3HmQMq3C5bm9Fh0gkZsd+7A/mG0Q2GrhOX9WioE+RRFLWlImSKYMwdf4yyk3d\noZe/e76zy12Xu1GYGNFYfpMw51VzG2WbvHsTYisxqfdWQJWDj4Fh9CsGSmugMJWV\n8mBUU524RxFrxmBqSsxeg+5JpOjtKNmFrF0eVs4LxlzusyeSTEDsmwHFXvJps/2n\nOdDycRZhAgMBAAECggEAFsSS1CcTMxStQSJJ0No8DAo7EFGyjLGNKNXjoMDTp6af\nLYpIBxkJCEG7BRXk4cTS+eHU30ndnGkCXRwL3Mop6P/yQ8BjL7qe0TkeXefTmLrT\nHYWedhAnPjkxvb6R8tHhEK1GXqDmA0mjej/Mv6b6DZCRF7bpUpZ8Pho76tKEizEm\n1wWO7vgBVLrjI86tYkN12eo/AbLyYM0V3B7Bcz30PnljwAOrsJREYuCbirSBpSep\n6pv8RhaTd3TSJsgZavPawYCk3jD8proiucv2vRs6FUlKY8W6JcMhBtngj/bF1auY\nyIvDvishs4QPRj/rM9BBFyMsXcxH88tYqnXp8NOowQKBgQD9YWKAqJQrHIhSLiO1\nZjo88A7oGdvykDpJILmYEYJZicfMeVM16UgkkUPsqhL1JaPOQVROlFtjdCWveeYE\n1p7qMbNK+28n88woLOalj2+DPa4ckXCZh+wU27Oks4XjuYZtqdMbWGJvBDB83LQb\nf89CLEZCrRWW0KbPZJWcGfTbyQKBgQD9PpPAl1lZjz57yafaVZx6EmHHr3AzH4LJ\num23Fvivq7pzg9V6lLa+yl5eT3Bgv0jB3zS/IpNKukdylJHx8oH/f+v4Y7VBiRh2\ns7aaQWNBuBOSzVfNL0qZqtqiLjXSIzBFPEgxkFWmmkfgOqBVfaIngHWfXAhC3how\n5E9M2k8B2QKBgFuNVIooX2E0bg1DnqNszJ44Hyq+LTr34heKO4U2zmKL5iV7sRVJ\ntUeBNYnN6guqDgX4lP3PnTXSQculv/b/lWwJiT8OmptU+++ISc6IhUJmhwLLimPv\nON5QhBh+xWIDJw94zU6UIPz8BokXNfy5sam3VavB3osf2SYWsfg1aMQBAoGAeSgJ\nFCjUjG5lnF97uI8gz54fvaMHcM3wioZwmxmYXKMyDrXR2lVvoJO81i33O7IIIwig\neZkXErdQG1dNA43b99rBkBJT00i9tXyBLgd+byCb7K3lBbtMW3xMIS8ufJxtKZKP\nj3bYI17IaFRkBMKYY4GnxFgJc8RCj4WLEt+W0PECgYAXiofByOs68uy+kLNWGsh3\n0Igqu3UmsYOSdTLo2e3xl02JlRzrYXiJ9kvKjMOAITKce1A0w7DbofhwAONY0OC2\nNe+GgQyu3aezuR4qHMIEH5E0etEPFXVx6kwjoRAdsSn9KBV8oL0GKXLPqlPdai47\nI5K7+eSVPzvjPmI8tH3zFQ==\n-----END PRIVATE KEY-----\n',
        client_email: 'firebase-adminsdk-abc123@android-notification-d2684.iam.gserviceaccount.com',
        'fl-store-firebase': {
          id: 49,
          url: 'https://api.fliplet.test/v1/media/files/49/contents/google-services%20%2815%29.json',
          name: 'google-services (15).json'
        }
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      const result = await pushNotificationApiService.configureAndroidPush(androidPushData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        'v1/widget-instances/com.fliplet.push-notifications/settings',
        {
          submissionId: 456,
          platform: 'android',
          fcm: true,
          ...androidPushData
        },
        { appId: 123 }
      );
      expect(mockDataMapper.transformApiResponse).toHaveBeenCalledWith(
        'push_config',
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    test('should validate required fields before Android configuration', async () => {
      // Create a new instance for this test to avoid affecting other tests
      const testService = new window.PushNotificationApiService(mockDependencies, {
        appId: 123,
        submissionId: 456,
        organizationId: 'org123'
      });

      mockValidationEngine.validate.mockReturnValue({
        isValid: false,
        errors: ['Project ID is required', 'Private key is required']
      });

      await expect(testService.configureAndroidPush({})).rejects.toThrow('Validation failed: Project ID is required, Private key is required');

      expect(mockValidationEngine.validate).toHaveBeenCalledWith(
        'android_push_config',
        {},
        { platform: 'android' }
      );
    });

    test('should handle configure Android push errors', async () => {
      const error = new Error('Required push config is missing');
      mockApiClient.put.mockRejectedValue(error);
      mockErrorHandler.handleError.mockResolvedValue();

      const androidPushData = {
        project_id: 'android-notification-d2684',
        private_key: 'invalid-key'
      };

      await expect(pushNotificationApiService.configureAndroidPush(androidPushData)).rejects.toThrow();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
        operation: 'configureAndroidPush'
      });
    });
  });

  describe('State Management Integration', () => {
    test('should update state with push configuration', async () => {
      const mockResponse = {
        widgetInstance: {
          settings: {
            apn: true,
            apnKeyId: 'CKBB258L37'
          }
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await pushNotificationApiService.getPushConfig();

      expect(mockStateManager.setState).toHaveBeenCalledWith('pushConfig', mockResponse);
    });

    test('should update state with iOS push configuration', async () => {
      const mockResponse = {
        status: 'PUSH_NOTIFICATION_CONFIGURED',
        message: 'Push notification data submitted'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);
      mockDataMapper.transformApiResponse.mockReturnValue(mockResponse);

      await pushNotificationApiService.configureIosPush({
        apnKeyId: 'CKBB258L37',
        apnTopic: 'com.fliplet.iOsPublishingV2'
      });

      expect(mockStateManager.setState).toHaveBeenCalledWith('currentPushConfig', mockResponse);
    });
  });

  describe('Utility Methods', () => {
    test('should get service information', () => {
      const info = pushNotificationApiService.getInfo();

      expect(info).toHaveProperty('name', 'PushNotificationApiService');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('endpoints');
      expect(info.endpoints).toContain('getPushConfig');
      expect(info.endpoints).toContain('getIosPushConfigByTeam');
      expect(info.endpoints).toContain('configureIosPush');
      expect(info.endpoints).toContain('configureAndroidPush');
    });
  });
});
