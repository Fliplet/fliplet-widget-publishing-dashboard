<template>
  <div class="android-publishing-container">
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
        <button class="action-link skip">Skip Android</button>
      </div>

      <!-- Resume Banner (shown if previous build exists and is incomplete) -->
      <transition name="slide-fade">
        <div v-if="showResumeBanner" class="resume-banner">
          <div class="banner-content">
            <svg class="info-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 6v4M10 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="banner-text">
              <strong>Previous build incomplete</strong>
              <span>A previous build failed at Step {{ failedStep }}. Resume from last successful step?</span>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn-text" @click="viewDetails">View details</button>
            <button class="btn-secondary-small" @click="startNewBuild">Start new build</button>
            <button class="btn-primary-small" @click="resumeBuild">Resume build</button>
          </div>
        </div>
      </transition>

      <!-- Hero Card - Google Play App -->
      <div class="hero-card">
        <div class="card-header">
          <div class="title-row">
            <h1>Google Play app</h1>
            <span class="status-pill draft">Draft</span>
          </div>
          <button class="btn-primary continue-setup" @click="continueSetup">
            Continue Setup
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <p class="helper-text">
          You've started setting up your Android app for Google Play. Complete the setup steps to publish your app and make it available to billions of users worldwide.
        </p>

        <!-- Distribution Options Panel -->
        <div class="distribution-options">
          <h3>Your app will be ready for:</h3>
          <div class="options-grid">
            <DistributionCard
              icon="🏪"
              title="Google Play Store"
              description="Reach billions of users through Google's Play Store"
              @show-more="showDistributionDetails('playstore')"
            />
            <DistributionCard
              icon="🔒"
              title="Private/Internal Testing"
              description="Share with specific testers via internal test tracks"
              @show-more="showDistributionDetails('internal')"
            />
            <DistributionCard
              icon="💼"
              title="Enterprise Distribution"
              description="Deploy to managed devices in your organization"
              @show-more="showDistributionDetails('enterprise')"
            />
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="benefits-section">
        <h2>Why build for Android?</h2>
        <BenefitsChecklist :benefits="androidBenefits" />
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
              <h3>Signed APK (Existing Flow)</h3>
              <p>
                Generate a signed APK file using the existing publishing flow. This method is available 
                for apps that need traditional APK distribution outside of Google Play or for legacy systems.
              </p>
            </div>
            <button class="btn-secondary">Use existing flow</button>
          </div>

          <div class="method-divider"></div>

          <div class="method-row">
            <div class="method-info">
              <h3>Debug Build</h3>
              <p>
                Generate an unsigned debug build for development and testing purposes. You'll need to 
                install it manually on test devices via ADB or file transfer.
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
  name: 'AndroidLanding',
  components: {
    PlatformSidebar,
    DistributionCard,
    BenefitsChecklist
  },
  data() {
    return {
      activePlatform: 'android',
      showAlternatives: false,
      showResumeBanner: false, // Set to true when incomplete build detected
      failedStep: 3, // Example: which step failed
      lastSubmission: null, // Store last submission data for resume
      androidBenefits: [
        'Google Play Store distribution',
        'Firebase push notifications',
        'Fliplet analytics integration',
        'Google analytics support',
        'In-app notifications',
        'App Links support (deep linking)'
      ]
    };
  },
  mounted() {
    // Check for incomplete builds on mount
    this.checkForIncompleteBuilds();
  },
  methods: {
    changePlatform(platform) {
      this.activePlatform = platform;
      // Navigate to iOS if selected
      if (platform === 'ios') {
        this.$emit('navigate', 'ios');
      }
    },
    toggleAlternatives() {
      this.showAlternatives = !this.showAlternatives;
    },
    showDistributionDetails(type) {
      console.log('Show details for:', type);
      // Implement modal or side panel with more details
    },
    continueSetup() {
      // Navigate to Android stepper
      this.$emit('navigate', 'android-stepper');
    },
    async checkForIncompleteBuilds() {
      try {
        // Import API service
        const { getLatestSubmission } = await import('../services/androidPublishingApi.js');
        
        // Get app ID from props or global state
        const appId = this.$root.appId || window.Fliplet?.Env?.get('appId');
        if (!appId) return;

        const latestSubmission = await getLatestSubmission(appId);
        
        if (!latestSubmission) {
          // No previous submission
          return;
        }

        // Check if submission is incomplete (not completed or failed at a step)
        const incompleteStatuses = ['in_progress', 'failed', 'blocked', 'waiting'];
        if (incompleteStatuses.includes(latestSubmission.status)) {
          this.showResumeBanner = true;
          
          // Determine which step failed
          if (latestSubmission.steps && Array.isArray(latestSubmission.steps)) {
            const failedStepIndex = latestSubmission.steps.findIndex(
              step => step.status === 'failed' || step.status === 'blocked'
            );
            this.failedStep = failedStepIndex >= 0 ? failedStepIndex + 1 : 1;
          } else {
            this.failedStep = 1;
          }
          
          // Store submission data for resume
          this.lastSubmission = latestSubmission;
        }
      } catch (error) {
        console.error('Failed to check for incomplete builds:', error);
        // Silently fail - don't show banner if API call fails
      }
    },
    resumeBuild() {
      // Navigate to stepper with resume flag and submission data
      this.$emit('navigate', 'android-stepper', { 
        resume: true, 
        submission: this.lastSubmission 
      });
    },
    startNewBuild() {
      this.showResumeBanner = false;
      this.$emit('navigate', 'android-stepper', { newBuild: true });
    },
    viewDetails() {
      // Show build details modal or navigate to details view
      if (this.lastSubmission) {
        console.log('View build details:', this.lastSubmission);
        // TODO: Open modal or navigate to build details page
      }
    }
  }
};
</script>

<style scoped>
.android-publishing-container {
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

/* Resume Banner */
.resume-banner {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.banner-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.info-icon {
  color: #856404;
  flex-shrink: 0;
  margin-top: 2px;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-text strong {
  font-size: 14px;
  font-weight: 600;
  color: #856404;
}

.banner-text span {
  font-size: 13px;
  color: #856404;
}

.banner-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.btn-text {
  background: none;
  border: none;
  color: #5c6ac4;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.btn-text:hover {
  background-color: rgba(92, 106, 196, 0.1);
}

.btn-secondary-small {
  background: white;
  color: #5c6ac4;
  border: 2px solid #5c6ac4;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-secondary-small:hover {
  background-color: #5c6ac4;
  color: white;
}

.btn-primary-small {
  background-color: #5c6ac4;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.btn-primary-small:hover {
  background-color: #4c5ab4;
}

/* Hero Card */
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

/* Benefits Section */
.benefits-section {
  margin-bottom: 32px;
}

.benefits-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

/* Divider Toggle */
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

/* Alternative Methods Card */
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

