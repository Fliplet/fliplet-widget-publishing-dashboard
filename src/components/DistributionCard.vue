<template>
  <div class="distribution-card">
    <div class="icon-wrapper">
      <span class="icon">{{ icon }}</span>
    </div>
    <h4>{{ title }}</h4>
    <p>{{ description }}</p>
    <button class="show-more" @click="$emit('show-more')">
      Show more →
    </button>
  </div>
</template>

<script>
export default {
  name: 'DistributionCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  emits: ['show-more']
};
</script>

<style scoped>
.distribution-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.distribution-card:hover {
  border-color: #5c6ac4;
  box-shadow: 0 4px 12px rgba(92, 106, 196, 0.1);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background-color: #eef2ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.icon {
  font-size: 24px;
}

.distribution-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.distribution-card p {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.show-more {
  background: none;
  border: none;
  color: #5c6ac4;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.show-more:hover {
  color: #4c5ab4;
}
</style>












