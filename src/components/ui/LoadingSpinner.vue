<template>
  <div class="loading-spinner" :class="`loading-spinner--${size}`">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  }
};
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: inline-block;

  &--small {
    .spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }
  }

  &--medium {
    .spinner {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }
  }

  &--large {
    .spinner {
      width: 48px;
      height: 48px;
      border-width: 4px;
    }
  }
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color, #00abd1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>