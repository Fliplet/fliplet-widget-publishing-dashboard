const fs = require('fs');
const path = require('path');

const validatorPath = path.resolve(__dirname, './WorkflowValidator.js');
const navigatorPath = path.resolve(__dirname, './WorkflowNavigator.vue');

describe('Workflow Validation and Navigation', () => {
  describe('WorkflowValidator', () => {
    it('should exist', () => {
      expect(fs.existsSync(validatorPath)).toBe(true);
    });

    it('should have proper class structure', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('class WorkflowValidator');
      expect(content).toContain('constructor()');
      expect(content).toContain('validators = new Map()');
      expect(content).toContain('navigationRules = new Map()');
      expect(content).toContain('dependencies = new Map()');
    });

    it('should provide validation registration methods', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('registerValidator(platform, stepName, validator)');
      expect(content).toContain('registerNavigationRules(platform, stepName, rules)');
      expect(content).toContain('registerDependencies(platform, stepName, dependencies)');
    });

    it('should provide validation methods', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('validateStep(platform, stepName, data)');
      expect(content).toContain('validateField(platform, stepName, fieldName, value)');
      expect(content).toContain('getWorkflowValidationSummary(platform, workflowState)');
    });

    it('should provide navigation check methods', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('canNavigateNext(platform, currentStep, stepData, workflowState)');
      expect(content).toContain('canNavigateBack(platform, currentStep, workflowState)');
      expect(content).toContain('canSkipStep(platform, stepName)');
      expect(content).toContain('checkDependencies(platform, stepName, workflowState)');
    });

    it('should handle async validation', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('async: validator.async');
      expect(content).toContain('await validator.validate(data)');
    });

    it('should normalize validation results', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('normalizeValidationResult(result)');
      expect(content).toContain('isValid:');
      expect(content).toContain('errors:');
      expect(content).toContain('fieldErrors:');
      expect(content).toContain('warnings:');
    });

    it('should include field validation rules', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('fieldRules.required');
      expect(content).toContain('fieldRules.pattern');
      expect(content).toContain('fieldRules.minLength');
      expect(content).toContain('fieldRules.maxLength');
      expect(content).toContain('fieldRules.custom');
    });

    it('should have default iOS validators', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain("registerValidator('ios', 'api-key'");
      expect(content).toContain("registerValidator('ios', 'bundle-id'");
      expect(content).toContain('bundleIdRegex');
    });

    it('should have default Android validators', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain("registerValidator('android', 'store-config'");
      expect(content).toContain('packageRegex');
      expect(content).toContain('packageName');
      expect(content).toContain('appName');
    });

    it('should export as singleton', () => {
      const content = fs.readFileSync(validatorPath, 'utf8');
      
      expect(content).toContain('const workflowValidator = new WorkflowValidator()');
      expect(content).toContain('export default workflowValidator');
    });
  });

  describe('WorkflowNavigator Component', () => {
    it('should exist', () => {
      expect(fs.existsSync(navigatorPath)).toBe(true);
    });

    it('should have proper component structure', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('<template>');
      expect(content).toContain('<script>');
      expect(content).toContain('<style');
      expect(content).toContain('name: \'WorkflowNavigator\'');
    });

    it('should import WorkflowValidator', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('import workflowValidator from \'./WorkflowValidator\'');
    });

    it('should have required props', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('platform:');
      expect(content).toContain('steps:');
      expect(content).toContain('currentStepIndex:');
      expect(content).toContain('workflowState:');
      expect(content).toContain('loading:');
    });

    it('should display progress information', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('navigator__progress');
      expect(content).toContain('progress-bar');
      expect(content).toContain('{{ completedSteps }} of {{ totalSteps }}');
      expect(content).toContain('{{ progress }}%');
    });

    it('should display step indicators', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('v-for="(step, index) in steps"');
      expect(content).toContain('step-indicator');
      expect(content).toContain('isStepComplete(step)');
      expect(content).toContain('hasStepError(step)');
    });

    it('should have navigation buttons', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('navigateBack');
      expect(content).toContain('navigateNext');
      expect(content).toContain('skipStep');
      expect(content).toContain(':disabled="!canGoBack"');
      expect(content).toContain(':disabled="!canGoNext"');
    });

    it('should validate current step', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('validateCurrentStep()');
      expect(content).toContain('workflowValidator.validateStep');
      expect(content).toContain('workflowValidator.checkDependencies');
    });

    it('should handle navigation logic', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('workflowValidator.canNavigateNext');
      expect(content).toContain('workflowValidator.canNavigateBack');
      expect(content).toContain('workflowValidator.canSkipStep');
    });

    it('should emit navigation events', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('this.$emit(\'navigate\'');
      expect(content).toContain('this.$emit(\'complete\'');
      expect(content).toContain('this.$emit(\'skip\'');
      expect(content).toContain('this.$emit(\'validation\'');
    });

    it('should display validation errors', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('navigator__errors');
      expect(content).toContain('<validation-message');
      expect(content).toContain('validationErrors');
    });

    it('should have responsive design', () => {
      const content = fs.readFileSync(navigatorPath, 'utf8');
      
      expect(content).toContain('@media (max-width: 768px)');
      expect(content).toContain('flex-direction: column');
    });
  });

  describe('Integration', () => {
    it('should work together as a validation and navigation system', () => {
      const validatorContent = fs.readFileSync(validatorPath, 'utf8');
      const navigatorContent = fs.readFileSync(navigatorPath, 'utf8');
      
      // Check that navigator uses validator methods
      const validatorMethods = [
        'validateStep',
        'canNavigateNext',
        'canNavigateBack',
        'canSkipStep',
        'checkDependencies',
        'getWorkflowValidationSummary'
      ];
      
      validatorMethods.forEach(method => {
        expect(navigatorContent).toContain(`workflowValidator.${method}`);
      });
    });
  });
});