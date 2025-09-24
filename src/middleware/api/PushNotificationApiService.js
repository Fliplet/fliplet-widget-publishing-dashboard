/**
 * PushNotificationApiService - Wrapper for push notification configuration endpoints
 *
 * Features:
 * - Get existing push notification configuration
 * - Get iOS push configuration by team ID
 * - Configure iOS push notifications (APN)
 * - Configure Android push notifications (FCM)
 * - State management integration
 * - Error handling and validation
 */

// Ensure BaseMiddleware is available for inheritance
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

class PushNotificationApiService extends BaseMiddlewareClass {
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validate required dependencies
    if (!dependencies.apiClient) {
      throw new Error('PushNotificationApiService requires apiClient dependency');
    }
    if (!dependencies.errorHandler) {
      throw new Error('PushNotificationApiService requires errorHandler dependency');
    }
    if (!dependencies.stateManager) {
      throw new Error('PushNotificationApiService requires stateManager dependency');
    }
    if (!dependencies.validationEngine) {
      throw new Error('PushNotificationApiService requires validationEngine dependency');
    }
    if (!dependencies.dataMapper) {
      throw new Error('PushNotificationApiService requires dataMapper dependency');
    }

    // Store dependencies
    this.apiClient = dependencies.apiClient;
    this.errorHandler = dependencies.errorHandler;
    this.stateManager = dependencies.stateManager;
    this.validationEngine = dependencies.validationEngine;
    this.dataMapper = dependencies.dataMapper;

    // Default configuration
    this.config = {
      appId: null,
      submissionId: null,
      organizationId: null,
      ...config
    };

    // Bind methods
    this.getPushConfig = this.getPushConfig.bind(this);
    this.getIosPushConfigByTeam = this.getIosPushConfigByTeam.bind(this);
    this.configureIosPush = this.configureIosPush.bind(this);
    this.configureAndroidPush = this.configureAndroidPush.bind(this);
  }

  /**
   * Get existing push notification configuration for the app
   * @returns {Promise<Object>} Push configuration response
   */
  async getPushConfig() {
    try {
      // Make API request
      const response = await this.apiClient.get(
        'v1/widget-instances/com.fliplet.push-notifications',
        { appId: this.config.appId }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'push_config',
        response
      );

      // Update state
      this.stateManager.setState('pushConfig', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getPushConfig'
      });
      throw error;
    }
  }

  /**
   * Get iOS push configuration by team ID
   * @param {string} teamId - Team ID from App Store Connect
   * @returns {Promise<Object>} iOS push configuration response
   */
  async getIosPushConfigByTeam(teamId) {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/organizations/${this.config.organizationId}/credentials/ios-push-config/${teamId}`
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'ios_push_config',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getIosPushConfigByTeam',
        teamId
      });
      throw error;
    }
  }

  /**
   * Configure iOS push notifications (APN)
   * @param {Object} iosPushData - iOS push notification data
   * @param {string} iosPushData.apnKeyId - Apple Push Notification key ID
   * @param {string} iosPushData.apnTopic - Apple Push Notification topic (bundle ID)
   * @param {string} iosPushData.apnTeamId - Apple Push Notification team ID
   * @param {string} iosPushData.apnAuthKey - Apple Push Notification authentication key
   * @returns {Promise<Object>} Configuration response
   */
  async configureIosPush(iosPushData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'ios_push_config',
        iosPushData,
        { platform: 'ios' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare request data
      const requestData = {
        submissionId: this.config.submissionId,
        platform: 'ios',
        apn: true,
        ...iosPushData
      };

      // Make API request
      const response = await this.apiClient.put(
        'v1/widget-instances/com.fliplet.push-notifications/settings',
        requestData,
        { appId: this.config.appId }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'push_config',
        response
      );

      // Update state
      this.stateManager.setState('currentPushConfig', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'configureIosPush'
      });
      throw error;
    }
  }

  /**
   * Configure Android push notifications (FCM)
   * @param {Object} androidPushData - Android push notification data
   * @param {string} androidPushData.project_id - Firebase project ID
   * @param {string} androidPushData.private_key - Service account private key
   * @param {string} androidPushData.client_email - Service account client email
   * @param {Object} androidPushData['fl-store-firebase'] - Google services file object
   * @returns {Promise<Object>} Configuration response
   */
  async configureAndroidPush(androidPushData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'android_push_config',
        androidPushData,
        { platform: 'android' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare request data
      const requestData = {
        submissionId: this.config.submissionId,
        platform: 'android',
        fcm: true,
        ...androidPushData
      };

      // Make API request
      const response = await this.apiClient.put(
        'v1/widget-instances/com.fliplet.push-notifications/settings',
        requestData,
        { appId: this.config.appId }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'push_config',
        response
      );

      // Update state
      this.stateManager.setState('currentPushConfig', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'configureAndroidPush'
      });
      throw error;
    }
  }

  /**
   * Get service information
   * @returns {Object} Service information
   */
  getInfo() {
    return {
      name: 'PushNotificationApiService',
      version: '1.0.0',
      endpoints: [
        'getPushConfig',
        'getIosPushConfigByTeam',
        'configureIosPush',
        'configureAndroidPush'
      ]
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.PushNotificationApiService = PushNotificationApiService;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PushNotificationApiService;
}
