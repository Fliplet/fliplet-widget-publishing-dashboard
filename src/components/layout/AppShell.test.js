describe('AppShell Component', () => {
  let Component;
  let vm;

  beforeEach(() => {
    // Clear module cache to get fresh component
    jest.resetModules();
    
    // Mock child components
    jest.mock('./NavigationHeader.vue', () => ({
      name: 'NavigationHeader',
      render: h => h('div', { class: 'mock-navigation-header' })
    }));
    
    jest.mock('./FooterSection.vue', () => ({
      name: 'FooterSection',
      render: h => h('div', { class: 'mock-footer-section' })
    }));
    
    jest.mock('../feedback/LoadingOverlay.vue', () => ({
      name: 'LoadingOverlay',
      render: h => h('div', { class: 'mock-loading-overlay' })
    }));
    
    jest.mock('../feedback/NotificationToast.vue', () => ({
      name: 'NotificationToast',
      render: h => h('div', { class: 'mock-notification-toast' })
    }));
    
    Component = require('./AppShell.vue').default;
  });

  afterEach(() => {
    if (vm) {
      vm.$destroy();
    }
  });

  describe('Rendering', () => {
    it('should render the app shell structure', () => {
      vm = createComponent(Component);
      
      expect(vm.$el.classList.contains('app-shell')).toBe(true);
      expect(vm.$el.querySelector('.app-shell__content')).toBeTruthy();
      expect(vm.$el.querySelector('.mock-navigation-header')).toBeTruthy();
      expect(vm.$el.querySelector('.mock-footer-section')).toBeTruthy();
      expect(vm.$el.querySelector('.mock-notification-toast')).toBeTruthy();
    });

    it('should hide header when showHeader is false', () => {
      vm = createComponent(Component, {
        showHeader: false
      });
      
      expect(vm.$el.querySelector('.mock-navigation-header')).toBeFalsy();
    });

    it('should hide footer when showFooter is false', () => {
      vm = createComponent(Component, {
        showFooter: false
      });
      
      expect(vm.$el.querySelector('.mock-footer-section')).toBeFalsy();
    });

    it('should show loading overlay when globalLoading is true', async () => {
      vm = createComponent(Component);
      
      vm.globalLoading = true;
      vm.loadingMessage = 'Test loading...';
      
      await nextTick();
      
      const loadingOverlay = vm.$el.querySelector('.mock-loading-overlay');
      expect(loadingOverlay).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should accept and validate currentPlatform prop', () => {
      vm = createComponent(Component, {
        currentPlatform: 'ios'
      });
      
      expect(vm.currentPlatform).toBe('ios');
      expect(vm.$el.classList.contains('app-shell--ios')).toBe(true);
    });

    it('should apply platform-specific classes', () => {
      vm = createComponent(Component, {
        currentPlatform: 'android'
      });
      
      expect(vm.$el.classList.contains('app-shell--android')).toBe(true);
    });

    it('should pass props to child components', () => {
      const mockUser = { name: 'Test User' };
      const mockAppInfo = { name: 'Test App' };
      
      vm = createComponent(Component, {
        currentPlatform: 'ios',
        user: mockUser,
        appInfo: mockAppInfo,
        showAdminMenu: true
      });
      
      // Props would be passed to NavigationHeader
      expect(vm.user).toEqual(mockUser);
      expect(vm.appInfo).toEqual(mockAppInfo);
      expect(vm.showAdminMenu).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('should detect mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      vm = createComponent(Component);
      
      expect(vm.isMobile).toBe(true);
      expect(vm.isTablet).toBe(false);
      expect(vm.$el.classList.contains('app-shell--mobile')).toBe(true);
    });

    it('should detect tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });
      
      vm = createComponent(Component);
      
      expect(vm.isMobile).toBe(false);
      expect(vm.isTablet).toBe(true);
      expect(vm.$el.classList.contains('app-shell--tablet')).toBe(true);
    });

    it('should detect desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });
      
      vm = createComponent(Component);
      
      expect(vm.isMobile).toBe(false);
      expect(vm.isTablet).toBe(false);
      expect(vm.$el.classList.contains('app-shell--desktop')).toBe(true);
    });

    it('should handle window resize', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });
      
      vm = createComponent(Component);
      expect(vm.$el.classList.contains('app-shell--desktop')).toBe(true);
      
      // Change viewport size
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
      
      // Wait for debounced resize handler
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(vm.isMobile).toBe(true);
      expect(vm.$el.classList.contains('app-shell--mobile')).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should emit platform-change event', () => {
      vm = createComponent(Component);
      const platformChangeSpy = jest.fn();
      vm.$on('platform-change', platformChangeSpy);
      
      vm.handlePlatformChange('android');
      
      expect(platformChangeSpy).toHaveBeenCalledWith('android');
    });

    it('should emit navigate event', () => {
      vm = createComponent(Component);
      const navigateSpy = jest.fn();
      vm.$on('navigate', navigateSpy);
      
      vm.handleNavigation('permissions');
      
      expect(navigateSpy).toHaveBeenCalledWith('permissions');
    });

    it('should handle show-loading event', async () => {
      vm = createComponent(Component);
      
      vm.$root.$emit('show-loading', 'Custom loading message');
      await nextTick();
      
      expect(vm.globalLoading).toBe(true);
      expect(vm.loadingMessage).toBe('Custom loading message');
    });

    it('should handle hide-loading event', async () => {
      vm = createComponent(Component);
      vm.globalLoading = true;
      
      vm.$root.$emit('hide-loading');
      await nextTick();
      
      expect(vm.globalLoading).toBe(false);
    });
  });

  describe('Middleware Integration', () => {
    it('should listen to middleware events when initialized', () => {
      window.PublishingMiddleware.isInitialized = true;
      
      vm = createComponent(Component);
      
      expect(window.PublishingMiddleware.on).toHaveBeenCalledWith('api-error', expect.any(Function));
      expect(window.PublishingMiddleware.on).toHaveBeenCalledWith('workflow-started', expect.any(Function));
      expect(window.PublishingMiddleware.on).toHaveBeenCalledWith('workflow-completed', expect.any(Function));
    });

    it('should not listen to middleware events when not initialized', () => {
      window.PublishingMiddleware.isInitialized = false;
      window.PublishingMiddleware.on.mockClear();
      
      vm = createComponent(Component);
      
      expect(window.PublishingMiddleware.on).not.toHaveBeenCalled();
    });

    it('should handle API errors from middleware', async () => {
      window.PublishingMiddleware.isInitialized = true;
      const rootEmitSpy = jest.fn();
      
      vm = createComponent(Component);
      vm.$root.$emit = rootEmitSpy;
      
      // Simulate API error
      const errorHandler = window.PublishingMiddleware.on.mock.calls
        .find(call => call[0] === 'api-error')[1];
      
      errorHandler({ message: 'API Error occurred' });
      
      expect(rootEmitSpy).toHaveBeenCalledWith('show-notification', {
        type: 'error',
        message: 'API Error occurred',
        duration: 5000
      });
    });

    it('should clean up middleware listeners on destroy', () => {
      window.PublishingMiddleware.isInitialized = true;
      
      vm = createComponent(Component);
      vm.$destroy();
      
      expect(window.PublishingMiddleware.off).toHaveBeenCalledWith('api-error', expect.any(Function));
      expect(window.PublishingMiddleware.off).toHaveBeenCalledWith('workflow-started', expect.any(Function));
      expect(window.PublishingMiddleware.off).toHaveBeenCalledWith('workflow-completed', expect.any(Function));
    });
  });

  describe('Lifecycle', () => {
    it('should set up event listeners on created', () => {
      const rootOnSpy = jest.fn();
      
      vm = createComponent(Component, {}, {
        parent: {
          $on: rootOnSpy
        }
      });
      
      // Check that global event listeners are set up
      expect(vm.resizeTimeout).toBeDefined();
    });

    it('should clean up on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      vm = createComponent(Component);
      vm.$destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});