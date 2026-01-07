<template>
  <div class="step-detail-panel">
    <!-- Step Header -->
    <div class="step-header">
      <div class="step-title-row">
        <h2>{{ step.name }}</h2>
        <span class="status-badge" :class="step.status">
          {{ getStatusLabel(step.status) }}
        </span>
      </div>
      <p v-if="step.description" class="step-description">
        {{ step.description }}
      </p>
    </div>

    <!-- Error Card (shown when step failed) -->
    <div v-if="step.status === 'failed' && step.error" class="error-card">
      <div class="error-header">
        <svg class="error-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 6v4M10 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h3>{{ step.error.title || 'Error occurred' }}</h3>
      </div>
      <p class="error-message">{{ step.error.message }}</p>
      <div v-if="step.error.resolution" class="error-resolution">
        <strong>How to fix:</strong>
        <p>{{ step.error.resolution }}</p>
      </div>
      <button v-if="step.error.retryable" class="btn-retry" @click="$emit('retry-step')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 8A6 6 0 1 1 2 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M2 4v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Retry Step
      </button>
    </div>

    <!-- Waiting for User Action Banner -->
    <div v-if="step.status === 'waiting'" class="waiting-banner">
      <svg class="info-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 10h4M10 6v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <div>
        <strong>Action needed</strong>
        <span>Please complete the form below to continue.</span>
      </div>
    </div>

    <!-- Main Content Area (slot for custom step content) -->
    <div class="step-content">
      <slot name="content">
        <!-- Default content if no slot provided -->
        <div v-if="step.status === 'in-progress'" class="progress-indicator">
          <div class="progress-spinner">
            <svg class="spinner" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
              <path d="M20 2a18 18 0 0118 18" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
          <p>Processing...</p>
        </div>
        <div v-else-if="step.status === 'completed'" class="completion-message">
          <svg class="success-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="#10b981"/>
            <path d="M16 24l8 8 12-12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>Step completed successfully</h3>
          <p v-if="step.output">{{ step.output }}</p>
        </div>
      </slot>
    </div>

    <!-- Progress Bar (if applicable) -->
    <div v-if="step.progress !== undefined && step.status === 'in-progress'" class="progress-bar-container">
      <div class="progress-bar-header">
        <span class="progress-label">Progress</span>
        <span class="progress-percentage">{{ step.progress }}%</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: step.progress + '%' }"></div>
      </div>
    </div>

    <!-- Logs Section (collapsible) -->
    <div v-if="step.logs && step.logs.length > 0" class="logs-section">
      <button class="logs-toggle" @click="logsExpanded = !logsExpanded">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          :class="{ rotated: logsExpanded }"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>View logs ({{ step.logs.length }})</span>
      </button>
      <transition name="expand">
        <div v-if="logsExpanded" class="logs-content">
          <div
            v-for="(log, index) in step.logs"
            :key="index"
            class="log-entry"
            :class="log.level"
          >
            <span class="log-timestamp">{{ formatLogTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </transition>
    </div>

    <!-- Output Summary (for completed steps) -->
    <div v-if="step.status === 'completed' && step.summary" class="output-summary">
      <h3>Summary</h3>
      <div class="summary-grid">
        <div
          v-for="(item, key) in step.summary"
          :key="key"
          class="summary-item"
        >
          <span class="summary-label">{{ formatLabel(key) }}</span>
          <span class="summary-value">{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepDetailPanel',
  props: {
    step: {
      type: Object,
      required: true,
      // Expected structure:
      // {
      //   name: string,
      //   status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'waiting',
      //   description?: string,
      //   progress?: number,
      //   error?: { title, message, resolution, retryable },
      //   logs?: [{ timestamp, message, level }],
      //   output?: string,
      //   summary?: { key: value }
      // }
    }
  },
  emits: ['retry-step'],
  data() {
    return {
      logsExpanded: false
    };
  },
  methods: {
    getStatusLabel(status) {
      const labels = {
        'pending': 'Not Started',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'failed': 'Failed',
        'waiting': 'Action Needed'
      };
      return labels[status] || status;
    },
    formatLogTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },
    formatLabel(key) {
      // Convert camelCase or snake_case to Title Case
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
  }
};
</script>

<style scoped>
.step-detail-panel {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  min-height: 400px;
}

/* Step Header */
.step-header {
  margin-bottom: 24px;
}

.step-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.step-title-row h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.pending {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge.in-progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.waiting {
  background-color: #fef3c7;
  color: #92400e;
}

.step-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Error Card */
.error-card {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.error-icon {
  color: #dc2626;
  flex-shrink: 0;
}

.error-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #991b1b;
  margin: 0;
}

.error-message {
  font-size: 14px;
  color: #7f1d1d;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.error-resolution {
  background-color: #fff;
  border-left: 3px solid #f59e0b;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.error-resolution strong {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  display: block;
  margin-bottom: 4px;
}

.error-resolution p {
  font-size: 13px;
  color: #78350f;
  line-height: 1.5;
  margin: 0;
}

.btn-retry {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background-color: #b91c1c;
}

/* Waiting Banner */
.waiting-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-icon {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.waiting-banner strong {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  display: block;
  margin-bottom: 4px;
}

.waiting-banner span {
  font-size: 13px;
  color: #78350f;
}

/* Step Content */
.step-content {
  margin-bottom: 24px;
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.progress-spinner {
  margin-bottom: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
  color: #5c6ac4;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.progress-indicator p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.completion-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  text-align: center;
}

.success-icon {
  margin-bottom: 16px;
}

.completion-message h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.completion-message p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Progress Bar */
.progress-bar-container {
  margin-bottom: 24px;
}

.progress-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.progress-percentage {
  font-size: 13px;
  font-weight: 600;
  color: #5c6ac4;
}

.progress-bar-track {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #5c6ac4;
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* Logs Section */
.logs-section {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.logs-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background-color: #f9fafb;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: background-color 0.2s;
}

.logs-toggle:hover {
  background-color: #f3f4f6;
}

.logs-toggle svg {
  transition: transform 0.2s;
  color: #6b7280;
}

.logs-toggle svg.rotated {
  transform: rotate(180deg);
}

.logs-content {
  max-height: 300px;
  overflow-y: auto;
  background-color: #1f2937;
  padding: 12px;
}

.log-entry {
  display: flex;
  gap: 12px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  padding: 4px 0;
  color: #d1d5db;
}

.log-timestamp {
  color: #9ca3af;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-entry.error .log-message {
  color: #fca5a5;
}

.log-entry.warning .log-message {
  color: #fcd34d;
}

.log-entry.info .log-message {
  color: #93c5fd;
}

/* Output Summary */
.output-summary {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.output-summary h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
  opacity: 1;
}
</style>








