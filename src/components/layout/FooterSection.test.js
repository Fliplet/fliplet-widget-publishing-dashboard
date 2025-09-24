describe('FooterSection Component', () => {
  let Component;
  let vm;

  beforeEach(() => {
    jest.resetModules();
    Component = require('./FooterSection.vue').default;
  });

  afterEach(() => {
    if (vm) {
      vm.$destroy();
    }
  });

  describe('Rendering', () => {
    it('should render footer structure', () => {
      vm = createComponent(Component);
      
      expect(vm.$el.classList.contains('footer-section')).toBe(true);
      expect(vm.$el.querySelector('.footer-section__container')).toBeTruthy();
      expect(vm.$el.querySelector('.footer-nav')).toBeTruthy();
      expect(vm.$el.querySelector('.footer-status')).toBeTruthy();
      expect(vm.$el.querySelector('.footer-info')).toBeTruthy();
    });

    it('should display resource links', () => {
      vm = createComponent(Component);
      
      const links = vm.$el.querySelectorAll('.footer-nav__list a');
      const linkTexts = Array.from(links).map(link => link.textContent.trim());
      
      expect(linkTexts).toContain('Documentation');
      expect(linkTexts).toContain('Publishing Guide');
      expect(linkTexts).toContain('Community Forum');
    });

    it('should have correct href attributes for links', () => {
      vm = createComponent(Component);
      
      const docLink = Array.from(vm.$el.querySelectorAll('.footer-link'))
        .find(link => link.textContent.includes('Documentation'));
      const guideLink = Array.from(vm.$el.querySelectorAll('.footer-link'))
        .find(link => link.textContent.includes('Publishing Guide'));
      
      expect(docLink.href).toBe('https://developers.fliplet.com/');
      expect(guideLink.href).toBe('https://help.fliplet.com/publishing');
      expect(docLink.target).toBe('_blank');
      expect(docLink.rel).toBe('noopener noreferrer');
    });
  });

  describe('Version Information', () => {
    it('should display default version', () => {
      vm = createComponent(Component);
      
      const versionInfo = vm.$el.querySelector('.version-info');
      expect(versionInfo.textContent).toContain('Version 1.0.0');
    });

    it('should display custom version', () => {
      vm = createComponent(Component, {
        version: '2.5.1'
      });
      
      const versionInfo = vm.$el.querySelector('.version-info');
      expect(versionInfo.textContent).toContain('Version 2.5.1');
    });

    it('should display build number when provided', () => {
      vm = createComponent(Component, {
        version: '1.0.0',
        buildNumber: '12345'
      });
      
      const versionInfo = vm.$el.querySelector('.version-info');
      expect(versionInfo.textContent).toContain('(Build 12345)');
    });

    it('should display current year in copyright', () => {
      vm = createComponent(Component);
      
      const copyright = vm.$el.querySelector('.copyright');
      const currentYear = new Date().getFullYear();
      expect(copyright.textContent).toContain(`© ${currentYear} Fliplet Ltd.`);
    });
  });

  describe('Platform Status', () => {
    it('should display default operational status', () => {
      vm = createComponent(Component);
      
      const statusDots = vm.$el.querySelectorAll('.status-dot');
      expect(statusDots.length).toBe(3);
      
      statusDots.forEach(dot => {
        expect(dot.classList.contains('status-dot--operational')).toBe(true);
      });
    });

    it('should display custom platform statuses', () => {
      vm = createComponent(Component, {
        platformStatuses: {
          ios: 'degraded',
          android: 'outage',
          api: 'operational'
        }
      });
      
      const statusItems = vm.$el.querySelectorAll('.status-item');
      const iosStatus = statusItems[0].querySelector('.status-dot');
      const androidStatus = statusItems[1].querySelector('.status-dot');
      const apiStatus = statusItems[2].querySelector('.status-dot');
      
      expect(iosStatus.classList.contains('status-dot--degraded')).toBe(true);
      expect(androidStatus.classList.contains('status-dot--outage')).toBe(true);
      expect(apiStatus.classList.contains('status-dot--operational')).toBe(true);
    });

    it('should have link to status page', () => {
      vm = createComponent(Component);
      
      const statusLink = vm.$el.querySelector('.status-link');
      expect(statusLink.href).toBe('https://status.fliplet.com/');
      expect(statusLink.textContent).toContain('View detailed status');
    });
  });

  describe('Quick Actions', () => {
    it('should show quick actions by default', () => {
      vm = createComponent(Component);
      
      const quickActions = vm.$el.querySelector('.footer-actions');
      expect(quickActions).toBeTruthy();
      
      const actionButtons = quickActions.querySelectorAll('.quick-action');
      expect(actionButtons.length).toBe(3);
    });

    it('should hide quick actions when showQuickActions is false', () => {
      vm = createComponent(Component, {
        showQuickActions: false
      });
      
      const quickActions = vm.$el.querySelector('.footer-actions');
      expect(quickActions).toBeFalsy();
    });

    it('should emit event for keyboard shortcuts', () => {
      vm = createComponent(Component);
      const rootEmitSpy = jest.fn();
      vm.$root.$emit = rootEmitSpy;
      
      const keyboardButton = vm.$el.querySelector('[title="Keyboard shortcuts"]');
      keyboardButton.click();
      
      expect(rootEmitSpy).toHaveBeenCalledWith('show-keyboard-shortcuts');
    });

    it('should scroll to top when arrow button clicked', () => {
      const scrollToSpy = jest.fn();
      window.scrollTo = scrollToSpy;
      
      vm = createComponent(Component);
      
      const scrollButton = vm.$el.querySelector('[title="Back to top"]');
      scrollButton.click();
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });
  });

  describe('Support Actions', () => {
    it('should open support when contact button clicked', () => {
      window.Fliplet.Navigate.url = jest.fn();
      
      vm = createComponent(Component);
      
      const supportButton = vm.$el.querySelector('.footer-link--button');
      supportButton.click();
      
      expect(window.Fliplet.Navigate.url).toHaveBeenCalledWith('https://help.fliplet.com/contact');
    });

    it('should fallback to window.open when Fliplet.Navigate not available', () => {
      delete window.Fliplet.Navigate;
      const openSpy = jest.spyOn(window, 'open').mockImplementation();
      
      vm = createComponent(Component);
      
      const supportButton = vm.$el.querySelector('.footer-link--button');
      supportButton.click();
      
      expect(openSpy).toHaveBeenCalledWith('https://help.fliplet.com/contact', '_blank');
      
      openSpy.mockRestore();
    });

    it('should open email client for reporting issues', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation();
      
      vm = createComponent(Component);
      vm.$parent = { currentPlatform: 'ios' };
      
      const reportButton = vm.$el.querySelector('[title="Report an issue"]');
      reportButton.click();
      
      expect(openSpy).toHaveBeenCalled();
      const callArg = openSpy.mock.calls[0][0];
      expect(callArg).toContain('mailto:support@fliplet.com');
      expect(callArg).toContain('subject=Publishing%20Dashboard%20Issue');
      expect(callArg).toContain('Platform%3A%20ios');
      expect(callArg).toContain('Version%3A%201.0.0');
      
      openSpy.mockRestore();
    });
  });

  describe('Footer Links', () => {
    it('should display privacy and terms links', () => {
      vm = createComponent(Component);
      
      const footerLinks = vm.$el.querySelector('.footer-links');
      const privacyLink = footerLinks.querySelector('[href="https://fliplet.com/privacy"]');
      const termsLink = footerLinks.querySelector('[href="https://fliplet.com/terms"]');
      
      expect(privacyLink).toBeTruthy();
      expect(privacyLink.textContent).toBe('Privacy Policy');
      expect(termsLink).toBeTruthy();
      expect(termsLink.textContent).toBe('Terms of Service');
    });

    it('should have separator between links', () => {
      vm = createComponent(Component);
      
      const separator = vm.$el.querySelector('.footer-links .separator');
      expect(separator).toBeTruthy();
      expect(separator.textContent).toBe('·');
    });
  });

  describe('Accessibility', () => {
    it('should have contentinfo role', () => {
      vm = createComponent(Component);
      
      expect(vm.$el.getAttribute('role')).toBe('contentinfo');
    });

    it('should have navigation role and label', () => {
      vm = createComponent(Component);
      
      const nav = vm.$el.querySelector('.footer-nav');
      expect(nav.getAttribute('aria-label')).toBe('Footer navigation');
    });

    it('should have screen reader text for icon buttons', () => {
      vm = createComponent(Component);
      
      const keyboardButton = vm.$el.querySelector('[title="Keyboard shortcuts"]');
      const srText = keyboardButton.querySelector('.sr-only');
      expect(srText.textContent).toBe('Keyboard shortcuts');
    });

    it('should have proper link attributes', () => {
      vm = createComponent(Component);
      
      const externalLinks = vm.$el.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });
  });

  describe('Icon Display', () => {
    it('should display appropriate icons for links', () => {
      vm = createComponent(Component);
      
      const docLink = Array.from(vm.$el.querySelectorAll('.footer-link'))
        .find(link => link.textContent.includes('Documentation'));
      const helpLink = Array.from(vm.$el.querySelectorAll('.footer-link'))
        .find(link => link.textContent.includes('Publishing Guide'));
      const communityLink = Array.from(vm.$el.querySelectorAll('.footer-link'))
        .find(link => link.textContent.includes('Community Forum'));
      
      expect(docLink.querySelector('.fa-book')).toBeTruthy();
      expect(helpLink.querySelector('.fa-question-circle')).toBeTruthy();
      expect(communityLink.querySelector('.fa-users')).toBeTruthy();
    });

    it('should display icons for quick actions', () => {
      vm = createComponent(Component);
      
      const keyboardButton = vm.$el.querySelector('[title="Keyboard shortcuts"]');
      const bugButton = vm.$el.querySelector('[title="Report an issue"]');
      const scrollButton = vm.$el.querySelector('[title="Back to top"]');
      
      expect(keyboardButton.querySelector('.fa-keyboard')).toBeTruthy();
      expect(bugButton.querySelector('.fa-bug')).toBeTruthy();
      expect(scrollButton.querySelector('.fa-arrow-up')).toBeTruthy();
    });
  });

  describe('Methods', () => {
    it('should get correct status class', () => {
      vm = createComponent(Component);
      
      expect(vm.getStatusClass('ios')).toBe('status-dot--operational');
      
      vm.platformStatuses = {
        ios: 'degraded',
        android: 'outage'
      };
      
      expect(vm.getStatusClass('ios')).toBe('status-dot--degraded');
      expect(vm.getStatusClass('android')).toBe('status-dot--outage');
      expect(vm.getStatusClass('unknown')).toBe('status-dot--operational');
    });

    it('should get current platform from parent', () => {
      vm = createComponent(Component);
      vm.$parent = { currentPlatform: 'android' };
      
      expect(vm.getCurrentPlatform()).toBe('android');
    });

    it('should return default when no parent platform', () => {
      vm = createComponent(Component);
      
      expect(vm.getCurrentPlatform()).toBe('Not selected');
    });
  });
});