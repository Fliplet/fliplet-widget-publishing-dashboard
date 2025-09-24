(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['loading-overlay'] = {
    name: 'LoadingOverlay',
    template: window.PublishingDashboard.templates['loading-overlay'],
    components: {
      'loading-spinner': window.PublishingDashboard.components['loading-spinner']
    },
    props: {
      active: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: 'Loading...'
      }
    }
  };

})();