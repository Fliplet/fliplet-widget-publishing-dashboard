<template>
  <div class="status-indicator" :class="`status-indicator--${status}`">
    <span class="status-indicator__dot"></span>
    <span class="status-indicator__text">{{ message || defaultMessage }}</span>
  </div>
</template>

<script>
export default {
  name: 'StatusIndicator',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ['success', 'warning', 'error', 'info', 'pending'].includes(value)
    },
    message: {
      type: String,
      default: ''
    }
  },
  computed: {
    defaultMessage() {
      const messages = {
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        info: 'Info',
        pending: 'Pending'
      };
      return messages[this.status] || '';
    }
  }
};
</script>

<style lang="scss" scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }

  &__text {
    font-size: 0.875rem;
    font-weight: 500;
  }

  &--success {
    color: var(--success-color, #28a745);
  }

  &--warning {
    color: var(--warning-color, #ffc107);
  }

  &--error {
    color: var(--error-color, #dc3545);
  }

  &--info {
    color: var(--info-color, #17a2b8);
  }

  &--pending {
    color: var(--text-color-secondary, #666);
  }
}
</style>