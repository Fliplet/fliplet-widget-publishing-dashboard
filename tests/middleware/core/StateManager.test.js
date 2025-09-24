/**
 * StateManager Tests
 */

// Import the StateManager class
require('../../../src/middleware/core/StateManager.js');

describe('StateManager', () => {
  let stateManager;
  let mockDependencies;
  let mockConfig;

  beforeEach(() => {
    mockDependencies = createMockDependencies();
    mockConfig = createMockConfig();
    stateManager = new window.StateManager(mockDependencies, mockConfig);
  });

  afterEach(() => {
    if (stateManager) {
      stateManager.cleanup();
    }
  });

  describe('Constructor', () => {
    test('should initialize with default state schema', () => {
      expect(stateManager.state).toEqual({
        workflows: {
          ios: { currentStep: null, steps: {}, metadata: {}, isComplete: false },
          android: { currentStep: null, steps: {}, metadata: {}, isComplete: false }
        },
        currentWorkflow: null,
        submissions: {},
        cache: {}
      });
      expect(stateManager.storageKey).toBe('test-publishing-dashboard-state');
      expect(stateManager.autoSave).toBe(true);
    });

    test('should load state from localStorage if available', () => {
      const savedState = {
        workflows: {
          ios: { currentStep: 'api-key', steps: { 'api-key': { status: 'completed' } }, metadata: {}, isComplete: false }
        },
        currentWorkflow: 'ios'
      };
      localStorage.setItem('test-publishing-dashboard-state', JSON.stringify(savedState));

      const newStateManager = new window.StateManager(mockDependencies, mockConfig);
      expect(newStateManager.state.workflows.ios.currentStep).toBe('api-key');
      expect(newStateManager.state.currentWorkflow).toBe('ios');
    });

    test('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('test-publishing-dashboard-state', 'invalid json');
      const emitSpy = jest.spyOn(mockDependencies.errorHandler, 'emit');

      const newStateManager = new window.StateManager(mockDependencies, mockConfig);
      expect(newStateManager.state.currentWorkflow).toBeNull();
      expect(emitSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        category: 'STORAGE_ERROR'
      }));
    });
  });

  describe('State Management', () => {
    test('should get current state', () => {
      const state = stateManager.getState();
      expect(state).toBe(stateManager.state);
    });

    test('should set state and trigger save', async () => {
      const newState = { test: 'value' };
      const emitSpy = jest.spyOn(stateManager, 'emit');

      const result = await stateManager.setState(newState);

      expect(result).toBe(true);
      expect(stateManager.state).toEqual(newState);
      expect(emitSpy).toHaveBeenCalledWith('state-changed', newState);
    });

    test('should merge state when merging is enabled', async () => {
      stateManager.state = { existing: 'value', nested: { prop: 'old' } };
      const newState = { new: 'value', nested: { prop: 'new', added: 'property' } };

      await stateManager.setState(newState, true);

      expect(stateManager.state).toEqual({
        existing: 'value',
        new: 'value',
        nested: { prop: 'new', added: 'property' }
      });
    });

    test('should save to localStorage when autoSave is enabled', async () => {
      const newState = { test: 'value' };
      await stateManager.setState(newState);

      const savedData = localStorage.getItem('test-publishing-dashboard-state');
      expect(JSON.parse(savedData)).toEqual(newState);
    });

    test('should not save to localStorage when autoSave is disabled', async () => {
      stateManager.autoSave = false;
      const newState = { test: 'value' };
      await stateManager.setState(newState);

      const savedData = localStorage.getItem('test-publishing-dashboard-state');
      expect(savedData).toBeNull();
    });
  });

  describe('Workflow Management', () => {
    test('should update workflow state', async () => {
      const workflowData = {
        currentStep: 'api-key',
        steps: { 'api-key': { status: 'in-progress' } }
      };

      const result = await stateManager.updateWorkflowState('ios', workflowData);

      expect(result).toBe(true);
      expect(stateManager.state.workflows.ios.currentStep).toBe('api-key');
      expect(stateManager.state.workflows.ios.steps['api-key'].status).toBe('in-progress');
    });

    test('should merge workflow state by default', async () => {
      stateManager.state.workflows.ios = {
        currentStep: 'existing',
        steps: { existing: { status: 'completed' } },
        metadata: { existing: 'data' }
      };

      await stateManager.updateWorkflowState('ios', {
        currentStep: 'new',
        steps: { new: { status: 'pending' } },
        metadata: { new: 'data' }
      });

      expect(stateManager.state.workflows.ios.steps).toEqual({
        existing: { status: 'completed' },
        new: { status: 'pending' }
      });
      expect(stateManager.state.workflows.ios.metadata).toEqual({
        existing: 'data',
        new: 'data'
      });
    });

    test('should set workflow step with validation', async () => {
      const stepData = { status: 'completed', data: { apiKeyId: 'test-key' } };

      const result = await stateManager.setWorkflowStep('ios', 'api-key', stepData);

      expect(result).toBe(true);
      expect(stateManager.state.workflows.ios.steps['api-key']).toEqual(stepData);
      expect(stateManager.state.workflows.ios.currentStep).toBe('api-key');
    });

    test('should validate state transitions', () => {
      const validTransition = stateManager.validateStateTransition('ios', null, 'api-key');
      expect(validTransition).toBe(true);

      stateManager.state.workflows.ios.currentStep = 'api-key';
      const nextValidTransition = stateManager.validateStateTransition('ios', 'api-key', 'bundle-id');
      expect(nextValidTransition).toBe(true);

      const invalidTransition = stateManager.validateStateTransition('ios', 'api-key', 'build');
      expect(invalidTransition).toBe(false);
    });

    test('should get workflow progress', () => {
      stateManager.state.workflows.ios = {
        currentStep: 'certificate',
        steps: {
          'api-key': { status: 'completed' },
          'bundle-id': { status: 'completed' },
          'certificate': { status: 'in-progress' }
        }
      };

      const progress = stateManager.getWorkflowProgress('ios');
      expect(progress.completed).toBe(2);
      expect(progress.total).toBe(8);
      expect(progress.percentage).toBe(25);
      expect(progress.currentStep).toBe('certificate');
    });

    test('should reset workflow state', async () => {
      stateManager.state.workflows.ios = {
        currentStep: 'certificate',
        steps: { 'api-key': { status: 'completed' } },
        metadata: { teamId: 'test' },
        isComplete: false
      };

      const result = await stateManager.resetWorkflowState('ios');

      expect(result).toBe(true);
      expect(stateManager.state.workflows.ios).toEqual({
        currentStep: null,
        steps: {},
        metadata: {},
        isComplete: false
      });
    });
  });

  describe('Submission Management', () => {
    test('should set submission data', async () => {
      const submissionData = {
        id: 'sub-123',
        status: 'pending',
        platform: 'ios',
        createdAt: new Date().toISOString()
      };

      const result = await stateManager.setSubmissionData('sub-123', submissionData);

      expect(result).toBe(true);
      expect(stateManager.state.submissions['sub-123']).toEqual(submissionData);
    });

    test('should get submission data', () => {
      const submissionData = { id: 'sub-123', status: 'completed' };
      stateManager.state.submissions['sub-123'] = submissionData;

      const result = stateManager.getSubmissionData('sub-123');
      expect(result).toEqual(submissionData);
    });

    test('should return null for non-existent submission', () => {
      const result = stateManager.getSubmissionData('non-existent');
      expect(result).toBeNull();
    });

    test('should update submission status', async () => {
      stateManager.state.submissions['sub-123'] = { id: 'sub-123', status: 'pending' };

      const result = await stateManager.updateSubmissionStatus('sub-123', 'completed');

      expect(result).toBe(true);
      expect(stateManager.state.submissions['sub-123'].status).toBe('completed');
      expect(stateManager.state.submissions['sub-123'].updatedAt).toBeDefined();
    });

    test('should handle updating non-existent submission', async () => {
      const result = await stateManager.updateSubmissionStatus('non-existent', 'completed');
      expect(result).toBe(false);
    });
  });

  describe('Cache Management', () => {
    test('should set cache data with TTL', async () => {
      const cacheData = { test: 'data' };
      const ttl = 5000;

      const result = await stateManager.setCacheData('test-key', cacheData, ttl);

      expect(result).toBe(true);
      expect(stateManager.state.cache['test-key'].data).toEqual(cacheData);
      expect(stateManager.state.cache['test-key'].expiresAt).toBeGreaterThan(Date.now());
    });

    test('should get valid cache data', () => {
      const cacheData = { test: 'data' };
      stateManager.state.cache['test-key'] = {
        data: cacheData,
        expiresAt: Date.now() + 5000
      };

      const result = stateManager.getCacheData('test-key');
      expect(result).toEqual(cacheData);
    });

    test('should return null for expired cache data', () => {
      const cacheData = { test: 'data' };
      stateManager.state.cache['test-key'] = {
        data: cacheData,
        expiresAt: Date.now() - 1000
      };

      const result = stateManager.getCacheData('test-key');
      expect(result).toBeNull();
    });

    test('should clear expired cache entries', async () => {
      stateManager.state.cache = {
        'valid-key': { data: { test: 'valid' }, expiresAt: Date.now() + 5000 },
        'expired-key': { data: { test: 'expired' }, expiresAt: Date.now() - 1000 }
      };

      await stateManager.clearExpiredCache();

      expect(stateManager.state.cache['valid-key']).toBeDefined();
      expect(stateManager.state.cache['expired-key']).toBeUndefined();
    });
  });

  describe('Storage Operations', () => {
    test('should save state to localStorage', async () => {
      stateManager.state = { test: 'data' };

      const result = await stateManager.saveToStorage();

      expect(result).toBe(true);
      const savedData = localStorage.getItem('test-publishing-dashboard-state');
      expect(JSON.parse(savedData)).toEqual({ test: 'data' });
    });

    test('should handle save errors gracefully', async () => {
      const emitSpy = jest.spyOn(stateManager, 'emit');
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await stateManager.saveToStorage();

      expect(result).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        category: 'STORAGE_ERROR'
      }));
    });

    test('should load state from localStorage', async () => {
      const savedState = { test: 'loaded data' };
      localStorage.setItem('test-publishing-dashboard-state', JSON.stringify(savedState));

      const result = await stateManager.loadFromStorage();

      expect(result).toBe(true);
      expect(stateManager.state).toEqual(savedState);
    });

    test('should clear storage', async () => {
      localStorage.setItem('test-publishing-dashboard-state', JSON.stringify({ test: 'data' }));

      const result = await stateManager.clearStorage();

      expect(result).toBe(true);
      expect(localStorage.getItem('test-publishing-dashboard-state')).toBeNull();
    });
  });

  describe('Event System Integration', () => {
    test('should emit state-changed events', async () => {
      const emitSpy = jest.spyOn(stateManager, 'emit');
      const newState = { test: 'value' };

      await stateManager.setState(newState);

      expect(emitSpy).toHaveBeenCalledWith('state-changed', newState);
    });

    test('should emit workflow-updated events', async () => {
      const emitSpy = jest.spyOn(stateManager, 'emit');
      const workflowData = { currentStep: 'api-key' };

      await stateManager.updateWorkflowState('ios', workflowData);

      expect(emitSpy).toHaveBeenCalledWith('workflow-updated', {
        platform: 'ios',
        workflow: expect.objectContaining(workflowData)
      });
    });

    test('should emit step-completed events', async () => {
      const emitSpy = jest.spyOn(stateManager, 'emit');
      const stepData = { status: 'completed' };

      await stateManager.setWorkflowStep('ios', 'api-key', stepData);

      expect(emitSpy).toHaveBeenCalledWith('step-completed', {
        platform: 'ios',
        step: 'api-key',
        data: stepData
      });
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources', () => {
      const emitSpy = jest.spyOn(stateManager, 'emit');

      stateManager.cleanup();

      expect(stateManager.eventListeners.size).toBe(0);
      expect(stateManager.isInitialized).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('cleanup', {
        component: 'StateManager'
      });
    });
  });
});