/**
 * @jest-environment jsdom
 */

// Mock BaseMiddleware before requiring AndroidPublishingController
const mockBaseMiddleware = {
  prototype: {
    constructor: function(dependencies = {}, config = {}) {
      this.dependencies = dependencies;
      this.config = config;
      this.eventListeners = new Map();
      this.isInitialized = false;
      this.emit = jest.fn();
      this.on = jest.fn();
      this.off = jest.fn();
      this.getState = jest.fn();
      this.getDependency = jest.fn();
      this.getConfig = jest.fn();
      this.getNestedValue = jest.fn();
      this.generateId = jest.fn(() => 'test-id-123');
      this.safeJsonParse = jest.fn();
      this.safeJsonStringify = jest.fn();
    }
  }
};

// Set up global mocks
global.window = global.window || {};
global.window.BaseMiddleware = function(dependencies = {}, config = {}) {
  mockBaseMiddleware.prototype.constructor.call(this, dependencies, config);
};
Object.setPrototypeOf(global.window.BaseMiddleware.prototype, mockBaseMiddleware.prototype);

// Mock dependencies
const mockWorkflowManager = {
  registerWorkflow: jest.fn(),
  startWorkflow: jest.fn(),
  getWorkflowStatus: jest.fn(),
  cancelWorkflow: jest.fn()
};

const mockSubmissionApiService = {
  initializeSubmission: jest.fn(),
  startBuild: jest.fn(),
  getBuild: jest.fn()
};

const mockPushNotificationApiService = {
  configurePushNotifications: jest.fn()
};

const mockFileUploadApiService = {
  uploadFile: jest.fn()
};

const mockStateManager = {
  getState: jest.fn(),
  setState: jest.fn()
};

const mockValidationEngine = {
  validateData: jest.fn()
};

const mockErrorHandler = {
  handleError: jest.fn()
};

describe('AndroidPublishingController', () => {
  let AndroidPublishingController;
  let androidController;
  let dependencies;

  beforeAll(() => {
    // Require AndroidPublishingController after mocks are set up
    AndroidPublishingController = require('../../../src/middleware/controllers/AndroidPublishingController.js');
  });

  beforeEach(() => {
    dependencies = {
      workflowManager: mockWorkflowManager,
      submissionApiService: mockSubmissionApiService,
      pushNotificationApiService: mockPushNotificationApiService,
      fileUploadApiService: mockFileUploadApiService,
      stateManager: mockStateManager,
      validationEngine: mockValidationEngine,
      errorHandler: mockErrorHandler
    };

    androidController = new AndroidPublishingController(dependencies);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockWorkflowManager.startWorkflow.mockResolvedValue('workflow-123');
    mockValidationEngine.validateData.mockResolvedValue({ isValid: true });
    mockErrorHandler.handleError.mockReturnValue({ code: 'ERROR', message: 'Test error' });
  });

  describe('Constructor', () => {
    test('should initialize with correct workflow steps', () => {
      expect(androidController.ANDROID_WORKFLOW_STEPS).toHaveLength(8);
      expect(androidController.ANDROID_WORKFLOW_STEPS[0].name).toBe('validate-initial-data');
      expect(androidController.ANDROID_WORKFLOW_STEPS[7].name).toBe('start-android-build');
    });

    test('should define build statuses', () => {
      expect(androidController.BUILD_STATUS).toEqual({
        PENDING: 'pending',
        RUNNING: 'running',
        COMPLETED: 'completed',
        FAILED: 'failed'
      });
    });

    test('should define Android configuration', () => {
      expect(androidController.ANDROID_CONFIG).toEqual({
        SUPPORTED_ARCHITECTURES: ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'],
        MIN_SDK_VERSION: 21,
        TARGET_SDK_VERSION: 34,
        COMPILE_SDK_VERSION: 34
      });
    });
  });

  describe('getRequiredDependencies', () => {
    test('should return correct required dependencies', () => {
      const required = androidController.getRequiredDependencies();
      expect(required).toEqual([
        'workflowManager',
        'submissionApiService',
        'pushNotificationApiService',
        'fileUploadApiService',
        'stateManager',
        'validationEngine',
        'errorHandler'
      ]);
    });
  });

  describe('setup', () => {
    test('should register Android workflow with WorkflowManager', async () => {
      await androidController.setup();

      expect(mockWorkflowManager.registerWorkflow).toHaveBeenCalledWith(
        'android-publishing',
        androidController.ANDROID_WORKFLOW_STEPS,
        {
          allowParallel: false,
          maxRetries: 3,
          timeout: 60000
        }
      );

      expect(androidController.emit).toHaveBeenCalledWith('android-controller-initialized');
    });
  });

  describe('startAndroidPublishing', () => {
    const validSubmissionData = {
      appName: 'Test App',
      packageName: 'com.test.app',
      playStoreServiceAccount: 'service-account@test.com',
      versionName: '1.0.0',
      versionCode: '1'
    };

    test('should start Android publishing workflow successfully', async () => {
      const workflowId = await androidController.startAndroidPublishing(validSubmissionData);

      expect(workflowId).toBe('workflow-123');
      expect(mockWorkflowManager.startWorkflow).toHaveBeenCalledWith(
        'android-publishing',
        expect.objectContaining({
          platform: 'android',
          submissionData: validSubmissionData,
          appName: validSubmissionData.appName,
          packageName: validSubmissionData.packageName,
          playStoreServiceAccount: validSubmissionData.playStoreServiceAccount
        })
      );

      expect(androidController.emit).toHaveBeenCalledWith('android-publishing-started', {
        workflowId: 'workflow-123',
        submissionData: validSubmissionData
      });
    });

    test('should handle validation errors', async () => {
      mockValidationEngine.validateData.mockResolvedValue({
        isValid: false,
        errors: ['Invalid package name']
      });

      await expect(androidController.startAndroidPublishing(validSubmissionData))
        .rejects.toThrow('Invalid submission data: Invalid package name');

      expect(androidController.emit).toHaveBeenCalledWith('android-publishing-error', expect.any(Object));
    });

    test('should handle workflow start errors', async () => {
      mockWorkflowManager.startWorkflow.mockRejectedValue(new Error('Workflow failed'));

      await expect(androidController.startAndroidPublishing(validSubmissionData))
        .rejects.toThrow('Workflow failed');

      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('handleAndroidSubmissionInitialization', () => {
    const context = {
      packageName: 'com.test.app',
      playStoreServiceAccount: 'service-account@test.com',
      submissionData: {
        appName: 'Test App'
      }
    };

    test('should initialize Android submission successfully', async () => {
      androidController.validatePlayConsoleAccess = jest.fn().mockResolvedValue({ isValid: true });
      androidController.checkExistingApp = jest.fn().mockResolvedValue({ exists: false, appId: null });

      const result = await androidController.handleAndroidSubmissionInitialization(context, dependencies);

      expect(result.status).toBe('android-submission-initialized');
      expect(context.initializationData).toEqual({
        packageName: 'com.test.app',
        playStoreServiceAccount: 'service-account@test.com',
        appExists: false,
        appId: null,
        consoleAccessValidated: true
      });
    });

    test('should handle invalid Play Console access', async () => {
      androidController.validatePlayConsoleAccess = jest.fn().mockResolvedValue({
        isValid: false,
        error: 'Invalid service account'
      });

      await expect(androidController.handleAndroidSubmissionInitialization(context, dependencies))
        .rejects.toThrow('Invalid Google Play Console access: Invalid service account');
    });

    test('should handle initialization errors', async () => {
      androidController.validatePlayConsoleAccess = jest.fn().mockRejectedValue(new Error('Validation failed'));

      await expect(androidController.handleAndroidSubmissionInitialization(context, dependencies))
        .rejects.toThrow('Android submission initialization failed: Validation failed');
    });
  });

  describe('handlePlayStoreConfiguration', () => {
    const context = {
      submissionData: {
        packageName: 'com.test.app',
        appName: 'Test App',
        versionName: '1.0.0',
        versionCode: '1'
      },
      initializationData: {}
    };

    test('should prepare Play Store configuration successfully', async () => {
      androidController.validatePlayStoreConfig = jest.fn().mockResolvedValue({ isValid: true });

      const result = await androidController.handlePlayStoreConfiguration(context, dependencies);

      expect(result.status).toBe('play-store-config-prepared');
      expect(context.playStoreConfig).toEqual({
        packageName: 'com.test.app',
        appName: 'Test App',
        versionName: '1.0.0',
        versionCode: 1,
        category: 'PRODUCTIVITY',
        contentRating: 'EVERYONE',
        releaseTrack: 'internal',
        targetAudience: 'general',
        dataPolicy: {
          privacyPolicyUrl: '',
          hasAds: false,
          collectsData: false
        }
      });
    });

    test('should handle Play Store configuration validation errors', async () => {
      androidController.validatePlayStoreConfig = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['Invalid category']
      });

      await expect(androidController.handlePlayStoreConfiguration(context, dependencies))
        .rejects.toThrow('Invalid Play Store configuration: Invalid category');
    });

    test('should handle Play Store configuration errors', async () => {
      androidController.validatePlayStoreConfig = jest.fn().mockRejectedValue(new Error('Config failed'));

      await expect(androidController.handlePlayStoreConfiguration(context, dependencies))
        .rejects.toThrow('Play Store configuration failed: Config failed');
    });
  });

  describe('handleAndroidMetadataSetup', () => {
    const context = {
      submissionData: {
        shortDescription: 'Short desc',
        fullDescription: 'Full description',
        appIcon: 'icon-data',
        screenshots: ['screenshot1', 'screenshot2']
      },
      playStoreConfig: {
        appName: 'Test App',
        dataPolicy: { privacyPolicyUrl: 'https://example.com/privacy' }
      }
    };

    test('should prepare metadata without assets', async () => {
      const contextWithoutAssets = {
        submissionData: { shortDescription: 'Short desc' },
        playStoreConfig: {
          appName: 'Test App',
          dataPolicy: { privacyPolicyUrl: '' }
        }
      };

      const result = await androidController.handleAndroidMetadataSetup(contextWithoutAssets, dependencies);

      expect(result.status).toBe('android-metadata-prepared');
      expect(contextWithoutAssets.metadata).toEqual({
        title: 'Test App',
        shortDescription: 'Short desc',
        fullDescription: '',
        recentChanges: '',
        developerName: '',
        developerEmail: '',
        website: '',
        supportEmail: '',
        privacyPolicyUrl: ''
      });
    });

    test('should upload and prepare metadata with assets', async () => {
      mockFileUploadApiService.uploadFile
        .mockResolvedValueOnce({ url: 'https://example.com/icon.png' })
        .mockResolvedValueOnce({ url: 'https://example.com/screenshot1.png' })
        .mockResolvedValueOnce({ url: 'https://example.com/screenshot2.png' });

      const result = await androidController.handleAndroidMetadataSetup(context, dependencies);

      expect(result.status).toBe('android-metadata-prepared');
      expect(context.metadata.appIconUrl).toBe('https://example.com/icon.png');
      expect(context.metadata.screenshotUrls).toEqual([
        'https://example.com/screenshot1.png',
        'https://example.com/screenshot2.png'
      ]);

      expect(mockFileUploadApiService.uploadFile).toHaveBeenCalledTimes(3);
      expect(mockFileUploadApiService.uploadFile).toHaveBeenCalledWith({
        file: 'icon-data',
        type: 'app-icon',
        platform: 'android'
      });
    });

    test('should handle metadata setup errors', async () => {
      mockFileUploadApiService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(androidController.handleAndroidMetadataSetup(context, dependencies))
        .rejects.toThrow('Android metadata setup failed: Upload failed');
    });
  });

  describe('handleKeystoreSetup', () => {
    test('should upload custom keystore', async () => {
      const context = {
        submissionData: {
          keystore: {
            file: 'keystore-data',
            keystorePassword: 'pass123',
            keyAlias: 'alias',
            keyPassword: 'keypass'
          }
        }
      };

      mockFileUploadApiService.uploadFile.mockResolvedValue({
        url: 'https://example.com/keystore.jks'
      });

      const result = await androidController.handleKeystoreSetup(context, dependencies);

      expect(result.status).toBe('keystore-configured');
      expect(context.keystoreConfig).toEqual({
        type: 'custom',
        keystoreUrl: 'https://example.com/keystore.jks',
        keystorePassword: 'pass123',
        keyAlias: 'alias',
        keyPassword: 'keypass',
        uploaded: true
      });
    });

    test('should generate new keystore when none provided', async () => {
      const context = {
        packageName: 'com.test.app',
        appName: 'Test App',
        submissionData: {
          organizationName: 'Test Org'
        }
      };

      const result = await androidController.handleKeystoreSetup(context, dependencies);

      expect(result.status).toBe('keystore-configured');
      expect(context.keystoreConfig).toEqual({
        type: 'generated',
        keyAlias: 'com_test_app_key',
        organizationName: 'Test Org',
        organizationUnit: 'Mobile App',
        locality: 'Unknown',
        state: 'Unknown',
        country: 'US',
        validityYears: 25
      });
    });

    test('should handle keystore setup errors', async () => {
      const context = {
        submissionData: {
          keystore: { file: 'keystore-data' }
        }
      };

      mockFileUploadApiService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(androidController.handleKeystoreSetup(context, dependencies))
        .rejects.toThrow('Keystore setup failed: Upload failed');
    });
  });

  describe('handleAndroidPushNotificationSetup', () => {
    const context = {
      packageName: 'com.test.app'
    };

    test('should configure push notifications when enabled', async () => {
      const contextWithPush = {
        ...context,
        submissionData: {
          pushNotifications: {
            enabled: true,
            fcmServerKey: 'server-key-123',
            googleServicesJson: 'services-json-data'
          }
        }
      };

      mockFileUploadApiService.uploadFile.mockResolvedValue({
        url: 'https://example.com/google-services.json'
      });

      const pushConfig = {
        platform: 'android',
        packageName: 'com.test.app',
        configured: true
      };
      mockPushNotificationApiService.configurePushNotifications.mockResolvedValue(pushConfig);

      const result = await androidController.handleAndroidPushNotificationSetup(contextWithPush, dependencies);

      expect(result.status).toBe('android-push-notifications-configured');
      expect(contextWithPush.pushNotificationConfig).toBe(pushConfig);
      expect(mockFileUploadApiService.uploadFile).toHaveBeenCalledWith({
        file: 'services-json-data',
        type: 'google-services-json',
        platform: 'android'
      });
    });

    test('should skip push notifications when disabled', async () => {
      const contextWithoutPush = {
        ...context,
        submissionData: {
          pushNotifications: { enabled: false }
        }
      };

      const result = await androidController.handleAndroidPushNotificationSetup(contextWithoutPush, dependencies);

      expect(result.status).toBe('push-notifications-disabled');
      expect(mockPushNotificationApiService.configurePushNotifications).not.toHaveBeenCalled();
    });

    test('should handle push notification errors gracefully', async () => {
      const contextWithPush = {
        ...context,
        submissionData: {
          pushNotifications: { enabled: true }
        }
      };

      mockPushNotificationApiService.configurePushNotifications.mockRejectedValue(new Error('Push failed'));

      const result = await androidController.handleAndroidPushNotificationSetup(contextWithPush, dependencies);

      expect(result.status).toBe('push-notifications-failed');
      expect(result.error).toBe('Push failed');
    });
  });

  describe('handleSubmissionFinalization', () => {
    const context = {
      playStoreConfig: { packageName: 'com.test.app' },
      metadata: { title: 'Test App' },
      keystoreConfig: { type: 'generated' },
      initializationData: { appExists: false }
    };

    test('should finalize submission successfully', async () => {
      const submission = { id: 'submission-123' };
      mockSubmissionApiService.initializeSubmission.mockResolvedValue(submission);

      const result = await androidController.handleSubmissionFinalization(context, dependencies);

      expect(result.status).toBe('android-submission-finalized');
      expect(context.submissionId).toBe('submission-123');

      const expectedConfig = expect.objectContaining({
        platform: 'android',
        packageName: 'com.test.app',
        buildConfig: {
          minSdkVersion: 21,
          targetSdkVersion: 34,
          compileSdkVersion: 34,
          architectures: ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64']
        }
      });

      expect(mockSubmissionApiService.initializeSubmission).toHaveBeenCalledWith(expectedConfig);
    });

    test('should include push notification config when available', async () => {
      const contextWithPush = {
        ...context,
        pushNotificationConfig: { configured: true }
      };

      const submission = { id: 'submission-123' };
      mockSubmissionApiService.initializeSubmission.mockResolvedValue(submission);

      await androidController.handleSubmissionFinalization(contextWithPush, dependencies);

      const callArgs = mockSubmissionApiService.initializeSubmission.mock.calls[0][0];
      expect(callArgs.pushNotificationConfig).toEqual({ configured: true });
    });

    test('should handle submission finalization errors', async () => {
      mockSubmissionApiService.initializeSubmission.mockRejectedValue(new Error('Finalize failed'));

      await expect(androidController.handleSubmissionFinalization(context, dependencies))
        .rejects.toThrow('Submission finalization failed: Finalize failed');
    });
  });

  describe('handleAndroidBuildStart', () => {
    const context = {
      submissionId: 'submission-123'
    };

    test('should start Android build successfully', async () => {
      const buildResult = { buildId: 'build-123' };
      mockSubmissionApiService.startBuild.mockResolvedValue(buildResult);
      androidController.monitorAndroidBuildProgress = jest.fn();

      const result = await androidController.handleAndroidBuildStart(context, dependencies);

      expect(result.status).toBe('android-build-started');
      expect(context.buildId).toBe('build-123');
      expect(context.buildStatus).toBe('running');
      expect(androidController.monitorAndroidBuildProgress).toHaveBeenCalled();
    });

    test('should handle build start errors', async () => {
      mockSubmissionApiService.startBuild.mockRejectedValue(new Error('Build failed'));

      await expect(androidController.handleAndroidBuildStart(context, dependencies))
        .rejects.toThrow('Android build start failed: Build failed');
    });
  });

  describe('monitorAndroidBuildProgress', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should emit build completed when build succeeds', async () => {
      const build = {
        status: 'completed',
        progress: 100,
        artifacts: ['app.apk', 'app.aab']
      };
      mockSubmissionApiService.getBuild.mockResolvedValue(build);

      androidController.monitorAndroidBuildProgress('submission-123', 'build-123', dependencies);

      // Fast-forward to first check
      jest.advanceTimersByTime(30000);

      // Wait for the async operation to complete
      await jest.runOnlyPendingTimersAsync();

      expect(androidController.emit).toHaveBeenCalledWith('android-build-completed', {
        submissionId: 'submission-123',
        buildId: 'build-123',
        build
      });
    }, 15000);

    test('should emit build failed when build fails', async () => {
      const build = { status: 'failed', error: 'Build error' };
      mockSubmissionApiService.getBuild.mockResolvedValue(build);

      androidController.monitorAndroidBuildProgress('submission-123', 'build-123', dependencies);

      jest.advanceTimersByTime(30000);

      // Wait for the async operation to complete
      await jest.runOnlyPendingTimersAsync();

      expect(androidController.emit).toHaveBeenCalledWith('android-build-failed', {
        submissionId: 'submission-123',
        buildId: 'build-123',
        error: 'Build error'
      });
    }, 15000);

    test('should emit progress updates', async () => {
      const build = { status: 'running', progress: 50, logs: ['Building...'] };
      mockSubmissionApiService.getBuild.mockResolvedValue(build);

      androidController.monitorAndroidBuildProgress('submission-123', 'build-123', dependencies);

      jest.advanceTimersByTime(30000);

      // Wait for the async operation to complete
      await jest.runOnlyPendingTimersAsync();

      expect(androidController.emit).toHaveBeenCalledWith('android-build-progress', {
        submissionId: 'submission-123',
        buildId: 'build-123',
        status: 'running',
        progress: 50,
        logs: ['Building...'],
        artifacts: []
      });
    }, 15000);
  });

  describe('validateAndroidSubmissionData', () => {
    test('should validate correct Android submission data', async () => {
      const validData = {
        appName: 'Test App',
        packageName: 'com.test.app',
        playStoreServiceAccount: 'service-account@test.com',
        versionName: '1.0.0',
        versionCode: '1'
      };

      const result = await androidController.validateAndroidSubmissionData(validData);

      expect(mockValidationEngine.validateData).toHaveBeenCalledWith(validData, expect.any(Array));
      expect(result).toEqual({ isValid: true });
    });
  });

  describe('validatePlayStoreConfig', () => {
    test('should validate Play Store configuration', async () => {
      const config = {
        appName: 'Test App',
        versionName: '1.0.0',
        versionCode: 1,
        category: 'PRODUCTIVITY',
        contentRating: 'EVERYONE',
        releaseTrack: 'internal'
      };

      const result = await androidController.validatePlayStoreConfig(config);

      expect(mockValidationEngine.validateData).toHaveBeenCalledWith(config, expect.any(Array));
      expect(result).toEqual({ isValid: true });
    });
  });

  describe('validatePlayConsoleAccess', () => {
    test('should validate service account', async () => {
      const result = await androidController.validatePlayConsoleAccess('service-account@test.com');

      expect(result).toEqual({ isValid: true });
    });

    test('should reject invalid service account', async () => {
      const result = await androidController.validatePlayConsoleAccess('');

      expect(result).toEqual({
        isValid: false,
        error: 'Service account is required'
      });
    });
  });

  describe('checkExistingApp', () => {
    test('should check for existing app', async () => {
      const result = await androidController.checkExistingApp('com.test.app', 'service-account@test.com');

      expect(result).toEqual({
        exists: false,
        appId: null
      });
    });
  });

  describe('getWorkflowProgress', () => {
    test('should return workflow progress information', () => {
      const workflow = {
        steps: [
          { name: 'step1', description: 'First', status: 'completed' },
          { name: 'step2', description: 'Second', status: 'in-progress' },
          { name: 'step3', description: 'Third', status: 'pending' }
        ],
        status: 'in-progress',
        currentStep: 1
      };
      mockWorkflowManager.getWorkflowStatus.mockReturnValue(workflow);

      const progress = androidController.getWorkflowProgress('workflow-123');

      expect(progress).toEqual({
        workflowId: 'workflow-123',
        platform: 'android',
        status: 'in-progress',
        currentStep: 1,
        totalSteps: 3,
        completedSteps: 1,
        progress: 33,
        steps: [
          { name: 'step1', description: 'First', status: 'completed', error: undefined },
          { name: 'step2', description: 'Second', status: 'in-progress', error: undefined },
          { name: 'step3', description: 'Third', status: 'pending', error: undefined }
        ]
      });
    });

    test('should return null for non-existent workflow', () => {
      mockWorkflowManager.getWorkflowStatus.mockReturnValue(null);

      const progress = androidController.getWorkflowProgress('non-existent');

      expect(progress).toBeNull();
    });
  });

  describe('cancelWorkflow', () => {
    test('should cancel workflow and emit event', async () => {
      await androidController.cancelWorkflow('workflow-123', 'User cancelled');

      expect(mockWorkflowManager.cancelWorkflow).toHaveBeenCalledWith('workflow-123', 'User cancelled');
      expect(androidController.emit).toHaveBeenCalledWith('android-workflow-cancelled', {
        workflowId: 'workflow-123',
        reason: 'User cancelled'
      });
    });
  });
});