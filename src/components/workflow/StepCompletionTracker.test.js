const fs = require('fs');
const path = require('path');

const trackerPath = path.resolve(__dirname, './StepCompletionTracker.vue');

describe('StepCompletionTracker Component', () => {
  describe('Component File', () => {
    it('should exist', () => {
      expect(fs.existsSync(trackerPath)).toBe(true);
    });

    it('should have proper component structure', () => {
      const content = fs.readFileSync(trackerPath, 'utf8');
      
      expect(content).toContain('<template>');
      expect(content).toContain('<script>');
      expect(content).toContain('<style');
      expect(content).toContain('name: \'StepCompletionTracker\'');
    });
  });

  describe('Component Features', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(trackerPath, 'utf8');
    });

    it('should have required props', () => {
      expect(content).toContain('steps:');
      expect(content).toContain('required: true');
      expect(content).toContain('stepData:');
      expect(content).toContain('currentStepIndex:');
      expect(content).toContain('showMetadata:');
    });

    it('should display completion summary', () => {
      expect(content).toContain('completion-summary');
      expect(content).toContain('{{ completionPercentage }}%');
      expect(content).toContain('{{ completedSteps.length }} Completed');
      expect(content).toContain('{{ pendingSteps.length }} Pending');
      expect(content).toContain('{{ failedSteps.length }} Failed');
    });

    it('should have overall progress bar', () => {
      expect(content).toContain('overall-progress');
      expect(content).toContain('progress-bar__fill');
      expect(content).toContain(':style="{ width: `${completionPercentage}%` }"');
    });

    it('should display step list with details', () => {
      expect(content).toContain('<transition-group name="step-list"');
      expect(content).toContain('v-for="(step, index) in steps"');
      expect(content).toContain('step-item');
      expect(content).toContain('{{ step.label || step.name }}');
      expect(content).toContain('{{ step.description }}');
    });

    it('should show step status icons', () => {
      expect(content).toContain('v-if="isCompleted(step)"');
      expect(content).toContain('fas fa-check-circle');
      expect(content).toContain('v-else-if="isFailed(step)"');
      expect(content).toContain('fas fa-times-circle');
      expect(content).toContain('v-else-if="isInProgress(step)"');
      expect(content).toContain('fas fa-sync-alt fa-spin');
      expect(content).toContain('v-else-if="isSkipped(step)"');
      expect(content).toContain('fas fa-forward');
    });

    it('should have step metadata display', () => {
      expect(content).toContain('step-metadata');
      expect(content).toContain('getCompletionTime(step)');
      expect(content).toContain('getDuration(step)');
      expect(content).toContain('getAttempts(step)');
      expect(content).toContain('formatCompletionTime');
      expect(content).toContain('formatDuration');
    });

    it('should display validation errors', () => {
      expect(content).toContain('step-errors');
      expect(content).toContain('getStepErrors(step)');
      expect(content).toContain('error-message');
    });

    it('should have step actions', () => {
      expect(content).toContain('step-item__actions');
      expect(content).toContain('canRetry(step)');
      expect(content).toContain('canViewDetails(step)');
      expect(content).toContain('$emit(\'retry-step\'');
      expect(content).toContain('$emit(\'view-details\'');
    });

    it('should show completion actions when workflow is complete', () => {
      expect(content).toContain('v-if="isWorkflowComplete"');
      expect(content).toContain('completion-actions');
      expect(content).toContain('Workflow Complete!');
      expect(content).toContain('$emit(\'submit-workflow\'');
      expect(content).toContain('$emit(\'download-summary\'');
    });
  });

  describe('Computed Properties', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(trackerPath, 'utf8');
    });

    it('should calculate completion statistics', () => {
      expect(content).toContain('completedSteps()');
      expect(content).toContain('pendingSteps()');
      expect(content).toContain('failedSteps()');
      expect(content).toContain('skippedSteps()');
      expect(content).toContain('completionPercentage()');
    });

    it('should determine workflow completion', () => {
      expect(content).toContain('isWorkflowComplete()');
      expect(content).toContain('requiredSteps.every(step => this.isCompleted(step))');
    });
  });

  describe('Methods', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(trackerPath, 'utf8');
    });

    it('should have step status checking methods', () => {
      expect(content).toContain('isCompleted(step)');
      expect(content).toContain('isFailed(step)');
      expect(content).toContain('isInProgress(step)');
      expect(content).toContain('isSkipped(step)');
      expect(content).toContain('isPending(step)');
    });

    it('should have data retrieval methods', () => {
      expect(content).toContain('getStepData(step)');
      expect(content).toContain('getStepMetadata(step)');
      expect(content).toContain('getCompletionTime(step)');
      expect(content).toContain('getDuration(step)');
      expect(content).toContain('getAttempts(step)');
      expect(content).toContain('getStepErrors(step)');
    });

    it('should have formatting methods', () => {
      expect(content).toContain('formatCompletionTime(timestamp)');
      expect(content).toContain('formatDuration(milliseconds)');
    });

    it('should have action availability methods', () => {
      expect(content).toContain('canRetry(step)');
      expect(content).toContain('canViewDetails(step)');
    });
  });

  describe('Styling', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(trackerPath, 'utf8');
    });

    it('should have scoped styles', () => {
      expect(content).toContain('<style lang="scss" scoped>');
    });

    it('should have step state styling', () => {
      expect(content).toContain('&--completed');
      expect(content).toContain('&--failed');
      expect(content).toContain('&--in-progress');
      expect(content).toContain('&--skipped');
      expect(content).toContain('&--current');
    });

    it('should have transition animations', () => {
      expect(content).toContain('.step-list-enter-active');
      expect(content).toContain('.icon-change-enter-active');
      expect(content).toContain('transition:');
    });

    it('should be responsive', () => {
      expect(content).toContain('@media (max-width: 768px)');
    });
  });

  describe('Event Emissions', () => {
    let content;

    beforeAll(() => {
      content = fs.readFileSync(trackerPath, 'utf8');
    });

    it('should emit appropriate events', () => {
      expect(content).toContain('$emit(\'step-select\'');
      expect(content).toContain('$emit(\'retry-step\'');
      expect(content).toContain('$emit(\'view-details\'');
      expect(content).toContain('$emit(\'submit-workflow\'');
      expect(content).toContain('$emit(\'download-summary\'');
    });
  });
});