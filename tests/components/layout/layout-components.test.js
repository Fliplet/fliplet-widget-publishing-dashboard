const fs = require('fs');
const path = require('path');

describe('Layout Components', () => {
  const layoutDir = path.join(__dirname, '../../../src/components/layout');

  describe('Component Files', () => {
    it('should have AppShell.vue component', () => {
      const filePath = path.join(layoutDir, 'AppShell.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('<template>');
      expect(content).toContain('app-shell');
      expect(content).toContain('export default');
    });

    it('should have NavigationHeader.vue component', () => {
      const filePath = path.join(layoutDir, 'NavigationHeader.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('<template>');
      expect(content).toContain('navigation-header');
      expect(content).toContain('platform-switcher');
    });

    it('should have PlatformSelector.vue component', () => {
      const filePath = path.join(layoutDir, 'PlatformSelector.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('<template>');
      expect(content).toContain('platform-selector');
      expect(content).toContain('platform-card--ios');
      expect(content).toContain('platform-card--android');
    });

    it('should have FooterSection.vue component', () => {
      const filePath = path.join(layoutDir, 'FooterSection.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('<template>');
      expect(content).toContain('footer-section');
      expect(content).toContain('role="contentinfo"');
    });
  });

  describe('Component Structure', () => {
    it('AppShell should have proper component structure', () => {
      const filePath = path.join(layoutDir, 'AppShell.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required props
      expect(content).toContain('currentPlatform:');
      expect(content).toContain('user:');
      expect(content).toContain('appInfo:');
      expect(content).toContain('showAdminMenu:');
      
      // Check for key methods
      expect(content).toContain('handlePlatformChange');
      expect(content).toContain('handleNavigation');
      expect(content).toContain('checkViewport');
    });

    it('NavigationHeader should support mobile and desktop layouts', () => {
      const filePath = path.join(layoutDir, 'NavigationHeader.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Mobile elements
      expect(content).toContain('navigation-header__toggle');
      expect(content).toContain('mobile-nav');
      expect(content).toContain('hamburger');
      
      // Desktop elements
      expect(content).toContain('navigation-header__nav');
      expect(content).toContain('platform-switcher');
      
      // User menu
      expect(content).toContain('user-menu-toggle');
      expect(content).toContain('user-dropdown');
    });

    it('PlatformSelector should have iOS and Android cards', () => {
      const filePath = path.join(layoutDir, 'PlatformSelector.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Platform cards
      expect(content).toContain('iOS App Store');
      expect(content).toContain('Google Play Store');
      
      // Features
      expect(content).toContain('App Store Connect integration');
      expect(content).toContain('Google Play Console ready');
      
      // Events
      expect(content).toContain('select-platform');
      expect(content).toContain('$emit');
    });

    it('FooterSection should have all footer sections', () => {
      const filePath = path.join(layoutDir, 'FooterSection.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Footer sections
      expect(content).toContain('footer-nav');
      expect(content).toContain('footer-status');
      expect(content).toContain('footer-info');
      expect(content).toContain('footer-actions');
      
      // Links
      expect(content).toContain('developers.fliplet.com');
      expect(content).toContain('help.fliplet.com');
      expect(content).toContain('community.fliplet.com');
    });
  });

  describe('Component Integration', () => {
    it('Application.vue should import and use layout components', () => {
      const appPath = path.join(__dirname, '../../../src/Application.vue');
      const content = fs.readFileSync(appPath, 'utf8');
      
      // Check imports
      expect(content).toContain("import AppShell from './components/layout/AppShell.vue'");
      expect(content).toContain("import NavigationHeader from './components/layout/NavigationHeader.vue'");
      expect(content).toContain("import PlatformSelector from './components/layout/PlatformSelector.vue'");
      expect(content).toContain("import FooterSection from './components/layout/FooterSection.vue'");
      
      // Check component registration
      expect(content).toContain('AppShell,');
      expect(content).toContain('NavigationHeader,');
      expect(content).toContain('PlatformSelector,');
      expect(content).toContain('FooterSection,');
      
      // Check usage
      expect(content).toContain('<app-shell');
      expect(content).toContain('<platform-selector');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      const files = ['AppShell.vue', 'NavigationHeader.vue', 'PlatformSelector.vue', 'FooterSection.vue'];
      
      files.forEach(file => {
        const filePath = path.join(layoutDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for some ARIA attributes
        const hasAria = content.includes('role=') || 
                       content.includes('aria-label=') || 
                       content.includes('aria-expanded=') ||
                       content.includes('aria-describedby=');
        
        expect(hasAria).toBe(true);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes and viewport detection', () => {
      const appShellPath = path.join(layoutDir, 'AppShell.vue');
      const navHeaderPath = path.join(layoutDir, 'NavigationHeader.vue');
      
      const appShellContent = fs.readFileSync(appShellPath, 'utf8');
      const navHeaderContent = fs.readFileSync(navHeaderPath, 'utf8');
      
      // Check for responsive classes
      expect(appShellContent).toContain('app-shell--mobile');
      expect(appShellContent).toContain('app-shell--tablet');
      expect(appShellContent).toContain('app-shell--desktop');
      
      // Check for viewport detection
      expect(appShellContent).toContain('window.innerWidth');
      expect(appShellContent).toContain('isMobile');
      expect(appShellContent).toContain('isTablet');
      
      // Check navigation has mobile menu
      expect(navHeaderContent).toContain('mobileMenuOpen');
      expect(navHeaderContent).toContain('toggleMobileMenu');
    });
  });
});