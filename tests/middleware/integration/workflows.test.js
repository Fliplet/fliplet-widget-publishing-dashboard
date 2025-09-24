/**
 * Integration Tests for Complete iOS and Android Publishing Workflows
 * Tests end-to-end publishing scenarios with realistic data
 */

// Setup test environment
require('../../setup');

// Import mock data and error scenarios
const { getMockResponse, getMockStateData, getSubmissionData } = require('../mocks/api-responses');
const { getErrorScenario } = require('../mocks/error-scenarios');

// Integration test suite
describe('Publishing Workflows Integration Tests', () => {
  let mockFlipletAPI;
  let mockStateManager;
  let mockWorkflowManager;
  let mockIOSController;
  let mockAndroidController;
  let middleware;

  // Realistic app data for testing
  const realisticAppData = {
    ios: {
      appId: 'app_12345_ios',
      bundleId: 'com.example.testapp',
      appName: 'Test Mobile App',
      version: '1.2.0',
      buildNumber: '42',
      teamId: 'ABC1234DEF',
      description: 'A comprehensive test app for iOS publishing workflow validation',
      category: 'productivity',
      keywords: ['productivity', 'business', 'mobile'],
      supportEmail: 'support@example.com',
      privacyUrl: 'https://example.com/privacy',
      copyright: '2024 Example Corp',
      requiredDeviceCapabilities: ['arm64'],
      permissions: {
        'NSCameraUsageDescription': 'This app needs camera access to scan documents',
        'NSLocationWhenInUseUsageDescription': 'This app uses location to find nearby services'
      },
      assets: {
        icon: 'ios-icon-1024.png',
        screenshots: [
          'ios-screenshot-1.png',
          'ios-screenshot-2.png',
          'ios-screenshot-3.png'
        ]
      },
      storeConfig: {
        primaryCategory: 'Business',
        secondaryCategory: 'Productivity',
        contentRating: '4+',
        releaseType: 'manual'
      }
    },
    android: {
      appId: 'app_12345_android',
      packageName: 'com.example.testapp',
      appName: 'Test Mobile App',
      versionName: '1.2.0',
      versionCode: 42,
      description: 'A comprehensive test app for Android publishing workflow validation',
      shortDescription: 'Test mobile app for workflow validation',
      category: 'BUSINESS',
      tags: ['productivity', 'business', 'mobile'],
      contactEmail: 'support@example.com',
      privacyPolicyUrl: 'https://example.com/privacy',
      websiteUrl: 'https://example.com',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.INTERNET',
        'android.permission.WRITE_EXTERNAL_STORAGE'
      ],
      assets: {
        icon: 'android-icon-512.png',
        featureGraphic: 'android-feature-graphic.png',
        screenshots: [
          'android-screenshot-1.png',
          'android-screenshot-2.png',
          'android-screenshot-3.png'
        ]
      },
      playStoreConfig: {
        track: 'internal',
        contentRating: 'Everyone',
        inAppProducts: false,
        adsContent: false
      },
      googleServicesConfig: 'google-services.json'
    }
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Fliplet API mock
    mockFlipletAPI = {
      request: jest.fn()
    };
    global.Fliplet = { API: mockFlipletAPI };

    // Setup localStorage mock
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;

    // Setup window object for middleware loading
    global.window = global;

    // Load middleware using proper module loading
    const middlewareModule = require('../../../src/middleware/middleware');
    const { PublishingMiddleware, createMiddleware } = middlewareModule;

    // Create middleware instance
    middleware = createMiddleware({
      environment: 'test',
      enableLogging: false,
      enablePersistence: false
    });

    // Initialize middleware
    await middleware.initialize();

    // Get component and controller references
    mockStateManager = middleware.getComponent('stateManager');
    mockWorkflowManager = middleware.getController('workflowManager');
    mockIOSController = middleware.getController('iosPublishingController');
    mockAndroidController = middleware.getController('androidPublishingController');

    // Setup default successful API responses
    mockFlipletAPI.request.mockImplementation((options) => {
      const { url, method = 'GET' } = options;

      // Match endpoint patterns and return appropriate mock responses
      if (url.includes('/v1/apps/') && url.includes('/submissions')) {
        if (method === 'POST' && url.endsWith('/submissions')) {
          return Promise.resolve(getMockResponse('submission', 'initialize'));
        }
        if (method === 'POST' && url.includes('/metadata')) {
          return Promise.resolve(getMockResponse('submission', 'metadata'));
        }
        if (method === 'POST' && url.includes('/build')) {
          return Promise.resolve(getMockResponse('submission', 'build'));
        }
        if (method === 'GET' && url.match(/\/submissions\/[^\/]+$/)) {
          return Promise.resolve(getMockResponse('submission', 'get'));
        }
      }

      if (url.includes('/v1/teams/') && url.includes('/api-keys')) {
        if (method === 'GET') {
          return Promise.resolve(getMockResponse('apiKeys', 'list'));
        }
        if (method === 'POST') {
          return Promise.resolve(getMockResponse('apiKeys', 'create'));
        }
      }

      if (url.includes('/v1/certificates')) {
        if (url.includes('/check')) {
          return Promise.resolve(getMockResponse('certificates', 'check'));
        }
        if (url.includes('/generate')) {
          return Promise.resolve(getMockResponse('certificates', 'generate'));
        }
      }

      if (url.includes('/v1/push-notifications')) {
        return Promise.resolve(getMockResponse('pushNotifications', 'config'));
      }

      if (url.includes('/v1/files/upload')) {
        return Promise.resolve(getMockResponse('fileUpload', 'success'));
      }

      // Default success response
      return Promise.resolve({ success: true, data: {} });
    });
  });

  afterEach(async () => {
    // Clean up middleware instance
    if (middleware) {
      await middleware.cleanup();
    }
  });

  describe('Complete iOS Publishing Workflow', () => {
    test('should complete full iOS publishing workflow successfully', async () => {
      // Setup initial state with realistic iOS app data
      await mockStateManager.setState({
        app: realisticAppData.ios,
        workflows: {}
      });

      const workflowId = 'ios-workflow-' + Date.now();
      let workflowEvents = [];
      let buildEvents = [];

      // Listen for workflow events
      middleware.on('workflow-started', (event) => {
        workflowEvents.push({ type: 'started', ...event });
      });

      middleware.on('workflow-step-completed', (event) => {
        workflowEvents.push({ type: 'step-completed', ...event });
      });

      middleware.on('workflow-completed', (event) => {
        workflowEvents.push({ type: 'completed', ...event });
      });

      middleware.on('build-progress', (event) => {
        buildEvents.push({ type: 'progress', ...event });
      });

      middleware.on('build-completed', (event) => {
        buildEvents.push({ type: 'completed', ...event });
      });

      // Start iOS publishing workflow
      const result = await mockIOSController.startIOSPublishing({
        appId: realisticAppData.ios.appId,
        workflowId: workflowId,
        options: {
          createApiKey: true,
          generateCertificate: true,
          enablePushNotifications: true,
          uploadAssets: true
        }
      });

      // Verify workflow started successfully
      expect(result).toEqual({
        success: true,
        workflowId: workflowId,
        message: 'iOS publishing workflow started successfully'
      });

      // Process workflow steps
      let stepCount = 0;
      let continueProcessing = true;

      while (continueProcessing && stepCount < 20) { // Safety limit
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
        stepCount++;

        // Add delay to simulate real workflow processing
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Verify all workflow events were emitted
      expect(workflowEvents).toHaveLength(10); // 1 started + 8 steps + 1 completed
      expect(workflowEvents[0].type).toBe('started');
      expect(workflowEvents[workflowEvents.length - 1].type).toBe('completed');

      // Verify build events
      expect(buildEvents.length).toBeGreaterThan(0);
      expect(buildEvents[buildEvents.length - 1].type).toBe('completed');

      // Verify workflow state
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];

      expect(workflow).toBeDefined();
      expect(workflow.status).toBe('completed');
      expect(workflow.type).toBe('ios-publishing');
      expect(workflow.progress).toBe(100);
      expect(workflow.completedSteps).toHaveLength(8);

      // Verify API calls were made correctly
      const apiCalls = mockFlipletAPI.request.mock.calls;
      expect(apiCalls.length).toBeGreaterThan(8); // At least one call per step

      // Verify submission data in state
      expect(finalState.submissions).toBeDefined();
      expect(Object.keys(finalState.submissions)).toHaveLength(1);

      // Verify iOS-specific data was processed
      const submissionData = Object.values(finalState.submissions)[0];
      expect(submissionData.platform).toBe('ios');
      expect(submissionData.bundleId).toBe(realisticAppData.ios.bundleId);
      expect(submissionData.version).toBe(realisticAppData.ios.version);
    }, 30000);

    test('should handle iOS workflow with certificate generation', async () => {
      // Setup state without existing certificate
      await mockStateManager.setState({
        app: realisticAppData.ios,
        workflows: {},
        certificates: {} // No existing certificates
      });

      const workflowId = 'ios-cert-workflow-' + Date.now();

      // Start workflow
      const result = await mockIOSController.startIOSPublishing({
        appId: realisticAppData.ios.appId,
        workflowId: workflowId,
        options: {
          generateCertificate: true
        }
      });

      expect(result.success).toBe(true);

      // Process workflow steps
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
      }

      // Verify certificate generation was called
      const certCalls = mockFlipletAPI.request.mock.calls.filter(
        call => call[0].url.includes('/certificates/generate')
      );
      expect(certCalls.length).toBe(1);

      // Verify final state includes certificate data
      const finalState = await mockStateManager.getState();
      expect(finalState.certificates).toBeDefined();
    }, 20000);

    test('should handle iOS workflow errors gracefully', async () => {
      // Setup API to return error for API key creation
      mockFlipletAPI.request.mockImplementation((options) => {
        if (options.url.includes('/api-keys') && options.method === 'POST') {
          return Promise.reject(getErrorScenario('api', 'validation'));
        }
        return Promise.resolve({ success: true, data: {} });
      });

      await mockStateManager.setState({
        app: realisticAppData.ios,
        workflows: {}
      });

      const workflowId = 'ios-error-workflow-' + Date.now();
      let errorEvents = [];

      middleware.on('workflow-error', (event) => {
        errorEvents.push(event);
      });

      // Start workflow
      await mockIOSController.startIOSPublishing({
        appId: realisticAppData.ios.appId,
        workflowId: workflowId
      });

      // Process workflow steps
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
      }

      // Verify error was handled
      expect(errorEvents.length).toBeGreaterThan(0);

      // Verify workflow state shows error
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];
      expect(workflow.status).toBe('failed');
      expect(workflow.error).toBeDefined();
    }, 15000);
  });

  describe('Complete Android Publishing Workflow', () => {
    test('should complete full Android publishing workflow successfully', async () => {
      // Setup initial state with realistic Android app data
      await mockStateManager.setState({
        app: realisticAppData.android,
        workflows: {}
      });

      const workflowId = 'android-workflow-' + Date.now();
      let workflowEvents = [];
      let buildEvents = [];

      // Listen for workflow events
      middleware.on('workflow-started', (event) => {
        workflowEvents.push({ type: 'started', ...event });
      });

      middleware.on('workflow-step-completed', (event) => {
        workflowEvents.push({ type: 'step-completed', ...event });
      });

      middleware.on('workflow-completed', (event) => {
        workflowEvents.push({ type: 'completed', ...event });
      });

      middleware.on('build-progress', (event) => {
        buildEvents.push({ type: 'progress', ...event });
      });

      middleware.on('build-completed', (event) => {
        buildEvents.push({ type: 'completed', ...event });
      });

      // Start Android publishing workflow
      const result = await mockAndroidController.startAndroidPublishing({
        appId: realisticAppData.android.appId,
        workflowId: workflowId,
        options: {
          uploadKeystore: true,
          enablePushNotifications: true,
          uploadAssets: true,
          uploadGoogleServices: true
        }
      });

      // Verify workflow started successfully
      expect(result).toEqual({
        success: true,
        workflowId: workflowId,
        message: 'Android publishing workflow started successfully'
      });

      // Process workflow steps
      let stepCount = 0;
      let continueProcessing = true;

      while (continueProcessing && stepCount < 20) { // Safety limit
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
        stepCount++;

        // Add delay to simulate real workflow processing
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Verify all workflow events were emitted
      expect(workflowEvents).toHaveLength(9); // 1 started + 7 steps + 1 completed
      expect(workflowEvents[0].type).toBe('started');
      expect(workflowEvents[workflowEvents.length - 1].type).toBe('completed');

      // Verify build events
      expect(buildEvents.length).toBeGreaterThan(0);
      expect(buildEvents[buildEvents.length - 1].type).toBe('completed');

      // Verify workflow state
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];

      expect(workflow).toBeDefined();
      expect(workflow.status).toBe('completed');
      expect(workflow.type).toBe('android-publishing');
      expect(workflow.progress).toBe(100);
      expect(workflow.completedSteps).toHaveLength(7);

      // Verify API calls were made correctly
      const apiCalls = mockFlipletAPI.request.mock.calls;
      expect(apiCalls.length).toBeGreaterThan(7); // At least one call per step

      // Verify submission data in state
      expect(finalState.submissions).toBeDefined();
      expect(Object.keys(finalState.submissions)).toHaveLength(1);

      // Verify Android-specific data was processed
      const submissionData = Object.values(finalState.submissions)[0];
      expect(submissionData.platform).toBe('android');
      expect(submissionData.packageName).toBe(realisticAppData.android.packageName);
      expect(submissionData.versionName).toBe(realisticAppData.android.versionName);
      expect(submissionData.versionCode).toBe(realisticAppData.android.versionCode);
    }, 30000);

    test('should handle Android workflow with keystore generation', async () => {
      // Setup state without existing keystore
      await mockStateManager.setState({
        app: realisticAppData.android,
        workflows: {},
        android: {
          keystore: null // No existing keystore
        }
      });

      const workflowId = 'android-keystore-workflow-' + Date.now();

      // Start workflow
      const result = await mockAndroidController.startAndroidPublishing({
        appId: realisticAppData.android.appId,
        workflowId: workflowId,
        options: {
          generateKeystore: true
        }
      });

      expect(result.success).toBe(true);

      // Process workflow steps
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
      }

      // Verify keystore generation was handled
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];
      expect(workflow.status).toBe('completed');
    }, 20000);

    test('should handle Android Play Store validation errors', async () => {
      // Setup API to return Play Store validation error
      mockFlipletAPI.request.mockImplementation((options) => {
        if (options.url.includes('/submissions') && options.method === 'POST') {
          return Promise.reject(getErrorScenario('workflow', 'playstore'));
        }
        return Promise.resolve({ success: true, data: {} });
      });

      await mockStateManager.setState({
        app: realisticAppData.android,
        workflows: {}
      });

      const workflowId = 'android-error-workflow-' + Date.now();
      let errorEvents = [];

      middleware.on('workflow-error', (event) => {
        errorEvents.push(event);
      });

      // Start workflow
      await mockAndroidController.startAndroidPublishing({
        appId: realisticAppData.android.appId,
        workflowId: workflowId
      });

      // Process workflow steps
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
      }

      // Verify error was handled
      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].error.message).toContain('Play Store');

      // Verify workflow state shows error
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];
      expect(workflow.status).toBe('failed');
      expect(workflow.error).toBeDefined();
    }, 15000);
  });

  describe('Cross-Platform Workflow Management', () => {
    test('should handle concurrent iOS and Android workflows', async () => {
      // Setup state with both platforms
      await mockStateManager.setState({
        app: {
          ...realisticAppData.ios,
          android: realisticAppData.android
        },
        workflows: {}
      });

      const iosWorkflowId = 'concurrent-ios-' + Date.now();
      const androidWorkflowId = 'concurrent-android-' + Date.now();

      // Start both workflows
      const [iosResult, androidResult] = await Promise.all([
        mockIOSController.startIOSPublishing({
          appId: realisticAppData.ios.appId,
          workflowId: iosWorkflowId
        }),
        mockAndroidController.startAndroidPublishing({
          appId: realisticAppData.android.appId,
          workflowId: androidWorkflowId
        })
      ]);

      expect(iosResult.success).toBe(true);
      expect(androidResult.success).toBe(true);

      // Process both workflows
      let iosActive = true;
      let androidActive = true;
      let iterations = 0;

      while ((iosActive || androidActive) && iterations < 50) {
        if (iosActive) {
          iosActive = await mockWorkflowManager.processNextStep(iosWorkflowId);
        }
        if (androidActive) {
          androidActive = await mockWorkflowManager.processNextStep(androidWorkflowId);
        }
        iterations++;
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Verify both workflows completed
      const finalState = await mockStateManager.getState();
      const iosWorkflow = finalState.workflows[iosWorkflowId];
      const androidWorkflow = finalState.workflows[androidWorkflowId];

      expect(iosWorkflow.status).toBe('completed');
      expect(androidWorkflow.status).toBe('completed');

      // Verify separate submissions were created
      expect(Object.keys(finalState.submissions)).toHaveLength(2);
    }, 45000);

    test('should manage workflow state transitions correctly', async () => {
      await mockStateManager.setState({
        app: realisticAppData.ios,
        workflows: {}
      });

      const workflowId = 'state-transition-workflow-' + Date.now();
      const stateChanges = [];

      // Monitor state changes
      middleware.on('workflow-step-completed', (event) => {
        stateChanges.push({
          step: event.step,
          status: event.status,
          timestamp: Date.now()
        });
      });

      // Start workflow
      await mockIOSController.startIOSPublishing({
        appId: realisticAppData.ios.appId,
        workflowId: workflowId
      });

      // Process first few steps manually to verify transitions
      for (let i = 0; i < 3; i++) {
        const continued = await mockWorkflowManager.processNextStep(workflowId);
        if (!continued) break;

        // Verify state after each step
        const currentState = await mockStateManager.getState();
        const workflow = currentState.workflows[workflowId];

        expect(workflow).toBeDefined();
        expect(workflow.currentStep).toBeGreaterThan(i);
        expect(workflow.progress).toBeGreaterThan(0);
      }

      // Verify state transitions were recorded
      expect(stateChanges.length).toBe(3);
      expect(stateChanges[0].status).toBe('completed');
      expect(stateChanges[1].status).toBe('completed');
      expect(stateChanges[2].status).toBe('completed');
    }, 25000);

    test('should handle workflow cancellation correctly', async () => {
      await mockStateManager.setState({
        app: realisticAppData.android,
        workflows: {}
      });

      const workflowId = 'cancellation-workflow-' + Date.now();
      let cancelEvent = null;

      middleware.on('workflow-cancelled', (event) => {
        cancelEvent = event;
      });

      // Start workflow
      await mockAndroidController.startAndroidPublishing({
        appId: realisticAppData.android.appId,
        workflowId: workflowId
      });

      // Process a few steps
      await mockWorkflowManager.processNextStep(workflowId);
      await mockWorkflowManager.processNextStep(workflowId);

      // Cancel workflow
      const cancelResult = await mockWorkflowManager.cancelWorkflow(workflowId, 'User requested cancellation');

      expect(cancelResult).toBe(true);
      expect(cancelEvent).toBeDefined();
      expect(cancelEvent.workflowId).toBe(workflowId);
      expect(cancelEvent.reason).toBe('User requested cancellation');

      // Verify workflow state
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];
      expect(workflow.status).toBe('cancelled');
      expect(workflow.cancelReason).toBe('User requested cancellation');

      // Verify no further processing occurs
      const continueResult = await mockWorkflowManager.processNextStep(workflowId);
      expect(continueResult).toBe(false);
    }, 15000);
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from network errors with retry', async () => {
      let attemptCount = 0;

      // Setup API to fail twice then succeed
      mockFlipletAPI.request.mockImplementation((options) => {
        attemptCount++;
        if (attemptCount <= 2 && options.url.includes('/submissions')) {
          return Promise.reject(getErrorScenario('network', 'timeout'));
        }
        return Promise.resolve(getMockResponse('submission', 'initialize'));
      });

      await mockStateManager.setState({
        app: realisticAppData.ios,
        workflows: {}
      });

      const workflowId = 'retry-workflow-' + Date.now();
      let retryEvents = [];

      middleware.on('step-retry', (event) => {
        retryEvents.push(event);
      });

      // Start workflow
      await mockIOSController.startIOSPublishing({
        appId: realisticAppData.ios.appId,
        workflowId: workflowId
      });

      // Process workflow
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
      }

      // Verify retries occurred
      expect(attemptCount).toBe(3); // 2 failures + 1 success
      expect(retryEvents.length).toBeGreaterThan(0);

      // Verify final success
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];
      expect(workflow.status).toBe('completed');
    }, 20000);

    test('should handle validation errors with user feedback', async () => {
      // Setup state with invalid app data
      const invalidAppData = {
        ...realisticAppData.ios,
        bundleId: 'invalid-bundle-id', // Invalid format
        version: 'not-a-version' // Invalid version format
      };

      await mockStateManager.setState({
        app: invalidAppData,
        workflows: {}
      });

      const workflowId = 'validation-error-workflow-' + Date.now();
      let validationEvents = [];

      middleware.on('validation-error', (event) => {
        validationEvents.push(event);
      });

      // Start workflow (should catch validation errors)
      const result = await mockIOSController.startIOSPublishing({
        appId: invalidAppData.appId,
        workflowId: workflowId
      });

      // Verify validation errors were caught
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(validationEvents.length).toBeGreaterThan(0);

      // Verify workflow was not started
      const finalState = await mockStateManager.getState();
      expect(finalState.workflows[workflowId]).toBeUndefined();
    }, 10000);
  });

  describe('Performance and State Management', () => {
    test('should maintain consistent state throughout workflow', async () => {
      await mockStateManager.setState({
        app: realisticAppData.android,
        workflows: {}
      });

      const workflowId = 'state-consistency-workflow-' + Date.now();
      const stateSnapshots = [];

      // Start workflow
      await mockAndroidController.startAndroidPublishing({
        appId: realisticAppData.android.appId,
        workflowId: workflowId
      });

      // Capture state after each step
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);

        const currentState = await mockStateManager.getState();
        stateSnapshots.push({
          step: currentState.workflows[workflowId]?.currentStep || 0,
          progress: currentState.workflows[workflowId]?.progress || 0,
          timestamp: Date.now()
        });
      }

      // Verify state progression is monotonic
      for (let i = 1; i < stateSnapshots.length; i++) {
        expect(stateSnapshots[i].progress).toBeGreaterThanOrEqual(stateSnapshots[i-1].progress);
      }

      // Verify final state consistency
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];

      expect(workflow.status).toBe('completed');
      expect(workflow.progress).toBe(100);
      expect(workflow.completedSteps.length).toBe(workflow.steps.length);
    }, 25000);

    test('should handle large state objects efficiently', async () => {
      // Create large app data to test performance
      const largeAppData = {
        ...realisticAppData.ios,
        assets: {
          ...realisticAppData.ios.assets,
          screenshots: Array(50).fill(0).map((_, i) => `screenshot-${i}.png`),
          metadata: Array(100).fill(0).reduce((acc, _, i) => {
            acc[`field_${i}`] = `Large metadata field ${i} with substantial content that tests state management performance`;
            return acc;
          }, {})
        }
      };

      const startTime = Date.now();

      await mockStateManager.setState({
        app: largeAppData,
        workflows: {}
      });

      const workflowId = 'performance-workflow-' + Date.now();

      // Start workflow
      await mockIOSController.startIOSPublishing({
        appId: largeAppData.appId,
        workflowId: workflowId
      });

      // Process workflow
      let continueProcessing = true;
      while (continueProcessing) {
        continueProcessing = await mockWorkflowManager.processNextStep(workflowId);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify workflow completed successfully despite large state
      const finalState = await mockStateManager.getState();
      const workflow = finalState.workflows[workflowId];
      expect(workflow.status).toBe('completed');

      // Verify reasonable performance (should complete within 30 seconds)
      expect(totalTime).toBeLessThan(30000);

      // Verify state integrity
      expect(finalState.app.assets.screenshots).toHaveLength(50);
      expect(Object.keys(finalState.app.assets.metadata)).toHaveLength(100);
    }, 35000);
  });
});