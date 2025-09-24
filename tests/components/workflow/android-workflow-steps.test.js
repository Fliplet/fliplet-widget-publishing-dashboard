const fs = require('fs');
const path = require('path');

const stepsDir = path.resolve(__dirname, '../../../src/components/workflow/steps/android');
const workflowDir = path.resolve(__dirname, '../../../src/components/workflow');

describe('Android Workflow Steps', () => {
  const expectedSteps = [
    'StoreConfigStep.vue',
    'KeystoreStep.vue', 
    'AppBundleStep.vue',
    'StoreListingStep.vue',
    'ReleaseManagementStep.vue',
    'AndroidReviewSubmitStep.vue'
  ];

  describe('Component Files', () => {
    it('should have AndroidWorkflowView.vue container', () => {
      expect(fs.existsSync(path.join(workflowDir, 'AndroidWorkflowView.vue'))).toBe(true);
    });

    expectedSteps.forEach(stepFile => {
      it(`should have ${stepFile} component`, () => {
        expect(fs.existsSync(path.join(stepsDir, stepFile))).toBe(true);
      });
    });
  });

  describe('Container Component', () => {
    it('AndroidWorkflowView should integrate all steps', () => {
      const content = fs.readFileSync(path.join(workflowDir, 'AndroidWorkflowView.vue'), 'utf8');
      expect(content).toContain('name: \'AndroidWorkflowView\'');
      expect(content).toContain('StoreConfigStep');
      expect(content).toContain('KeystoreStep');
      expect(content).toContain('AppBundleStep');
      expect(content).toContain('StoreListingStep');
      expect(content).toContain('ReleaseManagementStep');
      expect(content).toContain('AndroidReviewSubmitStep');
      expect(content).toContain('workflowMixin');
    });
  });

  describe('Component Structure', () => {
    it('StoreConfigStep should handle Google Play Console configuration', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'StoreConfigStep.vue'), 'utf8');
      expect(content).toContain('name: \'StoreConfigStep\'');
      expect(content).toContain('serviceAccount');
      expect(content).toContain('developerId');
      expect(content).toContain('.json');
      expect(content).toContain('testConnection');
    });

    it('KeystoreStep should handle app signing configuration', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'KeystoreStep.vue'), 'utf8');
      expect(content).toContain('name: \'KeystoreStep\'');
      expect(content).toContain('signingMethod');
      expect(content).toContain('google-managed');
      expect(content).toContain('self-managed');
      expect(content).toContain('.keystore');
      expect(content).toContain('.jks');
    });

    it('AppBundleStep should handle bundle configuration', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'AppBundleStep.vue'), 'utf8');
      expect(content).toContain('name: \'AppBundleStep\'');
      expect(content).toContain('packageName');
      expect(content).toContain('versionCode');
      expect(content).toContain('versionName');
      expect(content).toContain('targetSdkVersion');
      expect(content).toContain('selectedArchitectures');
    });

    it('StoreListingStep should handle Play Store listing', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'StoreListingStep.vue'), 'utf8');
      expect(content).toContain('name: \'StoreListingStep\'');
      expect(content).toContain('title');
      expect(content).toContain('shortDescription');
      expect(content).toContain('fullDescription');
      expect(content).toContain('category');
      expect(content).toContain('screenshots');
      expect(content).toContain('draggable');
    });

    it('ReleaseManagementStep should handle release settings', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'ReleaseManagementStep.vue'), 'utf8');
      expect(content).toContain('name: \'ReleaseManagementStep\'');
      expect(content).toContain('releaseTrack');
      expect(content).toContain('rolloutPercentage');
      expect(content).toContain('releaseNotes');
      expect(content).toContain('managedPublishing');
      expect(content).toContain('countrySelection');
    });

    it('AndroidReviewSubmitStep should handle final review', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'AndroidReviewSubmitStep.vue'), 'utf8');
      expect(content).toContain('name: \'AndroidReviewSubmitStep\'');
      expect(content).toContain('workflowData');
      expect(content).toContain('checklist');
      expect(content).toContain('buildOptions');
      expect(content).toContain('submitToGooglePlay');
    });
  });

  describe('Common Step Features', () => {
    expectedSteps.forEach(stepFile => {
      it(`${stepFile} should have proper props and validation`, () => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        
        // Check for required props
        expect(content).toContain('stepData:');
        expect(content).toContain('validationErrors:');
        
        // Check for validation emit (except AndroidReviewSubmitStep)
        if (stepFile !== 'AndroidReviewSubmitStep.vue') {
          expect(content).toContain('$emit(\'validate\'');
        }
        
        // Check for update emit
        expect(content).toContain('$emit(\'update\'');
        
        // Check for form fields (except AndroidReviewSubmitStep)
        if (stepFile !== 'AndroidReviewSubmitStep.vue') {
          expect(content).toContain('form-field');
        }
      });
    });
  });

  describe('Step Dependencies', () => {
    it('should import necessary components', () => {
      expectedSteps.forEach(stepFile => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        
        // Common imports
        expect(content).toContain('import ValidationMessage');
        
        // Step-specific imports
        if (stepFile !== 'AndroidReviewSubmitStep.vue') {
          expect(content).toContain('import FormField');
        }
        
        if (['StoreConfigStep.vue', 'KeystoreStep.vue', 'StoreListingStep.vue'].includes(stepFile)) {
          expect(content).toContain('import FileUploadZone');
        }
        
        if (stepFile === 'StoreListingStep.vue') {
          expect(content).toContain('import draggable');
        }
      });
    });
  });

  describe('Step Validation', () => {
    it('each step should implement isValid computed property', () => {
      expectedSteps.filter(f => f !== 'AndroidReviewSubmitStep.vue').forEach(stepFile => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        expect(content).toContain('isValid()');
      });
    });

    it('each step should implement getValidationErrors method', () => {
      expectedSteps.filter(f => f !== 'AndroidReviewSubmitStep.vue').forEach(stepFile => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        expect(content).toContain('getValidationErrors()');
      });
    });
  });

  describe('Google Play Specific Features', () => {
    it('should support Google Play App Signing', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'KeystoreStep.vue'), 'utf8');
      expect(content).toContain('Google Play App Signing');
      expect(content).toContain('upload-key');
    });

    it('should support staged rollout', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'ReleaseManagementStep.vue'), 'utf8');
      expect(content).toContain('staged rollout');
      expect(content).toContain('rolloutPercentage');
    });

    it('should support multiple release tracks', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'ReleaseManagementStep.vue'), 'utf8');
      expect(content).toContain('internal');
      expect(content).toContain('closed');
      expect(content).toContain('open');
      expect(content).toContain('production');
    });
  });
});