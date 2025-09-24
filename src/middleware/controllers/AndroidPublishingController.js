/**
 * AndroidPublishingController - Android-specific publishing workflow controller
 *
 * Manages the complete Android publishing workflow:
 * initialization → store config → metadata → keystore → push → build
 *
 * @class AndroidPublishingController
 * @extends BaseMiddleware
 */

// Handle BaseMiddleware inheritance resolution for Jest compatibility
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

class AndroidPublishingController extends BaseMiddlewareClass {
  /**
   * Creates an instance of AndroidPublishingController
   * @param {Object} dependencies - Injected dependencies
   * @param {WorkflowManager} dependencies.workflowManager - Workflow management service
   * @param {SubmissionApiService} dependencies.submissionApiService - Submission service
   * @param {PushNotificationApiService} dependencies.pushNotificationApiService - Push notification service
   * @param {FileUploadApiService} dependencies.fileUploadApiService - File upload service
   * @param {StateManager} dependencies.stateManager - State management service
   * @param {ValidationEngine} dependencies.validationEngine - Validation service
   * @param {ErrorHandler} dependencies.errorHandler - Error handling service
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Android workflow steps
    this.ANDROID_WORKFLOW_STEPS = [
      {
        name: 'validate-initial-data',
        description: 'Validate initial submission data',
        action: 'validate-data',
        params: {
          rules: ['appName', 'packageName', 'playStoreServiceAccount']
        },
        required: true
      },
      {
        name: 'initialize-android-submission',
        description: 'Initialize Android submission process',
        handler: this.handleAndroidSubmissionInitialization.bind(this),
        prerequisites: [
          { type: 'context', path: 'packageName' },
          { type: 'context', path: 'playStoreServiceAccount' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'configure-play-store-settings',
        description: 'Configure Google Play Store settings',
        handler: this.handlePlayStoreConfiguration.bind(this),
        prerequisites: [
          { type: 'step', step: 'initialize-android-submission' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'setup-android-metadata',
        description: 'Setup app metadata and assets for Play Store',
        handler: this.handleAndroidMetadataSetup.bind(this),
        prerequisites: [
          { type: 'step', step: 'configure-play-store-settings' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'setup-keystore',
        description: 'Setup or upload Android keystore',
        handler: this.handleKeystoreSetup.bind(this),
        prerequisites: [
          { type: 'step', step: 'setup-android-metadata' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'configure-android-push-notifications',
        description: 'Configure Firebase push notification settings',
        handler: this.handleAndroidPushNotificationSetup.bind(this),
        prerequisites: [
          { type: 'step', step: 'setup-keystore' }
        ],
        required: false,
        optional: true,
        retryable: true
      },
      {
        name: 'finalize-android-submission',
        description: 'Finalize submission configuration',
        handler: this.handleSubmissionFinalization.bind(this),
        prerequisites: [
          { type: 'step', step: 'setup-keystore' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'start-android-build',
        description: 'Start Android build process',
        handler: this.handleAndroidBuildStart.bind(this),
        prerequisites: [
          { type: 'step', step: 'finalize-android-submission' }
        ],
        required: true,
        retryable: false
      }
    ];

    // Build statuses
    this.BUILD_STATUS = {
      PENDING: 'pending',
      RUNNING: 'running',
      COMPLETED: 'completed',
      FAILED: 'failed'
    };

    // Android-specific configuration
    this.ANDROID_CONFIG = {
      SUPPORTED_ARCHITECTURES: ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'],
      MIN_SDK_VERSION: 21,
      TARGET_SDK_VERSION: 34,
      COMPILE_SDK_VERSION: 34
    };
  }

  /**
   * Get required dependencies
   * @returns {string[]} Array of required dependency names
   */
  getRequiredDependencies() {
    return [
      'workflowManager',
      'submissionApiService',
      'pushNotificationApiService',
      'fileUploadApiService',
      'stateManager',
      'validationEngine',
      'errorHandler'
    ];
  }

  /**
   * Initialize the Android publishing controller
   * @returns {Promise<void>}
   */
  async setup() {
    // Register Android workflow with WorkflowManager
    this.dependencies.workflowManager.registerWorkflow(
      'android-publishing',
      this.ANDROID_WORKFLOW_STEPS,
      {
        allowParallel: false,
        maxRetries: 3,
        timeout: 60000
      }
    );

    this.emit('android-controller-initialized');
  }

  /**
   * Start Android publishing workflow
   * @param {Object} submissionData - Initial submission data
   * @returns {Promise<string>} Workflow ID
   */
  async startAndroidPublishing(submissionData) {
    try {
      // Validate submission data
      const validation = await this.validateAndroidSubmissionData(submissionData);
      if (!validation.isValid) {
        throw new Error(`Invalid submission data: ${validation.errors.join(', ')}`);
      }

      // Start workflow
      const workflowId = await this.dependencies.workflowManager.startWorkflow(
        'android-publishing',
        {
          platform: 'android',
          submissionData: submissionData,
          appName: submissionData.appName,
          packageName: submissionData.packageName,
          playStoreServiceAccount: submissionData.playStoreServiceAccount,
          startTime: new Date().toISOString()
        }
      );

      this.emit('android-publishing-started', { workflowId, submissionData });
      return workflowId;

    } catch (error) {
      const errorDetails = this.dependencies.errorHandler.handleError(error, 'AndroidPublishingController.startAndroidPublishing');
      this.emit('android-publishing-error', { submissionData, error: errorDetails });
      throw error;
    }
  }

  /**
   * Handle Android submission initialization step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleAndroidSubmissionInitialization(context, dependencies) {
    try {
      const { packageName, playStoreServiceAccount, submissionData } = context;

      // Validate Google Play Console access
      const consoleAccess = await this.validatePlayConsoleAccess(playStoreServiceAccount);
      if (!consoleAccess.isValid) {
        throw new Error(`Invalid Google Play Console access: ${consoleAccess.error}`);
      }

      // Check if app already exists in Play Console
      const existingApp = await this.checkExistingApp(packageName, playStoreServiceAccount);

      const initializationData = {
        packageName: packageName,
        playStoreServiceAccount: playStoreServiceAccount,
        appExists: existingApp.exists,
        appId: existingApp.appId || null,
        consoleAccessValidated: true
      };

      context.initializationData = initializationData;

      return { status: 'android-submission-initialized', data: initializationData };

    } catch (error) {
      throw new Error(`Android submission initialization failed: ${error.message}`);
    }
  }

  /**
   * Handle Play Store configuration step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handlePlayStoreConfiguration(context, dependencies) {
    try {
      const { submissionData, initializationData } = context;

      // Prepare Play Store configuration
      const playStoreConfig = {
        packageName: submissionData.packageName,
        appName: submissionData.appName,
        versionName: submissionData.versionName || '1.0.0',
        versionCode: parseInt(submissionData.versionCode || '1'),
        category: submissionData.category || 'PRODUCTIVITY',
        contentRating: submissionData.contentRating || 'EVERYONE',
        releaseTrack: submissionData.releaseTrack || 'internal',
        targetAudience: submissionData.targetAudience || 'general',
        dataPolicy: {
          privacyPolicyUrl: submissionData.privacyPolicyUrl || '',
          hasAds: submissionData.hasAds || false,
          collectsData: submissionData.collectsData || false
        }
      };

      // Validate configuration
      const validation = await this.validatePlayStoreConfig(playStoreConfig);
      if (!validation.isValid) {
        throw new Error(`Invalid Play Store configuration: ${validation.errors.join(', ')}`);
      }

      context.playStoreConfig = playStoreConfig;

      return { status: 'play-store-config-prepared', config: playStoreConfig };

    } catch (error) {
      throw new Error(`Play Store configuration failed: ${error.message}`);
    }
  }

  /**
   * Handle Android metadata setup step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleAndroidMetadataSetup(context, dependencies) {
    try {
      const { submissionData, playStoreConfig } = context;

      // Prepare metadata
      const metadata = {
        title: playStoreConfig.appName,
        shortDescription: submissionData.shortDescription || '',
        fullDescription: submissionData.fullDescription || '',
        recentChanges: submissionData.recentChanges || '',
        developerName: submissionData.developerName || '',
        developerEmail: submissionData.developerEmail || '',
        website: submissionData.website || '',
        supportEmail: submissionData.supportEmail || '',
        privacyPolicyUrl: playStoreConfig.dataPolicy.privacyPolicyUrl
      };

      // Handle assets (icon, feature graphic, screenshots)
      const assets = {
        appIcon: submissionData.appIcon,
        featureGraphic: submissionData.featureGraphic,
        screenshots: submissionData.screenshots || []
      };

      // Upload assets if provided
      const assetUrls = {};

      if (assets.appIcon) {
        const iconUpload = await dependencies.fileUploadApiService.uploadFile({
          file: assets.appIcon,
          type: 'app-icon',
          platform: 'android'
        });
        assetUrls.appIconUrl = iconUpload.url;
      }

      if (assets.featureGraphic) {
        const featureUpload = await dependencies.fileUploadApiService.uploadFile({
          file: assets.featureGraphic,
          type: 'feature-graphic',
          platform: 'android'
        });
        assetUrls.featureGraphicUrl = featureUpload.url;
      }

      if (assets.screenshots.length > 0) {
        const screenshotUploads = await Promise.all(
          assets.screenshots.map(screenshot =>
            dependencies.fileUploadApiService.uploadFile({
              file: screenshot,
              type: 'screenshot',
              platform: 'android'
            })
          )
        );
        assetUrls.screenshotUrls = screenshotUploads.map(upload => upload.url);
      }

      const completeMetadata = { ...metadata, ...assetUrls };
      context.metadata = completeMetadata;

      return { status: 'android-metadata-prepared', metadata: completeMetadata };

    } catch (error) {
      throw new Error(`Android metadata setup failed: ${error.message}`);
    }
  }

  /**
   * Handle keystore setup step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleKeystoreSetup(context, dependencies) {
    try {
      const { submissionData } = context;

      let keystoreConfig;

      if (submissionData.keystore && submissionData.keystore.file) {
        // Upload custom keystore
        const keystoreUpload = await dependencies.fileUploadApiService.uploadFile({
          file: submissionData.keystore.file,
          type: 'keystore',
          platform: 'android'
        });

        keystoreConfig = {
          type: 'custom',
          keystoreUrl: keystoreUpload.url,
          keystorePassword: submissionData.keystore.keystorePassword,
          keyAlias: submissionData.keystore.keyAlias,
          keyPassword: submissionData.keystore.keyPassword,
          uploaded: true
        };

      } else {
        // Generate new keystore
        keystoreConfig = {
          type: 'generated',
          keyAlias: `${context.packageName.replace(/\./g, '_')}_key`,
          organizationName: submissionData.organizationName || context.appName,
          organizationUnit: submissionData.organizationUnit || 'Mobile App',
          locality: submissionData.locality || 'Unknown',
          state: submissionData.state || 'Unknown',
          country: submissionData.country || 'US',
          validityYears: 25
        };
      }

      context.keystoreConfig = keystoreConfig;

      return { status: 'keystore-configured', config: keystoreConfig };

    } catch (error) {
      throw new Error(`Keystore setup failed: ${error.message}`);
    }
  }

  /**
   * Handle Android push notification setup step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleAndroidPushNotificationSetup(context, dependencies) {
    try {
      const { submissionData } = context;

      if (!submissionData.pushNotifications || !submissionData.pushNotifications.enabled) {
        return { status: 'push-notifications-disabled' };
      }

      const pushConfig = {
        platform: 'android',
        packageName: context.packageName,
        firebaseConfig: submissionData.pushNotifications.firebaseConfig || null,
        fcmServerKey: submissionData.pushNotifications.fcmServerKey || null,
        googleServicesJson: submissionData.pushNotifications.googleServicesJson || null
      };

      // Upload google-services.json if provided
      if (pushConfig.googleServicesJson) {
        const servicesUpload = await dependencies.fileUploadApiService.uploadFile({
          file: pushConfig.googleServicesJson,
          type: 'google-services-json',
          platform: 'android'
        });
        pushConfig.googleServicesJsonUrl = servicesUpload.url;
      }

      const result = await dependencies.pushNotificationApiService.configurePushNotifications(pushConfig);

      context.pushNotificationConfig = result;

      return { status: 'android-push-notifications-configured', config: result };

    } catch (error) {
      // Push notifications are optional, so we log but don't fail
      console.warn('Android push notification setup failed:', error.message);
      return { status: 'push-notifications-failed', error: error.message };
    }
  }

  /**
   * Handle submission finalization step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleSubmissionFinalization(context, dependencies) {
    try {
      const { playStoreConfig, metadata, keystoreConfig, initializationData } = context;

      const finalSubmissionConfig = {
        platform: 'android',
        packageName: playStoreConfig.packageName,
        versionName: playStoreConfig.versionName,
        versionCode: playStoreConfig.versionCode,
        metadata: metadata,
        playStoreConfig: playStoreConfig,
        keystoreConfig: keystoreConfig,
        buildConfig: {
          minSdkVersion: this.ANDROID_CONFIG.MIN_SDK_VERSION,
          targetSdkVersion: this.ANDROID_CONFIG.TARGET_SDK_VERSION,
          compileSdkVersion: this.ANDROID_CONFIG.COMPILE_SDK_VERSION,
          architectures: this.ANDROID_CONFIG.SUPPORTED_ARCHITECTURES
        },
        initializationData: initializationData
      };

      // Add push notification config if available
      if (context.pushNotificationConfig) {
        finalSubmissionConfig.pushNotificationConfig = context.pushNotificationConfig;
      }

      const submission = await dependencies.submissionApiService.initializeSubmission(finalSubmissionConfig);

      context.submissionId = submission.id;
      context.submission = submission;

      return { status: 'android-submission-finalized', submission: submission };

    } catch (error) {
      throw new Error(`Submission finalization failed: ${error.message}`);
    }
  }

  /**
   * Handle Android build start step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleAndroidBuildStart(context, dependencies) {
    try {
      const { submissionId } = context;

      const buildResult = await dependencies.submissionApiService.startBuild({
        submissionId: submissionId,
        platform: 'android'
      });

      context.buildId = buildResult.buildId;
      context.buildStatus = this.BUILD_STATUS.RUNNING;

      // Start monitoring build progress
      this.monitorAndroidBuildProgress(submissionId, buildResult.buildId, dependencies);

      return { status: 'android-build-started', buildId: buildResult.buildId };

    } catch (error) {
      throw new Error(`Android build start failed: ${error.message}`);
    }
  }

  /**
   * Monitor Android build progress
   * @param {string} submissionId - Submission ID
   * @param {string} buildId - Build ID
   * @param {Object} dependencies - Injected dependencies
   */
  async monitorAndroidBuildProgress(submissionId, buildId, dependencies) {
    const checkInterval = 30000; // 30 seconds
    const maxChecks = 120; // 60 minutes max
    let checks = 0;

    const checkBuildStatus = async () => {
      try {
        checks++;

        const build = await dependencies.submissionApiService.getBuild({ buildId });

        this.emit('android-build-progress', {
          submissionId,
          buildId,
          status: build.status,
          progress: build.progress || 0,
          logs: build.logs || [],
          artifacts: build.artifacts || []
        });

        if (build.status === 'completed') {
          this.emit('android-build-completed', { submissionId, buildId, build });
          return;
        }

        if (build.status === 'failed') {
          this.emit('android-build-failed', { submissionId, buildId, error: build.error });
          return;
        }

        if (checks < maxChecks) {
          setTimeout(checkBuildStatus, checkInterval);
        } else {
          this.emit('android-build-timeout', { submissionId, buildId });
        }

      } catch (error) {
        this.emit('android-build-monitoring-error', { submissionId, buildId, error: error.message });
      }
    };

    setTimeout(checkBuildStatus, checkInterval);
  }

  /**
   * Validate Android submission data
   * @param {Object} submissionData - Submission data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateAndroidSubmissionData(submissionData) {
    const rules = [
      { field: 'appName', required: true, type: 'string', minLength: 1 },
      { field: 'packageName', required: true, type: 'string', pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/ },
      { field: 'playStoreServiceAccount', required: true, type: 'string', minLength: 1 },
      { field: 'versionName', required: false, type: 'string', pattern: /^\d+\.\d+(\.\d+)?$/ },
      { field: 'versionCode', required: false, type: 'string', pattern: /^\d+$/ }
    ];

    return await this.dependencies.validationEngine.validateData(submissionData, rules);
  }

  /**
   * Validate Play Store configuration
   * @param {Object} playStoreConfig - Play Store configuration to validate
   * @returns {Promise<Object>} Validation result
   */
  async validatePlayStoreConfig(playStoreConfig) {
    const rules = [
      { field: 'appName', required: true, type: 'string', minLength: 1, maxLength: 50 },
      { field: 'versionName', required: true, type: 'string', pattern: /^\d+\.\d+(\.\d+)?$/ },
      { field: 'versionCode', required: true, type: 'number', min: 1 },
      { field: 'category', required: true, type: 'string' },
      { field: 'contentRating', required: true, type: 'string' },
      { field: 'releaseTrack', required: true, type: 'string' }
    ];

    return await this.dependencies.validationEngine.validateData(playStoreConfig, rules);
  }

  /**
   * Validate Google Play Console access
   * @param {string} serviceAccount - Service account information
   * @returns {Promise<Object>} Validation result
   */
  async validatePlayConsoleAccess(serviceAccount) {
    try {
      // In a real implementation, this would validate the service account
      // For now, we'll do basic validation
      if (!serviceAccount || typeof serviceAccount !== 'string') {
        return { isValid: false, error: 'Service account is required' };
      }

      // Mock validation - in reality this would test API access
      return { isValid: true };

    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Check if app already exists in Play Console
   * @param {string} packageName - App package name
   * @param {string} serviceAccount - Service account information
   * @returns {Promise<Object>} Check result
   */
  async checkExistingApp(packageName, serviceAccount) {
    try {
      // Mock implementation - in reality this would check Play Console API
      return {
        exists: false,
        appId: null
      };

    } catch (error) {
      return {
        exists: false,
        appId: null,
        error: error.message
      };
    }
  }

  /**
   * Get workflow progress
   * @param {string} workflowId - Workflow ID
   * @returns {Object|null} Workflow progress information
   */
  getWorkflowProgress(workflowId) {
    const workflow = this.dependencies.workflowManager.getWorkflowStatus(workflowId);
    if (!workflow) {
      return null;
    }

    const totalSteps = workflow.steps.length;
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    return {
      workflowId,
      platform: 'android',
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps,
      completedSteps,
      progress,
      steps: workflow.steps.map(step => ({
        name: step.name,
        description: step.description,
        status: step.status,
        error: step.error
      }))
    };
  }

  /**
   * Cancel Android publishing workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Cancellation reason
   */
  async cancelWorkflow(workflowId, reason = 'User cancelled') {
    await this.dependencies.workflowManager.cancelWorkflow(workflowId, reason);
    this.emit('android-workflow-cancelled', { workflowId, reason });
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.AndroidPublishingController = AndroidPublishingController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AndroidPublishingController;
}