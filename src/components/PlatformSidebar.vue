<template>
  <div class="platform-sidebar">
    <div class="sidebar-header">
      <h3>Platform</h3>
    </div>
    <nav class="platform-nav">
      <button
        class="platform-item"
        :class="{ active: activePlatform === 'ios' }"
        @click="$emit('platform-change', 'ios')"
      >
        <svg class="platform-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        <span>iOS</span>
      </button>
      <button
        class="platform-item"
        :class="{ active: activePlatform === 'android' }"
        @click="$emit('platform-change', 'android')"
      >
        <svg class="platform-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.5 11.5 0 00-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.4 11.06 3 13.77 3 16.86h18c0-3.09-1.4-5.8-3.4-7.38zM8.5 15a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
        <span>Android</span>
      </button>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'PlatformSidebar',
  props: {
    activePlatform: {
      type: String,
      default: 'ios'
    }
  },
  emits: ['platform-change']
};
</script>

<style scoped>
.platform-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 32px 16px;
}

.sidebar-header h3 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 16px 16px;
  letter-spacing: 0.05em;
}

.platform-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
}

.platform-item:hover {
  background-color: #f3f4f6;
}

.platform-item.active {
  background-color: #eef2ff;
  color: #5c6ac4;
}

.platform-icon {
  width: 24px;
  height: 24px;
}
</style>












