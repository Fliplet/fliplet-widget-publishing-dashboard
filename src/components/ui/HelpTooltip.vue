<template>
  <div class="help-tooltip" ref="tooltip">
    <div
      class="help-tooltip__trigger"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @click="toggleTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
      :tabindex="interactive ? '0' : '-1'"
      :aria-describedby="tooltipId"
      role="button"
    >
      <slot name="trigger">
        <i :class="triggerIcon"></i>
      </slot>
    </div>
    
    <transition name="tooltip-fade">
      <div
        v-if="isVisible"
        :id="tooltipId"
        class="help-tooltip__content"
        :class="[`help-tooltip__content--${computedPosition}`, contentClass]"
        :style="tooltipStyle"
        role="tooltip"
        @mouseenter="handleContentMouseEnter"
        @mouseleave="handleContentMouseLeave"
      >
        <div class="help-tooltip__arrow" :class="`help-tooltip__arrow--${computedPosition}`"></div>
        <div class="help-tooltip__body">
          <h4 v-if="title" class="help-tooltip__title">{{ title }}</h4>
          <div class="help-tooltip__text">
            <slot>{{ content }}</slot>
          </div>
          <a
            v-if="helpLink"
            :href="helpLink"
            target="_blank"
            rel="noopener noreferrer"
            class="help-tooltip__link"
          >
            Learn more <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
/**
 * HelpTooltip - Contextual help tooltip component
 */
export default {
  name: 'HelpTooltip',

  props: {
    /**
     * Tooltip content text
     * @type {String}
     */
    content: {
      type: String,
      default: ''
    },

    /**
     * Tooltip title
     * @type {String}
     */
    title: {
      type: String,
      default: ''
    },

    /**
     * Help documentation link
     * @type {String}
     */
    helpLink: {
      type: String,
      default: ''
    },

    /**
     * Preferred position
     * @type {String}
     */
    position: {
      type: String,
      default: 'top',
      validator: value => ['top', 'right', 'bottom', 'left', 'auto'].includes(value)
    },

    /**
     * Trigger icon class
     * @type {String}
     */
    triggerIcon: {
      type: String,
      default: 'fas fa-question-circle'
    },

    /**
     * Show on hover
     * @type {Boolean}
     */
    showOnHover: {
      type: Boolean,
      default: true
    },

    /**
     * Interactive mode (click to toggle)
     * @type {Boolean}
     */
    interactive: {
      type: Boolean,
      default: false
    },

    /**
     * Delay before showing (ms)
     * @type {Number}
     */
    showDelay: {
      type: Number,
      default: 200
    },

    /**
     * Delay before hiding (ms)
     * @type {Number}
     */
    hideDelay: {
      type: Number,
      default: 100
    },

    /**
     * Additional content classes
     * @type {String}
     */
    contentClass: {
      type: String,
      default: ''
    },

    /**
     * Max width of tooltip
     * @type {String}
     */
    maxWidth: {
      type: String,
      default: '300px'
    }
  },

  data() {
    return {
      isVisible: false,
      showTimeout: null,
      hideTimeout: null,
      computedPosition: this.position,
      tooltipStyle: {},
      tooltipId: `tooltip-${this._uid}`,
      isOverContent: false
    };
  },

  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.updatePosition();
        });
      }
    }
  },

  mounted() {
    if (this.position === 'auto') {
      window.addEventListener('scroll', this.updatePosition);
      window.addEventListener('resize', this.updatePosition);
    }
  },

  beforeDestroy() {
    this.clearTimeouts();
    if (this.position === 'auto') {
      window.removeEventListener('scroll', this.updatePosition);
      window.removeEventListener('resize', this.updatePosition);
    }
  },

  methods: {
    showTooltip() {
      if (!this.showOnHover && !this.interactive) return;
      
      this.clearTimeouts();
      this.showTimeout = setTimeout(() => {
        this.isVisible = true;
      }, this.showDelay);
    },

    hideTooltip() {
      if (this.interactive && this.isOverContent) return;
      
      this.clearTimeouts();
      this.hideTimeout = setTimeout(() => {
        this.isVisible = false;
      }, this.hideDelay);
    },

    toggleTooltip() {
      if (this.interactive) {
        this.isVisible = !this.isVisible;
      }
    },

    handleContentMouseEnter() {
      if (this.interactive) {
        this.isOverContent = true;
        this.clearTimeouts();
      }
    },

    handleContentMouseLeave() {
      if (this.interactive) {
        this.isOverContent = false;
        this.hideTooltip();
      }
    },

    clearTimeouts() {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    },

    updatePosition() {
      if (!this.$refs.tooltip || !this.isVisible) return;

      const trigger = this.$refs.tooltip.querySelector('.help-tooltip__trigger');
      const content = this.$refs.tooltip.querySelector('.help-tooltip__content');
      
      if (!trigger || !content) return;

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Auto position logic
      if (this.position === 'auto') {
        const positions = ['top', 'right', 'bottom', 'left'];
        const space = {
          top: triggerRect.top,
          right: viewportWidth - triggerRect.right,
          bottom: viewportHeight - triggerRect.bottom,
          left: triggerRect.left
        };

        // Find position with most space
        let bestPosition = 'top';
        let maxSpace = 0;

        positions.forEach(pos => {
          if (space[pos] > maxSpace && space[pos] > contentRect.height + 20) {
            maxSpace = space[pos];
            bestPosition = pos;
          }
        });

        this.computedPosition = bestPosition;
      }

      // Calculate position styles
      const offset = 10; // Distance from trigger
      let style = {
        maxWidth: this.maxWidth
      };

      switch (this.computedPosition) {
        case 'top':
          style.bottom = `${trigger.offsetHeight + offset}px`;
          style.left = '50%';
          style.transform = 'translateX(-50%)';
          break;
        case 'right':
          style.left = `${trigger.offsetWidth + offset}px`;
          style.top = '50%';
          style.transform = 'translateY(-50%)';
          break;
        case 'bottom':
          style.top = `${trigger.offsetHeight + offset}px`;
          style.left = '50%';
          style.transform = 'translateX(-50%)';
          break;
        case 'left':
          style.right = `${trigger.offsetWidth + offset}px`;
          style.top = '50%';
          style.transform = 'translateY(-50%)';
          break;
      }

      this.tooltipStyle = style;
    }
  }
};
</script>

<style lang="scss" scoped>
.help-tooltip {
  position: relative;
  display: inline-block;
}

.help-tooltip__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  cursor: help;
  transition: color var(--transition-speed) ease;
  
  &:hover,
  &:focus {
    color: var(--primary-color);
    outline: none;
  }
  
  i {
    font-size: 1rem;
  }
}

.help-tooltip__content {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  
  &.interactive {
    pointer-events: auto;
  }
}

.help-tooltip__body {
  background-color: var(--text-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  font-size: 0.875rem;
  line-height: 1.5;
}

.help-tooltip__arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  
  &--top {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px 6px 0 6px;
    border-color: var(--text-color) transparent transparent transparent;
  }
  
  &--right {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 6px 6px 6px 0;
    border-color: transparent var(--text-color) transparent transparent;
  }
  
  &--bottom {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent var(--text-color) transparent;
  }
  
  &--left {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent var(--text-color);
  }
}

.help-tooltip__title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.help-tooltip__text {
  margin: 0;
}

.help-tooltip__link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  color: var(--accent-color);
  text-decoration: none;
  font-size: 0.813rem;
  
  &:hover {
    text-decoration: underline;
  }
  
  i {
    font-size: 0.75rem;
  }
}

// Transitions
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity var(--transition-speed) ease;
}

.tooltip-fade-enter,
.tooltip-fade-leave-to {
  opacity: 0;
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .help-tooltip__body {
    background-color: var(--bg-color-light);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }
  
  .help-tooltip__arrow {
    &--top {
      border-color: var(--bg-color-light) transparent transparent transparent;
    }
    
    &--right {
      border-color: transparent var(--bg-color-light) transparent transparent;
    }
    
    &--bottom {
      border-color: transparent transparent var(--bg-color-light) transparent;
    }
    
    &--left {
      border-color: transparent transparent transparent var(--bg-color-light);
    }
  }
}
</style>