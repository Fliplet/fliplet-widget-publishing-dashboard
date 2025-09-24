<template>
  <transition-group name="toast" tag="div" class="notification-toast-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="['notification-toast', `notification-toast--${notification.type}`]"
      @click="dismiss(notification.id)"
    >
      <div class="notification-toast__icon">
        <i :class="getIconClass(notification.type)"></i>
      </div>
      <div class="notification-toast__content">
        <p class="notification-toast__message">{{ notification.message }}</p>
        <button v-if="notification.duration === 0" class="notification-toast__close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'NotificationToast',
  data() {
    return {
      notifications: [],
      nextId: 0
    };
  },
  mounted() {
    this.$root.$on('show-notification', this.showNotification);
  },
  beforeDestroy() {
    this.$root.$off('show-notification', this.showNotification);
  },
  methods: {
    showNotification({ type = 'info', message, duration = 3000 }) {
      const id = this.nextId++;
      this.notifications.push({ id, type, message, duration });

      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration);
      }
    },
    dismiss(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
    getIconClass(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[type] || 'fas fa-info-circle';
    }
  }
};
</script>

<style lang="scss" scoped>
.notification-toast-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1050;
  pointer-events: none;
  max-width: 400px;

  @media (max-width: 768px) {
    left: var(--spacing-md);
    right: var(--spacing-md);
    max-width: none;
  }
}

.notification-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  pointer-events: auto;
  max-width: 400px;
  position: relative;

  &__icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }

  &__message {
    margin: 0;
    color: var(--text-color, #333);
  }

  &__close {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-color-secondary, #666);
    font-size: 1rem;
    flex-shrink: 0;

    &:hover {
      color: var(--text-color, #333);
    }

    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }

  &--success {
    border-left: 4px solid var(--success-color, #28a745);
    
    .notification-toast__icon {
      color: var(--success-color, #28a745);
    }
  }

  &--error {
    border-left: 4px solid var(--error-color, #dc3545);
    
    .notification-toast__icon {
      color: var(--error-color, #dc3545);
    }
  }

  &--warning {
    border-left: 4px solid var(--warning-color, #ffc107);
    
    .notification-toast__icon {
      color: var(--warning-color, #ffc107);
    }
  }

  &--info {
    border-left: 4px solid var(--info-color, #17a2b8);
    
    .notification-toast__icon {
      color: var(--info-color, #17a2b8);
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-speed) ease;
}

.toast-enter {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>