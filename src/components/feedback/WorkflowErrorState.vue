<template>
  <div class="workflow-error-state" :class="`workflow-error-state--${severity}`">
    <div class="error-icon">
      <i :class="iconClass"></i>
    </div>
    
    <div class="error-content">
      <h3 class="error-title">{{ errorTitle }}</h3>
      <p class="error-description">{{ errorDescription }}</p>
      
      <div v-if="errorDetails" class="error-details">
        <ul>
          <li v-for="(detail, index) in errorDetailsList" :key="index">
            {{ detail }}
          </li>
        </ul>
      </div>

      <div v-if="suggestions.length" class="error-suggestions">
        <h4>Try the following:</h4>
        <ul>
          <li v-for="(suggestion, index) in suggestions" :key="index">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="showActions" class="error-actions">
      <button 
        v-if="canRetry"
        class="btn btn-primary"
        @click="$emit('retry')"
      >
        <i class="fas fa-redo"></i>
        Try Again
      </button>
      
      <button 
        v-if="canGoBack"
        class="btn btn-secondary"
        @click="$emit('go-back')"
      >
        <i class="fas fa-arrow-left"></i>
        Go Back
      </button>
      
      <button 
        v-if="showHelp"
        class="btn btn-link"
        @click="$emit('help')"
      >
        <i class="fas fa-question-circle"></i>
        Get Help
      </button>
    </div>
  </div>
</template>

<script>
/**
 * WorkflowErrorState - Error state display for workflow steps
 */
export default {
  name: 'WorkflowErrorState',

  props: {
    /**
     * Error type/key for determining display
     * @type {String}
     */
    errorType: {
      type: String,
      default: 'generic'
    },

    /**
     * Error severity
     * @type {String}
     */
    severity: {
      type: String,
      default: 'error',
      validator: value => ['error', 'warning', 'info'].includes(value)
    },

    /**
     * Custom error title
     * @type {String}
     */
    title: {
      type: String,
      default: null
    },

    /**
     * Custom error description
     * @type {String}
     */
    description: {
      type: String,
      default: null
    },

    /**
     * Error details (string or array)
     * @type {String|Array}
     */
    errorDetails: {
      type: [String, Array],
      default: null
    },

    /**
     * Suggestions for resolving the error
     * @type {Array}
     */
    suggestions: {
      type: Array,
      default: () => []
    },

    /**
     * Show action buttons
     * @type {Boolean}
     */
    showActions: {
      type: Boolean,
      default: true
    },

    /**
     * Can retry the failed operation
     * @type {Boolean}
     */
    canRetry: {
      type: Boolean,
      default: true
    },

    /**
     * Can go back to previous step
     * @type {Boolean}
     */
    canGoBack: {
      type: Boolean,
      default: true
    },

    /**
     * Show help button
     * @type {Boolean}
     */
    showHelp: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    iconClass() {
      const icons = {
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[this.severity] || icons.error;
    },

    errorTitle() {
      if (this.title) return this.title;
      
      const titles = {
        generic: 'An error occurred',
        network: 'Network connection issue',
        auth: 'Authentication error',
        validation: 'Validation error',
        permission: 'Permission denied',
        notFound: 'Resource not found',
        serverError: 'Server error',
        timeout: 'Request timed out',
        fileUpload: 'File upload failed',
        configuration: 'Configuration error'
      };
      
      return titles[this.errorType] || titles.generic;
    },

    errorDescription() {
      if (this.description) return this.description;
      
      const descriptions = {
        generic: 'Something went wrong. Please try again.',
        network: 'Unable to connect to the server. Please check your internet connection.',
        auth: 'Your session has expired or you don\'t have permission to perform this action.',
        validation: 'Please check the form for errors and try again.',
        permission: 'You don\'t have the necessary permissions to perform this action.',
        notFound: 'The requested resource could not be found.',
        serverError: 'The server encountered an error. Please try again later.',
        timeout: 'The request took too long to complete. Please try again.',
        fileUpload: 'The file could not be uploaded. Please check the file and try again.',
        configuration: 'There\'s an issue with the configuration. Please check your settings.'
      };
      
      return descriptions[this.errorType] || descriptions.generic;
    },

    errorDetailsList() {
      if (!this.errorDetails) return [];
      if (Array.isArray(this.errorDetails)) return this.errorDetails;
      return [this.errorDetails];
    }
  }
};
</script>

<style lang="scss" scoped>
.workflow-error-state {
  background-color: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  text-align: center;
  
  &--error {
    border-color: var(--error-color);
    
    .error-icon {
      color: var(--error-color);
    }
  }
  
  &--warning {
    border-color: var(--warning-color);
    
    .error-icon {
      color: var(--warning-color);
    }
  }
  
  &--info {
    border-color: var(--info-color);
    
    .error-icon {
      color: var(--info-color);
    }
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}

.error-content {
  max-width: 500px;
  margin: 0 auto var(--spacing-xl);
}

.error-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.error-description {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.error-details,
.error-suggestions {
  text-align: left;
  margin-top: var(--spacing-lg);
  
  h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1rem;
    color: var(--text-color);
  }
  
  ul {
    margin: 0;
    padding-left: var(--spacing-lg);
    
    li {
      margin-bottom: var(--spacing-xs);
      color: var(--text-color-secondary);
    }
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
  font-size: 0.875rem;
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
    }
  }
  
  &-link {
    background-color: transparent;
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

// Responsive
@media (max-width: 480px) {
  .workflow-error-state {
    padding: var(--spacing-lg);
  }
  
  .error-icon {
    font-size: 2.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    
    .btn {
      width: 100%;
    }
  }
}
</style>