(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['footer-section'] = {
    name: 'FooterSection',
    template: window.PublishingDashboard.templates['footer-section'],
    computed: {
      currentYear: function() {
        return new Date().getFullYear();
      }
    }
  };

})();