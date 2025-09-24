<template>
  <div class="platform-selector">
    <h2 class="platform-selector__title">Select Publishing Platform</h2>
    <p class="platform-selector__subtitle">
      Choose the platform you want to publish your app to
    </p>

    <div class="platform-cards">
      <!-- iOS Platform Card -->
      <article
        class="platform-card platform-card--ios"
        :class="{ 'platform-card--loading': iosLoading }"
        role="button"
        tabindex="0"
        :aria-disabled="iosLoading ? 'true' : 'false'"
        @click="selectPlatform('ios')"
        @keydown.enter.space.prevent="selectPlatform('ios')"
      >
        <div class="platform-card__icon">
          <i class="fab fa-apple" aria-hidden="true"></i>
        </div>
        
        <h3 class="platform-card__name">iOS App Store</h3>
        
        <div class="platform-card__status">
          <status-indicator 
            v-if="iosStatus"
            :status="iosStatus.type"
            :message="iosStatus.message"
          />
          <span v-else class="status-text">Ready to publish</span>
        </div>

        <ul class="platform-card__features" aria-label="iOS features">
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            App Store Connect integration
          </li>
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Automatic certificate management
          </li>
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Push notification support
          </li>
        </ul>

        <div v-if="lastIosSubmission" class="platform-card__last-build">
          <small>
            Last build: {{ formatDate(lastIosSubmission.date) }}
            <span class="build-version">v{{ lastIosSubmission.version }}</span>
          </small>
        </div>

        <loading-spinner v-if="iosLoading" size="small" />
      </article>

      <!-- Android Platform Card -->
      <article
        class="platform-card platform-card--android"
        :class="{ 'platform-card--loading': androidLoading }"
        role="button"
        tabindex="0"
        :aria-disabled="androidLoading ? 'true' : 'false'"
        @click="selectPlatform('android')"
        @keydown.enter.space.prevent="selectPlatform('android')"
      >
        <div class="platform-card__icon">
          <i class="fab fa-android" aria-hidden="true"></i>
        </div>
        
        <h3 class="platform-card__name">Google Play Store</h3>
        
        <div class="platform-card__status">
          <status-indicator 
            v-if="androidStatus"
            :status="androidStatus.type"
            :message="androidStatus.message"
          />
          <span v-else class="status-text">Ready to publish</span>
        </div>

        <ul class="platform-card__features" aria-label="Android features">
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Google Play Console ready
          </li>
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Custom keystore support
          </li>
          <li>
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Firebase integration
          </li>
        </ul>

        <div v-if="lastAndroidSubmission" class="platform-card__last-build">
          <small>
            Last build: {{ formatDate(lastAndroidSubmission.date) }}
            <span class="build-version">v{{ lastAndroidSubmission.versionName }}</span>
          </small>
        </div>

        <loading-spinner v-if="androidLoading" size="small" />
      </article>
    </div>

    <div v-if="showAdminSection" class="platform-selector__admin">
      <div class="admin-section">
        <h3>
          <i class="fas fa-shield-alt" aria-hidden="true"></i>
          Admin Actions
        </h3>
        <button
          class="btn btn-secondary"
          @click="$emit('navigate', 'permissions')"
        >
          Manage App Permissions
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * PlatformSelector - Platform selection cards for iOS/Android
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <PlatformSelector
 *   :ios-status="iosStatusData"
 *   :android-status="androidStatusData"
 *   :last-ios-submission="lastIos"
 *   :last-android-submission="lastAndroid"
 *   :show-admin-section="isAdmin"
 *   @select-platform="handlePlatformSelection"
 *   @navigate="handleNavigation"
 * />
 */
export default {
  name: 'PlatformSelector',

  props: {
    /**
     * iOS platform status
     * @type {Object}
     */
    iosStatus: {
      type: Object,
      default: null
    },

    /**
     * Android platform status
     * @type {Object}
     */
    androidStatus: {
      type: Object,
      default: null
    },

    /**
     * Last iOS submission data
     * @type {Object}
     */
    lastIosSubmission: {
      type: Object,
      default: null
    },

    /**
     * Last Android submission data
     * @type {Object}
     */
    lastAndroidSubmission: {
      type: Object,
      default: null
    },

    /**
     * Show admin section
     * @type {Boolean}
     */
    showAdminSection: {
      type: Boolean,
      default: false
    }
  },

  // Events: select-platform, navigate

  data() {
    return {
      iosLoading: false,
      androidLoading: false
    };
  },

  mounted() {
    this.loadPlatformStatuses();
  },

  methods: {
    async loadPlatformStatuses() {
      // This would typically load platform statuses from the middleware
      // For now, we'll just set them to false
      this.iosLoading = false;
      this.androidLoading = false;
    },

    async selectPlatform(platform) {
      if (this[`${platform}Loading`]) {
        return;
      }

      // Set loading state
      this[`${platform}Loading`] = true;

      try {
        // Initialize middleware if needed
        if (window.PublishingMiddleware && !window.PublishingMiddleware.isInitialized) {
          await window.PublishingMiddleware.initialize({
            authToken: window.Fliplet?.User?.getAuthToken?.(),
            environment: window.Fliplet?.Env?.get?.('environment') || 'production'
          });
        }

        // Emit platform selection
        this.$emit('select-platform', platform);

      } catch (error) {
        console.error(`Error selecting ${platform} platform:`, error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: `Failed to select ${platform} platform. Please try again.`,
          duration: 5000
        });
      } finally {
        this[`${platform}Loading`] = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'Never';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.platform-selector {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl) 0;

  &__title {
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-color, #333);
    margin-bottom: var(--spacing-sm);
  }

  &__subtitle {
    text-align: center;
    color: var(--text-color-secondary, #666);
    margin-bottom: var(--spacing-xl);
  }

  &__admin {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-xl);
    border-top: 1px solid #e0e0e0;
  }
}

.platform-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.platform-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  position: relative;
  overflow: hidden;

  &:hover:not(.platform-card--loading) {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  &--loading {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &--ios {
    border-top: 4px solid var(--ios-color, #007aff);

    .platform-card__icon {
      color: var(--ios-color, #007aff);
    }

    &:hover:not(.platform-card--loading) {
      border-color: darken(#007aff, 10%);
    }
  }

  &--android {
    border-top: 4px solid var(--android-color, #3ddc84);

    .platform-card__icon {
      color: var(--android-color, #3ddc84);
    }

    &:hover:not(.platform-card--loading) {
      border-color: darken(#3ddc84, 10%);
    }
  }

  &__icon {
    font-size: 3.5rem;
    margin-bottom: var(--spacing-md);
    text-align: center;
  }

  &__name {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    text-align: center;
  }

  &__status {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    min-height: 24px;

    .status-text {
      color: var(--success-color, #28a745);
      font-weight: 500;
    }
  }

  &__features {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--spacing-lg) 0;

    li {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      color: var(--text-color-secondary, #666);
      font-size: 0.875rem;

      i {
        color: var(--success-color, #28a745);
        font-size: 1rem;
      }
    }
  }

  &__last-build {
    text-align: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid #e0e0e0;
    color: var(--text-color-secondary, #666);

    .build-version {
      font-weight: 600;
      color: var(--text-color, #333);
    }
  }
}

.admin-section {
  background: #f8f9fa;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  text-align: center;

  h3 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    font-size: 1.25rem;
    margin-bottom: var(--spacing-md);
    color: var(--text-color, #333);

    i {
      color: var(--warning-color, #ffc107);
    }
  }

  .btn {
    min-width: 200px;
  }
}

// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  &-secondary {
    background-color: #6c757d;
    color: white;

    &:hover {
      background-color: darken(#6c757d, 10%);
    }
  }
}

// Loading spinner position
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>