<template>
  <div class="ios-workflow-view">
    <!-- Workflow Header -->
    <div class="workflow-header">
      <div class="workflow-header__content">
        <div class="platform-icon">
          <i class="fab fa-apple"></i>
        </div>
        <div class="workflow-info">
          <h2 class="workflow-title">iOS Publishing Workflow</h2>
          <p class="workflow-description">
            Configure and submit your app to App Store Connect
          </p>
        </div>
      </div>
      <div class="workflow-header__actions">
        <button 
          class="btn btn-outline"
          @click="$emit('cancel')"
        >
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button 
          v-if="canSaveDraft"
          class="btn btn-secondary"
          @click="saveDraft"
        >
          <i class="fas fa-save"></i>
          Save Draft
        </button>
      </div>
    </div>

    <!-- Progress Overview -->
    <step-completion-tracker
      v-if="showProgressTracker"
      :steps="workflowSteps"
      :step-data="workflowState.stepData"
      :current-step-index="currentStepIndex"
      @step-select="handleStepSelect"
      @retry-step="handleRetryStep"
      @view-details="handleViewDetails"
    />

    <!-- Main Workflow Container -->
    <animated-workflow-container
      :steps="workflowSteps"
      :current-step-index="currentStepIndex"
      :loading="workflowLoading"
      :loading-text="loadingText"
      @step-click="handleStepClick"
    >
      <template #default="{ step, stepIndex, isAnimating }">
        <workflow-step
          :step-name="step.name"
          :step-title="step.label"
          :step-status="getStepStatus(step)"
          :is-valid="isStepValid(step)"
          :processing="workflowLoading || isAnimating"
          :can-go-back="canGoBack"
          :next-button-text="getNextButtonText(stepIndex)"
          @submit="handleStepSubmit"
          @back="goToPreviousStep"
        >
          <!-- Dynamic Step Content -->
          <component 
            :is="getStepComponent(step)"
            v-if="getStepComponent(step)"
            :step-data="getStepData(step)"
            :validation-errors="getStepErrors(step)"
            @update="handleStepDataUpdate(step, $event)"
            @validate="handleStepValidation(step, $event)"
          />
          
          <!-- Fallback for missing components -->
          <div v-else class="step-placeholder">
            <i class="fas fa-tools"></i>
            <p>{{ step.label }} component is not yet implemented</p>
          </div>
        </workflow-step>
      </template>
    </animated-workflow-container>

    <!-- Navigation Controls -->
    <workflow-navigator
      :platform="platform"
      :steps="workflowSteps"
      :current-step-index="currentStepIndex"
      :workflow-state="workflowState"
      :loading="workflowLoading"
      @navigate="handleNavigation"
      @complete="handleWorkflowComplete"
      @skip="handleStepSkip"
      @validation="handleValidationResult"
    />

    <!-- Error Recovery -->
    <workflow-error-recovery
      v-if="currentError"
      :error="currentError"
      :current-step="getCurrentStep()"
      :workflow-context="workflowState"
      :show-details="true"
      @retry-step="handleRetryStep"
      @reset-step="handleResetStep"
      @save-draft="saveDraft"
      @skip-step="handleStepSkip"
      @dismiss-error="dismissError"
      @recovery-action="handleRecoveryAction"
    />

    <!-- Submission Summary Modal -->
    <transition name="modal">
      <div v-if="showSubmissionSummary" class="submission-modal">
        <div class="modal-backdrop" @click="closeSubmissionSummary"></div>
        <div class="modal-content">
          <h3 class="modal-title">
            <i class="fas fa-check-circle"></i>
            Ready to Submit
          </h3>
          <div class="submission-summary">
            <h4>iOS App Configuration Summary</h4>
            <dl class="summary-list">
              <dt>Bundle ID</dt>
              <dd>{{ getSummaryData('bundleId') || 'Not set' }}</dd>
              
              <dt>Version</dt>
              <dd>{{ getSummaryData('version') || 'Not set' }}</dd>
              
              <dt>Build Number</dt>
              <dd>{{ getSummaryData('buildNumber') || 'Not set' }}</dd>
              
              <dt>API Key</dt>
              <dd>{{ getSummaryData('apiKeyName') || 'Not configured' }}</dd>
              
              <dt>Certificate</dt>
              <dd>{{ getSummaryData('certificateName') || 'Not configured' }}</dd>
              
              <dt>Provisioning Profile</dt>
              <dd>{{ getSummaryData('profileName') || 'Not configured' }}</dd>
            </dl>
          </div>
          <div class="modal-actions">
            <button 
              class="btn btn-secondary"
              @click="closeSubmissionSummary"
            >
              Review Again
            </button>
            <button 
              class="btn btn-primary"
              :disabled="isSubmitting"
              @click="submitWorkflow"
            >
              <i v-if="!isSubmitting" class="fas fa-rocket"></i>
              <loading-spinner v-else size="16px" />
              {{ isSubmitting ? 'Submitting...' : 'Submit to App Store' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import workflowMixin from './workflowMixin';
import WorkflowStep from './WorkflowStep.vue';
import WorkflowNavigator from './WorkflowNavigator.vue';
import AnimatedWorkflowContainer from './AnimatedWorkflowContainer.vue';
import StepCompletionTracker from './StepCompletionTracker.vue';
import WorkflowErrorRecovery from './WorkflowErrorRecovery.vue';
import LoadingSpinner from '../ui/LoadingSpinner.vue';

// Import step components as they are created
// import ApiKeyStep from './steps/ios/ApiKeyStep.vue';
// import BundleIdStep from './steps/ios/BundleIdStep.vue';
// import CertificateStep from './steps/ios/CertificateStep.vue';
// import ProvisioningStep from './steps/ios/ProvisioningStep.vue';
// import MetadataStep from './steps/ios/MetadataStep.vue';
// import ReviewStep from './steps/ios/ReviewStep.vue';

/**
 * IOSWorkflowView - Container component for iOS publishing workflow
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'IOSWorkflowView',

  components: {
    WorkflowStep,
    WorkflowNavigator,
    AnimatedWorkflowContainer,
    StepCompletionTracker,
    WorkflowErrorRecovery,
    LoadingSpinner
  },

  mixins: [workflowMixin],

  props: {
    /**
     * App information
     * @type {Object}
     */
    appInfo: {
      type: Object,
      default: () => ({})
    },

    /**
     * Show progress tracker
     * @type {Boolean}
     */
    showProgressTracker: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      platform: 'ios',
      workflowSteps: [
        {
          id: 'api-key',
          name: 'api-key',
          label: 'API Key',
          description: 'Configure App Store Connect API access',
          component: 'ApiKeyStep',
          required: true,
          icon: 'fas fa-key'
        },
        {
          id: 'bundle-id',
          name: 'bundle-id',
          label: 'Bundle ID',
          description: 'Set your app bundle identifier',
          component: 'BundleIdStep',
          required: true,
          icon: 'fas fa-fingerprint'
        },
        {
          id: 'certificate',
          name: 'certificate',
          label: 'Certificate',
          description: 'Select or upload signing certificate',
          component: 'CertificateStep',
          required: true,
          icon: 'fas fa-certificate'
        },
        {
          id: 'provisioning',
          name: 'provisioning',
          label: 'Provisioning Profile',
          description: 'Configure provisioning profile',
          component: 'ProvisioningStep',
          required: true,
          icon: 'fas fa-mobile-alt'
        },
        {
          id: 'metadata',
          name: 'metadata',
          label: 'App Metadata',
          description: 'App information and screenshots',
          component: 'MetadataStep',
          required: true,
          icon: 'fas fa-info-circle'
        },
        {
          id: 'review',
          name: 'review',
          label: 'Review & Submit',
          description: 'Review configuration and submit',
          component: 'ReviewStep',
          required: true,
          icon: 'fas fa-check-circle'
        }
      ],
      currentError: null,
      showSubmissionSummary: false,
      isSubmitting: false,
      loadingText: 'Loading...',
      stepComponents: {
        // Map component names to actual components as they are created
        // ApiKeyStep,
        // BundleIdStep,
        // CertificateStep,
        // ProvisioningStep,
        // MetadataStep,
        // ReviewStep
      }
    };
  },

  computed: {
    canSaveDraft() {
      return this.currentStepIndex > 0 && !this.workflowLoading;
    },

    getCurrentStep() {
      return () => this.workflowSteps[this.currentStepIndex] || null;
    }
  },

  created() {
    // Set workflow steps in state
    if (this.workflowState) {
      this.workflowState.steps = this.workflowSteps;
    }

    // Initialize with app info if available
    if (this.appInfo.bundleId) {
      this.updateStepData('bundle-id', {
        bundleId: this.appInfo.bundleId
      });
    }
  },

  methods: {
    getStepComponent(step) {
      return this.stepComponents[step.component] || null;
    },

    getStepStatus(step) {
      const stepData = this.getStepData(step.name);
      
      if (stepData && stepData.completed) {
        return 'completed';
      }
      
      if (stepData && stepData.failed) {
        return 'error';
      }
      
      if (this.workflowSteps[this.currentStepIndex]?.name === step.name) {
        return 'in-progress';
      }
      
      return 'pending';
    },

    isStepValid(step) {
      const validation = this.stepValidation[step.name];
      return validation ? validation.isValid : false;
    },

    getStepErrors(step) {
      const validation = this.stepValidation[step.name];
      return validation ? validation.errors : [];
    },

    getNextButtonText(stepIndex) {
      if (stepIndex === this.workflowSteps.length - 1) {
        return 'Complete Setup';
      }
      return 'Continue';
    },

    async handleStepSubmit() {
      const currentStep = this.getCurrentStep();
      if (!currentStep) return;

      try {
        this.workflowLoading = true;
        this.loadingText = 'Validating...';

        // Validate current step
        const isValid = await this.validateCurrentStep(true, []);
        
        if (isValid) {
          // Mark step as completed
          await this.completeStep(this.platform, currentStep.name);
          
          if (this.currentStepIndex === this.workflowSteps.length - 1) {
            // Last step - show submission summary
            this.showSubmissionSummary = true;
          } else {
            // Go to next step
            await this.goToNextStep();
          }
        }
      } catch (error) {
        console.error('Step submit error:', error);
        this.currentError = {
          type: 'submission',
          message: error.message || 'Failed to submit step',
          details: error,
          canSkip: false
        };
      } finally {
        this.workflowLoading = false;
      }
    },

    handleStepDataUpdate(step, data) {
      this.updateStepData(step.name, data);
    },

    async handleStepValidation(step, { isValid, errors }) {
      await this.validateStep(this.platform, step.name, isValid, errors);
    },

    handleStepSelect(step, index) {
      if (index < this.currentStepIndex && this.isStepComplete(step.name)) {
        this.navigateToStep(index);
      }
    },

    handleStepClick(index) {
      if (index < this.currentStepIndex) {
        this.navigateToStep(index);
      }
    },

    async navigateToStep(index) {
      this.currentStepIndex = index;
      await workflowStateManager.setCurrentStep(this.platform, index);
    },

    handleNavigation({ direction, from, to }) {
      if (direction === 'next') {
        this.currentStepIndex = to;
      } else if (direction === 'back') {
        this.currentStepIndex = to;
      }
    },

    async handleWorkflowComplete() {
      this.showSubmissionSummary = true;
    },

    async handleStepSkip({ step, from, to }) {
      // Mark step as skipped
      await this.updateStepData(step, { skipped: true });
      this.currentStepIndex = to;
    },

    handleValidationResult({ step, isValid, errors, fieldErrors }) {
      // Update validation state
      this.$set(this.stepValidation, step, {
        isValid,
        errors,
        fieldErrors
      });
    },

    async handleRetryStep(step) {
      this.currentError = null;
      await this.handleStepSubmit();
    },

    async handleResetStep(step) {
      // Clear step data
      await this.updateStepData(step.name, {});
      this.currentError = null;
    },

    async saveDraft() {
      try {
        this.workflowLoading = true;
        this.loadingText = 'Saving draft...';
        
        // Save current progress
        await workflowStateManager.saveProgress(this.platform);
        
        // Emit draft saved event
        this.$emit('draft-saved', this.getAllWorkflowData());
        
        // Show notification
        this.$root.$emit('show-notification', {
          type: 'success',
          message: 'Draft saved successfully'
        });
      } catch (error) {
        console.error('Failed to save draft:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Failed to save draft'
        });
      } finally {
        this.workflowLoading = false;
      }
    },

    dismissError() {
      this.currentError = null;
    },

    handleRecoveryAction({ action, success }) {
      if (success) {
        this.currentError = null;
      }
    },

    handleViewDetails(step, index) {
      // Emit event to show step details
      this.$emit('view-step-details', { step, index });
    },

    getSummaryData(key) {
      const allData = this.getAllWorkflowData();
      
      // Flatten all step data to find the key
      for (const stepData of Object.values(allData)) {
        if (stepData[key]) {
          return stepData[key];
        }
      }
      
      return null;
    },

    closeSubmissionSummary() {
      this.showSubmissionSummary = false;
    },

    async submitWorkflow() {
      try {
        this.isSubmitting = true;
        
        // Get all workflow data
        const submissionData = {
          platform: 'ios',
          appId: this.appInfo.id,
          configuration: this.getAllWorkflowData(),
          submittedAt: Date.now()
        };
        
        // Call submission API through middleware
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          const response = await apiService.request('submitIosApp', submissionData);
          
          // Mark workflow as complete
          this.workflowState.isComplete = true;
          await workflowStateManager.saveProgress(this.platform);
          
          // Emit completion event
          this.$emit('workflow-complete', {
            platform: 'ios',
            submissionId: response.submissionId,
            data: submissionData
          });
          
          // Show success notification
          this.$root.$emit('show-notification', {
            type: 'success',
            message: 'iOS app submitted successfully!'
          });
          
          // Close modal
          this.showSubmissionSummary = false;
        } else {
          throw new Error('Publishing middleware not available');
        }
      } catch (error) {
        console.error('Submission error:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: error.message || 'Failed to submit app'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ios-workflow-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

// Workflow Header
.workflow-header {
  background: white;
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-lg, 24px);
  margin-bottom: var(--spacing-xl, 32px);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);

  &__content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  &__actions {
    display: flex;
    gap: var(--spacing-md);
  }
}

.platform-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #000000 0%, #434343 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.workflow-info {
  .workflow-title {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .workflow-description {
    margin: 0;
    color: var(--text-color-secondary);
  }
}

// Step Placeholder
.step-placeholder {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-color-secondary);

  i {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 1.125rem;
  }
}

// Submission Modal
.submission-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: var(--border-radius, 12px);
  padding: var(--spacing-xl);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  i {
    color: #34d399;
  }
}

.submission-summary {
  margin-bottom: var(--spacing-xl);

  h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-color);
  }
}

.summary-list {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-sm);
  margin: 0;

  dt {
    font-weight: 500;
    color: var(--text-color-secondary);
  }

  dd {
    margin: 0;
    color: var(--text-color);
    font-weight: 500;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid #e5e7eb;
}

// Buttons
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius, 6px);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-primary {
    background-color: var(--primary-color, #00abd1);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(#00abd1, 10%);
    }
  }

  &-secondary {
    background-color: #6c757d;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(#6c757d, 10%);
    }
  }

  &-outline {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid #d1d5db;

    &:hover:not(:disabled) {
      background-color: #f9fafb;
    }
  }
}

// Modal transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-content {
    transition: transform 0.3s ease;
  }
}

.modal-enter,
.modal-leave-to {
  opacity: 0;

  .modal-content {
    transform: scale(0.95);
  }
}

// Responsive
@media (max-width: 768px) {
  .ios-workflow-view {
    padding: var(--spacing-md);
  }

  .workflow-header {
    flex-direction: column;
    align-items: flex-start;

    &__actions {
      width: 100%;
      
      .btn {
        flex: 1;
      }
    }
  }

  .platform-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .modal-content {
    padding: var(--spacing-lg);
  }

  .summary-list {
    grid-template-columns: 1fr;
    
    dt {
      font-size: 0.875rem;
      margin-bottom: 2px;
    }
    
    dd {
      margin-bottom: var(--spacing-sm);
    }
  }

  .modal-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
</style>