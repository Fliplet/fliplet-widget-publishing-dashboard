(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['status-indicator'] = {
    name: 'StatusIndicator',
    template: window.PublishingDashboard.templates['status-indicator'],
    props: {
      status: {
        type: String,
        default: 'unknown',
        validator: function(value) {
          return [
            'pending', 'processing', 'building', 'uploading',
            'completed', 'success', 'failed', 'error', 'cancelled',
            'warning', 'unknown'
          ].indexOf(value) !== -1;
        }
      }
    },
    computed: {
      formattedStatus: function() {
        return this.status.charAt(0).toUpperCase() + this.status.slice(1);
      },
      iconClass: function() {
        var icons = {
          pending: 'fa fa-hourglass-half',
          processing: 'fa fa-sync fa-spin',
          building: 'fa fa-hammer fa-spin',
          uploading: 'fa fa-cloud-upload fa-spin',
          completed: 'fa fa-check-circle',
          success: 'fa fa-check-circle',
          failed: 'fa fa-times-circle',
          error: 'fa fa-exclamation-circle',
          cancelled: 'fa fa-ban',
          warning: 'fa fa-exclamation-triangle',
          unknown: 'fa fa-question-circle'
        };
        return icons[this.status] || 'fa fa-question-circle';
      }
    }
  };

})();