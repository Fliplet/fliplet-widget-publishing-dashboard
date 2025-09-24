const fs = require('fs');
const path = require('path');

const stylesDir = path.resolve(__dirname, '../../../src/styles');
const layoutDir = path.resolve(__dirname, '../../../src/components/layout');

describe('Theming and Responsive Design', () => {
  describe('Style Files', () => {
    it('should have variables.scss file', () => {
      expect(fs.existsSync(path.join(stylesDir, 'variables.scss'))).toBe(true);
    });

    it('should have global.scss file', () => {
      expect(fs.existsSync(path.join(stylesDir, 'global.scss'))).toBe(true);
    });

    it('should have mixins.scss file', () => {
      expect(fs.existsSync(path.join(stylesDir, 'mixins.scss'))).toBe(true);
    });
  });

  describe('Variables File', () => {
    it('should define brand colors', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'variables.scss'), 'utf8');
      expect(content).toContain('$fliplet-primary:');
      expect(content).toContain('$fliplet-secondary:');
      expect(content).toContain('$fliplet-accent:');
    });

    it('should define platform colors', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'variables.scss'), 'utf8');
      expect(content).toContain('$ios-color:');
      expect(content).toContain('$android-color:');
    });

    it('should define semantic colors', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'variables.scss'), 'utf8');
      expect(content).toContain('$success-color:');
      expect(content).toContain('$warning-color:');
      expect(content).toContain('$error-color:');
      expect(content).toContain('$info-color:');
    });

    it('should define breakpoints', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'variables.scss'), 'utf8');
      expect(content).toContain('$breakpoint-xs:');
      expect(content).toContain('$breakpoint-sm:');
      expect(content).toContain('$breakpoint-md:');
      expect(content).toContain('$breakpoint-lg:');
      expect(content).toContain('$breakpoint-xl:');
    });

    it('should define media query mixins', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'variables.scss'), 'utf8');
      expect(content).toContain('@mixin xs-up');
      expect(content).toContain('@mixin sm-up');
      expect(content).toContain('@mixin md-down');
      expect(content).toContain('@mixin lg-down');
    });
  });

  describe('Global Styles', () => {
    it('should set CSS custom properties', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain(':root {');
      expect(content).toContain('--primary-color:');
      expect(content).toContain('--spacing-md:');
      expect(content).toContain('--transition-speed:');
    });

    it('should include reset styles', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain('box-sizing: border-box');
      expect(content).toContain('margin: 0');
      expect(content).toContain('padding: 0');
    });

    it('should define button styles', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain('.btn {');
      expect(content).toContain('&-primary');
      expect(content).toContain('&-secondary');
      expect(content).toContain('&-success');
      expect(content).toContain('&-danger');
    });

    it('should define form styles', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain('.form-control {');
      expect(content).toContain('textarea.form-control');
      expect(content).toContain('select.form-control');
    });

    it('should define utility classes', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain('.text-center');
      expect(content).toContain('.d-flex');
      expect(content).toContain('.justify-content-center');
      // Check for spacing utility generation loop
      expect(content).toContain('@each $prop, $abbrev in (margin: m, padding: p)');
      expect(content).toContain('.#{$abbrev}-#{$size}');
      expect(content).toContain('.#{$abbrev}t-#{$size}');
      expect(content).toContain('.#{$abbrev}x-#{$size}');
    });

    it('should include responsive utilities', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain('.sm-hide');
      expect(content).toContain('.md-show');
      expect(content).toContain('@include sm-down');
    });
  });

  describe('Mixins File', () => {
    it('should define layout mixins', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'mixins.scss'), 'utf8');
      expect(content).toContain('@mixin clearfix');
      expect(content).toContain('@mixin center-element');
      expect(content).toContain('@mixin flex-center');
      expect(content).toContain('@mixin container');
    });

    it('should define typography mixins', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'mixins.scss'), 'utf8');
      expect(content).toContain('@mixin text-truncate');
      expect(content).toContain('@mixin line-clamp');
      expect(content).toContain('@mixin font-smoothing');
    });

    it('should define interactive mixins', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'mixins.scss'), 'utf8');
      expect(content).toContain('@mixin hover-effect');
      expect(content).toContain('@mixin button-reset');
      expect(content).toContain('@mixin focus-styles');
    });

    it('should define utility functions', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'mixins.scss'), 'utf8');
      expect(content).toContain('@function strip-unit');
      expect(content).toContain('@function rem');
      expect(content).toContain('@function em');
    });
  });

  describe('Responsive Components', () => {
    it('should have ResponsiveContainer component', () => {
      expect(fs.existsSync(path.join(layoutDir, 'ResponsiveContainer.vue'))).toBe(true);
    });

    it('should have ResponsiveGrid component', () => {
      expect(fs.existsSync(path.join(layoutDir, 'ResponsiveGrid.vue'))).toBe(true);
    });

    it('should have GridItem component', () => {
      expect(fs.existsSync(path.join(layoutDir, 'GridItem.vue'))).toBe(true);
    });
  });

  describe('ResponsiveContainer Features', () => {
    it('should support different container types', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'ResponsiveContainer.vue'), 'utf8');
      expect(content).toContain("['default', 'fluid', 'narrow', 'wide']");
      expect(content).toContain('&--fluid');
      expect(content).toContain('&--narrow');
      expect(content).toContain('&--wide');
    });

    it('should use container mixin', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'ResponsiveContainer.vue'), 'utf8');
      expect(content).toContain('@include container()');
    });
  });

  describe('ResponsiveGrid Features', () => {
    it('should support responsive columns', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'ResponsiveGrid.vue'), 'utf8');
      expect(content).toContain('columns:');
      expect(content).toContain('[Number, Object]');
      expect(content).toContain("['xs', 'sm', 'md', 'lg', 'xl']");
    });

    it('should support gap variations', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'ResponsiveGrid.vue'), 'utf8');
      expect(content).toContain('&--gap-none');
      expect(content).toContain('&--gap-sm');
      expect(content).toContain('&--gap-lg');
    });

    it('should support alignment options', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'ResponsiveGrid.vue'), 'utf8');
      expect(content).toContain('alignItems:');
      expect(content).toContain('justifyContent:');
      expect(content).toContain('&--align-center');
      expect(content).toContain('&--justify-between');
    });
  });

  describe('GridItem Features', () => {
    it('should support responsive span', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'GridItem.vue'), 'utf8');
      expect(content).toContain('span:');
      expect(content).toContain('grid-column: span');
    });

    it('should support offset and order', () => {
      const content = fs.readFileSync(path.join(layoutDir, 'GridItem.vue'), 'utf8');
      expect(content).toContain('offset:');
      expect(content).toContain('order:');
      expect(content).toContain('grid-column-start:');
    });
  });

  describe('Theme Integration', () => {
    it('Application.vue should import global styles', () => {
      const appPath = path.resolve(__dirname, '../../../src/Application.vue');
      const content = fs.readFileSync(appPath, 'utf8');
      expect(content).toContain("@import '@/styles/global.scss'");
    });

    it('should use responsive mixins in Application.vue', () => {
      const appPath = path.resolve(__dirname, '../../../src/Application.vue');
      const content = fs.readFileSync(appPath, 'utf8');
      expect(content).toContain('@include sm-down');
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode variables', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'variables.scss'), 'utf8');
      expect(content).toContain('@media (prefers-color-scheme: dark)');
    });
  });

  describe('Print Styles', () => {
    it('should include print media styles', () => {
      const content = fs.readFileSync(path.join(stylesDir, 'global.scss'), 'utf8');
      expect(content).toContain('@media print');
      expect(content).toContain('@page');
    });
  });
});