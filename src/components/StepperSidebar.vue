<template>
  <div class="stepper-sidebar">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="step-item"
      :class="{ 
        active: step.status === 'in-progress' || step.status === 'waiting',
        completed: step.status === 'completed',
        failed: step.status === 'failed',
        clickable: allowNavigation
      }"
      @click="handleStepClick(step, index)"
    >
      <!-- Step Number / Status Icon -->
      <div class="step-icon-wrapper">
        <div v-if="step.status === 'pending'" class="step-number">
          {{ index + 1 }}
        </div>
        <div v-else-if="step.status === 'in-progress'" class="step-icon spinner">
          <svg class="spinner-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <div v-else-if="step.status === 'completed'" class="step-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#10b981"/>
            <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div v-else-if="step.status === 'failed'" class="step-icon error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#ef4444"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div v-else-if="step.status === 'waiting'" class="step-icon waiting">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#f59e0b"/>
            <path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <div class="step-name">{{ step.name }}</div>
        <div v-if="step.timestamp || step.duration" class="step-meta">
          <span v-if="step.duration" class="duration">{{ step.duration }}</span>
          <span v-if="step.timestamp" class="timestamp">{{ formatTimestamp(step.timestamp) }}</span>
        </div>
      </div>

      <!-- Connector Line -->
      <div v-if="index < steps.length - 1" class="step-connector" :class="step.status"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepperSidebar',
  props: {
    steps: {
      type: Array,
      required: true,
      // Each step should have: { id, name, status, timestamp?, duration? }
      // status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'waiting'
    },
    allowNavigation: {
      type: Boolean,
      default: false
    }
  },
  emits: ['step-click'],
  methods: {
    handleStepClick(step, index) {
      if (this.allowNavigation) {
        this.$emit('step-click', { step, index });
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.stepper-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 24px 0;
}

.step-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  transition: all 0.2s;
  border-radius: 8px;
}

.step-item.clickable {
  cursor: pointer;
}

.step-item.clickable:hover {
  background-color: #f9fafb;
}

.step-item.active {
  background-color: #eef2ff;
}

.step-icon-wrapper {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon.spinner .spinner-svg {
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

.step-content {
  flex: 1;
  min-width: 0;
}

.step-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 4px;
}

.step-item.pending .step-name {
  color: #9ca3af;
}

.step-item.active .step-name {
  color: #5c6ac4;
}

.step-item.failed .step-name {
  color: #ef4444;
}

.step-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.duration {
  font-weight: 500;
}

.timestamp {
  color: #9ca3af;
}

/* Connector Line */
.step-connector {
  position: absolute;
  left: 31px;
  top: 40px;
  bottom: -16px;
  width: 2px;
  background-color: #e5e7eb;
  z-index: 1;
}

.step-connector.completed {
  background-color: #10b981;
}

.step-connector.in-progress,
.step-connector.waiting {
  background: linear-gradient(to bottom, #10b981 0%, #e5e7eb 100%);
}

.step-connector.failed {
  background: linear-gradient(to bottom, #10b981 0%, #ef4444 50%, #e5e7eb 100%);
}
</style>








