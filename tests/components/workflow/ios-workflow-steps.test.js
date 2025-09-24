const fs = require('fs');
const path = require('path');

const stepsDir = path.resolve(__dirname, '../../../src/components/workflow/steps/ios');

describe('iOS Workflow Steps', () => {
  const expectedSteps = [
    'ApiKeyStep.vue',
    'BundleIdStep.vue', 
    'CertificateStep.vue',
    'AppAssetsStep.vue',
    'MetadataStep.vue',
    'ReviewSubmitStep.vue'
  ];

  describe('Component Files', () => {
    expectedSteps.forEach(stepFile => {
      it(`should have ${stepFile} component`, () => {
        expect(fs.existsSync(path.join(stepsDir, stepFile))).toBe(true);
      });
    });
  });

  describe('Component Structure', () => {
    it('ApiKeyStep should handle API key configuration', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'ApiKeyStep.vue'), 'utf8');
      expect(content).toContain('name: \'ApiKeyStep\'');
      expect(content).toContain('issuerId');
      expect(content).toContain('keyId');
      expect(content).toContain('file-upload-zone');
      expect(content).toContain('.p8');
    });

    it('BundleIdStep should handle bundle ID and version configuration', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'BundleIdStep.vue'), 'utf8');
      expect(content).toContain('name: \'BundleIdStep\'');
      expect(content).toContain('bundleId');
      expect(content).toContain('version');
      expect(content).toContain('buildNumber');
      expect(content).toContain('appSku');
      expect(content).toContain('validateBundleId');
    });

    it('CertificateStep should handle signing certificate configuration', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'CertificateStep.vue'), 'utf8');
      expect(content).toContain('name: \'CertificateStep\'');
      expect(content).toContain('certificateType');
      expect(content).toContain('distribution');
      expect(content).toContain('development');
      expect(content).toContain('.p12');
      expect(content).toContain('provisioning');
    });

    it('AppAssetsStep should handle app assets upload', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'AppAssetsStep.vue'), 'utf8');
      expect(content).toContain('name: \'AppAssetsStep\'');
      expect(content).toContain('appIcon');
      expect(content).toContain('screenshots');
      expect(content).toContain('1024x1024');
      expect(content).toContain('draggable');
      expect(content).toContain('deviceTypes');
    });

    it('MetadataStep should handle App Store metadata', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'MetadataStep.vue'), 'utf8');
      expect(content).toContain('name: \'MetadataStep\'');
      expect(content).toContain('description');
      expect(content).toContain('primaryCategory');
      expect(content).toContain('ageRating');
      expect(content).toContain('supportUrl');
      expect(content).toContain('privacyPolicyUrl');
    });

    it('ReviewSubmitStep should handle final review and submission', () => {
      const content = fs.readFileSync(path.join(stepsDir, 'ReviewSubmitStep.vue'), 'utf8');
      expect(content).toContain('name: \'ReviewSubmitStep\'');
      expect(content).toContain('workflowData');
      expect(content).toContain('review-section');
      expect(content).toContain('checklist');
      expect(content).toContain('handleSubmit');
      expect(content).toContain('autoReleaseAfterApproval');
    });
  });

  describe('Common Step Features', () => {
    expectedSteps.forEach(stepFile => {
      it(`${stepFile} should have proper props and validation`, () => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        
        // Check for required props
        expect(content).toContain('stepData:');
        expect(content).toContain('validationErrors:');
        
        // Check for validation emit (except ReviewSubmitStep)
        if (stepFile !== 'ReviewSubmitStep.vue') {
          expect(content).toContain('$emit(\'validate\'');
        }
        
        // Check for update emit
        expect(content).toContain('$emit(\'update\'');
        
        // Check for form fields (except ReviewSubmitStep)
        if (stepFile !== 'ReviewSubmitStep.vue') {
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
        if (stepFile !== 'ReviewSubmitStep.vue') {
          expect(content).toContain('import FormField');
        }
        
        if (['ApiKeyStep.vue', 'CertificateStep.vue', 'AppAssetsStep.vue'].includes(stepFile)) {
          expect(content).toContain('import FileUploadZone');
        }
        
        if (stepFile === 'AppAssetsStep.vue') {
          expect(content).toContain('import draggable');
        }
      });
    });
  });

  describe('Step Validation', () => {
    it('each step should implement isValid computed property', () => {
      expectedSteps.forEach(stepFile => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        expect(content).toContain('isValid()');
      });
    });

    it('each step should implement getValidationErrors method', () => {
      expectedSteps.filter(f => f !== 'ReviewSubmitStep.vue').forEach(stepFile => {
        const content = fs.readFileSync(path.join(stepsDir, stepFile), 'utf8');
        expect(content).toContain('getValidationErrors()');
      });
    });
  });
});