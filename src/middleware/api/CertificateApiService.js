/**
 * CertificateApiService - Wrapper for iOS certificate management endpoints
 *
 * Features:
 * - Check certificate validity
 * - Generate new iOS certificates
 * - Upload custom certificates
 * - Get available bundle IDs
 * - Get bundle ID details
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

class CertificateApiService extends BaseMiddlewareClass {
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validate required dependencies
    if (!dependencies.apiClient) {
      throw new Error('CertificateApiService requires apiClient dependency');
    }
    if (!dependencies.errorHandler) {
      throw new Error('CertificateApiService requires errorHandler dependency');
    }
    if (!dependencies.stateManager) {
      throw new Error('CertificateApiService requires stateManager dependency');
    }
    if (!dependencies.validationEngine) {
      throw new Error('CertificateApiService requires validationEngine dependency');
    }
    if (!dependencies.dataMapper) {
      throw new Error('CertificateApiService requires dataMapper dependency');
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
      ...config
    };

    // Bind methods
    this.checkCertificate = this.checkCertificate.bind(this);
    this.generateCertificate = this.generateCertificate.bind(this);
    this.uploadCertificate = this.uploadCertificate.bind(this);
    this.getBundleIds = this.getBundleIds.bind(this);
    this.getBundleIdDetails = this.getBundleIdDetails.bind(this);
  }

  /**
   * Check if existing iOS certificate is valid
   * @returns {Promise<Object>} Certificate validation result
   */
  async checkCertificate() {
    try {
      // Make API request
      const response = await this.apiClient.post(
        `v2/apps/${this.config.appId}/submissions/${this.config.submissionId}/check-certificate`
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'certificate_check',
        response
      );

      // Update state
      this.stateManager.setState('certificateStatus', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'checkCertificate'
      });
      throw error;
    }
  }

  /**
   * Generate new iOS distribution certificate
   * @returns {Promise<Object>} Generated certificate response
   */
  async generateCertificate() {
    try {
      // Make API request
      const response = await this.apiClient.post(
        `v2/apps/${this.config.appId}/submissions/${this.config.submissionId}/ios-app-store/certificate`
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'certificate',
        response
      );

      // Update state
      this.stateManager.setState('currentCertificate', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'generateCertificate'
      });
      throw error;
    }
  }

  /**
   * Upload iOS distribution certificate and private key
   * @param {Object} certificateData - Certificate data
   * @param {string} certificateData.privateKey - Private key content in PEM format
   * @param {string} certificateData.certificate - Certificate content in PEM format
   * @returns {Promise<Object>} Upload response
   */
  async uploadCertificate(certificateData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'certificate_upload',
        certificateData,
        { platform: 'ios' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Make API request
      const response = await this.apiClient.put(
        `v2/apps/${this.config.appId}/submissions/${this.config.submissionId}/ios-app-store/certificate`,
        certificateData
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'certificate',
        response
      );

      // Update state
      this.stateManager.setState('currentCertificate', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'uploadCertificate'
      });
      throw error;
    }
  }

  /**
   * Get list of available bundle IDs from App Store Connect
   * @returns {Promise<Object>} Bundle IDs list
   */
  async getBundleIds() {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/apps/${this.config.appId}/submissions/${this.config.submissionId}/bundleId`
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'bundle_ids',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getBundleIds'
      });
      throw error;
    }
  }

  /**
   * Get details for a specific bundle ID
   * @param {string} bundleId - Bundle ID to get details for
   * @returns {Promise<Object>} Bundle ID details
   */
  async getBundleIdDetails(bundleId) {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/apps/${this.config.appId}/submissions/${this.config.submissionId}/bundleId/details`,
        { bundleId }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'bundle_id_details',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getBundleIdDetails',
        bundleId
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
      name: 'CertificateApiService',
      version: '1.0.0',
      endpoints: [
        'checkCertificate',
        'generateCertificate',
        'uploadCertificate',
        'getBundleIds',
        'getBundleIdDetails'
      ]
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.CertificateApiService = CertificateApiService;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CertificateApiService;
}
