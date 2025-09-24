<template>
  <div class="example-workflow">
    <!-- Workflow Stepper -->
    <workflow-stepper
      :steps="workflowSteps"
      :current-step-index="currentStepIndex"
      :clickable="true"
      @step-click="handleStepClick"
    />

    <!-- Current Step -->
    <workflow-step
      :step-name="currentStepName"
      :step-title="currentStepTitle"
      :step-status="currentStepStatus"
      :is-valid="isCurrentStepValid"
      :processing="workflowLoading"
      :can-go-back="canGoBack"
      :next-button-text="nextButtonText"
      @submit="handleSubmit"
      @back="handleBack"
    >
      <!-- Step Content (would be dynamic in real implementation) -->
      <div class="step-example-content">
        <p>This is step {{ currentStepIndex + 1 }} of {{ workflowSteps.length }}</p>
        <p>Platform: {{ currentPlatform }}</p>
        <p>Progress: {{ workflowProgress }}%</p>
        
        <!-- Example form field -->
        <form-field
          v-model="exampleData"
          type="text"
          label="Example Field"
          :required="true"
          @input="handleFieldChange"
        />
      </div>
    </workflow-step>

    <!-- Error Display -->
    <div v-if="workflowError" class="workflow-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ workflowError }}
    </div>
  </div>
</template>

<script>
import workflowMixin from './workflowMixin';
import WorkflowStepper from '../ui/WorkflowStepper.vue';
import WorkflowStep from './WorkflowStep.vue';
import FormField from '../forms/FormField.vue';

/**
 * Example workflow component demonstrating state management integration
 * This shows how to use the workflowMixin and state management system
 */
export default {
  name: 'ExampleWorkflowComponent',

  components: {
    WorkflowStepper,
    WorkflowStep,
    FormField
  },

  mixins: [workflowMixin],

  props: {
    platform: {
      type: String,
      required: true,
      validator: (value) => ['ios', 'android'].includes(value)
    }
  },

  data() {
    return {
      exampleData: '',
      // Define workflow steps (would normally come from config)
      workflowSteps: [
        {
          id: 'step1',
          name: 'configuration',
          label: 'Configuration',
          description: 'Configure basic settings'
        },
        {
          id: 'step2',
          name: 'credentials',
          label: 'Credentials',
          description: 'Provide authentication credentials'
        },
        {
          id: 'step3',
          name: 'validation',
          label: 'Validation',
          description: 'Validate your configuration'
        },
        {
          id: 'step4',
          name: 'submission',
          label: 'Submission',
          description: 'Submit for processing'
        }
      ]
    };
  },

  computed: {
    currentStepName() {
      const step = this.getCurrentStep();
      return step ? step.name : '';
    },

    currentStepTitle() {
      const step = this.getCurrentStep();
      return step ? step.label : '';
    },

    currentStepStatus() {
      if (this.workflowLoading) return 'in-progress';
      if (this.workflowError) return 'error';
      if (this.isStepComplete(this.currentStepName)) return 'completed';
      return 'pending';
    },

    nextButtonText() {
      if (this.currentStepIndex === this.workflowSteps.length - 1) {
        return 'Submit';
      }
      return 'Next';
    },

    // Override getCurrentStep to use local steps
    getCurrentStep() {
      return this.workflowSteps[this.currentStepIndex] || null;
    }
  },

  watch: {
    platform: {
      immediate: true,
      handler() {
        // Reinitialize when platform changes
        this.initializeWorkflow();
      }
    }
  },

  created() {
    // Set up the workflow state with our steps
    if (this.workflowState) {
      this.workflowState.steps = this.workflowSteps;
    }
  },

  methods: {
    async handleSubmit() {
      try {
        // Validate current step
        const isValid = await this.validateStep();
        
        if (isValid) {
          if (this.currentStepIndex === this.workflowSteps.length - 1) {
            // Final submission
            await this.submitWorkflow();
          } else {
            // Go to next step
            await this.goToNextStep();
          }
        }
      } catch (error) {
        console.error('Submit error:', error);
        this.workflowError = error.message;
      }
    },

    async handleBack() {
      await this.goToPreviousStep();
    },

    async handleStepClick({ index }) {
      // Only allow navigation to completed steps
      if (index < this.currentStepIndex) {
        await this.navigateToStep(index);
      }
    },

    async handleFieldChange(value) {
      // Update step data
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        await this.updateStepData(currentStep.name, {
          exampleField: value
        });
      }
    },

    async validateStep() {
      // Example validation
      const isValid = this.exampleData && this.exampleData.length > 0;
      const errors = isValid ? [] : ['This field is required'];
      
      await this.validateCurrentStep(isValid, errors);
      
      return isValid;
    },

    async navigateToStep(index) {
      if (index >= 0 && index < this.workflowSteps.length) {
        this.currentStepIndex = index;
        await workflowStateManager.setCurrentStep(this.currentPlatform, index);
      }
    },

    async submitWorkflow() {
      this.workflowLoading = true;
      
      try {
        // Get all workflow data
        const allData = this.getAllWorkflowData();
        
        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mark workflow as complete
        this.workflowState.isComplete = true;
        await workflowStateManager.saveProgress(this.currentPlatform);
        
        // Emit completion event
        this.$emit('workflow-complete', allData);
        
      } catch (error) {
        console.error('Submission error:', error);
        this.workflowError = error.message;
      } finally {
        this.workflowLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.example-workflow {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.step-example-content {
  min-height: 200px;
  
  p {
    margin-bottom: var(--spacing-md);
    color: var(--text-color-secondary);
  }
}

.workflow-error {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  i {
    flex-shrink: 0;
  }
}
</style>