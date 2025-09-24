<template>
  <div 
    class="validation-message"
    :class="`validation-message--${type}`"
    role="alert"
  >
    <i :class="iconClass" aria-hidden="true"></i>
    <span class="validation-message__text">{{ message }}</span>
  </div>
</template>

<script>
/**
 * ValidationMessage - Display validation messages with appropriate styling
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <ValidationMessage
 *   message="Email is required"
 *   type="error"
 * />
 */
export default {
  name: 'ValidationMessage',

  props: {
    /**
     * Message to display
     * @type {String}
     * @required
     */
    message: {
      type: String,
      required: true
    },

    /**
     * Message type
     * @type {String}
     */
    type: {
      type: String,
      default: 'error',
      validator: (value) => {
        return ['error', 'warning', 'success', 'info'].includes(value);
      }
    }
  },

  computed: {
    iconClass() {
      const icons = {
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        success: 'fas fa-check-circle',
        info: 'fas fa-info-circle'
      };
      return icons[this.type] || icons.error;
    }
  }
};
</script>

<style lang="scss" scoped>
.validation-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  animation: slideIn var(--transition-speed, 200ms) ease;

  i {
    flex-shrink: 0;
  }

  &__text {
    line-height: 1.4;
  }

  &--error {
    color: var(--error-color, #dc3545);
  }

  &--warning {
    color: var(--warning-color, #ffc107);
  }

  &--success {
    color: var(--success-color, #28a745);
  }

  &--info {
    color: var(--info-color, #17a2b8);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>