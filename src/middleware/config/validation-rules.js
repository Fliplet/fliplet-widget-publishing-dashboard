/**
 * Validation Rules Configuration
 *
 * Comprehensive validation rules for all form fields, data inputs, and platform-specific
 * constraints used throughout the publishing dashboard middleware.
 */

/**
 * Common validation patterns
 */
const PATTERNS = {
  // Email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // URL validation
  URL: /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/,

  // Version number (semantic versioning)
  VERSION: /^\d+\.\d+(?:\.\d+)?$/,

  // Build number (integer)
  BUILD_NUMBER: /^\d+$/,

  // Bundle ID / Package name
  BUNDLE_ID: /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/,
  PACKAGE_NAME: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,

  // Color hex code
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,

  // Phone number (international format)
  PHONE: /^\+[1-9]\d{1,14}$/,

  // Alpha numeric with spaces
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9\s]+$/,

  // File extensions
  IMAGE_EXTENSIONS: /\.(jpg|jpeg|png|gif|webp)$/i,
  ARCHIVE_EXTENSIONS: /\.(zip|tar|gz|rar)$/i,
  CERTIFICATE_EXTENSIONS: /\.(p12|cer|crt|pem)$/i,
  KEYSTORE_EXTENSIONS: /\.(jks|keystore)$/i
};

/**
 * Field validation rules organized by category
 */
const VALIDATION_RULES = {
  // App Information
  APP_INFO: {
    appName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: PATTERNS.ALPHANUMERIC_SPACE,
      trim: true,
      platforms: ['ios', 'android'],
      errorCodes: {
        required: 'APP_NAME_REQUIRED',
        minLength: 'APP_NAME_TOO_SHORT',
        maxLength: 'APP_NAME_TOO_LONG',
        pattern: 'APP_NAME_INVALID_CHARS'
      }
    },

    bundleId: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 214,
      pattern: PATTERNS.BUNDLE_ID,
      platforms: ['ios'],
      errorCodes: {
        required: 'BUNDLE_ID_REQUIRED',
        pattern: 'BUNDLE_ID_INVALID_FORMAT'
      }
    },

    packageName: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 214,
      pattern: PATTERNS.PACKAGE_NAME,
      platforms: ['android'],
      errorCodes: {
        required: 'PACKAGE_NAME_REQUIRED',
        pattern: 'PACKAGE_NAME_INVALID_FORMAT'
      }
    },

    version: {
      required: true,
      type: 'string',
      pattern: PATTERNS.VERSION,
      platforms: ['ios', 'android'],
      errorCodes: {
        required: 'VERSION_REQUIRED',
        pattern: 'VERSION_INVALID_FORMAT'
      }
    },

    buildNumber: {
      required: true,
      type: 'string',
      pattern: PATTERNS.BUILD_NUMBER,
      platforms: ['ios', 'android'],
      transform: (value) => String(value).trim(),
      errorCodes: {
        required: 'BUILD_NUMBER_REQUIRED',
        pattern: 'BUILD_NUMBER_INVALID'
      }
    },

    description: {
      required: false,
      type: 'string',
      maxLength: 4000,
      trim: true,
      platforms: ['ios', 'android'],
      errorCodes: {
        maxLength: 'DESCRIPTION_TOO_LONG'
      }
    },

    shortDescription: {
      required: false,
      type: 'string',
      maxLength: 80,
      trim: true,
      platforms: ['android'],
      errorCodes: {
        maxLength: 'SHORT_DESCRIPTION_TOO_LONG'
      }
    },

    keywords: {
      required: false,
      type: 'array',
      maxItems: 100,
      itemType: 'string',
      itemMaxLength: 30,
      platforms: ['ios'],
      transform: (value) => Array.isArray(value) ? value.map(v => String(v).trim()) : [],
      errorCodes: {
        maxItems: 'TOO_MANY_KEYWORDS',
        itemMaxLength: 'KEYWORD_TOO_LONG'
      }
    }
  },

  // Store Configuration
  STORE_CONFIG: {
    category: {
      required: true,
      type: 'string',
      enum: {
        ios: [
          'BUSINESS', 'DEVELOPER_TOOLS', 'EDUCATION', 'ENTERTAINMENT',
          'FINANCE', 'FOOD_AND_DRINK', 'GAMES', 'HEALTH_AND_FITNESS',
          'LIFESTYLE', 'MEDICAL', 'MUSIC', 'NEWS', 'PHOTO_AND_VIDEO',
          'PRODUCTIVITY', 'REFERENCE', 'SHOPPING', 'SOCIAL_NETWORKING',
          'SPORTS', 'TRAVEL', 'UTILITIES', 'WEATHER'
        ],
        android: [
          'APPLICATION', 'GAME', 'FAMILY', 'SOCIAL', 'COMMUNICATION',
          'ENTERTAINMENT', 'MUSIC_AND_AUDIO', 'NEWS_AND_MAGAZINES',
          'PHOTOGRAPHY', 'PRODUCTIVITY', 'SHOPPING', 'SPORTS',
          'TOOLS', 'TRAVEL_AND_LOCAL'
        ]
      },
      platforms: ['ios', 'android'],
      errorCodes: {
        required: 'CATEGORY_REQUIRED',
        enum: 'CATEGORY_INVALID'
      }
    },

    contentRating: {
      required: true,
      type: 'string',
      enum: {
        ios: ['4_PLUS', '9_PLUS', '12_PLUS', '17_PLUS'],
        android: ['EVERYONE', 'EVERYONE_10_PLUS', 'TEEN', 'MATURE_17_PLUS', 'ADULTS_ONLY_18_PLUS']
      },
      platforms: ['ios', 'android'],
      errorCodes: {
        required: 'CONTENT_RATING_REQUIRED',
        enum: 'CONTENT_RATING_INVALID'
      }
    },

    priceTier: {
      required: false,
      type: 'string',
      enum: ['FREE', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5'],
      default: 'FREE',
      platforms: ['ios'],
      errorCodes: {
        enum: 'PRICE_TIER_INVALID'
      }
    },

    releaseType: {
      required: false,
      type: 'string',
      enum: ['MANUAL', 'AUTOMATIC'],
      default: 'MANUAL',
      platforms: ['ios'],
      errorCodes: {
        enum: 'RELEASE_TYPE_INVALID'
      }
    },

    releaseTrack: {
      required: false,
      type: 'string',
      enum: ['internal', 'alpha', 'beta', 'production'],
      default: 'internal',
      platforms: ['android'],
      errorCodes: {
        enum: 'RELEASE_TRACK_INVALID'
      }
    }
  },

  // Developer Information
  DEVELOPER_INFO: {
    developerName: {
      required: false,
      type: 'string',
      maxLength: 100,
      trim: true,
      platforms: ['ios', 'android'],
      errorCodes: {
        maxLength: 'DEVELOPER_NAME_TOO_LONG'
      }
    },

    developerEmail: {
      required: false,
      type: 'string',
      pattern: PATTERNS.EMAIL,
      platforms: ['ios', 'android'],
      errorCodes: {
        pattern: 'DEVELOPER_EMAIL_INVALID'
      }
    },

    supportEmail: {
      required: false,
      type: 'string',
      pattern: PATTERNS.EMAIL,
      platforms: ['ios', 'android'],
      errorCodes: {
        pattern: 'SUPPORT_EMAIL_INVALID'
      }
    },

    website: {
      required: false,
      type: 'string',
      pattern: PATTERNS.URL,
      platforms: ['ios', 'android'],
      errorCodes: {
        pattern: 'WEBSITE_URL_INVALID'
      }
    },

    privacyPolicyUrl: {
      required: false,
      type: 'string',
      pattern: PATTERNS.URL,
      platforms: ['ios', 'android'],
      errorCodes: {
        pattern: 'PRIVACY_POLICY_URL_INVALID'
      }
    },

    copyright: {
      required: false,
      type: 'string',
      maxLength: 200,
      trim: true,
      platforms: ['ios'],
      errorCodes: {
        maxLength: 'COPYRIGHT_TOO_LONG'
      }
    }
  },

  // iOS Specific
  IOS_SPECIFIC: {
    appStoreTeamId: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 10,
      pattern: /^[A-Z0-9]{10}$/,
      platforms: ['ios'],
      errorCodes: {
        required: 'TEAM_ID_REQUIRED',
        pattern: 'TEAM_ID_INVALID_FORMAT'
      }
    },

    subtitle: {
      required: false,
      type: 'string',
      maxLength: 30,
      trim: true,
      platforms: ['ios'],
      errorCodes: {
        maxLength: 'SUBTITLE_TOO_LONG'
      }
    },

    promotionalText: {
      required: false,
      type: 'string',
      maxLength: 170,
      trim: true,
      platforms: ['ios'],
      errorCodes: {
        maxLength: 'PROMOTIONAL_TEXT_TOO_LONG'
      }
    }
  },

  // Android Specific
  ANDROID_SPECIFIC: {
    playStoreServiceAccount: {
      required: true,
      type: 'string',
      pattern: PATTERNS.EMAIL,
      platforms: ['android'],
      errorCodes: {
        required: 'SERVICE_ACCOUNT_REQUIRED',
        pattern: 'SERVICE_ACCOUNT_INVALID'
      }
    },

    versionCode: {
      required: true,
      type: 'number',
      min: 1,
      max: 2100000000,
      platforms: ['android'],
      transform: (value) => parseInt(value, 10),
      errorCodes: {
        required: 'VERSION_CODE_REQUIRED',
        min: 'VERSION_CODE_TOO_LOW',
        max: 'VERSION_CODE_TOO_HIGH'
      }
    },

    recentChanges: {
      required: false,
      type: 'string',
      maxLength: 500,
      trim: true,
      platforms: ['android'],
      errorCodes: {
        maxLength: 'RECENT_CHANGES_TOO_LONG'
      }
    }
  },

  // File Validation
  FILES: {
    appIcon: {
      required: false,
      type: 'file',
      allowedExtensions: ['png', 'jpg', 'jpeg'],
      maxSize: 5 * 1024 * 1024, // 5MB
      minDimensions: { width: 512, height: 512 },
      maxDimensions: { width: 1024, height: 1024 },
      aspectRatio: 1, // Square
      platforms: ['ios', 'android'],
      errorCodes: {
        type: 'ICON_INVALID_TYPE',
        size: 'ICON_TOO_LARGE',
        dimensions: 'ICON_INVALID_DIMENSIONS',
        aspectRatio: 'ICON_NOT_SQUARE'
      }
    },

    screenshots: {
      required: false,
      type: 'file-array',
      allowedExtensions: ['png', 'jpg', 'jpeg'],
      maxFiles: 10,
      maxSize: 10 * 1024 * 1024, // 10MB per file
      platforms: ['ios', 'android'],
      constraints: {
        ios: {
          minDimensions: { width: 1242, height: 2208 },
          maxDimensions: { width: 2048, height: 2732 }
        },
        android: {
          minDimensions: { width: 320, height: 480 },
          maxDimensions: { width: 3840, height: 2160 }
        }
      },
      errorCodes: {
        maxFiles: 'TOO_MANY_SCREENSHOTS',
        type: 'SCREENSHOT_INVALID_TYPE',
        size: 'SCREENSHOT_TOO_LARGE',
        dimensions: 'SCREENSHOT_INVALID_DIMENSIONS'
      }
    },

    featureGraphic: {
      required: false,
      type: 'file',
      allowedExtensions: ['png', 'jpg', 'jpeg'],
      maxSize: 5 * 1024 * 1024, // 5MB
      dimensions: { width: 1024, height: 500 },
      platforms: ['android'],
      errorCodes: {
        type: 'FEATURE_GRAPHIC_INVALID_TYPE',
        size: 'FEATURE_GRAPHIC_TOO_LARGE',
        dimensions: 'FEATURE_GRAPHIC_INVALID_DIMENSIONS'
      }
    },

    keystore: {
      required: false,
      type: 'file',
      allowedExtensions: ['jks', 'keystore'],
      maxSize: 10 * 1024 * 1024, // 10MB
      platforms: ['android'],
      errorCodes: {
        type: 'KEYSTORE_INVALID_TYPE',
        size: 'KEYSTORE_TOO_LARGE'
      }
    },

    googleServicesJson: {
      required: false,
      type: 'file',
      allowedExtensions: ['json'],
      maxSize: 1 * 1024 * 1024, // 1MB
      platforms: ['android'],
      validate: (file) => {
        // Custom validation for google-services.json structure
        try {
          const content = JSON.parse(file.content);
          return content.project_info && content.client && content.configuration_version;
        } catch (error) {
          return false;
        }
      },
      errorCodes: {
        type: 'GOOGLE_SERVICES_INVALID_TYPE',
        size: 'GOOGLE_SERVICES_TOO_LARGE',
        validate: 'GOOGLE_SERVICES_INVALID_FORMAT'
      }
    }
  },

  // Push Notifications
  PUSH_NOTIFICATIONS: {
    enabled: {
      required: false,
      type: 'boolean',
      default: false,
      platforms: ['ios', 'android'],
      errorCodes: {
        type: 'PUSH_ENABLED_INVALID_TYPE'
      }
    },

    environment: {
      required: false,
      type: 'string',
      enum: ['development', 'production'],
      default: 'production',
      platforms: ['ios'],
      errorCodes: {
        enum: 'PUSH_ENVIRONMENT_INVALID'
      }
    },

    fcmServerKey: {
      required: false,
      type: 'string',
      minLength: 100,
      platforms: ['android'],
      errorCodes: {
        minLength: 'FCM_SERVER_KEY_INVALID'
      }
    }
  }
};

/**
 * Platform-specific rule sets
 */
const PLATFORM_RULES = {
  ios: {
    required_fields: [
      'appName', 'bundleId', 'version', 'buildNumber', 'appStoreTeamId',
      'category', 'contentRating'
    ],
    optional_fields: [
      'description', 'subtitle', 'keywords', 'promotionalText', 'copyright',
      'developerName', 'developerEmail', 'website', 'privacyPolicyUrl',
      'appIcon', 'screenshots'
    ]
  },
  android: {
    required_fields: [
      'appName', 'packageName', 'versionName', 'versionCode', 'playStoreServiceAccount',
      'category', 'contentRating'
    ],
    optional_fields: [
      'description', 'shortDescription', 'recentChanges',
      'developerName', 'developerEmail', 'website', 'privacyPolicyUrl',
      'appIcon', 'screenshots', 'featureGraphic', 'releaseTrack'
    ]
  }
};

/**
 * Business rules and cross-field validation
 */
const BUSINESS_RULES = {
  // Version progression rules
  VERSION_PROGRESSION: {
    description: 'New version must be greater than current version',
    validate: (newVersion, currentVersion) => {
      if (!currentVersion) return true;

      const parseVersion = (v) => v.split('.').map(Number);
      const newV = parseVersion(newVersion);
      const currentV = parseVersion(currentVersion);

      for (let i = 0; i < Math.max(newV.length, currentV.length); i++) {
        const n = newV[i] || 0;
        const c = currentV[i] || 0;
        if (n > c) return true;
        if (n < c) return false;
      }

      return false; // Versions are equal
    },
    errorCode: 'VERSION_NOT_PROGRESSIVE'
  },

  // Build number increment
  BUILD_NUMBER_INCREMENT: {
    description: 'Build number must be incremented',
    validate: (newBuildNumber, currentBuildNumber) => {
      if (!currentBuildNumber) return true;
      return parseInt(newBuildNumber, 10) > parseInt(currentBuildNumber, 10);
    },
    errorCode: 'BUILD_NUMBER_NOT_INCREMENTED'
  },

  // Bundle ID consistency
  BUNDLE_ID_CONSISTENCY: {
    description: 'Bundle ID must match existing app',
    validate: (bundleId, existingBundleId) => {
      if (!existingBundleId) return true;
      return bundleId === existingBundleId;
    },
    errorCode: 'BUNDLE_ID_MISMATCH'
  },

  // Screenshot requirements
  SCREENSHOT_REQUIREMENTS: {
    description: 'At least one screenshot required for store submission',
    validate: (screenshots, isStoreSubmission) => {
      if (!isStoreSubmission) return true;
      return screenshots && screenshots.length > 0;
    },
    errorCode: 'SCREENSHOTS_REQUIRED_FOR_STORE'
  }
};

/**
 * Validation severity levels
 */
const SEVERITY_LEVELS = {
  ERROR: 'error',      // Blocks submission
  WARNING: 'warning',  // Shows warning but allows submission
  INFO: 'info'         // Informational message
};

/**
 * Get validation rules for a specific field
 * @param {string} fieldName - Field name
 * @param {string} platform - Target platform ('ios' or 'android')
 * @returns {Object|null} Validation rules or null if not found
 */
function getFieldRules(fieldName, platform = null) {
  for (const category of Object.values(VALIDATION_RULES)) {
    if (category[fieldName]) {
      const rules = category[fieldName];
      if (platform && rules.platforms && !rules.platforms.includes(platform)) {
        return null;
      }
      return rules;
    }
  }
  return null;
}

/**
 * Get all required fields for a platform
 * @param {string} platform - Target platform ('ios' or 'android')
 * @returns {string[]} Array of required field names
 */
function getRequiredFields(platform) {
  if (!PLATFORM_RULES[platform]) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return PLATFORM_RULES[platform].required_fields;
}

/**
 * Get all optional fields for a platform
 * @param {string} platform - Target platform ('ios' or 'android')
 * @returns {string[]} Array of optional field names
 */
function getOptionalFields(platform) {
  if (!PLATFORM_RULES[platform]) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return PLATFORM_RULES[platform].optional_fields;
}

/**
 * Validate single field value
 * @param {string} fieldName - Field name
 * @param {*} value - Field value
 * @param {string} platform - Target platform
 * @returns {Object} Validation result
 */
function validateField(fieldName, value, platform) {
  const rules = getFieldRules(fieldName, platform);

  if (!rules) {
    return { isValid: true, errors: [] };
  }

  const errors = [];

  // Check required
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push({
      code: rules.errorCodes?.required || 'FIELD_REQUIRED',
      message: `${fieldName} is required`,
      severity: SEVERITY_LEVELS.ERROR
    });
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and field is not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: true, errors: [] };
  }

  // Apply transformation
  if (rules.transform && typeof rules.transform === 'function') {
    value = rules.transform(value);
  }

  // Type validation
  if (rules.type && typeof value !== rules.type) {
    errors.push({
      code: rules.errorCodes?.type || 'INVALID_TYPE',
      message: `${fieldName} must be of type ${rules.type}`,
      severity: SEVERITY_LEVELS.ERROR
    });
  }

  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    errors.push({
      code: rules.errorCodes?.pattern || 'INVALID_PATTERN',
      message: `${fieldName} format is invalid`,
      severity: SEVERITY_LEVELS.ERROR
    });
  }

  // Length validation
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({
        code: rules.errorCodes?.minLength || 'TOO_SHORT',
        message: `${fieldName} must be at least ${rules.minLength} characters`,
        severity: SEVERITY_LEVELS.ERROR
      });
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({
        code: rules.errorCodes?.maxLength || 'TOO_LONG',
        message: `${fieldName} must be no more than ${rules.maxLength} characters`,
        severity: SEVERITY_LEVELS.ERROR
      });
    }
  }

  // Numeric validation
  if (typeof value === 'number') {
    if (rules.min && value < rules.min) {
      errors.push({
        code: rules.errorCodes?.min || 'TOO_SMALL',
        message: `${fieldName} must be at least ${rules.min}`,
        severity: SEVERITY_LEVELS.ERROR
      });
    }
    if (rules.max && value > rules.max) {
      errors.push({
        code: rules.errorCodes?.max || 'TOO_LARGE',
        message: `${fieldName} must be no more than ${rules.max}`,
        severity: SEVERITY_LEVELS.ERROR
      });
    }
  }

  // Enum validation
  if (rules.enum) {
    const validValues = rules.enum[platform] || rules.enum;
    if (Array.isArray(validValues) && !validValues.includes(value)) {
      errors.push({
        code: rules.errorCodes?.enum || 'INVALID_ENUM_VALUE',
        message: `${fieldName} must be one of: ${validValues.join(', ')}`,
        severity: SEVERITY_LEVELS.ERROR
      });
    }
  }

  // Array validation
  if (Array.isArray(value) && rules.maxItems && value.length > rules.maxItems) {
    errors.push({
      code: rules.errorCodes?.maxItems || 'TOO_MANY_ITEMS',
      message: `${fieldName} must have no more than ${rules.maxItems} items`,
      severity: SEVERITY_LEVELS.ERROR
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    transformedValue: value
  };
}

/**
 * Validate business rules
 * @param {Object} data - Data to validate
 * @param {string} platform - Target platform
 * @param {Object} context - Additional context for validation
 * @returns {Object} Validation result
 */
function validateBusinessRules(data, platform, context = {}) {
  const errors = [];

  // Check each business rule
  for (const [ruleName, rule] of Object.entries(BUSINESS_RULES)) {
    try {
      const isValid = rule.validate(data, context);
      if (!isValid) {
        errors.push({
          code: rule.errorCode,
          message: rule.description,
          severity: SEVERITY_LEVELS.ERROR,
          rule: ruleName
        });
      }
    } catch (error) {
      errors.push({
        code: 'BUSINESS_RULE_ERROR',
        message: `Business rule validation failed: ${rule.description}`,
        severity: SEVERITY_LEVELS.ERROR,
        rule: ruleName
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.ValidationRulesConfig = {
    PATTERNS,
    VALIDATION_RULES,
    PLATFORM_RULES,
    BUSINESS_RULES,
    SEVERITY_LEVELS,
    getFieldRules,
    getRequiredFields,
    getOptionalFields,
    validateField,
    validateBusinessRules
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PATTERNS,
    VALIDATION_RULES,
    PLATFORM_RULES,
    BUSINESS_RULES,
    SEVERITY_LEVELS,
    getFieldRules,
    getRequiredFields,
    getOptionalFields,
    validateField,
    validateBusinessRules
  };
}