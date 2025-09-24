<template>
  <div 
    class="status-card"
    :class="cardClasses"
  >
    <!-- Status Icon -->
    <div class="status-card__icon-wrapper">
      <div class="status-card__icon" :class="`status-card__icon--${status}`">
        <i :class="statusIcon" aria-hidden="true"></i>
      </div>
      <div v-if="showProgress" class="status-card__progress-ring">
        <svg viewBox="0 0 36 36" class="circular-progress">
          <path
            class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="circle"
            :stroke-dasharray="`${progress}, 100`"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="status-card__content">
      <!-- Header -->
      <div class="status-card__header">
        <h3 class="status-card__title">{{ title }}</h3>
        <span v-if="badge" class="status-card__badge" :class="`status-card__badge--${badge.type}`">
          {{ badge.text }}
        </span>
      </div>

      <!-- Description -->
      <p v-if="description" class="status-card__description">
        {{ description }}
      </p>

      <!-- Metadata -->
      <div v-if="hasMetadata" class="status-card__metadata">
        <div v-if="submissionId" class="status-card__meta-item">
          <i class="fas fa-hashtag" aria-hidden="true"></i>
          <span>Submission ID: {{ submissionId }}</span>
        </div>
        <div v-if="timestamp" class="status-card__meta-item">
          <i class="fas fa-clock" aria-hidden="true"></i>
          <span>{{ formatTimestamp(timestamp) }}</span>
        </div>
        <div v-if="version" class="status-card__meta-item">
          <i class="fas fa-code-branch" aria-hidden="true"></i>
          <span>Version {{ version }}</span>
        </div>
        <div v-if="platform" class="status-card__meta-item">
          <i :class="platformIcon" aria-hidden="true"></i>
          <span>{{ platformName }}</span>
        </div>
      </div>

      <!-- Progress Details -->
      <div v-if="progressDetails" class="status-card__progress-details">
        <div class="progress-bar-wrapper">
          <div class="progress-bar">
            <div 
              class="progress-bar__fill" 
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
        <p v-if="progressDetails.message" class="progress-message">
          {{ progressDetails.message }}
        </p>
        <div v-if="progressDetails.steps" class="progress-steps">
          <span class="progress-step" v-for="(step, index) in progressDetails.steps" :key="index">
            <i 
              class="fas"
              :class="step.completed ? 'fa-check-circle' : 'fa-circle'"
              :style="{ color: step.completed ? 'var(--success-color)' : '#e5e7eb' }"
              aria-hidden="true"
            ></i>
            {{ step.label }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="hasActions" class="status-card__actions">
        <button
          v-for="action in actions"
          :key="action.id"
          class="btn"
          :class="`btn-${action.type || 'secondary'}`"
          :disabled="action.disabled"
          @click="handleAction(action)"
        >
          <i v-if="action.icon" :class="action.icon" aria-hidden="true"></i>
          {{ action.label }}
        </button>
      </div>

      <!-- Expandable Details -->
      <div v-if="hasDetails" class="status-card__expand">
        <button
          class="status-card__expand-btn"
          :aria-expanded="expanded ? 'true' : 'false'"
          @click="toggleExpanded"
        >
          <span>{{ expanded ? 'Hide' : 'Show' }} Details</span>
          <i class="fas fa-chevron-down" :class="{ 'rotated': expanded }" aria-hidden="true"></i>
        </button>

        <transition name="expand">
          <div v-if="expanded" class="status-card__details">
            <slot name="details">
              <pre v-if="details">{{ details }}</pre>
            </slot>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * StatusCard - Display submission status with visual indicators
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <StatusCard
 *   status="building"
 *   title="iOS App Building"
 *   description="Your app is being compiled and prepared for submission"
 *   :progress="65"
 *   :submission-id="12345"
 *   :actions="[{ id: 'cancel', label: 'Cancel Build', type: 'danger' }]"
 *   @action="handleCardAction"
 * />
 */
export default {
  name: 'StatusCard',

  props: {
    /**
     * Status type
     * @type {String}
     * @required
     */
    status: {
      type: String,
      required: true,
      validator: (value) => {
        return [
          'pending', 'processing', 'building', 'uploading',
          'completed', 'success', 'failed', 'error', 
          'cancelled', 'warning'
        ].includes(value);
      }
    },

    /**
     * Card title
     * @type {String}
     * @required
     */
    title: {
      type: String,
      required: true
    },

    /**
     * Card description
     * @type {String}
     */
    description: {
      type: String,
      default: ''
    },

    /**
     * Progress percentage (0-100)
     * @type {Number}
     */
    progress: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },

    /**
     * Submission ID
     * @type {[String, Number]}
     */
    submissionId: {
      type: [String, Number],
      default: null
    },

    /**
     * Timestamp
     * @type {[String, Date]}
     */
    timestamp: {
      type: [String, Date],
      default: null
    },

    /**
     * Version string
     * @type {String}
     */
    version: {
      type: String,
      default: ''
    },

    /**
     * Platform (ios/android)
     * @type {String}
     */
    platform: {
      type: String,
      default: '',
      validator: (value) => ['', 'ios', 'android'].includes(value)
    },

    /**
     * Badge object
     * @type {Object}
     */
    badge: {
      type: Object,
      default: null
    },

    /**
     * Progress details object
     * @type {Object}
     */
    progressDetails: {
      type: Object,
      default: null
    },

    /**
     * Action buttons array
     * @type {Array}
     */
    actions: {
      type: Array,
      default: () => []
    },

    /**
     * Expandable details
     * @type {[String, Object]}
     */
    details: {
      type: [String, Object],
      default: null
    },

    /**
     * Compact mode
     * @type {Boolean}
     */
    compact: {
      type: Boolean,
      default: false
    }
  },

  // Events: action

  data() {
    return {
      expanded: false
    };
  },

  computed: {
    cardClasses() {
      return {
        [`status-card--${this.status}`]: true,
        'status-card--compact': this.compact,
        'status-card--has-progress': this.showProgress,
        'status-card--expanded': this.expanded
      };
    },

    statusIcon() {
      const icons = {
        pending: 'fas fa-hourglass-half',
        processing: 'fas fa-cog fa-spin',
        building: 'fas fa-hammer',
        uploading: 'fas fa-cloud-upload-alt',
        completed: 'fas fa-check-circle',
        success: 'fas fa-check-circle',
        failed: 'fas fa-times-circle',
        error: 'fas fa-exclamation-circle',
        cancelled: 'fas fa-ban',
        warning: 'fas fa-exclamation-triangle'
      };
      return icons[this.status] || 'fas fa-info-circle';
    },

    showProgress() {
      return ['processing', 'building', 'uploading'].includes(this.status) && 
             this.progress > 0 && this.progress < 100;
    },

    hasMetadata() {
      return this.submissionId || this.timestamp || this.version || this.platform;
    },

    hasActions() {
      return this.actions && this.actions.length > 0;
    },

    hasDetails() {
      return this.details || this.$slots.details;
    },

    platformIcon() {
      return this.platform === 'ios' ? 'fab fa-apple' : 
             this.platform === 'android' ? 'fab fa-android' : 
             'fas fa-mobile-alt';
    },

    platformName() {
      return this.platform === 'ios' ? 'iOS' : 
             this.platform === 'android' ? 'Android' : 
             'Mobile';
    }
  },

  methods: {
    formatTimestamp(timestamp) {
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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    toggleExpanded() {
      this.expanded = !this.expanded;
    },

    handleAction(action) {
      if (!action.disabled) {
        this.$emit('action', action);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.status-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-lg);
  transition: all var(--transition-speed) ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__icon-wrapper {
    flex-shrink: 0;
    position: relative;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    position: relative;
    z-index: 2;

    &--pending {
      background-color: #6b7280;
    }

    &--processing,
    &--building,
    &--uploading {
      background-color: var(--info-color, #17a2b8);
    }

    &--completed,
    &--success {
      background-color: var(--success-color, #28a745);
    }

    &--failed,
    &--error {
      background-color: var(--error-color, #dc3545);
    }

    &--cancelled {
      background-color: #6b7280;
    }

    &--warning {
      background-color: var(--warning-color, #ffc107);
    }
  }

  &__progress-ring {
    position: absolute;
    top: -4px;
    left: -4px;
    width: 56px;
    height: 56px;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  &__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;

    &--info {
      background-color: #e0f2fe;
      color: #0369a1;
    }

    &--success {
      background-color: #d1fae5;
      color: #065f46;
    }

    &--warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    &--error {
      background-color: #fee2e2;
      color: #991b1b;
    }
  }

  &__description {
    color: var(--text-color-secondary);
    margin: 0 0 var(--spacing-md) 0;
  }

  &__metadata {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  &__meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--text-color-secondary);

    i {
      color: #9ca3af;
      font-size: 0.75rem;
    }
  }

  &__progress-details {
    margin-bottom: var(--spacing-md);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  &__expand {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid #e5e7eb;
  }

  &__expand-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: none;
    border: none;
    color: var(--primary-color);
    font-weight: 500;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    i {
      transition: transform var(--transition-speed) ease;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }

  &__details {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: #f9fafb;
    border-radius: var(--border-radius);

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.875rem;
      color: var(--text-color);
    }
  }

  // Compact mode
  &--compact {
    padding: var(--spacing-md);

    .status-card__icon {
      width: 36px;
      height: 36px;
      font-size: 1.125rem;
    }

    .status-card__title {
      font-size: 1rem;
    }

    .status-card__description {
      font-size: 0.875rem;
    }
  }
}

// Progress elements
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  min-width: 40px;
  text-align: right;
}

.progress-message {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: var(--spacing-xs) 0;
}

.progress-steps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.progress-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

// Circular progress
.circular-progress {
  display: block;
  margin: 0;
}

.circle-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 3.8;
  stroke-linecap: round;
  stroke-dasharray: 0, 100;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dasharray 0.3s ease;
}

// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  &-primary {
    background-color: var(--primary-color);
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

  &-danger {
    background-color: var(--error-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(#dc3545, 10%);
    }
  }
}

// Transitions
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

// Responsive
@media (max-width: 767px) {
  .status-card {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .status-card__metadata {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>