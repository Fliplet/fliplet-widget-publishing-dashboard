<template>
  <div class="benefits-checklist">
    <div
      v-for="(benefit, index) in benefits"
      :key="index"
      class="benefit-item"
    >
      <svg class="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#5c6ac4"/>
        <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>{{ benefit }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BenefitsChecklist',
  props: {
    benefits: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
.benefits-checklist {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.check-icon {
  flex-shrink: 0;
}

.benefit-item span {
  font-size: 15px;
  color: #374151;
}
</style>


