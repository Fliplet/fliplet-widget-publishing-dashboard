/**
 * ValidationEngine - Comprehensive validation framework for Publishing Dashboard middleware
 *
 * Provides multi-layer validation including field validation, business rules,
 * platform-specific validation, and cross-field dependency validation.
 *
 * @class ValidationEngine
 * @extends BaseMiddleware
 */

// Ensure BaseMiddleware is available in the Jest/jsdom environment
const ensureBaseMiddleware = () => {
  if (typeof window !== 'undefined' && window.BaseMiddleware) {
    return window.BaseMiddleware;
  }
  try {
    require('./BaseMiddleware.js');
    if (typeof window !== 'undefined' && window.BaseMiddleware) {
      return window.BaseMiddleware;
    }
  } catch (e) {}
  throw new Error('BaseMiddleware is not available');
};

const BaseMiddlewareClass = ensureBaseMiddleware();

class ValidationEngine extends BaseMiddlewareClass {
  /**
   * Creates an instance of ValidationEngine
   * @param {Object} dependencies - Injected dependencies
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    // Validation rule registry
    this.fieldValidators = new Map();
    this.businessRules = new Map();
    this.platformRules = new Map();
    this.customValidators = new Map();

    // Validation cache for performance
    this.validationCache = new Map();
    this.cacheTimeout = this.getConfig('validation.cacheTimeout', 5000);

    // Bind methods
    this.validate = this.validate.bind(this);
    this.validateField = this.validateField.bind(this);
    this.validateBusinessRules = this.validateBusinessRules.bind(this);
    this.validatePlatformRequirements = this.validatePlatformRequirements.bind(this);
  }

  /**
   * Required dependencies for ValidationEngine
   * @returns {string[]} Array of dependency names
   */
  getRequiredDependencies() {
    return []; // ValidationEngine can work independently
  }

  /**
   * Initialize ValidationEngine - set up validation rules
   * @returns {Promise<void>}
   */
  async setup() {
    this.initializeFieldValidators();
    this.initializeBusinessRules();
    this.initializePlatformRules();
    this.emit('validation-engine-ready', { rulesLoaded: this.getValidationRuleCount() });
  }

  /**
   * Initialize field validators
   */
  initializeFieldValidators() {
    // Required field validator
    this.addFieldValidator('required', (value, field, context) => {
      if (value === null || value === undefined || value === '') {
        return { isValid: false, message: `${field} is required` };
      }
      return { isValid: true };
    });

    // String length validators
    this.addFieldValidator('minLength', (value, field, context, params) => {
      if (!value || typeof value !== 'string') return { isValid: true };
      const minLength = params.minLength || 0;
      if (value.length < minLength) {
        return { isValid: false, message: `${field} must be at least ${minLength} characters long` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('maxLength', (value, field, context, params) => {
      if (!value || typeof value !== 'string') return { isValid: true };
      const maxLength = params.maxLength || Infinity;
      if (value.length > maxLength) {
        return { isValid: false, message: `${field} must be no more than ${maxLength} characters long` };
      }
      return { isValid: true };
    });

    // Format validators
    this.addFieldValidator('email', (value, field, context) => {
      if (!value) return { isValid: true };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, message: `${field} must be a valid email address` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('url', (value, field, context) => {
      if (!value) return { isValid: true };
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return { isValid: false, message: `${field} must be a valid URL` };
      }
    });

    this.addFieldValidator('bundleId', (value, field, context) => {
      if (!value) return { isValid: true };
      const bundleIdRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/;
      if (!bundleIdRegex.test(value)) {
        return { isValid: false, message: `${field} must be a valid bundle ID (e.g., com.company.appname)` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('version', (value, field, context) => {
      if (!value) return { isValid: true };
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(value)) {
        return { isValid: false, message: `${field} must be a valid version number (e.g., 1.0.0)` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('versionCode', (value, field, context) => {
      if (!value) return { isValid: true };
      const code = parseInt(value, 10);
      if (isNaN(code) || code < 1000 || code > 999999999) {
        return { isValid: false, message: `${field} must be a number between 1000 and 999999999` };
      }
      return { isValid: true };
    });

    // iOS-specific validators
    this.addFieldValidator('teamId', (value, field, context) => {
      if (!value) return { isValid: true };
      const teamIdRegex = /^[A-Z0-9]{10}$/;
      if (!teamIdRegex.test(value)) {
        return { isValid: false, message: `${field} must be a 10-character alphanumeric team ID` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('apiKeyId', (value, field, context) => {
      if (!value) return { isValid: true };
      const keyIdRegex = /^[A-Z0-9]{10}$/;
      if (!keyIdRegex.test(value)) {
        return { isValid: false, message: `${field} must be a 10-character alphanumeric key ID` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('issuerId', (value, field, context) => {
      if (!value) return { isValid: true };
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        return { isValid: false, message: `${field} must be a valid UUID` };
      }
      return { isValid: true };
    });

    // App name validator
    this.addFieldValidator('appName', (value, field, context) => {
      if (!value) return { isValid: true };
      const nameRegex = /^[a-zA-Z][a-zA-Z0-9\s\-_.()[\]]*[a-zA-Z0-9]$/;
      if (!nameRegex.test(value)) {
        return {
          isValid: false,
          message: `${field} must start with a letter, end with a letter or number, and contain only letters, numbers, spaces, hyphens, underscores, dots, parentheses, and brackets`
        };
      }
      return { isValid: true };
    });

    // Number validators
    this.addFieldValidator('number', (value, field, context) => {
      if (!value && value !== 0) return { isValid: true };
      if (isNaN(Number(value))) {
        return { isValid: false, message: `${field} must be a valid number` };
      }
      return { isValid: true };
    });

    this.addFieldValidator('positiveNumber', (value, field, context) => {
      if (!value && value !== 0) return { isValid: true };
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return { isValid: false, message: `${field} must be a positive number` };
      }
      return { isValid: true };
    });
  }

  /**
   * Initialize business rules
   */
  initializeBusinessRules() {
    // iOS workflow rules
    this.addBusinessRule('ios-api-key-required', (data, context) => {
      if (context.platform !== 'ios') return { isValid: true };
      if (context.step !== 'initialization' && !data.teamId) {
        return { isValid: false, message: 'API key (Team ID) is required for iOS publishing' };
      }
      return { isValid: true };
    });

    this.addBusinessRule('ios-bundle-id-required', (data, context) => {
      if (context.platform !== 'ios') return { isValid: true };
      if (['certificate', 'store-config', 'metadata', 'build'].includes(context.step) && !data.bundleId) {
        return { isValid: false, message: 'Bundle ID selection is required before proceeding' };
      }
      return { isValid: true };
    });

    this.addBusinessRule('ios-certificate-required', (data, context) => {
      if (context.platform !== 'ios') return { isValid: true };
      if (['store-config', 'metadata', 'build'].includes(context.step) && !data.certificateValid) {
        return { isValid: false, message: 'Valid certificate is required before proceeding' };
      }
      return { isValid: true };
    });

    // Android workflow rules
    this.addBusinessRule('android-version-code-required', (data, context) => {
      if (context.platform !== 'android') return { isValid: true };
      if (['metadata', 'build'].includes(context.step) && !data.storeConfig?.versionCode) {
        return { isValid: false, message: 'Version code is required for Android publishing' };
      }
      return { isValid: true };
    });

    // Version validation rules
    this.addBusinessRule('version-increment', (data, context) => {
      if (!data.storeConfig?.versionNumber || !context.currentVersion) return { isValid: true };

      const newVersion = this.parseVersion(data.storeConfig.versionNumber);
      const currentVersion = this.parseVersion(context.currentVersion);

      if (this.compareVersions(newVersion, currentVersion) <= 0) {
        return {
          isValid: false,
          message: `New version (${data.storeConfig.versionNumber}) must be greater than current version (${context.currentVersion})`
        };
      }
      return { isValid: true };
    });

    this.addBusinessRule('version-code-increment', (data, context) => {
      if (context.platform !== 'android') return { isValid: true };
      if (!data.storeConfig?.versionCode || !context.currentVersionCode) return { isValid: true };

      const newCode = parseInt(data.storeConfig.versionCode, 10);
      const currentCode = parseInt(context.currentVersionCode, 10);

      if (newCode <= currentCode) {
        return {
          isValid: false,
          message: `New version code (${newCode}) must be greater than current version code (${currentCode})`
        };
      }
      return { isValid: true };
    });

    // Cross-field validation rules
    this.addBusinessRule('submission-consistency', (data, context) => {
      if (data.submissionId && data.bundleId && !data.storeConfig?.bundleId) {
        return { isValid: false, message: 'Bundle ID must be configured in store config' };
      }
      if (data.storeConfig?.bundleId && data.bundleId && data.storeConfig.bundleId !== data.bundleId) {
        return { isValid: false, message: 'Store config bundle ID must match selected bundle ID' };
      }
      return { isValid: true };
    });

    // Push notification rules
    this.addBusinessRule('push-config-consistency', (data, context) => {
      if (!data.pushConfig) return { isValid: true };

      if (context.platform === 'ios') {
        const { apnTopic, bundleId } = data;
        if (data.pushConfig.apnTopic && bundleId && data.pushConfig.apnTopic !== bundleId) {
          return { isValid: false, message: 'APN topic must match bundle ID for iOS' };
        }
      }

      if (context.platform === 'android') {
        const { pushConfig, storeConfig } = data;
        if (pushConfig.project_id && storeConfig?.bundleId) {
          // Additional validation can be added here for Firebase project consistency
        }
      }

      return { isValid: true };
    });
  }

  /**
   * Initialize platform-specific rules
   */
  initializePlatformRules() {
    // iOS platform rules
    this.addPlatformRule('ios', 'required-fields', (data, context) => {
      const requiredByStep = {
        'api-key-selection': [],
        'initialization': ['teamId'],
        'bundle-selection': ['teamId', 'submissionId'],
        'certificate': ['teamId', 'submissionId', 'bundleId'],
        'store-config': ['submissionId', 'bundleId', 'certificateValid'],
        'metadata': ['submissionId', 'storeConfig.bundleId', 'storeConfig.versionNumber'],
        'push-config': ['submissionId', 'metadata'],
        'build': ['submissionId', 'metadata.appIcon', 'metadata.splashScreen', 'storeConfig']
      };

      const required = requiredByStep[context.step] || [];
      const missing = required.filter(field => {
        const value = this.getNestedValue(data, field);
        return value === null || value === undefined || value === '';
      });

      if (missing.length > 0) {
        return {
          isValid: false,
          message: `Missing required fields for iOS ${context.step}: ${missing.join(', ')}`
        };
      }
      return { isValid: true };
    });

    // Android platform rules
    this.addPlatformRule('android', 'required-fields', (data, context) => {
      const requiredByStep = {
        'initialization': [],
        'store-config': ['submissionId'],
        'metadata': ['submissionId', 'storeConfig.bundleId', 'storeConfig.versionNumber', 'storeConfig.versionCode'],
        'keystore': ['submissionId', 'metadata'],
        'push-config': ['submissionId', 'metadata'],
        'build': ['submissionId', 'metadata.appIcon', 'metadata.splashScreen', 'storeConfig']
      };

      const required = requiredByStep[context.step] || [];
      const missing = required.filter(field => {
        const value = this.getNestedValue(data, field);
        return value === null || value === undefined || value === '';
      });

      if (missing.length > 0) {
        return {
          isValid: false,
          message: `Missing required fields for Android ${context.step}: ${missing.join(', ')}`
        };
      }
      return { isValid: true };
    });

    // iOS certificate validation
    this.addPlatformRule('ios', 'certificate-validation', (data, context) => {
      if (!['certificate', 'store-config', 'metadata', 'build'].includes(context.step)) {
        return { isValid: true };
      }

      if (!data.certificateValid) {
        return {
          isValid: false,
          message: 'A valid iOS distribution certificate is required. Please generate or upload a certificate.'
        };
      }

      return { isValid: true };
    });

    // Android keystore validation (when provided)
    this.addPlatformRule('android', 'keystore-validation', (data, context) => {
      if (!data.keystoreConfig) return { isValid: true };

      if (data.keystoreConfig.file && !data.keystoreConfig.password) {
        return {
          isValid: false,
          message: 'Keystore password is required when uploading a keystore file'
        };
      }

      return { isValid: true };
    });
  }

  /**
   * Main validation method
   * @param {Object} data - Data to validate
   * @param {Object} context - Validation context
   * @param {string} context.platform - 'ios' or 'android'
   * @param {string} context.step - Current workflow step
   * @param {Object} [context.fieldRules] - Specific field validation rules
   * @returns {Object} Validation result
   */
  validate(data, context) {
    const cacheKey = this.generateCacheKey(data, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {},
      businessRuleErrors: [],
      platformErrors: []
    };

    try {
      // Field validation
      if (context.fieldRules) {
        const fieldResult = this.validateFields(data, context.fieldRules, context);
        result.fieldErrors = fieldResult.fieldErrors;
        result.errors.push(...fieldResult.errors);
        if (!fieldResult.isValid) {
          result.isValid = false;
        }
      }

      // Business rules validation
      const businessResult = this.validateBusinessRules(data, context);
      result.businessRuleErrors = businessResult.errors;
      result.errors.push(...businessResult.errors);
      if (!businessResult.isValid) {
        result.isValid = false;
      }

      // Platform-specific validation
      const platformResult = this.validatePlatformRequirements(data, context);
      result.platformErrors = platformResult.errors;
      result.errors.push(...platformResult.errors);
      if (!platformResult.isValid) {
        result.isValid = false;
      }

      // Custom validators
      const customResult = this.validateCustomRules(data, context);
      result.errors.push(...customResult.errors);
      result.warnings.push(...customResult.warnings);
      if (!customResult.isValid) {
        result.isValid = false;
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    // Cache result
    this.addToCache(cacheKey, result);

    this.emit('validation-completed', {
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      context
    });

    return result;
  }

  /**
   * Validate individual fields
   * @param {Object} data - Data to validate
   * @param {Object} fieldRules - Field validation rules
   * @param {Object} context - Validation context
   * @returns {Object} Field validation result
   */
  validateFields(data, fieldRules, context) {
    const result = {
      isValid: true,
      errors: [],
      fieldErrors: {}
    };

    for (const [fieldPath, rules] of Object.entries(fieldRules)) {
      const fieldValue = this.getNestedValue(data, fieldPath);
      const fieldName = fieldPath.split('.').pop();

      for (const rule of rules) {
        const validator = this.fieldValidators.get(rule.type);
        if (!validator) {
          console.warn(`Unknown validator type: ${rule.type}`);
          continue;
        }

        const validationResult = validator(fieldValue, fieldName, context, rule.params || {});
        if (!validationResult.isValid) {
          result.isValid = false;
          result.errors.push(validationResult.message);

          if (!result.fieldErrors[fieldPath]) {
            result.fieldErrors[fieldPath] = [];
          }
          result.fieldErrors[fieldPath].push(validationResult.message);
        }
      }
    }

    return result;
  }

  /**
   * Validate a single field
   * @param {*} value - Field value
   * @param {string} fieldName - Field name
   * @param {Array} rules - Validation rules
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  validateField(value, fieldName, rules, context = {}) {
    const result = {
      isValid: true,
      errors: []
    };

    for (const rule of rules) {
      const validator = this.fieldValidators.get(rule.type);
      if (!validator) {
        console.warn(`Unknown validator type: ${rule.type}`);
        continue;
      }

      const validationResult = validator(value, fieldName, context, rule.params || {});
      if (!validationResult.isValid) {
        result.isValid = false;
        result.errors.push(validationResult.message);
      }
    }

    return result;
  }

  /**
   * Validate business rules
   * @param {Object} data - Data to validate
   * @param {Object} context - Validation context
   * @returns {Object} Business rules validation result
   */
  validateBusinessRules(data, context) {
    const result = {
      isValid: true,
      errors: []
    };

    for (const [ruleName, validator] of this.businessRules) {
      try {
        const validationResult = validator(data, context);
        if (!validationResult.isValid) {
          result.isValid = false;
          result.errors.push(validationResult.message);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(`Business rule '${ruleName}' failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Validate platform-specific requirements
   * @param {Object} data - Data to validate
   * @param {Object} context - Validation context
   * @returns {Object} Platform validation result
   */
  validatePlatformRequirements(data, context) {
    const result = {
      isValid: true,
      errors: []
    };

    const platformRules = this.platformRules.get(context.platform);
    if (!platformRules) {
      return result;
    }

    for (const [ruleName, validator] of platformRules) {
      try {
        const validationResult = validator(data, context);
        if (!validationResult.isValid) {
          result.isValid = false;
          result.errors.push(validationResult.message);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(`Platform rule '${ruleName}' failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Validate custom rules
   * @param {Object} data - Data to validate
   * @param {Object} context - Validation context
   * @returns {Object} Custom validation result
   */
  validateCustomRules(data, context) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    for (const [ruleName, validator] of this.customValidators) {
      try {
        const validationResult = validator(data, context);
        if (!validationResult.isValid) {
          result.isValid = false;
          result.errors.push(validationResult.message);
        }
        if (validationResult.warnings) {
          result.warnings.push(...validationResult.warnings);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(`Custom rule '${ruleName}' failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Add field validator
   * @param {string} name - Validator name
   * @param {Function} validator - Validator function
   */
  addFieldValidator(name, validator) {
    this.fieldValidators.set(name, validator);
  }

  /**
   * Add business rule
   * @param {string} name - Rule name
   * @param {Function} validator - Validator function
   */
  addBusinessRule(name, validator) {
    this.businessRules.set(name, validator);
  }

  /**
   * Add platform-specific rule
   * @param {string} platform - Platform name ('ios' or 'android')
   * @param {string} name - Rule name
   * @param {Function} validator - Validator function
   */
  addPlatformRule(platform, name, validator) {
    if (!this.platformRules.has(platform)) {
      this.platformRules.set(platform, new Map());
    }
    this.platformRules.get(platform).set(name, validator);
  }

  /**
   * Add custom validator
   * @param {string} name - Validator name
   * @param {Function} validator - Validator function
   */
  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator);
  }

  /**
   * Parse version string into comparable format
   * @param {string} versionString - Version string (e.g., "1.2.3")
   * @returns {Array} Version parts as numbers
   */
  parseVersion(versionString) {
    return versionString.split('.').map(part => parseInt(part, 10) || 0);
  }

  /**
   * Compare two version arrays
   * @param {Array} version1 - First version
   * @param {Array} version2 - Second version
   * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(version1, version2) {
    const maxLength = Math.max(version1.length, version2.length);

    for (let i = 0; i < maxLength; i++) {
      const v1 = version1[i] || 0;
      const v2 = version2[i] || 0;

      if (v1 < v2) return -1;
      if (v1 > v2) return 1;
    }

    return 0;
  }

  /**
   * Generate cache key for validation result
   * @param {Object} data - Data being validated
   * @param {Object} context - Validation context
   * @returns {string} Cache key
   */
  generateCacheKey(data, context) {
    const dataHash = this.generateHash(JSON.stringify(data));
    const contextHash = this.generateHash(JSON.stringify(context));
    return `${dataHash}-${contextHash}`;
  }

  /**
   * Simple hash function for cache keys
   * @param {string} str - String to hash
   * @returns {string} Hash string
   */
  generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Add result to validation cache
   * @param {string} key - Cache key
   * @param {Object} result - Validation result
   */
  addToCache(key, result) {
    this.validationCache.set(key, {
      result,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Get result from validation cache
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null
   */
  getFromCache(key) {
    const cached = this.validationCache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTimeout) {
      this.validationCache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, cached] of this.validationCache) {
      if (now - cached.timestamp > this.cacheTimeout) {
        this.validationCache.delete(key);
      }
    }
  }

  /**
   * Get count of loaded validation rules
   * @returns {Object} Rule counts by category
   */
  getValidationRuleCount() {
    return {
      fieldValidators: this.fieldValidators.size,
      businessRules: this.businessRules.size,
      platformRules: Array.from(this.platformRules.values()).reduce((sum, rules) => sum + rules.size, 0),
      customValidators: this.customValidators.size
    };
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
    this.emit('validation-cache-cleared', { timestamp: Date.now() });
  }

  /**
   * Get validation rule information for debugging
   * @returns {Object} Rule information
   */
  getValidationInfo() {
    return {
      fieldValidators: Array.from(this.fieldValidators.keys()),
      businessRules: Array.from(this.businessRules.keys()),
      platformRules: Object.fromEntries(
        Array.from(this.platformRules.entries()).map(([platform, rules]) => [
          platform,
          Array.from(rules.keys())
        ])
      ),
      customValidators: Array.from(this.customValidators.keys()),
      cacheSize: this.validationCache.size
    };
  }

  /**
   * Cleanup method - clear caches and rules
   */
  cleanup() {
    this.validationCache.clear();
    this.fieldValidators.clear();
    this.businessRules.clear();
    this.platformRules.clear();
    this.customValidators.clear();
    super.cleanup();
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.ValidationEngine = ValidationEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationEngine;
}
