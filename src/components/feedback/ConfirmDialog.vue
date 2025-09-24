<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="confirm-dialog-overlay" @click.self="handleCancel">
      <div class="confirm-dialog" role="dialog" :aria-labelledby="dialogId + '-title'">
        <!-- Dialog Header -->
        <div class="dialog-header">
          <h3 :id="dialogId + '-title'" class="dialog-title">
            <i v-if="icon" :class="icon"></i>
            {{ title }}
          </h3>
          <button
            class="dialog-close"
            @click="handleCancel"
            aria-label="Close dialog"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Dialog Body -->
        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>
          <div v-if="$slots.default" class="dialog-content">
            <slot></slot>
          </div>
        </div>

        <!-- Dialog Footer -->
        <div class="dialog-footer">
          <button
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
          <button
            :class="['btn', confirmButtonClass]"
            @click="handleConfirm"
            :disabled="loading"
          >
            <loading-spinner v-if="loading" size="16px" :color="confirmButtonTextColor" />
            <template v-else>
              <i v-if="confirmIcon" :class="confirmIcon"></i>
              {{ confirmText }}
            </template>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import LoadingSpinner from '../ui/LoadingSpinner.vue';

/**
 * ConfirmDialog - Reusable confirmation dialog component
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'ConfirmDialog',

  components: {
    LoadingSpinner
  },

  props: {
    /**
     * Whether the dialog is visible
     * @type {Boolean}
     */
    visible: {
      type: Boolean,
      default: false
    },

    /**
     * Dialog title
     * @type {String}
     */
    title: {
      type: String,
      default: 'Confirm Action'
    },

    /**
     * Dialog message
     * @type {String}
     */
    message: {
      type: String,
      default: 'Are you sure you want to proceed?'
    },

    /**
     * Icon class for title
     * @type {String}
     */
    icon: {
      type: String,
      default: ''
    },

    /**
     * Confirm button text
     * @type {String}
     */
    confirmText: {
      type: String,
      default: 'Confirm'
    },

    /**
     * Cancel button text
     * @type {String}
     */
    cancelText: {
      type: String,
      default: 'Cancel'
    },

    /**
     * Confirm button icon
     * @type {String}
     */
    confirmIcon: {
      type: String,
      default: ''
    },

    /**
     * Confirm button type (primary, danger, success)
     * @type {String}
     */
    confirmType: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'danger', 'success', 'warning'].includes(value)
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
     * Close on overlay click
     * @type {Boolean}
     */
    closeOnOverlay: {
      type: Boolean,
      default: true
    },

    /**
     * Close on escape key
     * @type {Boolean}
     */
    closeOnEscape: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      dialogId: `confirm-dialog-${this._uid}`
    };
  },

  computed: {
    confirmButtonClass() {
      return `btn-${this.confirmType}`;
    },

    confirmButtonTextColor() {
      return this.confirmType === 'warning' ? '#000' : '#fff';
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.setupKeyboardHandling();
          this.trapFocus();
        });
        document.body.style.overflow = 'hidden';
      } else {
        this.cleanupKeyboardHandling();
        document.body.style.overflow = '';
      }
    }
  },

  beforeDestroy() {
    this.cleanupKeyboardHandling();
    document.body.style.overflow = '';
  },

  methods: {
    handleConfirm() {
      if (!this.loading) {
        this.$emit('confirm');
      }
    },

    handleCancel() {
      if (!this.loading && (this.closeOnOverlay || event.target.classList.contains('dialog-close'))) {
        this.$emit('cancel');
      }
    },

    handleKeydown(event) {
      if (event.key === 'Escape' && this.closeOnEscape && !this.loading) {
        this.$emit('cancel');
      }
    },

    setupKeyboardHandling() {
      document.addEventListener('keydown', this.handleKeydown);
    },

    cleanupKeyboardHandling() {
      document.removeEventListener('keydown', this.handleKeydown);
    },

    trapFocus() {
      const dialog = this.$el.querySelector('.confirm-dialog');
      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.confirm-dialog-overlay {
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
  padding: var(--spacing-lg);
}

.confirm-dialog {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  i {
    color: var(--primary-color);
  }
}

.dialog-close {
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

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.dialog-message {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color);
  line-height: 1.5;
}

.dialog-content {
  color: var(--text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color);
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-primary {
    background-color: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(var(--primary-color), 10%);
    }
  }

  &-danger {
    background-color: var(--error-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(var(--error-color), 10%);
    }
  }

  &-success {
    background-color: var(--success-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(var(--success-color), 10%);
    }
  }

  &-warning {
    background-color: var(--warning-color);
    color: #000;

    &:hover:not(:disabled) {
      background-color: darken(var(--warning-color), 10%);
    }
  }

  &-secondary {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &:hover:not(:disabled) {
      background-color: var(--bg-color);
      border-color: var(--text-color-secondary);
    }
  }
}

// Transition animations
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity var(--transition-speed) ease;

  .confirm-dialog {
    transition: transform var(--transition-speed) ease;
  }
}

.dialog-fade-enter,
.dialog-fade-leave-to {
  opacity: 0;

  .confirm-dialog {
    transform: scale(0.9);
  }
}

// Responsive
@media (max-width: 480px) {
  .confirm-dialog-overlay {
    padding: var(--spacing-md);
  }

  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding: var(--spacing-md);
  }

  .dialog-footer {
    flex-direction: column-reverse;

    .btn {
      width: 100%;
    }
  }
}
</style>