/**
 * PermissionController - Native app permissions management controller
 *
 * Manages native app permissions for both iOS and Android platforms.
 * Provides functionality to get, update, and reset app permissions.
 *
 * @class PermissionController
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

class PermissionController extends BaseMiddlewareClass {
  /**
   * Creates an instance of PermissionController
   * @param {Object} dependencies - Injected dependencies
   * @param {WorkflowManager} dependencies.workflowManager - Workflow management service
   * @param {ApiClient} dependencies.apiClient - API client service
   * @param {StateManager} dependencies.stateManager - State management service
   * @param {ValidationEngine} dependencies.validationEngine - Validation service
   * @param {ErrorHandler} dependencies.errorHandler - Error handling service
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // iOS permissions mapping
    this.IOS_PERMISSIONS = {
      CAMERA: {
        key: 'NSCameraUsageDescription',
        name: 'Camera',
        description: 'Access to device camera for photo and video capture',
        required: false,
        category: 'media'
      },
      PHOTO_LIBRARY: {
        key: 'NSPhotoLibraryUsageDescription',
        name: 'Photo Library',
        description: 'Access to photo library for image selection',
        required: false,
        category: 'media'
      },
      MICROPHONE: {
        key: 'NSMicrophoneUsageDescription',
        name: 'Microphone',
        description: 'Access to microphone for audio recording',
        required: false,
        category: 'media'
      },
      LOCATION_WHEN_IN_USE: {
        key: 'NSLocationWhenInUseUsageDescription',
        name: 'Location (When in Use)',
        description: 'Access to location services while app is in use',
        required: false,
        category: 'location'
      },
      LOCATION_ALWAYS: {
        key: 'NSLocationAlwaysAndWhenInUseUsageDescription',
        name: 'Location (Always)',
        description: 'Access to location services at all times',
        required: false,
        category: 'location'
      },
      CONTACTS: {
        key: 'NSContactsUsageDescription',
        name: 'Contacts',
        description: 'Access to contact information',
        required: false,
        category: 'personal'
      },
      CALENDAR: {
        key: 'NSCalendarsUsageDescription',
        name: 'Calendar',
        description: 'Access to calendar events',
        required: false,
        category: 'personal'
      },
      REMINDERS: {
        key: 'NSRemindersUsageDescription',
        name: 'Reminders',
        description: 'Access to reminders',
        required: false,
        category: 'personal'
      },
      MOTION: {
        key: 'NSMotionUsageDescription',
        name: 'Motion & Fitness',
        description: 'Access to motion and fitness data',
        required: false,
        category: 'health'
      },
      PUSH_NOTIFICATIONS: {
        key: 'aps-environment',
        name: 'Push Notifications',
        description: 'Ability to receive push notifications',
        required: false,
        category: 'communication'
      }
    };

    // Android permissions mapping
    this.ANDROID_PERMISSIONS = {
      CAMERA: {
        key: 'android.permission.CAMERA',
        name: 'Camera',
        description: 'Access to device camera for photo and video capture',
        required: false,
        category: 'media',
        dangerLevel: 'dangerous'
      },
      READ_EXTERNAL_STORAGE: {
        key: 'android.permission.READ_EXTERNAL_STORAGE',
        name: 'Read External Storage',
        description: 'Read files from external storage',
        required: false,
        category: 'storage',
        dangerLevel: 'dangerous'
      },
      WRITE_EXTERNAL_STORAGE: {
        key: 'android.permission.WRITE_EXTERNAL_STORAGE',
        name: 'Write External Storage',
        description: 'Write files to external storage',
        required: false,
        category: 'storage',
        dangerLevel: 'dangerous'
      },
      RECORD_AUDIO: {
        key: 'android.permission.RECORD_AUDIO',
        name: 'Record Audio',
        description: 'Access to microphone for audio recording',
        required: false,
        category: 'media',
        dangerLevel: 'dangerous'
      },
      ACCESS_FINE_LOCATION: {
        key: 'android.permission.ACCESS_FINE_LOCATION',
        name: 'Fine Location',
        description: 'Access to precise location using GPS',
        required: false,
        category: 'location',
        dangerLevel: 'dangerous'
      },
      ACCESS_COARSE_LOCATION: {
        key: 'android.permission.ACCESS_COARSE_LOCATION',
        name: 'Coarse Location',
        description: 'Access to approximate location using network',
        required: false,
        category: 'location',
        dangerLevel: 'dangerous'
      },
      READ_CONTACTS: {
        key: 'android.permission.READ_CONTACTS',
        name: 'Read Contacts',
        description: 'Access to contact information',
        required: false,
        category: 'personal',
        dangerLevel: 'dangerous'
      },
      WRITE_CONTACTS: {
        key: 'android.permission.WRITE_CONTACTS',
        name: 'Write Contacts',
        description: 'Modify contact information',
        required: false,
        category: 'personal',
        dangerLevel: 'dangerous'
      },
      READ_CALENDAR: {
        key: 'android.permission.READ_CALENDAR',
        name: 'Read Calendar',
        description: 'Access to calendar events',
        required: false,
        category: 'personal',
        dangerLevel: 'dangerous'
      },
      WRITE_CALENDAR: {
        key: 'android.permission.WRITE_CALENDAR',
        name: 'Write Calendar',
        description: 'Modify calendar events',
        required: false,
        category: 'personal',
        dangerLevel: 'dangerous'
      },
      INTERNET: {
        key: 'android.permission.INTERNET',
        name: 'Internet',
        description: 'Access to internet connectivity',
        required: true,
        category: 'network',
        dangerLevel: 'normal'
      },
      ACCESS_NETWORK_STATE: {
        key: 'android.permission.ACCESS_NETWORK_STATE',
        name: 'Network State',
        description: 'Access to network connection information',
        required: false,
        category: 'network',
        dangerLevel: 'normal'
      },
      VIBRATE: {
        key: 'android.permission.VIBRATE',
        name: 'Vibrate',
        description: 'Control device vibration',
        required: false,
        category: 'device',
        dangerLevel: 'normal'
      },
      WAKE_LOCK: {
        key: 'android.permission.WAKE_LOCK',
        name: 'Wake Lock',
        description: 'Prevent device from sleeping',
        required: false,
        category: 'device',
        dangerLevel: 'normal'
      }
    };

    // Permission workflow steps
    this.PERMISSION_WORKFLOW_STEPS = [
      {
        name: 'validate-permission-request',
        description: 'Validate permission update request',
        handler: this.validatePermissionRequest.bind(this),
        required: true
      },
      {
        name: 'analyze-current-permissions',
        description: 'Analyze current app permissions',
        handler: this.analyzeCurrentPermissions.bind(this),
        prerequisites: [
          { type: 'step', step: 'validate-permission-request' }
        ],
        required: true
      },
      {
        name: 'prepare-permission-changes',
        description: 'Prepare permission configuration changes',
        handler: this.preparePermissionChanges.bind(this),
        prerequisites: [
          { type: 'step', step: 'analyze-current-permissions' }
        ],
        required: true
      },
      {
        name: 'apply-permission-changes',
        description: 'Apply permission changes to app configuration',
        handler: this.applyPermissionChanges.bind(this),
        prerequisites: [
          { type: 'step', step: 'prepare-permission-changes' }
        ],
        required: true
      }
    ];
  }

  /**
   * Get required dependencies
   * @returns {string[]} Array of required dependency names
   */
  getRequiredDependencies() {
    return [
      'workflowManager',
      'apiClient',
      'stateManager',
      'validationEngine',
      'errorHandler'
    ];
  }

  /**
   * Initialize the permission controller
   * @returns {Promise<void>}
   */
  async setup() {
    // Register permission management workflow
    this.dependencies.workflowManager.registerWorkflow(
      'permission-management',
      this.PERMISSION_WORKFLOW_STEPS,
      {
        allowParallel: false,
        maxRetries: 2,
        timeout: 30000
      }
    );

    this.emit('permission-controller-initialized');
  }

  /**
   * Get app permissions for a platform
   * @param {string} appId - Application ID
   * @param {string} platform - Platform ('ios' or 'android')
   * @returns {Promise<Object>} Current permissions configuration
   */
  async getAppPermissions(appId, platform) {
    try {
      this.validatePlatform(platform);

      const response = await this.dependencies.apiClient.get(`/apps/${appId}/permissions`, {
        platform: platform
      });

      const permissions = this.normalizePermissions(response.permissions, platform);

      this.emit('permissions-retrieved', { appId, platform, permissions });

      return {
        appId,
        platform,
        permissions,
        lastUpdated: response.lastUpdated || new Date().toISOString()
      };

    } catch (error) {
      const errorDetails = this.dependencies.errorHandler.handleError(error, 'PermissionController.getAppPermissions');
      this.emit('permissions-error', { appId, platform, error: errorDetails });
      throw error;
    }
  }

  /**
   * Update app permissions
   * @param {string} appId - Application ID
   * @param {string} platform - Platform ('ios' or 'android')
   * @param {Object} permissions - Permission configuration updates
   * @param {Object} options - Update options
   * @returns {Promise<string>} Workflow ID
   */
  async updateAppPermissions(appId, platform, permissions, options = {}) {
    try {
      this.validatePlatform(platform);

      const workflowId = await this.dependencies.workflowManager.startWorkflow(
        'permission-management',
        {
          appId,
          platform,
          permissions,
          options,
          operation: 'update',
          startTime: new Date().toISOString()
        }
      );

      this.emit('permission-update-started', { workflowId, appId, platform, permissions });
      return workflowId;

    } catch (error) {
      const errorDetails = this.dependencies.errorHandler.handleError(error, 'PermissionController.updateAppPermissions');
      this.emit('permission-update-error', { appId, platform, permissions, error: errorDetails });
      throw error;
    }
  }

  /**
   * Reset app permissions to defaults
   * @param {string} appId - Application ID
   * @param {string} platform - Platform ('ios' or 'android')
   * @returns {Promise<string>} Workflow ID
   */
  async resetAppPermissions(appId, platform) {
    try {
      this.validatePlatform(platform);

      const defaultPermissions = this.getDefaultPermissions(platform);

      const workflowId = await this.dependencies.workflowManager.startWorkflow(
        'permission-management',
        {
          appId,
          platform,
          permissions: defaultPermissions,
          operation: 'reset',
          startTime: new Date().toISOString()
        }
      );

      this.emit('permission-reset-started', { workflowId, appId, platform });
      return workflowId;

    } catch (error) {
      const errorDetails = this.dependencies.errorHandler.handleError(error, 'PermissionController.resetAppPermissions');
      this.emit('permission-reset-error', { appId, platform, error: errorDetails });
      throw error;
    }
  }

  /**
   * Validate permission request step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async validatePermissionRequest(context, dependencies) {
    const { appId, platform, permissions } = context;

    // Validate app ID
    if (!appId || typeof appId !== 'string') {
      throw new Error('Invalid app ID');
    }

    // Validate platform
    this.validatePlatform(platform);

    // Validate permissions object
    if (!permissions || typeof permissions !== 'object') {
      throw new Error('Invalid permissions configuration');
    }

    // Validate each permission
    const availablePermissions = platform === 'ios' ? this.IOS_PERMISSIONS : this.ANDROID_PERMISSIONS;
    const invalidPermissions = [];

    for (const [permissionKey, config] of Object.entries(permissions)) {
      if (!availablePermissions[permissionKey]) {
        invalidPermissions.push(permissionKey);
      }
    }

    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions for ${platform}: ${invalidPermissions.join(', ')}`);
    }

    return { status: 'validation-passed', validatedPermissions: permissions };
  }

  /**
   * Analyze current permissions step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async analyzeCurrentPermissions(context, dependencies) {
    const { appId, platform } = context;

    // Get current permissions
    const currentPermissions = await this.getAppPermissions(appId, platform);

    // Analyze differences
    const requestedPermissions = context.permissions;
    const analysis = {
      current: currentPermissions.permissions,
      requested: requestedPermissions,
      changes: {
        added: [],
        modified: [],
        removed: []
      }
    };

    // Find changes
    for (const [key, config] of Object.entries(requestedPermissions)) {
      const currentConfig = currentPermissions.permissions[key];

      if (!currentConfig) {
        analysis.changes.added.push({ key, config });
      } else if (JSON.stringify(currentConfig) !== JSON.stringify(config)) {
        analysis.changes.modified.push({ key, config, previous: currentConfig });
      }
    }

    // Find removed permissions
    for (const key of Object.keys(currentPermissions.permissions)) {
      if (!requestedPermissions[key]) {
        analysis.changes.removed.push({ key, config: currentPermissions.permissions[key] });
      }
    }

    context.permissionAnalysis = analysis;

    return { status: 'analysis-completed', analysis };
  }

  /**
   * Prepare permission changes step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async preparePermissionChanges(context, dependencies) {
    const { platform, permissionAnalysis } = context;

    const changeSet = {
      platform,
      manifest: {},
      infoPlist: {},
      entitlements: {},
      configChanges: []
    };

    if (platform === 'ios') {
      // Prepare iOS permission changes
      changeSet.infoPlist = this.prepareIOSPermissionChanges(permissionAnalysis);
      changeSet.entitlements = this.prepareIOSEntitlements(permissionAnalysis);

    } else if (platform === 'android') {
      // Prepare Android permission changes
      changeSet.manifest = this.prepareAndroidPermissionChanges(permissionAnalysis);
    }

    context.permissionChangeSet = changeSet;

    return { status: 'changes-prepared', changeSet };
  }

  /**
   * Apply permission changes step
   * @param {Object} context - Workflow context
   * @param {Object} dependencies - Injected dependencies
   * @returns {Promise<Object>} Step result
   */
  async applyPermissionChanges(context, dependencies) {
    const { appId, platform, permissionChangeSet } = context;

    try {
      const response = await dependencies.apiClient.post(`/apps/${appId}/permissions`, {
        platform,
        changes: permissionChangeSet
      });

      // Update local state
      const state = await dependencies.stateManager.getState();
      const appPermissions = { ...state.appPermissions };
      appPermissions[`${appId}-${platform}`] = {
        permissions: context.permissions,
        lastUpdated: new Date().toISOString()
      };

      await this.dependencies.stateManager.setState({ appPermissions });

      return {
        status: 'changes-applied',
        updatedPermissions: response.permissions,
        changeId: response.changeId
      };

    } catch (error) {
      throw new Error(`Failed to apply permission changes: ${error.message}`);
    }
  }

  /**
   * Prepare iOS permission changes
   * @param {Object} analysis - Permission analysis
   * @returns {Object} Info.plist changes
   */
  prepareIOSPermissionChanges(analysis) {
    const infoPlistChanges = {};

    // Process all permission changes
    const allChanges = [
      ...analysis.changes.added,
      ...analysis.changes.modified
    ];

    for (const change of allChanges) {
      const permission = this.IOS_PERMISSIONS[change.key];
      if (permission && change.config.enabled) {
        infoPlistChanges[permission.key] = change.config.description || permission.description;
      }
    }

    return infoPlistChanges;
  }

  /**
   * Prepare iOS entitlements
   * @param {Object} analysis - Permission analysis
   * @returns {Object} Entitlements changes
   */
  prepareIOSEntitlements(analysis) {
    const entitlements = {};

    const allChanges = [
      ...analysis.changes.added,
      ...analysis.changes.modified
    ];

    for (const change of allChanges) {
      if (change.key === 'PUSH_NOTIFICATIONS' && change.config.enabled) {
        entitlements['aps-environment'] = change.config.environment || 'production';
      }
    }

    return entitlements;
  }

  /**
   * Prepare Android permission changes
   * @param {Object} analysis - Permission analysis
   * @returns {Object} Manifest changes
   */
  prepareAndroidPermissionChanges(analysis) {
    const manifestChanges = {
      permissions: [],
      features: []
    };

    const allChanges = [
      ...analysis.changes.added,
      ...analysis.changes.modified
    ];

    for (const change of allChanges) {
      const permission = this.ANDROID_PERMISSIONS[change.key];
      if (permission && change.config.enabled) {
        manifestChanges.permissions.push({
          name: permission.key,
          required: change.config.required !== false
        });

        // Add implied features
        if (change.key === 'CAMERA') {
          manifestChanges.features.push({
            name: 'android.hardware.camera',
            required: change.config.required !== false
          });
        }
      }
    }

    return manifestChanges;
  }

  /**
   * Get default permissions for platform
   * @param {string} platform - Platform ('ios' or 'android')
   * @returns {Object} Default permissions configuration
   */
  getDefaultPermissions(platform) {
    const permissions = {};

    if (platform === 'android') {
      // Android apps typically need internet by default
      permissions.INTERNET = {
        enabled: true,
        required: true,
        description: 'Access to internet connectivity'
      };
      permissions.ACCESS_NETWORK_STATE = {
        enabled: true,
        required: false,
        description: 'Access to network connection information'
      };
    }

    return permissions;
  }

  /**
   * Normalize permissions response
   * @param {Object} permissions - Raw permissions from API
   * @param {string} platform - Platform
   * @returns {Object} Normalized permissions
   */
  normalizePermissions(permissions, platform) {
    const normalized = {};
    const availablePermissions = platform === 'ios' ? this.IOS_PERMISSIONS : this.ANDROID_PERMISSIONS;

    for (const [key, config] of Object.entries(permissions)) {
      if (availablePermissions[key]) {
        normalized[key] = {
          ...config,
          name: availablePermissions[key].name,
          category: availablePermissions[key].category
        };
      }
    }

    return normalized;
  }

  /**
   * Validate platform parameter
   * @param {string} platform - Platform to validate
   * @throws {Error} If platform is invalid
   */
  validatePlatform(platform) {
    if (!platform || typeof platform !== 'string') {
      throw new Error('Platform must be specified');
    }

    if (!['ios', 'android'].includes(platform.toLowerCase())) {
      throw new Error('Platform must be either "ios" or "android"');
    }
  }

  /**
   * Get available permissions for platform
   * @param {string} platform - Platform ('ios' or 'android')
   * @returns {Object} Available permissions
   */
  getAvailablePermissions(platform) {
    this.validatePlatform(platform);
    return platform === 'ios' ? this.IOS_PERMISSIONS : this.ANDROID_PERMISSIONS;
  }

  /**
   * Get permission recommendations
   * @param {string} appType - Type of app (e.g., 'social', 'productivity', 'game')
   * @param {string} platform - Platform ('ios' or 'android')
   * @returns {Object} Recommended permissions
   */
  getPermissionRecommendations(appType, platform) {
    this.validatePlatform(platform);

    const recommendations = {};
    const availablePermissions = this.getAvailablePermissions(platform);

    // Basic recommendations based on app type
    const appTypeRecommendations = {
      social: ['CAMERA', 'PHOTO_LIBRARY', 'CONTACTS', 'PUSH_NOTIFICATIONS'],
      productivity: ['CALENDAR', 'REMINDERS', 'CONTACTS', 'PUSH_NOTIFICATIONS'],
      game: ['PUSH_NOTIFICATIONS', 'INTERNET'],
      fitness: ['LOCATION_WHEN_IN_USE', 'MOTION', 'PUSH_NOTIFICATIONS'],
      camera: ['CAMERA', 'PHOTO_LIBRARY', 'WRITE_EXTERNAL_STORAGE'],
      messaging: ['CONTACTS', 'CAMERA', 'MICROPHONE', 'PUSH_NOTIFICATIONS']
    };

    const recommended = appTypeRecommendations[appType] || [];

    for (const permission of recommended) {
      if (availablePermissions[permission]) {
        recommendations[permission] = {
          enabled: true,
          required: false,
          description: availablePermissions[permission].description,
          reason: `Recommended for ${appType} apps`
        };
      }
    }

    return recommendations;
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
      type: 'permission-management',
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
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.PermissionController = PermissionController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PermissionController;
}