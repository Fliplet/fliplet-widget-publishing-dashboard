<template>
  <div class="workflow-step" :class="stepClasses">
    <div class="step-header">
      <h2 class="step-title">{{ stepTitle }}</h2>
      <span class="step-status" :class="statusClass">
        {{ stepStatus }}
      </span>
    </div>
    
    <div class="step-content">
      <slot />
    </div>
    
    <div class="step-actions">
      <button
        v-if="canGoBack"
        @click="goBack"
        class="btn btn-secondary"
        :disabled="processing"
      >
        Back
      </button>
      <button
        @click="submitStep"
        class="btn btn-primary"
        :disabled="!isValid || processing"
      >
        {{ nextButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
/**
 * WorkflowStep - Base component for workflow steps
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <WorkflowStep
 *   :step-name="currentStep"
 *   :is-valid="formIsValid"
 *   @submit="handleSubmit"
 *   @back="handleBack"
 * >
 *   <!-- Step content -->
 * </WorkflowStep>
 */
export default {
  name: 'WorkflowStep',

  props: {
    /**
     * Current step identifier
     * @type {String}
     * @required
     */
    stepName: {
      type: String,
      required: true
    },
    
    /**
     * Whether the step data is valid
     * @type {Boolean}
     */
    isValid: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether step is currently processing
     * @type {Boolean}
     */
    processing: {
      type: Boolean,
      default: false
    },

    /**
     * Custom text for the submit/next button
     * @type {String}
     */
    nextButtonText: {
      type: String,
      default: 'Next'
    },

    /**
     * Whether to show the back button
     * @type {Boolean}
     */
    canGoBack: {
      type: Boolean,
      default: true
    },

    /**
     * Step title to display in header
     * @type {String}
     */
    stepTitle: {
      type: String,
      default: ''
    },

    /**
     * Current step status
     * @type {String}
     */
    stepStatus: {
      type: String,
      default: 'pending',
      validator: (value) => {
        return ['pending', 'in-progress', 'completed', 'error'].includes(value);
      }
    }
  },

  // Events: submit, back

  computed: {
    stepClasses() {
      return {
        'workflow-step--processing': this.processing,
        'workflow-step--valid': this.isValid,
        'workflow-step--invalid': !this.isValid,
        [`workflow-step--${this.stepStatus}`]: true
      };
    },

    statusClass() {
      return {
        'step-status--pending': this.stepStatus === 'pending',
        'step-status--in-progress': this.stepStatus === 'in-progress',
        'step-status--completed': this.stepStatus === 'completed',
        'step-status--error': this.stepStatus === 'error'
      };
    }
  },

  methods: {
    submitStep() {
      if (this.isValid && !this.processing) {
        this.$emit('submit');
      }
    },
    
    goBack() {
      if (this.canGoBack && !this.processing) {
        this.$emit('back');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.workflow-step {
  background: white;
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  padding: var(--spacing-lg, 24px);
  margin-bottom: var(--spacing-lg, 24px);
  transition: all var(--transition-speed, 0.2s) ease;

  &--processing {
    opacity: 0.8;
    pointer-events: none;
  }

  &--error {
    border: 2px solid var(--error-color, #dc3545);
  }

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg, 24px);
    padding-bottom: var(--spacing-md, 16px);
    border-bottom: 1px solid #e5e7eb;
  }

  .step-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color, #333);
  }

  .step-status {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: capitalize;

    &--pending {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    &--in-progress {
      background-color: #dbeafe;
      color: #1e40af;
    }

    &--completed {
      background-color: #d1fae5;
      color: #065f46;
    }

    &--error {
      background-color: #fee2e2;
      color: #991b1b;
    }
  }

  .step-content {
    min-height: 200px;
    
    // Allow content to define its own layout
    > * {
      margin-bottom: var(--spacing-md, 16px);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-xl, 32px);
    padding-top: var(--spacing-lg, 24px);
    border-top: 1px solid #e5e7eb;

    // Single button should align right
    &:only-child {
      justify-content: flex-end;
    }
  }
}

// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius, 6px);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) ease;
  min-width: 100px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 171, 209, 0.2);
  }

  &-primary {
    background-color: var(--primary-color, #00abd1);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: darken(#00abd1, 10%);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
  }

  &-secondary {
    background-color: #6c757d;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: darken(#6c757d, 10%);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
  }
}

// Responsive styles
@media (max-width: 768px) {
  .workflow-step {
    padding: var(--spacing-md, 16px);
    margin-bottom: var(--spacing-md, 16px);

    .step-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm, 8px);
    }

    .step-title {
      font-size: 1.25rem;
    }

    .step-actions {
      flex-direction: column;
      gap: var(--spacing-sm, 8px);

      .btn {
        width: 100%;
      }
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .workflow-step {
    background-color: #1f2937;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);

    &--error {
      border-color: #ef4444;
    }

    .step-header {
      border-bottom-color: #374151;
    }

    .step-title {
      color: #f9fafb;
    }

    .step-actions {
      border-top-color: #374151;
    }

    .step-status {
      &--pending {
        background-color: #374151;
        color: #d1d5db;
      }

      &--in-progress {
        background-color: #1e3a8a;
        color: #93bbfe;
      }

      &--completed {
        background-color: #064e3b;
        color: #6ee7b7;
      }

      &--error {
        background-color: #7f1d1d;
        color: #fca5a5;
      }
    }
  }
}
</style>