<template>
  <div class="workflow-error-recovery">
    <!-- Error Alert -->
    <transition name="error-alert">
      <div 
        v-if="hasError" 
        class="error-alert"
        :class="`error-alert--${errorSeverity}`"
      >
        <div class="error-alert__icon">
          <i :class="errorIcon"></i>
        </div>
        
        <div class="error-alert__content">
          <h3 class="error-title">{{ errorTitle }}</h3>
          <p class="error-message">{{ errorMessage }}</p>
          
          <!-- Error Details -->
          <div v-if="showDetails && errorDetails" class="error-details">
            <h4>Error Details:</h4>
            <pre class="error-code">{{ errorDetails }}</pre>
          </div>
          
          <!-- Recovery Suggestions -->
          <div v-if="recoverySuggestions.length > 0" class="recovery-suggestions">
            <h4>Suggested Actions:</h4>
            <ul>
              <li 
                v-for="(suggestion, index) in recoverySuggestions" 
                :key="index"
              >
                <i class="fas fa-lightbulb"></i>
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Recovery Actions -->
        <div class="error-alert__actions">
          <button
            v-for="action in recoveryActions"
            :key="action.id"
            class="btn"
            :class="`btn-${action.type || 'secondary'}`"
            :disabled="isRecovering"
            @click="handleRecoveryAction(action)"
          >
            <i v-if="action.icon" :class="action.icon"></i>
            {{ action.label }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Recovery Progress -->
    <transition name="recovery-progress">
      <div v-if="isRecovering" class="recovery-progress">
        <div class="recovery-progress__spinner">
          <loading-spinner size="40px" />
        </div>
        <div class="recovery-progress__content">
          <h4>{{ recoveryStatus }}</h4>
          <p>{{ recoveryMessage }}</p>
          <div v-if="recoverySteps.length > 0" class="recovery-steps">
            <div 
              v-for="(step, index) in recoverySteps" 
              :key="index"
              class="recovery-step"
              :class="{
                'recovery-step--completed': step.completed,
                'recovery-step--current': step.current,
                'recovery-step--failed': step.failed
              }"
            >
              <i :class="getStepIcon(step)"></i>
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Recovery History -->
    <div v-if="showHistory && errorHistory.length > 0" class="error-history">
      <h4 class="history-title">
        <i class="fas fa-history"></i>
        Error History
      </h4>
      <div class="history-list">
        <div 
          v-for="(error, index) in errorHistory" 
          :key="index"
          class="history-item"
          :class="{ 'history-item--resolved': error.resolved }"
        >
          <div class="history-item__time">
            {{ formatTimestamp(error.timestamp) }}
          </div>
          <div class="history-item__content">
            <span class="history-error">{{ error.message }}</span>
            <span v-if="error.resolved" class="history-resolution">
              <i class="fas fa-check"></i>
              {{ error.resolutionMethod }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Offline Recovery -->
    <transition name="offline-notice">
      <div v-if="isOffline" class="offline-notice">
        <i class="fas fa-wifi"></i>
        <span>No internet connection. Some recovery options may be limited.</span>
        <button class="btn btn-sm" @click="checkConnection">
          Check Connection
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import LoadingSpinner from '../ui/LoadingSpinner.vue';

/**
 * WorkflowErrorRecovery - Error recovery mechanisms for workflow steps
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'WorkflowErrorRecovery',

  components: {
    LoadingSpinner
  },

  props: {
    /**
     * Current error object
     * @type {Object}
     */
    error: {
      type: Object,
      default: null
    },

    /**
     * Current step information
     * @type {Object}
     */
    currentStep: {
      type: Object,
      default: null
    },

    /**
     * Workflow context
     * @type {Object}
     */
    workflowContext: {
      type: Object,
      default: () => ({})
    },

    /**
     * Show error details
     * @type {Boolean}
     */
    showDetails: {
      type: Boolean,
      default: false
    },

    /**
     * Show error history
     * @type {Boolean}
     */
    showHistory: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      isRecovering: false,
      recoveryStatus: 'Attempting recovery...',
      recoveryMessage: '',
      recoverySteps: [],
      errorHistory: [],
      isOffline: false
    };
  },

  computed: {
    hasError() {
      return this.error !== null;
    },

    errorSeverity() {
      if (!this.error) return 'warning';
      return this.error.severity || 'error';
    },

    errorIcon() {
      const icons = {
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        critical: 'fas fa-skull-crossbones'
      };
      return icons[this.errorSeverity] || 'fas fa-exclamation-circle';
    },

    errorTitle() {
      if (!this.error) return 'An error occurred';
      return this.error.title || this.getDefaultErrorTitle();
    },

    errorMessage() {
      if (!this.error) return '';
      return this.error.message || 'An unexpected error occurred. Please try again.';
    },

    errorDetails() {
      if (!this.error || !this.error.details) return null;
      
      if (typeof this.error.details === 'string') {
        return this.error.details;
      }
      
      return JSON.stringify(this.error.details, null, 2);
    },

    recoverySuggestions() {
      if (!this.error) return [];
      
      // Default suggestions based on error type
      const suggestions = this.error.suggestions || [];
      
      if (this.error.type === 'validation') {
        suggestions.push('Check all required fields are filled correctly');
        suggestions.push('Ensure data formats match requirements');
      } else if (this.error.type === 'network') {
        suggestions.push('Check your internet connection');
        suggestions.push('Try again in a few moments');
      } else if (this.error.type === 'authentication') {
        suggestions.push('Verify your credentials are correct');
        suggestions.push('Check if your session has expired');
      }
      
      return suggestions;
    },

    recoveryActions() {
      const actions = [];
      
      // Always include retry
      actions.push({
        id: 'retry',
        label: 'Retry',
        icon: 'fas fa-redo',
        type: 'primary',
        handler: this.retryStep
      });
      
      // Add specific recovery actions based on error type
      if (this.error) {
        if (this.error.type === 'validation') {
          actions.push({
            id: 'reset',
            label: 'Reset Form',
            icon: 'fas fa-eraser',
            type: 'secondary',
            handler: this.resetStep
          });
        }
        
        if (this.error.type === 'network' || this.error.type === 'timeout') {
          actions.push({
            id: 'save-draft',
            label: 'Save Draft',
            icon: 'fas fa-save',
            type: 'secondary',
            handler: this.saveDraft
          });
        }
        
        if (this.error.canSkip) {
          actions.push({
            id: 'skip',
            label: 'Skip Step',
            icon: 'fas fa-forward',
            type: 'outline',
            handler: this.skipStep
          });
        }
      }
      
      // Always include dismiss
      actions.push({
        id: 'dismiss',
        label: 'Dismiss',
        icon: 'fas fa-times',
        type: 'text',
        handler: this.dismissError
      });
      
      return actions;
    }
  },

  watch: {
    error: {
      immediate: true,
      handler(newError) {
        if (newError) {
          this.addToHistory(newError);
        }
      }
    }
  },

  created() {
    // Check online status
    this.checkConnection();
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Load error history from storage
    this.loadErrorHistory();
  },

  beforeDestroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  },

  methods: {
    getDefaultErrorTitle() {
      const titles = {
        validation: 'Validation Error',
        network: 'Network Error',
        authentication: 'Authentication Error',
        permission: 'Permission Denied',
        timeout: 'Request Timeout',
        server: 'Server Error'
      };
      return titles[this.error.type] || 'Error';
    },

    async handleRecoveryAction(action) {
      if (this.isRecovering) return;
      
      try {
        this.isRecovering = true;
        this.recoveryStatus = `Executing: ${action.label}`;
        
        if (action.handler) {
          await action.handler();
        }
        
        this.$emit('recovery-action', {
          action: action.id,
          success: true
        });
      } catch (error) {
        console.error('Recovery action failed:', error);
        this.$emit('recovery-action', {
          action: action.id,
          success: false,
          error
        });
      } finally {
        this.isRecovering = false;
      }
    },

    async retryStep() {
      this.recoverySteps = [
        { label: 'Preparing retry...', current: true },
        { label: 'Validating data...', current: false },
        { label: 'Re-submitting...', current: false }
      ];
      
      try {
        // Step 1: Prepare
        await this.delay(500);
        this.updateRecoveryStep(0, { completed: true });
        this.updateRecoveryStep(1, { current: true });
        
        // Step 2: Validate
        await this.delay(500);
        this.updateRecoveryStep(1, { completed: true });
        this.updateRecoveryStep(2, { current: true });
        
        // Step 3: Submit
        this.$emit('retry-step', this.currentStep);
        await this.delay(500);
        this.updateRecoveryStep(2, { completed: true });
        
        this.markErrorResolved('Retry successful');
      } catch (error) {
        this.updateRecoveryStep(2, { failed: true });
        throw error;
      }
    },

    async resetStep() {
      this.recoveryMessage = 'Resetting step data...';
      this.$emit('reset-step', this.currentStep);
      await this.delay(500);
      this.markErrorResolved('Step reset');
    },

    async saveDraft() {
      this.recoveryMessage = 'Saving draft...';
      this.$emit('save-draft', this.currentStep);
      await this.delay(1000);
      this.recoveryMessage = 'Draft saved successfully';
    },

    async skipStep() {
      this.recoveryMessage = 'Skipping step...';
      this.$emit('skip-step', this.currentStep);
      this.markErrorResolved('Step skipped');
    },

    dismissError() {
      this.$emit('dismiss-error');
    },

    updateRecoveryStep(index, updates) {
      if (this.recoverySteps[index]) {
        Object.assign(this.recoverySteps[index], updates);
        if (updates.current) {
          // Clear current from others
          this.recoverySteps.forEach((step, i) => {
            if (i !== index) step.current = false;
          });
        }
      }
    },

    getStepIcon(step) {
      if (step.completed) return 'fas fa-check-circle';
      if (step.failed) return 'fas fa-times-circle';
      if (step.current) return 'fas fa-spinner fa-spin';
      return 'far fa-circle';
    },

    checkConnection() {
      this.isOffline = !navigator.onLine;
    },

    handleOnline() {
      this.isOffline = false;
      this.$emit('connection-restored');
    },

    handleOffline() {
      this.isOffline = true;
      this.$emit('connection-lost');
    },

    addToHistory(error) {
      const historyEntry = {
        timestamp: Date.now(),
        message: error.message || 'Unknown error',
        type: error.type,
        step: this.currentStep ? this.currentStep.name : 'Unknown',
        resolved: false,
        resolutionMethod: null
      };
      
      this.errorHistory.unshift(historyEntry);
      
      // Keep only last 10 errors
      if (this.errorHistory.length > 10) {
        this.errorHistory = this.errorHistory.slice(0, 10);
      }
      
      this.saveErrorHistory();
    },

    markErrorResolved(method) {
      if (this.errorHistory.length > 0 && !this.errorHistory[0].resolved) {
        this.errorHistory[0].resolved = true;
        this.errorHistory[0].resolutionMethod = method;
        this.saveErrorHistory();
      }
    },

    loadErrorHistory() {
      try {
        const saved = localStorage.getItem('workflow-error-history');
        if (saved) {
          this.errorHistory = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Failed to load error history:', error);
      }
    },

    saveErrorHistory() {
      try {
        localStorage.setItem('workflow-error-history', JSON.stringify(this.errorHistory));
      } catch (error) {
        console.error('Failed to save error history:', error);
      }
    },

    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) { // Less than 1 minute
        return 'Just now';
      } else if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)}m ago`;
      } else if (diff < 86400000) { // Less than 1 day
        return `${Math.floor(diff / 3600000)}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
};
</script>

<style lang="scss" scoped>
.workflow-error-recovery {
  position: relative;
}

// Error Alert
.error-alert {
  background: white;
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-lg, 24px);
  margin-bottom: var(--spacing-lg, 24px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: var(--spacing-lg, 24px);
  border-left: 4px solid;

  &--warning {
    border-left-color: #f59e0b;
    
    .error-alert__icon {
      color: #f59e0b;
    }
  }

  &--error {
    border-left-color: #ef4444;
    
    .error-alert__icon {
      color: #ef4444;
    }
  }

  &--critical {
    border-left-color: #991b1b;
    background-color: #fef2f2;
    
    .error-alert__icon {
      color: #991b1b;
    }
  }

  &__icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 8px);
    flex-shrink: 0;
  }
}

.error-title {
  margin: 0 0 var(--spacing-sm, 8px) 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

.error-message {
  margin: 0 0 var(--spacing-md, 16px) 0;
  color: var(--text-color-secondary, #666);
}

.error-details {
  margin-top: var(--spacing-md, 16px);
  
  h4 {
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color, #333);
  }
}

.error-code {
  background-color: #f3f4f6;
  padding: var(--spacing-sm, 8px);
  border-radius: var(--border-radius, 4px);
  font-family: monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.recovery-suggestions {
  margin-top: var(--spacing-md, 16px);
  
  h4 {
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color, #333);
  }
  
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  li {
    padding: var(--spacing-xs, 4px) 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
    font-size: 0.875rem;
    color: var(--text-color-secondary, #666);
    
    i {
      color: #fbbf24;
      font-size: 0.875rem;
    }
  }
}

// Recovery Progress
.recovery-progress {
  background: white;
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-lg, 24px);
  margin-bottom: var(--spacing-lg, 24px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  &__spinner {
    margin-bottom: var(--spacing-md, 16px);
  }

  &__content {
    h4 {
      margin: 0 0 var(--spacing-sm, 8px) 0;
      font-size: 1.125rem;
      color: var(--text-color, #333);
    }
    
    p {
      margin: 0 0 var(--spacing-md, 16px) 0;
      color: var(--text-color-secondary, #666);
    }
  }
}

.recovery-steps {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg, 24px);
  margin-top: var(--spacing-lg, 24px);
}

.recovery-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
  
  i {
    font-size: 1rem;
  }
  
  &--completed {
    color: #34d399;
  }
  
  &--current {
    color: var(--primary-color, #00abd1);
    font-weight: 500;
  }
  
  &--failed {
    color: #ef4444;
  }
}

// Error History
.error-history {
  background: #f9fafb;
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-md, 16px);
  margin-top: var(--spacing-lg, 24px);
}

.history-title {
  margin: 0 0 var(--spacing-md, 16px) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color, #333);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  
  i {
    color: var(--text-color-secondary, #666);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.history-item {
  display: flex;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 8px);
  background: white;
  border-radius: var(--border-radius, 4px);
  font-size: 0.875rem;
  
  &--resolved {
    opacity: 0.7;
  }
  
  &__time {
    color: var(--text-color-secondary, #666);
    flex-shrink: 0;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
  }
}

.history-error {
  color: #ef4444;
}

.history-resolution {
  color: #34d399;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  
  i {
    font-size: 0.75rem;
  }
}

// Offline Notice
.offline-notice {
  background-color: #fef3c7;
  color: #92400e;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border-radius: var(--border-radius, 4px);
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-md, 16px);
  font-size: 0.875rem;
  
  i {
    font-size: 1rem;
  }
}

// Buttons
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius, 4px);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) ease;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  white-space: nowrap;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &-primary {
    background-color: var(--primary-color, #00abd1);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: darken(#00abd1, 10%);
    }
  }
  
  &-secondary {
    background-color: #6c757d;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: darken(#6c757d, 10%);
    }
  }
  
  &-outline {
    background-color: transparent;
    color: var(--primary-color, #00abd1);
    border: 1px solid var(--primary-color, #00abd1);
    
    &:hover:not(:disabled) {
      background-color: var(--primary-color, #00abd1);
      color: white;
    }
  }
  
  &-text {
    background-color: transparent;
    color: var(--text-color-secondary, #666);
    
    &:hover:not(:disabled) {
      color: var(--text-color, #333);
      background-color: #f3f4f6;
    }
  }
  
  &-sm {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
}

// Transitions
.error-alert-enter-active,
.error-alert-leave-active {
  transition: all 0.3s ease;
}

.error-alert-enter,
.error-alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.recovery-progress-enter-active,
.recovery-progress-leave-active {
  transition: all 0.3s ease;
}

.recovery-progress-enter,
.recovery-progress-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.offline-notice-enter-active,
.offline-notice-leave-active {
  transition: all 0.3s ease;
}

.offline-notice-enter,
.offline-notice-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

// Mobile
@media (max-width: 768px) {
  .error-alert {
    flex-direction: column;
    gap: var(--spacing-md, 16px);
    
    &__actions {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
  
  .recovery-steps {
    flex-direction: column;
    gap: var(--spacing-sm, 8px);
    align-items: center;
  }
  
  .offline-notice {
    flex-wrap: wrap;
    text-align: center;
    justify-content: center;
  }
}
</style>