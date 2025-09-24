<template>
  <div class="workflow-navigator">
    <!-- Progress bar -->
    <div class="navigator__progress">
      <div class="progress-bar">
        <div 
          class="progress-bar__fill" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div class="progress-info">
        <span class="progress-text">{{ completedSteps }} of {{ totalSteps }} steps completed</span>
        <span class="progress-percentage">{{ progress }}%</span>
      </div>
    </div>

    <!-- Step indicator -->
    <div class="navigator__steps">
      <div 
        v-for="(step, index) in steps"
        :key="step.id || index"
        class="step-indicator"
        :class="getStepClasses(step, index)"
        @click="handleStepClick(step, index)"
      >
        <div class="step-indicator__icon">
          <i v-if="isStepComplete(step)" class="fas fa-check"></i>
          <i v-else-if="hasStepError(step)" class="fas fa-exclamation"></i>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="step-indicator__content">
          <span class="step-name">{{ step.label }}</span>
          <span v-if="step.description" class="step-description">{{ step.description }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="navigator__actions">
      <button
        class="btn btn-secondary"
        :disabled="!canGoBack"
        @click="navigateBack"
      >
        <i class="fas fa-chevron-left"></i>
        Previous
      </button>

      <button
        v-if="canSkipCurrent"
        class="btn btn-outline"
        @click="skipStep"
      >
        Skip
      </button>

      <button
        class="btn btn-primary"
        :disabled="!canGoNext"
        @click="navigateNext"
      >
        {{ nextButtonText }}
        <i v-if="!isLastStep" class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Validation messages -->
    <div v-if="validationErrors.length > 0" class="navigator__errors">
      <validation-message
        v-for="(error, index) in validationErrors"
        :key="index"
        :message="error"
        type="error"
      />
    </div>

    <!-- Navigation info -->
    <div v-if="navigationMessage" class="navigator__info">
      <i class="fas fa-info-circle"></i>
      {{ navigationMessage }}
    </div>
  </div>
</template>

<script>
import workflowValidator from './WorkflowValidator';
import ValidationMessage from '../ui/ValidationMessage.vue';

/**
 * WorkflowNavigator - Handles workflow navigation and validation
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'WorkflowNavigator',

  components: {
    ValidationMessage
  },

  props: {
    /**
     * Current platform
     * @type {String}
     */
    platform: {
      type: String,
      required: true,
      validator: (value) => ['ios', 'android'].includes(value)
    },

    /**
     * Workflow steps
     * @type {Array}
     */
    steps: {
      type: Array,
      required: true
    },

    /**
     * Current step index
     * @type {Number}
     */
    currentStepIndex: {
      type: Number,
      default: 0
    },

    /**
     * Workflow state data
     * @type {Object}
     */
    workflowState: {
      type: Object,
      required: true
    },

    /**
     * Loading state
     * @type {Boolean}
     */
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      validationErrors: [],
      navigationMessage: '',
      isValidating: false
    };
  },

  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex] || null;
    },

    totalSteps() {
      return this.steps.length;
    },

    completedSteps() {
      return this.steps.filter(step => this.isStepComplete(step)).length;
    },

    progress() {
      return Math.round((this.completedSteps / this.totalSteps) * 100);
    },

    isLastStep() {
      return this.currentStepIndex === this.steps.length - 1;
    },

    nextButtonText() {
      if (this.isLastStep) {
        return 'Complete';
      }
      if (this.loading || this.isValidating) {
        return 'Validating...';
      }
      return 'Next';
    },

    canGoNext() {
      return !this.loading && !this.isValidating && this.validationErrors.length === 0;
    },

    canGoBack() {
      return !this.loading && !this.isValidating && this.currentStepIndex > 0;
    },

    canSkipCurrent() {
      if (!this.currentStep) return false;
      return workflowValidator.canSkipStep(this.platform, this.currentStep.name);
    }
  },

  watch: {
    currentStepIndex: 'validateCurrentStep',
    workflowState: {
      deep: true,
      handler: 'validateCurrentStep'
    }
  },

  created() {
    this.validateCurrentStep();
  },

  methods: {
    getStepClasses(step, index) {
      return {
        'step-indicator--completed': this.isStepComplete(step),
        'step-indicator--current': index === this.currentStepIndex,
        'step-indicator--error': this.hasStepError(step),
        'step-indicator--clickable': this.canNavigateToStep(index),
        'step-indicator--disabled': !this.canNavigateToStep(index)
      };
    },

    isStepComplete(step) {
      const stepData = this.workflowState.stepData && this.workflowState.stepData[step.name];
      return stepData && stepData.completed;
    },

    hasStepError(step) {
      const errors = this.workflowState.errors && this.workflowState.errors[step.name];
      return errors && errors.length > 0;
    },

    canNavigateToStep(index) {
      // Can't navigate if loading
      if (this.loading || this.isValidating) return false;
      
      // Can always stay on current step
      if (index === this.currentStepIndex) return true;
      
      // Can navigate to previous completed steps
      if (index < this.currentStepIndex) {
        const step = this.steps[index];
        return this.isStepComplete(step);
      }
      
      // Can't skip ahead
      return false;
    },

    async validateCurrentStep() {
      if (!this.currentStep) return;

      this.isValidating = true;
      this.validationErrors = [];
      this.navigationMessage = '';

      try {
        const stepData = this.workflowState.stepData && this.workflowState.stepData[this.currentStep.name];
        
        // Check dependencies first
        const depCheck = workflowValidator.checkDependencies(
          this.platform,
          this.currentStep.name,
          this.workflowState
        );

        if (!depCheck.satisfied) {
          this.navigationMessage = `Please complete these steps first: ${depCheck.missing.join(', ')}`;
          return;
        }

        // Validate step if has data
        if (stepData) {
          const validation = await workflowValidator.validateStep(
            this.platform,
            this.currentStep.name,
            stepData
          );

          this.validationErrors = validation.errors;
          
          // Emit validation result
          this.$emit('validation', {
            step: this.currentStep.name,
            isValid: validation.isValid,
            errors: validation.errors,
            fieldErrors: validation.fieldErrors
          });
        }
      } catch (error) {
        console.error('Validation error:', error);
        this.validationErrors = ['Validation failed: ' + error.message];
      } finally {
        this.isValidating = false;
      }
    },

    async navigateNext() {
      if (!this.canGoNext || !this.currentStep) return;

      const stepData = this.workflowState.stepData && this.workflowState.stepData[this.currentStep.name];
      
      // Check if can navigate
      const navCheck = await workflowValidator.canNavigateNext(
        this.platform,
        this.currentStep.name,
        stepData || {},
        this.workflowState
      );

      if (!navCheck.canNavigate) {
        this.validationErrors = navCheck.errors;
        this.navigationMessage = navCheck.reason;
        return;
      }

      // Clear messages and navigate
      this.validationErrors = [];
      this.navigationMessage = '';
      
      if (this.isLastStep) {
        this.$emit('complete');
      } else {
        this.$emit('navigate', { 
          direction: 'next',
          from: this.currentStepIndex,
          to: this.currentStepIndex + 1
        });
      }
    },

    navigateBack() {
      if (!this.canGoBack || !this.currentStep) return;

      const canGoBack = workflowValidator.canNavigateBack(
        this.platform,
        this.currentStep.name,
        this.workflowState
      );

      if (!canGoBack) {
        this.navigationMessage = 'Cannot go back from this step';
        return;
      }

      // Clear messages and navigate
      this.validationErrors = [];
      this.navigationMessage = '';
      
      this.$emit('navigate', {
        direction: 'back',
        from: this.currentStepIndex,
        to: this.currentStepIndex - 1
      });
    },

    skipStep() {
      if (!this.canSkipCurrent || this.isLastStep) return;

      this.$emit('skip', {
        step: this.currentStep.name,
        from: this.currentStepIndex,
        to: this.currentStepIndex + 1
      });
    },

    handleStepClick(step, index) {
      if (!this.canNavigateToStep(index)) return;

      if (index !== this.currentStepIndex) {
        this.$emit('navigate', {
          direction: index < this.currentStepIndex ? 'back' : 'next',
          from: this.currentStepIndex,
          to: index
        });
      }
    },

    async getValidationSummary() {
      return await workflowValidator.getWorkflowValidationSummary(
        this.platform,
        this.workflowState
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.workflow-navigator {
  background: white;
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-lg, 24px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.navigator__progress {
  margin-bottom: var(--spacing-lg, 24px);
}

.progress-bar {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm, 8px);

  &__fill {
    height: 100%;
    background-color: var(--primary-color, #00abd1);
    transition: width 0.3s ease;
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
}

.navigator__steps {
  display: flex;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-xl, 32px);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs, 4px);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border-radius: var(--border-radius, 6px);
  background-color: #f9fafb;
  border: 2px solid transparent;
  cursor: default;
  transition: all var(--transition-speed, 0.2s) ease;
  flex-shrink: 0;

  &--completed {
    background-color: #d1fae5;
    border-color: #34d399;

    .step-indicator__icon {
      background-color: #34d399;
      color: white;
    }
  }

  &--current {
    background-color: #dbeafe;
    border-color: var(--primary-color, #00abd1);

    .step-indicator__icon {
      background-color: var(--primary-color, #00abd1);
      color: white;
    }
  }

  &--error {
    background-color: #fee2e2;
    border-color: #ef4444;

    .step-indicator__icon {
      background-color: #ef4444;
      color: white;
    }
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &--disabled {
    opacity: 0.5;
  }

  &__icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    flex-shrink: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }
}

.step-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color, #333);
}

.step-description {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.navigator__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md, 16px);
  padding-top: var(--spacing-lg, 24px);
  border-top: 1px solid #e5e7eb;
}

.navigator__errors {
  margin-top: var(--spacing-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.navigator__info {
  margin-top: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  background-color: #f0f9ff;
  color: #0369a1;
  border-radius: var(--border-radius, 6px);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  font-size: 0.875rem;
}

// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius, 6px);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) ease;
  min-width: 100px;

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
    color: var(--primary-color, #00abd1);
    border: 2px solid var(--primary-color, #00abd1);

    &:hover:not(:disabled) {
      background-color: var(--primary-color, #00abd1);
      color: white;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .navigator__steps {
    flex-direction: column;
  }

  .step-indicator {
    width: 100%;
  }

  .navigator__actions {
    flex-wrap: wrap;

    .btn {
      flex: 1;
      min-width: auto;
    }
  }
}
</style>