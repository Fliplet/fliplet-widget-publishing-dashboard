const fs = require('fs');
const path = require('path');

const componentPath = path.resolve(__dirname, './IOSWorkflowView.vue');

describe('IOSWorkflowView Component', () => {
  describe('Component File', () => {
    it('should exist', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should have proper component structure', () => {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      expect(content).toContain('<template>');
      expect(content).toContain('<script>');
      expect(content).toContain('<style');
      expect(content).toContain('name: \'IOSWorkflowView\'');
    });
  });

  describe('Component Features', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should import required workflow components', () => {
      expect(content).toContain('import workflowMixin');
      expect(content).toContain('import WorkflowStep');
      expect(content).toContain('import WorkflowNavigator');
      expect(content).toContain('import AnimatedWorkflowContainer');
      expect(content).toContain('import StepCompletionTracker');
      expect(content).toContain('import WorkflowErrorRecovery');
    });

    it('should use workflowMixin', () => {
      expect(content).toContain('mixins: [workflowMixin]');
    });

    it('should have iOS-specific workflow steps', () => {
      expect(content).toContain('api-key');
      expect(content).toContain('bundle-id');
      expect(content).toContain('certificate');
      expect(content).toContain('provisioning');
      expect(content).toContain('metadata');
      expect(content).toContain('review');
    });

    it('should have workflow header with iOS branding', () => {
      expect(content).toContain('workflow-header');
      expect(content).toContain('fab fa-apple');
      expect(content).toContain('iOS Publishing Workflow');
    });

    it('should show progress tracker', () => {
      expect(content).toContain('<step-completion-tracker');
      expect(content).toContain(':steps="workflowSteps"');
      expect(content).toContain(':step-data="workflowState.stepData"');
    });

    it('should use animated workflow container', () => {
      expect(content).toContain('<animated-workflow-container');
      expect(content).toContain(':current-step-index="currentStepIndex"');
      expect(content).toContain('@step-click="handleStepClick"');
    });

    it('should use workflow navigator', () => {
      expect(content).toContain('<workflow-navigator');
      expect(content).toContain(':platform="platform"');
      expect(content).toContain('@navigate="handleNavigation"');
      expect(content).toContain('@complete="handleWorkflowComplete"');
    });

    it('should have error recovery', () => {
      expect(content).toContain('<workflow-error-recovery');
      expect(content).toContain('v-if="currentError"');
      expect(content).toContain('@retry-step="handleRetryStep"');
      expect(content).toContain('@save-draft="saveDraft"');
    });

    it('should have submission summary modal', () => {
      expect(content).toContain('submission-modal');
      expect(content).toContain('v-if="showSubmissionSummary"');
      expect(content).toContain('Ready to Submit');
      expect(content).toContain('iOS App Configuration Summary');
    });
  });

  describe('Props', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should have required props', () => {
      expect(content).toContain('appInfo:');
      expect(content).toContain('showProgressTracker:');
    });
  });

  describe('Data Properties', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should set platform to ios', () => {
      expect(content).toContain('platform: \'ios\'');
    });

    it('should define workflow steps', () => {
      expect(content).toContain('workflowSteps: [');
      expect(content).toContain('label: \'API Key\'');
      expect(content).toContain('label: \'Bundle ID\'');
      expect(content).toContain('label: \'Certificate\'');
      expect(content).toContain('label: \'Provisioning Profile\'');
      expect(content).toContain('label: \'App Metadata\'');
      expect(content).toContain('label: \'Review & Submit\'');
    });
  });

  describe('Methods', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should have step management methods', () => {
      expect(content).toContain('getStepComponent(step)');
      expect(content).toContain('getStepStatus(step)');
      expect(content).toContain('isStepValid(step)');
      expect(content).toContain('getStepErrors(step)');
    });

    it('should handle step submission', () => {
      expect(content).toContain('handleStepSubmit()');
      expect(content).toContain('validateCurrentStep');
      expect(content).toContain('completeStep');
      expect(content).toContain('goToNextStep');
    });

    it('should handle navigation', () => {
      expect(content).toContain('handleNavigation({ direction, from, to })');
      expect(content).toContain('navigateToStep(index)');
      expect(content).toContain('handleStepClick(index)');
    });

    it('should handle draft saving', () => {
      expect(content).toContain('saveDraft()');
      expect(content).toContain('workflowStateManager.saveProgress');
      expect(content).toContain('$emit(\'draft-saved\'');
    });

    it('should handle workflow submission', () => {
      expect(content).toContain('submitWorkflow()');
      expect(content).toContain('apiService.request(\'submitIosApp\'');
      expect(content).toContain('$emit(\'workflow-complete\'');
    });

    it('should handle error recovery', () => {
      expect(content).toContain('handleRetryStep');
      expect(content).toContain('handleResetStep');
      expect(content).toContain('dismissError');
      expect(content).toContain('handleRecoveryAction');
    });
  });

  describe('Summary Data', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should display iOS-specific summary fields', () => {
      expect(content).toContain('Bundle ID');
      expect(content).toContain('getSummaryData(\'bundleId\')');
      expect(content).toContain('Version');
      expect(content).toContain('Build Number');
      expect(content).toContain('API Key');
      expect(content).toContain('Certificate');
      expect(content).toContain('Provisioning Profile');
    });
  });

  describe('Events', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should emit appropriate events', () => {
      expect(content).toContain('$emit(\'cancel\')');
      expect(content).toContain('$emit(\'draft-saved\'');
      expect(content).toContain('$emit(\'view-step-details\'');
      expect(content).toContain('$emit(\'workflow-complete\'');
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

    it('should have iOS platform styling', () => {
      expect(content).toContain('.platform-icon');
      expect(content).toContain('background: linear-gradient(135deg, #000000 0%, #434343 100%)');
    });

    it('should have modal styling', () => {
      expect(content).toContain('.submission-modal');
      expect(content).toContain('.modal-backdrop');
      expect(content).toContain('.modal-content');
    });

    it('should have responsive styles', () => {
      expect(content).toContain('@media (max-width: 768px)');
    });
  });

  describe('Integration', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(componentPath, 'utf8');
    });

    it('should integrate with PublishingMiddleware', () => {
      expect(content).toContain('window.PublishingMiddleware');
      expect(content).toContain('PublishingMiddleware.isInitialized');
      expect(content).toContain('PublishingMiddleware.getComponent(\'apiService\')');
    });

    it('should use notification system', () => {
      expect(content).toContain('$root.$emit(\'show-notification\'');
    });

    it('should integrate with state management', () => {
      expect(content).toContain('workflowStateManager.setCurrentStep');
      expect(content).toContain('workflowStateManager.saveProgress');
    });
  });
});