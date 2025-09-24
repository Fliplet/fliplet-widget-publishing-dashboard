(function() {
  'use strict';

  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.components = window.PublishingDashboard.components || {};

  window.PublishingDashboard.components['notification-toast'] = {
    name: 'NotificationToast',
    template: window.PublishingDashboard.templates['notification-toast'],
    data: function() {
      return {
        notifications: [],
        nextId: 0
      };
    },
    mounted: function() {
      this.$root.$on('show-notification', this.showNotification);
    },
    beforeDestroy: function() {
      this.$root.$off('show-notification', this.showNotification);
    },
    methods: {
      showNotification: function(options) {
        var type = options.type || 'info';
        var message = options.message;
        var duration = options.duration || 3000;
        
        var id = this.nextId++;
        this.notifications.push({ 
          id: id, 
          type: type, 
          message: message, 
          duration: duration 
        });

        var self = this;
        if (duration > 0) {
          setTimeout(function() {
            self.dismiss(id);
          }, duration);
        }
      },
      dismiss: function(id) {
        this.notifications = this.notifications.filter(function(n) {
          return n.id !== id;
        });
      },
      getIconClass: function(type) {
        var icons = {
          success: 'fa fa-check-circle',
          error: 'fa fa-times-circle',
          warning: 'fa fa-exclamation-triangle',
          info: 'fa fa-info-circle'
        };
        return icons[type] || 'fa fa-info-circle';
      }
    }
  };

})();