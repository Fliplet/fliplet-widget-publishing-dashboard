<template>
  <div class="android-workflow-view">
    <!-- Workflow Header -->
    <div class="workflow-header">
      <h1 class="workflow-title">
        <i class="fab fa-android"></i>
        Android Publishing Workflow
      </h1>
      <button 
        class="btn-close"
        @click="$emit('cancel')"
        aria-label="Close workflow"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Workflow Progress -->
    <workflow-stepper
      :steps="workflowSteps"
      :current-step-index="currentStepIndex"
      :clickable="true"
      @step-click="handleStepClick"
    />

    <!-- Workflow Content -->
    <div class="workflow-content">
      <workflow-transitions>
        <!-- Store Configuration Step -->
        <workflow-step
          v-if="currentStep.name === 'storeConfig'"
          key="storeConfig"
          step-name="storeConfig"
          :step-title="currentStep.label"
          :step-status="getStepStatus('storeConfig')"
          :is-valid="stepValidation.storeConfig"
          :processing="isProcessing"
          :can-go-back="currentStepIndex > 0"
          :next-button-text="currentStepIndex === workflowSteps.length - 1 ? 'Review' : 'Next'"
          @submit="handleStepSubmit"
          @back="goToPreviousStep"
        >
          <store-config-step
            :step-data="stepData.storeConfig"
            :validation-errors="stepErrors.storeConfig"
            @update="updateStepData('storeConfig', $event)"
            @validate="updateStepValidation('storeConfig', $event)"
          />
        </workflow-step>

        <!-- Keystore Step -->
        <workflow-step
          v-if="currentStep.name === 'keystore'"
          key="keystore"
          step-name="keystore"
          :step-title="currentStep.label"
          :step-status="getStepStatus('keystore')"
          :is-valid="stepValidation.keystore"
          :processing="isProcessing"
          :can-go-back="currentStepIndex > 0"
          :next-button-text="currentStepIndex === workflowSteps.length - 1 ? 'Review' : 'Next'"
          @submit="handleStepSubmit"
          @back="goToPreviousStep"
        >
          <keystore-step
            :step-data="stepData.keystore"
            :validation-errors="stepErrors.keystore"
            @update="updateStepData('keystore', $event)"
            @validate="updateStepValidation('keystore', $event)"
          />
        </workflow-step>

        <!-- App Bundle Step -->
        <workflow-step
          v-if="currentStep.name === 'appBundle'"
          key="appBundle"
          step-name="appBundle"
          :step-title="currentStep.label"
          :step-status="getStepStatus('appBundle')"
          :is-valid="stepValidation.appBundle"
          :processing="isProcessing"
          :can-go-back="currentStepIndex > 0"
          :next-button-text="currentStepIndex === workflowSteps.length - 1 ? 'Review' : 'Next'"
          @submit="handleStepSubmit"
          @back="goToPreviousStep"
        >
          <app-bundle-step
            :step-data="stepData.appBundle"
            :validation-errors="stepErrors.appBundle"
            @update="updateStepData('appBundle', $event)"
            @validate="updateStepValidation('appBundle', $event)"
          />
        </workflow-step>

        <!-- Store Listing Step -->
        <workflow-step
          v-if="currentStep.name === 'storeListing'"
          key="storeListing"
          step-name="storeListing"
          :step-title="currentStep.label"
          :step-status="getStepStatus('storeListing')"
          :is-valid="stepValidation.storeListing"
          :processing="isProcessing"
          :can-go-back="currentStepIndex > 0"
          :next-button-text="currentStepIndex === workflowSteps.length - 1 ? 'Review' : 'Next'"
          @submit="handleStepSubmit"
          @back="goToPreviousStep"
        >
          <store-listing-step
            :step-data="stepData.storeListing"
            :validation-errors="stepErrors.storeListing"
            @update="updateStepData('storeListing', $event)"
            @validate="updateStepValidation('storeListing', $event)"
          />
        </workflow-step>

        <!-- Release Management Step -->
        <workflow-step
          v-if="currentStep.name === 'releaseManagement'"
          key="releaseManagement"
          step-name="releaseManagement"
          :step-title="currentStep.label"
          :step-status="getStepStatus('releaseManagement')"
          :is-valid="stepValidation.releaseManagement"
          :processing="isProcessing"
          :can-go-back="currentStepIndex > 0"
          :next-button-text="currentStepIndex === workflowSteps.length - 1 ? 'Review' : 'Next'"
          @submit="handleStepSubmit"
          @back="goToPreviousStep"
        >
          <release-management-step
            :step-data="stepData.releaseManagement"
            :validation-errors="stepErrors.releaseManagement"
            @update="updateStepData('releaseManagement', $event)"
            @validate="updateStepValidation('releaseManagement', $event)"
          />
        </workflow-step>

        <!-- Review & Submit Step -->
        <workflow-step
          v-if="currentStep.name === 'reviewSubmit'"
          key="reviewSubmit"
          step-name="reviewSubmit"
          :step-title="currentStep.label"
          :step-status="getStepStatus('reviewSubmit')"
          :is-valid="true"
          :processing="isProcessing"
          :can-go-back="currentStepIndex > 0"
          :next-button-text="'Submit to Google Play'"
          @submit="handleFinalSubmit"
          @back="goToPreviousStep"
        >
          <android-review-submit-step
            :step-data="stepData.reviewSubmit"
            :workflow-data="stepData"
            :validation-errors="stepErrors.reviewSubmit"
            @update="updateStepData('reviewSubmit', $event)"
            @save-draft="saveDraft"
            @submit="submitToGooglePlay"
          />
        </workflow-step>
      </workflow-transitions>
    </div>

    <!-- Workflow Navigation -->
    <workflow-navigator
      :platform="'android'"
      :is-processing="isProcessing"
      :next-button-text="getNextButtonText()"
      @navigate-back="goToPreviousStep"
      @navigate-next="goToNextStep"
      @navigate-to-step="goToStep"
    />

    <!-- Error Recovery Modal -->
    <workflow-error-recovery
      v-if="showErrorRecovery"
      :error="currentError"
      :step-name="currentStep.name"
      @retry="retryCurrentStep"
      @skip="skipCurrentStep"
      @cancel="cancelWorkflow"
    />

    <!-- Submission Summary Modal -->
    <div v-if="showSubmissionSummary" class="submission-modal-overlay" @click.self="closeSubmissionSummary">
      <div class="submission-modal">
        <div class="modal-header">
          <h2>Submission Summary</h2>
          <button class="btn-close" @click="closeSubmissionSummary">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="summary-section">
            <h3>Configuration</h3>
            <ul>
              <li><strong>Package Name:</strong> {{ stepData.appBundle?.packageName || 'N/A' }}</li>
              <li><strong>Version:</strong> {{ stepData.appBundle?.versionName }} ({{ stepData.appBundle?.versionCode }})</li>
              <li><strong>Release Type:</strong> {{ stepData.releaseManagement?.releaseType || 'Production' }}</li>
              <li><strong>Rollout:</strong> {{ stepData.releaseManagement?.rolloutPercentage || 100 }}%</li>
            </ul>
          </div>
          <div class="summary-section">
            <h3>Store Listing</h3>
            <ul>
              <li><strong>Title:</strong> {{ stepData.storeListing?.title || 'N/A' }}</li>
              <li><strong>Category:</strong> {{ stepData.storeListing?.category || 'N/A' }}</li>
              <li><strong>Content Rating:</strong> {{ stepData.storeListing?.contentRating || 'N/A' }}</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeSubmissionSummary">Close</button>
          <button class="btn btn-primary" @click="confirmSubmission">
            <i class="fab fa-google-play"></i>
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WorkflowStepper from '../ui/WorkflowStepper.vue';
import WorkflowStep from './WorkflowStep.vue';
import WorkflowNavigator from './WorkflowNavigator.vue';
import WorkflowTransitions from './WorkflowTransitions.vue';
import WorkflowErrorRecovery from './WorkflowErrorRecovery.vue';

// Import Android-specific steps (to be created)
import StoreConfigStep from './steps/android/StoreConfigStep.vue';
import KeystoreStep from './steps/android/KeystoreStep.vue';
import AppBundleStep from './steps/android/AppBundleStep.vue';
import StoreListingStep from './steps/android/StoreListingStep.vue';
import ReleaseManagementStep from './steps/android/ReleaseManagementStep.vue';
import AndroidReviewSubmitStep from './steps/android/AndroidReviewSubmitStep.vue';

import workflowMixin from './workflowMixin';
import workflowStateManager from './WorkflowStateManager';

/**
 * AndroidWorkflowView - Container component for Android publishing workflow
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'AndroidWorkflowView',

  components: {
    WorkflowStepper,
    WorkflowStep,
    WorkflowNavigator,
    WorkflowTransitions,
    WorkflowErrorRecovery,
    StoreConfigStep,
    KeystoreStep,
    AppBundleStep,
    StoreListingStep,
    ReleaseManagementStep,
    AndroidReviewSubmitStep
  },

  mixins: [workflowMixin],

  props: {
    /**
     * App information from parent
     * @type {Object}
     */
    appInfo: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      platform: 'android', // Required by workflowMixin
      
      // Workflow steps configuration
      workflowSteps: [
        { name: 'storeConfig', label: 'Store Configuration', required: true },
        { name: 'keystore', label: 'Signing Key', required: true },
        { name: 'appBundle', label: 'App Bundle', required: true },
        { name: 'storeListing', label: 'Store Listing', required: true },
        { name: 'releaseManagement', label: 'Release Settings', required: true },
        { name: 'reviewSubmit', label: 'Review & Submit', required: true }
      ],
      
      // Step data
      stepData: {
        storeConfig: {},
        keystore: {},
        appBundle: {},
        storeListing: {},
        releaseManagement: {},
        reviewSubmit: {}
      },
      
      // Validation state
      stepValidation: {
        storeConfig: false,
        keystore: false,
        appBundle: false,
        storeListing: false,
        releaseManagement: false,
        reviewSubmit: true // Always valid as it's just review
      },
      
      // Error state
      stepErrors: {
        storeConfig: [],
        keystore: [],
        appBundle: [],
        storeListing: [],
        releaseManagement: [],
        reviewSubmit: []
      },
      
      // UI state
      currentStepIndex: 0,
      isProcessing: false,
      showErrorRecovery: false,
      currentError: null,
      showSubmissionSummary: false
    };
  },

  computed: {
    currentStep() {
      return this.workflowSteps[this.currentStepIndex] || {};
    }
  },

  created() {
    // Initialize workflow state
    this.initializeWorkflow();
    
    // Set up workflow steps in state manager
    workflowStateManager.state.android.steps = this.workflowSteps;
  },

  methods: {
    async initializeWorkflow() {
      try {
        // Load any saved state
        const savedState = workflowStateManager.getWorkflowState('android');
        if (savedState && savedState.stepData) {
          this.stepData = { ...this.stepData, ...savedState.stepData };
          this.currentStepIndex = savedState.currentStep || 0;
        }
        
        // Pre-populate with app info if available
        if (this.appInfo) {
          this.stepData.appBundle = {
            ...this.stepData.appBundle,
            appName: this.appInfo.name
          };
        }
      } catch (error) {
        console.error('Failed to initialize workflow:', error);
      }
    },

    updateStepData(stepName, data) {
      this.$set(this.stepData, stepName, data);
      this.updateStepData(stepName, data); // From mixin
    },

    updateStepValidation(stepName, validation) {
      this.$set(this.stepValidation, stepName, validation.isValid);
      this.$set(this.stepErrors, stepName, validation.errors || []);
      this.validateStep(stepName, validation.isValid, validation.errors); // From mixin
    },

    getStepStatus(stepName) {
      const stepIndex = this.workflowSteps.findIndex(s => s.name === stepName);
      
      if (stepIndex < this.currentStepIndex) {
        return this.stepValidation[stepName] ? 'Completed' : 'Error';
      } else if (stepIndex === this.currentStepIndex) {
        return 'In Progress';
      } else {
        return 'Pending';
      }
    },

    getNextButtonText() {
      if (this.currentStepIndex === this.workflowSteps.length - 1) {
        return 'Submit to Google Play';
      }
      return 'Next';
    },

    async handleStepSubmit() {
      const currentStepName = this.currentStep.name;
      
      if (!this.stepValidation[currentStepName]) {
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Please fix validation errors before proceeding',
          duration: 3000
        });
        return;
      }

      try {
        this.isProcessing = true;
        
        // Mark step as complete
        await this.completeStep(currentStepName); // From mixin
        
        // Move to next step
        if (this.currentStepIndex < this.workflowSteps.length - 1) {
          await this.goToNextStep();
        }
      } catch (error) {
        console.error('Error submitting step:', error);
        this.showError(error);
      } finally {
        this.isProcessing = false;
      }
    },

    async handleFinalSubmit() {
      this.showSubmissionSummary = true;
    },

    async goToPreviousStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        await this.setCurrentStep('android', this.currentStepIndex); // From mixin
      }
    },

    async goToNextStep() {
      if (this.currentStepIndex < this.workflowSteps.length - 1) {
        this.currentStepIndex++;
        await this.setCurrentStep('android', this.currentStepIndex); // From mixin
      }
    },

    async goToStep(stepIndex) {
      if (stepIndex >= 0 && stepIndex < this.workflowSteps.length) {
        this.currentStepIndex = stepIndex;
        await this.setCurrentStep('android', stepIndex); // From mixin
      }
    },

    handleStepClick(stepIndex) {
      // Allow navigation only to completed steps or current step
      if (stepIndex <= this.currentStepIndex) {
        this.goToStep(stepIndex);
      }
    },

    async saveDraft() {
      try {
        await this.saveWorkflowProgress(); // From mixin
        this.$emit('draft-saved', this.stepData);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    },

    async submitToGooglePlay(submissionData) {
      try {
        this.isProcessing = true;
        
        // Here you would call the middleware to submit
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const controller = window.PublishingMiddleware.getComponent('androidWorkflowController');
          await controller.submitToGooglePlay(submissionData);
        }
        
        // Emit completion event
        this.$emit('workflow-complete', {
          platform: 'android',
          data: submissionData
        });
        
        this.closeSubmissionSummary();
      } catch (error) {
        console.error('Submission failed:', error);
        this.showError(error);
      } finally {
        this.isProcessing = false;
      }
    },

    showError(error) {
      this.currentError = error;
      this.showErrorRecovery = true;
    },

    retryCurrentStep() {
      this.showErrorRecovery = false;
      this.currentError = null;
      // Retry logic would go here
    },

    skipCurrentStep() {
      this.showErrorRecovery = false;
      this.currentError = null;
      this.goToNextStep();
    },

    cancelWorkflow() {
      this.$emit('cancel');
    },

    closeSubmissionSummary() {
      this.showSubmissionSummary = false;
    },

    async confirmSubmission() {
      const submissionData = {
        configuration: this.stepData,
        options: this.stepData.reviewSubmit,
        timestamp: new Date().toISOString()
      };
      
      await this.submitToGooglePlay(submissionData);
    }
  }
};
</script>

<style lang="scss" scoped>
.android-workflow-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-light);
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .workflow-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-color);

    i {
      color: var(--android-color);
    }
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    transition: color var(--transition-speed) ease;

    &:hover {
      color: var(--text-color);
    }
  }
}

.workflow-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

// Submission Modal
.submission-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.submission-modal {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);

    h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-color);
    }
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
  }

  .summary-section {
    margin-bottom: var(--spacing-xl);

    h3 {
      margin: 0 0 var(--spacing-md) 0;
      font-size: 1.125rem;
      color: var(--text-color);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: var(--spacing-sm);
        font-size: 0.875rem;
        color: var(--text-color-secondary);

        strong {
          color: var(--text-color);
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &-primary {
    background-color: var(--android-color);
    color: white;

    &:hover {
      background-color: darken(var(--android-color), 10%);
    }
  }

  &-secondary {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &:hover {
      background-color: var(--bg-color);
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .workflow-header {
    padding: var(--spacing-md);

    .workflow-title {
      font-size: 1.25rem;
    }
  }

  .workflow-content {
    padding: var(--spacing-md);
  }
}
</style>