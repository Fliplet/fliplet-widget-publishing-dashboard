/**
 * ApiKeyService - Wrapper for iOS API key management endpoints
 *
 * Features:
 * - List all API keys for an organization
 * - Create new API key configurations
 * - Retrieve API keys by team ID
 * - Validate API key credentials
 * - Update API key names
 * - Delete API key configurations
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

class ApiKeyService extends BaseMiddlewareClass {
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validate required dependencies
    if (!dependencies.apiClient) {
      throw new Error('ApiKeyService requires apiClient dependency');
    }
    if (!dependencies.errorHandler) {
      throw new Error('ApiKeyService requires errorHandler dependency');
    }
    if (!dependencies.stateManager) {
      throw new Error('ApiKeyService requires stateManager dependency');
    }
    if (!dependencies.validationEngine) {
      throw new Error('ApiKeyService requires validationEngine dependency');
    }
    if (!dependencies.dataMapper) {
      throw new Error('ApiKeyService requires dataMapper dependency');
    }

    // Store dependencies
    this.apiClient = dependencies.apiClient;
    this.errorHandler = dependencies.errorHandler;
    this.stateManager = dependencies.stateManager;
    this.validationEngine = dependencies.validationEngine;
    this.dataMapper = dependencies.dataMapper;

    // Default configuration
    this.config = {
      organizationId: null,
      ...config
    };

    // Bind methods
    this.listApiKeys = this.listApiKeys.bind(this);
    this.createApiKey = this.createApiKey.bind(this);
    this.getApiKeyByTeam = this.getApiKeyByTeam.bind(this);
    this.validateApiKey = this.validateApiKey.bind(this);
    this.updateApiKey = this.updateApiKey.bind(this);
    this.deleteApiKey = this.deleteApiKey.bind(this);
  }

  /**
   * List all API keys for the organization
   * @returns {Promise<Object>} API keys list
   */
  async listApiKeys() {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/organizations/${this.config.organizationId}/credentials/api-keys`
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'api_keys_list',
        response
      );

      // Update state
      if (transformedResponse.apiKeys) {
        this.stateManager.setState('apiKeys', transformedResponse.apiKeys);
      }

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'listApiKeys'
      });
      throw error;
    }
  }

  /**
   * Create a new API key configuration
   * @param {Object} apiKeyData - API key data
   * @param {string} apiKeyData.apiKey - Private key content (p8 file)
   * @param {string} apiKeyData.issuerId - Issuer ID from App Store Connect
   * @param {string} apiKeyData.keyId - Key ID from App Store Connect
   * @param {string} apiKeyData.teamId - Team ID from App Store Connect
   * @param {string} apiKeyData.name - Display name for the API key
   * @returns {Promise<Object>} Created API key response
   */
  async createApiKey(apiKeyData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'api_key_create',
        apiKeyData,
        { platform: 'ios' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Make API request
      const response = await this.apiClient.post(
        `v2/organizations/${this.config.organizationId}/credentials/api-key`,
        apiKeyData
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'api_key',
        response
      );

      // Update state
      if (transformedResponse) {
        this.stateManager.setState('currentApiKey', transformedResponse);
      }

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'createApiKey',
        teamId: apiKeyData.teamId
      });
      throw error;
    }
  }

  /**
   * Get API key configuration by team ID
   * @param {string} teamId - Team ID from App Store Connect
   * @param {Object} [options] - Query options
   * @param {boolean} [options.includeSensitiveData] - Whether to include API key content
   * @returns {Promise<Object>} API key configuration
   */
  async getApiKeyByTeam(teamId, options = {}) {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/organizations/${this.config.organizationId}/credentials/api-keys/teams/${teamId}`,
        options
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'api_key',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getApiKeyByTeam',
        teamId
      });
      throw error;
    }
  }

  /**
   * Validate API key credentials
   * @param {Object} apiKeyData - API key data to validate
   * @param {string} apiKeyData.apiKey - Private key content (p8 file)
   * @param {string} apiKeyData.issuerId - Issuer ID from App Store Connect
   * @param {string} apiKeyData.keyId - Key ID from App Store Connect
   * @param {string} apiKeyData.teamId - Team ID from App Store Connect
   * @returns {Promise<Object>} Validation result
   */
  async validateApiKey(apiKeyData) {
    try {
      // Make API request
      const response = await this.apiClient.post(
        `v2/organizations/${this.config.organizationId}/credentials/api-key/validate`,
        apiKeyData
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'api_key_validation',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'validateApiKey',
        teamId: apiKeyData.teamId
      });
      throw error;
    }
  }

  /**
   * Update API key name
   * @param {string} teamId - Team ID from App Store Connect
   * @param {Object} updateData - Update data
   * @param {string} updateData.name - New display name for the API key
   * @returns {Promise<Object>} Updated API key response
   */
  async updateApiKey(teamId, updateData) {
    try {
      // Make API request
      const response = await this.apiClient.put(
        `v2/organizations/${this.config.organizationId}/credentials/api-keys/teams/${teamId}`,
        updateData
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'api_key',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'updateApiKey',
        teamId
      });
      throw error;
    }
  }

  /**
   * Delete API key configuration
   * @param {string} teamId - Team ID from App Store Connect
   * @returns {Promise<Object>} Delete response
   */
  async deleteApiKey(teamId) {
    try {
      // Make API request
      const response = await this.apiClient.delete(
        `v2/organizations/${this.config.organizationId}/credentials/api-keys/teams/${teamId}`
      );

      return response;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'deleteApiKey',
        teamId
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
      name: 'ApiKeyService',
      version: '1.0.0',
      endpoints: [
        'listApiKeys',
        'createApiKey',
        'getApiKeyByTeam',
        'validateApiKey',
        'updateApiKey',
        'deleteApiKey'
      ]
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.ApiKeyService = ApiKeyService;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiKeyService;
}
