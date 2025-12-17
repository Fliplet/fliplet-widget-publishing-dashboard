<template>
  <div class="ios-publishing-container">
    <!-- Platform Sidebar -->
    <PlatformSidebar :active-platform="activePlatform" @platform-change="changePlatform" />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Top Utility Actions -->
      <div class="top-actions">
        <button class="action-link start-over">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8a5 5 0 11-10 0 5 5 0 0110 0z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Start Over
        </button>
        <button class="action-link skip">Skip iOS</button>
      </div>

      <!-- Hero Card - App Store App -->
      <div class="hero-card">
        <div class="card-header">
          <div class="title-row">
            <h1>App Store app</h1>
            <span class="status-pill draft">Draft</span>
          </div>
          <button class="btn-primary continue-setup">
            Continue Setup
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <p class="helper-text">
          You've started setting up your iOS app for the App Store. Complete the setup steps to publish your app and make it available to millions of users.
        </p>

        <!-- Distribution Options Panel -->
        <div class="distribution-options">
          <h3>Your app will be ready for:</h3>
          <div class="options-grid">
            <DistributionCard
              icon="🏪"
              title="Public App Store"
              description="Reach millions of users through Apple's App Store"
              @show-more="showDistributionDetails('appstore')"
            />
            <DistributionCard
              icon="🔒"
              title="Private Unlisted"
              description="Share with specific users via direct link"
              @show-more="showDistributionDetails('unlisted')"
            />
            <DistributionCard
              icon="💼"
              title="MDM / Business Manager"
              description="Deploy to managed devices in your organization"
              @show-more="showDistributionDetails('mdm')"
            />
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="benefits-section">
        <h2>Why build for iOS?</h2>
        <BenefitsChecklist :benefits="iosBenefits" />
      </div>

      <!-- Divider Toggle -->
      <div class="divider-toggle" @click="toggleAlternatives">
        <button class="toggle-btn">
          {{ showAlternatives ? 'Hide' : 'Show' }} other distribution options
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            :class="{ rotated: showAlternatives }"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Alternative Distribution Methods -->
      <transition name="slide-fade">
        <div v-if="showAlternatives" class="alternative-methods-card">
          <h2>Alternative Distribution Methods</h2>
          
          <div class="method-row">
            <div class="method-info">
              <h3>Enterprise Distribution</h3>
              <p>
                Distribute apps internally to your organization without going through the App Store. 
                Requires an Apple Developer Enterprise Program membership ($299/year). Ideal for large 
                organizations deploying proprietary apps to employees.
              </p>
            </div>
            <button class="btn-secondary">Start setup</button>
          </div>

          <div class="method-divider"></div>

          <div class="method-row">
            <div class="method-info">
              <h3>Unsigned IPA</h3>
              <p>
                Generate an unsigned IPA file for development or testing purposes. You'll need to 
                sign it manually before installation.
              </p>
            </div>
            <button class="btn-secondary">Start setup</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import PlatformSidebar from './PlatformSidebar.vue';
import DistributionCard from './DistributionCard.vue';
import BenefitsChecklist from './BenefitsChecklist.vue';

export default {
  name: 'IOSLanding',
  components: {
    PlatformSidebar,
    DistributionCard,
    BenefitsChecklist
  },
  data() {
    return {
      activePlatform: 'ios',
      showAlternatives: false,
      iosBenefits: [
        'Apple App Store distribution',
        'Auto configuration of push notifications',
        'Fliplet analytics integration',
        'Google analytics support',
        'In-app notifications',
        'Universal Links support'
      ]
    };
  },
  methods: {
    changePlatform(platform) {
      this.activePlatform = platform;
      // Navigate to Android if selected
      if (platform === 'android') {
        console.log('Navigate to Android publishing');
      }
    },
    toggleAlternatives() {
      this.showAlternatives = !this.showAlternatives;
    },
    showDistributionDetails(type) {
      console.log('Show details for:', type);
      // Implement modal or side panel with more details
    }
  }
};
</script>

<style scoped>
.ios-publishing-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.top-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  margin-bottom: 32px;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #5c6ac4;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.action-link:hover {
  background-color: rgba(92, 106, 196, 0.1);
}

.hero-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-row h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.status-pill {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pill.draft {
  background-color: #fef3c7;
  color: #92400e;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #5c6ac4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4c5ab4;
}

.helper-text {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.distribution-options {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.distribution-options h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.benefits-section {
  margin-bottom: 32px;
}

.benefits-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.divider-toggle {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  border-color: #5c6ac4;
  color: #5c6ac4;
}

.toggle-btn svg {
  transition: transform 0.2s;
}

.toggle-btn svg.rotated {
  transform: rotate(180deg);
}

.alternative-methods-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.alternative-methods-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.method-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.method-info {
  flex: 1;
}

.method-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.method-info p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.btn-secondary {
  background: white;
  color: #5c6ac4;
  border: 2px solid #5c6ac4;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #5c6ac4;
  color: white;
}

.method-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 24px 0;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>


