/**
 * Mock API Response Data
 *
 * Comprehensive mock data for all API responses used in testing.
 * Includes successful responses, error scenarios, and edge cases.
 */

/**
 * Mock API responses for successful operations
 */
const MOCK_RESPONSES = {
  // Submission API responses
  SUBMISSION: {
    INITIALIZE: {
      success: {
        id: 'submission_123456',
        status: 'initialized',
        platform: 'ios',
        appId: 'com.test.app',
        version: '1.0.0',
        buildNumber: '1',
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T10:00:00.000Z',
        steps: [
          { id: 'validate-data', status: 'pending' },
          { id: 'setup-certificates', status: 'pending' },
          { id: 'build-app', status: 'pending' }
        ]
      },
      android: {
        id: 'submission_789012',
        status: 'initialized',
        platform: 'android',
        packageName: 'com.test.android',
        versionName: '1.0.0',
        versionCode: 1,
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T10:00:00.000Z',
        steps: [
          { id: 'validate-data', status: 'pending' },
          { id: 'setup-keystore', status: 'pending' },
          { id: 'build-app', status: 'pending' }
        ]
      }
    },

    GET_SUBMISSION: {
      success: {
        id: 'submission_123456',
        status: 'in-progress',
        platform: 'ios',
        progress: 65,
        currentStep: 'setup-certificates',
        completedSteps: 2,
        totalSteps: 5,
        metadata: {
          appName: 'Test App',
          bundleId: 'com.test.app',
          version: '1.0.0'
        },
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T10:30:00.000Z'
      }
    },

    START_BUILD: {
      success: {
        buildId: 'build_456789',
        submissionId: 'submission_123456',
        status: 'started',
        platform: 'ios',
        startedAt: '2023-01-01T11:00:00.000Z',
        estimatedDuration: 600000, // 10 minutes
        queuePosition: 0
      }
    },

    GET_BUILD: {
      running: {
        id: 'build_456789',
        status: 'running',
        progress: 45,
        logs: [
          '2023-01-01T11:00:00.000Z [INFO] Build started',
          '2023-01-01T11:01:00.000Z [INFO] Downloading dependencies',
          '2023-01-01T11:02:30.000Z [INFO] Compiling source code',
          '2023-01-01T11:04:00.000Z [INFO] Building for iOS platform'
        ],
        startedAt: '2023-01-01T11:00:00.000Z',
        estimatedCompletion: '2023-01-01T11:10:00.000Z'
      },
      completed: {
        id: 'build_456789',
        status: 'completed',
        progress: 100,
        artifacts: [
          {
            type: 'ipa',
            url: 'https://cdn.example.com/builds/build_456789/app.ipa',
            size: 45678901,
            checksum: 'sha256:abcd1234...'
          }
        ],
        logs: [
          '2023-01-01T11:00:00.000Z [INFO] Build started',
          '2023-01-01T11:09:45.000Z [INFO] Build completed successfully'
        ],
        startedAt: '2023-01-01T11:00:00.000Z',
        completedAt: '2023-01-01T11:09:45.000Z',
        duration: 585000
      },
      failed: {
        id: 'build_456789',
        status: 'failed',
        progress: 30,
        error: {
          code: 'BUILD_COMPILATION_ERROR',
          message: 'Compilation failed due to syntax errors',
          details: 'Error in ViewController.swift line 25: Expected } before end of file'
        },
        logs: [
          '2023-01-01T11:00:00.000Z [INFO] Build started',
          '2023-01-01T11:03:00.000Z [ERROR] Compilation failed'
        ],
        startedAt: '2023-01-01T11:00:00.000Z',
        failedAt: '2023-01-01T11:03:15.000Z'
      }
    }
  },

  // iOS API Key responses
  API_KEYS: {
    LIST: {
      success: [
        {
          id: 'key_123',
          name: 'iOS Publishing Key',
          teamId: 'ABC1234567',
          keyType: 'App Store Connect API',
          status: 'active',
          scopes: ['app-store-connect', 'developer-portal'],
          createdAt: '2023-01-01T09:00:00.000Z',
          expiresAt: '2024-01-01T09:00:00.000Z'
        },
        {
          id: 'key_456',
          name: 'Development Key',
          teamId: 'ABC1234567',
          keyType: 'App Store Connect API',
          status: 'active',
          scopes: ['developer-portal'],
          createdAt: '2022-12-01T10:00:00.000Z',
          expiresAt: '2023-12-01T10:00:00.000Z'
        }
      ]
    },

    CREATE: {
      success: {
        id: 'key_789',
        name: 'iOS Publishing Key - Test App',
        teamId: 'ABC1234567',
        keyType: 'App Store Connect API',
        status: 'active',
        scopes: ['app-store-connect', 'developer-portal'],
        keyContent: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----',
        createdAt: '2023-01-01T12:00:00.000Z',
        expiresAt: '2024-01-01T12:00:00.000Z'
      }
    },

    VALIDATE: {
      success: {
        isValid: true,
        keyId: 'key_123',
        permissions: ['app-store-connect', 'developer-portal'],
        teamAccess: true,
        expiresAt: '2024-01-01T09:00:00.000Z'
      },
      invalid: {
        isValid: false,
        error: 'Key has expired',
        expiresAt: '2022-12-31T23:59:59.000Z'
      }
    }
  },

  // Certificate API responses
  CERTIFICATES: {
    GET_BUNDLE_IDS: {
      success: [
        {
          id: 'bundle_123',
          identifier: 'com.test.app',
          name: 'Test App',
          platform: 'IOS',
          capabilities: [
            'PUSH_NOTIFICATIONS',
            'APP_GROUPS',
            'ASSOCIATED_DOMAINS'
          ],
          createdAt: '2023-01-01T08:00:00.000Z'
        }
      ]
    },

    CREATE_BUNDLE_ID: {
      success: {
        id: 'bundle_456',
        identifier: 'com.test.newapp',
        name: 'New Test App',
        platform: 'IOS',
        capabilities: [
          'PUSH_NOTIFICATIONS',
          'APP_GROUPS',
          'ASSOCIATED_DOMAINS'
        ],
        createdAt: '2023-01-01T12:30:00.000Z'
      }
    },

    CHECK: {
      success: [
        {
          id: 'cert_123',
          name: 'iOS Distribution Certificate',
          type: 'distribution',
          status: 'active',
          bundleId: 'com.test.app',
          serialNumber: '1A2B3C4D5E6F',
          createdAt: '2023-01-01T08:00:00.000Z',
          expiresAt: '2024-01-01T08:00:00.000Z'
        }
      ]
    },

    GENERATE: {
      success: {
        id: 'cert_456',
        name: 'Distribution Certificate - Test App',
        type: 'distribution',
        status: 'active',
        bundleId: 'com.test.app',
        serialNumber: '6F5E4D3C2B1A',
        certificateContent: '-----BEGIN CERTIFICATE-----\nMIIFmTCCA4GgAwIBAgI...\n-----END CERTIFICATE-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----',
        createdAt: '2023-01-01T13:00:00.000Z',
        expiresAt: '2024-01-01T13:00:00.000Z'
      }
    }
  },

  // Push Notification responses
  PUSH_NOTIFICATIONS: {
    CONFIGURE_IOS: {
      success: {
        id: 'push_config_123',
        platform: 'ios',
        bundleId: 'com.test.app',
        environment: 'production',
        status: 'configured',
        certificateId: 'cert_123',
        topic: 'com.test.app',
        createdAt: '2023-01-01T14:00:00.000Z'
      }
    },

    CONFIGURE_ANDROID: {
      success: {
        id: 'push_config_456',
        platform: 'android',
        packageName: 'com.test.android',
        status: 'configured',
        fcmProjectId: 'test-project-12345',
        serviceAccount: 'test-service@test-project.iam.gserviceaccount.com',
        createdAt: '2023-01-01T14:00:00.000Z'
      }
    },

    TEST_NOTIFICATION: {
      success: {
        messageId: 'msg_123456',
        status: 'sent',
        platform: 'ios',
        recipients: 1,
        sentAt: '2023-01-01T15:00:00.000Z'
      }
    }
  },

  // File Upload responses
  FILE_UPLOAD: {
    UPLOAD: {
      success: {
        id: 'file_123456',
        filename: 'app-icon.png',
        originalName: 'icon.png',
        mimeType: 'image/png',
        size: 51200,
        url: 'https://cdn.example.com/files/file_123456/app-icon.png',
        checksum: 'sha256:1234abcd...',
        uploadedAt: '2023-01-01T16:00:00.000Z'
      }
    },

    GET_UPLOAD_URL: {
      success: {
        uploadUrl: 'https://upload.example.com/signed-upload?token=abc123',
        method: 'POST',
        fields: {
          'Content-Type': 'image/png',
          'x-amz-meta-filename': 'app-icon.png'
        },
        expiresAt: '2023-01-01T17:00:00.000Z'
      }
    },

    VALIDATE_FILE: {
      success: {
        isValid: true,
        fileId: 'file_123456',
        validations: {
          format: 'passed',
          size: 'passed',
          dimensions: 'passed',
          content: 'passed'
        }
      },
      invalid: {
        isValid: false,
        errors: [
          {
            code: 'INVALID_DIMENSIONS',
            message: 'Image dimensions must be 1024x1024 pixels',
            actual: { width: 512, height: 512 }
          }
        ]
      }
    }
  },

  // Permission responses
  PERMISSIONS: {
    GET_APP_PERMISSIONS: {
      ios: {
        appId: 'com.test.app',
        platform: 'ios',
        permissions: {
          CAMERA: {
            enabled: true,
            description: 'Access camera for photo capture',
            required: false
          },
          LOCATION_WHEN_IN_USE: {
            enabled: true,
            description: 'Access location while app is in use',
            required: false
          },
          PUSH_NOTIFICATIONS: {
            enabled: true,
            description: 'Receive push notifications',
            required: false
          }
        },
        lastUpdated: '2023-01-01T10:00:00.000Z'
      },
      android: {
        appId: 'com.test.android',
        platform: 'android',
        permissions: {
          CAMERA: {
            enabled: true,
            description: 'Access camera for photo capture',
            required: false,
            dangerLevel: 'dangerous'
          },
          INTERNET: {
            enabled: true,
            description: 'Access internet connectivity',
            required: true,
            dangerLevel: 'normal'
          },
          ACCESS_FINE_LOCATION: {
            enabled: false,
            description: 'Access precise location using GPS',
            required: false,
            dangerLevel: 'dangerous'
          }
        },
        lastUpdated: '2023-01-01T10:00:00.000Z'
      }
    },

    UPDATE_APP_PERMISSIONS: {
      success: {
        appId: 'com.test.app',
        platform: 'ios',
        changeId: 'change_789012',
        status: 'applied',
        updatedPermissions: {
          CAMERA: {
            enabled: true,
            description: 'Camera access for photo features'
          }
        },
        appliedAt: '2023-01-01T17:00:00.000Z'
      }
    }
  },

  // System responses
  SYSTEM: {
    HEALTH: {
      success: {
        status: 'healthy',
        timestamp: '2023-01-01T18:00:00.000Z',
        services: {
          database: 'healthy',
          storage: 'healthy',
          queue: 'healthy',
          api: 'healthy'
        },
        uptime: 86400000 // 24 hours in milliseconds
      },
      unhealthy: {
        status: 'unhealthy',
        timestamp: '2023-01-01T18:00:00.000Z',
        services: {
          database: 'healthy',
          storage: 'degraded',
          queue: 'unhealthy',
          api: 'healthy'
        },
        errors: [
          {
            service: 'queue',
            error: 'Connection timeout',
            since: '2023-01-01T17:45:00.000Z'
          }
        ]
      }
    },

    VERSION: {
      success: {
        version: '1.0.0',
        build: '2023010118',
        environment: 'production',
        features: {
          'ios-publishing': true,
          'android-publishing': true,
          'permission-management': true,
          'file-upload': true
        }
      }
    }
  }
};

/**
 * Mock state data for testing
 */
const MOCK_STATE_DATA = {
  // Initial empty state
  EMPTY_STATE: {
    workflows: {},
    activeWorkflow: null,
    workflowHistory: [],
    appPermissions: {},
    uploadedFiles: {},
    validationCache: {}
  },

  // State with active iOS workflow
  IOS_WORKFLOW_STATE: {
    workflows: {
      'workflow_123': {
        id: 'workflow_123',
        type: 'ios-publishing',
        status: 'in-progress',
        currentStep: 2,
        steps: [
          { name: 'validate-data', status: 'completed', startTime: '2023-01-01T10:00:00.000Z', endTime: '2023-01-01T10:01:00.000Z' },
          { name: 'setup-api-key', status: 'completed', startTime: '2023-01-01T10:01:00.000Z', endTime: '2023-01-01T10:03:00.000Z' },
          { name: 'configure-bundle-id', status: 'in-progress', startTime: '2023-01-01T10:03:00.000Z', endTime: null },
          { name: 'generate-certificate', status: 'pending', startTime: null, endTime: null }
        ],
        context: {
          platform: 'ios',
          appName: 'Test App',
          bundleId: 'com.test.app',
          appStoreTeamId: 'ABC1234567',
          apiKeyId: 'key_123'
        },
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: null
      }
    },
    activeWorkflow: 'workflow_123',
    workflowHistory: ['workflow_123'],
    appPermissions: {},
    uploadedFiles: {},
    validationCache: {}
  },

  // State with completed Android workflow
  ANDROID_COMPLETED_STATE: {
    workflows: {
      'workflow_456': {
        id: 'workflow_456',
        type: 'android-publishing',
        status: 'completed',
        currentStep: 8,
        steps: [
          { name: 'validate-data', status: 'completed' },
          { name: 'initialize-submission', status: 'completed' },
          { name: 'configure-play-store', status: 'completed' },
          { name: 'setup-metadata', status: 'completed' },
          { name: 'setup-keystore', status: 'completed' },
          { name: 'configure-push', status: 'completed' },
          { name: 'finalize-submission', status: 'completed' },
          { name: 'start-build', status: 'completed' }
        ],
        context: {
          platform: 'android',
          appName: 'Test Android App',
          packageName: 'com.test.android',
          playStoreServiceAccount: 'service@test-project.iam.gserviceaccount.com',
          submissionId: 'submission_789012',
          buildId: 'build_789012'
        },
        startTime: '2023-01-01T09:00:00.000Z',
        endTime: '2023-01-01T09:15:00.000Z'
      }
    },
    activeWorkflow: null,
    workflowHistory: ['workflow_456'],
    appPermissions: {},
    uploadedFiles: {},
    validationCache: {}
  },

  // State with app permissions
  PERMISSIONS_STATE: {
    workflows: {},
    activeWorkflow: null,
    workflowHistory: [],
    appPermissions: {
      'com.test.app-ios': {
        permissions: {
          CAMERA: { enabled: true, description: 'Camera access' },
          LOCATION: { enabled: true, description: 'Location access' }
        },
        lastUpdated: '2023-01-01T12:00:00.000Z'
      },
      'com.test.android-android': {
        permissions: {
          CAMERA: { enabled: true, description: 'Camera access' },
          INTERNET: { enabled: true, description: 'Internet access' }
        },
        lastUpdated: '2023-01-01T12:00:00.000Z'
      }
    },
    uploadedFiles: {},
    validationCache: {}
  },

  // State with uploaded files
  FILES_STATE: {
    workflows: {},
    activeWorkflow: null,
    workflowHistory: [],
    appPermissions: {},
    uploadedFiles: {
      'app-icon': {
        id: 'file_123456',
        filename: 'app-icon.png',
        url: 'https://cdn.example.com/files/file_123456/app-icon.png',
        size: 51200,
        uploadedAt: '2023-01-01T16:00:00.000Z'
      },
      'screenshots': [
        {
          id: 'file_234567',
          filename: 'screenshot1.png',
          url: 'https://cdn.example.com/files/file_234567/screenshot1.png',
          size: 128000,
          uploadedAt: '2023-01-01T16:01:00.000Z'
        }
      ]
    },
    validationCache: {}
  }
};

/**
 * Mock submission data for testing
 */
const MOCK_SUBMISSION_DATA = {
  // Valid iOS submission
  IOS_VALID: {
    appName: 'Test iOS App',
    bundleId: 'com.test.iosapp',
    appStoreTeamId: 'ABC1234567',
    version: '1.0.0',
    buildNumber: '1',
    category: 'PRODUCTIVITY',
    contentRating: '4_PLUS',
    description: 'This is a test iOS application for demonstration purposes.',
    keywords: ['test', 'demo', 'ios', 'productivity'],
    developerName: 'Test Developer',
    developerEmail: 'developer@test.com',
    website: 'https://test.com',
    privacyPolicyUrl: 'https://test.com/privacy',
    supportEmail: 'support@test.com',
    pushNotifications: {
      enabled: true,
      environment: 'production'
    }
  },

  // Valid Android submission
  ANDROID_VALID: {
    appName: 'Test Android App',
    packageName: 'com.test.androidapp',
    playStoreServiceAccount: 'service@test-project.iam.gserviceaccount.com',
    versionName: '1.0.0',
    versionCode: 1,
    category: 'PRODUCTIVITY',
    contentRating: 'EVERYONE',
    releaseTrack: 'internal',
    description: 'This is a test Android application for demonstration purposes.',
    shortDescription: 'Test Android app for demos',
    recentChanges: 'Initial release',
    developerName: 'Test Developer',
    developerEmail: 'developer@test.com',
    website: 'https://test.com',
    privacyPolicyUrl: 'https://test.com/privacy',
    pushNotifications: {
      enabled: true,
      fcmServerKey: 'AAAA1234567890abcdef...'
    }
  },

  // Invalid submission data (missing required fields)
  INVALID_MISSING_FIELDS: {
    appName: 'Test App'
    // Missing required fields like bundleId/packageName, teamId/serviceAccount, etc.
  },

  // Invalid submission data (invalid formats)
  INVALID_FORMATS: {
    appName: 'Test App',
    bundleId: 'invalid..bundle..id',
    appStoreTeamId: 'INVALID',
    version: 'not.a.version',
    buildNumber: 'not-a-number'
  }
};

/**
 * Get mock response for a given endpoint and scenario
 * @param {string} endpoint - Endpoint path (e.g., 'SUBMISSION.INITIALIZE')
 * @param {string} scenario - Scenario name (default: 'success')
 * @returns {Object} Mock response data
 */
function getMockResponse(endpoint, scenario = 'success') {
  const parts = endpoint.split('.');
  let response = MOCK_RESPONSES;

  for (const part of parts) {
    if (!response[part]) {
      throw new Error(`Mock response not found for endpoint: ${endpoint}`);
    }
    response = response[part];
  }

  if (!response[scenario]) {
    throw new Error(`Mock scenario '${scenario}' not found for endpoint: ${endpoint}`);
  }

  return JSON.parse(JSON.stringify(response[scenario])); // Deep clone
}

/**
 * Get mock state data
 * @param {string} stateType - State type name
 * @returns {Object} Mock state data
 */
function getMockState(stateType) {
  if (!MOCK_STATE_DATA[stateType]) {
    throw new Error(`Mock state not found: ${stateType}`);
  }

  return JSON.parse(JSON.stringify(MOCK_STATE_DATA[stateType])); // Deep clone
}

/**
 * Get mock submission data
 * @param {string} submissionType - Submission type name
 * @returns {Object} Mock submission data
 */
function getMockSubmissionData(submissionType) {
  if (!MOCK_SUBMISSION_DATA[submissionType]) {
    throw new Error(`Mock submission data not found: ${submissionType}`);
  }

  return JSON.parse(JSON.stringify(MOCK_SUBMISSION_DATA[submissionType])); // Deep clone
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MOCK_RESPONSES,
    MOCK_STATE_DATA,
    MOCK_SUBMISSION_DATA,
    getMockResponse,
    getMockState,
    getMockSubmissionData
  };
}

if (typeof window !== 'undefined') {
  window.MockApiResponses = {
    MOCK_RESPONSES,
    MOCK_STATE_DATA,
    MOCK_SUBMISSION_DATA,
    getMockResponse,
    getMockState,
    getMockSubmissionData
  };
}