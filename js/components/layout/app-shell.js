(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['app-shell'] = {
    name: 'AppShell',
    template: window.PublishingDashboard.templates['app-shell'],
    components: {
      'navigation-header': window.PublishingDashboard.components['navigation-header'],
      'footer-section': window.PublishingDashboard.components['footer-section'],
      'loading-overlay': window.PublishingDashboard.components['loading-overlay'],
      'notification-toast': window.PublishingDashboard.components['notification-toast']
    },
    props: {
      user: {
        type: Object,
        default: function() { return {}; }
      },
      appInfo: {
        type: Object,
        default: function() { return {}; }
      },
      currentPlatform: {
        type: String,
        default: null
      },
      showAdminMenu: {
        type: Boolean,
        default: false
      },
      isLoading: {
        type: Boolean,
        default: false
      }
    }
  };

})();