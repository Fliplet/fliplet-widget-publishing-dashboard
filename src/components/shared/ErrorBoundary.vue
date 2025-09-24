<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>
      
      <div v-if="showDetails && error" class="error-details">
        <button 
          class="toggle-details"
          @click="detailsExpanded = !detailsExpanded"
        >
          <i :class="['fas', detailsExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
          {{ detailsExpanded ? 'Hide' : 'Show' }} Error Details
        </button>
        
        <div v-if="detailsExpanded" class="error-stack">
          <pre>{{ errorStack }}</pre>
        </div>
      </div>

      <div class="error-actions">
        <button 
          class="btn btn-primary"
          @click="handleReload"
        >
          <i class="fas fa-redo"></i>
          Reload Page
        </button>
        <button 
          v-if="showRecover"
          class="btn btn-secondary"
          @click="handleRecover"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script>
/**
 * ErrorBoundary - Global error boundary component for Vue 2.6.14
 * Catches and displays errors from child components
 */
export default {
  name: 'ErrorBoundary',

  props: {
    /**
     * Custom error title
     * @type {String}
     */
    title: {
      type: String,
      default: 'Oops! Something went wrong'
    },

    /**
     * Custom error message
     * @type {String}
     */
    message: {
      type: String,
      default: 'An unexpected error occurred. Please try again.'
    },

    /**
     * Show error details toggle
     * @type {Boolean}
     */
    showDetails: {
      type: Boolean,
      default: process.env.NODE_ENV !== 'production'
    },

    /**
     * Show recover button
     * @type {Boolean}
     */
    showRecover: {
      type: Boolean,
      default: true
    },

    /**
     * Fallback component to render on error
     * @type {Object}
     */
    fallback: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      hasError: false,
      error: null,
      errorInfo: null,
      detailsExpanded: false
    };
  },

  computed: {
    errorStack() {
      if (!this.error) return '';
      return this.error.stack || this.error.toString();
    }
  },

  errorCaptured(error, vm, info) {
    this.hasError = true;
    this.error = error;
    this.errorInfo = info;

    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component:', vm);
      console.error('Error info:', info);
    }

    // Send error to error tracking service
    this.reportError(error, vm, info);

    // Emit error event
    this.$emit('error', { error, vm, info });

    // Prevent error from propagating
    return false;
  },

  methods: {
    handleReload() {
      window.location.reload();
    },

    handleRecover() {
      this.hasError = false;
      this.error = null;
      this.errorInfo = null;
      this.$emit('recover');
    },

    reportError(error, vm, info) {
      // Integration point for error tracking services
      if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
        const errorHandler = window.PublishingMiddleware.getComponent('errorHandler');
        if (errorHandler) {
          errorHandler.logError({
            error: error.toString(),
            stack: error.stack,
            component: vm?.$options.name || 'Unknown',
            info,
            timestamp: new Date().toISOString()
          });
        }
      }

      // You can add other error tracking services here
      // e.g., Sentry, LogRocket, etc.
    },

    reset() {
      this.hasError = false;
      this.error = null;
      this.errorInfo = null;
      this.detailsExpanded = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.error-container {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-icon {
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}

.error-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.error-message {
  margin: 0 0 var(--spacing-xl) 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.error-details {
  margin-bottom: var(--spacing-xl);
}

.toggle-details {
  background: none;
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  color: var(--text-color-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-speed) ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.error-stack {
  margin-top: var(--spacing-md);
  text-align: left;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  overflow-x: auto;

  pre {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
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

  &-primary {
    background-color: var(--primary-color);
    color: white;

    &:hover {
      background-color: darken(var(--primary-color), 10%);
    }
  }

  &-secondary {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &:hover {
      background-color: var(--bg-color);
      border-color: var(--text-color-secondary);
    }
  }
}

// Responsive
@media (max-width: 480px) {
  .error-boundary {
    padding: var(--spacing-lg);
  }

  .error-icon {
    font-size: 3rem;
  }

  .error-title {
    font-size: 1.25rem;
  }

  .error-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
</style>