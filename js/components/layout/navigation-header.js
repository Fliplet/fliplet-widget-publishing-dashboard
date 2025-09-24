(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['navigation-header'] = {
    name: 'NavigationHeader',
    template: window.PublishingDashboard.templates['navigation-header'],
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
      }
    },
    data: function() {
      return {
        userMenuOpen: false
      };
    },
    methods: {
      toggleUserMenu: function() {
        this.userMenuOpen = !this.userMenuOpen;
      }
    },
    mounted: function() {
      // Close menu when clicking outside
      var self = this;
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
          self.userMenuOpen = false;
        }
      });
    }
  };

})();