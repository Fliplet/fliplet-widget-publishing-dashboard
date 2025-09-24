<template>
  <div class="step-completion-tracker">
    <!-- Completion Summary -->
    <div class="completion-summary">
      <div class="summary-header">
        <h3 class="summary-title">Workflow Progress</h3>
        <span class="summary-percentage">{{ completionPercentage }}%</span>
      </div>
      
      <!-- Overall Progress -->
      <div class="overall-progress">
        <div class="progress-bar">
          <div 
            class="progress-bar__fill"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <div class="progress-stats">
          <span class="stat">
            <i class="fas fa-check-circle"></i>
            {{ completedSteps.length }} Completed
          </span>
          <span class="stat">
            <i class="fas fa-clock"></i>
            {{ pendingSteps.length }} Pending
          </span>
          <span v-if="failedSteps.length > 0" class="stat stat--error">
            <i class="fas fa-exclamation-circle"></i>
            {{ failedSteps.length }} Failed
          </span>
        </div>
      </div>
    </div>

    <!-- Step Details -->
    <div class="step-details">
      <transition-group name="step-list" tag="div" class="step-list">
        <div
          v-for="(step, index) in steps"
          :key="step.id || index"
          class="step-item"
          :class="getStepItemClasses(step)"
          @click="$emit('step-select', step, index)"
        >
          <!-- Step Status Icon -->
          <div class="step-item__icon">
            <transition name="icon-change" mode="out-in">
              <i 
                v-if="isCompleted(step)"
                key="completed"
                class="fas fa-check-circle"
              ></i>
              <i 
                v-else-if="isFailed(step)"
                key="failed"
                class="fas fa-times-circle"
              ></i>
              <i 
                v-else-if="isInProgress(step)"
                key="progress"
                class="fas fa-sync-alt fa-spin"
              ></i>
              <i 
                v-else-if="isSkipped(step)"
                key="skipped"
                class="fas fa-forward"
              ></i>
              <span 
                v-else
                key="pending"
                class="step-number"
              >
                {{ index + 1 }}
              </span>
            </transition>
          </div>

          <!-- Step Info -->
          <div class="step-item__content">
            <h4 class="step-name">{{ step.label || step.name }}</h4>
            <p v-if="step.description" class="step-description">
              {{ step.description }}
            </p>
            
            <!-- Step Metadata -->
            <div v-if="getStepMetadata(step)" class="step-metadata">
              <span v-if="getCompletionTime(step)" class="meta-item">
                <i class="fas fa-calendar-check"></i>
                {{ formatCompletionTime(getCompletionTime(step)) }}
              </span>
              <span v-if="getDuration(step)" class="meta-item">
                <i class="fas fa-stopwatch"></i>
                {{ formatDuration(getDuration(step)) }}
              </span>
              <span v-if="getAttempts(step) > 1" class="meta-item">
                <i class="fas fa-redo"></i>
                {{ getAttempts(step) }} attempts
              </span>
            </div>

            <!-- Validation Errors -->
            <div v-if="getStepErrors(step).length > 0" class="step-errors">
              <p 
                v-for="(error, errorIndex) in getStepErrors(step)"
                :key="errorIndex"
                class="error-message"
              >
                <i class="fas fa-exclamation-triangle"></i>
                {{ error }}
              </p>
            </div>
          </div>

          <!-- Step Actions -->
          <div class="step-item__actions">
            <button
              v-if="canRetry(step)"
              class="btn-icon"
              title="Retry this step"
              @click.stop="$emit('retry-step', step, index)"
            >
              <i class="fas fa-redo"></i>
            </button>
            <button
              v-if="canViewDetails(step)"
              class="btn-icon"
              title="View details"
              @click.stop="$emit('view-details', step, index)"
            >
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Completion Actions -->
    <div v-if="isWorkflowComplete" class="completion-actions">
      <div class="completion-message">
        <i class="fas fa-check-circle"></i>
        <h3>Workflow Complete!</h3>
        <p>All required steps have been successfully completed.</p>
      </div>
      <div class="action-buttons">
        <button 
          class="btn btn-primary"
          @click="$emit('submit-workflow')"
        >
          Submit for Review
        </button>
        <button 
          class="btn btn-secondary"
          @click="$emit('download-summary')"
        >
          <i class="fas fa-download"></i>
          Download Summary
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * StepCompletionTracker - Tracks and displays workflow step completion status
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'StepCompletionTracker',

  props: {
    /**
     * Workflow steps array
     * @type {Array}
     */
    steps: {
      type: Array,
      required: true
    },

    /**
     * Step data with completion info
     * @type {Object}
     */
    stepData: {
      type: Object,
      default: () => ({})
    },

    /**
     * Current step index
     * @type {Number}
     */
    currentStepIndex: {
      type: Number,
      default: 0
    },

    /**
     * Show detailed metadata
     * @type {Boolean}
     */
    showMetadata: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    completedSteps() {
      return this.steps.filter(step => this.isCompleted(step));
    },

    pendingSteps() {
      return this.steps.filter(step => this.isPending(step));
    },

    failedSteps() {
      return this.steps.filter(step => this.isFailed(step));
    },

    skippedSteps() {
      return this.steps.filter(step => this.isSkipped(step));
    },

    completionPercentage() {
      if (this.steps.length === 0) return 0;
      
      // Count completed and skipped (optional) steps
      const progressSteps = this.steps.filter(step => 
        this.isCompleted(step) || (this.isSkipped(step) && !step.required)
      );
      
      return Math.round((progressSteps.length / this.steps.length) * 100);
    },

    isWorkflowComplete() {
      // All required steps must be completed
      const requiredSteps = this.steps.filter(step => step.required !== false);
      return requiredSteps.every(step => this.isCompleted(step));
    }
  },

  methods: {
    getStepData(step) {
      return this.stepData[step.name] || {};
    },

    getStepItemClasses(step) {
      const data = this.getStepData(step);
      const index = this.steps.indexOf(step);
      
      return {
        'step-item--completed': this.isCompleted(step),
        'step-item--failed': this.isFailed(step),
        'step-item--in-progress': this.isInProgress(step),
        'step-item--skipped': this.isSkipped(step),
        'step-item--current': index === this.currentStepIndex,
        'step-item--clickable': this.canViewDetails(step)
      };
    },

    isCompleted(step) {
      const data = this.getStepData(step);
      return data.completed === true;
    },

    isFailed(step) {
      const data = this.getStepData(step);
      return data.failed === true || (data.errors && data.errors.length > 0);
    },

    isInProgress(step) {
      const data = this.getStepData(step);
      const index = this.steps.indexOf(step);
      return index === this.currentStepIndex && data.inProgress === true;
    },

    isSkipped(step) {
      const data = this.getStepData(step);
      return data.skipped === true;
    },

    isPending(step) {
      return !this.isCompleted(step) && 
             !this.isFailed(step) && 
             !this.isInProgress(step) && 
             !this.isSkipped(step);
    },

    getStepMetadata(step) {
      if (!this.showMetadata) return null;
      const data = this.getStepData(step);
      return data.metadata || null;
    },

    getCompletionTime(step) {
      const data = this.getStepData(step);
      return data.completedAt || data.completionTime || null;
    },

    getDuration(step) {
      const data = this.getStepData(step);
      if (data.startTime && data.endTime) {
        return data.endTime - data.startTime;
      }
      return data.duration || null;
    },

    getAttempts(step) {
      const data = this.getStepData(step);
      return data.attempts || 1;
    },

    getStepErrors(step) {
      const data = this.getStepData(step);
      return data.errors || [];
    },

    canRetry(step) {
      return this.isFailed(step) && step.retryable !== false;
    },

    canViewDetails(step) {
      const data = this.getStepData(step);
      return data.hasDetails || this.isCompleted(step) || this.isFailed(step);
    },

    formatCompletionTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // Less than a minute
      if (diff < 60000) {
        return 'Just now';
      }
      
      // Less than an hour
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      
      // Less than a day
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      
      // Format as date
      return date.toLocaleDateString();
    },

    formatDuration(milliseconds) {
      if (!milliseconds) return '';
      
      const seconds = Math.floor(milliseconds / 1000);
      
      if (seconds < 60) {
        return `${seconds}s`;
      }
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      if (minutes < 60) {
        return remainingSeconds > 0 
          ? `${minutes}m ${remainingSeconds}s`
          : `${minutes}m`;
      }
      
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
  }
};
</script>

<style lang="scss" scoped>
.step-completion-tracker {
  background: white;
  border-radius: var(--border-radius, 8px);
  padding: var(--spacing-lg, 24px);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

// Completion Summary
.completion-summary {
  margin-bottom: var(--spacing-xl, 32px);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md, 16px);
}

.summary-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

.summary-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #00abd1);
}

.overall-progress {
  margin-bottom: var(--spacing-md, 16px);
}

.progress-bar {
  height: 12px;
  background-color: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm, 8px);

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, 
      var(--primary-color, #00abd1) 0%, 
      lighten(#00abd1, 10%) 100%
    );
    transition: width 0.5s ease;
  }
}

.progress-stats {
  display: flex;
  gap: var(--spacing-lg, 24px);
  font-size: 0.875rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  color: var(--text-color-secondary, #666);

  i {
    color: #34d399;
  }

  &--error i {
    color: #ef4444;
  }
}

// Step Details
.step-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px);
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius, 6px);
  transition: all var(--transition-speed, 0.2s) ease;

  &--completed {
    background-color: #f0fdf4;
    border-color: #bbf7d0;

    .step-item__icon {
      color: #34d399;
    }
  }

  &--failed {
    background-color: #fef2f2;
    border-color: #fecaca;

    .step-item__icon {
      color: #ef4444;
    }
  }

  &--in-progress {
    background-color: #eff6ff;
    border-color: #bfdbfe;

    .step-item__icon {
      color: var(--primary-color, #00abd1);
    }
  }

  &--skipped {
    opacity: 0.7;

    .step-item__icon {
      color: #9ca3af;
    }
  }

  &--current {
    border-color: var(--primary-color, #00abd1);
    box-shadow: 0 0 0 2px rgba(0, 171, 209, 0.1);
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.25rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__actions {
    display: flex;
    gap: var(--spacing-sm, 8px);
  }
}

.step-number {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
}

.step-name {
  margin: 0 0 var(--spacing-xs, 4px) 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color, #333);
}

.step-description {
  margin: 0 0 var(--spacing-sm, 8px) 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
}

.step-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md, 16px);
  margin-top: var(--spacing-sm, 8px);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);

  i {
    font-size: 0.75rem;
  }
}

.step-errors {
  margin-top: var(--spacing-sm, 8px);
}

.error-message {
  margin: 0 0 var(--spacing-xs, 4px) 0;
  font-size: 0.875rem;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);

  i {
    font-size: 0.75rem;
  }
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius, 4px);
  background-color: white;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
    color: var(--text-color, #333);
  }
}

// Completion Actions
.completion-actions {
  margin-top: var(--spacing-xl, 32px);
  padding-top: var(--spacing-xl, 32px);
  border-top: 2px solid #e5e7eb;
  text-align: center;
}

.completion-message {
  margin-bottom: var(--spacing-lg, 24px);

  i {
    font-size: 3rem;
    color: #34d399;
    margin-bottom: var(--spacing-md, 16px);
    display: block;
  }

  h3 {
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-size: 1.5rem;
    color: var(--text-color, #333);
  }

  p {
    margin: 0;
    color: var(--text-color-secondary, #666);
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md, 16px);
}

// Buttons
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: 10px 24px;
  border: none;
  border-radius: var(--border-radius, 6px);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all var(--transition-speed, 0.2s) ease;

  &-primary {
    background-color: var(--primary-color, #00abd1);
    color: white;

    &:hover {
      background-color: darken(#00abd1, 10%);
    }
  }

  &-secondary {
    background-color: #6c757d;
    color: white;

    &:hover {
      background-color: darken(#6c757d, 10%);
    }
  }
}

// Transitions
.step-list-enter-active,
.step-list-leave-active {
  transition: all 0.3s ease;
}

.step-list-enter,
.step-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.step-list-move {
  transition: transform 0.3s ease;
}

.icon-change-enter-active,
.icon-change-leave-active {
  transition: all 0.2s ease;
}

.icon-change-enter,
.icon-change-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

// Mobile responsive
@media (max-width: 768px) {
  .step-completion-tracker {
    padding: var(--spacing-md, 16px);
  }

  .summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm, 8px);
  }

  .progress-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md, 16px);
  }

  .step-metadata {
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;

    .btn {
      width: 100%;
    }
  }
}
</style>