/**
 * API Endpoints Configuration
 *
 * Centralized configuration for all API endpoints used by the publishing middleware.
 * Includes URL templates, HTTP methods, and endpoint metadata.
 */

/**
 * API endpoint definitions organized by service type
 */
const ENDPOINTS = {
  // Submission API endpoints
  SUBMISSION: {
    INITIALIZE: {
      path: '/v1/submissions',
      method: 'POST',
      description: 'Initialize a new submission',
      timeout: 30000,
      retryable: true
    },
    GET_SUBMISSION: {
      path: '/v1/submissions/{submissionId}',
      method: 'GET',
      description: 'Get submission details',
      timeout: 10000,
      retryable: true
    },
    UPDATE_METADATA: {
      path: '/v1/submissions/{submissionId}/metadata',
      method: 'PUT',
      description: 'Update submission metadata',
      timeout: 30000,
      retryable: true
    },
    START_BUILD: {
      path: '/v1/submissions/{submissionId}/build',
      method: 'POST',
      description: 'Start build process',
      timeout: 30000,
      retryable: false
    },
    GET_BUILD: {
      path: '/v1/builds/{buildId}',
      method: 'GET',
      description: 'Get build status and details',
      timeout: 10000,
      retryable: true
    },
    CANCEL_BUILD: {
      path: '/v1/builds/{buildId}/cancel',
      method: 'POST',
      description: 'Cancel running build',
      timeout: 15000,
      retryable: true
    },
    GET_BUILD_LOGS: {
      path: '/v1/builds/{buildId}/logs',
      method: 'GET',
      description: 'Get build logs',
      timeout: 10000,
      retryable: true
    }
  },

  // iOS API Key Management
  API_KEYS: {
    LIST: {
      path: '/v1/ios/api-keys',
      method: 'GET',
      description: 'List iOS API keys',
      timeout: 15000,
      retryable: true
    },
    CREATE: {
      path: '/v1/ios/api-keys',
      method: 'POST',
      description: 'Create new iOS API key',
      timeout: 30000,
      retryable: true
    },
    GET: {
      path: '/v1/ios/api-keys/{keyId}',
      method: 'GET',
      description: 'Get API key details',
      timeout: 10000,
      retryable: true
    },
    UPDATE: {
      path: '/v1/ios/api-keys/{keyId}',
      method: 'PUT',
      description: 'Update API key',
      timeout: 20000,
      retryable: true
    },
    DELETE: {
      path: '/v1/ios/api-keys/{keyId}',
      method: 'DELETE',
      description: 'Delete API key',
      timeout: 15000,
      retryable: true
    },
    VALIDATE: {
      path: '/v1/ios/api-keys/{keyId}/validate',
      method: 'POST',
      description: 'Validate API key',
      timeout: 15000,
      retryable: true
    }
  },

  // iOS Certificate Management
  CERTIFICATES: {
    LIST: {
      path: '/v1/ios/certificates',
      method: 'GET',
      description: 'List iOS certificates',
      timeout: 15000,
      retryable: true
    },
    CHECK: {
      path: '/v1/ios/certificates/check',
      method: 'POST',
      description: 'Check certificate status',
      timeout: 20000,
      retryable: true
    },
    GENERATE: {
      path: '/v1/ios/certificates',
      method: 'POST',
      description: 'Generate new certificate',
      timeout: 60000,
      retryable: true
    },
    GET: {
      path: '/v1/ios/certificates/{certificateId}',
      method: 'GET',
      description: 'Get certificate details',
      timeout: 10000,
      retryable: true
    },
    UPLOAD: {
      path: '/v1/ios/certificates/upload',
      method: 'POST',
      description: 'Upload certificate file',
      timeout: 30000,
      retryable: true
    },
    GET_BUNDLE_IDS: {
      path: '/v1/ios/bundle-ids',
      method: 'GET',
      description: 'List bundle IDs',
      timeout: 15000,
      retryable: true
    },
    CREATE_BUNDLE_ID: {
      path: '/v1/ios/bundle-ids',
      method: 'POST',
      description: 'Create bundle ID',
      timeout: 30000,
      retryable: true
    }
  },

  // Push Notification Configuration
  PUSH_NOTIFICATIONS: {
    CONFIGURE_IOS: {
      path: '/v1/push/ios/configure',
      method: 'POST',
      description: 'Configure iOS push notifications',
      timeout: 30000,
      retryable: true
    },
    CONFIGURE_ANDROID: {
      path: '/v1/push/android/configure',
      method: 'POST',
      description: 'Configure Android push notifications',
      timeout: 30000,
      retryable: true
    },
    GET_CONFIGURATION: {
      path: '/v1/push/{platform}/configuration',
      method: 'GET',
      description: 'Get push notification configuration',
      timeout: 10000,
      retryable: true
    },
    TEST_NOTIFICATION: {
      path: '/v1/push/{platform}/test',
      method: 'POST',
      description: 'Send test push notification',
      timeout: 15000,
      retryable: true
    }
  },

  // File Upload Services
  FILE_UPLOAD: {
    UPLOAD: {
      path: '/v1/files/upload',
      method: 'POST',
      description: 'Upload file',
      timeout: 120000, // 2 minutes for large files
      retryable: true
    },
    GET_UPLOAD_URL: {
      path: '/v1/files/upload-url',
      method: 'POST',
      description: 'Get signed upload URL',
      timeout: 10000,
      retryable: true
    },
    VALIDATE_FILE: {
      path: '/v1/files/validate',
      method: 'POST',
      description: 'Validate uploaded file',
      timeout: 30000,
      retryable: true
    },
    GET_FILE_INFO: {
      path: '/v1/files/{fileId}',
      method: 'GET',
      description: 'Get file information',
      timeout: 10000,
      retryable: true
    }
  },

  // App Permissions Management
  PERMISSIONS: {
    GET_APP_PERMISSIONS: {
      path: '/v1/apps/{appId}/permissions',
      method: 'GET',
      description: 'Get app permissions',
      timeout: 15000,
      retryable: true
    },
    UPDATE_APP_PERMISSIONS: {
      path: '/v1/apps/{appId}/permissions',
      method: 'POST',
      description: 'Update app permissions',
      timeout: 30000,
      retryable: true
    },
    RESET_PERMISSIONS: {
      path: '/v1/apps/{appId}/permissions/reset',
      method: 'POST',
      description: 'Reset app permissions to defaults',
      timeout: 20000,
      retryable: true
    },
    GET_PERMISSION_TEMPLATES: {
      path: '/v1/permissions/templates',
      method: 'GET',
      description: 'Get permission templates by app type',
      timeout: 10000,
      retryable: true
    }
  },

  // App Store Configuration
  APP_STORE: {
    IOS: {
      GET_APP_INFO: {
        path: '/v1/ios/apps/{bundleId}',
        method: 'GET',
        description: 'Get iOS app information',
        timeout: 15000,
        retryable: true
      },
      UPDATE_METADATA: {
        path: '/v1/ios/apps/{bundleId}/metadata',
        method: 'PUT',
        description: 'Update iOS app metadata',
        timeout: 30000,
        retryable: true
      },
      UPLOAD_BINARY: {
        path: '/v1/ios/apps/{bundleId}/binary',
        method: 'POST',
        description: 'Upload iOS app binary',
        timeout: 300000, // 5 minutes
        retryable: false
      }
    },
    ANDROID: {
      GET_APP_INFO: {
        path: '/v1/android/apps/{packageName}',
        method: 'GET',
        description: 'Get Android app information',
        timeout: 15000,
        retryable: true
      },
      UPDATE_METADATA: {
        path: '/v1/android/apps/{packageName}/metadata',
        method: 'PUT',
        description: 'Update Android app metadata',
        timeout: 30000,
        retryable: true
      },
      UPLOAD_APK: {
        path: '/v1/android/apps/{packageName}/apk',
        method: 'POST',
        description: 'Upload Android APK',
        timeout: 300000, // 5 minutes
        retryable: false
      },
      UPLOAD_AAB: {
        path: '/v1/android/apps/{packageName}/aab',
        method: 'POST',
        description: 'Upload Android App Bundle',
        timeout: 300000, // 5 minutes
        retryable: false
      }
    }
  },

  // Health and Status
  SYSTEM: {
    HEALTH: {
      path: '/health',
      method: 'GET',
      description: 'System health check',
      timeout: 5000,
      retryable: false
    },
    STATUS: {
      path: '/v1/status',
      method: 'GET',
      description: 'Service status',
      timeout: 10000,
      retryable: true
    },
    VERSION: {
      path: '/v1/version',
      method: 'GET',
      description: 'API version information',
      timeout: 5000,
      retryable: true
    }
  }
};

/**
 * Environment-specific base URLs
 */
const BASE_URLS = {
  development: {
    api: 'https://api-dev.fliplet.com',
    cdn: 'https://cdn-dev.fliplet.com',
    uploads: 'https://uploads-dev.fliplet.com'
  },
  staging: {
    api: 'https://api-staging.fliplet.com',
    cdn: 'https://cdn-staging.fliplet.com',
    uploads: 'https://uploads-staging.fliplet.com'
  },
  production: {
    api: 'https://api.fliplet.com',
    cdn: 'https://cdn.fliplet.com',
    uploads: 'https://uploads.fliplet.com'
  }
};

/**
 * Default request configuration
 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Fliplet-Publishing-Dashboard/1.0.0'
  }
};

/**
 * Build complete URL from endpoint configuration
 * @param {Object} endpoint - Endpoint configuration
 * @param {Object} params - URL parameters for substitution
 * @param {Object} options - Additional options
 * @returns {string} Complete URL
 */
function buildUrl(endpoint, params = {}, options = {}) {
  const environment = options.environment || 'production';
  const service = options.service || 'api';

  if (!BASE_URLS[environment] || !BASE_URLS[environment][service]) {
    throw new Error(`Invalid environment or service: ${environment}/${service}`);
  }

  const baseUrl = BASE_URLS[environment][service];
  let path = endpoint.path;

  // Replace path parameters
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`{${key}}`, encodeURIComponent(value));
  });

  // Check for unreplaced parameters
  const unreplacedParams = path.match(/\{[^}]+\}/g);
  if (unreplacedParams) {
    throw new Error(`Missing required parameters: ${unreplacedParams.join(', ')}`);
  }

  return `${baseUrl}${path}`;
}

/**
 * Get endpoint configuration by path
 * @param {string} endpointPath - Dot notation path (e.g., 'SUBMISSION.INITIALIZE')
 * @returns {Object} Endpoint configuration
 */
function getEndpoint(endpointPath) {
  const parts = endpointPath.split('.');
  let endpoint = ENDPOINTS;

  for (const part of parts) {
    if (!endpoint[part]) {
      throw new Error(`Endpoint not found: ${endpointPath}`);
    }
    endpoint = endpoint[part];
  }

  return endpoint;
}

/**
 * Get all endpoints for a service
 * @param {string} serviceName - Service name (e.g., 'SUBMISSION', 'API_KEYS')
 * @returns {Object} Service endpoints
 */
function getServiceEndpoints(serviceName) {
  if (!ENDPOINTS[serviceName]) {
    throw new Error(`Service not found: ${serviceName}`);
  }
  return ENDPOINTS[serviceName];
}

/**
 * Validate endpoint configuration
 * @param {Object} endpoint - Endpoint to validate
 * @returns {boolean} True if valid
 */
function validateEndpoint(endpoint) {
  const requiredFields = ['path', 'method', 'description'];

  for (const field of requiredFields) {
    if (!endpoint[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  if (!validMethods.includes(endpoint.method)) {
    throw new Error(`Invalid HTTP method: ${endpoint.method}`);
  }

  if (endpoint.timeout && (typeof endpoint.timeout !== 'number' || endpoint.timeout <= 0)) {
    throw new Error(`Invalid timeout value: ${endpoint.timeout}`);
  }

  return true;
}

/**
 * Get request configuration for endpoint
 * @param {Object} endpoint - Endpoint configuration
 * @param {Object} customConfig - Custom configuration overrides
 * @returns {Object} Request configuration
 */
function getRequestConfig(endpoint, customConfig = {}) {
  validateEndpoint(endpoint);

  return {
    ...DEFAULT_CONFIG,
    method: endpoint.method,
    timeout: endpoint.timeout || DEFAULT_CONFIG.timeout,
    retryable: endpoint.retryable !== false,
    ...customConfig
  };
}

/**
 * Get all available endpoints (flattened)
 * @returns {Object} All endpoints with dot notation keys
 */
function getAllEndpoints() {
  const flattened = {};

  function flatten(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value.path && value.method) {
        // This is an endpoint
        flattened[path] = value;
      } else {
        // This is a nested object
        flatten(value, path);
      }
    });
  }

  flatten(ENDPOINTS);
  return flattened;
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.EndpointsConfig = {
    ENDPOINTS,
    BASE_URLS,
    DEFAULT_CONFIG,
    buildUrl,
    getEndpoint,
    getServiceEndpoints,
    validateEndpoint,
    getRequestConfig,
    getAllEndpoints
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ENDPOINTS,
    BASE_URLS,
    DEFAULT_CONFIG,
    buildUrl,
    getEndpoint,
    getServiceEndpoints,
    validateEndpoint,
    getRequestConfig,
    getAllEndpoints
  };
}