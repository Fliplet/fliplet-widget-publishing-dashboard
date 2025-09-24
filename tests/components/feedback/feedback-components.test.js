const fs = require('fs');
const path = require('path');

const feedbackDir = path.resolve(__dirname, '../../../src/components/feedback');
const sharedDir = path.resolve(__dirname, '../../../src/components/shared');
const uiDir = path.resolve(__dirname, '../../../src/components/ui');

describe('Feedback Components', () => {
  describe('Component Files', () => {
    it('should have NotificationToast.vue component', () => {
      expect(fs.existsSync(path.join(feedbackDir, 'NotificationToast.vue'))).toBe(true);
    });

    it('should have ConfirmDialog.vue component', () => {
      expect(fs.existsSync(path.join(feedbackDir, 'ConfirmDialog.vue'))).toBe(true);
    });

    it('should have LoadingOverlay.vue component', () => {
      expect(fs.existsSync(path.join(feedbackDir, 'LoadingOverlay.vue'))).toBe(true);
    });

    it('should have ErrorBoundary.vue component', () => {
      expect(fs.existsSync(path.join(sharedDir, 'ErrorBoundary.vue'))).toBe(true);
    });

    it('should have WorkflowErrorState.vue component', () => {
      expect(fs.existsSync(path.join(feedbackDir, 'WorkflowErrorState.vue'))).toBe(true);
    });

    it('should have HelpTooltip.vue component', () => {
      expect(fs.existsSync(path.join(uiDir, 'HelpTooltip.vue'))).toBe(true);
    });
  });

  describe('NotificationToast Features', () => {
    it('should support multiple notification types', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'NotificationToast.vue'), 'utf8');
      expect(content).toContain('&--success');
      expect(content).toContain('&--error');
      expect(content).toContain('&--warning');
      expect(content).toContain('&--info');
    });

    it('should have auto-dismiss functionality', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'NotificationToast.vue'), 'utf8');
      expect(content).toContain('duration');
      expect(content).toContain('setTimeout');
      expect(content).toContain('dismiss');
    });

    it('should use transition for animations', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'NotificationToast.vue'), 'utf8');
      expect(content).toContain('<transition-group');
      expect(content).toContain('name="toast"');
    });

    it('should listen to global events', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'NotificationToast.vue'), 'utf8');
      expect(content).toContain('$root.$on(\'show-notification\'');
      expect(content).toContain('$root.$off(\'show-notification\'');
    });
  });

  describe('ConfirmDialog Features', () => {
    it('should have customizable buttons', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'ConfirmDialog.vue'), 'utf8');
      expect(content).toContain('confirmText:');
      expect(content).toContain('cancelText:');
      expect(content).toContain('confirmType:');
    });

    it('should support loading state', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'ConfirmDialog.vue'), 'utf8');
      expect(content).toContain('loading:');
      expect(content).toContain(':disabled="loading"');
      expect(content).toContain('<loading-spinner v-if="loading"');
    });

    it('should have proper ARIA attributes', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'ConfirmDialog.vue'), 'utf8');
      expect(content).toContain('role="dialog"');
      expect(content).toContain('aria-labelledby');
      expect(content).toContain('aria-label="Close dialog"');
    });

    it('should emit confirm and cancel events', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'ConfirmDialog.vue'), 'utf8');
      expect(content).toContain('$emit(\'confirm\')');
      expect(content).toContain('$emit(\'cancel\')');
    });
  });

  describe('LoadingOverlay Features', () => {
    it('should have active prop and transition', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'LoadingOverlay.vue'), 'utf8');
      expect(content).toContain('active:');
      expect(content).toContain('v-if="active"');
      expect(content).toContain('<transition name="fade"');
    });

    it('should support custom message', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'LoadingOverlay.vue'), 'utf8');
      expect(content).toContain('message:');
      expect(content).toContain('{{ message }}');
    });

    it('should use LoadingSpinner component', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'LoadingOverlay.vue'), 'utf8');
      expect(content).toContain('<loading-spinner');
      expect(content).toContain('import LoadingSpinner');
    });
  });

  describe('ErrorBoundary Features', () => {
    it('should catch errors with errorCaptured hook', () => {
      const content = fs.readFileSync(path.join(sharedDir, 'ErrorBoundary.vue'), 'utf8');
      expect(content).toContain('errorCaptured(error, vm, info)');
      expect(content).toContain('return false'); // Prevent propagation
    });

    it('should have error reporting integration', () => {
      const content = fs.readFileSync(path.join(sharedDir, 'ErrorBoundary.vue'), 'utf8');
      expect(content).toContain('reportError(error, vm, info)');
      expect(content).toContain('window.PublishingMiddleware');
      expect(content).toContain('errorHandler.logError');
    });

    it('should support recovery actions', () => {
      const content = fs.readFileSync(path.join(sharedDir, 'ErrorBoundary.vue'), 'utf8');
      expect(content).toContain('handleReload()');
      expect(content).toContain('handleRecover()');
      expect(content).toContain('window.location.reload()');
    });

    it('should show error details conditionally', () => {
      const content = fs.readFileSync(path.join(sharedDir, 'ErrorBoundary.vue'), 'utf8');
      expect(content).toContain('showDetails:');
      expect(content).toContain('detailsExpanded');
      expect(content).toContain('error.stack');
    });
  });

  describe('WorkflowErrorState Features', () => {
    it('should support different error types', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'WorkflowErrorState.vue'), 'utf8');
      expect(content).toContain('errorType:');
      expect(content).toContain('network:');
      expect(content).toContain('auth:');
      expect(content).toContain('validation:');
      expect(content).toContain('permission:');
    });

    it('should have severity levels', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'WorkflowErrorState.vue'), 'utf8');
      expect(content).toContain('severity:');
      expect(content).toContain('&--error');
      expect(content).toContain('&--warning');
      expect(content).toContain('&--info');
    });

    it('should display suggestions', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'WorkflowErrorState.vue'), 'utf8');
      expect(content).toContain('suggestions:');
      expect(content).toContain('error-suggestions');
      expect(content).toContain('Try the following:');
    });

    it('should emit action events', () => {
      const content = fs.readFileSync(path.join(feedbackDir, 'WorkflowErrorState.vue'), 'utf8');
      expect(content).toContain('$emit(\'retry\')');
      expect(content).toContain('$emit(\'go-back\')');
      expect(content).toContain('$emit(\'help\')');
    });
  });

  describe('HelpTooltip Features', () => {
    it('should support different positions', () => {
      const content = fs.readFileSync(path.join(uiDir, 'HelpTooltip.vue'), 'utf8');
      expect(content).toContain('position:');
      expect(content).toContain('[\'top\', \'right\', \'bottom\', \'left\', \'auto\']');
      expect(content).toContain('&--top');
      expect(content).toContain('&--right');
      expect(content).toContain('&--bottom');
      expect(content).toContain('&--left');
    });

    it('should have hover and click interactions', () => {
      const content = fs.readFileSync(path.join(uiDir, 'HelpTooltip.vue'), 'utf8');
      expect(content).toContain('showOnHover:');
      expect(content).toContain('interactive:');
      expect(content).toContain('@mouseenter="showTooltip"');
      expect(content).toContain('@click="toggleTooltip"');
    });

    it('should support delays', () => {
      const content = fs.readFileSync(path.join(uiDir, 'HelpTooltip.vue'), 'utf8');
      expect(content).toContain('showDelay:');
      expect(content).toContain('hideDelay:');
      expect(content).toContain('setTimeout');
      expect(content).toContain('clearTimeouts()');
    });

    it('should have auto-positioning', () => {
      const content = fs.readFileSync(path.join(uiDir, 'HelpTooltip.vue'), 'utf8');
      expect(content).toContain('updatePosition()');
      expect(content).toContain('getBoundingClientRect()');
      expect(content).toContain('window.innerWidth');
      expect(content).toContain('computedPosition');
    });

    it('should be accessible', () => {
      const content = fs.readFileSync(path.join(uiDir, 'HelpTooltip.vue'), 'utf8');
      expect(content).toContain('role="button"');
      expect(content).toContain('role="tooltip"');
      expect(content).toContain('aria-describedby');
      expect(content).toContain('tabindex');
    });
  });

  describe('Component Integration', () => {
    it('feedback components should use consistent styling', () => {
      const components = [
        path.join(feedbackDir, 'NotificationToast.vue'),
        path.join(feedbackDir, 'ConfirmDialog.vue'),
        path.join(feedbackDir, 'LoadingOverlay.vue'),
        path.join(feedbackDir, 'WorkflowErrorState.vue')
      ];

      components.forEach(componentPath => {
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          expect(content).toContain('var(--');
          expect(content).toContain('scoped');
        }
      });
    });

    it('should have proper error handling patterns', () => {
      const errorBoundaryContent = fs.readFileSync(path.join(sharedDir, 'ErrorBoundary.vue'), 'utf8');
      expect(errorBoundaryContent).toContain('process.env.NODE_ENV');
      expect(errorBoundaryContent).toContain('console.error');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly styles', () => {
      const notificationContent = fs.readFileSync(path.join(feedbackDir, 'NotificationToast.vue'), 'utf8');
      expect(notificationContent).toContain('@media (max-width: 768px)');

      const errorStateContent = fs.readFileSync(path.join(feedbackDir, 'WorkflowErrorState.vue'), 'utf8');
      expect(errorStateContent).toContain('@media (max-width: 480px)');
    });
  });
});