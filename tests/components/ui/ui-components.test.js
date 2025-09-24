const fs = require('fs');
const path = require('path');

describe('UI Components', () => {
  const uiDir = path.join(__dirname, '../../../src/components/ui');
  const formsDir = path.join(__dirname, '../../../src/components/forms');
  const feedbackDir = path.join(__dirname, '../../../src/components/feedback');

  describe('Form Components', () => {
    it('should have FormField.vue component', () => {
      const filePath = path.join(formsDir, 'FormField.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('<template>');
      expect(content).toContain('form-field');
      expect(content).toContain('v-model');
      expect(content).toContain('validation');
    });

    it('FormField should support multiple input types', () => {
      const filePath = path.join(formsDir, 'FormField.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for various input types - using dynamic type binding
      expect(content).toContain(':type="type"');
      expect(content).toContain('textarea');
      expect(content).toContain('select');
      expect(content).toContain('checkbox');
      
      // Check for validation support
      expect(content).toContain('rules:');
      expect(content).toContain('validate()');
      expect(content).toContain('errors');
    });
  });

  describe('UI Components', () => {
    it('should have FileUploadZone.vue component', () => {
      const filePath = path.join(uiDir, 'FileUploadZone.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('file-upload-zone');
      expect(content).toContain('@drop.prevent');
      expect(content).toContain('@dragover.prevent');
      expect(content).toContain('handleDrop');
    });

    it('should have WorkflowStepper.vue component', () => {
      const filePath = path.join(uiDir, 'WorkflowStepper.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('workflow-stepper');
      expect(content).toContain('steps:');
      expect(content).toContain('currentStep:');
      expect(content).toContain('step-click');
    });

    it('should have StatusCard.vue component', () => {
      const filePath = path.join(uiDir, 'StatusCard.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('status-card');
      expect(content).toContain('status:');
      expect(content).toContain('progress:');
      expect(content).toContain('formatTimestamp');
    });

    it('should have ValidationMessage.vue component', () => {
      const filePath = path.join(uiDir, 'ValidationMessage.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('validation-message');
      expect(content).toContain('role="alert"');
      expect(content).toContain('message:');
      expect(content).toContain('type:');
    });

    it('should have LoadingSpinner.vue component', () => {
      const filePath = path.join(uiDir, 'LoadingSpinner.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('loading-spinner');
      expect(content).toContain('size:');
      expect(content).toContain('@keyframes spin');
    });

    it('should have StatusIndicator.vue component', () => {
      const filePath = path.join(uiDir, 'StatusIndicator.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('status-indicator');
      expect(content).toContain('status:');
      expect(content).toContain('message:');
    });
  });

  describe('Feedback Components', () => {
    it('should have LoadingOverlay.vue component', () => {
      const filePath = path.join(feedbackDir, 'LoadingOverlay.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('loading-overlay');
      expect(content).toContain('role="progressbar"');
      expect(content).toContain('LoadingSpinner');
    });

    it('should have NotificationToast.vue component', () => {
      const filePath = path.join(feedbackDir, 'NotificationToast.vue');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('notification-toast');
      expect(content).toContain('role="alert"');
      expect(content).toContain('show-notification');
      expect(content).toContain('removeNotification');
    });
  });

  describe('Component Features', () => {
    it('FileUploadZone should support drag and drop', () => {
      const filePath = path.join(uiDir, 'FileUploadZone.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Drag and drop events
      expect(content).toContain('@drop');
      expect(content).toContain('@dragover');
      expect(content).toContain('@dragenter');
      expect(content).toContain('@dragleave');
      
      // File validation
      expect(content).toContain('validateFileType');
      expect(content).toContain('maxSize:');
      expect(content).toContain('accept:');
    });

    it('WorkflowStepper should support different orientations', () => {
      const filePath = path.join(uiDir, 'WorkflowStepper.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('orientation:');
      // Using template literal for dynamic class binding
      expect(content).toContain('`workflow-stepper--${this.orientation}`');
      expect(content).toContain('\'workflow-stepper--condensed\'');
      expect(content).toContain('\'workflow-stepper--mobile\'');
    });

    it('StatusCard should display various states', () => {
      const filePath = path.join(uiDir, 'StatusCard.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Status types
      expect(content).toContain('pending');
      expect(content).toContain('processing');
      expect(content).toContain('completed');
      expect(content).toContain('failed');
      expect(content).toContain('error');
      
      // Features
      expect(content).toContain('progress');
      expect(content).toContain('actions');
      expect(content).toContain('expanded');
    });

    it('FormField should have comprehensive validation', () => {
      const filePath = path.join(formsDir, 'FormField.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Validation features
      expect(content).toContain('required:');
      expect(content).toContain('rules:');
      expect(content).toContain('validateOnBlur:');
      expect(content).toContain('validateOnInput:');
      expect(content).toContain('Email validation');
      expect(content).toContain('maxLength:');
    });
  });

  describe('Accessibility', () => {
    it('all components should have proper ARIA attributes', () => {
      const components = [
        path.join(formsDir, 'FormField.vue'),
        path.join(uiDir, 'FileUploadZone.vue'),
        path.join(uiDir, 'WorkflowStepper.vue'),
        path.join(uiDir, 'StatusCard.vue'),
        path.join(uiDir, 'ValidationMessage.vue'),
        path.join(feedbackDir, 'NotificationToast.vue'),
        path.join(feedbackDir, 'LoadingOverlay.vue')
      ];

      components.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const hasAria = content.includes('aria-') || 
                         content.includes('role=');
          
          expect(hasAria).toBe(true);
        }
      });
    });

    it('form components should have proper labels and descriptions', () => {
      const filePath = path.join(formsDir, 'FormField.vue');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain(':for="fieldId"');
      expect(content).toContain('aria-describedby');
      expect(content).toContain('aria-invalid');
      expect(content).toContain('aria-label');
    });
  });

  describe('Responsive Design', () => {
    it('components should have mobile considerations', () => {
      const stepperPath = path.join(uiDir, 'WorkflowStepper.vue');
      const statusPath = path.join(uiDir, 'StatusCard.vue');
      
      const stepperContent = fs.readFileSync(stepperPath, 'utf8');
      const statusContent = fs.readFileSync(statusPath, 'utf8');
      
      // WorkflowStepper mobile features
      expect(stepperContent).toContain('isMobile');
      expect(stepperContent).toContain('workflow-stepper--mobile');
      expect(stepperContent).toContain('mobile-nav');
      
      // StatusCard responsive
      expect(statusContent).toContain('@media (max-width: 767px)');
    });
  });

  describe('Event Handling', () => {
    it('components should emit appropriate events', () => {
      const components = [
        { path: path.join(formsDir, 'FormField.vue'), events: ['input', 'blur', 'focus', 'validation'] },
        { path: path.join(uiDir, 'FileUploadZone.vue'), events: ['files-selected', 'upload', 'remove'] },
        { path: path.join(uiDir, 'WorkflowStepper.vue'), events: ['step-click', 'navigate-back', 'navigate-forward'] },
        { path: path.join(uiDir, 'StatusCard.vue'), events: ['action'] }
      ];

      components.forEach(({ path: filePath, events }) => {
        const content = fs.readFileSync(filePath, 'utf8');
        
        events.forEach(event => {
          expect(content).toContain(`$emit('${event}'`);
        });
      });
    });
  });

  describe('Integration', () => {
    it('Application.vue should register UI components', () => {
      const appPath = path.join(__dirname, '../../../src/Application.vue');
      const content = fs.readFileSync(appPath, 'utf8');
      
      // Check component imports
      expect(content).toContain('LoadingOverlay');
      expect(content).toContain('NotificationToast');
      expect(content).toContain('LoadingSpinner');
      expect(content).toContain('StatusIndicator');
      
      // Check component registration
      expect(content).toContain('components:');
    });

    it('components should import their dependencies', () => {
      const formFieldPath = path.join(formsDir, 'FormField.vue');
      const formFieldContent = fs.readFileSync(formFieldPath, 'utf8');
      
      expect(formFieldContent).toContain("import ValidationMessage from '../ui/ValidationMessage.vue'");
      
      const loadingOverlayPath = path.join(feedbackDir, 'LoadingOverlay.vue');
      const loadingOverlayContent = fs.readFileSync(loadingOverlayPath, 'utf8');
      
      expect(loadingOverlayContent).toContain("import LoadingSpinner from '../ui/LoadingSpinner.vue'");
    });
  });
});