<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @after-enter="handleAfterEnter"
    @before-leave="handleBeforeLeave"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
  >
    <slot />
  </transition>
</template>

<script>
/**
 * WorkflowTransitions - Animated transitions for workflow steps
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'WorkflowTransitions',

  props: {
    /**
     * Transition direction
     * @type {String}
     */
    direction: {
      type: String,
      default: 'forward',
      validator: (value) => ['forward', 'backward', 'fade'].includes(value)
    },

    /**
     * Transition duration in milliseconds
     * @type {Number}
     */
    duration: {
      type: Number,
      default: 300
    },

    /**
     * Transition easing function
     * @type {String}
     */
    easing: {
      type: String,
      default: 'ease-in-out'
    },

    /**
     * Whether to animate height changes
     * @type {Boolean}
     */
    animateHeight: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    transitionName() {
      return `workflow-${this.direction}`;
    },

    transitionMode() {
      // Use out-in mode to prevent overlap
      return 'out-in';
    },

    transitionStyle() {
      return {
        '--transition-duration': `${this.duration}ms`,
        '--transition-easing': this.easing
      };
    }
  },

  methods: {
    handleBeforeEnter(el) {
      this.$emit('before-enter', el);
      
      // Set initial state based on direction
      if (this.direction === 'forward') {
        el.style.transform = 'translateX(100%)';
        el.style.opacity = '0';
      } else if (this.direction === 'backward') {
        el.style.transform = 'translateX(-100%)';
        el.style.opacity = '0';
      } else if (this.direction === 'fade') {
        el.style.opacity = '0';
      }
    },

    handleEnter(el, done) {
      this.$emit('enter', el);
      
      // Force reflow
      el.offsetHeight;
      
      // Apply transition
      el.style.transition = `all ${this.duration}ms ${this.easing}`;
      el.style.transform = 'translateX(0)';
      el.style.opacity = '1';
      
      // Handle height animation
      if (this.animateHeight) {
        this.animateElementHeight(el, 'enter');
      }
      
      setTimeout(done, this.duration);
    },

    handleAfterEnter(el) {
      this.$emit('after-enter', el);
      
      // Clean up inline styles
      el.style.transition = '';
      el.style.transform = '';
      el.style.opacity = '';
      el.style.height = '';
    },

    handleBeforeLeave(el) {
      this.$emit('before-leave', el);
      
      // Store current height for animation
      if (this.animateHeight) {
        el.style.height = `${el.offsetHeight}px`;
      }
    },

    handleLeave(el, done) {
      this.$emit('leave', el);
      
      // Force reflow
      el.offsetHeight;
      
      // Apply transition
      el.style.transition = `all ${this.duration}ms ${this.easing}`;
      
      if (this.direction === 'forward') {
        el.style.transform = 'translateX(-100%)';
        el.style.opacity = '0';
      } else if (this.direction === 'backward') {
        el.style.transform = 'translateX(100%)';
        el.style.opacity = '0';
      } else if (this.direction === 'fade') {
        el.style.opacity = '0';
      }
      
      // Handle height animation
      if (this.animateHeight) {
        this.animateElementHeight(el, 'leave');
      }
      
      setTimeout(done, this.duration);
    },

    handleAfterLeave(el) {
      this.$emit('after-leave', el);
    },

    animateElementHeight(el, phase) {
      if (phase === 'enter') {
        // Get target height
        el.style.height = 'auto';
        const targetHeight = el.offsetHeight;
        el.style.height = '0px';
        
        // Force reflow
        el.offsetHeight;
        
        // Animate to target height
        el.style.height = `${targetHeight}px`;
      } else if (phase === 'leave') {
        // Animate to zero height
        el.style.height = '0px';
      }
    }
  }
};
</script>

<style lang="scss">
// Base transition styles
.workflow-forward-enter-active,
.workflow-forward-leave-active,
.workflow-backward-enter-active,
.workflow-backward-leave-active,
.workflow-fade-enter-active,
.workflow-fade-leave-active {
  transition: all var(--transition-duration, 300ms) var(--transition-easing, ease-in-out);
  position: relative;
}

// Forward transitions (next step)
.workflow-forward-enter {
  transform: translateX(100%);
  opacity: 0;
}

.workflow-forward-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.workflow-forward-leave {
  transform: translateX(0);
  opacity: 1;
}

.workflow-forward-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

// Backward transitions (previous step)
.workflow-backward-enter {
  transform: translateX(-100%);
  opacity: 0;
}

.workflow-backward-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.workflow-backward-leave {
  transform: translateX(0);
  opacity: 1;
}

.workflow-backward-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// Fade transitions
.workflow-fade-enter {
  opacity: 0;
}

.workflow-fade-enter-to {
  opacity: 1;
}

.workflow-fade-leave {
  opacity: 1;
}

.workflow-fade-leave-to {
  opacity: 0;
}

// Prevent layout shift during transitions
.workflow-transition-container {
  position: relative;
  overflow: hidden;
}

// Optional: Add slide-up animation
.workflow-slide-up-enter-active,
.workflow-slide-up-leave-active {
  transition: all var(--transition-duration, 300ms) var(--transition-easing, ease-in-out);
}

.workflow-slide-up-enter {
  transform: translateY(20px);
  opacity: 0;
}

.workflow-slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.workflow-slide-up-leave {
  transform: translateY(0);
  opacity: 1;
}

.workflow-slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

// Optional: Add scale animation
.workflow-scale-enter-active,
.workflow-scale-leave-active {
  transition: all var(--transition-duration, 300ms) var(--transition-easing, ease-in-out);
}

.workflow-scale-enter {
  transform: scale(0.9);
  opacity: 0;
}

.workflow-scale-enter-to {
  transform: scale(1);
  opacity: 1;
}

.workflow-scale-leave {
  transform: scale(1);
  opacity: 1;
}

.workflow-scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .workflow-forward-enter-active,
  .workflow-forward-leave-active,
  .workflow-backward-enter-active,
  .workflow-backward-leave-active,
  .workflow-fade-enter-active,
  .workflow-fade-leave-active,
  .workflow-slide-up-enter-active,
  .workflow-slide-up-leave-active,
  .workflow-scale-enter-active,
  .workflow-scale-leave-active {
    transition-duration: 0.01ms !important;
  }
  
  .workflow-forward-enter,
  .workflow-forward-leave-to,
  .workflow-backward-enter,
  .workflow-backward-leave-to,
  .workflow-slide-up-enter,
  .workflow-slide-up-leave-to,
  .workflow-scale-enter,
  .workflow-scale-leave-to {
    transform: none !important;
  }
}
</style>