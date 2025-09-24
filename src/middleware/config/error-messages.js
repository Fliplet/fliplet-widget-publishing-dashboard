/**
 * Error Messages Configuration
 *
 * Comprehensive mapping of error codes to user-friendly messages with support
 * for localization, context-aware messaging, and actionable suggestions.
 */

/**
 * Error message categories
 */
const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  API: 'api',
  FILE: 'file',
  WORKFLOW: 'workflow',
  SYSTEM: 'system',
  BUSINESS: 'business'
};

/**
 * Error severity levels
 */
const ERROR_SEVERITY = {
  CRITICAL: 'critical',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Comprehensive error message mappings
 */
const ERROR_MESSAGES = {
  // Validation Errors
  VALIDATION: {
    // App Information
    APP_NAME_REQUIRED: {
      message: 'App name is required',
      description: 'Please enter a name for your app',
      suggestion: 'Choose a descriptive name that represents your app',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    APP_NAME_TOO_SHORT: {
      message: 'App name is too short',
      description: 'App name must be at least 1 character long',
      suggestion: 'Enter a longer app name',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    APP_NAME_TOO_LONG: {
      message: 'App name is too long',
      description: 'App name cannot exceed 50 characters',
      suggestion: 'Shorten your app name to 50 characters or less',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    APP_NAME_INVALID_CHARS: {
      message: 'App name contains invalid characters',
      description: 'App name can only contain letters, numbers, and spaces',
      suggestion: 'Remove special characters and symbols from your app name',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },

    // Bundle ID / Package Name
    BUNDLE_ID_REQUIRED: {
      message: 'Bundle ID is required',
      description: 'Bundle ID is required for iOS app submission',
      suggestion: 'Enter a reverse domain name format (e.g., com.company.appname)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    BUNDLE_ID_INVALID_FORMAT: {
      message: 'Invalid bundle ID format',
      description: 'Bundle ID must be in reverse domain name format',
      suggestion: 'Use format like com.company.appname with only letters, numbers, hyphens, and dots',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    PACKAGE_NAME_REQUIRED: {
      message: 'Package name is required',
      description: 'Package name is required for Android app submission',
      suggestion: 'Enter a reverse domain name format (e.g., com.company.appname)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    PACKAGE_NAME_INVALID_FORMAT: {
      message: 'Invalid package name format',
      description: 'Package name must be in reverse domain name format',
      suggestion: 'Use lowercase letters, numbers, underscores, and dots only',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },

    // Version Information
    VERSION_REQUIRED: {
      message: 'Version number is required',
      description: 'Please specify a version number for your app',
      suggestion: 'Use semantic versioning format (e.g., 1.0.0)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    VERSION_INVALID_FORMAT: {
      message: 'Invalid version format',
      description: 'Version must follow semantic versioning',
      suggestion: 'Use format like 1.0.0 (major.minor.patch)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    BUILD_NUMBER_REQUIRED: {
      message: 'Build number is required',
      description: 'Build number is required for app submission',
      suggestion: 'Enter a positive integer (e.g., 1, 2, 3)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    BUILD_NUMBER_INVALID: {
      message: 'Invalid build number',
      description: 'Build number must be a positive integer',
      suggestion: 'Use whole numbers only (1, 2, 3, etc.)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },

    // Store Configuration
    CATEGORY_REQUIRED: {
      message: 'App category is required',
      description: 'Please select a category for your app',
      suggestion: 'Choose the category that best describes your app',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    CATEGORY_INVALID: {
      message: 'Invalid app category',
      description: 'Selected category is not valid for this platform',
      suggestion: 'Choose from the available categories for your target platform',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    CONTENT_RATING_REQUIRED: {
      message: 'Content rating is required',
      description: 'Please select an appropriate content rating',
      suggestion: 'Choose the rating that matches your app content',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    CONTENT_RATING_INVALID: {
      message: 'Invalid content rating',
      description: 'Selected content rating is not valid',
      suggestion: 'Choose from the available content ratings',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },

    // iOS Specific
    TEAM_ID_REQUIRED: {
      message: 'Apple Developer Team ID is required',
      description: 'Team ID is required for iOS app submission',
      suggestion: 'Find your Team ID in your Apple Developer account settings',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    TEAM_ID_INVALID_FORMAT: {
      message: 'Invalid Team ID format',
      description: 'Team ID must be a 10-character alphanumeric string',
      suggestion: 'Check your Apple Developer account for the correct Team ID',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },

    // Android Specific
    SERVICE_ACCOUNT_REQUIRED: {
      message: 'Google Play service account is required',
      description: 'Service account is required for Android app submission',
      suggestion: 'Set up a service account in Google Play Console',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    SERVICE_ACCOUNT_INVALID: {
      message: 'Invalid service account format',
      description: 'Service account must be a valid email address',
      suggestion: 'Enter the service account email from Google Play Console',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    VERSION_CODE_REQUIRED: {
      message: 'Version code is required',
      description: 'Version code is required for Android app submission',
      suggestion: 'Enter a positive integer for the version code',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    VERSION_CODE_TOO_LOW: {
      message: 'Version code too low',
      description: 'Version code must be at least 1',
      suggestion: 'Use a positive integer starting from 1',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },
    VERSION_CODE_TOO_HIGH: {
      message: 'Version code too high',
      description: 'Version code exceeds maximum allowed value',
      suggestion: 'Version code must be less than 2,100,000,000',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.VALIDATION
    },

    // File Validation
    ICON_INVALID_TYPE: {
      message: 'Invalid app icon file type',
      description: 'App icon must be a PNG or JPEG image',
      suggestion: 'Convert your icon to PNG or JPEG format',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.FILE
    },
    ICON_TOO_LARGE: {
      message: 'App icon file too large',
      description: 'App icon must be smaller than 5MB',
      suggestion: 'Compress your icon image or reduce its dimensions',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.FILE
    },
    ICON_INVALID_DIMENSIONS: {
      message: 'Invalid app icon dimensions',
      description: 'App icon must be between 512x512 and 1024x1024 pixels',
      suggestion: 'Resize your icon to meet the dimension requirements',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.FILE
    },
    ICON_NOT_SQUARE: {
      message: 'App icon must be square',
      description: 'App icon width and height must be equal',
      suggestion: 'Crop or resize your icon to make it square',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.FILE
    }
  },

  // API Errors
  API: {
    NETWORK_ERROR: {
      message: 'Network connection error',
      description: 'Unable to connect to the server',
      suggestion: 'Check your internet connection and try again',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.NETWORK
    },
    TIMEOUT_ERROR: {
      message: 'Request timed out',
      description: 'The server took too long to respond',
      suggestion: 'Try again in a few moments',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.NETWORK
    },
    SERVER_ERROR: {
      message: 'Server error occurred',
      description: 'An unexpected error occurred on the server',
      suggestion: 'Please try again later or contact support if the problem persists',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.API
    },
    UNAUTHORIZED: {
      message: 'Authentication required',
      description: 'You need to sign in to perform this action',
      suggestion: 'Please sign in and try again',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.AUTHENTICATION
    },
    FORBIDDEN: {
      message: 'Access denied',
      description: 'You do not have permission to perform this action',
      suggestion: 'Contact your administrator for access',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.AUTHORIZATION
    },
    NOT_FOUND: {
      message: 'Resource not found',
      description: 'The requested resource could not be found',
      suggestion: 'Check the URL and try again',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.API
    },
    RATE_LIMITED: {
      message: 'Too many requests',
      description: 'You have exceeded the rate limit',
      suggestion: 'Please wait a moment before trying again',
      severity: ERROR_SEVERITY.WARNING,
      category: ERROR_CATEGORIES.API
    }
  },

  // Workflow Errors
  WORKFLOW: {
    WORKFLOW_NOT_FOUND: {
      message: 'Workflow not found',
      description: 'The specified workflow could not be found',
      suggestion: 'Check the workflow ID and try again',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.WORKFLOW
    },
    STEP_FAILED: {
      message: 'Workflow step failed',
      description: 'A step in the workflow encountered an error',
      suggestion: 'Review the error details and retry the workflow',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.WORKFLOW
    },
    PREREQUISITE_NOT_MET: {
      message: 'Prerequisites not met',
      description: 'Required conditions for this step are not satisfied',
      suggestion: 'Complete the prerequisite steps first',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.WORKFLOW
    },
    WORKFLOW_TIMEOUT: {
      message: 'Workflow timed out',
      description: 'The workflow took longer than expected to complete',
      suggestion: 'Try running the workflow again',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.WORKFLOW
    },
    WORKFLOW_CANCELLED: {
      message: 'Workflow was cancelled',
      description: 'The workflow was cancelled by the user or system',
      suggestion: 'Start a new workflow if needed',
      severity: ERROR_SEVERITY.INFO,
      category: ERROR_CATEGORIES.WORKFLOW
    }
  },

  // Business Logic Errors
  BUSINESS: {
    VERSION_NOT_PROGRESSIVE: {
      message: 'Version must be newer',
      description: 'New version must be greater than the current version',
      suggestion: 'Increment the version number (e.g., 1.0.0 → 1.0.1)',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.BUSINESS
    },
    BUILD_NUMBER_NOT_INCREMENTED: {
      message: 'Build number must be incremented',
      description: 'Build number must be higher than the previous build',
      suggestion: 'Increase the build number by at least 1',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.BUSINESS
    },
    BUNDLE_ID_MISMATCH: {
      message: 'Bundle ID mismatch',
      description: 'Bundle ID does not match the existing app',
      suggestion: 'Use the same Bundle ID as your existing app',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.BUSINESS
    },
    SCREENSHOTS_REQUIRED_FOR_STORE: {
      message: 'Screenshots required',
      description: 'At least one screenshot is required for store submission',
      suggestion: 'Upload app screenshots to proceed with submission',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.BUSINESS
    }
  },

  // System Errors
  SYSTEM: {
    UNKNOWN_ERROR: {
      message: 'An unexpected error occurred',
      description: 'Something went wrong, but we\'re not sure what',
      suggestion: 'Please try again or contact support if the problem persists',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.SYSTEM
    },
    SERVICE_UNAVAILABLE: {
      message: 'Service temporarily unavailable',
      description: 'The service is currently undergoing maintenance',
      suggestion: 'Please try again in a few minutes',
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.SYSTEM
    },
    CONFIGURATION_ERROR: {
      message: 'Configuration error',
      description: 'There is an issue with the system configuration',
      suggestion: 'Contact your administrator',
      severity: ERROR_SEVERITY.CRITICAL,
      category: ERROR_CATEGORIES.SYSTEM
    }
  }
};

/**
 * Contextual error messages based on user actions
 */
const CONTEXTUAL_MESSAGES = {
  FORM_SUBMISSION: {
    prefix: 'Unable to save: ',
    suffix: ' Please correct the errors and try again.'
  },
  FILE_UPLOAD: {
    prefix: 'Upload failed: ',
    suffix: ' Please check your file and try again.'
  },
  API_CALL: {
    prefix: 'Request failed: ',
    suffix: ' Please try again or contact support.'
  },
  WORKFLOW_EXECUTION: {
    prefix: 'Workflow error: ',
    suffix: ' The process has been stopped.'
  }
};

/**
 * Localization support structure
 */
const LOCALIZED_MESSAGES = {
  en: ERROR_MESSAGES, // Default English messages

  // Framework for additional languages
  es: {
    // Spanish translations would go here
  },
  fr: {
    // French translations would go here
  }
};

/**
 * Get error message by code
 * @param {string} errorCode - Error code to look up
 * @param {string} locale - Locale for message (default: 'en')
 * @param {Object} context - Additional context for message formatting
 * @returns {Object|null} Error message object or null if not found
 */
function getErrorMessage(errorCode, locale = 'en', context = {}) {
  const messages = LOCALIZED_MESSAGES[locale] || LOCALIZED_MESSAGES.en;

  // Search through all categories for the error code
  for (const category of Object.values(messages)) {
    if (category[errorCode]) {
      const message = { ...category[errorCode] };

      // Apply contextual formatting if provided
      if (context.action && CONTEXTUAL_MESSAGES[context.action]) {
        const contextMsg = CONTEXTUAL_MESSAGES[context.action];
        message.message = contextMsg.prefix + message.message + contextMsg.suffix;
      }

      // Replace placeholders in message
      if (context.values) {
        Object.entries(context.values).forEach(([key, value]) => {
          message.message = message.message.replace(`{${key}}`, value);
          message.description = message.description.replace(`{${key}}`, value);
          message.suggestion = message.suggestion.replace(`{${key}}`, value);
        });
      }

      return message;
    }
  }

  return null;
}

/**
 * Get user-friendly error message
 * @param {string} errorCode - Error code to look up
 * @param {string} locale - Locale for message (default: 'en')
 * @param {Object} context - Additional context
 * @returns {string} User-friendly error message
 */
function getUserMessage(errorCode, locale = 'en', context = {}) {
  const errorMessage = getErrorMessage(errorCode, locale, context);

  if (!errorMessage) {
    return LOCALIZED_MESSAGES[locale]?.SYSTEM?.UNKNOWN_ERROR?.message ||
           'An unexpected error occurred';
  }

  return errorMessage.message;
}

/**
 * Get error description
 * @param {string} errorCode - Error code to look up
 * @param {string} locale - Locale for message (default: 'en')
 * @returns {string} Error description
 */
function getErrorDescription(errorCode, locale = 'en') {
  const errorMessage = getErrorMessage(errorCode, locale);
  return errorMessage ? errorMessage.description : '';
}

/**
 * Get error suggestion
 * @param {string} errorCode - Error code to look up
 * @param {string} locale - Locale for message (default: 'en')
 * @returns {string} Error suggestion
 */
function getErrorSuggestion(errorCode, locale = 'en') {
  const errorMessage = getErrorMessage(errorCode, locale);
  return errorMessage ? errorMessage.suggestion : '';
}

/**
 * Format error for display
 * @param {string} errorCode - Error code
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted error object
 */
function formatError(errorCode, options = {}) {
  const {
    locale = 'en',
    includeDescription = true,
    includeSuggestion = true,
    context = {}
  } = options;

  const errorMessage = getErrorMessage(errorCode, locale, context);

  if (!errorMessage) {
    return {
      code: errorCode,
      message: getUserMessage('UNKNOWN_ERROR', locale),
      severity: ERROR_SEVERITY.ERROR,
      category: ERROR_CATEGORIES.SYSTEM
    };
  }

  const formatted = {
    code: errorCode,
    message: errorMessage.message,
    severity: errorMessage.severity,
    category: errorMessage.category
  };

  if (includeDescription && errorMessage.description) {
    formatted.description = errorMessage.description;
  }

  if (includeSuggestion && errorMessage.suggestion) {
    formatted.suggestion = errorMessage.suggestion;
  }

  return formatted;
}

/**
 * Get all errors for a category
 * @param {string} category - Error category
 * @param {string} locale - Locale for messages
 * @returns {Object} All errors in the category
 */
function getErrorsByCategory(category, locale = 'en') {
  const messages = LOCALIZED_MESSAGES[locale] || LOCALIZED_MESSAGES.en;
  const categoryKey = category.toUpperCase();

  return messages[categoryKey] || {};
}

/**
 * Check if error is recoverable
 * @param {string} errorCode - Error code to check
 * @returns {boolean} True if error is typically recoverable
 */
function isRecoverableError(errorCode) {
  const recoverableCategories = [
    ERROR_CATEGORIES.NETWORK,
    ERROR_CATEGORIES.VALIDATION
  ];

  const errorMessage = getErrorMessage(errorCode);
  if (!errorMessage) return false;

  return recoverableCategories.includes(errorMessage.category) ||
         errorMessage.severity === ERROR_SEVERITY.WARNING;
}

/**
 * Get error severity level
 * @param {string} errorCode - Error code
 * @returns {string} Severity level
 */
function getErrorSeverity(errorCode) {
  const errorMessage = getErrorMessage(errorCode);
  return errorMessage ? errorMessage.severity : ERROR_SEVERITY.ERROR;
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.ErrorMessagesConfig = {
    ERROR_CATEGORIES,
    ERROR_SEVERITY,
    ERROR_MESSAGES,
    CONTEXTUAL_MESSAGES,
    getErrorMessage,
    getUserMessage,
    getErrorDescription,
    getErrorSuggestion,
    formatError,
    getErrorsByCategory,
    isRecoverableError,
    getErrorSeverity
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ERROR_CATEGORIES,
    ERROR_SEVERITY,
    ERROR_MESSAGES,
    CONTEXTUAL_MESSAGES,
    getErrorMessage,
    getUserMessage,
    getErrorDescription,
    getErrorSuggestion,
    formatError,
    getErrorsByCategory,
    isRecoverableError,
    getErrorSeverity
  };
}