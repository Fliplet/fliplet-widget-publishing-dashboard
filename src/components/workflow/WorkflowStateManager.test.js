const fs = require('fs');
const path = require('path');

const stateManagerPath = path.resolve(__dirname, './WorkflowStateManager.js');
const mixinPath = path.resolve(__dirname, './workflowMixin.js');

describe('Workflow State Management', () => {
  describe('WorkflowStateManager', () => {
    it('should exist', () => {
      expect(fs.existsSync(stateManagerPath)).toBe(true);
    });

    it('should have proper class structure', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('class WorkflowStateManager');
      expect(content).toContain('constructor()');
      expect(content).toContain('initialize()');
    });

    it('should manage iOS and Android workflow states', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('ios: {');
      expect(content).toContain('android: {');
      expect(content).toContain('currentStep:');
      expect(content).toContain('stepData:');
      expect(content).toContain('isComplete:');
      expect(content).toContain('errors:');
      expect(content).toContain('validation:');
    });

    it('should integrate with PublishingMiddleware', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('window.PublishingMiddleware');
      expect(content).toContain('getComponent(\'stateManager\')');
      expect(content).toContain('loadStateFromMiddleware');
      expect(content).toContain('setupMiddlewareListeners');
    });

    it('should provide workflow state methods', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      // State management methods
      expect(content).toContain('getWorkflowState(platform)');
      expect(content).toContain('setCurrentStep(platform, stepIndex)');
      expect(content).toContain('updateStepData(platform, stepName, data)');
      expect(content).toContain('validateStep(platform, stepName, isValid, errors');
      expect(content).toContain('completeStep(platform, stepName)');
      expect(content).toContain('resetWorkflow(platform)');
    });

    it('should handle workflow progression', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('canProceed(platform, currentStep)');
      expect(content).toContain('isWorkflowComplete(platform)');
      expect(content).toContain('saveProgress(platform)');
    });

    it('should provide event emitter functionality', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('on(event, callback)');
      expect(content).toContain('off(event, callback)');
      expect(content).toContain('emit(event, data)');
      expect(content).toContain('listeners = new Map()');
    });

    it('should emit workflow events', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('workflow-updated');
      expect(content).toContain('step-changed');
      expect(content).toContain('step-data-updated');
      expect(content).toContain('step-validated');
      expect(content).toContain('step-completed');
      expect(content).toContain('workflow-reset');
    });

    it('should handle cleanup properly', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('destroy()');
      expect(content).toContain('this.listeners.clear()');
    });

    it('should export as singleton', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('const workflowStateManager = new WorkflowStateManager()');
      expect(content).toContain('export default workflowStateManager');
    });

    it('should auto-initialize when DOM is ready', () => {
      const content = fs.readFileSync(stateManagerPath, 'utf8');
      
      expect(content).toContain('document.readyState');
      expect(content).toContain('DOMContentLoaded');
      expect(content).toContain('workflowStateManager.initialize()');
    });
  });

  describe('workflowMixin', () => {
    it('should exist', () => {
      expect(fs.existsSync(mixinPath)).toBe(true);
    });

    it('should import WorkflowStateManager', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('import workflowStateManager from \'./WorkflowStateManager\'');
    });

    it('should provide data properties', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('workflowState:');
      expect(content).toContain('currentStepIndex:');
      expect(content).toContain('stepValidation:');
      expect(content).toContain('workflowLoading:');
      expect(content).toContain('workflowError:');
    });

    it('should provide computed properties', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('currentPlatform()');
      expect(content).toContain('isCurrentStepValid()');
      expect(content).toContain('canGoNext()');
      expect(content).toContain('canGoBack()');
      expect(content).toContain('workflowProgress()');
    });

    it('should handle lifecycle hooks', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('created()');
      expect(content).toContain('beforeDestroy()');
      expect(content).toContain('initializeWorkflow()');
      expect(content).toContain('setupWorkflowListeners()');
      expect(content).toContain('cleanupWorkflowListeners()');
    });

    it('should provide navigation methods', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('goToNextStep()');
      expect(content).toContain('goToPreviousStep()');
      expect(content).toContain('getCurrentStep()');
    });

    it('should provide data management methods', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('updateStepData(stepName, data)');
      expect(content).toContain('validateCurrentStep(isValid, errors');
      expect(content).toContain('getStepData(stepName)');
      expect(content).toContain('getAllWorkflowData()');
    });

    it('should handle workflow events', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('handleWorkflowUpdate');
      expect(content).toContain('handleStepChange');
      expect(content).toContain('handleStepDataUpdate');
      expect(content).toContain('handleStepValidation');
      expect(content).toContain('handleStepCompleted');
    });

    it('should emit component events', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('this.$emit(\'step-change\'');
      expect(content).toContain('this.$emit(\'workflow-reset\'');
    });

    it('should handle errors properly', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('try {');
      expect(content).toContain('catch (error)');
      expect(content).toContain('this.workflowError =');
      expect(content).toContain('console.error');
    });

    it('should use Vue reactivity properly', () => {
      const content = fs.readFileSync(mixinPath, 'utf8');
      
      expect(content).toContain('this.$set(');
    });
  });

  describe('Integration', () => {
    it('should work together as a system', () => {
      const stateManagerContent = fs.readFileSync(stateManagerPath, 'utf8');
      const mixinContent = fs.readFileSync(mixinPath, 'utf8');
      
      // Check that mixin uses state manager methods
      expect(mixinContent).toContain('workflowStateManager.initialize()');
      expect(mixinContent).toContain('workflowStateManager.getWorkflowState');
      expect(mixinContent).toContain('workflowStateManager.setCurrentStep');
      expect(mixinContent).toContain('workflowStateManager.updateStepData');
      expect(mixinContent).toContain('workflowStateManager.validateStep');
      expect(mixinContent).toContain('workflowStateManager.completeStep');
      expect(mixinContent).toContain('workflowStateManager.saveProgress');
      expect(mixinContent).toContain('workflowStateManager.resetWorkflow');
      
      // Check event integration
      expect(mixinContent).toContain('workflowStateManager.on(');
      expect(mixinContent).toContain('workflowStateManager.off(');
    });
  });
});