/**
 * DataMapper - Data transformation and serialization for Publishing Dashboard middleware
 *
 * Provides API response transformation, state serialization/deserialization,
 * data normalization, and schema validation for consistent data handling.
 *
 * @class DataMapper
 * @extends BaseMiddleware
 */

// Ensure BaseMiddleware is available in the Jest/jsdom environment
const ensureBaseMiddleware = () => {
  if (typeof window !== 'undefined' && window.BaseMiddleware) {
    return window.BaseMiddleware;
  }
  try {
    require('./BaseMiddleware.js');
    if (typeof window !== 'undefined' && window.BaseMiddleware) {
      return window.BaseMiddleware;
    }
  } catch (e) {}
  throw new Error('BaseMiddleware is not available');
};

const BaseMiddlewareClass = ensureBaseMiddleware();

class DataMapper extends BaseMiddlewareClass {
  /**
   * Creates an instance of DataMapper
   * @param {Object} dependencies - Injected dependencies
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Transformation maps and schemas
    this.apiTransformers = new Map();
    this.stateTransformers = new Map();
    this.dataSchemas = new Map();
    this.customMappers = new Map();

    // Configuration
    this.enableValidation = this.getConfig('dataMapper.enableValidation', true);
    this.strictMode = this.getConfig('dataMapper.strictMode', false);
    this.preserveRawData = this.getConfig('dataMapper.preserveRawData', true);

    // Bind methods
    this.transformApiResponse = this.transformApiResponse.bind(this);
    this.transformToState = this.transformToState.bind(this);
    this.transformFromState = this.transformFromState.bind(this);
    this.validateSchema = this.validateSchema.bind(this);
  }

  /**
   * Required dependencies for DataMapper
   * @returns {string[]} Array of dependency names
   */
  getRequiredDependencies() {
    return []; // DataMapper can work independently
  }

  /**
   * Initialize DataMapper - set up transformers and schemas
   * @returns {Promise<void>}
   */
  async setup() {
    this.initializeApiTransformers();
    this.initializeStateTransformers();
    this.initializeDataSchemas();
    this.emit('data-mapper-ready', {
      apiTransformers: this.apiTransformers.size,
      stateTransformers: this.stateTransformers.size,
      schemas: this.dataSchemas.size
    });
  }

  /**
   * Initialize API response transformers
   */
  initializeApiTransformers() {
    // Submission API response transformer
    this.addApiTransformer('submission', (response, context) => {
      if (!response || !response.submission) {
        return this.createEmptySubmission();
      }

      const submission = response.submission;
      return {
        id: submission.id,
        platform: submission.platform,
        status: submission.status,
        appId: submission.appId,
        targetAppId: submission.targetAppId,
        submittedByUserId: submission.submittedByUserId,
        submittedAt: submission.submittedAt,
        createdAt: this.parseDate(submission.createdAt),
        updatedAt: this.parseDate(submission.updatedAt),
        data: this.transformSubmissionData(submission.data || {}),
        result: this.transformSubmissionResult(submission.result || {}),
        errors: this.normalizeErrors(submission.errors || []),
        rawData: this.preserveRawData ? submission : null
      };
    });

    // API Keys list transformer
    this.addApiTransformer('apiKeys', (response, context) => {
      if (!response || !Array.isArray(response.apiKeys)) {
        return [];
      }

      return response.apiKeys.map(apiKey => ({
        teamId: apiKey.teamId,
        keyId: apiKey.keyId,
        issuerId: apiKey.issuerId,
        name: apiKey.name,
        createdFromUserId: apiKey.createdFromUserId,
        updatedAt: this.parseDate(apiKey.updatedAt),
        hasApiKey: apiKey.hasApiKey !== undefined ? apiKey.hasApiKey : true,
        rawData: this.preserveRawData ? apiKey : null
      }));
    });

    // Bundle IDs transformer
    this.addApiTransformer('bundleIds', (response, context) => {
      if (!response || !Array.isArray(response.apps)) {
        return [];
      }

      return response.apps.map(app => ({
        appId: app.appId,
        bundleId: app.bundleId,
        name: app.name,
        sku: app.sku,
        rawData: this.preserveRawData ? app : null
      }));
    });

    // Bundle ID details transformer
    this.addApiTransformer('bundleIdDetails', (response, context) => {
      if (!response || !response.exists || !response.data) {
        return null;
      }

      const data = response.data;
      const details = data.appStoreAppDetails || {};

      return {
        exists: true,
        appStoreAppId: data.appStoreAppId,
        bundleId: data.bundleId,
        name: data.name,
        sku: data.sku,
        platform: details.platform,
        versionString: details.versionString,
        appStoreState: details.appStoreState,
        appVersionState: details.appVersionState,
        copyright: details.copyright,
        reviewType: details.reviewType,
        releaseType: details.releaseType,
        earliestReleaseDate: this.parseDate(details.earliestReleaseDate),
        usesIdfa: details.usesIdfa,
        downloadable: details.downloadable,
        createdDate: this.parseDate(details.createdDate),
        rawData: this.preserveRawData ? response : null
      };
    });

    // Certificate check transformer
    this.addApiTransformer('certificateCheck', (response, context) => {
      return {
        isValid: response.validCertificate || false,
        message: response.message || '',
        timestamp: Date.now(),
        rawData: this.preserveRawData ? response : null
      };
    });

    // Certificate generation transformer
    this.addApiTransformer('certificateGeneration', (response, context) => {
      if (!response || !response.credentials) {
        return null;
      }

      const credentials = response.credentials;
      return {
        type: credentials.type,
        status: credentials.status,
        teamId: credentials.teamId,
        teamName: credentials.teamName,
        certificateName: credentials.certificateName,
        certSigningRequest: credentials.certSigningRequest,
        p12Url: credentials.p12?.url,
        createdAt: this.parseDate(credentials.createdAt),
        updatedAt: this.parseDate(credentials.updatedAt),
        verifiedAt: this.parseDate(credentials.verifiedAt),
        rawData: this.preserveRawData ? response : null
      };
    });

    // Push notification config transformer
    this.addApiTransformer('pushConfig', (response, context) => {
      if (!response || !response.widgetInstance) {
        return null;
      }

      const instance = response.widgetInstance;
      const settings = instance.settings || {};

      return {
        id: instance.id,
        uuid: instance.uuid,
        platform: context.platform,
        config: this.transformPushSettings(settings, context.platform),
        createdAt: this.parseDate(instance.createdAt),
        updatedAt: this.parseDate(instance.updatedAt),
        rawData: this.preserveRawData ? response : null
      };
    });

    // File upload transformer
    this.addApiTransformer('fileUpload', (response, context) => {
      if (!response || !Array.isArray(response.files) || response.files.length === 0) {
        return null;
      }

      const file = response.files[0];
      return {
        id: file.id,
        name: file.name,
        path: file.path,
        url: file.url,
        contentType: file.contentType,
        size: file.metadata?.size,
        checksum: file.metadata?.checksum,
        isEncrypted: file.isEncrypted,
        appId: file.appId,
        userId: file.userId,
        organizationId: file.organizationId,
        createdAt: this.parseDate(file.createdAt),
        updatedAt: this.parseDate(file.updatedAt),
        rawData: this.preserveRawData ? file : null
      };
    });

    // App permissions transformer
    this.addApiTransformer('appPermissions', (response, context) => {
      if (!response || typeof response !== 'object') {
        return {};
      }

      // Transform permissions based on platform
      if (context.platform === 'ios') {
        return this.transformIOSPermissions(response);
      } else if (context.platform === 'android') {
        return this.transformAndroidPermissions(response);
      }

      return response;
    });
  }

  /**
   * Initialize state transformers
   */
  initializeStateTransformers() {
    // Workflow state transformer
    this.addStateTransformer('workflow', (data, direction) => {
      if (direction === 'serialize') {
        return {
          currentStep: data.currentStep,
          progress: data.progress,
          data: this.serializeWorkflowData(data.data),
          errors: data.errors || [],
          isComplete: data.isComplete || false,
          dependencies: data.dependencies || [],
          lastUpdated: data.lastUpdated || Date.now()
        };
      } else {
        return {
          currentStep: data.currentStep || 'initialization',
          progress: data.progress || 0,
          data: this.deserializeWorkflowData(data.data || {}),
          errors: Array.isArray(data.errors) ? data.errors : [],
          isComplete: Boolean(data.isComplete),
          dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
          lastUpdated: data.lastUpdated || Date.now()
        };
      }
    });

    // Cache transformer
    this.addStateTransformer('cache', (data, direction) => {
      if (direction === 'serialize') {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
          serialized[key] = {
            data: value.data,
            timestamp: value.timestamp,
            ttl: value.ttl
          };
        }
        return serialized;
      } else {
        const deserialized = {};
        for (const [key, value] of Object.entries(data)) {
          deserialized[key] = {
            data: value.data || null,
            timestamp: value.timestamp || null,
            ttl: value.ttl || 300000
          };
        }
        return deserialized;
      }
    });

    // User preferences transformer
    this.addStateTransformer('userPreferences', (data, direction) => {
      if (direction === 'serialize') {
        return {
          organizationId: data.organizationId,
          selectedPlatform: data.selectedPlatform,
          preferences: data.preferences || {}
        };
      } else {
        return {
          organizationId: data.organizationId || null,
          selectedPlatform: data.selectedPlatform || null,
          preferences: data.preferences || {}
        };
      }
    });
  }

  /**
   * Initialize data schemas for validation
   */
  initializeDataSchemas() {
    // Submission schema
    this.addDataSchema('submission', {
      id: { type: 'number', required: true },
      platform: { type: 'string', required: true, enum: ['ios', 'android'] },
      status: { type: 'string', required: true },
      appId: { type: 'number', required: true },
      data: { type: 'object', required: false },
      createdAt: { type: 'string', required: true },
      updatedAt: { type: 'string', required: true }
    });

    // API Key schema
    this.addDataSchema('apiKey', {
      teamId: { type: 'string', required: true, pattern: /^[A-Z0-9]{10}$/ },
      keyId: { type: 'string', required: true, pattern: /^[A-Z0-9]{10}$/ },
      issuerId: { type: 'string', required: true, pattern: /^[0-9a-f-]{36}$/i },
      name: { type: 'string', required: true, minLength: 1, maxLength: 100 }
    });

    // Bundle ID schema
    this.addDataSchema('bundleId', {
      appId: { type: 'string', required: true },
      bundleId: { type: 'string', required: true, pattern: /^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/ },
      name: { type: 'string', required: true },
      sku: { type: 'string', required: false }
    });

    // Workflow data schema
    this.addDataSchema('workflowData', {
      submissionId: { type: 'number', required: false },
      teamId: { type: 'string', required: false, pattern: /^[A-Z0-9]{10}$/ },
      bundleId: { type: 'string', required: false, pattern: /^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/ },
      certificateValid: { type: 'boolean', required: false },
      storeConfig: { type: 'object', required: false },
      metadata: { type: 'object', required: false },
      pushConfig: { type: 'object', required: false }
    });

    // File upload schema
    this.addDataSchema('file', {
      id: { type: 'number', required: true },
      name: { type: 'string', required: true },
      url: { type: 'string', required: true },
      contentType: { type: 'string', required: false },
      size: { type: 'number', required: false, min: 0 }
    });
  }

  /**
   * Transform API response to internal format
   * @param {Object} response - Raw API response
   * @param {string} type - Response type
   * @param {Object} context - Transformation context
   * @returns {*} Transformed data
   */
  transformApiResponse(response, type, context = {}) {
    try {
      const transformer = this.apiTransformers.get(type);
      if (!transformer) {
        console.warn(`No transformer found for API response type: ${type}`);
        return response;
      }

      const transformed = transformer(response, context);

      // Validate if enabled
      if (this.enableValidation && this.dataSchemas.has(type)) {
        const validation = this.validateSchema(transformed, type);
        if (!validation.isValid) {
          console.warn(`Schema validation failed for ${type}:`, validation.errors);
          if (this.strictMode) {
            throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
          }
        }
      }

      this.emit('api-response-transformed', {
        type,
        originalSize: this.calculateDataSize(response),
        transformedSize: this.calculateDataSize(transformed),
        context
      });

      return transformed;

    } catch (error) {
      this.emit('api-transformation-failed', {
        type,
        error: error.message,
        context
      });

      if (this.strictMode) {
        throw error;
      }

      console.warn(`API transformation failed for ${type}:`, error.message);
      return response; // Return original response as fallback
    }
  }

  /**
   * Transform data to state format
   * @param {*} data - Data to transform
   * @param {string} type - Data type
   * @returns {*} State-formatted data
   */
  transformToState(data, type) {
    try {
      const transformer = this.stateTransformers.get(type);
      if (!transformer) {
        return data;
      }

      return transformer(data, 'serialize');

    } catch (error) {
      console.warn(`State serialization failed for ${type}:`, error.message);
      return data;
    }
  }

  /**
   * Transform data from state format
   * @param {*} data - State data to transform
   * @param {string} type - Data type
   * @returns {*} Deserialized data
   */
  transformFromState(data, type) {
    try {
      const transformer = this.stateTransformers.get(type);
      if (!transformer) {
        return data;
      }

      return transformer(data, 'deserialize');

    } catch (error) {
      console.warn(`State deserialization failed for ${type}:`, error.message);
      return data;
    }
  }

  /**
   * Transform submission data from API response
   * @param {Object} data - Raw submission data
   * @returns {Object} Transformed submission data
   */
  transformSubmissionData(data) {
    const transformed = {
      submissionType: data.submissionType,
      status: data.status,
      isV2Submission: data.isV2Submission || false
    };

    // iOS-specific data
    if (data.teamId) {
      transformed.teamId = data.teamId;
    }

    // Store configuration
    if (data['fl-store-bundleId']) {
      transformed.storeConfig = {
        bundleId: data['fl-store-bundleId'],
        versionNumber: data['fl-store-versionNumber'],
        versionCode: data['fl-store-versionCode']
      };
    }

    // App metadata
    if (data.appIcon || data['fl-store-iconName'] || data.splashScreen) {
      transformed.metadata = {
        appIcon: data.appIcon,
        iconName: data['fl-store-iconName'],
        splashScreen: data.splashScreen
      };
    }

    // Bundle ID info for iOS
    if (data.appStoreAppId) {
      transformed.bundleIdInfo = {
        appStoreAppId: data.appStoreAppId,
        bundleId: data.bundleId,
        name: data.name,
        sku: data.sku
      };
    }

    // Certificate info
    if (data['fl-credentials']) {
      transformed.certificateType = data['fl-credentials'];
    }

    return transformed;
  }

  /**
   * Transform submission result data
   * @param {Object} result - Raw submission result
   * @returns {Object} Transformed result data
   */
  transformSubmissionResult(result) {
    if (!result || Object.keys(result).length === 0) {
      return {};
    }

    const transformed = {};

    // App build files
    if (result.appBuild && result.appBuild.files) {
      transformed.appBuild = {
        files: result.appBuild.files.map(file => this.transformFileData(file))
      };
    }

    // Debug app files
    if (result.debugApp && result.debugApp.files) {
      transformed.debugApp = {
        files: result.debugApp.files.map(file => this.transformFileData(file))
      };
    }

    // Build metadata
    if (result.branchName) {
      transformed.buildInfo = {
        branchName: result.branchName,
        versionCode: result.versionCode,
        versionNumber: result.versionNumber
      };
    }

    // Certificate info
    if (result.certificatePassword || result.certificateUsername) {
      transformed.certificateInfo = {
        password: result.certificatePassword,
        username: result.certificateUsername
      };
    }

    return transformed;
  }

  /**
   * Transform file data
   * @param {Object} file - Raw file data
   * @returns {Object} Transformed file data
   */
  transformFileData(file) {
    return {
      id: file.id,
      name: file.name,
      url: file.url,
      path: file.path,
      contentType: file.contentType,
      size: file.metadata?.size,
      checksum: file.metadata?.checksum,
      isEncrypted: file.isEncrypted,
      appId: file.appId,
      userId: file.userId,
      organizationId: file.organizationId,
      createdAt: this.parseDate(file.createdAt),
      updatedAt: this.parseDate(file.updatedAt)
    };
  }

  /**
   * Transform push notification settings
   * @param {Object} settings - Raw push settings
   * @param {string} platform - Platform type
   * @returns {Object} Transformed push settings
   */
  transformPushSettings(settings, platform) {
    if (platform === 'ios') {
      return {
        enabled: settings.apn || false,
        keyId: settings.apnKeyId,
        topic: settings.apnTopic,
        teamId: settings.apnTeamId,
        authKey: settings.apnAuthKey ? '[REDACTED]' : null
      };
    } else if (platform === 'android') {
      return {
        enabled: settings.fcm || false,
        projectId: settings.project_id,
        clientEmail: settings.client_email,
        privateKey: settings.private_key ? '[REDACTED]' : null,
        googleServicesFile: settings['fl-store-firebase']
      };
    }

    return settings;
  }

  /**
   * Transform iOS permissions
   * @param {Object} permissions - Raw iOS permissions
   * @returns {Object} Transformed permissions
   */
  transformIOSPermissions(permissions) {
    const transformed = {};

    for (const [key, value] of Object.entries(permissions)) {
      if (key.startsWith('NS') && typeof value === 'object') {
        transformed[key] = {
          enabled: Boolean(value.enable),
          description: value.string || '',
          usage: this.getIOSPermissionUsage(key)
        };
      }
    }

    return transformed;
  }

  /**
   * Transform Android permissions
   * @param {Object} permissions - Raw Android permissions
   * @returns {Object} Transformed permissions
   */
  transformAndroidPermissions(permissions) {
    const transformed = {};

    for (const [key, value] of Object.entries(permissions)) {
      if (typeof value === 'object' && 'enable' in value) {
        transformed[key] = {
          enabled: Boolean(value.enable),
          description: this.getAndroidPermissionDescription(key),
          protectionLevel: this.getAndroidPermissionProtectionLevel(key)
        };
      }
    }

    return transformed;
  }

  /**
   * Get iOS permission usage description
   * @param {string} permission - Permission name
   * @returns {string} Usage description
   */
  getIOSPermissionUsage(permission) {
    const usageMap = {
      'NSCameraUsageDescription': 'Camera access for photo uploads',
      'NSMicrophoneUsageDescription': 'Microphone access for audio recording',
      'NSLocationWhenInUseUsageDescription': 'Location access for location-based features',
      'NSPhotoLibraryUsageDescription': 'Photo library access for image uploads',
      'NSContactsUsageDescription': 'Contacts access for sharing features',
      'NSFaceIDUsageDescription': 'Face ID for secure authentication',
      'NSBluetoothAlwaysUsageDescription': 'Bluetooth for device connectivity'
    };

    return usageMap[permission] || 'System permission';
  }

  /**
   * Get Android permission description
   * @param {string} permission - Permission name
   * @returns {string} Permission description
   */
  getAndroidPermissionDescription(permission) {
    const descriptionMap = {
      'CAMERA': 'Camera access for photo capture',
      'INTERNET': 'Internet access for network communication',
      'ACCESS_FINE_LOCATION': 'Precise location access',
      'ACCESS_COARSE_LOCATION': 'Approximate location access',
      'WRITE_EXTERNAL_STORAGE': 'External storage write access',
      'READ_PHONE_STATE': 'Phone state information access',
      'VIBRATE': 'Device vibration control',
      'WAKE_LOCK': 'Prevent device sleep',
      'POST_NOTIFICATIONS': 'Push notification delivery'
    };

    return descriptionMap[permission] || 'System permission';
  }

  /**
   * Get Android permission protection level
   * @param {string} permission - Permission name
   * @returns {string} Protection level
   */
  getAndroidPermissionProtectionLevel(permission) {
    const dangerousPermissions = [
      'CAMERA', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION',
      'WRITE_EXTERNAL_STORAGE', 'READ_PHONE_STATE'
    ];

    return dangerousPermissions.includes(permission) ? 'dangerous' : 'normal';
  }

  /**
   * Serialize workflow data for storage
   * @param {Object} data - Workflow data
   * @returns {Object} Serialized data
   */
  serializeWorkflowData(data) {
    const serialized = {};

    // Copy primitive values directly
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        serialized[key] = value;
      } else if (typeof value === 'object') {
        // Deep clone objects
        serialized[key] = JSON.parse(JSON.stringify(value));
      } else {
        serialized[key] = value;
      }
    }

    return serialized;
  }

  /**
   * Deserialize workflow data from storage
   * @param {Object} data - Serialized workflow data
   * @returns {Object} Deserialized data
   */
  deserializeWorkflowData(data) {
    const deserialized = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        deserialized[key] = value;
      } else if (typeof value === 'object') {
        // Ensure objects are properly structured
        deserialized[key] = { ...value };
      } else {
        deserialized[key] = value;
      }
    }

    return deserialized;
  }

  /**
   * Normalize error array
   * @param {Array} errors - Error array
   * @returns {Array} Normalized errors
   */
  normalizeErrors(errors) {
    if (!Array.isArray(errors)) {
      return [];
    }

    return errors.map(error => ({
      id: error.id || this.generateId(),
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: error.timestamp || Date.now(),
      severity: error.severity || 'medium'
    }));
  }

  /**
   * Parse date string to timestamp
   * @param {string|null} dateString - Date string
   * @returns {number|null} Timestamp or null
   */
  parseDate(dateString) {
    if (!dateString) return null;

    try {
      return new Date(dateString).getTime();
    } catch (error) {
      console.warn('Failed to parse date:', dateString);
      return null;
    }
  }

  /**
   * Create empty submission object
   * @returns {Object} Empty submission
   */
  createEmptySubmission() {
    return {
      id: null,
      platform: null,
      status: null,
      appId: null,
      targetAppId: null,
      submittedByUserId: null,
      submittedAt: null,
      createdAt: null,
      updatedAt: null,
      data: {},
      result: {},
      errors: [],
      rawData: null
    };
  }

  /**
   * Validate data against schema
   * @param {*} data - Data to validate
   * @param {string} schemaName - Schema name
   * @returns {Object} Validation result
   */
  validateSchema(data, schemaName) {
    const schema = this.dataSchemas.get(schemaName);
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data?.[field];

      // Required field check
      if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push(`Field '${field}' is required`);
        continue;
      }

      // Skip further validation if field is not provided and not required
      if (!rules.required && (value === null || value === undefined)) {
        continue;
      }

      // Type validation
      if (rules.type && !this.validateType(value, rules.type)) {
        errors.push(`Field '${field}' must be of type ${rules.type}`);
        continue;
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`Field '${field}' does not match required pattern`);
      }

      // Length validation
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`Field '${field}' must be no more than ${rules.maxLength} characters`);
      }

      // Number validation
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`Field '${field}' must be at least ${rules.min}`);
      }

      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`Field '${field}' must be no more than ${rules.max}`);
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate value type
   * @param {*} value - Value to validate
   * @param {string} expectedType - Expected type
   * @returns {boolean} Whether type is valid
   */
  validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Calculate approximate data size
   * @param {*} data - Data to measure
   * @returns {number} Approximate size in bytes
   */
  calculateDataSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Add API transformer
   * @param {string} type - Response type
   * @param {Function} transformer - Transformer function
   */
  addApiTransformer(type, transformer) {
    this.apiTransformers.set(type, transformer);
  }

  /**
   * Add state transformer
   * @param {string} type - Data type
   * @param {Function} transformer - Transformer function
   */
  addStateTransformer(type, transformer) {
    this.stateTransformers.set(type, transformer);
  }

  /**
   * Add data schema
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   */
  addDataSchema(name, schema) {
    this.dataSchemas.set(name, schema);
  }

  /**
   * Add custom mapper
   * @param {string} name - Mapper name
   * @param {Function} mapper - Mapper function
   */
  addCustomMapper(name, mapper) {
    this.customMappers.set(name, mapper);
  }

  /**
   * Get mapper information for debugging
   * @returns {Object} Mapper information
   */
  getMapperInfo() {
    return {
      apiTransformers: Array.from(this.apiTransformers.keys()),
      stateTransformers: Array.from(this.stateTransformers.keys()),
      schemas: Array.from(this.dataSchemas.keys()),
      customMappers: Array.from(this.customMappers.keys()),
      config: {
        enableValidation: this.enableValidation,
        strictMode: this.strictMode,
        preserveRawData: this.preserveRawData
      }
    };
  }

  /**
   * Cleanup method - clear transformers and schemas
   */
  cleanup() {
    this.apiTransformers.clear();
    this.stateTransformers.clear();
    this.dataSchemas.clear();
    this.customMappers.clear();
    super.cleanup();
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.DataMapper = DataMapper;
}
