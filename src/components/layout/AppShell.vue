<template>
  <div class="app-shell" :class="shellClasses">
    <loading-overlay v-if="globalLoading" :message="loadingMessage" />
    
    <navigation-header
      v-if="showHeader"
      :current-platform="currentPlatform"
      :user="user"
      :app-info="appInfo"
      :show-admin-menu="showAdminMenu"
      @platform-change="handlePlatformChange"
      @navigate="handleNavigation"
    />
    
    <main class="app-shell__content" role="main">
      <div class="container-fluid">
        <transition name="fade" mode="out-in">
          <slot />
        </transition>
      </div>
    </main>
    
    <footer-section
      v-if="showFooter"
      :version="widgetVersion"
    />
    
    <notification-toast />
  </div>
</template>

<script>
/**
 * AppShell - Main application wrapper providing consistent structure
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <AppShell
 *   :current-platform="selectedPlatform"
 *   :user="currentUser"
 *   :app-info="appData"
 *   :show-admin-menu="isAdmin"
 * >
 *   <!-- Page content -->
 * </AppShell>
 */
export default {
  name: 'AppShell',

  props: {
    /**
     * Currently selected platform
     * @type {String}
     */
    currentPlatform: {
      type: String,
      default: null,
      validator: (value) => {
        return value === null || ['ios', 'android'].includes(value);
      }
    },

    /**
     * Current user information
     * @type {Object}
     */
    user: {
      type: Object,
      default: () => ({})
    },

    /**
     * Current app information
     * @type {Object}
     */
    appInfo: {
      type: Object,
      default: () => ({})
    },

    /**
     * Show admin menu options
     * @type {Boolean}
     */
    showAdminMenu: {
      type: Boolean,
      default: false
    },

    /**
     * Show navigation header
     * @type {Boolean}
     */
    showHeader: {
      type: Boolean,
      default: true
    },

    /**
     * Show footer section
     * @type {Boolean}
     */
    showFooter: {
      type: Boolean,
      default: true
    }
  },

  // Events: platform-change, navigate

  data() {
    return {
      globalLoading: false,
      loadingMessage: 'Loading...',
      widgetVersion: '1.0.0',
      isMobile: false,
      isTablet: false
    };
  },

  computed: {
    shellClasses() {
      return {
        'app-shell--mobile': this.isMobile,
        'app-shell--tablet': this.isTablet,
        'app-shell--desktop': !this.isMobile && !this.isTablet,
        [`app-shell--${this.currentPlatform}`]: this.currentPlatform
      };
    }
  },

  created() {
    this.checkViewport();
    this.setupEventListeners();
  },

  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.listenToMiddlewareEvents();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.removeMiddlewareListeners();
  },

  methods: {
    checkViewport() {
      const width = window.innerWidth;
      this.isMobile = width < 768;
      this.isTablet = width >= 768 && width < 1024;
    },

    handleResize() {
      // Debounce resize handling
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.checkViewport();
      }, 150);
    },

    setupEventListeners() {
      // Set up any global event listeners
      this.$root.$on('show-loading', this.showLoading);
      this.$root.$on('hide-loading', this.hideLoading);
    },

    listenToMiddlewareEvents() {
      if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
        window.PublishingMiddleware.on('api-error', this.handleApiError);
        window.PublishingMiddleware.on('workflow-started', this.handleWorkflowStart);
        window.PublishingMiddleware.on('workflow-completed', this.handleWorkflowComplete);
      }
    },

    removeMiddlewareListeners() {
      if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
        window.PublishingMiddleware.off('api-error', this.handleApiError);
        window.PublishingMiddleware.off('workflow-started', this.handleWorkflowStart);
        window.PublishingMiddleware.off('workflow-completed', this.handleWorkflowComplete);
      }
    },

    showLoading(message = 'Loading...') {
      this.globalLoading = true;
      this.loadingMessage = message;
    },

    hideLoading() {
      this.globalLoading = false;
      this.loadingMessage = 'Loading...';
    },

    handlePlatformChange(platform) {
      this.$emit('platform-change', platform);
    },

    handleNavigation(route) {
      this.$emit('navigate', route);
    },

    handleApiError(error) {
      // Show error notification
      this.$root.$emit('show-notification', {
        type: 'error',
        message: error.message || 'An error occurred',
        duration: 5000
      });
    },

    handleWorkflowStart(data) {
      console.log('Workflow started:', data);
    },

    handleWorkflowComplete(data) {
      console.log('Workflow completed:', data);
      this.$root.$emit('show-notification', {
        type: 'success',
        message: 'Workflow completed successfully',
        duration: 3000
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color, #f5f5f5);

  &__content {
    flex: 1;
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-xl);
    
    @media (max-width: 767px) {
      padding-top: var(--spacing-md);
      padding-bottom: var(--spacing-lg);
    }
  }

  // Platform-specific styling
  &--ios {
    --primary-color: var(--ios-color, #007aff);
  }

  &--android {
    --primary-color: var(--android-color, #3ddc84);
  }

  // Responsive modifiers
  &--mobile {
    .container-fluid {
      padding-left: var(--spacing-sm);
      padding-right: var(--spacing-sm);
    }
  }

  &--tablet {
    .container-fluid {
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
    }
  }

  &--desktop {
    .container-fluid {
      max-width: var(--container-max-width, 1200px);
      margin: 0 auto;
    }
  }
}

// Transition animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed, 200ms) ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

// Container utilities
.container-fluid {
  width: 100%;
  padding-right: var(--spacing-md);
  padding-left: var(--spacing-md);
}
</style>