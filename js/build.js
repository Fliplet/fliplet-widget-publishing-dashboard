(function() {
  'use strict';

  // Wait for Fliplet to be ready
  Fliplet.Widget.instance('publishing-dashboard', function(data) {
    
    // Initialize middleware first if not already initialized
    if (window.PublishingMiddleware && !window.PublishingMiddleware.isInitialized) {
      // Initialize middleware with script tag
      var script = document.createElement('script');
      script.src = Fliplet.Env.get('apiUrl') + 'v1/widgets/com.fliplet.publishing-dashboard/src/middleware/middleware.js';
      script.onload = function() {
        console.log('Middleware loaded');
      };
      document.head.appendChild(script);
    }
    
    // Initialize the middleware when Fliplet is ready
    function initializeApp() {
      // Initialize the Vue app
      window.PublishingDashboard.app = new Vue({
        el: '#app',
        components: window.PublishingDashboard.components,
        data: {
          currentPlatform: null,
          currentView: 'dashboard',
          currentUser: { name: 'Guest User', role: 'user' },
          appInfo: { 
            name: Fliplet.Env.get('appName') || 'My Publishing App', 
            version: '1.0.0',
            id: Fliplet.Env.get('appId')
          },
          isAdmin: true,
          iosStatus: 'pending',
          androidStatus: 'success',
          lastIosSubmission: { version: '1.0.0', timestamp: Date.now() - 3600000 * 24 * 7 },
          lastAndroidSubmission: { version: '1.0.1', timestamp: Date.now() - 3600000 * 24 * 2 },
          isLoading: false
        },
        
        mounted: function() {
          this.initializeMiddleware();
          this.loadUserData();
        },
        
        methods: {
          initializeMiddleware: function() {
            var self = this;
            self.isLoading = true;
            
            // Initialize the Publishing Middleware if available
            if (window.PublishingMiddleware && !window.PublishingMiddleware.isInitialized) {
              window.PublishingMiddleware.initialize({
                authToken: Fliplet.User.getAuthToken(),
                environment: Fliplet.Env.get('environment') || 'production',
                appId: this.appInfo.id
              }).then(function() {
                self.loadInitialData();
              }).catch(function(error) {
                console.error('Failed to initialize middleware:', error);
                self.$root.$emit('show-notification', {
                  type: 'error',
                  message: 'Failed to initialize. Please refresh the page.',
                  duration: 0
                });
              }).finally(function() {
                self.isLoading = false;
              });
            } else {
              self.isLoading = false;
              self.loadInitialData();
            }
          },
          
          loadUserData: function() {
            var self = this;
            if (Fliplet.User) {
              Fliplet.User.getCachedSession().then(function(session) {
                if (session && session.entries && session.entries.dataSource) {
                  self.currentUser = {
                    name: session.entries.dataSource.data['Full Name'] || 
                          session.entries.dataSource.data['Email'] || 
                          'User',
                    email: session.entries.dataSource.data['Email'],
                    role: session.entries.dataSource.data['Role'] || 'user'
                  };
                  self.isAdmin = session.entries.dataSource.data['Admin'] === 'Yes';
                }
              });
            }
          },
          
          loadInitialData: function() {
            // Load submission history and platform statuses
            // This would use the middleware to fetch data
            console.log('Loading initial data...');
          },
          
          handlePlatformChange: function(platform) {
            this.currentPlatform = platform;
            if (platform) {
              this.currentView = 'workflow';
            } else {
              this.currentView = 'dashboard';
            }
          },
          
          handlePlatformSelection: function(platform) {
            this.currentPlatform = platform;
            this.currentView = 'workflow';
            
            this.$root.$emit('show-notification', {
              type: 'success',
              message: (platform === 'ios' ? 'iOS' : 'Android') + ' platform selected',
              duration: 3000
            });
          },
          
          handleNavigation: function(route) {
            switch (route) {
              case 'dashboard':
                this.currentPlatform = null;
                this.currentView = 'dashboard';
                break;
              case 'permissions':
                this.currentView = 'permissions';
                break;
              case 'help':
                this.openHelp();
                break;
              case 'settings':
                this.openSettings();
                break;
              default:
                console.warn('Unknown navigation route:', route);
            }
          },
          
          openHelp: function() {
            Fliplet.Navigate.url('https://help.fliplet.com/publishing');
          },
          
          openSettings: function() {
            this.$root.$emit('show-notification', {
              type: 'info',
              message: 'Settings will be available in a future update',
              duration: 3000
            });
          }
        }
      });
    }

    // Check if Vue is already loaded
    if (window.Vue) {
      initializeApp();
    } else {
      // Wait for Vue to be loaded
      Fliplet.Hooks.on('afterVueJsLoad', function() {
        initializeApp();
      });
    }
  });

})();