<template>
  <app-shell
    :current-platform="currentPlatform"
    :user="currentUser"
    :app-info="appInfo"
    :show-admin-menu="isAdmin"
    @platform-change="handlePlatformChange"
    @navigate="handleNavigation"
  >
    <div class="dashboard-container">
      <!-- Platform Selection View -->
      <platform-selector
        v-if="!currentPlatform"
        :ios-status="iosStatus"
        :android-status="androidStatus"
        :last-ios-submission="lastIosSubmission"
        :last-android-submission="lastAndroidSubmission"
        :show-admin-section="isAdmin"
        @select-platform="handlePlatformSelection"
        @navigate="handleNavigation"
      />

          <!-- iOS Workflow View -->
          <ios-workflow-view
            v-else-if="currentPlatform === 'ios'"
            :app-info="appInfo"
            @cancel="handlePlatformChange(null)"
            @draft-saved="handleDraftSaved"
            @workflow-complete="handleWorkflowComplete"
            @view-step-details="handleViewStepDetails"
          />

          <!-- Android Workflow View -->
          <android-workflow-view
            v-else-if="currentPlatform === 'android'"
            :app-info="appInfo"
            @cancel="handlePlatformChange(null)"
            @draft-saved="handleDraftSaved"
            @workflow-complete="handleWorkflowComplete"
          />

      <!-- Admin/Permissions View -->
      <div v-else-if="currentView === 'permissions'">
        <h2>App Permissions Management</h2>
        <p>Permission management will be implemented here.</p>
      </div>
    </div>
  </app-shell>
</template>

<script>
import AppShell from './components/layout/AppShell.vue';
import NavigationHeader from './components/layout/NavigationHeader.vue';
import PlatformSelector from './components/layout/PlatformSelector.vue';
import FooterSection from './components/layout/FooterSection.vue';
import LoadingOverlay from './components/feedback/LoadingOverlay.vue';
import NotificationToast from './components/feedback/NotificationToast.vue';
import LoadingSpinner from './components/ui/LoadingSpinner.vue';
import StatusIndicator from './components/ui/StatusIndicator.vue';
import IOSWorkflowView from './components/workflow/IOSWorkflowView.vue';
import AndroidWorkflowView from './components/workflow/AndroidWorkflowView.vue';

export default {
  name: 'PublishingDashboard',

  components: {
    AppShell,
    NavigationHeader,
    PlatformSelector,
    FooterSection,
    LoadingOverlay,
    NotificationToast,
    LoadingSpinner,
    StatusIndicator,
    IOSWorkflowView,
    AndroidWorkflowView
  },

  data() {
    return {
      currentPlatform: null,
      currentView: 'dashboard',
      currentUser: null,
      appInfo: null,
      iosStatus: null,
      androidStatus: null,
      lastIosSubmission: null,
      lastAndroidSubmission: null,
      isAdmin: false,
      isLoading: true
    };
  },

  async created() {
    await this.initializeApp();
  },

  methods: {
    async initializeApp() {
      try {
        // Initialize user and app data
        this.currentUser = await this.getCurrentUser();
        this.appInfo = await this.getAppInfo();
        this.isAdmin = this.checkAdminStatus();

        // Initialize middleware if available
        if (window.PublishingMiddleware) {
          await this.initializeMiddleware();
        }

        // Load initial data
        await this.loadInitialData();

      } catch (error) {
        console.error('Failed to initialize app:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Failed to initialize the Publishing Dashboard. Please refresh the page.',
          duration: 0 // Don't auto-dismiss
        });
      } finally {
        this.isLoading = false;
      }
    },

    async getCurrentUser() {
      if (window.Fliplet && window.Fliplet.User) {
        return window.Fliplet.User.getCachedSession();
      }
      return {
        name: 'Test User',
        email: 'user@example.com'
      };
    },

    async getAppInfo() {
      if (window.Fliplet && window.Fliplet.App) {
        return window.Fliplet.App.get();
      }
      return {
        name: 'Publishing Dashboard',
        id: null
      };
    },

    checkAdminStatus() {
      // Check if user has admin permissions
      // This would typically check user roles/permissions
      return true; // For development
    },

    async initializeMiddleware() {
      if (!window.PublishingMiddleware.isInitialized) {
        await window.PublishingMiddleware.initialize({
          authToken: window.Fliplet?.User?.getAuthToken?.(),
          environment: window.Fliplet?.Env?.get?.('environment') || 'production',
          appId: this.appInfo?.id
        });
      }
    },

    async loadInitialData() {
      // Load submission history and platform statuses
      // This would use the middleware to fetch data
      console.log('Loading initial data...');
    },

    handlePlatformChange(platform) {
      this.currentPlatform = platform;
      this.currentView = 'workflow';
    },

    handlePlatformSelection(platform) {
      this.currentPlatform = platform;
      this.currentView = 'workflow';
      
      this.$root.$emit('show-notification', {
        type: 'success',
        message: `${platform === 'ios' ? 'iOS' : 'Android'} platform selected`,
        duration: 3000
      });
    },

    handleNavigation(route) {
      switch (route) {
        case 'dashboard':
          this.currentPlatform = null;
          this.currentView = 'dashboard';
          break;
        case 'permissions':
          this.currentView = 'permissions';
          break;
        case 'help':
          this.openHelp();
          break;
        case 'settings':
          this.openSettings();
          break;
        default:
          console.warn('Unknown navigation route:', route);
      }
    },

    openHelp() {
      if (window.Fliplet && window.Fliplet.Navigate) {
        window.Fliplet.Navigate.url('https://help.fliplet.com/publishing');
      } else {
        window.open('https://help.fliplet.com/publishing', '_blank');
      }
    },

    openSettings() {
      // Settings would be implemented later
      this.$root.$emit('show-notification', {
        type: 'info',
        message: 'Settings will be available in a future update',
        duration: 3000
      });
    },

    handleDraftSaved(draftData) {
      console.log('Draft saved:', draftData);
      // Could store draft info or update UI
      this.$root.$emit('show-notification', {
        type: 'success',
        message: 'Draft saved successfully',
        duration: 3000
      });
    },

    handleWorkflowComplete(completionData) {
      console.log('Workflow completed:', completionData);
      // Navigate back to dashboard or show success view
      this.currentPlatform = null;
      this.currentView = 'dashboard';
      
      // Update submission info
      if (completionData.platform === 'ios') {
        this.lastIosSubmission = {
          version: completionData.data?.configuration?.version || '1.0.0',
          timestamp: Date.now()
        };
      }
      
      this.$root.$emit('show-notification', {
        type: 'success',
        message: 'App submitted successfully!',
        duration: 5000
      });
    },

    handleViewStepDetails({ step, index }) {
      console.log('View step details:', step, index);
      // Could show modal or navigate to details view
    }
  }
};
</script>

<style lang="scss">
@import '@/styles/global.scss';

// Dashboard container
.dashboard-container {
  min-height: calc(100vh - 200px); // Account for header and footer
  padding: var(--spacing-lg);
  max-width: var(--container-max-width);
  margin: 0 auto;

  @include sm-down {
    padding: var(--spacing-md);
  }
}
</style>
