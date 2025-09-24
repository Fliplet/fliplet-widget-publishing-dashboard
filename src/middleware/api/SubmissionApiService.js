/**
 * SubmissionApiService - Wrapper for submission-related API endpoints
 *
 * Features:
 * - Initialize submissions for iOS and Android
 * - Submit metadata and store configuration
 * - Trigger build processes
 * - Retrieve submission data and status
 * - Cancel active submissions
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

class SubmissionApiService extends BaseMiddlewareClass {
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validate required dependencies
    if (!dependencies.apiClient) {
      throw new Error('SubmissionApiService requires apiClient dependency');
    }
    if (!dependencies.errorHandler) {
      throw new Error('SubmissionApiService requires errorHandler dependency');
    }
    if (!dependencies.stateManager) {
      throw new Error('SubmissionApiService requires stateManager dependency');
    }
    if (!dependencies.validationEngine) {
      throw new Error('SubmissionApiService requires validationEngine dependency');
    }
    if (!dependencies.dataMapper) {
      throw new Error('SubmissionApiService requires dataMapper dependency');
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
      ...config
    };

    // Bind methods
    this.initializeSubmission = this.initializeSubmission.bind(this);
    this.submitMetadata = this.submitMetadata.bind(this);
    this.triggerBuild = this.triggerBuild.bind(this);
    this.getSubmissions = this.getSubmissions.bind(this);
    this.getLatestSubmission = this.getLatestSubmission.bind(this);
    this.getSubmissionById = this.getSubmissionById.bind(this);
    this.cancelSubmission = this.cancelSubmission.bind(this);
  }

  /**
   * Initialize a new submission
   * @param {Object} submissionData - Submission initialization data
   * @param {string} submissionData.platform - Platform type (ios/android)
   * @param {string} submissionData.type - Submission type (appStore)
   * @param {string} [submissionData.teamId] - Team ID (required for iOS)
   * @returns {Promise<Object>} Initialized submission data
   */
  async initializeSubmission(submissionData) {
    try {
      // Validate required fields
      const validation = this.validationEngine.validate(
        'submission_initialize',
        submissionData,
        { platform: submissionData.platform || 'ios' }
      );

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Make API request
      const response = await this.apiClient.post(
        `v2/apps/${this.config.appId}/submissions/initialize`,
        submissionData
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'submission',
        response
      );

      // Update state
      if (transformedResponse.submission) {
        this.stateManager.setState('currentSubmission', transformedResponse.submission);
      }

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'initializeSubmission',
        ...submissionData
      });
      throw error;
    }
  }

  /**
   * Submit metadata for a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} metadata - Metadata to submit
   * @param {string} metadata.validationType - Validation type (APP_METADATA)
   * @param {Object} metadata.data - Metadata data
   * @returns {Promise<Object>} Submission response
   */
  async submitMetadata(submissionId, metadata) {
    try {
      // Make API request
      const response = await this.apiClient.put(
        `v2/apps/${this.config.appId}/submissions/${submissionId}/metadata`,
        metadata
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'submission',
        response
      );

      // Update state
      if (transformedResponse.submission) {
        this.stateManager.setState('currentSubmission', transformedResponse.submission);
      }

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'submitMetadata',
        submissionId
      });
      throw error;
    }
  }

  /**
   * Trigger build for a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} [buildOptions] - Build options
   * @param {boolean} [buildOptions.debug] - Whether to create debug build
   * @returns {Promise<Object>} Build response
   */
  async triggerBuild(submissionId, buildOptions = {}) {
    try {
      // Make API request
      const response = await this.apiClient.post(
        `v2/apps/${this.config.appId}/submissions/${submissionId}/build`,
        buildOptions
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'submission',
        response
      );

      // Update state
      if (transformedResponse.submission) {
        this.stateManager.setState('currentSubmission', transformedResponse.submission);
      }

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'triggerBuild',
        submissionId
      });
      throw error;
    }
  }

  /**
   * Get list of submissions
   * @param {Object} [filters] - Filter options
   * @param {string} filters.platform - Platform type (ios/android)
   * @param {string} [filters.status] - Status filter (comma-separated)
   * @param {string} [filters.type] - Submission type (default: appStore)
   * @returns {Promise<Object>} Submissions list
   */
  async getSubmissions(filters = {}) {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/apps/${this.config.appId}/submissions/`,
        filters
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'submissions_list',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getSubmissions'
      });
      throw error;
    }
  }

  /**
   * Get latest submission for a platform
   * @param {Object} [filters] - Filter options
   * @param {string} filters.platform - Platform type (ios/android)
   * @param {string} [filters.type] - Submission type (default: appStore)
   * @returns {Promise<Object>} Latest submission
   */
  async getLatestSubmission(filters = {}) {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/apps/${this.config.appId}/submissions/latest`,
        filters
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'submission',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getLatestSubmission',
        ...filters
      });
      throw error;
    }
  }

  /**
   * Get submission by ID
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Submission data
   */
  async getSubmissionById(submissionId) {
    try {
      // Make API request
      const response = await this.apiClient.get(
        `v2/apps/${this.config.appId}/submissions/${submissionId}`
      );

      // Transform response
      const transformedResponse = this.dataMapper.transformApiResponse(
        'submission',
        response
      );

      return transformedResponse;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'getSubmissionById',
        submissionId
      });
      throw error;
    }
  }

  /**
   * Cancel a submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Cancel response
   */
  async cancelSubmission(submissionId) {
    try {
      // Make API request
      const response = await this.apiClient.delete(
        `v1/apps/${this.config.appId}/submissions/${submissionId}`
      );

      return response;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'cancelSubmission',
        submissionId
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
      name: 'SubmissionApiService',
      version: '1.0.0',
      endpoints: [
        'initializeSubmission',
        'submitMetadata',
        'triggerBuild',
        'getSubmissions',
        'getLatestSubmission',
        'getSubmissionById',
        'cancelSubmission'
      ]
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.SubmissionApiService = SubmissionApiService;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubmissionApiService;
}
