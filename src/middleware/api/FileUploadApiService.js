/**
 * FileUploadApiService - Wrapper for file upload endpoints
 *
 * Features:
 * - Upload general files to media library
 * - Upload Android keystore files with validation
 * - Upload Google Services configuration files
 * - Upload iOS certificate files
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

class FileUploadApiService extends BaseMiddlewareClass {
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validate required dependencies
    if (!dependencies.apiClient) {
      throw new Error('FileUploadApiService requires apiClient dependency');
    }
    if (!dependencies.errorHandler) {
      throw new Error('FileUploadApiService requires errorHandler dependency');
    }
    if (!dependencies.stateManager) {
      throw new Error('FileUploadApiService requires stateManager dependency');
    }
    if (!dependencies.validationEngine) {
      throw new Error('FileUploadApiService requires validationEngine dependency');
    }
    if (!dependencies.dataMapper) {
      throw new Error('FileUploadApiService requires dataMapper dependency');
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
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadKeystore = this.uploadKeystore.bind(this);
    this.uploadGoogleServices = this.uploadGoogleServices.bind(this);
    this.uploadCertificate = this.uploadCertificate.bind(this);
  }

  /**
   * Upload a general file to the media library
   * @param {Object} fileData - File upload data
   * @param {string} fileData.name - File name
   * @param {File} fileData.file - File object
   * @returns {Promise<Object>} Upload response
   */
  async uploadFile(fileData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'file_upload',
        fileData,
        { platform: 'both' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name[0]', fileData.name);
      formData.append('files[0]', fileData.file);

      // Make API request
      const response = await this.apiClient.post(
        'v1/media/files',
        formData,
        {
          appId: this.config.appId,
          name: fileData.name
        }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'file_upload',
        response
      );

      // Update state
      this.stateManager.setState('uploadedFiles', transformedResponse.files);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'uploadFile'
      });
      throw error;
    }
  }

  /**
   * Upload Android keystore file and validate it
   * @param {Object} keystoreData - Keystore upload data
   * @param {Object} keystoreData.keyStoreFile - File object from previous upload
   * @param {string} keystoreData.keyStorePassword - Keystore password
   * @returns {Promise<Object>} Upload response
   */
  async uploadKeystore(keystoreData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'keystore_upload',
        keystoreData,
        { platform: 'android' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Make API request
      const response = await this.apiClient.put(
        `v2/apps/${this.config.appId}/submissions/${this.config.submissionId}/keystore`,
        keystoreData
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'keystore_upload',
        response
      );

      // Update state
      this.stateManager.setState('keystoreUploadResult', transformedResponse);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'uploadKeystore'
      });
      throw error;
    }
  }

  /**
   * Upload Google Services configuration file for Android
   * @param {Object} googleServicesData - Google Services file data
   * @param {string} googleServicesData.name - File name
   * @param {File} googleServicesData.file - Google Services JSON file
   * @returns {Promise<Object>} Upload response
   */
  async uploadGoogleServices(googleServicesData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'google_services_upload',
        googleServicesData,
        { platform: 'android' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name[0]', googleServicesData.name);
      formData.append('files[0]', googleServicesData.file);

      // Make API request
      const response = await this.apiClient.post(
        'v1/media/files',
        formData,
        {
          appId: this.config.appId,
          name: googleServicesData.name
        }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'google_services_upload',
        response
      );

      // Update state
      this.stateManager.setState('googleServicesFile', transformedResponse.files[0]);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'uploadGoogleServices'
      });
      throw error;
    }
  }

  /**
   * Upload iOS certificate file
   * @param {Object} certificateData - Certificate file data
   * @param {string} certificateData.name - File name
   * @param {File} certificateData.file - Certificate file (P12)
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

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name[0]', certificateData.name);
      formData.append('files[0]', certificateData.file);

      // Make API request
      const response = await this.apiClient.post(
        'v1/media/files',
        formData,
        {
          appId: this.config.appId,
          name: certificateData.name
        }
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'certificate_upload',
        response
      );

      // Update state
      this.stateManager.setState('certificateFile', transformedResponse.files[0]);

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'uploadCertificate'
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
      name: 'FileUploadApiService',
      version: '1.0.0',
      endpoints: [
        'uploadFile',
        'uploadKeystore',
        'uploadGoogleServices',
        'uploadCertificate'
      ]
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.FileUploadApiService = FileUploadApiService;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileUploadApiService;
}
