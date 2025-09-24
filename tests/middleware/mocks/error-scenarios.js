/**
 * Mock Error Scenarios
 *
 * Comprehensive error scenarios for testing error handling,
 * recovery mechanisms, and edge cases.
 */

/**
 * Network and connectivity error scenarios
 */
const NETWORK_ERRORS = {
  CONNECTION_TIMEOUT: {
    name: 'NetworkError',
    message: 'Network request failed',
    code: 'NETWORK_TIMEOUT',
    status: 0,
    timeout: true,
    retryable: true
  },

  CONNECTION_REFUSED: {
    name: 'NetworkError',
    message: 'Connection refused by server',
    code: 'CONNECTION_REFUSED',
    status: 0,
    retryable: false
  },

  DNS_RESOLUTION_FAILED: {
    name: 'NetworkError',
    message: 'Failed to resolve DNS for api.fliplet.com',
    code: 'DNS_RESOLUTION_FAILED',
    status: 0,
    retryable: true
  },

  NETWORK_UNREACHABLE: {
    name: 'NetworkError',
    message: 'Network is unreachable',
    code: 'NETWORK_UNREACHABLE',
    status: 0,
    retryable: true
  }
};

/**
 * HTTP status code error scenarios
 */
const HTTP_ERRORS = {
  BAD_REQUEST: {
    name: 'HTTPError',
    message: 'Bad Request',
    code: 'BAD_REQUEST',
    status: 400,
    retryable: false,
    response: {
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request validation failed',
        details: [
          {
            field: 'bundleId',
            code: 'REQUIRED',
            message: 'Bundle ID is required'
          }
        ]
      }
    }
  },

  UNAUTHORIZED: {
    name: 'HTTPError',
    message: 'Unauthorized',
    code: 'UNAUTHORIZED',
    status: 401,
    retryable: false,
    response: {
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid or expired authentication token',
        details: 'Token expired at 2023-01-01T10:00:00.000Z'
      }
    }
  },

  FORBIDDEN: {
    name: 'HTTPError',
    message: 'Forbidden',
    code: 'FORBIDDEN',
    status: 403,
    retryable: false,
    response: {
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to access this resource',
        details: 'User does not have access to team ABC1234567'
      }
    }
  },

  NOT_FOUND: {
    name: 'HTTPError',
    message: 'Not Found',
    code: 'NOT_FOUND',
    status: 404,
    retryable: false,
    response: {
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'The requested resource was not found',
        resource: 'submission',
        id: 'submission_nonexistent'
      }
    }
  },

  CONFLICT: {
    name: 'HTTPError',
    message: 'Conflict',
    code: 'CONFLICT',
    status: 409,
    retryable: false,
    response: {
      error: {
        code: 'RESOURCE_CONFLICT',
        message: 'Bundle ID already exists',
        details: 'Bundle ID com.test.app is already registered'
      }
    }
  },

  UNPROCESSABLE_ENTITY: {
    name: 'HTTPError',
    message: 'Unprocessable Entity',
    code: 'UNPROCESSABLE_ENTITY',
    status: 422,
    retryable: false,
    response: {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        validationErrors: [
          {
            field: 'version',
            code: 'INVALID_FORMAT',
            message: 'Version must follow semantic versioning format'
          },
          {
            field: 'buildNumber',
            code: 'MUST_BE_INCREMENTED',
            message: 'Build number must be greater than current build number'
          }
        ]
      }
    }
  },

  RATE_LIMITED: {
    name: 'HTTPError',
    message: 'Too Many Requests',
    code: 'RATE_LIMITED',
    status: 429,
    retryable: true,
    response: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        retryAfter: 60,
        limit: 100,
        window: 3600
      }
    }
  },

  INTERNAL_SERVER_ERROR: {
    name: 'HTTPError',
    message: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    retryable: true,
    response: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId: 'req_123456789',
        timestamp: '2023-01-01T12:00:00.000Z'
      }
    }
  },

  BAD_GATEWAY: {
    name: 'HTTPError',
    message: 'Bad Gateway',
    code: 'BAD_GATEWAY',
    status: 502,
    retryable: true,
    response: {
      error: {
        code: 'GATEWAY_ERROR',
        message: 'Upstream service is unavailable',
        service: 'apple-api'
      }
    }
  },

  SERVICE_UNAVAILABLE: {
    name: 'HTTPError',
    message: 'Service Unavailable',
    code: 'SERVICE_UNAVAILABLE',
    status: 503,
    retryable: true,
    response: {
      error: {
        code: 'SERVICE_MAINTENANCE',
        message: 'Service is temporarily unavailable for maintenance',
        retryAfter: 300
      }
    }
  },

  GATEWAY_TIMEOUT: {
    name: 'HTTPError',
    message: 'Gateway Timeout',
    code: 'GATEWAY_TIMEOUT',
    status: 504,
    retryable: true,
    response: {
      error: {
        code: 'GATEWAY_TIMEOUT',
        message: 'Upstream service did not respond in time',
        timeout: 30000
      }
    }
  }
};

/**
 * API-specific error scenarios
 */
const API_SPECIFIC_ERRORS = {
  // iOS API Key errors
  API_KEYS: {
    INVALID_TEAM_ID: {
      name: 'APIError',
      message: 'Invalid Team ID',
      code: 'INVALID_TEAM_ID',
      status: 400,
      retryable: false,
      response: {
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Team ID ABC1234567 does not exist or is not accessible',
          teamId: 'ABC1234567'
        }
      }
    },

    KEY_EXPIRED: {
      name: 'APIError',
      message: 'API Key Expired',
      code: 'API_KEY_EXPIRED',
      status: 401,
      retryable: false,
      response: {
        error: {
          code: 'KEY_EXPIRED',
          message: 'API key has expired',
          keyId: 'key_123',
          expiredAt: '2023-01-01T00:00:00.000Z'
        }
      }
    },

    INSUFFICIENT_SCOPE: {
      name: 'APIError',
      message: 'Insufficient API Key Scope',
      code: 'INSUFFICIENT_SCOPE',
      status: 403,
      retryable: false,
      response: {
        error: {
          code: 'INSUFFICIENT_SCOPE',
          message: 'API key does not have required scope',
          required: 'app-store-connect',
          available: ['developer-portal']
        }
      }
    }
  },

  // Certificate errors
  CERTIFICATES: {
    BUNDLE_ID_EXISTS: {
      name: 'APIError',
      message: 'Bundle ID Already Exists',
      code: 'BUNDLE_ID_EXISTS',
      status: 409,
      retryable: false,
      response: {
        error: {
          code: 'BUNDLE_ID_CONFLICT',
          message: 'Bundle ID is already registered',
          bundleId: 'com.test.app',
          existingAppName: 'Existing Test App'
        }
      }
    },

    CERTIFICATE_LIMIT_REACHED: {
      name: 'APIError',
      message: 'Certificate Limit Reached',
      code: 'CERTIFICATE_LIMIT_REACHED',
      status: 429,
      retryable: false,
      response: {
        error: {
          code: 'CERTIFICATE_LIMIT_EXCEEDED',
          message: 'Maximum number of distribution certificates reached',
          limit: 3,
          current: 3,
          teamId: 'ABC1234567'
        }
      }
    },

    INVALID_CSR: {
      name: 'APIError',
      message: 'Invalid Certificate Signing Request',
      code: 'INVALID_CSR',
      status: 400,
      retryable: false,
      response: {
        error: {
          code: 'INVALID_CSR_FORMAT',
          message: 'Certificate signing request format is invalid',
          details: 'CSR must be in PEM format'
        }
      }
    }
  },

  // Build errors
  BUILDS: {
    BUILD_QUEUE_FULL: {
      name: 'APIError',
      message: 'Build Queue Full',
      code: 'BUILD_QUEUE_FULL',
      status: 503,
      retryable: true,
      response: {
        error: {
          code: 'QUEUE_CAPACITY_EXCEEDED',
          message: 'Build queue is at capacity',
          queueSize: 100,
          estimatedWaitTime: 1800000 // 30 minutes
        }
      }
    },

    BUILD_TIMEOUT: {
      name: 'APIError',
      message: 'Build Timeout',
      code: 'BUILD_TIMEOUT',
      status: 408,
      retryable: false,
      response: {
        error: {
          code: 'BUILD_EXECUTION_TIMEOUT',
          message: 'Build exceeded maximum execution time',
          buildId: 'build_timeout_123',
          maxDuration: 1800000, // 30 minutes
          actualDuration: 1800001
        }
      }
    },

    COMPILATION_ERROR: {
      name: 'APIError',
      message: 'Build Compilation Failed',
      code: 'COMPILATION_ERROR',
      status: 422,
      retryable: false,
      response: {
        error: {
          code: 'COMPILATION_FAILED',
          message: 'App compilation failed',
          buildId: 'build_failed_123',
          errors: [
            {
              file: 'ViewController.swift',
              line: 25,
              column: 10,
              message: 'Use of unresolved identifier \'undefinedVariable\''
            }
          ],
          logs: [
            '2023-01-01T11:00:00.000Z [INFO] Starting compilation',
            '2023-01-01T11:02:30.000Z [ERROR] Compilation failed'
          ]
        }
      }
    },

    SIGNING_ERROR: {
      name: 'APIError',
      message: 'Code Signing Failed',
      code: 'SIGNING_ERROR',
      status: 422,
      retryable: false,
      response: {
        error: {
          code: 'CODE_SIGNING_FAILED',
          message: 'Failed to sign the application',
          buildId: 'build_signing_123',
          details: 'Certificate not found in keychain',
          certificateId: 'cert_missing_123'
        }
      }
    }
  },

  // File upload errors
  FILE_UPLOAD: {
    FILE_TOO_LARGE: {
      name: 'APIError',
      message: 'File Too Large',
      code: 'FILE_TOO_LARGE',
      status: 413,
      retryable: false,
      response: {
        error: {
          code: 'FILE_SIZE_EXCEEDED',
          message: 'File size exceeds maximum allowed',
          maxSize: 10485760, // 10MB
          actualSize: 15728640, // 15MB
          filename: 'large-icon.png'
        }
      }
    },

    UNSUPPORTED_FILE_TYPE: {
      name: 'APIError',
      message: 'Unsupported File Type',
      code: 'UNSUPPORTED_FILE_TYPE',
      status: 415,
      retryable: false,
      response: {
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'File type is not supported',
          supportedTypes: ['image/png', 'image/jpeg'],
          actualType: 'image/gif',
          filename: 'animated-icon.gif'
        }
      }
    },

    CORRUPTED_FILE: {
      name: 'APIError',
      message: 'Corrupted File',
      code: 'CORRUPTED_FILE',
      status: 422,
      retryable: false,
      response: {
        error: {
          code: 'FILE_CORRUPTION_DETECTED',
          message: 'File appears to be corrupted',
          filename: 'corrupted-icon.png',
          details: 'Invalid PNG header'
        }
      }
    },

    UPLOAD_INTERRUPTED: {
      name: 'APIError',
      message: 'Upload Interrupted',
      code: 'UPLOAD_INTERRUPTED',
      status: 500,
      retryable: true,
      response: {
        error: {
          code: 'UPLOAD_CONNECTION_LOST',
          message: 'File upload was interrupted',
          uploadId: 'upload_interrupted_123',
          bytesUploaded: 5242880, // 5MB
          totalSize: 10485760, // 10MB
          resumeUrl: 'https://upload.example.com/resume/upload_interrupted_123'
        }
      }
    }
  }
};

/**
 * Workflow-specific error scenarios
 */
const WORKFLOW_ERRORS = {
  STEP_PREREQUISITE_FAILED: {
    name: 'WorkflowError',
    message: 'Step prerequisite not met',
    code: 'PREREQUISITE_NOT_MET',
    step: 'generate-certificate',
    prerequisite: 'setup-api-key',
    details: 'API key setup step must be completed before certificate generation'
  },

  STEP_TIMEOUT: {
    name: 'WorkflowError',
    message: 'Step execution timeout',
    code: 'STEP_TIMEOUT',
    step: 'start-build',
    timeout: 30000,
    actualDuration: 30001,
    details: 'Step exceeded maximum execution time'
  },

  WORKFLOW_CANCELLED: {
    name: 'WorkflowError',
    message: 'Workflow was cancelled',
    code: 'WORKFLOW_CANCELLED',
    workflowId: 'workflow_cancelled_123',
    cancelledAt: '2023-01-01T12:00:00.000Z',
    reason: 'User cancelled workflow',
    completedSteps: 3,
    totalSteps: 8
  },

  INVALID_WORKFLOW_STATE: {
    name: 'WorkflowError',
    message: 'Invalid workflow state',
    code: 'INVALID_WORKFLOW_STATE',
    workflowId: 'workflow_invalid_123',
    currentState: 'failed',
    requestedAction: 'resume',
    validStates: ['in-progress', 'paused']
  },

  CONCURRENT_WORKFLOW_LIMIT: {
    name: 'WorkflowError',
    message: 'Concurrent workflow limit exceeded',
    code: 'CONCURRENT_LIMIT_EXCEEDED',
    limit: 3,
    activeWorkflows: 3,
    details: 'Maximum number of concurrent workflows reached'
  }
};

/**
 * Validation error scenarios
 */
const VALIDATION_ERRORS = {
  MISSING_REQUIRED_FIELDS: {
    name: 'ValidationError',
    message: 'Required fields are missing',
    code: 'VALIDATION_FAILED',
    errors: [
      {
        field: 'bundleId',
        code: 'REQUIRED',
        message: 'Bundle ID is required'
      },
      {
        field: 'appStoreTeamId',
        code: 'REQUIRED',
        message: 'App Store Team ID is required'
      }
    ]
  },

  INVALID_FIELD_FORMATS: {
    name: 'ValidationError',
    message: 'Field format validation failed',
    code: 'VALIDATION_FAILED',
    errors: [
      {
        field: 'bundleId',
        code: 'INVALID_FORMAT',
        message: 'Bundle ID must be in reverse domain format',
        value: 'invalid..bundle..id'
      },
      {
        field: 'version',
        code: 'INVALID_FORMAT',
        message: 'Version must follow semantic versioning',
        value: 'not.a.version'
      }
    ]
  },

  BUSINESS_RULE_VIOLATIONS: {
    name: 'ValidationError',
    message: 'Business rule validation failed',
    code: 'BUSINESS_RULE_VIOLATION',
    errors: [
      {
        rule: 'VERSION_PROGRESSION',
        code: 'VERSION_NOT_PROGRESSIVE',
        message: 'New version must be greater than current version',
        currentVersion: '1.0.0',
        newVersion: '0.9.0'
      },
      {
        rule: 'BUILD_NUMBER_INCREMENT',
        code: 'BUILD_NUMBER_NOT_INCREMENTED',
        message: 'Build number must be incremented',
        currentBuildNumber: 5,
        newBuildNumber: 3
      }
    ]
  }
};

/**
 * State management error scenarios
 */
const STATE_ERRORS = {
  STORAGE_QUOTA_EXCEEDED: {
    name: 'StorageError',
    message: 'Storage quota exceeded',
    code: 'QUOTA_EXCEEDED',
    used: 5242880, // 5MB
    limit: 5242880, // 5MB
    operation: 'setState'
  },

  STORAGE_UNAVAILABLE: {
    name: 'StorageError',
    message: 'Storage is not available',
    code: 'STORAGE_UNAVAILABLE',
    reason: 'localStorage is disabled',
    fallback: 'memory'
  },

  CORRUPTED_STATE: {
    name: 'StateError',
    message: 'State data is corrupted',
    code: 'STATE_CORRUPTED',
    key: 'workflows',
    error: 'JSON.parse failed',
    recovery: 'reset to default state'
  },

  CONCURRENT_STATE_MODIFICATION: {
    name: 'StateError',
    message: 'Concurrent state modification detected',
    code: 'CONCURRENT_MODIFICATION',
    key: 'workflows',
    expectedVersion: 5,
    actualVersion: 7
  }
};

/**
 * Get error scenario by category and type
 * @param {string} category - Error category
 * @param {string} type - Error type
 * @returns {Object} Error scenario
 */
function getErrorScenario(category, type) {
  const categories = {
    NETWORK: NETWORK_ERRORS,
    HTTP: HTTP_ERRORS,
    API: API_SPECIFIC_ERRORS,
    WORKFLOW: WORKFLOW_ERRORS,
    VALIDATION: VALIDATION_ERRORS,
    STATE: STATE_ERRORS
  };

  const categoryErrors = categories[category.toUpperCase()];
  if (!categoryErrors) {
    throw new Error(`Error category not found: ${category}`);
  }

  // Handle nested API errors
  if (category.toUpperCase() === 'API' && typeof categoryErrors[type] === 'object' && !categoryErrors[type].name) {
    return categoryErrors[type];
  }

  const error = categoryErrors[type];
  if (!error) {
    throw new Error(`Error type '${type}' not found in category '${category}'`);
  }

  return JSON.parse(JSON.stringify(error)); // Deep clone
}

/**
 * Create mock error object
 * @param {Object} errorScenario - Error scenario
 * @returns {Error} Mock error object
 */
function createMockError(errorScenario) {
  const error = new Error(errorScenario.message);
  error.name = errorScenario.name;
  error.code = errorScenario.code;

  if (errorScenario.status) {
    error.status = errorScenario.status;
    error.statusCode = errorScenario.status;
  }

  if (errorScenario.response) {
    error.response = {
      status: errorScenario.status,
      data: errorScenario.response
    };
  }

  if (errorScenario.retryable !== undefined) {
    error.retryable = errorScenario.retryable;
  }

  // Copy additional properties
  Object.keys(errorScenario).forEach(key => {
    if (!['name', 'message', 'code', 'status', 'response', 'retryable'].includes(key)) {
      error[key] = errorScenario[key];
    }
  });

  return error;
}

/**
 * Get random error from category
 * @param {string} category - Error category
 * @returns {Object} Random error scenario
 */
function getRandomError(category) {
  const categories = {
    NETWORK: NETWORK_ERRORS,
    HTTP: HTTP_ERRORS,
    WORKFLOW: WORKFLOW_ERRORS,
    VALIDATION: VALIDATION_ERRORS,
    STATE: STATE_ERRORS
  };

  const categoryErrors = categories[category.toUpperCase()];
  if (!categoryErrors) {
    throw new Error(`Error category not found: ${category}`);
  }

  const errorTypes = Object.keys(categoryErrors);
  const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];

  return getErrorScenario(category, randomType);
}

/**
 * Check if error is retryable
 * @param {Object} errorScenario - Error scenario
 * @returns {boolean} True if retryable
 */
function isRetryableError(errorScenario) {
  return errorScenario.retryable === true;
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NETWORK_ERRORS,
    HTTP_ERRORS,
    API_SPECIFIC_ERRORS,
    WORKFLOW_ERRORS,
    VALIDATION_ERRORS,
    STATE_ERRORS,
    getErrorScenario,
    createMockError,
    getRandomError,
    isRetryableError
  };
}

if (typeof window !== 'undefined') {
  window.MockErrorScenarios = {
    NETWORK_ERRORS,
    HTTP_ERRORS,
    API_SPECIFIC_ERRORS,
    WORKFLOW_ERRORS,
    VALIDATION_ERRORS,
    STATE_ERRORS,
    getErrorScenario,
    createMockError,
    getRandomError,
    isRetryableError
  };
}