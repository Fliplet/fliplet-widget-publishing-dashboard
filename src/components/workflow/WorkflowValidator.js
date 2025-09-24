/**
 * WorkflowValidator - Validation logic for workflow steps
 * Provides validation rules and navigation constraints
 */

class WorkflowValidator {
  constructor() {
    this.validators = new Map();
    this.navigationRules = new Map();
    this.dependencies = new Map();
  }

  /**
   * Register a validator for a step
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {Function|Object} validator - Validation function or config
   */
  registerValidator(platform, stepName, validator) {
    const key = `${platform}:${stepName}`;
    
    if (typeof validator === 'function') {
      this.validators.set(key, {
        validate: validator,
        async: validator.constructor.name === 'AsyncFunction'
      });
    } else if (typeof validator === 'object' && validator.validate) {
      this.validators.set(key, {
        validate: validator.validate,
        async: validator.async || false,
        fields: validator.fields || [],
        rules: validator.rules || {}
      });
    }
  }

  /**
   * Register navigation rules for a step
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {Object} rules - Navigation rules
   */
  registerNavigationRules(platform, stepName, rules) {
    const key = `${platform}:${stepName}`;
    this.navigationRules.set(key, {
      canGoNext: rules.canGoNext || (() => true),
      canGoBack: rules.canGoBack || (() => true),
      canSkip: rules.canSkip || false,
      isRequired: rules.isRequired !== false
    });
  }

  /**
   * Register step dependencies
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {Array<string>} dependencies - Required steps before this one
   */
  registerDependencies(platform, stepName, dependencies) {
    const key = `${platform}:${stepName}`;
    this.dependencies.set(key, dependencies);
  }

  /**
   * Validate a step
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {Object} data - Step data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateStep(platform, stepName, data) {
    const key = `${platform}:${stepName}`;
    const validator = this.validators.get(key);
    
    const result = {
      isValid: true,
      errors: [],
      fieldErrors: {},
      warnings: []
    };

    if (!validator) {
      // No validator registered, consider it valid
      return result;
    }

    try {
      if (validator.async) {
        const validationResult = await validator.validate(data);
        return this.normalizeValidationResult(validationResult);
      } else {
        const validationResult = validator.validate(data);
        return this.normalizeValidationResult(validationResult);
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        fieldErrors: {},
        warnings: []
      };
    }
  }

  /**
   * Validate specific fields
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {string} fieldName - Field to validate
   * @param {*} value - Field value
   * @returns {Object} Field validation result
   */
  validateField(platform, stepName, fieldName, value) {
    const key = `${platform}:${stepName}`;
    const validator = this.validators.get(key);
    
    if (!validator || !validator.rules || !validator.rules[fieldName]) {
      return { isValid: true, errors: [] };
    }

    const fieldRules = validator.rules[fieldName];
    const errors = [];

    // Required validation
    if (fieldRules.required && !value) {
      errors.push(fieldRules.requiredMessage || `${fieldName} is required`);
    }

    // Pattern validation
    if (fieldRules.pattern && value) {
      const regex = new RegExp(fieldRules.pattern);
      if (!regex.test(value)) {
        errors.push(fieldRules.patternMessage || `${fieldName} format is invalid`);
      }
    }

    // Min length validation
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors.push(fieldRules.minLengthMessage || `${fieldName} must be at least ${fieldRules.minLength} characters`);
    }

    // Max length validation
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors.push(fieldRules.maxLengthMessage || `${fieldName} must not exceed ${fieldRules.maxLength} characters`);
    }

    // Custom validation
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value);
      if (customResult !== true) {
        errors.push(customResult || `${fieldName} is invalid`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if can navigate to next step
   * @param {string} platform - 'ios' or 'android'
   * @param {string} currentStep - Current step name
   * @param {Object} stepData - Current step data
   * @param {Object} workflowState - Full workflow state
   * @returns {Object} Navigation check result
   */
  async canNavigateNext(platform, currentStep, stepData, workflowState) {
    const key = `${platform}:${currentStep}`;
    const rules = this.navigationRules.get(key);
    
    // Default rules
    if (!rules) {
      const validation = await this.validateStep(platform, currentStep, stepData);
      return {
        canNavigate: validation.isValid,
        reason: validation.isValid ? null : 'Step validation failed',
        errors: validation.errors
      };
    }

    // Check if step is required and valid
    if (rules.isRequired) {
      const validation = await this.validateStep(platform, currentStep, stepData);
      if (!validation.isValid) {
        return {
          canNavigate: false,
          reason: 'Required step must be completed',
          errors: validation.errors
        };
      }
    }

    // Check custom navigation rule
    if (rules.canGoNext) {
      try {
        const canGo = await rules.canGoNext(stepData, workflowState);
        if (canGo !== true) {
          return {
            canNavigate: false,
            reason: typeof canGo === 'string' ? canGo : 'Navigation not allowed',
            errors: []
          };
        }
      } catch (error) {
        return {
          canNavigate: false,
          reason: `Navigation check failed: ${error.message}`,
          errors: []
        };
      }
    }

    return {
      canNavigate: true,
      reason: null,
      errors: []
    };
  }

  /**
   * Check if can navigate to previous step
   * @param {string} platform - 'ios' or 'android'
   * @param {string} currentStep - Current step name
   * @param {Object} workflowState - Full workflow state
   * @returns {boolean}
   */
  canNavigateBack(platform, currentStep, workflowState) {
    const key = `${platform}:${currentStep}`;
    const rules = this.navigationRules.get(key);
    
    if (!rules || !rules.canGoBack) {
      return true; // Default allow back navigation
    }

    try {
      return rules.canGoBack(workflowState) !== false;
    } catch (error) {
      console.error('Back navigation check failed:', error);
      return false;
    }
  }

  /**
   * Check if step can be skipped
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @returns {boolean}
   */
  canSkipStep(platform, stepName) {
    const key = `${platform}:${stepName}`;
    const rules = this.navigationRules.get(key);
    return rules ? rules.canSkip : false;
  }

  /**
   * Check step dependencies
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step to check
   * @param {Object} workflowState - Full workflow state
   * @returns {Object} Dependency check result
   */
  checkDependencies(platform, stepName, workflowState) {
    const key = `${platform}:${stepName}`;
    const dependencies = this.dependencies.get(key);
    
    if (!dependencies || dependencies.length === 0) {
      return {
        satisfied: true,
        missing: []
      };
    }

    const missing = dependencies.filter(dep => {
      const depData = workflowState.stepData && workflowState.stepData[dep];
      return !depData || !depData.completed;
    });

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  /**
   * Get validation summary for entire workflow
   * @param {string} platform - 'ios' or 'android'
   * @param {Object} workflowState - Full workflow state
   * @returns {Promise<Object>} Workflow validation summary
   */
  async getWorkflowValidationSummary(platform, workflowState) {
    const summary = {
      isValid: true,
      completedSteps: [],
      invalidSteps: [],
      pendingSteps: [],
      totalSteps: 0,
      progress: 0
    };

    if (!workflowState.steps) {
      return summary;
    }

    summary.totalSteps = workflowState.steps.length;

    for (const step of workflowState.steps) {
      const stepData = workflowState.stepData && workflowState.stepData[step.name];
      
      if (!stepData) {
        summary.pendingSteps.push(step.name);
        continue;
      }

      const validation = await this.validateStep(platform, step.name, stepData);
      
      if (validation.isValid && stepData.completed) {
        summary.completedSteps.push(step.name);
      } else if (!validation.isValid) {
        summary.invalidSteps.push({
          name: step.name,
          errors: validation.errors
        });
        summary.isValid = false;
      } else {
        summary.pendingSteps.push(step.name);
      }
    }

    summary.progress = Math.round((summary.completedSteps.length / summary.totalSteps) * 100);

    return summary;
  }

  /**
   * Normalize validation result to standard format
   * @private
   */
  normalizeValidationResult(result) {
    // Handle boolean result
    if (typeof result === 'boolean') {
      return {
        isValid: result,
        errors: result ? [] : ['Validation failed'],
        fieldErrors: {},
        warnings: []
      };
    }

    // Handle string result (error message)
    if (typeof result === 'string') {
      return {
        isValid: false,
        errors: [result],
        fieldErrors: {},
        warnings: []
      };
    }

    // Handle object result
    if (typeof result === 'object' && result !== null) {
      return {
        isValid: result.isValid !== false,
        errors: result.errors || [],
        fieldErrors: result.fieldErrors || {},
        warnings: result.warnings || []
      };
    }

    // Default to invalid for unexpected results
    return {
      isValid: false,
      errors: ['Unexpected validation result'],
      fieldErrors: {},
      warnings: []
    };
  }

  /**
   * Clear all validators and rules
   */
  clear() {
    this.validators.clear();
    this.navigationRules.clear();
    this.dependencies.clear();
  }
}

// Export as singleton
const workflowValidator = new WorkflowValidator();

// Register default iOS validators
workflowValidator.registerValidator('ios', 'api-key', {
  validate: (data) => {
    if (!data.apiKeyId && !data.newApiKey) {
      return {
        isValid: false,
        errors: ['Please select an existing API key or create a new one']
      };
    }
    if (data.newApiKey) {
      if (!data.newApiKey.name) {
        return {
          isValid: false,
          fieldErrors: { name: ['API key name is required'] }
        };
      }
      if (!data.newApiKey.issuerID) {
        return {
          isValid: false,
          fieldErrors: { issuerID: ['Issuer ID is required'] }
        };
      }
      if (!data.newApiKey.keyFile) {
        return {
          isValid: false,
          fieldErrors: { keyFile: ['Key file is required'] }
        };
      }
    }
    return { isValid: true };
  },
  fields: ['apiKeyId', 'newApiKey']
});

workflowValidator.registerValidator('ios', 'bundle-id', {
  validate: (data) => {
    if (!data.bundleId) {
      return {
        isValid: false,
        errors: ['Bundle ID is required']
      };
    }
    // Bundle ID format validation
    const bundleIdRegex = /^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;
    if (!bundleIdRegex.test(data.bundleId)) {
      return {
        isValid: false,
        fieldErrors: {
          bundleId: ['Bundle ID must be in reverse domain format (e.g., com.company.app)']
        }
      };
    }
    return { isValid: true };
  },
  fields: ['bundleId']
});

// Register default Android validators
workflowValidator.registerValidator('android', 'store-config', {
  validate: (data) => {
    const errors = {};
    
    if (!data.packageName) {
      errors.packageName = ['Package name is required'];
    } else {
      const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
      if (!packageRegex.test(data.packageName)) {
        errors.packageName = ['Package name must be in valid format (e.g., com.company.app)'];
      }
    }
    
    if (!data.appName) {
      errors.appName = ['App name is required'];
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      fieldErrors: errors
    };
  },
  fields: ['packageName', 'appName']
});

export default workflowValidator;