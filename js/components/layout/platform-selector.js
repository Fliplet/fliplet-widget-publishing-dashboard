(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['platform-selector'] = {
    name: 'PlatformSelector',
    template: window.PublishingDashboard.templates['platform-selector'],
    components: {
      'status-indicator': window.PublishingDashboard.components['status-indicator']
    },
    props: {
      iosStatus: {
        type: String,
        default: 'unknown'
      },
      androidStatus: {
        type: String,
        default: 'unknown'
      },
      lastIosSubmission: {
        type: Object,
        default: null
      },
      lastAndroidSubmission: {
        type: Object,
        default: null
      },
      showAdminSection: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      formatTimestamp: function(timestamp) {
        if (!timestamp) return 'N/A';
        var date = new Date(timestamp);
        return date.toLocaleDateString();
      }
    }
  };

})();