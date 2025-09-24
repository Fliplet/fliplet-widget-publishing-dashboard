describe('PlatformSelector Component', () => {
  let Component;
  let vm;

  beforeEach(() => {
    jest.resetModules();
    
    // Mock child components
    jest.mock('../ui/StatusIndicator.vue', () => ({
      name: 'StatusIndicator',
      render: h => h('div', { class: 'mock-status-indicator' })
    }));
    
    jest.mock('../ui/LoadingSpinner.vue', () => ({
      name: 'LoadingSpinner', 
      render: h => h('div', { class: 'mock-loading-spinner' })
    }));
    
    Component = require('./PlatformSelector.vue').default;
  });

  afterEach(() => {
    if (vm) {
      vm.$destroy();
    }
  });

  describe('Rendering', () => {
    it('should render platform selector structure', () => {
      vm = createComponent(Component);
      
      expect(vm.$el.classList.contains('platform-selector')).toBe(true);
      expect(vm.$el.querySelector('.platform-selector__title')).toBeTruthy();
      expect(vm.$el.querySelector('.platform-cards')).toBeTruthy();
      
      const cards = vm.$el.querySelectorAll('.platform-card');
      expect(cards.length).toBe(2);
      expect(cards[0].classList.contains('platform-card--ios')).toBe(true);
      expect(cards[1].classList.contains('platform-card--android')).toBe(true);
    });

    it('should display platform names and icons', () => {
      vm = createComponent(Component);
      
      const iosCard = vm.$el.querySelector('.platform-card--ios');
      const androidCard = vm.$el.querySelector('.platform-card--android');
      
      expect(iosCard.querySelector('.platform-card__name').textContent).toBe('iOS App Store');
      expect(androidCard.querySelector('.platform-card__name').textContent).toBe('Google Play Store');
      
      expect(iosCard.querySelector('.fa-apple')).toBeTruthy();
      expect(androidCard.querySelector('.fa-android')).toBeTruthy();
    });

    it('should display platform features', () => {
      vm = createComponent(Component);
      
      const iosFeatures = vm.$el.querySelector('.platform-card--ios .platform-card__features');
      const androidFeatures = vm.$el.querySelector('.platform-card--android .platform-card__features');
      
      expect(iosFeatures.textContent).toContain('App Store Connect integration');
      expect(iosFeatures.textContent).toContain('Automatic certificate management');
      expect(iosFeatures.textContent).toContain('Push notification support');
      
      expect(androidFeatures.textContent).toContain('Google Play Console ready');
      expect(androidFeatures.textContent).toContain('Custom keystore support');
      expect(androidFeatures.textContent).toContain('Firebase integration');
    });
  });

  describe('Platform Status', () => {
    it('should show default status when no status provided', () => {
      vm = createComponent(Component);
      
      const iosStatus = vm.$el.querySelector('.platform-card--ios .status-text');
      const androidStatus = vm.$el.querySelector('.platform-card--android .status-text');
      
      expect(iosStatus.textContent).toBe('Ready to publish');
      expect(androidStatus.textContent).toBe('Ready to publish');
    });

    it('should display status indicator when status provided', async () => {
      vm = createComponent(Component, {
        iosStatus: { type: 'warning', message: 'Certificate expiring' },
        androidStatus: { type: 'error', message: 'Build failed' }
      });
      
      await nextTick();
      
      const iosIndicator = vm.$el.querySelector('.platform-card--ios .mock-status-indicator');
      const androidIndicator = vm.$el.querySelector('.platform-card--android .mock-status-indicator');
      
      expect(iosIndicator).toBeTruthy();
      expect(androidIndicator).toBeTruthy();
    });
  });

  describe('Last Submission Display', () => {
    it('should not show last build info when no submission data', () => {
      vm = createComponent(Component);
      
      const iosBuild = vm.$el.querySelector('.platform-card--ios .platform-card__last-build');
      const androidBuild = vm.$el.querySelector('.platform-card--android .platform-card__last-build');
      
      expect(iosBuild).toBeFalsy();
      expect(androidBuild).toBeFalsy();
    });

    it('should display last iOS submission info', () => {
      const lastSubmission = {
        date: new Date().toISOString(),
        version: '1.2.3'
      };
      
      vm = createComponent(Component, {
        lastIosSubmission: lastSubmission
      });
      
      const buildInfo = vm.$el.querySelector('.platform-card--ios .platform-card__last-build');
      expect(buildInfo).toBeTruthy();
      expect(buildInfo.textContent).toContain('Today');
      expect(buildInfo.textContent).toContain('v1.2.3');
    });

    it('should display last Android submission info', () => {
      const lastSubmission = {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        versionName: '2.0.0'
      };
      
      vm = createComponent(Component, {
        lastAndroidSubmission: lastSubmission
      });
      
      const buildInfo = vm.$el.querySelector('.platform-card--android .platform-card__last-build');
      expect(buildInfo).toBeTruthy();
      expect(buildInfo.textContent).toContain('1 week ago');
      expect(buildInfo.textContent).toContain('v2.0.0');
    });
  });

  describe('Platform Selection', () => {
    it('should emit select-platform event on iOS card click', () => {
      vm = createComponent(Component);
      const selectSpy = jest.fn();
      vm.$on('select-platform', selectSpy);
      
      const iosCard = vm.$el.querySelector('.platform-card--ios');
      iosCard.click();
      
      expect(selectSpy).toHaveBeenCalledWith('ios');
    });

    it('should emit select-platform event on Android card click', () => {
      vm = createComponent(Component);
      const selectSpy = jest.fn();
      vm.$on('select-platform', selectSpy);
      
      const androidCard = vm.$el.querySelector('.platform-card--android');
      androidCard.click();
      
      expect(selectSpy).toHaveBeenCalledWith('android');
    });

    it('should handle keyboard selection with Enter key', () => {
      vm = createComponent(Component);
      const selectSpy = jest.fn();
      vm.$on('select-platform', selectSpy);
      
      const iosCard = vm.$el.querySelector('.platform-card--ios');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      iosCard.dispatchEvent(enterEvent);
      
      expect(selectSpy).toHaveBeenCalledWith('ios');
    });

    it('should handle keyboard selection with Space key', () => {
      vm = createComponent(Component);
      const selectSpy = jest.fn();
      vm.$on('select-platform', selectSpy);
      
      const androidCard = vm.$el.querySelector('.platform-card--android');
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      androidCard.dispatchEvent(spaceEvent);
      
      expect(selectSpy).toHaveBeenCalledWith('android');
    });
  });

  describe('Loading States', () => {
    it('should show loading state for iOS', async () => {
      vm = createComponent(Component);
      vm.iosLoading = true;
      await nextTick();
      
      const iosCard = vm.$el.querySelector('.platform-card--ios');
      expect(iosCard.classList.contains('platform-card--loading')).toBe(true);
      expect(iosCard.querySelector('.mock-loading-spinner')).toBeTruthy();
      expect(iosCard.getAttribute('aria-disabled')).toBe('true');
    });

    it('should show loading state for Android', async () => {
      vm = createComponent(Component);
      vm.androidLoading = true;
      await nextTick();
      
      const androidCard = vm.$el.querySelector('.platform-card--android');
      expect(androidCard.classList.contains('platform-card--loading')).toBe(true);
      expect(androidCard.querySelector('.mock-loading-spinner')).toBeTruthy();
      expect(androidCard.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not emit event when card is loading', async () => {
      vm = createComponent(Component);
      const selectSpy = jest.fn();
      vm.$on('select-platform', selectSpy);
      
      vm.iosLoading = true;
      await nextTick();
      
      const iosCard = vm.$el.querySelector('.platform-card--ios');
      iosCard.click();
      
      expect(selectSpy).not.toHaveBeenCalled();
    });
  });

  describe('Admin Section', () => {
    it('should not show admin section by default', () => {
      vm = createComponent(Component);
      
      expect(vm.$el.querySelector('.platform-selector__admin')).toBeFalsy();
    });

    it('should show admin section when showAdminSection is true', () => {
      vm = createComponent(Component, {
        showAdminSection: true
      });
      
      const adminSection = vm.$el.querySelector('.platform-selector__admin');
      expect(adminSection).toBeTruthy();
      expect(adminSection.textContent).toContain('Admin Actions');
      expect(adminSection.textContent).toContain('Manage App Permissions');
    });

    it('should emit navigate event for permissions', () => {
      vm = createComponent(Component, {
        showAdminSection: true
      });
      const navigateSpy = jest.fn();
      vm.$on('navigate', navigateSpy);
      
      const permissionsButton = vm.$el.querySelector('.admin-section .btn');
      permissionsButton.click();
      
      expect(navigateSpy).toHaveBeenCalledWith('permissions');
    });
  });

  describe('Middleware Integration', () => {
    it('should initialize middleware when selecting platform', async () => {
      window.PublishingMiddleware.isInitialized = false;
      window.Fliplet.User.getAuthToken.mockReturnValue('test-token');
      window.Fliplet.Env.get.mockReturnValue('test');
      
      vm = createComponent(Component);
      const rootEmitSpy = jest.fn();
      vm.$root.$emit = rootEmitSpy;
      
      await vm.selectPlatform('ios');
      
      expect(window.PublishingMiddleware.initialize).toHaveBeenCalledWith({
        authToken: 'test-token',
        environment: 'test'
      });
    });

    it('should not reinitialize middleware if already initialized', async () => {
      window.PublishingMiddleware.isInitialized = true;
      window.PublishingMiddleware.initialize.mockClear();
      
      vm = createComponent(Component);
      
      await vm.selectPlatform('android');
      
      expect(window.PublishingMiddleware.initialize).not.toHaveBeenCalled();
    });

    it('should handle middleware initialization errors', async () => {
      window.PublishingMiddleware.isInitialized = false;
      window.PublishingMiddleware.initialize.mockRejectedValue(new Error('Init failed'));
      
      vm = createComponent(Component);
      const rootEmitSpy = jest.fn();
      vm.$root.$emit = rootEmitSpy;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await vm.selectPlatform('ios');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error selecting ios platform:', expect.any(Error));
      expect(rootEmitSpy).toHaveBeenCalledWith('show-notification', {
        type: 'error',
        message: 'Failed to select ios platform. Please try again.',
        duration: 5000
      });
      expect(vm.iosLoading).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    it('should format today correctly', () => {
      vm = createComponent(Component);
      
      const today = new Date().toISOString();
      expect(vm.formatDate(today)).toBe('Today');
    });

    it('should format yesterday correctly', () => {
      vm = createComponent(Component);
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(vm.formatDate(yesterday)).toBe('Yesterday');
    });

    it('should format days ago correctly', () => {
      vm = createComponent(Component);
      
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(vm.formatDate(threeDaysAgo)).toBe('3 days ago');
    });

    it('should format weeks ago correctly', () => {
      vm = createComponent(Component);
      
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      expect(vm.formatDate(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('should format older dates as locale string', () => {
      vm = createComponent(Component);
      
      const oldDate = new Date('2023-01-01').toISOString();
      const formatted = vm.formatDate(oldDate);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should handle null date', () => {
      vm = createComponent(Component);
      
      expect(vm.formatDate(null)).toBe('Never');
      expect(vm.formatDate(undefined)).toBe('Never');
      expect(vm.formatDate('')).toBe('Never');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role and tabindex for cards', () => {
      vm = createComponent(Component);
      
      const cards = vm.$el.querySelectorAll('.platform-card');
      cards.forEach(card => {
        expect(card.getAttribute('role')).toBe('button');
        expect(card.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should have aria-label for feature lists', () => {
      vm = createComponent(Component);
      
      const iosFeatures = vm.$el.querySelector('.platform-card--ios .platform-card__features');
      const androidFeatures = vm.$el.querySelector('.platform-card--android .platform-card__features');
      
      expect(iosFeatures.getAttribute('aria-label')).toBe('iOS features');
      expect(androidFeatures.getAttribute('aria-label')).toBe('Android features');
    });

    it('should have aria-disabled when loading', async () => {
      vm = createComponent(Component);
      
      const iosCard = vm.$el.querySelector('.platform-card--ios');
      expect(iosCard.getAttribute('aria-disabled')).toBe('false');
      
      vm.iosLoading = true;
      await nextTick();
      
      expect(iosCard.getAttribute('aria-disabled')).toBe('true');
    });
  });
});