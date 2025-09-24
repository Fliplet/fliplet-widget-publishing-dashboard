/**
 * @jest-environment jsdom
 */

// Mock BaseMiddleware before requiring WorkflowManager
const mockBaseMiddleware = {
  prototype: {
    constructor: function(dependencies = {}, config = {}) {
      this.dependencies = dependencies;
      this.config = config;
      this.eventListeners = new Map();
      this.isInitialized = false;
      this.emit = jest.fn();
      this.on = jest.fn();
      this.off = jest.fn();
      this.getState = jest.fn();
      this.getDependency = jest.fn();
      this.getConfig = jest.fn();
      this.getNestedValue = jest.fn();
      this.generateId = jest.fn(() => 'test-id-123');
      this.safeJsonParse = jest.fn();
      this.safeJsonStringify = jest.fn();
    }
  }
};

// Set up global mocks
global.window = global.window || {};
global.window.BaseMiddleware = function(dependencies = {}, config = {}) {
  mockBaseMiddleware.prototype.constructor.call(this, dependencies, config);
};
Object.setPrototypeOf(global.window.BaseMiddleware.prototype, mockBaseMiddleware.prototype);

// Mock dependencies
const mockStateManager = {
  getState: jest.fn(),
  setState: jest.fn()
};

const mockValidationEngine = {
  validateData: jest.fn(),
  validateField: jest.fn()
};

const mockErrorHandler = {
  handleError: jest.fn()
};

describe('WorkflowManager', () => {
  let WorkflowManager;
  let workflowManager;
  let dependencies;

  beforeAll(() => {
    // Require WorkflowManager after mocks are set up
    WorkflowManager = require('../../../src/middleware/controllers/WorkflowManager.js');
  });

  beforeEach(() => {
    dependencies = {
      stateManager: mockStateManager,
      validationEngine: mockValidationEngine,
      errorHandler: mockErrorHandler
    };

    workflowManager = new WorkflowManager(dependencies);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockStateManager.getState.mockReturnValue({
      workflows: {},
      activeWorkflow: null,
      workflowHistory: []
    });
    mockStateManager.setState.mockResolvedValue();
    mockValidationEngine.validateData.mockResolvedValue({ isValid: true });
    mockValidationEngine.validateField.mockResolvedValue({ isValid: true });
    mockErrorHandler.handleError.mockReturnValue({ code: 'ERROR', message: 'Test error' });
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(workflowManager.workflows).toBeInstanceOf(Map);
      expect(workflowManager.activeWorkflows).toBeInstanceOf(Map);
      expect(workflowManager.stepValidators).toBeInstanceOf(Map);
      expect(workflowManager.transitionHandlers).toBeInstanceOf(Map);
      expect(workflowManager.workflowSteps).toBeInstanceOf(Map);
    });

    test('should define workflow types', () => {
      expect(workflowManager.WORKFLOW_TYPES).toEqual({
        IOS_PUBLISHING: 'ios-publishing',
        ANDROID_PUBLISHING: 'android-publishing',
        PERMISSION_MANAGEMENT: 'permission-management'
      });
    });

    test('should define step statuses', () => {
      expect(workflowManager.STEP_STATUS).toEqual({
        PENDING: 'pending',
        IN_PROGRESS: 'in-progress',
        COMPLETED: 'completed',
        FAILED: 'failed',
        SKIPPED: 'skipped'
      });
    });

    test('should define workflow statuses', () => {
      expect(workflowManager.WORKFLOW_STATUS).toEqual({
        NOT_STARTED: 'not-started',
        IN_PROGRESS: 'in-progress',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
      });
    });
  });

  describe('getRequiredDependencies', () => {
    test('should return correct required dependencies', () => {
      const required = workflowManager.getRequiredDependencies();
      expect(required).toEqual(['stateManager', 'validationEngine', 'errorHandler']);
    });
  });

  describe('setup', () => {
    test('should initialize workflow state if not exists', async () => {
      workflowManager.getState = jest.fn().mockReturnValue({});

      await workflowManager.setup();

      expect(mockStateManager.setState).toHaveBeenCalledWith({
        workflows: {},
        activeWorkflow: null,
        workflowHistory: []
      });
    });

    test('should not initialize state if it already exists', async () => {
      workflowManager.getState = jest.fn().mockReturnValue({
        workflows: { existing: 'data' },
        activeWorkflow: 'test-workflow',
        workflowHistory: []
      });

      await workflowManager.setup();

      expect(mockStateManager.setState).not.toHaveBeenCalled();
    });
  });

  describe('registerWorkflow', () => {
    test('should register workflow successfully', () => {
      const workflowType = 'test-workflow';
      const steps = [
        { name: 'step1', description: 'First step' },
        { name: 'step2', description: 'Second step' }
      ];
      const options = { timeout: 60000 };

      workflowManager.registerWorkflow(workflowType, steps, options);

      const workflow = workflowManager.workflows.get(workflowType);
      expect(workflow).toEqual({
        type: workflowType,
        steps: steps,
        options: {
          allowParallel: false,
          maxRetries: 3,
          timeout: 60000
        }
      });

      expect(workflowManager.workflowSteps.get(workflowType)).toEqual(steps);
      expect(workflowManager.emit).toHaveBeenCalledWith('workflow-registered', {
        workflowType,
        steps,
        options: expect.any(Object)
      });
    });

    test('should validate workflow definition', () => {
      expect(() => {
        workflowManager.registerWorkflow('', []);
      }).toThrow('Workflow type must be a non-empty string');

      expect(() => {
        workflowManager.registerWorkflow('test', []);
      }).toThrow('Workflow must have at least one step');

      expect(() => {
        workflowManager.registerWorkflow('test', [{}]);
      }).toThrow('Step 0 must have a name');
    });
  });

  describe('startWorkflow', () => {
    beforeEach(() => {
      const steps = [
        { name: 'step1', description: 'First step' }
      ];
      workflowManager.registerWorkflow('test-workflow', steps);
      workflowManager.processNextStep = jest.fn();
      workflowManager.updateWorkflowState = jest.fn().mockResolvedValue();
    });

    test('should start workflow successfully', async () => {
      const context = { testData: 'value' };

      const workflowId = await workflowManager.startWorkflow('test-workflow', context);

      expect(workflowId).toBe('test-id-123');
      expect(workflowManager.activeWorkflows.has(workflowId)).toBe(true);

      const workflow = workflowManager.activeWorkflows.get(workflowId);
      expect(workflow.type).toBe('test-workflow');
      expect(workflow.status).toBe('in-progress');
      expect(workflow.context).toEqual(context);
      expect(workflowManager.emit).toHaveBeenCalledWith('workflow-started', {
        workflowId,
        workflowType: 'test-workflow',
        context
      });
    });

    test('should throw error for unknown workflow type', async () => {
      await expect(workflowManager.startWorkflow('unknown-workflow', {}))
        .rejects.toThrow('Unknown workflow type: unknown-workflow');
    });

    test('should handle errors and emit workflow-error', async () => {
      workflowManager.updateWorkflowState.mockRejectedValue(new Error('Update failed'));

      await expect(workflowManager.startWorkflow('test-workflow', {}))
        .rejects.toThrow('Update failed');

      expect(mockErrorHandler.handleError).toHaveBeenCalled();
      expect(workflowManager.emit).toHaveBeenCalledWith('workflow-error', expect.any(Object));
    });
  });

  describe('processNextStep', () => {
    beforeEach(() => {
      workflowManager.validateStepPrerequisites = jest.fn().mockResolvedValue(true);
      workflowManager.executeStep = jest.fn().mockResolvedValue('step-result');
      workflowManager.updateWorkflowState = jest.fn().mockResolvedValue();
      workflowManager.completeWorkflow = jest.fn().mockResolvedValue();
    });

    test('should process step successfully', async () => {
      const workflow = {
        status: 'in-progress',
        currentStep: 0,
        steps: [
          { name: 'step1', status: 'pending' }
        ]
      };
      workflowManager.activeWorkflows.set('test-workflow', workflow);

      const result = await workflowManager.processNextStep('test-workflow');

      expect(result).toBe(false); // Workflow completed
      expect(workflow.steps[0].status).toBe('completed');
      expect(workflow.currentStep).toBe(1);
      expect(workflowManager.completeWorkflow).toHaveBeenCalledWith('test-workflow');
    });

    test('should return false for non-existent workflow', async () => {
      await expect(workflowManager.processNextStep('non-existent'))
        .rejects.toThrow('Workflow not found: non-existent');
    });

    test('should return false for non-active workflow', async () => {
      const workflow = { status: 'completed' };
      workflowManager.activeWorkflows.set('test-workflow', workflow);

      const result = await workflowManager.processNextStep('test-workflow');

      expect(result).toBe(false);
    });

    test('should handle step errors', async () => {
      const workflow = {
        status: 'in-progress',
        currentStep: 0,
        steps: [{ name: 'step1', status: 'pending' }]
      };
      workflowManager.activeWorkflows.set('test-workflow', workflow);

      workflowManager.executeStep.mockRejectedValue(new Error('Step failed'));
      workflowManager.handleStepError = jest.fn().mockResolvedValue();

      await workflowManager.processNextStep('test-workflow');

      expect(workflowManager.handleStepError).toHaveBeenCalled();
    });
  });

  describe('executeStep', () => {
    test('should execute step with custom handler', async () => {
      const mockHandler = jest.fn().mockResolvedValue('handler-result');
      const step = {
        name: 'test-step',
        handler: mockHandler
      };
      const workflow = {
        context: { test: 'data' },
        options: { timeout: 30000 }
      };
      workflowManager.activeWorkflows.set('test-workflow', workflow);

      const result = await workflowManager.executeStep('test-workflow', step);

      expect(result).toBe('handler-result');
      expect(mockHandler).toHaveBeenCalledWith(workflow.context, dependencies);
    });

    test('should execute step with predefined action', async () => {
      const step = {
        name: 'test-step',
        action: 'validate-data',
        params: { rules: ['rule1'] }
      };
      const workflow = {
        context: { test: 'data' },
        options: { timeout: 30000 }
      };
      workflowManager.activeWorkflows.set('test-workflow', workflow);
      workflowManager.executeAction = jest.fn().mockResolvedValue('action-result');

      const result = await workflowManager.executeStep('test-workflow', step);

      expect(result).toBe('action-result');
      expect(workflowManager.executeAction).toHaveBeenCalledWith('validate-data', workflow.context, { rules: ['rule1'] });
    });

    test('should timeout step execution', async () => {
      const step = {
        name: 'test-step',
        timeout: 100,
        handler: () => new Promise(resolve => setTimeout(resolve, 200))
      };
      const workflow = {
        context: {},
        options: {}
      };
      workflowManager.activeWorkflows.set('test-workflow', workflow);

      await expect(workflowManager.executeStep('test-workflow', step))
        .rejects.toThrow('Step timeout after 100ms: test-step');
    });
  });

  describe('executeAction', () => {
    test('should execute validate-data action', async () => {
      const context = { test: 'data' };
      const params = { rules: ['rule1'] };
      mockValidationEngine.validateData.mockResolvedValue({ isValid: true });

      const result = await workflowManager.executeAction('validate-data', context, params);

      expect(result).toEqual({ isValid: true });
      expect(mockValidationEngine.validateData).toHaveBeenCalledWith(context, ['rule1']);
    });

    test('should execute update-context action', async () => {
      const context = { existing: 'data' };
      const params = { updates: { new: 'value' } };

      const result = await workflowManager.executeAction('update-context', context, params);

      expect(result).toEqual({ existing: 'data', new: 'value' });
      expect(context).toEqual({ existing: 'data', new: 'value' });
    });

    test('should execute emit-event action', async () => {
      const context = { test: 'data' };
      const params = { event: 'test-event' };

      const result = await workflowManager.executeAction('emit-event', context, params);

      expect(result).toEqual({ event: 'test-event', emitted: true });
      expect(workflowManager.emit).toHaveBeenCalledWith('test-event', { context, params });
    });

    test('should throw error for unknown action', async () => {
      await expect(workflowManager.executeAction('unknown-action', {}, {}))
        .rejects.toThrow('Unknown action: unknown-action');
    });
  });

  describe('validateStepPrerequisites', () => {
    test('should return true for step with no prerequisites', async () => {
      const step = { name: 'test-step' };
      const result = await workflowManager.validateStepPrerequisites('workflow-id', step);
      expect(result).toBe(true);
    });

    test('should validate step prerequisite', async () => {
      const workflow = {
        steps: [
          { name: 'required-step', status: 'completed' }
        ]
      };
      workflowManager.activeWorkflows.set('workflow-id', workflow);

      const step = {
        name: 'test-step',
        prerequisites: [
          { type: 'step', step: 'required-step' }
        ]
      };

      const result = await workflowManager.validateStepPrerequisites('workflow-id', step);
      expect(result).toBe(true);
    });

    test('should validate context prerequisite', async () => {
      const workflow = {
        context: { required: { value: 'exists' } }
      };
      workflowManager.activeWorkflows.set('workflow-id', workflow);
      workflowManager.getNestedValue = jest.fn().mockReturnValue('exists');

      const step = {
        name: 'test-step',
        prerequisites: [
          { type: 'context', path: 'required.value' }
        ]
      };

      const result = await workflowManager.validateStepPrerequisites('workflow-id', step);
      expect(result).toBe(true);
    });

    test('should validate validation prerequisite', async () => {
      const workflow = {
        context: { field: 'value' }
      };
      workflowManager.activeWorkflows.set('workflow-id', workflow);
      mockValidationEngine.validateField.mockResolvedValue({ isValid: true });

      const step = {
        name: 'test-step',
        prerequisites: [
          { type: 'validation', field: 'field', rules: ['required'] }
        ]
      };

      const result = await workflowManager.validateStepPrerequisites('workflow-id', step);
      expect(result).toBe(true);
    });
  });

  describe('handleStepError', () => {
    beforeEach(() => {
      workflowManager.updateWorkflowState = jest.fn().mockResolvedValue();
      workflowManager.failWorkflow = jest.fn().mockResolvedValue();
      workflowManager.processNextStep = jest.fn();
    });

    test('should retry failed step if retries available', async () => {
      const workflow = {
        options: { maxRetries: 3 }
      };
      const step = {
        name: 'test-step',
        retries: 1,
        maxRetries: undefined,
        retryable: true
      };
      workflowManager.activeWorkflows.set('workflow-id', workflow);

      jest.useFakeTimers();

      await workflowManager.handleStepError('workflow-id', step, new Error('Test error'));

      expect(step.retries).toBe(2);
      expect(step.status).toBe('pending');
      expect(workflowManager.emit).toHaveBeenCalledWith('step-retry', expect.any(Object));

      jest.advanceTimersByTime(1000);
      expect(workflowManager.processNextStep).toHaveBeenCalled();

      jest.useRealTimers();
    });

    test('should skip optional failed step', async () => {
      const workflow = { currentStep: 0 };
      const step = {
        name: 'test-step',
        retries: 3,
        optional: true
      };
      workflowManager.activeWorkflows.set('workflow-id', workflow);
      workflowManager.processNextStep.mockResolvedValue();

      await workflowManager.handleStepError('workflow-id', step, new Error('Test error'));

      expect(step.status).toBe('skipped');
      expect(workflow.currentStep).toBe(1);
      expect(workflowManager.emit).toHaveBeenCalledWith('step-skipped', expect.any(Object));
    });

    test('should fail workflow for required failed step', async () => {
      const workflow = {};
      const step = {
        name: 'test-step',
        retries: 3,
        optional: false
      };
      workflowManager.activeWorkflows.set('workflow-id', workflow);

      await workflowManager.handleStepError('workflow-id', step, new Error('Test error'));

      expect(step.status).toBe('failed');
      expect(workflowManager.failWorkflow).toHaveBeenCalledWith('workflow-id', expect.any(Error));
    });
  });

  describe('completeWorkflow', () => {
    test('should complete workflow successfully', async () => {
      const workflow = { id: 'test-workflow' };
      workflowManager.activeWorkflows.set('workflow-id', workflow);
      workflowManager.updateWorkflowState = jest.fn().mockResolvedValue();

      await workflowManager.completeWorkflow('workflow-id');

      expect(workflow.status).toBe('completed');
      expect(workflow.endTime).toBeDefined();
      expect(workflowManager.activeWorkflows.has('workflow-id')).toBe(false);
      expect(workflowManager.emit).toHaveBeenCalledWith('workflow-completed', { workflowId: 'workflow-id', workflow });
    });

    test('should handle non-existent workflow', async () => {
      await workflowManager.completeWorkflow('non-existent');
      // Should not throw error
    });
  });

  describe('failWorkflow', () => {
    test('should fail workflow with error', async () => {
      const workflow = { id: 'test-workflow' };
      workflowManager.activeWorkflows.set('workflow-id', workflow);
      workflowManager.updateWorkflowState = jest.fn().mockResolvedValue();

      await workflowManager.failWorkflow('workflow-id', new Error('Test failure'));

      expect(workflow.status).toBe('failed');
      expect(workflow.endTime).toBeDefined();
      expect(workflow.error).toBe('Test failure');
      expect(workflowManager.activeWorkflows.has('workflow-id')).toBe(false);
      expect(workflowManager.emit).toHaveBeenCalledWith('workflow-failed', expect.any(Object));
    });
  });

  describe('cancelWorkflow', () => {
    test('should cancel workflow with reason', async () => {
      const workflow = { id: 'test-workflow' };
      workflowManager.activeWorkflows.set('workflow-id', workflow);
      workflowManager.updateWorkflowState = jest.fn().mockResolvedValue();

      await workflowManager.cancelWorkflow('workflow-id', 'Test cancellation');

      expect(workflow.status).toBe('cancelled');
      expect(workflow.endTime).toBeDefined();
      expect(workflow.cancellationReason).toBe('Test cancellation');
      expect(workflowManager.activeWorkflows.has('workflow-id')).toBe(false);
      expect(workflowManager.emit).toHaveBeenCalledWith('workflow-cancelled', expect.any(Object));
    });
  });

  describe('getWorkflowStatus', () => {
    test('should return workflow status', () => {
      const workflow = { id: 'test-workflow', status: 'in-progress' };
      workflowManager.activeWorkflows.set('workflow-id', workflow);

      const result = workflowManager.getWorkflowStatus('workflow-id');

      expect(result).toBe(workflow);
    });

    test('should return null for non-existent workflow', () => {
      const result = workflowManager.getWorkflowStatus('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getActiveWorkflows', () => {
    test('should return all active workflows', () => {
      const workflow1 = { id: 'workflow-1' };
      const workflow2 = { id: 'workflow-2' };

      workflowManager.activeWorkflows.set('workflow-1', workflow1);
      workflowManager.activeWorkflows.set('workflow-2', workflow2);

      const result = workflowManager.getActiveWorkflows();

      expect(result).toEqual([workflow1, workflow2]);
    });

    test('should return empty array when no active workflows', () => {
      const result = workflowManager.getActiveWorkflows();
      expect(result).toEqual([]);
    });
  });

  describe('updateWorkflowState', () => {
    test('should update workflow in state manager', async () => {
      const workflow = { id: 'test-workflow', status: 'in-progress' };
      const currentState = {
        workflows: {},
        activeWorkflow: null
      };
      workflowManager.getState = jest.fn().mockReturnValue(currentState);

      await workflowManager.updateWorkflowState('workflow-id', workflow);

      expect(mockStateManager.setState).toHaveBeenCalledWith({
        workflows: { 'workflow-id': workflow },
        activeWorkflow: 'workflow-id'
      });
    });
  });

  describe('validateWorkflowDefinition', () => {
    test('should validate correct workflow definition', () => {
      const steps = [{ name: 'step1' }];
      expect(() => {
        workflowManager.validateWorkflowDefinition('test-workflow', steps);
      }).not.toThrow();
    });

    test('should throw error for invalid workflow type', () => {
      expect(() => {
        workflowManager.validateWorkflowDefinition('', []);
      }).toThrow('Workflow type must be a non-empty string');

      expect(() => {
        workflowManager.validateWorkflowDefinition(null, []);
      }).toThrow('Workflow type must be a non-empty string');
    });

    test('should throw error for invalid steps', () => {
      expect(() => {
        workflowManager.validateWorkflowDefinition('test', null);
      }).toThrow('Workflow must have at least one step');

      expect(() => {
        workflowManager.validateWorkflowDefinition('test', []);
      }).toThrow('Workflow must have at least one step');

      expect(() => {
        workflowManager.validateWorkflowDefinition('test', [{}]);
      }).toThrow('Step 0 must have a name');
    });
  });
});