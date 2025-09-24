<template>
  <div class="animated-workflow-container">
    <!-- Progress indicator with animation -->
    <transition name="progress-fade">
      <div v-if="showProgress" class="workflow-progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressWidth }"
        ></div>
        <div class="progress-markers">
          <div 
            v-for="(step, index) in steps"
            :key="step.id || index"
            class="progress-marker"
            :class="{ 'progress-marker--completed': index <= currentStepIndex }"
            :style="{ left: `${(index / (steps.length - 1)) * 100}%` }"
          >
            <transition name="marker-pop">
              <span v-if="index <= currentStepIndex" class="marker-dot"></span>
            </transition>
          </div>
        </div>
      </div>
    </transition>

    <!-- Step content with transitions -->
    <div class="workflow-content">
      <workflow-transitions
        :direction="transitionDirection"
        :duration="transitionDuration"
        :animate-height="animateHeight"
        @before-enter="handleTransitionStart"
        @after-enter="handleTransitionEnd"
        @before-leave="handleTransitionStart"
        @after-leave="handleTransitionEnd"
      >
        <div 
          :key="currentStepKey"
          class="workflow-step-wrapper"
        >
          <slot 
            :step="currentStep"
            :stepIndex="currentStepIndex"
            :isAnimating="isAnimating"
          />
        </div>
      </workflow-transitions>
    </div>

    <!-- Optional: Animated step indicators -->
    <transition-group 
      v-if="showStepIndicators"
      name="step-indicator"
      tag="div"
      class="step-indicators"
    >
      <div
        v-for="(step, index) in steps"
        :key="step.id || index"
        class="step-indicator-item"
        :class="{
          'step-indicator-item--active': index === currentStepIndex,
          'step-indicator-item--completed': index < currentStepIndex
        }"
        @click="$emit('step-click', index)"
      >
        <transition name="indicator-content" mode="out-in">
          <i 
            v-if="index < currentStepIndex" 
            key="check"
            class="fas fa-check"
          ></i>
          <span 
            v-else 
            key="number"
          >
            {{ index + 1 }}
          </span>
        </transition>
      </div>
    </transition-group>

    <!-- Loading overlay with animation -->
    <transition name="fade">
      <div v-if="loading" class="workflow-loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </transition>
  </div>
</template>

<script>
import WorkflowTransitions from './WorkflowTransitions.vue';

/**
 * AnimatedWorkflowContainer - Container with animated transitions for workflow steps
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'AnimatedWorkflowContainer',

  components: {
    WorkflowTransitions
  },

  props: {
    /**
     * Workflow steps array
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
     * Show progress bar
     * @type {Boolean}
     */
    showProgress: {
      type: Boolean,
      default: true
    },

    /**
     * Show step indicators
     * @type {Boolean}
     */
    showStepIndicators: {
      type: Boolean,
      default: false
    },

    /**
     * Loading state
     * @type {Boolean}
     */
    loading: {
      type: Boolean,
      default: false
    },

    /**
     * Loading text
     * @type {String}
     */
    loadingText: {
      type: String,
      default: 'Processing...'
    },

    /**
     * Transition duration in ms
     * @type {Number}
     */
    transitionDuration: {
      type: Number,
      default: 300
    },

    /**
     * Animate height changes
     * @type {Boolean}
     */
    animateHeight: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      previousStepIndex: 0,
      isAnimating: false,
      progressAnimationFrame: null
    };
  },

  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex] || null;
    },

    currentStepKey() {
      // Use step ID or index as key for transitions
      return this.currentStep ? (this.currentStep.id || this.currentStepIndex) : 'empty';
    },

    transitionDirection() {
      if (this.currentStepIndex > this.previousStepIndex) {
        return 'forward';
      } else if (this.currentStepIndex < this.previousStepIndex) {
        return 'backward';
      }
      return 'fade';
    },

    progressWidth() {
      const progress = (this.currentStepIndex / (this.steps.length - 1)) * 100;
      return `${Math.min(100, Math.max(0, progress))}%`;
    }
  },

  watch: {
    currentStepIndex(newIndex, oldIndex) {
      this.previousStepIndex = oldIndex;
      this.animateProgress();
    }
  },

  mounted() {
    // Initial progress animation
    this.animateProgress();
  },

  beforeDestroy() {
    if (this.progressAnimationFrame) {
      cancelAnimationFrame(this.progressAnimationFrame);
    }
  },

  methods: {
    handleTransitionStart() {
      this.isAnimating = true;
      this.$emit('transition-start');
    },

    handleTransitionEnd() {
      this.isAnimating = false;
      this.$emit('transition-end');
    },

    animateProgress() {
      // Smooth progress bar animation using requestAnimationFrame
      const progressBar = this.$el.querySelector('.progress-fill');
      if (!progressBar) return;

      const startWidth = parseFloat(progressBar.style.width) || 0;
      const targetWidth = parseFloat(this.progressWidth);
      const duration = 500; // ms
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentWidth = startWidth + (targetWidth - startWidth) * easeOut;
        progressBar.style.width = `${currentWidth}%`;

        if (progress < 1) {
          this.progressAnimationFrame = requestAnimationFrame(animate);
        }
      };

      this.progressAnimationFrame = requestAnimationFrame(animate);
    }
  }
};
</script>

<style lang="scss" scoped>
.animated-workflow-container {
  position: relative;
  min-height: 400px;
}

// Progress bar animations
.workflow-progress-bar {
  position: relative;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  margin-bottom: var(--spacing-xl, 32px);
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, 
    var(--primary-color, #00abd1) 0%, 
    lighten(#00abd1, 10%) 100%
  );
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 171, 209, 0.3);
}

.progress-markers {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.progress-marker {
  position: absolute;
  transform: translateX(-50%);

  &--completed {
    .marker-dot {
      background-color: var(--primary-color, #00abd1);
      transform: scale(1);
    }
  }
}

.marker-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

// Step indicators animations
.step-indicators {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md, 16px);
  margin-top: var(--spacing-xl, 32px);
}

.step-indicator-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #6b7280;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &--active {
    background-color: var(--primary-color, #00abd1);
    border-color: var(--primary-color, #00abd1);
    color: white;
    transform: scale(1.1);
  }

  &--completed {
    background-color: #34d399;
    border-color: #34d399;
    color: white;
  }
}

// Loading overlay
.workflow-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--primary-color, #00abd1);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

  &:nth-child(2) {
    animation-delay: 0.15s;
    border-top-color: lighten(#00abd1, 15%);
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
    border-top-color: lighten(#00abd1, 30%);
  }
}

.loading-text {
  margin-top: var(--spacing-lg, 24px);
  color: var(--text-color-secondary, #666);
  font-size: 0.875rem;
}

// Transition animations
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.3s ease;
}

.progress-fade-enter,
.progress-fade-leave-to {
  opacity: 0;
}

.marker-pop-enter-active {
  animation: marker-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.indicator-content-enter-active,
.indicator-content-leave-active {
  transition: all 0.2s ease;
}

.indicator-content-enter,
.indicator-content-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.step-indicator-enter-active {
  animation: slide-in 0.3s ease-out;
}

.step-indicator-leave-active {
  animation: slide-out 0.3s ease-in;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

// Animations
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes marker-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .progress-fill {
    transition: none !important;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .workflow-progress-bar {
    margin-bottom: var(--spacing-lg, 24px);
  }

  .step-indicators {
    gap: var(--spacing-sm, 8px);
  }

  .step-indicator-item {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}
</style>