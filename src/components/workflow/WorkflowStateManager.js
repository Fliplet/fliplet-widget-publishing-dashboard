/**
 * WorkflowStateManager - Manages workflow state for UI components
 * Integrates with PublishingMiddleware StateManager
 * Vue 2.6.14 compatible service
 */

class WorkflowStateManager {
  constructor() {
    this.state = {
      ios: {
        currentStep: 0,
        steps: [],
        stepData: {},
        isComplete: false,
        errors: {},
        validation: {}
      },
      android: {
        currentStep: 0,
        steps: [],
        stepData: {},
        isComplete: false,
        errors: {},
        validation: {}
      }
    };

    this.listeners = new Map();
    this.middleware = null;
    this.stateManager = null;
  }

  /**
   * Initialize with PublishingMiddleware
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Wait for middleware to be available
      if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
        this.middleware = window.PublishingMiddleware;
        this.stateManager = this.middleware.getComponent('stateManager');
        
        // Load existing state from middleware
        await this.loadStateFromMiddleware();
        
        // Listen to middleware state changes
        this.setupMiddlewareListeners();
      }
    } catch (error) {
      console.error('Failed to initialize WorkflowStateManager:', error);
    }
  }

  /**
   * Load state from middleware StateManager
   */
  async loadStateFromMiddleware() {
    if (!this.stateManager) return;

    try {
      const state = this.stateManager.getState();
      
      if (state && state.workflows) {
        // Merge iOS workflow state
        if (state.workflows.ios) {
          this.state.ios = {
            ...this.state.ios,
            ...state.workflows.ios,
            stepData: state.workflows.ios.steps || {}
          };
        }
        
        // Merge Android workflow state
        if (state.workflows.android) {
          this.state.android = {
            ...this.state.android,
            ...state.workflows.android,
            stepData: state.workflows.android.steps || {}
          };
        }
      }
    } catch (error) {
      console.error('Failed to load state from middleware:', error);
    }
  }

  /**
   * Setup listeners for middleware state changes
   */
  setupMiddlewareListeners() {
    if (!this.stateManager) return;

    // Listen to workflow updates from middleware
    this.stateManager.on('workflow-updated', ({ platform, workflow }) => {
      if (this.state[platform]) {
        this.state[platform] = {
          ...this.state[platform],
          ...workflow,
          stepData: workflow.steps || {}
        };
        
        // Notify UI listeners
        this.emit(`${platform}:workflow-updated`, this.state[platform]);
      }
    });
  }

  /**
   * Get workflow state for a platform
   * @param {string} platform - 'ios' or 'android'
   * @returns {Object} Workflow state
   */
  getWorkflowState(platform) {
    return { ...this.state[platform] };
  }

  /**
   * Set current step for a workflow
   * @param {string} platform - 'ios' or 'android'
   * @param {number} stepIndex - Step index
   */
  async setCurrentStep(platform, stepIndex) {
    if (!this.state[platform]) return;

    this.state[platform].currentStep = stepIndex;
    
    // Update middleware if available
    if (this.stateManager) {
      await this.stateManager.updateWorkflowState(platform, {
        currentStep: stepIndex
      });
    }
    
    this.emit(`${platform}:step-changed`, stepIndex);
  }

  /**
   * Update step data
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {Object} data - Step data
   */
  async updateStepData(platform, stepName, data) {
    if (!this.state[platform]) return;

    this.state[platform].stepData[stepName] = {
      ...this.state[platform].stepData[stepName],
      ...data,
      lastUpdated: Date.now()
    };
    
    // Update middleware if available
    if (this.stateManager) {
      await this.stateManager.setWorkflowStep(platform, stepName, data);
    }
    
    this.emit(`${platform}:step-data-updated`, { stepName, data });
  }

  /**
   * Validate step
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   * @param {boolean} isValid - Validation result
   * @param {Array} errors - Validation errors
   */
  async validateStep(platform, stepName, isValid, errors = []) {
    if (!this.state[platform]) return;

    this.state[platform].validation[stepName] = {
      isValid,
      errors,
      validatedAt: Date.now()
    };
    
    // Update errors state
    if (errors.length > 0) {
      this.state[platform].errors[stepName] = errors;
    } else {
      delete this.state[platform].errors[stepName];
    }
    
    this.emit(`${platform}:step-validated`, { stepName, isValid, errors });
  }

  /**
   * Mark step as complete
   * @param {string} platform - 'ios' or 'android'
   * @param {string} stepName - Step identifier
   */
  async completeStep(platform, stepName) {
    if (!this.state[platform]) return;

    const stepData = this.state[platform].stepData[stepName] || {};
    stepData.completed = true;
    stepData.completedAt = Date.now();
    
    await this.updateStepData(platform, stepName, stepData);
    this.emit(`${platform}:step-completed`, stepName);
  }

  /**
   * Reset workflow
   * @param {string} platform - 'ios' or 'android'
   */
  async resetWorkflow(platform) {
    if (!this.state[platform]) return;

    this.state[platform] = {
      currentStep: 0,
      steps: this.state[platform].steps,
      stepData: {},
      isComplete: false,
      errors: {},
      validation: {}
    };
    
    // Update middleware if available
    if (this.stateManager) {
      await this.stateManager.updateWorkflowState(platform, {
        currentStep: 0,
        steps: {},
        isComplete: false
      });
    }
    
    this.emit(`${platform}:workflow-reset`);
  }

  /**
   * Check if workflow can proceed to next step
   * @param {string} platform - 'ios' or 'android'
   * @param {number} currentStep - Current step index
   * @returns {boolean}
   */
  canProceed(platform, currentStep) {
    const workflow = this.state[platform];
    if (!workflow || !workflow.steps[currentStep]) return false;

    const step = workflow.steps[currentStep];
    const stepData = workflow.stepData[step.name];
    const validation = workflow.validation[step.name];

    // Check if step is validated
    if (!validation || !validation.isValid) return false;

    // Check if required data is present
    if (step.required && (!stepData || !stepData.completed)) return false;

    return true;
  }

  /**
   * Get all step data for a workflow
   * @param {string} platform - 'ios' or 'android'
   * @returns {Object} All step data
   */
  getAllStepData(platform) {
    return { ...this.state[platform].stepData };
  }

  /**
   * Check if workflow is complete
   * @param {string} platform - 'ios' or 'android'
   * @returns {boolean}
   */
  isWorkflowComplete(platform) {
    const workflow = this.state[platform];
    if (!workflow) return false;

    // Check if all required steps are completed
    const requiredSteps = workflow.steps.filter(step => step.required !== false);
    const completedSteps = requiredSteps.filter(step => {
      const stepData = workflow.stepData[step.name];
      return stepData && stepData.completed;
    });

    return completedSteps.length === requiredSteps.length;
  }

  /**
   * Save workflow progress
   * @param {string} platform - 'ios' or 'android'
   */
  async saveProgress(platform) {
    if (!this.stateManager) return;

    const workflow = this.state[platform];
    await this.stateManager.updateWorkflowState(platform, {
      currentStep: workflow.currentStep,
      steps: workflow.stepData,
      isComplete: this.isWorkflowComplete(platform),
      metadata: {
        lastSaved: Date.now(),
        version: '1.0.0'
      }
    });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    // Remove middleware listeners
    if (this.stateManager) {
      this.stateManager.off('workflow-updated');
    }
    
    // Clear all listeners
    this.listeners.clear();
    
    // Reset state
    this.state = {
      ios: {
        currentStep: 0,
        steps: [],
        stepData: {},
        isComplete: false,
        errors: {},
        validation: {}
      },
      android: {
        currentStep: 0,
        steps: [],
        stepData: {},
        isComplete: false,
        errors: {},
        validation: {}
      }
    };
  }
}

// Export as singleton
const workflowStateManager = new WorkflowStateManager();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      workflowStateManager.initialize();
    });
  } else {
    workflowStateManager.initialize();
  }
}

export default workflowStateManager;