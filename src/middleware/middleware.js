/**
 * Publishing Dashboard Middleware - Main Entry Point
 *
 * Central initialization and dependency injection setup for the complete
 * publishing middleware system including workflows, API services, and configuration.
 */

// Import configuration modules
const endpointsConfig = require('./config/endpoints');
const validationRulesConfig = require('./config/validation-rules');
const errorMessagesConfig = require('./config/error-messages');
const workflowsConfig = require('./config/workflows');

// Import core modules
const BaseMiddleware = require('./core/BaseMiddleware');
const StateManager = require('./core/StateManager');
const ValidationEngine = require('./core/ValidationEngine');
const ErrorHandler = require('./core/ErrorHandler');
const DataMapper = require('./core/DataMapper');

// Import API services
const ApiClient = require('./api/ApiClient');
const SubmissionApiService = require('./api/SubmissionApiService');
const ApiKeyService = require('./api/ApiKeyService');
const CertificateApiService = require('./api/CertificateApiService');
const PushNotificationApiService = require('./api/PushNotificationApiService');
const FileUploadApiService = require('./api/FileUploadApiService');

// Import controllers
const WorkflowManager = require('./controllers/WorkflowManager');
const IOSPublishingController = require('./controllers/IOSPublishingController');
const AndroidPublishingController = require('./controllers/AndroidPublishingController');
const PermissionController = require('./controllers/PermissionController');

/**
 * Default configuration for middleware initialization
 */
const DEFAULT_CONFIG = {
  environment: 'production',
  apiUrl: null, // Will use environment-specific URL from endpoints config
  authToken: null,
  storagePrefix: 'fliplet-publishing-',
  enablePersistence: true,
  enableLogging: true,
  logLevel: 'info',
  retryAttempts: 3,
  requestTimeout: 30000,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedPlatforms: ['ios', 'android']
};

/**
 * Publishing Dashboard Middleware Class
 *
 * Main middleware class that orchestrates all components and provides
 * a unified interface for publishing dashboard operations.
 */
class PublishingMiddleware extends BaseMiddleware {
  constructor(config = {}) {
    super({}, { ...DEFAULT_CONFIG, ...config });

    // Initialize state
    this.isInitialized = false;
    this.components = {};
    this.services = {};
    this.controllers = {};

    // Bind public methods
    this.initialize = this.initialize.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.getService = this.getService.bind(this);
    this.getController = this.getController.bind(this);
    this.startWorkflow = this.startWorkflow.bind(this);
    this.getWorkflowStatus = this.getWorkflowStatus.bind(this);
    this.cancelWorkflow = this.cancelWorkflow.bind(this);
  }

  /**
   * Initialize the middleware system
   * @param {Object} options - Initialization options
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.warn('PublishingMiddleware already initialized');
      return;
    }

    try {
      // Merge options with configuration
      const initConfig = { ...this.config, ...options };

      // Initialize core components
      await this.initializeCoreComponents(initConfig);

      // Initialize API services
      await this.initializeApiServices(initConfig);

      // Initialize workflow controllers
      await this.initializeControllers(initConfig);

      // Setup event listeners
      this.setupGlobalEventListeners();

      // Set initialization flag
      this.isInitialized = true;

      // Emit initialization complete event
      this.emit('middleware-initialized', {
        timestamp: new Date().toISOString(),
        config: this.getSafeConfig(),
        components: Object.keys(this.components),
        services: Object.keys(this.services),
        controllers: Object.keys(this.controllers)
      });

      if (initConfig.enableLogging) {
        console.log('📱 Publishing Dashboard Middleware initialized successfully');
      }

    } catch (error) {
      const errorDetails = {
        message: error.message,
        timestamp: new Date().toISOString(),
        phase: 'initialization'
      };

      this.emit('initialization-error', errorDetails);

      if (this.config.enableLogging) {
        console.error('❌ Failed to initialize Publishing Dashboard Middleware:', error);
      }

      throw error;
    }
  }

  /**
   * Initialize core middleware components
   * @param {Object} config - Configuration object
   * @returns {Promise<void>}
   */
  async initializeCoreComponents(config) {
    // Initialize StateManager with persistence
    this.components.stateManager = new StateManager(
      {},
      {
        storagePrefix: config.storagePrefix,
        enablePersistence: config.enablePersistence,
        environment: config.environment
      }
    );

    // Initialize ValidationEngine with rules
    this.components.validationEngine = new ValidationEngine(
      { stateManager: this.components.stateManager },
      {
        validationRules: validationRulesConfig.VALIDATION_RULES,
        platformRules: validationRulesConfig.PLATFORM_RULES,
        businessRules: validationRulesConfig.BUSINESS_RULES
      }
    );

    // Initialize ErrorHandler with message mappings
    this.components.errorHandler = new ErrorHandler(
      {},
      {
        errorMessages: errorMessagesConfig.ERROR_MESSAGES,
        enableLogging: config.enableLogging,
        logLevel: config.logLevel
      }
    );

    // Initialize DataMapper
    this.components.dataMapper = new DataMapper(
      {
        stateManager: this.components.stateManager,
        validationEngine: this.components.validationEngine,
        errorHandler: this.components.errorHandler
      },
      {}
    );

    // Initialize all core components
    await Promise.all([
      this.components.stateManager.initialize(),
      this.components.validationEngine.initialize(),
      this.components.errorHandler.initialize(),
      this.components.dataMapper.initialize()
    ]);
  }

  /**
   * Initialize API services
   * @param {Object} config - Configuration object
   * @returns {Promise<void>}
   */
  async initializeApiServices(config) {
    // Initialize base API client
    this.services.apiClient = new ApiClient(
      {
        stateManager: this.components.stateManager,
        errorHandler: this.components.errorHandler
      },
      {
        baseUrl: config.apiUrl || this.getEnvironmentBaseUrl(config.environment),
        authToken: config.authToken,
        timeout: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        enableLogging: config.enableLogging,
        endpoints: endpointsConfig.ENDPOINTS
      }
    );

    // Initialize specialized API services
    const apiServiceDependencies = {
      apiClient: this.services.apiClient,
      stateManager: this.components.stateManager,
      errorHandler: this.components.errorHandler
    };

    this.services.submissionApiService = new SubmissionApiService(apiServiceDependencies);
    this.services.apiKeyService = new ApiKeyService(apiServiceDependencies);
    this.services.certificateApiService = new CertificateApiService(apiServiceDependencies);
    this.services.pushNotificationApiService = new PushNotificationApiService(apiServiceDependencies);

    this.services.fileUploadApiService = new FileUploadApiService(
      apiServiceDependencies,
      {
        maxFileSize: config.maxFileSize,
        supportedTypes: ['image/png', 'image/jpeg', 'application/json', 'application/x-java-keystore']
      }
    );

    // Initialize all API services
    await Promise.all([
      this.services.apiClient.initialize(),
      this.services.submissionApiService.initialize(),
      this.services.apiKeyService.initialize(),
      this.services.certificateApiService.initialize(),
      this.services.pushNotificationApiService.initialize(),
      this.services.fileUploadApiService.initialize()
    ]);
  }

  /**
   * Initialize workflow controllers
   * @param {Object} config - Configuration object
   * @returns {Promise<void>}
   */
  async initializeControllers(config) {
    // Initialize WorkflowManager
    this.controllers.workflowManager = new WorkflowManager(
      {
        stateManager: this.components.stateManager,
        validationEngine: this.components.validationEngine,
        errorHandler: this.components.errorHandler
      },
      {
        workflows: workflowsConfig.WORKFLOWS,
        enableLogging: config.enableLogging
      }
    );

    // Initialize publishing controllers
    const publishingControllerDependencies = {
      workflowManager: this.controllers.workflowManager,
      stateManager: this.components.stateManager,
      validationEngine: this.components.validationEngine,
      errorHandler: this.components.errorHandler,
      ...this.services
    };

    this.controllers.iosPublishingController = new IOSPublishingController(
      publishingControllerDependencies,
      { supportedPlatforms: config.supportedPlatforms }
    );

    this.controllers.androidPublishingController = new AndroidPublishingController(
      publishingControllerDependencies,
      { supportedPlatforms: config.supportedPlatforms }
    );

    // Initialize PermissionController
    this.controllers.permissionController = new PermissionController(
      {
        workflowManager: this.controllers.workflowManager,
        apiClient: this.services.apiClient,
        stateManager: this.components.stateManager,
        validationEngine: this.components.validationEngine,
        errorHandler: this.components.errorHandler
      },
      { supportedPlatforms: config.supportedPlatforms }
    );

    // Initialize all controllers
    await Promise.all([
      this.controllers.workflowManager.initialize(),
      this.controllers.iosPublishingController.initialize(),
      this.controllers.androidPublishingController.initialize(),
      this.controllers.permissionController.initialize()
    ]);
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Listen for workflow events
    if (this.controllers.workflowManager) {
      this.controllers.workflowManager.on('workflow-started', (data) => {
        this.emit('workflow-started', data);
      });

      this.controllers.workflowManager.on('workflow-completed', (data) => {
        this.emit('workflow-completed', data);
      });

      this.controllers.workflowManager.on('workflow-failed', (data) => {
        this.emit('workflow-failed', data);
      });

      this.controllers.workflowManager.on('step-completed', (data) => {
        this.emit('step-completed', data);
      });
    }

    // Listen for build progress events
    ['ios', 'android'].forEach(platform => {
      const controller = this.controllers[`${platform}PublishingController`];
      if (controller) {
        controller.on(`${platform}-build-progress`, (data) => {
          this.emit('build-progress', { ...data, platform });
        });

        controller.on(`${platform}-build-completed`, (data) => {
          this.emit('build-completed', { ...data, platform });
        });

        controller.on(`${platform}-build-failed`, (data) => {
          this.emit('build-failed', { ...data, platform });
        });
      }
    });

    // Listen for permission events
    if (this.controllers.permissionController) {
      this.controllers.permissionController.on('permissions-applied', (data) => {
        this.emit('permissions-updated', data);
      });
    }

    // Listen for API errors
    if (this.services.apiClient) {
      this.services.apiClient.on('api-error', (data) => {
        this.emit('api-error', data);
      });
    }
  }

  /**
   * Get environment-specific base URL
   * @param {string} environment - Environment name
   * @returns {string} Base URL
   */
  getEnvironmentBaseUrl(environment) {
    const baseUrls = endpointsConfig.BASE_URLS[environment] || endpointsConfig.BASE_URLS.production;
    return baseUrls.api;
  }

  /**
   * Get safe configuration (without sensitive data)
   * @returns {Object} Safe configuration object
   */
  getSafeConfig() {
    const safeConfig = { ...this.config };
    delete safeConfig.authToken;
    return safeConfig;
  }

  /**
   * Start a publishing workflow
   * @param {string} platform - Target platform ('ios' or 'android')
   * @param {Object} submissionData - Submission data
   * @returns {Promise<string>} Workflow ID
   */
  async startWorkflow(platform, submissionData) {
    this.ensureInitialized();

    const controller = this.controllers[`${platform}PublishingController`];
    if (!controller) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const methodName = `start${platform.charAt(0).toUpperCase() + platform.slice(1)}Publishing`;
    return await controller[methodName](submissionData);
  }

  /**
   * Start permission management workflow
   * @param {string} appId - Application ID
   * @param {string} platform - Target platform
   * @param {Object} permissions - Permission configuration
   * @returns {Promise<string>} Workflow ID
   */
  async startPermissionWorkflow(appId, platform, permissions) {
    this.ensureInitialized();

    return await this.controllers.permissionController.updateAppPermissions(appId, platform, permissions);
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow ID
   * @returns {Object|null} Workflow status
   */
  getWorkflowStatus(workflowId) {
    this.ensureInitialized();

    return this.controllers.workflowManager.getWorkflowStatus(workflowId);
  }

  /**
   * Cancel a running workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<void>}
   */
  async cancelWorkflow(workflowId, reason = 'User cancelled') {
    this.ensureInitialized();

    return await this.controllers.workflowManager.cancelWorkflow(workflowId, reason);
  }

  /**
   * Get app permissions
   * @param {string} appId - Application ID
   * @param {string} platform - Target platform
   * @returns {Promise<Object>} App permissions
   */
  async getAppPermissions(appId, platform) {
    this.ensureInitialized();

    return await this.controllers.permissionController.getAppPermissions(appId, platform);
  }

  /**
   * Validate submission data
   * @param {Object} data - Data to validate
   * @param {string} platform - Target platform
   * @returns {Promise<Object>} Validation result
   */
  async validateSubmissionData(data, platform) {
    this.ensureInitialized();

    const requiredFields = validationRulesConfig.getRequiredFields(platform);
    return await this.components.validationEngine.validateData(data, requiredFields);
  }

  /**
   * Get component by name
   * @param {string} name - Component name
   * @returns {Object|null} Component instance
   */
  getComponent(name) {
    return this.components[name] || null;
  }

  /**
   * Get service by name
   * @param {string} name - Service name
   * @returns {Object|null} Service instance
   */
  getService(name) {
    return this.services[name] || null;
  }

  /**
   * Get controller by name
   * @param {string} name - Controller name
   * @returns {Object|null} Controller instance
   */
  getController(name) {
    return this.controllers[name] || null;
  }

  /**
   * Get available endpoints
   * @returns {Object} Endpoint configuration
   */
  getEndpoints() {
    return endpointsConfig.getAllEndpoints();
  }

  /**
   * Get validation rules for platform
   * @param {string} platform - Target platform
   * @returns {Object} Validation rules
   */
  getValidationRules(platform) {
    return {
      required: validationRulesConfig.getRequiredFields(platform),
      optional: validationRulesConfig.getOptionalFields(platform),
      rules: validationRulesConfig.VALIDATION_RULES
    };
  }

  /**
   * Get workflow definitions
   * @param {string} platform - Optional platform filter
   * @returns {Object} Workflow definitions
   */
  getWorkflows(platform = null) {
    return platform
      ? workflowsConfig.getWorkflowsByPlatform(platform)
      : workflowsConfig.getAllWorkflows();
  }

  /**
   * Cleanup middleware resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Cleanup controllers
      await Promise.all(
        Object.values(this.controllers).map(controller =>
          controller.cleanup ? controller.cleanup() : Promise.resolve()
        )
      );

      // Cleanup services
      await Promise.all(
        Object.values(this.services).map(service =>
          service.cleanup ? service.cleanup() : Promise.resolve()
        )
      );

      // Cleanup components
      await Promise.all(
        Object.values(this.components).map(component =>
          component.cleanup ? component.cleanup() : Promise.resolve()
        )
      );

      // Clear references
      this.components = {};
      this.services = {};
      this.controllers = {};
      this.isInitialized = false;

      this.emit('middleware-cleanup-complete');

      if (this.config.enableLogging) {
        console.log('📱 Publishing Dashboard Middleware cleanup completed');
      }

    } catch (error) {
      this.emit('cleanup-error', { error: error.message });

      if (this.config.enableLogging) {
        console.error('❌ Error during middleware cleanup:', error);
      }

      throw error;
    }
  }

  /**
   * Ensure middleware is initialized
   * @throws {Error} If not initialized
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('PublishingMiddleware not initialized. Call initialize() first.');
    }
  }

  /**
   * Get middleware status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      version: '1.0.0',
      environment: this.config.environment,
      supportedPlatforms: this.config.supportedPlatforms,
      components: Object.keys(this.components).length,
      services: Object.keys(this.services).length,
      controllers: Object.keys(this.controllers).length,
      uptime: this.isInitialized ? Date.now() - (this.initTimestamp || Date.now()) : 0
    };
  }
}

/**
 * Create and return a configured middleware instance
 * @param {Object} config - Configuration options
 * @returns {PublishingMiddleware} Middleware instance
 */
function createMiddleware(config = {}) {
  return new PublishingMiddleware(config);
}

// Export for use in applications
if (typeof window !== 'undefined') {
  // Browser environment
  window.PublishingMiddleware = PublishingMiddleware;
  window.createPublishingMiddleware = createMiddleware;
}

if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    PublishingMiddleware,
    createMiddleware,
    DEFAULT_CONFIG,

    // Also export individual components for advanced usage
    components: {
      BaseMiddleware,
      StateManager,
      ValidationEngine,
      ErrorHandler,
      DataMapper
    },

    services: {
      ApiClient,
      SubmissionApiService,
      ApiKeyService,
      CertificateApiService,
      PushNotificationApiService,
      FileUploadApiService
    },

    controllers: {
      WorkflowManager,
      IOSPublishingController,
      AndroidPublishingController,
      PermissionController
    },

    config: {
      endpointsConfig,
      validationRulesConfig,
      errorMessagesConfig,
      workflowsConfig
    }
  };
}