<template>
  <div 
    class="workflow-stepper"
    :class="stepperClasses"
    role="navigation"
    :aria-label="`${steps.length} step workflow progress`"
  >
    <ol class="workflow-stepper__list">
      <li
        v-for="(step, index) in steps"
        :key="step.id || index"
        class="workflow-stepper__item"
        :class="getStepClasses(step, index)"
      >
        <!-- Step Connector Line -->
        <div 
          v-if="index < steps.length - 1"
          class="workflow-stepper__connector"
          :class="getConnectorClasses(index)"
        ></div>

        <!-- Step Content -->
        <button
          class="workflow-stepper__step"
          :class="getStepButtonClasses(step, index)"
          :disabled="!canNavigateToStep(step, index)"
          :aria-current="isCurrentStep(index) ? 'step' : null"
          :aria-label="getStepAriaLabel(step, index)"
          @click="handleStepClick(step, index)"
        >
          <!-- Step Number/Icon -->
          <span class="workflow-stepper__indicator">
            <i v-if="step.completed" class="fas fa-check" aria-hidden="true"></i>
            <i v-else-if="step.error" class="fas fa-exclamation" aria-hidden="true"></i>
            <loading-spinner v-else-if="step.loading" size="small" />
            <span v-else>{{ index + 1 }}</span>
          </span>

          <!-- Step Label -->
          <span class="workflow-stepper__content">
            <span class="workflow-stepper__label">{{ step.label }}</span>
            <span v-if="step.description && !isCondensed" class="workflow-stepper__description">
              {{ step.description }}
            </span>
            <span v-if="step.error && step.errorMessage" class="workflow-stepper__error">
              {{ step.errorMessage }}
            </span>
          </span>
        </button>

        <!-- Mobile Progress Bar -->
        <div 
          v-if="isMobile && index === currentStep"
          class="workflow-stepper__mobile-progress"
        >
          <div class="progress-bar">
            <div 
              class="progress-bar__fill" 
              :style="{ width: `${getOverallProgress()}%` }"
            ></div>
          </div>
          <span class="progress-text">Step {{ currentStep + 1 }} of {{ steps.length }}</span>
        </div>
      </li>
    </ol>

    <!-- Mobile Navigation -->
    <div v-if="isMobile && showMobileNav" class="workflow-stepper__mobile-nav">
      <button
        class="btn btn-secondary"
        :disabled="!canGoBack"
        @click="goToPreviousStep"
      >
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
        Previous
      </button>
      
      <span class="workflow-stepper__mobile-current">
        {{ currentStep + 1 }} / {{ steps.length }}
      </span>

      <button
        class="btn btn-primary"
        :disabled="!canGoForward"
        @click="goToNextStep"
      >
        Next
        <i class="fas fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';

/**
 * WorkflowStepper - Visual workflow progress indicator
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <WorkflowStepper
 *   :steps="workflowSteps"
 *   :current-step="currentStepIndex"
 *   :orientation="'horizontal'"
 *   @step-click="handleStepNavigation"
 * />
 */
export default {
  name: 'WorkflowStepper',

  components: {
    LoadingSpinner
  },

  props: {
    /**
     * Array of step objects
     * @type {Array}
     * @required
     */
    steps: {
      type: Array,
      required: true,
      validator: (steps) => {
        return steps.every(step => 
          typeof step === 'object' && 
          step.hasOwnProperty('label')
        );
      }
    },

    /**
     * Current active step index
     * @type {Number}
     */
    currentStep: {
      type: Number,
      default: 0
    },

    /**
     * Stepper orientation
     * @type {String}
     */
    orientation: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical'].includes(value)
    },

    /**
     * Allow navigation to previous steps
     * @type {Boolean}
     */
    allowBackNavigation: {
      type: Boolean,
      default: true
    },

    /**
     * Allow skipping optional steps
     * @type {Boolean}
     */
    allowSkipOptional: {
      type: Boolean,
      default: false
    },

    /**
     * Condensed mode (hide descriptions)
     * @type {Boolean}
     */
    condensed: {
      type: Boolean,
      default: false
    },

    /**
     * Show mobile navigation controls
     * @type {Boolean}
     */
    showMobileNav: {
      type: Boolean,
      default: true
    }
  },

  // Events: step-click, navigate-back, navigate-forward

  data() {
    return {
      isMobile: false
    };
  },

  computed: {
    stepperClasses() {
      return {
        [`workflow-stepper--${this.orientation}`]: true,
        'workflow-stepper--condensed': this.isCondensed,
        'workflow-stepper--mobile': this.isMobile
      };
    },

    isCondensed() {
      return this.condensed || this.isMobile;
    },

    canGoBack() {
      return this.currentStep > 0 && this.allowBackNavigation;
    },

    canGoForward() {
      if (this.currentStep >= this.steps.length - 1) return false;
      
      const currentStepData = this.steps[this.currentStep];
      if (currentStepData.error) return false;
      if (!currentStepData.completed && !currentStepData.optional) return false;
      
      return true;
    }
  },

  created() {
    this.checkViewport();
  },

  mounted() {
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    checkViewport() {
      this.isMobile = window.innerWidth < 768;
    },

    handleResize() {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.checkViewport();
      }, 150);
    },

    getStepClasses(step, index) {
      return {
        'workflow-stepper__item--completed': step.completed,
        'workflow-stepper__item--current': this.isCurrentStep(index),
        'workflow-stepper__item--error': step.error,
        'workflow-stepper__item--disabled': !this.canNavigateToStep(step, index),
        'workflow-stepper__item--optional': step.optional,
        'workflow-stepper__item--loading': step.loading
      };
    },

    getStepButtonClasses(step, index) {
      return {
        'workflow-stepper__step--clickable': this.canNavigateToStep(step, index)
      };
    },

    getConnectorClasses(index) {
      const nextStep = this.steps[index + 1];
      const currentStepCompleted = this.steps[index].completed;
      
      return {
        'workflow-stepper__connector--completed': currentStepCompleted,
        'workflow-stepper__connector--active': index === this.currentStep
      };
    },

    isCurrentStep(index) {
      return index === this.currentStep;
    },

    canNavigateToStep(step, index) {
      // Can't navigate if disabled
      if (step.disabled) return false;
      
      // Can always navigate to current step
      if (index === this.currentStep) return true;
      
      // Can navigate back if allowed
      if (index < this.currentStep && this.allowBackNavigation) return true;
      
      // Can't navigate forward past uncompleted required steps
      if (index > this.currentStep) {
        for (let i = this.currentStep; i < index; i++) {
          const intermediateStep = this.steps[i];
          if (!intermediateStep.completed && !intermediateStep.optional) {
            return false;
          }
        }
        return this.allowSkipOptional || !step.optional;
      }
      
      return false;
    },

    getStepAriaLabel(step, index) {
      const position = `Step ${index + 1} of ${this.steps.length}`;
      const status = step.completed ? 'completed' : 
                    step.error ? 'has errors' :
                    this.isCurrentStep(index) ? 'current' : 
                    'not started';
      const optional = step.optional ? 'optional' : '';
      
      return `${position}: ${step.label} ${optional} - ${status}`;
    },

    handleStepClick(step, index) {
      if (this.canNavigateToStep(step, index)) {
        this.$emit('step-click', { step, index });
      }
    },

    goToPreviousStep() {
      if (this.canGoBack) {
        const newIndex = this.currentStep - 1;
        this.$emit('navigate-back', { 
          step: this.steps[newIndex], 
          index: newIndex 
        });
      }
    },

    goToNextStep() {
      if (this.canGoForward) {
        const newIndex = this.currentStep + 1;
        this.$emit('navigate-forward', { 
          step: this.steps[newIndex], 
          index: newIndex 
        });
      }
    },

    getOverallProgress() {
      const completedSteps = this.steps.filter(step => step.completed).length;
      return Math.round((completedSteps / this.steps.length) * 100);
    }
  }
};
</script>

<style lang="scss" scoped>
.workflow-stepper {
  --step-size: 40px;
  --connector-width: 2px;
  --step-spacing: var(--spacing-xl);

  &__list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
  }

  &__item {
    position: relative;
    flex: 1;
    
    &--optional {
      .workflow-stepper__label::after {
        content: ' (optional)';
        font-size: 0.75rem;
        opacity: 0.7;
      }
    }

    &--disabled {
      opacity: 0.5;
    }
  }

  &__connector {
    position: absolute;
    top: calc(var(--step-size) / 2);
    left: calc(var(--step-size) + var(--spacing-sm));
    right: var(--spacing-sm);
    height: var(--connector-width);
    background-color: #e5e7eb;
    transition: background-color var(--transition-speed) ease;

    &--completed {
      background-color: var(--success-color, #28a745);
    }

    &--active {
      background-color: var(--primary-color, #00abd1);
      opacity: 0.5;
    }
  }

  &__step {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: none;
    border: none;
    padding: 0;
    width: 100%;
    text-align: left;
    cursor: default;
    position: relative;
    z-index: 1;

    &--clickable {
      cursor: pointer;

      &:hover .workflow-stepper__indicator {
        box-shadow: 0 0 0 4px rgba(0, 171, 209, 0.1);
      }
    }

    &:focus {
      outline: none;
      
      .workflow-stepper__indicator {
        box-shadow: 0 0 0 3px var(--primary-color);
      }
    }
  }

  &__indicator {
    width: var(--step-size);
    height: var(--step-size);
    border-radius: 50%;
    background-color: white;
    border: 2px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #6b7280;
    transition: all var(--transition-speed) ease;
    flex-shrink: 0;

    .workflow-stepper__item--completed & {
      background-color: var(--success-color, #28a745);
      border-color: var(--success-color, #28a745);
      color: white;
    }

    .workflow-stepper__item--current & {
      background-color: var(--primary-color, #00abd1);
      border-color: var(--primary-color, #00abd1);
      color: white;
    }

    .workflow-stepper__item--error & {
      background-color: var(--error-color, #dc3545);
      border-color: var(--error-color, #dc3545);
      color: white;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__label {
    font-weight: 500;
    color: var(--text-color, #333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .workflow-stepper__item--current & {
      color: var(--primary-color, #00abd1);
    }

    .workflow-stepper__item--completed & {
      color: var(--success-color, #28a745);
    }

    .workflow-stepper__item--error & {
      color: var(--error-color, #dc3545);
    }
  }

  &__description {
    font-size: 0.875rem;
    color: var(--text-color-secondary, #666);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__error {
    font-size: 0.875rem;
    color: var(--error-color, #dc3545);
    margin-top: 2px;
  }

  // Vertical orientation
  &--vertical {
    .workflow-stepper__list {
      flex-direction: column;
    }

    .workflow-stepper__item {
      margin-bottom: var(--step-spacing);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .workflow-stepper__connector {
      top: calc(var(--step-size) + var(--spacing-sm));
      left: calc(var(--step-size) / 2);
      right: auto;
      bottom: calc(var(--spacing-sm) * -1);
      width: var(--connector-width);
      height: auto;
    }

    .workflow-stepper__step {
      align-items: flex-start;
    }

    .workflow-stepper__description {
      white-space: normal;
    }
  }

  // Condensed mode
  &--condensed {
    --step-size: 32px;
    
    .workflow-stepper__label {
      font-size: 0.875rem;
    }
  }

  // Mobile styles
  &--mobile {
    .workflow-stepper__list {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: var(--spacing-sm);
    }

    .workflow-stepper__item {
      flex: 0 0 auto;
      min-width: 120px;
    }

    .workflow-stepper__connector {
      min-width: 40px;
    }
  }

  &__mobile-progress {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: #f9fafb;
    border-radius: var(--border-radius);
  }

  &__mobile-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid #e5e7eb;
  }

  &__mobile-current {
    font-weight: 500;
    color: var(--text-color-secondary, #666);
  }
}

// Progress bar
.progress-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);

  &__fill {
    height: 100%;
    background-color: var(--primary-color, #00abd1);
    transition: width 0.3s ease;
  }
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
  text-align: center;
  display: block;
}

// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

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
}
</style>