/**
 * Workflow Mixin - Vue 2.6.14 mixin for workflow components
 * Provides integration with WorkflowStateManager
 */

import workflowStateManager from './WorkflowStateManager';

export default {
  data() {
    return {
      workflowState: null,
      currentStepIndex: 0,
      stepValidation: {},
      workflowLoading: false,
      workflowError: null
    };
  },

  computed: {
    /**
     * Get the current platform from parent or route
     */
    currentPlatform() {
      return this.platform || this.$parent?.currentPlatform || this.$route?.params?.platform || null;
    },

    /**
     * Check if current step is valid
     */
    isCurrentStepValid() {
      const currentStep = this.getCurrentStep();
      if (!currentStep) return false;
      
      const validation = this.stepValidation[currentStep.name];
      return validation ? validation.isValid : false;
    },

    /**
     * Check if can navigate to next step
     */
    canGoNext() {
      return this.isCurrentStepValid && !this.workflowLoading;
    },

    /**
     * Check if can navigate to previous step
     */
    canGoBack() {
      return this.currentStepIndex > 0 && !this.workflowLoading;
    },

    /**
     * Get workflow progress percentage
     */
    workflowProgress() {
      if (!this.workflowState || !this.workflowState.steps) return 0;
      
      const totalSteps = this.workflowState.steps.length;
      const completedSteps = this.workflowState.steps.filter(step => {
        const stepData = this.workflowState.stepData[step.name];
        return stepData && stepData.completed;
      }).length;
      
      return Math.round((completedSteps / totalSteps) * 100);
    }
  },

  created() {
    // Initialize workflow state
    this.initializeWorkflow();
    
    // Setup event listeners
    this.setupWorkflowListeners();
  },

  beforeDestroy() {
    // Cleanup event listeners
    this.cleanupWorkflowListeners();
  },

  methods: {
    /**
     * Initialize workflow
     */
    async initializeWorkflow() {
      if (!this.currentPlatform) {
        console.warn('No platform specified for workflow');
        return;
      }

      try {
        this.workflowLoading = true;
        this.workflowError = null;
        
        // Ensure state manager is initialized
        await workflowStateManager.initialize();
        
        // Load workflow state
        this.workflowState = workflowStateManager.getWorkflowState(this.currentPlatform);
        this.currentStepIndex = this.workflowState.currentStep || 0;
        
        // Load validation states
        this.stepValidation = { ...this.workflowState.validation };
        
      } catch (error) {
        console.error('Failed to initialize workflow:', error);
        this.workflowError = error.message || 'Failed to initialize workflow';
      } finally {
        this.workflowLoading = false;
      }
    },

    /**
     * Setup workflow event listeners
     */
    setupWorkflowListeners() {
      if (!this.currentPlatform) return;

      const platform = this.currentPlatform;
      
      // Listen to workflow updates
      workflowStateManager.on(`${platform}:workflow-updated`, this.handleWorkflowUpdate);
      workflowStateManager.on(`${platform}:step-changed`, this.handleStepChange);
      workflowStateManager.on(`${platform}:step-data-updated`, this.handleStepDataUpdate);
      workflowStateManager.on(`${platform}:step-validated`, this.handleStepValidation);
      workflowStateManager.on(`${platform}:step-completed`, this.handleStepCompleted);
    },

    /**
     * Cleanup workflow event listeners
     */
    cleanupWorkflowListeners() {
      if (!this.currentPlatform) return;

      const platform = this.currentPlatform;
      
      workflowStateManager.off(`${platform}:workflow-updated`, this.handleWorkflowUpdate);
      workflowStateManager.off(`${platform}:step-changed`, this.handleStepChange);
      workflowStateManager.off(`${platform}:step-data-updated`, this.handleStepDataUpdate);
      workflowStateManager.off(`${platform}:step-validated`, this.handleStepValidation);
      workflowStateManager.off(`${platform}:step-completed`, this.handleStepCompleted);
    },

    /**
     * Handle workflow update
     */
    handleWorkflowUpdate(workflowState) {
      this.workflowState = workflowState;
    },

    /**
     * Handle step change
     */
    handleStepChange(stepIndex) {
      this.currentStepIndex = stepIndex;
    },

    /**
     * Handle step data update
     */
    handleStepDataUpdate({ stepName, data }) {
      if (this.workflowState && this.workflowState.stepData) {
        this.$set(this.workflowState.stepData, stepName, data);
      }
    },

    /**
     * Handle step validation
     */
    handleStepValidation({ stepName, isValid, errors }) {
      this.$set(this.stepValidation, stepName, { isValid, errors });
    },

    /**
     * Handle step completed
     */
    handleStepCompleted(stepName) {
      // Update local state if needed
      if (this.workflowState && this.workflowState.stepData[stepName]) {
        this.$set(this.workflowState.stepData[stepName], 'completed', true);
      }
    },

    /**
     * Get current step info
     */
    getCurrentStep() {
      if (!this.workflowState || !this.workflowState.steps) return null;
      return this.workflowState.steps[this.currentStepIndex] || null;
    },

    /**
     * Navigate to next step
     */
    async goToNextStep() {
      if (!this.canGoNext) return;

      const currentStep = this.getCurrentStep();
      if (!currentStep) return;

      try {
        this.workflowLoading = true;
        
        // Mark current step as complete
        await workflowStateManager.completeStep(this.currentPlatform, currentStep.name);
        
        // Move to next step
        const nextIndex = Math.min(this.currentStepIndex + 1, this.workflowState.steps.length - 1);
        await workflowStateManager.setCurrentStep(this.currentPlatform, nextIndex);
        
        // Save progress
        await workflowStateManager.saveProgress(this.currentPlatform);
        
        // Emit navigation event
        this.$emit('step-change', { from: this.currentStepIndex, to: nextIndex });
        
      } catch (error) {
        console.error('Failed to navigate to next step:', error);
        this.workflowError = error.message || 'Failed to proceed to next step';
      } finally {
        this.workflowLoading = false;
      }
    },

    /**
     * Navigate to previous step
     */
    async goToPreviousStep() {
      if (!this.canGoBack) return;

      try {
        this.workflowLoading = true;
        
        // Move to previous step
        const prevIndex = Math.max(this.currentStepIndex - 1, 0);
        await workflowStateManager.setCurrentStep(this.currentPlatform, prevIndex);
        
        // Emit navigation event
        this.$emit('step-change', { from: this.currentStepIndex, to: prevIndex });
        
      } catch (error) {
        console.error('Failed to navigate to previous step:', error);
        this.workflowError = error.message || 'Failed to go back';
      } finally {
        this.workflowLoading = false;
      }
    },

    /**
     * Update step data
     */
    async updateStepData(stepName, data) {
      if (!this.currentPlatform) return;

      try {
        await workflowStateManager.updateStepData(this.currentPlatform, stepName, data);
      } catch (error) {
        console.error('Failed to update step data:', error);
        throw error;
      }
    },

    /**
     * Validate current step
     */
    async validateCurrentStep(isValid, errors = []) {
      const currentStep = this.getCurrentStep();
      if (!currentStep) return;

      try {
        await workflowStateManager.validateStep(
          this.currentPlatform,
          currentStep.name,
          isValid,
          errors
        );
      } catch (error) {
        console.error('Failed to validate step:', error);
        throw error;
      }
    },

    /**
     * Reset workflow
     */
    async resetWorkflow() {
      if (!this.currentPlatform) return;

      try {
        this.workflowLoading = true;
        await workflowStateManager.resetWorkflow(this.currentPlatform);
        
        // Reinitialize
        await this.initializeWorkflow();
        
        this.$emit('workflow-reset');
      } catch (error) {
        console.error('Failed to reset workflow:', error);
        this.workflowError = error.message || 'Failed to reset workflow';
      } finally {
        this.workflowLoading = false;
      }
    },

    /**
     * Check if step is complete
     */
    isStepComplete(stepName) {
      if (!this.workflowState || !this.workflowState.stepData) return false;
      const stepData = this.workflowState.stepData[stepName];
      return stepData && stepData.completed;
    },

    /**
     * Get step data
     */
    getStepData(stepName) {
      if (!this.workflowState || !this.workflowState.stepData) return null;
      return this.workflowState.stepData[stepName] || null;
    },

    /**
     * Get all workflow data
     */
    getAllWorkflowData() {
      if (!this.currentPlatform) return {};
      return workflowStateManager.getAllStepData(this.currentPlatform);
    }
  }
};