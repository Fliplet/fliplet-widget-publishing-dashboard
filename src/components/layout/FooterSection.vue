<template>
  <footer class="footer-section" role="contentinfo">
    <div class="footer-section__container">
      <div class="footer-section__content">
        <!-- Help Links -->
        <nav class="footer-nav" aria-label="Footer navigation">
          <h3 class="footer-nav__title">Resources</h3>
          <ul class="footer-nav__list" role="list">
            <li>
              <a 
                href="https://developers.fliplet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                class="footer-link"
              >
                <i class="fas fa-book" aria-hidden="true"></i>
                Documentation
              </a>
            </li>
            <li>
              <a 
                href="https://help.fliplet.com/publishing" 
                target="_blank" 
                rel="noopener noreferrer"
                class="footer-link"
              >
                <i class="fas fa-question-circle" aria-hidden="true"></i>
                Publishing Guide
              </a>
            </li>
            <li>
              <a 
                href="https://community.fliplet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                class="footer-link"
              >
                <i class="fas fa-users" aria-hidden="true"></i>
                Community Forum
              </a>
            </li>
            <li>
              <button
                class="footer-link footer-link--button"
                @click="openSupport"
              >
                <i class="fas fa-headset" aria-hidden="true"></i>
                Contact Support
              </button>
            </li>
          </ul>
        </nav>

        <!-- Platform Status -->
        <div class="footer-status">
          <h3 class="footer-status__title">Platform Status</h3>
          <div class="status-indicators">
            <div class="status-item">
              <span class="status-dot" :class="getStatusClass('ios')"></span>
              <span>iOS Publishing</span>
            </div>
            <div class="status-item">
              <span class="status-dot" :class="getStatusClass('android')"></span>
              <span>Android Publishing</span>
            </div>
            <div class="status-item">
              <span class="status-dot" :class="getStatusClass('api')"></span>
              <span>API Services</span>
            </div>
          </div>
          <a 
            href="https://status.fliplet.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="status-link"
          >
            View detailed status →
          </a>
        </div>

        <!-- Version Info -->
        <div class="footer-info">
          <h3 class="footer-info__title">Publishing Dashboard</h3>
          <p class="version-info">
            Version {{ version }}
            <span v-if="buildNumber" class="build-number">(Build {{ buildNumber }})</span>
          </p>
          <p class="copyright">
            © {{ currentYear }} Fliplet Ltd. All rights reserved.
          </p>
          <div class="footer-links">
            <a 
              href="https://fliplet.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            <span class="separator">·</span>
            <a 
              href="https://fliplet.com/terms" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div v-if="showQuickActions" class="footer-actions">
        <button
          class="quick-action"
          title="Keyboard shortcuts"
          @click="showKeyboardShortcuts"
        >
          <i class="fas fa-keyboard" aria-hidden="true"></i>
          <span class="sr-only">Keyboard shortcuts</span>
        </button>
        <button
          class="quick-action"
          title="Report an issue"
          @click="reportIssue"
        >
          <i class="fas fa-bug" aria-hidden="true"></i>
          <span class="sr-only">Report an issue</span>
        </button>
        <button
          class="quick-action"
          title="Back to top"
          @click="scrollToTop"
        >
          <i class="fas fa-arrow-up" aria-hidden="true"></i>
          <span class="sr-only">Back to top</span>
        </button>
      </div>
    </div>
  </footer>
</template>

<script>
/**
 * FooterSection - Footer with help links and version info
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <FooterSection
 *   :version="appVersion"
 *   :build-number="buildNumber"
 *   :show-quick-actions="true"
 *   :platform-statuses="statuses"
 * />
 */
export default {
  name: 'FooterSection',

  props: {
    /**
     * Application version
     * @type {String}
     */
    version: {
      type: String,
      default: '1.0.0'
    },

    /**
     * Build number
     * @type {String}
     */
    buildNumber: {
      type: String,
      default: ''
    },

    /**
     * Show quick action buttons
     * @type {Boolean}
     */
    showQuickActions: {
      type: Boolean,
      default: true
    },

    /**
     * Platform status information
     * @type {Object}
     */
    platformStatuses: {
      type: Object,
      default: () => ({
        ios: 'operational',
        android: 'operational',
        api: 'operational'
      })
    }
  },

  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  },

  methods: {
    getStatusClass(platform) {
      const status = this.platformStatuses[platform] || 'operational';
      return `status-dot--${status}`;
    },

    openSupport() {
      // This would typically open a support widget or navigate to support
      if (window.Fliplet && window.Fliplet.Navigate) {
        window.Fliplet.Navigate.url('https://help.fliplet.com/contact');
      } else {
        window.open('https://help.fliplet.com/contact', '_blank');
      }
    },

    showKeyboardShortcuts() {
      this.$root.$emit('show-keyboard-shortcuts');
    },

    reportIssue() {
      // This would open an issue reporting form
      const subject = encodeURIComponent('Publishing Dashboard Issue');
      const body = encodeURIComponent(`
Issue Description:
[Please describe the issue you're experiencing]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Environment:
- Platform: ${this.getCurrentPlatform()}
- Version: ${this.version}
- Browser: ${navigator.userAgent}
      `);
      
      window.open(`mailto:support@fliplet.com?subject=${subject}&body=${body}`);
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },

    getCurrentPlatform() {
      // Get current platform from parent or state
      return this.$parent?.currentPlatform || 'Not selected';
    }
  }
};
</script>

<style lang="scss" scoped>
.footer-section {
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  padding: var(--spacing-xl) 0;
  margin-top: auto;

  &__container {
    max-width: var(--container-max-width, 1200px);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  &__content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);

    @media (max-width: 767px) {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
}

// Footer navigation
.footer-nav {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color, #333);
    margin-bottom: var(--spacing-md);
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: var(--spacing-sm);
    }
  }
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-color-secondary, #666);
  text-decoration: none;
  transition: color var(--transition-speed) ease;

  &:hover {
    color: var(--primary-color, #00abd1);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  i {
    font-size: 1rem;
    width: 20px;
    text-align: center;
  }

  &--button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }
}

// Platform status
.footer-status {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color, #333);
    margin-bottom: var(--spacing-md);
  }
}

.status-indicators {
  margin-bottom: var(--spacing-sm);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--text-color-secondary, #666);
  font-size: 0.875rem;

  @media (max-width: 767px) {
    justify-content: center;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;

  &--operational {
    background-color: var(--success-color, #28a745);
  }

  &--degraded {
    background-color: var(--warning-color, #ffc107);
  }

  &--outage {
    background-color: var(--error-color, #dc3545);
  }
}

.status-link {
  font-size: 0.875rem;
  color: var(--primary-color, #00abd1);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}

// Version info
.footer-info {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color, #333);
    margin-bottom: var(--spacing-sm);
  }
}

.version-info {
  color: var(--text-color-secondary, #666);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xs);

  .build-number {
    font-size: 0.75rem;
    opacity: 0.7;
  }
}

.copyright {
  color: var(--text-color-secondary, #666);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-sm);
}

.footer-links {
  font-size: 0.875rem;

  a {
    color: var(--text-color-secondary, #666);
    text-decoration: none;

    &:hover {
      color: var(--primary-color, #00abd1);
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }

  .separator {
    margin: 0 var(--spacing-xs);
    color: #ccc;
  }
}

// Quick actions
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  border-top: 1px solid #e0e0e0;

  @media (max-width: 767px) {
    justify-content: center;
  }
}

.quick-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: var(--border-radius);
  background: white;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  i {
    font-size: 1.125rem;
  }
}

// Screen reader only text
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>