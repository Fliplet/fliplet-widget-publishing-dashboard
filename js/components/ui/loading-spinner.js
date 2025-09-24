(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['loading-spinner'] = {
    name: 'LoadingSpinner',
    template: window.PublishingDashboard.templates['loading-spinner'],
    props: {
      size: {
        type: String,
        default: '24px'
      },
      color: {
        type: String,
        default: '#00abd1'
      },
      borderWidth: {
        type: String,
        default: '3px'
      }
    },
    computed: {
      spinnerStyle: function() {
        return {
          borderColor: this.color,
          borderTopColor: 'transparent',
          borderWidth: this.borderWidth
        };
      }
    }
  };

})();