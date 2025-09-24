/**
 * WorkflowManager - Central orchestrator for publishing workflows
 *
 * Manages step validation, state transitions, and coordination between
 * different workflow controllers (iOS, Android, permissions).
 *
 * @class WorkflowManager
 * @extends BaseMiddleware
 */

// Handle BaseMiddleware inheritance resolution for Jest compatibility
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

class WorkflowManager extends BaseMiddlewareClass {
  /**
   * Creates an instance of WorkflowManager
   * @param {Object} dependencies - Injected dependencies
   * @param {StateManager} dependencies.stateManager - State management service
   * @param {ValidationEngine} dependencies.validationEngine - Validation service
   * @param {ErrorHandler} dependencies.errorHandler - Error handling service
   * @param {Object} config - Configuration object
   */
  constructor(dependencies = {}, config = {}) {
    super(dependencies, config);

    this.workflows = new Map();
    this.activeWorkflows = new Map();
    this.stepValidators = new Map();
    this.transitionHandlers = new Map();
    this.workflowSteps = new Map();

    // Workflow types
    this.WORKFLOW_TYPES = {
      IOS_PUBLISHING: 'ios-publishing',
      ANDROID_PUBLISHING: 'android-publishing',
      PERMISSION_MANAGEMENT: 'permission-management'
    };

    // Step statuses
    this.STEP_STATUS = {
      PENDING: 'pending',
      IN_PROGRESS: 'in-progress',
      COMPLETED: 'completed',
      FAILED: 'failed',
      SKIPPED: 'skipped'
    };

    // Workflow statuses
    this.WORKFLOW_STATUS = {
      NOT_STARTED: 'not-started',
      IN_PROGRESS: 'in-progress',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled'
    };
  }

  /**
   * Get required dependencies for WorkflowManager
   * @returns {string[]} Array of required dependency names
   */
  getRequiredDependencies() {
    return ['stateManager', 'validationEngine', 'errorHandler'];
  }

  /**
   * Initialize the WorkflowManager
   * @returns {Promise<void>}
   */
  async setup() {
    this.registerDefaultWorkflows();
    this.setupEventListeners();

    // Initialize state if not exists
    const state = this.getState();
    if (!state.workflows) {
      await this.dependencies.stateManager.setState({
        workflows: {},
        activeWorkflow: null,
        workflowHistory: []
      });
    }
  }

  /**
   * Register a workflow with its step definitions
   * @param {string} workflowType - Type of workflow
   * @param {Array} steps - Array of step definitions
   * @param {Object} options - Workflow options
   */
  registerWorkflow(workflowType, steps, options = {}) {
    this.validateWorkflowDefinition(workflowType, steps);

    this.workflows.set(workflowType, {
      type: workflowType,
      steps: steps,
      options: {
        allowParallel: false,
        maxRetries: 3,
        timeout: 30000,
        ...options
      }
    });

    this.workflowSteps.set(workflowType, steps);
    this.emit('workflow-registered', { workflowType, steps, options });
  }

  /**
   * Start a workflow
   * @param {string} workflowType - Type of workflow to start
   * @param {Object} context - Workflow context data
   * @returns {Promise<string>} Workflow instance ID
   */
  async startWorkflow(workflowType, context = {}) {
    try {
      const workflow = this.workflows.get(workflowType);
      if (!workflow) {
        throw new Error(`Unknown workflow type: ${workflowType}`);
      }

      const workflowId = this.generateId();
      const workflowInstance = {
        id: workflowId,
        type: workflowType,
        status: this.WORKFLOW_STATUS.IN_PROGRESS,
        currentStep: 0,
        steps: workflow.steps.map(step => ({
          ...step,
          status: this.STEP_STATUS.PENDING,
          startTime: null,
          endTime: null,
          error: null,
          retries: 0
        })),
        context: { ...context },
        startTime: new Date().toISOString(),
        endTime: null,
        error: null
      };

      this.activeWorkflows.set(workflowId, workflowInstance);

      // Update state
      await this.updateWorkflowState(workflowId, workflowInstance);

      this.emit('workflow-started', { workflowId, workflowType, context });

      // Start processing first step
      await this.processNextStep(workflowId);

      return workflowId;

    } catch (error) {
      const errorDetails = this.dependencies.errorHandler.handleError(error, 'WorkflowManager.startWorkflow');
      this.emit('workflow-error', { workflowType, context, error: errorDetails });
      throw error;
    }
  }

  /**
   * Process the next step in a workflow
   * @param {string} workflowId - Workflow instance ID
   * @returns {Promise<boolean>} True if step was processed, false if workflow complete
   */
  async processNextStep(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== this.WORKFLOW_STATUS.IN_PROGRESS) {
      return false;
    }

    const currentStepIndex = workflow.currentStep;
    if (currentStepIndex >= workflow.steps.length) {
      await this.completeWorkflow(workflowId);
      return false;
    }

    const step = workflow.steps[currentStepIndex];

    try {
      // Validate step prerequisites
      const canExecute = await this.validateStepPrerequisites(workflowId, step);
      if (!canExecute) {
        throw new Error(`Step prerequisites not met for: ${step.name}`);
      }

      // Mark step as in progress
      step.status = this.STEP_STATUS.IN_PROGRESS;
      step.startTime = new Date().toISOString();

      await this.updateWorkflowState(workflowId, workflow);
      this.emit('step-started', { workflowId, step: step.name, stepIndex: currentStepIndex });

      // Execute step
      const result = await this.executeStep(workflowId, step);

      // Mark step as completed
      step.status = this.STEP_STATUS.COMPLETED;
      step.endTime = new Date().toISOString();
      step.result = result;

      // Move to next step
      workflow.currentStep++;

      await this.updateWorkflowState(workflowId, workflow);
      this.emit('step-completed', { workflowId, step: step.name, stepIndex: currentStepIndex, result });

      // Process next step
      return await this.processNextStep(workflowId);

    } catch (error) {
      await this.handleStepError(workflowId, step, error);
      return false;
    }
  }

  /**
   * Execute a workflow step
   * @param {string} workflowId - Workflow instance ID
   * @param {Object} step - Step definition
   * @returns {Promise<*>} Step execution result
   */
  async executeStep(workflowId, step) {
    const workflow = this.activeWorkflows.get(workflowId);

    // Apply step timeout if specified
    const timeout = step.timeout || workflow.options?.timeout || 30000;

    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Step timeout after ${timeout}ms: ${step.name}`));
      }, timeout);

      try {
        let result;

        if (step.handler && typeof step.handler === 'function') {
          // Execute custom step handler
          result = await step.handler(workflow.context, this.dependencies);
        } else if (step.action) {
          // Execute predefined action
          result = await this.executeAction(step.action, workflow.context, step.params);
        } else {
          // Default validation-only step
          result = await this.validateStep(step, workflow.context);
        }

        clearTimeout(timeoutId);
        resolve(result);

      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Execute a predefined action
   * @param {string} action - Action name
   * @param {Object} context - Workflow context
   * @param {Object} params - Action parameters
   * @returns {Promise<*>} Action result
   */
  async executeAction(action, context, params = {}) {
    switch (action) {
      case 'validate-data':
        return await this.dependencies.validationEngine.validateData(context, params.rules || []);

      case 'update-context':
        Object.assign(context, params.updates || {});
        return context;

      case 'emit-event':
        this.emit(params.event || 'workflow-event', { context, params });
        return { event: params.event, emitted: true };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Validate step prerequisites
   * @param {string} workflowId - Workflow instance ID
   * @param {Object} step - Step definition
   * @returns {Promise<boolean>} True if prerequisites are met
   */
  async validateStepPrerequisites(workflowId, step) {
    const workflow = this.activeWorkflows.get(workflowId);

    if (!step.prerequisites || step.prerequisites.length === 0) {
      return true;
    }

    for (const prerequisite of step.prerequisites) {
      if (prerequisite.type === 'step') {
        // Check if required step is completed
        const requiredStep = workflow.steps.find(s => s.name === prerequisite.step);
        if (!requiredStep || requiredStep.status !== this.STEP_STATUS.COMPLETED) {
          return false;
        }
      } else if (prerequisite.type === 'context') {
        // Check if required context data exists
        const value = this.getNestedValue(workflow.context, prerequisite.path);
        if (value === undefined || value === null) {
          return false;
        }
      } else if (prerequisite.type === 'validation') {
        // Run validation check
        const isValid = await this.dependencies.validationEngine.validateField(
          prerequisite.field,
          workflow.context[prerequisite.field],
          prerequisite.rules || []
        );
        if (!isValid.isValid) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate a step
   * @param {Object} step - Step definition
   * @param {Object} context - Workflow context
   * @returns {Promise<Object>} Validation result
   */
  async validateStep(step, context) {
    if (!step.validation) {
      return { valid: true };
    }

    const result = await this.dependencies.validationEngine.validateData(context, step.validation);

    if (!result.isValid) {
      throw new Error(`Step validation failed: ${step.name} - ${result.errors.join(', ')}`);
    }

    return result;
  }

  /**
   * Handle step execution error
   * @param {string} workflowId - Workflow instance ID
   * @param {Object} step - Step definition
   * @param {Error} error - The error that occurred
   */
  async handleStepError(workflowId, step, error) {
    const workflow = this.activeWorkflows.get(workflowId);
    const maxRetries = step.maxRetries || workflow.options?.maxRetries || 3;

    step.retries = (step.retries || 0) + 1;
    step.error = error.message;
    step.endTime = new Date().toISOString();

    if (step.retries < maxRetries && step.retryable !== false) {
      // Retry the step
      step.status = this.STEP_STATUS.PENDING;
      step.startTime = null;
      step.endTime = null;

      this.emit('step-retry', { workflowId, step: step.name, retry: step.retries, error: error.message });

      // Wait before retry
      const retryDelay = step.retryDelay || 1000;
      setTimeout(() => {
        this.processNextStep(workflowId);
      }, retryDelay);

    } else {
      // Mark step as failed
      step.status = this.STEP_STATUS.FAILED;

      if (step.optional) {
        // Skip optional step and continue
        step.status = this.STEP_STATUS.SKIPPED;
        workflow.currentStep++;

        this.emit('step-skipped', { workflowId, step: step.name, reason: 'optional-failed', error: error.message });
        await this.updateWorkflowState(workflowId, workflow);
        await this.processNextStep(workflowId);

      } else {
        // Fail the entire workflow
        await this.failWorkflow(workflowId, error);
      }
    }

    await this.updateWorkflowState(workflowId, workflow);
  }

  /**
   * Complete a workflow
   * @param {string} workflowId - Workflow instance ID
   */
  async completeWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    workflow.status = this.WORKFLOW_STATUS.COMPLETED;
    workflow.endTime = new Date().toISOString();

    await this.updateWorkflowState(workflowId, workflow);
    this.emit('workflow-completed', { workflowId, workflow });

    this.activeWorkflows.delete(workflowId);
  }

  /**
   * Fail a workflow
   * @param {string} workflowId - Workflow instance ID
   * @param {Error} error - The error that caused failure
   */
  async failWorkflow(workflowId, error) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    workflow.status = this.WORKFLOW_STATUS.FAILED;
    workflow.endTime = new Date().toISOString();
    workflow.error = error.message;

    await this.updateWorkflowState(workflowId, workflow);
    this.emit('workflow-failed', { workflowId, workflow, error: error.message });

    this.activeWorkflows.delete(workflowId);
  }

  /**
   * Cancel a workflow
   * @param {string} workflowId - Workflow instance ID
   * @param {string} reason - Cancellation reason
   */
  async cancelWorkflow(workflowId, reason = 'User cancelled') {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    workflow.status = this.WORKFLOW_STATUS.CANCELLED;
    workflow.endTime = new Date().toISOString();
    workflow.cancellationReason = reason;

    await this.updateWorkflowState(workflowId, workflow);
    this.emit('workflow-cancelled', { workflowId, workflow, reason });

    this.activeWorkflows.delete(workflowId);
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow instance ID
   * @returns {Object|null} Workflow instance or null if not found
   */
  getWorkflowStatus(workflowId) {
    return this.activeWorkflows.get(workflowId) || null;
  }

  /**
   * Get all active workflows
   * @returns {Array} Array of active workflow instances
   */
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Update workflow state in StateManager
   * @param {string} workflowId - Workflow instance ID
   * @param {Object} workflow - Workflow instance
   */
  async updateWorkflowState(workflowId, workflow) {
    const state = this.getState();
    const workflows = { ...state.workflows };
    workflows[workflowId] = workflow;

    await this.dependencies.stateManager.setState({
      workflows,
      activeWorkflow: workflow.status === this.WORKFLOW_STATUS.IN_PROGRESS ? workflowId : state.activeWorkflow
    });
  }

  /**
   * Validate workflow definition
   * @param {string} workflowType - Workflow type
   * @param {Array} steps - Step definitions
   */
  validateWorkflowDefinition(workflowType, steps) {
    if (!workflowType || typeof workflowType !== 'string') {
      throw new Error('Workflow type must be a non-empty string');
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    steps.forEach((step, index) => {
      if (!step.name || typeof step.name !== 'string') {
        throw new Error(`Step ${index} must have a name`);
      }
    });
  }

  /**
   * Register default workflows
   */
  registerDefaultWorkflows() {
    // These will be populated by the specific workflow controllers
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for state changes that might affect workflows
    this.on('state-changed', (data) => {
      this.emit('workflow-state-changed', data);
    });
  }
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.WorkflowManager = WorkflowManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowManager;
}