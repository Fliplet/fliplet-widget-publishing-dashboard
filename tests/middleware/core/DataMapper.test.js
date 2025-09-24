/**
 * DataMapper Tests
 */

// Import the DataMapper class
require('../../../src/middleware/core/DataMapper.js');

describe('DataMapper', () => {
  let dataMapper;
  let mockDependencies;
  let mockConfig;

  beforeEach(() => {
    mockDependencies = createMockDependencies();
    mockConfig = createMockConfig();
    dataMapper = new window.DataMapper(mockDependencies, mockConfig);
  });

  afterEach(() => {
    if (dataMapper) {
      dataMapper.cleanup();
    }
  });

  describe('Constructor', () => {
    test('should initialize with dependencies and config', () => {
      expect(dataMapper.dependencies).toBe(mockDependencies);
      expect(dataMapper.config).toBe(mockConfig);
      expect(dataMapper.apiTransformers).toBeInstanceOf(Map);
      expect(dataMapper.stateTransformers).toBeInstanceOf(Map);
      expect(dataMapper.dataSchemas).toBeInstanceOf(Map);
      expect(dataMapper.customMappers).toBeInstanceOf(Map);
    });

    test('should set configuration values from config', () => {
      const customConfig = {
        ...mockConfig,
        dataMapper: {
          enableValidation: false,
          strictMode: true,
          preserveRawData: false
        }
      };
      const mapper = new window.DataMapper(mockDependencies, customConfig);

      expect(mapper.enableValidation).toBe(false);
      expect(mapper.strictMode).toBe(true);
      expect(mapper.preserveRawData).toBe(false);
    });
  });

  describe('Initialization', () => {
    test('should initialize and setup transformers', async () => {
      const emitSpy = jest.spyOn(dataMapper, 'emit');

      await dataMapper.initialize();

      expect(dataMapper.isInitialized).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith('data-mapper-ready',
        expect.objectContaining({
          apiTransformers: expect.any(Number),
          stateTransformers: expect.any(Number),
          schemas: expect.any(Number)
        })
      );
    });

    test('should load API transformers during setup', async () => {
      await dataMapper.initialize();

      expect(dataMapper.apiTransformers.has('submission')).toBe(true);
      expect(dataMapper.apiTransformers.has('apiKeys')).toBe(true);
      expect(dataMapper.apiTransformers.has('bundleIds')).toBe(true);
      expect(dataMapper.apiTransformers.has('certificateCheck')).toBe(true);
    });

    test('should load state transformers during setup', async () => {
      await dataMapper.initialize();

      expect(dataMapper.stateTransformers.has('workflow')).toBe(true);
      expect(dataMapper.stateTransformers.has('cache')).toBe(true);
      expect(dataMapper.stateTransformers.has('userPreferences')).toBe(true);
    });

    test('should load data schemas during setup', async () => {
      await dataMapper.initialize();

      expect(dataMapper.dataSchemas.has('submission')).toBe(true);
      expect(dataMapper.dataSchemas.has('apiKey')).toBe(true);
      expect(dataMapper.dataSchemas.has('bundleId')).toBe(true);
      expect(dataMapper.dataSchemas.has('file')).toBe(true);
    });
  });

  describe('API Response Transformation', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should transform submission API response', () => {
      const apiResponse = {
        submission: {
          id: 123,
          platform: 'ios',
          status: 'pending',
          appId: 456,
          targetAppId: 789,
          submittedByUserId: 'user123',
          submittedAt: '2023-01-01T00:00:00Z',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          data: {
            teamId: 'ABC123XYZ0',
            'fl-store-bundleId': 'com.example.app'
          },
          result: {
            branchName: 'main',
            versionCode: '1001'
          },
          errors: []
        }
      };

      const transformed = dataMapper.transformApiResponse(apiResponse, 'submission');

      expect(transformed.id).toBe(123);
      expect(transformed.platform).toBe('ios');
      expect(transformed.status).toBe('pending');
      expect(transformed.data.teamId).toBe('ABC123XYZ0');
      expect(transformed.data.storeConfig.bundleId).toBe('com.example.app');
      expect(transformed.result.buildInfo.branchName).toBe('main');
      expect(transformed.createdAt).toBeDefined();
      expect(transformed.updatedAt).toBeDefined();
    });

    test('should transform API keys list response', () => {
      const apiResponse = {
        apiKeys: [
          {
            teamId: 'ABC123XYZ0',
            keyId: 'KEY123XYZ0',
            issuerId: '12345678-1234-1234-1234-123456789012',
            name: 'Test API Key',
            createdFromUserId: 'user123',
            updatedAt: '2023-01-01T00:00:00Z',
            hasApiKey: true
          }
        ]
      };

      const transformed = dataMapper.transformApiResponse(apiResponse, 'apiKeys');

      expect(transformed).toBeInstanceOf(Array);
      expect(transformed[0].teamId).toBe('ABC123XYZ0');
      expect(transformed[0].keyId).toBe('KEY123XYZ0');
      expect(transformed[0].issuerId).toBe('12345678-1234-1234-1234-123456789012');
      expect(transformed[0].name).toBe('Test API Key');
      expect(transformed[0].hasApiKey).toBe(true);
      expect(transformed[0].updatedAt).toBeDefined();
    });

    test('should transform bundle IDs response', () => {
      const apiResponse = {
        apps: [
          {
            appId: 'app123',
            bundleId: 'com.example.app',
            name: 'Test App',
            sku: 'test-app-sku'
          }
        ]
      };

      const transformed = dataMapper.transformApiResponse(apiResponse, 'bundleIds');

      expect(transformed).toBeInstanceOf(Array);
      expect(transformed[0].appId).toBe('app123');
      expect(transformed[0].bundleId).toBe('com.example.app');
      expect(transformed[0].name).toBe('Test App');
      expect(transformed[0].sku).toBe('test-app-sku');
    });

    test('should transform certificate check response', () => {
      const apiResponse = {
        validCertificate: true,
        message: 'Certificate is valid'
      };

      const transformed = dataMapper.transformApiResponse(apiResponse, 'certificateCheck');

      expect(transformed.isValid).toBe(true);
      expect(transformed.message).toBe('Certificate is valid');
      expect(transformed.timestamp).toBeDefined();
    });

    test('should transform push notification config', () => {
      const apiResponse = {
        widgetInstance: {
          id: 'widget123',
          uuid: 'uuid123',
          settings: {
            apn: true,
            apnKeyId: 'KEY123',
            apnTopic: 'com.example.app',
            apnTeamId: 'ABC123XYZ0'
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      };
      const context = { platform: 'ios' };

      const transformed = dataMapper.transformApiResponse(apiResponse, 'pushConfig', context);

      expect(transformed.id).toBe('widget123');
      expect(transformed.platform).toBe('ios');
      expect(transformed.config.enabled).toBe(true);
      expect(transformed.config.keyId).toBe('KEY123');
      expect(transformed.config.topic).toBe('com.example.app');
      expect(transformed.config.teamId).toBe('ABC123XYZ0');
    });

    test('should handle empty or invalid API responses', () => {
      expect(dataMapper.transformApiResponse(null, 'submission')).toBeDefined();
      expect(dataMapper.transformApiResponse({}, 'apiKeys')).toEqual([]);
      expect(dataMapper.transformApiResponse({ apps: null }, 'bundleIds')).toEqual([]);
    });

    test('should emit transformation events', () => {
      const emitSpy = jest.spyOn(dataMapper, 'emit');
      const apiResponse = { submission: { id: 123, platform: 'ios' } };

      dataMapper.transformApiResponse(apiResponse, 'submission');

      expect(emitSpy).toHaveBeenCalledWith('api-response-transformed',
        expect.objectContaining({
          type: 'submission',
          originalSize: expect.any(Number),
          transformedSize: expect.any(Number)
        })
      );
    });

    test('should handle transformation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const emitSpy = jest.spyOn(dataMapper, 'emit');

      // Cause transformation to fail by providing invalid data to a transformer that expects specific structure
      dataMapper.addApiTransformer('failing', () => {
        throw new Error('Transformation failed');
      });

      const result = dataMapper.transformApiResponse({ test: 'data' }, 'failing');

      expect(result).toEqual({ test: 'data' }); // Should return original data
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API transformation failed for failing'),
        'Transformation failed'
      );
      expect(emitSpy).toHaveBeenCalledWith('api-transformation-failed',
        expect.objectContaining({
          type: 'failing',
          error: 'Transformation failed'
        })
      );

      consoleSpy.mockRestore();
    });

    test('should validate transformed data when enabled', () => {
      dataMapper.enableValidation = true;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const apiResponse = {
        submission: {
          id: 'invalid-id', // Should be number
          platform: 'invalidPlatform', // Should be ios or android
          status: 'pending',
          appId: 456
        }
      };

      const result = dataMapper.transformApiResponse(apiResponse, 'submission');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Schema validation failed for submission'),
        expect.any(Array)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('State Transformation', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should serialize workflow data to state', () => {
      const workflowData = {
        currentStep: 'certificate',
        progress: 50,
        data: {
          teamId: 'ABC123XYZ0',
          bundleId: 'com.example.app'
        },
        errors: [],
        isComplete: false,
        dependencies: ['api-key', 'bundle-id'],
        lastUpdated: 1234567890
      };

      const serialized = dataMapper.transformToState(workflowData, 'workflow');

      expect(serialized.currentStep).toBe('certificate');
      expect(serialized.progress).toBe(50);
      expect(serialized.data.teamId).toBe('ABC123XYZ0');
      expect(serialized.errors).toEqual([]);
      expect(serialized.isComplete).toBe(false);
      expect(serialized.dependencies).toContain('api-key');
    });

    test('should deserialize workflow data from state', () => {
      const stateData = {
        currentStep: 'store-config',
        progress: 75,
        data: {
          submissionId: 123,
          storeConfig: { bundleId: 'com.example.app' }
        },
        errors: [{ message: 'Test error' }],
        isComplete: false,
        dependencies: ['certificate'],
        lastUpdated: 1234567890
      };

      const deserialized = dataMapper.transformFromState(stateData, 'workflow');

      expect(deserialized.currentStep).toBe('store-config');
      expect(deserialized.progress).toBe(75);
      expect(deserialized.data.submissionId).toBe(123);
      expect(deserialized.errors).toEqual([{ message: 'Test error' }]);
      expect(deserialized.dependencies).toContain('certificate');
    });

    test('should transform cache data', () => {
      const cacheData = {
        'api-keys': {
          data: [{ teamId: 'ABC123XYZ0' }],
          timestamp: 1234567890,
          ttl: 300000
        }
      };

      const serialized = dataMapper.transformToState(cacheData, 'cache');
      const deserialized = dataMapper.transformFromState(serialized, 'cache');

      expect(serialized['api-keys'].data).toEqual([{ teamId: 'ABC123XYZ0' }]);
      expect(deserialized['api-keys'].data).toEqual([{ teamId: 'ABC123XYZ0' }]);
      expect(deserialized['api-keys'].ttl).toBe(300000);
    });

    test('should transform user preferences', () => {
      const preferences = {
        organizationId: 'org123',
        selectedPlatform: 'ios',
        preferences: {
          autoRetry: true,
          notifications: false
        }
      };

      const serialized = dataMapper.transformToState(preferences, 'userPreferences');
      const deserialized = dataMapper.transformFromState(serialized, 'userPreferences');

      expect(serialized.organizationId).toBe('org123');
      expect(serialized.selectedPlatform).toBe('ios');
      expect(deserialized.preferences.autoRetry).toBe(true);
    });

    test('should handle unknown transformation types gracefully', () => {
      const data = { test: 'data' };

      const serialized = dataMapper.transformToState(data, 'unknownType');
      const deserialized = dataMapper.transformFromState(data, 'unknownType');

      expect(serialized).toEqual(data);
      expect(deserialized).toEqual(data);
    });
  });

  describe('Submission Data Transformation', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should transform submission data with iOS fields', () => {
      const submissionData = {
        submissionType: 'ios-app-store',
        status: 'pending',
        isV2Submission: true,
        teamId: 'ABC123XYZ0',
        'fl-store-bundleId': 'com.example.app',
        'fl-store-versionNumber': '1.0.0',
        'fl-store-versionCode': '1001',
        appIcon: 'icon.png',
        'fl-store-iconName': 'AppIcon',
        splashScreen: 'splash.png',
        appStoreAppId: '123456789',
        bundleId: 'com.example.app',
        name: 'Test App',
        sku: 'test-app',
        'fl-credentials': 'distribution'
      };

      const transformed = dataMapper.transformSubmissionData(submissionData);

      expect(transformed.submissionType).toBe('ios-app-store');
      expect(transformed.teamId).toBe('ABC123XYZ0');
      expect(transformed.storeConfig.bundleId).toBe('com.example.app');
      expect(transformed.storeConfig.versionNumber).toBe('1.0.0');
      expect(transformed.metadata.appIcon).toBe('icon.png');
      expect(transformed.bundleIdInfo.appStoreAppId).toBe('123456789');
      expect(transformed.certificateType).toBe('distribution');
    });

    test('should transform submission result data', () => {
      const submissionResult = {
        appBuild: {
          files: [
            {
              id: 1,
              name: 'app.ipa',
              url: 'https://example.com/app.ipa',
              path: '/path/to/app.ipa',
              contentType: 'application/octet-stream',
              metadata: { size: 1024000, checksum: 'abc123' },
              isEncrypted: true,
              appId: 123,
              userId: 'user123',
              organizationId: 'org123',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ]
        },
        branchName: 'main',
        versionCode: '1001',
        versionNumber: '1.0.0',
        certificatePassword: 'secret',
        certificateUsername: 'developer'
      };

      const transformed = dataMapper.transformSubmissionResult(submissionResult);

      expect(transformed.appBuild.files).toHaveLength(1);
      expect(transformed.appBuild.files[0].name).toBe('app.ipa');
      expect(transformed.appBuild.files[0].size).toBe(1024000);
      expect(transformed.buildInfo.branchName).toBe('main');
      expect(transformed.buildInfo.versionCode).toBe('1001');
      expect(transformed.certificateInfo.password).toBe('secret');
    });
  });

  describe('Push Settings Transformation', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should transform iOS push settings', () => {
      const iosSettings = {
        apn: true,
        apnKeyId: 'KEY123XYZ0',
        apnTopic: 'com.example.app',
        apnTeamId: 'ABC123XYZ0',
        apnAuthKey: 'secret-key'
      };

      const transformed = dataMapper.transformPushSettings(iosSettings, 'ios');

      expect(transformed.enabled).toBe(true);
      expect(transformed.keyId).toBe('KEY123XYZ0');
      expect(transformed.topic).toBe('com.example.app');
      expect(transformed.teamId).toBe('ABC123XYZ0');
      expect(transformed.authKey).toBe('[REDACTED]');
    });

    test('should transform Android push settings', () => {
      const androidSettings = {
        fcm: true,
        project_id: 'my-firebase-project',
        client_email: 'firebase@example.com',
        private_key: 'secret-private-key',
        'fl-store-firebase': 'google-services.json'
      };

      const transformed = dataMapper.transformPushSettings(androidSettings, 'android');

      expect(transformed.enabled).toBe(true);
      expect(transformed.projectId).toBe('my-firebase-project');
      expect(transformed.clientEmail).toBe('firebase@example.com');
      expect(transformed.privateKey).toBe('[REDACTED]');
      expect(transformed.googleServicesFile).toBe('google-services.json');
    });
  });

  describe('Permissions Transformation', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should transform iOS permissions', () => {
      const iosPermissions = {
        NSCameraUsageDescription: {
          enable: true,
          string: 'This app uses camera for photo capture'
        },
        NSLocationWhenInUseUsageDescription: {
          enable: false,
          string: 'This app uses location services'
        }
      };

      const transformed = dataMapper.transformIOSPermissions(iosPermissions);

      expect(transformed.NSCameraUsageDescription.enabled).toBe(true);
      expect(transformed.NSCameraUsageDescription.description).toBe('This app uses camera for photo capture');
      expect(transformed.NSCameraUsageDescription.usage).toContain('Camera access');
      expect(transformed.NSLocationWhenInUseUsageDescription.enabled).toBe(false);
    });

    test('should transform Android permissions', () => {
      const androidPermissions = {
        CAMERA: { enable: true },
        INTERNET: { enable: true },
        ACCESS_FINE_LOCATION: { enable: false }
      };

      const transformed = dataMapper.transformAndroidPermissions(androidPermissions);

      expect(transformed.CAMERA.enabled).toBe(true);
      expect(transformed.CAMERA.description).toContain('Camera access');
      expect(transformed.CAMERA.protectionLevel).toBe('dangerous');
      expect(transformed.INTERNET.enabled).toBe(true);
      expect(transformed.INTERNET.protectionLevel).toBe('normal');
    });

    test('should get iOS permission usage descriptions', () => {
      expect(dataMapper.getIOSPermissionUsage('NSCameraUsageDescription')).toContain('Camera access');
      expect(dataMapper.getIOSPermissionUsage('NSMicrophoneUsageDescription')).toContain('Microphone access');
      expect(dataMapper.getIOSPermissionUsage('UnknownPermission')).toBe('System permission');
    });

    test('should get Android permission descriptions and protection levels', () => {
      expect(dataMapper.getAndroidPermissionDescription('CAMERA')).toContain('Camera access');
      expect(dataMapper.getAndroidPermissionDescription('INTERNET')).toContain('Internet access');
      expect(dataMapper.getAndroidPermissionProtectionLevel('CAMERA')).toBe('dangerous');
      expect(dataMapper.getAndroidPermissionProtectionLevel('INTERNET')).toBe('normal');
    });
  });

  describe('Schema Validation', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should validate data against schemas', () => {
      const validData = {
        id: 123,
        platform: 'ios',
        status: 'pending',
        appId: 456,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      const invalidData = {
        id: 'invalid', // Should be number
        platform: 'invalid', // Should be ios or android
        appId: 456
        // Missing required fields
      };

      const validResult = dataMapper.validateSchema(validData, 'submission');
      const invalidResult = dataMapper.validateSchema(invalidData, 'submission');

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    test('should validate API key schema', () => {
      const validApiKey = {
        teamId: 'ABC123XYZ0',
        keyId: 'KEY123XYZ0',
        issuerId: '12345678-1234-1234-1234-123456789012',
        name: 'Test API Key'
      };

      const invalidApiKey = {
        teamId: 'invalid', // Wrong format
        keyId: 'invalid', // Wrong format
        issuerId: 'invalid', // Wrong format
        name: ''  // Too short
      };

      const validResult = dataMapper.validateSchema(validApiKey, 'apiKey');
      const invalidResult = dataMapper.validateSchema(invalidApiKey, 'apiKey');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    test('should validate bundle ID schema', () => {
      const validBundleId = {
        appId: 'app123',
        bundleId: 'com.example.app',
        name: 'Test App',
        sku: 'test-app'
      };

      const invalidBundleId = {
        appId: 'app123',
        bundleId: 'invalid_bundle', // Wrong format
        name: 'Test App'
        // Missing required bundleId format
      };

      const validResult = dataMapper.validateSchema(validBundleId, 'bundleId');
      const invalidResult = dataMapper.validateSchema(invalidBundleId, 'bundleId');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    test('should validate type constraints', () => {
      expect(dataMapper.validateType('string', 'string')).toBe(true);
      expect(dataMapper.validateType(123, 'number')).toBe(true);
      expect(dataMapper.validateType(true, 'boolean')).toBe(true);
      expect(dataMapper.validateType({}, 'object')).toBe(true);
      expect(dataMapper.validateType([], 'array')).toBe(true);

      expect(dataMapper.validateType('string', 'number')).toBe(false);
      expect(dataMapper.validateType(123, 'string')).toBe(false);
      expect(dataMapper.validateType(null, 'object')).toBe(false);
      expect(dataMapper.validateType({}, 'array')).toBe(false);
    });

    test('should return valid for unknown schemas', () => {
      const result = dataMapper.validateSchema({ test: 'data' }, 'unknownSchema');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should parse dates correctly', () => {
      expect(typeof dataMapper.parseDate('2023-01-01T00:00:00Z')).toBe('number');
      expect(dataMapper.parseDate(null)).toBeNull();
      // DataMapper parseDate returns NaN for invalid dates, not null
      expect(isNaN(dataMapper.parseDate('invalid-date'))).toBe(true);
    });

    test('should normalize errors', () => {
      const errors = [
        { message: 'Error 1', code: 'ERR1' },
        { message: 'Error 2' }, // Missing code
        'String error' // Invalid format but gets converted
      ];

      const normalized = dataMapper.normalizeErrors(errors);

      expect(normalized).toHaveLength(3); // All entries get normalized
      expect(normalized[0].message).toBe('Error 1');
      expect(normalized[0].code).toBe('ERR1');
      expect(normalized[0].id).toBeDefined();
      expect(normalized[0].timestamp).toBeDefined();
      expect(normalized[1].code).toBe('UNKNOWN_ERROR');
      expect(normalized[2].message).toBe('Unknown error'); // String errors become "Unknown error"
    });

    test('should create empty submission', () => {
      const emptySubmission = dataMapper.createEmptySubmission();

      expect(emptySubmission.id).toBeNull();
      expect(emptySubmission.platform).toBeNull();
      expect(emptySubmission.data).toEqual({});
      expect(emptySubmission.errors).toEqual([]);
    });

    test('should calculate data size', () => {
      const data = { test: 'data', number: 123 };
      const size = dataMapper.calculateDataSize(data);

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    test('should serialize and deserialize workflow data', () => {
      const workflowData = {
        teamId: 'ABC123XYZ0',
        nested: {
          field: 'value',
          array: [1, 2, 3]
        }
      };

      const serialized = dataMapper.serializeWorkflowData(workflowData);
      const deserialized = dataMapper.deserializeWorkflowData(serialized);

      expect(deserialized.teamId).toBe('ABC123XYZ0');
      expect(deserialized.nested.field).toBe('value');
      expect(deserialized.nested.array).toEqual([1, 2, 3]);
    });
  });

  describe('Custom Mappers', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should add and use custom API transformers', () => {
      const customTransformer = (response, context) => {
        return { customField: response.data, context };
      };

      dataMapper.addApiTransformer('custom', customTransformer);

      const response = { data: 'test data' };
      const context = { platform: 'ios' };
      const result = dataMapper.transformApiResponse(response, 'custom', context);

      expect(result.customField).toBe('test data');
      expect(result.context.platform).toBe('ios');
    });

    test('should add and use custom state transformers', () => {
      const customTransformer = (data, direction) => {
        if (direction === 'serialize') {
          return { serialized: true, ...data };
        } else {
          return { deserialized: true, ...data };
        }
      };

      dataMapper.addStateTransformer('custom', customTransformer);

      const data = { test: 'data' };
      const serialized = dataMapper.transformToState(data, 'custom');
      const deserialized = dataMapper.transformFromState(data, 'custom');

      expect(serialized.serialized).toBe(true);
      expect(deserialized.deserialized).toBe(true);
    });

    test('should add custom data schemas', () => {
      const customSchema = {
        customField: { type: 'string', required: true },
        customNumber: { type: 'number', required: false }
      };

      dataMapper.addDataSchema('custom', customSchema);

      const validData = { customField: 'test', customNumber: 123 };
      const invalidData = { customNumber: 123 }; // Missing required field

      const validResult = dataMapper.validateSchema(validData, 'custom');
      const invalidResult = dataMapper.validateSchema(invalidData, 'custom');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    test('should add custom mappers', () => {
      const customMapper = (data) => ({ mapped: true, ...data });
      dataMapper.addCustomMapper('testMapper', customMapper);

      expect(dataMapper.customMappers.has('testMapper')).toBe(true);
      expect(dataMapper.customMappers.get('testMapper')).toBe(customMapper);
    });
  });

  describe('Configuration and Info', () => {
    test('should get mapper information', async () => {
      await dataMapper.initialize();

      const info = dataMapper.getMapperInfo();

      expect(info.apiTransformers).toBeInstanceOf(Array);
      expect(info.stateTransformers).toBeInstanceOf(Array);
      expect(info.schemas).toBeInstanceOf(Array);
      expect(info.customMappers).toBeInstanceOf(Array);
      expect(info.config.enableValidation).toBeDefined();
      expect(info.config.strictMode).toBeDefined();
      expect(info.config.preserveRawData).toBeDefined();
    });

    test('should preserve raw data when configured', async () => {
      dataMapper.preserveRawData = true;
      await dataMapper.initialize();

      const apiResponse = { submission: { id: 123, platform: 'ios' } };
      const transformed = dataMapper.transformApiResponse(apiResponse, 'submission');

      expect(transformed.rawData).toBeDefined();
      expect(transformed.rawData.id).toBe(123);
    });

    test('should not preserve raw data when disabled', async () => {
      dataMapper.preserveRawData = false;
      await dataMapper.initialize();

      const apiResponse = { submission: { id: 123, platform: 'ios' } };
      const transformed = dataMapper.transformApiResponse(apiResponse, 'submission');

      expect(transformed.rawData).toBeNull();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await dataMapper.initialize();
    });

    test('should handle transformation errors in strict mode', () => {
      dataMapper.strictMode = true;
      dataMapper.enableValidation = true;

      // Add a transformer that produces invalid data
      dataMapper.addApiTransformer('invalidTransformer', () => {
        return { id: 'invalid' }; // Should be number for submission schema
      });

      expect(() => {
        dataMapper.transformApiResponse({ test: 'data' }, 'submission');
      }).toThrow();
    });

    test('should handle state transformation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      dataMapper.addStateTransformer('errorTransformer', () => {
        throw new Error('Transformation error');
      });

      const data = { test: 'data' };
      const result = dataMapper.transformToState(data, 'errorTransformer');

      expect(result).toEqual(data); // Should return original data
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('State serialization failed for errorTransformer'),
        'Transformation error'
      );

      consoleSpy.mockRestore();
    });

    test('should handle unknown validator warnings gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = dataMapper.transformApiResponse({ test: 'data' }, 'unknownType');

      expect(result).toEqual({ test: 'data' });
      expect(consoleSpy).toHaveBeenCalledWith('No transformer found for API response type: unknownType');

      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources', async () => {
      await dataMapper.initialize();

      dataMapper.addApiTransformer('test', () => {});
      dataMapper.addStateTransformer('test', () => {});
      dataMapper.addDataSchema('test', {});
      dataMapper.addCustomMapper('test', () => {});

      expect(dataMapper.apiTransformers.size).toBeGreaterThan(0);
      expect(dataMapper.stateTransformers.size).toBeGreaterThan(0);
      expect(dataMapper.dataSchemas.size).toBeGreaterThan(0);
      expect(dataMapper.customMappers.size).toBeGreaterThan(0);

      dataMapper.cleanup();

      expect(dataMapper.apiTransformers.size).toBe(0);
      expect(dataMapper.stateTransformers.size).toBe(0);
      expect(dataMapper.dataSchemas.size).toBe(0);
      expect(dataMapper.customMappers.size).toBe(0);
    });
  });
});
