describe('NavigationHeader Component', () => {
  let Component;
  let vm;

  beforeEach(() => {
    jest.resetModules();
    Component = require('./NavigationHeader.vue').default;
  });

  afterEach(() => {
    if (vm) {
      vm.$destroy();
    }
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should render the navigation header structure', () => {
      vm = createComponent(Component);
      
      expect(vm.$el.classList.contains('navigation-header')).toBe(true);
      expect(vm.$el.querySelector('.navigation-header__container')).toBeTruthy();
      expect(vm.$el.querySelector('.navigation-header__brand')).toBeTruthy();
      expect(vm.$el.querySelector('.navigation-header__user')).toBeTruthy();
    });

    it('should display app name from appInfo', () => {
      vm = createComponent(Component, {
        appInfo: { name: 'Test App', logo: null }
      });
      
      const brandTitle = vm.$el.querySelector('.brand-title');
      expect(brandTitle.textContent).toBe('Test App');
    });

    it('should display app logo when provided', () => {
      vm = createComponent(Component, {
        appInfo: { name: 'Test App', logo: '/path/to/logo.png' }
      });
      
      const brandLogo = vm.$el.querySelector('.brand-logo');
      expect(brandLogo).toBeTruthy();
      expect(brandLogo.src).toContain('/path/to/logo.png');
      expect(brandLogo.alt).toBe('Test App logo');
    });

    it('should render desktop navigation when not mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });
      
      vm = createComponent(Component);
      
      expect(vm.$el.querySelector('.navigation-header__nav')).toBeTruthy();
      expect(vm.$el.querySelector('.navigation-header__toggle')).toBeFalsy();
    });

    it('should render mobile toggle when on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      vm = createComponent(Component);
      
      expect(vm.$el.querySelector('.navigation-header__toggle')).toBeTruthy();
      expect(vm.$el.querySelector('.navigation-header__nav')).toBeFalsy();
    });
  });

  describe('Platform Switcher', () => {
    it('should highlight active platform', () => {
      vm = createComponent(Component, {
        currentPlatform: 'ios'
      });
      
      const iosButton = vm.$el.querySelector('.platform-switcher:first-child');
      const androidButton = vm.$el.querySelector('.platform-switcher:last-child');
      
      expect(iosButton.classList.contains('active')).toBe(true);
      expect(androidButton.classList.contains('active')).toBe(false);
    });

    it('should emit platform-change event when platform is selected', () => {
      vm = createComponent(Component);
      const platformChangeSpy = jest.fn();
      vm.$on('platform-change', platformChangeSpy);
      
      const androidButton = vm.$el.querySelectorAll('.platform-switcher')[1];
      androidButton.click();
      
      expect(platformChangeSpy).toHaveBeenCalledWith('android');
    });

    it('should not emit event when selecting current platform', () => {
      vm = createComponent(Component, {
        currentPlatform: 'ios'
      });
      const platformChangeSpy = jest.fn();
      vm.$on('platform-change', platformChangeSpy);
      
      const iosButton = vm.$el.querySelector('.platform-switcher');
      iosButton.click();
      
      expect(platformChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Admin Menu', () => {
    it('should show admin menu items when showAdminMenu is true', () => {
      vm = createComponent(Component, {
        showAdminMenu: true
      });
      
      const permissionsButton = Array.from(vm.$el.querySelectorAll('.nav-link'))
        .find(el => el.textContent.includes('Permissions'));
      
      expect(permissionsButton).toBeTruthy();
    });

    it('should hide admin menu items when showAdminMenu is false', () => {
      vm = createComponent(Component, {
        showAdminMenu: false
      });
      
      const permissionsButton = Array.from(vm.$el.querySelectorAll('.nav-link'))
        .find(el => el.textContent.includes('Permissions'));
      
      expect(permissionsButton).toBeFalsy();
    });

    it('should emit navigate event for permissions', () => {
      vm = createComponent(Component, {
        showAdminMenu: true
      });
      const navigateSpy = jest.fn();
      vm.$on('navigate', navigateSpy);
      
      const permissionsButton = Array.from(vm.$el.querySelectorAll('.nav-link'))
        .find(el => el.textContent.includes('Permissions'));
      permissionsButton.click();
      
      expect(navigateSpy).toHaveBeenCalledWith('permissions');
    });
  });

  describe('User Menu', () => {
    it('should display user name', () => {
      vm = createComponent(Component, {
        user: { name: 'John Doe', email: 'john@example.com' }
      });
      
      const userName = vm.$el.querySelector('.user-name');
      expect(userName).toBeTruthy();
      expect(userName.textContent).toBe('John Doe');
    });

    it('should toggle user dropdown on click', async () => {
      vm = createComponent(Component);
      
      const userMenuToggle = vm.$el.querySelector('.user-menu-toggle');
      expect(vm.userMenuOpen).toBe(false);
      
      userMenuToggle.click();
      await nextTick();
      
      expect(vm.userMenuOpen).toBe(true);
      expect(vm.$el.querySelector('.user-dropdown')).toBeTruthy();
      
      userMenuToggle.click();
      await nextTick();
      
      expect(vm.userMenuOpen).toBe(false);
      expect(vm.$el.querySelector('.user-dropdown')).toBeFalsy();
    });

    it('should display user info in dropdown', async () => {
      vm = createComponent(Component, {
        user: { name: 'John Doe', email: 'john@example.com' }
      });
      
      vm.userMenuOpen = true;
      await nextTick();
      
      const userInfo = vm.$el.querySelector('.user-info');
      expect(userInfo.querySelector('strong').textContent).toBe('John Doe');
      expect(userInfo.querySelector('small').textContent).toBe('john@example.com');
    });

    it('should emit navigate events from user menu', async () => {
      vm = createComponent(Component);
      const navigateSpy = jest.fn();
      vm.$on('navigate', navigateSpy);
      
      vm.userMenuOpen = true;
      await nextTick();
      
      const helpButton = Array.from(vm.$el.querySelectorAll('.dropdown-item'))
        .find(el => el.textContent.includes('Help'));
      helpButton.click();
      
      expect(navigateSpy).toHaveBeenCalledWith('help');
      expect(vm.userMenuOpen).toBe(false);
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
    });

    it('should toggle mobile menu', async () => {
      vm = createComponent(Component);
      
      const toggleButton = vm.$el.querySelector('.navigation-header__toggle');
      expect(vm.mobileMenuOpen).toBe(false);
      
      toggleButton.click();
      await nextTick();
      
      expect(vm.mobileMenuOpen).toBe(true);
      expect(vm.$el.querySelector('.mobile-nav')).toBeTruthy();
      expect(vm.$el.querySelector('.mobile-backdrop')).toBeTruthy();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should close mobile menu on backdrop click', async () => {
      vm = createComponent(Component);
      vm.mobileMenuOpen = true;
      await nextTick();
      
      const backdrop = vm.$el.querySelector('.mobile-backdrop');
      backdrop.click();
      await nextTick();
      
      expect(vm.mobileMenuOpen).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should emit platform-change from mobile menu', async () => {
      vm = createComponent(Component);
      const platformChangeSpy = jest.fn();
      vm.$on('platform-change', platformChangeSpy);
      
      vm.mobileMenuOpen = true;
      await nextTick();
      
      const androidButton = Array.from(vm.$el.querySelectorAll('.mobile-nav__link'))
        .find(el => el.textContent.includes('Android'));
      androidButton.click();
      
      expect(platformChangeSpy).toHaveBeenCalledWith('android');
      expect(vm.mobileMenuOpen).toBe(false);
    });

    it('should close mobile menu on navigation', async () => {
      vm = createComponent(Component, {
        showAdminMenu: true
      });
      const navigateSpy = jest.fn();
      vm.$on('navigate', navigateSpy);
      
      vm.mobileMenuOpen = true;
      await nextTick();
      
      const permissionsButton = Array.from(vm.$el.querySelectorAll('.mobile-nav__link'))
        .find(el => el.textContent.includes('Permissions'));
      permissionsButton.click();
      
      expect(navigateSpy).toHaveBeenCalledWith('permissions');
      expect(vm.mobileMenuOpen).toBe(false);
    });
  });

  describe('Responsive Behavior', () => {
    it('should update layout on resize', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });
      
      vm = createComponent(Component);
      expect(vm.isMobile).toBe(false);
      
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(vm.isMobile).toBe(true);
    });

    it('should close mobile menu when resizing to desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      vm = createComponent(Component);
      vm.mobileMenuOpen = true;
      
      window.innerWidth = 1200;
      window.dispatchEvent(new Event('resize'));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(vm.mobileMenuOpen).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for mobile toggle', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      vm = createComponent(Component);
      const toggle = vm.$el.querySelector('.navigation-header__toggle');
      
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(toggle.getAttribute('aria-label')).toBe('Toggle navigation menu');
      
      vm.mobileMenuOpen = true;
      vm.$nextTick(() => {
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
      });
    });

    it('should have proper ARIA attributes for navigation', () => {
      vm = createComponent(Component);
      
      const nav = vm.$el.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('aria-label')).toBe('Main navigation');
    });

    it('should have proper role for dropdown menu', async () => {
      vm = createComponent(Component);
      vm.userMenuOpen = true;
      await nextTick();
      
      const dropdown = vm.$el.querySelector('.user-dropdown');
      expect(dropdown.getAttribute('role')).toBe('menu');
      
      const menuItems = dropdown.querySelectorAll('.dropdown-item');
      menuItems.forEach(item => {
        expect(item.getAttribute('role')).toBe('menuitem');
      });
    });
  });
});