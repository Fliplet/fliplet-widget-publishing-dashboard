<template>
  <transition name="fade">
    <div v-if="active" class="loading-overlay">
      <div class="loading-overlay__spinner">
        <loading-spinner size="60px" />
        <p v-if="message" class="loading-overlay__message">{{ message }}</p>
      </div>
    </div>
  </transition>
</template>

<script>
import LoadingSpinner from '../ui/LoadingSpinner.vue';

export default {
  name: 'LoadingOverlay',
  components: {
    LoadingSpinner
  },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Loading...'
    }
  }
};
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &__spinner {
    text-align: center;
    background-color: white;
    padding: var(--spacing-xl);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
  }

  &__message {
    margin-top: var(--spacing-md);
    font-size: 1.125rem;
    color: var(--text-color);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed, 200ms) ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>