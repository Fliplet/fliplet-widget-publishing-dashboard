const fs = require('fs');
const path = require('path');

const componentPath = path.resolve(__dirname, './WorkflowStep.vue');

describe('WorkflowStep Component', () => {
  describe('Component File', () => {
    it('should exist', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should have proper component structure', () => {
      const content = fs.readFileSync(componentPath, 'utf8');
      expect(content).toContain('<template>');
      expect(content).toContain('<script>');
      expect(content).toContain('<style');
      expect(content).toContain('name: \'WorkflowStep\'');
    });
  });

  describe('Component Features', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should have all required props', () => {
      expect(content).toContain('stepName:');
      expect(content).toContain('required: true');
      expect(content).toContain('isValid:');
      expect(content).toContain('processing:');
      expect(content).toContain('nextButtonText:');
      expect(content).toContain('canGoBack:');
      expect(content).toContain('stepTitle:');
      expect(content).toContain('stepStatus:');
    });

    it('should validate stepStatus prop values', () => {
      expect(content).toContain('validator: (value)');
      expect(content).toContain('[\'pending\', \'in-progress\', \'completed\', \'error\']');
    });

    it('should have proper template structure', () => {
      expect(content).toContain('class="workflow-step"');
      expect(content).toContain('class="step-header"');
      expect(content).toContain('class="step-title"');
      expect(content).toContain('class="step-status"');
      expect(content).toContain('class="step-content"');
      expect(content).toContain('<slot />');
      expect(content).toContain('class="step-actions"');
    });

    it('should have back and submit buttons', () => {
      expect(content).toContain('v-if="canGoBack"');
      expect(content).toContain('@click="goBack"');
      expect(content).toContain('class="btn btn-secondary"');
      expect(content).toContain('@click="submitStep"');
      expect(content).toContain('class="btn btn-primary"');
      expect(content).toContain(':disabled="!isValid || processing"');
    });

    it('should emit proper events', () => {
      expect(content).toContain('this.$emit(\'submit\')');
      expect(content).toContain('this.$emit(\'back\')');
    });

    it('should have computed properties for dynamic classes', () => {
      expect(content).toContain('stepClasses()');
      expect(content).toContain('workflow-step--processing');
      expect(content).toContain('workflow-step--valid');
      expect(content).toContain('workflow-step--invalid');
      expect(content).toContain('statusClass()');
    });

    it('should prevent actions when processing', () => {
      expect(content).toContain('!this.processing');
      expect(content).toContain(':disabled="processing"');
    });

    it('should have responsive styles', () => {
      expect(content).toContain('@media (max-width: 768px)');
      expect(content).toContain('flex-direction: column');
    });

    it('should have dark mode support', () => {
      expect(content).toContain('@media (prefers-color-scheme: dark)');
      expect(content).toContain('background-color: #1f2937');
    });

    it('should use CSS custom properties for theming', () => {
      expect(content).toContain('var(--border-radius');
      expect(content).toContain('var(--spacing-lg');
      expect(content).toContain('var(--primary-color');
      expect(content).toContain('var(--error-color');
      expect(content).toContain('var(--transition-speed');
    });
  });

  describe('Accessibility', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should have semantic HTML structure', () => {
      expect(content).toContain('<h2 class="step-title">');
      expect(content).toContain('<button');
    });

    it('should have proper button states', () => {
      expect(content).toContain(':disabled=');
    });

    it('should have focus styles', () => {
      expect(content).toContain('&:focus');
      expect(content).toContain('box-shadow: 0 0 0 3px');
    });
  });

  describe('Component Methods', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should validate before submitting', () => {
      expect(content).toContain('if (this.isValid && !this.processing)');
    });

    it('should check canGoBack before navigating back', () => {
      expect(content).toContain('if (this.canGoBack && !this.processing)');
    });
  });

  describe('Styling', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should have scoped styles', () => {
      expect(content).toContain('<style lang="scss" scoped>');
    });

    it('should have status-specific styling', () => {
      expect(content).toContain('&--pending');
      expect(content).toContain('&--in-progress');
      expect(content).toContain('&--completed');
      expect(content).toContain('&--error');
    });

    it('should have button hover and active states', () => {
      expect(content).toContain('&:hover:not(:disabled)');
      expect(content).toContain('&:active:not(:disabled)');
    });

    it('should have transition effects', () => {
      expect(content).toContain('transition: all');
      expect(content).toContain('transform: translateY');
    });
  });
});