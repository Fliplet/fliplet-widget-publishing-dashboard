<template>
  <transition-group name="toast" tag="div" class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-toast"
      :class="`notification-toast--${notification.type}`"
      role="alert"
    >
      <div class="notification-toast__icon">
        <i :class="getIconClass(notification.type)" aria-hidden="true"></i>
      </div>
      <div class="notification-toast__content">
        <p class="notification-toast__message">{{ notification.message }}</p>
      </div>
      <button
        class="notification-toast__close"
        aria-label="Close notification"
        @click="removeNotification(notification.id)"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'NotificationToast',
  data() {
    return {
      notifications: [],
      nextId: 1
    };
  },
  created() {
    this.$root.$on('show-notification', this.showNotification);
  },
  beforeDestroy() {
    this.$root.$off('show-notification', this.showNotification);
  },
  methods: {
    showNotification({ type = 'info', message, duration = 5000 }) {
      const id = this.nextId++;
      const notification = { id, type, message };
      
      this.notifications.push(notification);
      
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, duration);
      }
    },
    
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },
    
    getIconClass(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[type] || icons.info;
    }
  }
};
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1001;
  pointer-events: none;

  @media (max-width: 767px) {
    left: var(--spacing-md);
    right: var(--spacing-md);
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