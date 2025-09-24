/**
 * IOSPublishingController - iOS-specific publishing workflow controller
 *
 * Manages the complete iOS publishing workflow:
 * API key → bundle ID → certificate → store config → metadata → push → build
 *
 * @class IOSPublishingController
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

class IOSPublishingController extends BaseMiddlewareClass {
  /**
   * Creates an instance of IOSPublishingController
   * @param {Object} dependencies - Injected dependencies
   * @param {WorkflowManager} dependencies.workflowManager - Workflow management service
   * @param {ApiKeyService} dependencies.apiKeyService - API key management service
   * @param {CertificateApiService} dependencies.certificateApiService - Certificate management service
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

    // iOS workflow steps
    this.IOS_WORKFLOW_STEPS = [
      {
        name: 'validate-initial-data',
        description: 'Validate initial submission data',
        action: 'validate-data',
        params: {
          rules: ['appName', 'bundleId', 'appStoreTeamId']
        },
        required: true
      },
      {
        name: 'setup-api-key',
        description: 'Setup or validate iOS API key',
        handler: this.handleApiKeySetup.bind(this),
        prerequisites: [
          { type: 'context', path: 'appStoreTeamId' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'configure-bundle-id',
        description: 'Configure bundle ID with capabilities',
        handler: this.handleBundleIdConfiguration.bind(this),
        prerequisites: [
          { type: 'step', step: 'setup-api-key' },
          { type: 'context', path: 'bundleId' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'generate-certificate',
        description: 'Generate and configure iOS certificates',
        handler: this.handleCertificateGeneration.bind(this),
        prerequisites: [
          { type: 'step', step: 'configure-bundle-id' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'configure-store-settings',
        description: 'Configure App Store settings',
        handler: this.handleStoreConfiguration.bind(this),
        prerequisites: [
          { type: 'step', step: 'setup-api-key' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'setup-metadata',
        description: 'Setup app metadata and assets',
        handler: this.handleMetadataSetup.bind(this),
        prerequisites: [
          { type: 'step', step: 'configure-store-settings' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'configure-push-notifications',
        description: 'Configure push notification settings',
        handler: this.handlePushNotificationSetup.bind(this),
        prerequisites: [
          { type: 'step', step: 'generate-certificate' }
        ],
        required: false,
        optional: true,
        retryable: true
      },
      {
        name: 'initialize-submission',
        description: 'Initialize iOS submission process',
        handler: this.handleSubmissionInitialization.bind(this),
        prerequisites: [
          { type: 'step', step: 'setup-metadata' },
          { type: 'step', step: 'generate-certificate' }
        ],
        required: true,
        retryable: true
      },
      {
        name: 'start-build',
        description: 'Start iOS build process',
        handler: this.handleBuildStart.bind(this),
        prerequisites: [
          { type: 'step', step: 'initialize-submission' }
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
  }

  /**
   * Get required dependencies
   * @returns {string[]} Array of required dependency names
   */
  getRequiredDependencies() {
    return [
      'workflowManager',
      'apiKeyService',
      'certificateApiService',
      'submissionApiService',
      'pushNotificationApiService',
      'fileUploadApiService',
      'stateManager',
      'validationEngine',
      'errorHandler'
    ];
  }

  /**
   * Initialize the iOS publishing controller
   * @returns {Promise<void>}
   */
  async setup() {
    // Register iOS workflow with WorkflowManager
    this.dependencies.workflowManager.registerWorkflow(
      'ios-publishing',
      this.IOS_WORKFLOW_STEPS,
      {
        allowParallel: false,
        maxRetries: 3,
        timeout: 60000
      }
    );

    this.emit('ios-controller-initialized');
  }

  /**
   * Start iOS publishing workflow
   * @param {Object} submissionData - Initial submission data
   * @returns {Promise<string>} Workflow ID
   */
  async startIOSPublishing(submissionData) {
    try {
      // Validate submission data
      const validation = await this.validateSubmissionData(submissionData);
      if (!validation.isValid) {
        throw new Error(`Invalid submission data: ${validation.errors.join(', ')}`);
      }

      // Start workflow
      const workflowId = await this.dependencies.workflowManager.startWorkflow(
        'ios-publishing',
        {
          platform: 'ios',
          submissionData: submissionData,
          appName: submissionData.appName,
          bundleId: submissionData.bundleId,
          appStoreTeamId: submissionData.appStoreTeamId,
          startTime: new Date().toISOString()
        }
      );

      this.emit('ios-publishing-started', { workflowId, submissionData });
      return workflowId;

    } catch (error) {
      const errorDetails = this.dependencies.errorHandler.handleError(error, 'IOSPublishingController.startIOSPublishing');
      this.emit('ios-publishing-error', { submissionData, error: errorDetails });
      throw error;
    }
  }

  /**
   * Handle API key setup step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleApiKeySetup(context, dependencies) {
    try {
      const { appStoreTeamId } = context;

      // Check if API key already exists
      const existingKeys = await dependencies.apiKeyService.listApiKeys();
      const existingKey = existingKeys.find(key =>
        key.teamId === appStoreTeamId && key.status === 'active'
      );

      if (existingKey) {
        // Validate existing key
        const validation = await dependencies.apiKeyService.validateApiKey(existingKey.id);
        if (validation.isValid) {
          context.apiKeyId = existingKey.id;
          context.apiKey = existingKey;
          return { status: 'existing-key-validated', apiKey: existingKey };
        }
      }

      // Create new API key
      const newApiKey = await dependencies.apiKeyService.createApiKey({
        name: `iOS Publishing Key - ${context.appName}`,
        teamId: appStoreTeamId,
        scopes: ['app-store-connect', 'developer-portal']
      });

      context.apiKeyId = newApiKey.id;
      context.apiKey = newApiKey;

      return { status: 'new-key-created', apiKey: newApiKey };

    } catch (error) {
      throw new Error(`API key setup failed: ${error.message}`);
    }
  }

  /**
   * Handle bundle ID configuration step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleBundleIdConfiguration(context, dependencies) {
    try {
      const { bundleId, apiKeyId } = context;

      // Check if bundle ID exists
      const bundleIds = await dependencies.certificateApiService.getBundleIds();
      const existingBundle = bundleIds.find(bundle => bundle.identifier === bundleId);

      if (existingBundle) {
        context.bundleIdConfig = existingBundle;
        return { status: 'existing-bundle-found', bundleId: existingBundle };
      }

      // Create new bundle ID with capabilities
      const capabilities = [
        'PUSH_NOTIFICATIONS',
        'APP_GROUPS',
        'ASSOCIATED_DOMAINS'
      ];

      const newBundle = await dependencies.certificateApiService.createBundleId({
        identifier: bundleId,
        name: context.appName,
        capabilities: capabilities
      });

      context.bundleIdConfig = newBundle;

      return { status: 'new-bundle-created', bundleId: newBundle };

    } catch (error) {
      throw new Error(`Bundle ID configuration failed: ${error.message}`);
    }
  }

  /**
   * Handle certificate generation step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleCertificateGeneration(context, dependencies) {
    try {
      const { bundleId, apiKeyId } = context;

      // Check existing certificates
      const existingCertificates = await dependencies.certificateApiService.checkCertificates({
        bundleId: bundleId,
        type: 'distribution'
      });

      const validCert = existingCertificates.find(cert =>
        cert.status === 'active' && new Date(cert.expiryDate) > new Date()
      );

      if (validCert) {
        context.certificate = validCert;
        return { status: 'existing-certificate-valid', certificate: validCert };
      }

      // Generate new certificate
      const newCertificate = await dependencies.certificateApiService.generateCertificate({
        bundleId: bundleId,
        type: 'distribution',
        name: `Distribution Certificate - ${context.appName}`
      });

      context.certificate = newCertificate;

      return { status: 'new-certificate-generated', certificate: newCertificate };

    } catch (error) {
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }

  /**
   * Handle store configuration step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleStoreConfiguration(context, dependencies) {
    try {
      const { submissionData } = context;

      // Prepare store configuration
      const storeConfig = {
        appName: submissionData.appName,
        bundleId: submissionData.bundleId,
        version: submissionData.version || '1.0.0',
        buildNumber: submissionData.buildNumber || '1',
        category: submissionData.category || 'PRODUCTIVITY',
        contentRating: submissionData.contentRating || '4_PLUS',
        copyright: submissionData.copyright || `© ${new Date().getFullYear()} ${submissionData.appName}`,
        releaseType: submissionData.releaseType || 'MANUAL',
        priceTier: submissionData.priceTier || 'FREE'
      };

      // Validate store configuration
      const validation = await this.validateStoreConfig(storeConfig);
      if (!validation.isValid) {
        throw new Error(`Invalid store configuration: ${validation.errors.join(', ')}`);
      }

      context.storeConfig = storeConfig;

      return { status: 'store-config-prepared', config: storeConfig };

    } catch (error) {
      throw new Error(`Store configuration failed: ${error.message}`);
    }
  }

  /**
   * Handle metadata setup step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleMetadataSetup(context, dependencies) {
    try {
      const { submissionData, storeConfig } = context;

      // Prepare metadata
      const metadata = {
        name: storeConfig.appName,
        subtitle: submissionData.subtitle || '',
        description: submissionData.description || '',
        keywords: submissionData.keywords || [],
        supportUrl: submissionData.supportUrl || '',
        marketingUrl: submissionData.marketingUrl || '',
        privacyPolicyUrl: submissionData.privacyPolicyUrl || '',
        releaseNotes: submissionData.releaseNotes || ''
      };

      // Handle app icons and screenshots
      const assets = {
        appIcon: submissionData.appIcon,
        screenshots: submissionData.screenshots || []
      };

      // Upload assets if provided
      if (assets.appIcon) {
        const iconUpload = await dependencies.fileUploadApiService.uploadFile({
          file: assets.appIcon,
          type: 'app-icon',
          platform: 'ios'
        });
        metadata.appIconUrl = iconUpload.url;
      }

      if (assets.screenshots.length > 0) {
        const screenshotUploads = await Promise.all(
          assets.screenshots.map(screenshot =>
            dependencies.fileUploadApiService.uploadFile({
              file: screenshot,
              type: 'screenshot',
              platform: 'ios'
            })
          )
        );
        metadata.screenshotUrls = screenshotUploads.map(upload => upload.url);
      }

      context.metadata = metadata;

      return { status: 'metadata-prepared', metadata: metadata };

    } catch (error) {
      throw new Error(`Metadata setup failed: ${error.message}`);
    }
  }

  /**
   * Handle push notification setup step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handlePushNotificationSetup(context, dependencies) {
    try {
      const { submissionData, bundleId, certificate } = context;

      if (!submissionData.pushNotifications || !submissionData.pushNotifications.enabled) {
        return { status: 'push-notifications-disabled' };
      }

      const pushConfig = {
        platform: 'ios',
        bundleId: bundleId,
        certificate: certificate,
        environment: submissionData.pushNotifications.environment || 'production',
        topic: bundleId
      };

      const result = await dependencies.pushNotificationApiService.configurePushNotifications(pushConfig);

      context.pushNotificationConfig = result;

      return { status: 'push-notifications-configured', config: result };

    } catch (error) {
      // Push notifications are optional, so we log but don't fail
      console.warn('Push notification setup failed:', error.message);
      return { status: 'push-notifications-failed', error: error.message };
    }
  }

  /**
   * Handle submission initialization step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleSubmissionInitialization(context, dependencies) {
    try {
      const { storeConfig, metadata, certificate, apiKeyId } = context;

      const submissionConfig = {
        platform: 'ios',
        appId: storeConfig.bundleId,
        version: storeConfig.version,
        buildNumber: storeConfig.buildNumber,
        metadata: metadata,
        certificate: certificate,
        apiKeyId: apiKeyId,
        storeConfig: storeConfig
      };

      const submission = await dependencies.submissionApiService.initializeSubmission(submissionConfig);

      context.submissionId = submission.id;
      context.submission = submission;

      return { status: 'submission-initialized', submission: submission };

    } catch (error) {
      throw new Error(`Submission initialization failed: ${error.message}`);
    }
  }

  /**
   * Handle build start step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async handleBuildStart(context, dependencies) {
    try {
      const { submissionId } = context;

      const buildResult = await dependencies.submissionApiService.startBuild({
        submissionId: submissionId,
        platform: 'ios'
      });

      context.buildId = buildResult.buildId;
      context.buildStatus = this.BUILD_STATUS.RUNNING;

      // Start monitoring build progress
      this.monitorBuildProgress(submissionId, buildResult.buildId, dependencies);

      return { status: 'build-started', buildId: buildResult.buildId };

    } catch (error) {
      throw new Error(`Build start failed: ${error.message}`);
    }
  }

  /**
   * Monitor build progress
   * @param {string} submissionId - Submission ID
   * @param {string} buildId - Build ID
   * @param {Object} dependencies - Injected dependencies
   */
  async monitorBuildProgress(submissionId, buildId, dependencies) {
    const checkInterval = 30000; // 30 seconds
    const maxChecks = 120; // 60 minutes max
    let checks = 0;

    const checkBuildStatus = async () => {
      try {
        checks++;

        const build = await dependencies.submissionApiService.getBuild({ buildId });

        this.emit('build-progress', {
          submissionId,
          buildId,
          status: build.status,
          progress: build.progress || 0,
          logs: build.logs || []
        });

        if (build.status === 'completed') {
          this.emit('build-completed', { submissionId, buildId, build });
          return;
        }

        if (build.status === 'failed') {
          this.emit('build-failed', { submissionId, buildId, error: build.error });
          return;
        }

        if (checks < maxChecks) {
          setTimeout(checkBuildStatus, checkInterval);
        } else {
          this.emit('build-timeout', { submissionId, buildId });
        }

      } catch (error) {
        this.emit('build-monitoring-error', { submissionId, buildId, error: error.message });
      }
    };

    setTimeout(checkBuildStatus, checkInterval);
  }

  /**
   * Validate submission data
   * @param {Object} submissionData - Submission data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateSubmissionData(submissionData) {
    const rules = [
      { field: 'appName', required: true, type: 'string', minLength: 1 },
      { field: 'bundleId', required: true, type: 'string', pattern: /^[a-zA-Z0-9.-]+$/ },
      { field: 'appStoreTeamId', required: true, type: 'string', minLength: 1 },
      { field: 'version', required: false, type: 'string', pattern: /^\d+\.\d+(\.\d+)?$/ },
      { field: 'buildNumber', required: false, type: 'string', pattern: /^\d+$/ }
    ];

    return await this.dependencies.validationEngine.validateData(submissionData, rules);
  }

  /**
   * Validate store configuration
   * @param {Object} storeConfig - Store configuration to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateStoreConfig(storeConfig) {
    const rules = [
      { field: 'appName', required: true, type: 'string', minLength: 1, maxLength: 30 },
      { field: 'version', required: true, type: 'string', pattern: /^\d+\.\d+(\.\d+)?$/ },
      { field: 'buildNumber', required: true, type: 'string', pattern: /^\d+$/ },
      { field: 'category', required: true, type: 'string' },
      { field: 'contentRating', required: true, type: 'string' }
    ];

    return await this.dependencies.validationEngine.validateData(storeConfig, rules);
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
      platform: 'ios',
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
   * Cancel iOS publishing workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Cancellation reason
   */
  async cancelWorkflow(workflowId, reason = 'User cancelled') {
    await this.dependencies.workflowManager.cancelWorkflow(workflowId, reason);
    this.emit('ios-workflow-cancelled', { workflowId, reason });
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.IOSPublishingController = IOSPublishingController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IOSPublishingController;
}