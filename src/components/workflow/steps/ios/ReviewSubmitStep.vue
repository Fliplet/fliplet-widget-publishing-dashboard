<template>
  <div class="review-submit-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Review your app configuration before submitting to App Store Connect. 
        Make sure all information is accurate and complete.
      </p>
    </div>

    <!-- Configuration Summary -->
    <div class="review-sections">
      <!-- API Configuration -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-key"></i>
          API Configuration
          <span :class="['status-badge', apiConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ apiConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="apiKeyData.apiKeyName" class="review-item">
            <span class="review-label">API Key:</span>
            <span class="review-value">{{ apiKeyData.apiKeyName }}</span>
          </div>
          <div v-if="apiKeyData.issuerId" class="review-item">
            <span class="review-label">Issuer ID:</span>
            <span class="review-value mono">{{ apiKeyData.issuerId }}</span>
          </div>
          <div v-if="apiKeyData.keyId" class="review-item">
            <span class="review-label">Key ID:</span>
            <span class="review-value mono">{{ apiKeyData.keyId }}</span>
          </div>
        </div>
      </div>

      <!-- App Configuration -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-mobile-alt"></i>
          App Configuration
          <span :class="['status-badge', appConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ appConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="bundleData.bundleId" class="review-item">
            <span class="review-label">Bundle ID:</span>
            <span class="review-value mono">{{ bundleData.bundleId }}</span>
          </div>
          <div v-if="bundleData.appName" class="review-item">
            <span class="review-label">App Name:</span>
            <span class="review-value">{{ bundleData.appName }}</span>
          </div>
          <div v-if="bundleData.version" class="review-item">
            <span class="review-label">Version:</span>
            <span class="review-value">{{ bundleData.version }} ({{ bundleData.buildNumber }})</span>
          </div>
          <div v-if="bundleData.appSku" class="review-item">
            <span class="review-label">SKU:</span>
            <span class="review-value">{{ bundleData.appSku }}</span>
          </div>
        </div>
      </div>

      <!-- Code Signing -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-certificate"></i>
          Code Signing
          <span :class="['status-badge', signingConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ signingConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="certificateData.certificateType" class="review-item">
            <span class="review-label">Certificate Type:</span>
            <span class="review-value">{{ certificateData.certificateType }}</span>
          </div>
          <div v-if="certificateData.certificateDetails" class="review-item">
            <span class="review-label">Certificate:</span>
            <span class="review-value">{{ certificateData.certificateDetails.name }}</span>
          </div>
          <div v-if="certificateData.autoManageProvisioning !== undefined" class="review-item">
            <span class="review-label">Provisioning:</span>
            <span class="review-value">
              {{ certificateData.autoManageProvisioning ? 'Automatic' : 'Manual' }}
            </span>
          </div>
        </div>
      </div>

      <!-- App Assets -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-images"></i>
          App Assets
          <span :class="['status-badge', assetsConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ assetsConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div class="review-item">
            <span class="review-label">App Icon:</span>
            <span class="review-value">
              <i :class="['fas', assetsData.appIcon ? 'fa-check text-success' : 'fa-times text-error']"></i>
              {{ assetsData.appIcon ? 'Uploaded' : 'Missing' }}
            </span>
          </div>
          <div class="review-item">
            <span class="review-label">Screenshots:</span>
            <span class="review-value">{{ getTotalScreenshots() }} screenshot(s)</span>
          </div>
          <div v-if="assetsData.appPreviewVideo" class="review-item">
            <span class="review-label">App Preview:</span>
            <span class="review-value">{{ assetsData.videoDuration }}s video</span>
          </div>
        </div>
      </div>

      <!-- App Store Information -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-info-circle"></i>
          App Store Information
          <span :class="['status-badge', metadataConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ metadataConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="metadataData.primaryCategory" class="review-item">
            <span class="review-label">Category:</span>
            <span class="review-value">{{ formatCategory(metadataData.primaryCategory) }}</span>
          </div>
          <div v-if="metadataData.calculatedRating" class="review-item">
            <span class="review-label">Age Rating:</span>
            <span class="review-value">{{ metadataData.calculatedRating.rating }}</span>
          </div>
          <div v-if="metadataData.supportUrl" class="review-item">
            <span class="review-label">Support URL:</span>
            <span class="review-value link">{{ metadataData.supportUrl }}</span>
          </div>
          <div v-if="metadataData.privacyPolicyUrl" class="review-item">
            <span class="review-label">Privacy Policy:</span>
            <span class="review-value link">{{ metadataData.privacyPolicyUrl }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Submission Options -->
    <div class="submission-options">
      <h4 class="section-title">Submission Options</h4>
      
      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="autoReleaseAfterApproval"
        >
        <span>
          <strong>Automatically release after approval</strong>
          <span class="option-hint">Your app will be published immediately once approved</span>
        </span>
      </label>

      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="submitForReview"
        >
        <span>
          <strong>Submit for review</strong>
          <span class="option-hint">Submit to Apple for review after upload</span>
        </span>
      </label>

      <form-field
        v-model="versionReleaseNotes"
        type="textarea"
        label="Version Release Notes"
        placeholder="Internal notes about this release..."
        :rows="3"
        help-text="Notes for your team (not visible to users)"
      />
    </div>

    <!-- Pre-submission Checklist -->
    <div class="submission-checklist">
      <h4 class="section-title">Pre-submission Checklist</h4>
      
      <div class="checklist-items">
        <div
          v-for="item in checklistItems"
          :key="item.id"
          class="checklist-item"
        >
          <label class="checkbox-option">
            <input
              type="checkbox"
              v-model="checkedItems[item.id]"
            >
            <span>{{ item.text }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Submission Actions -->
    <div class="submission-actions">
      <div class="action-buttons">
        <button
          class="btn btn-outline"
          @click="saveDraft"
          :disabled="submitting"
        >
          <i class="fas fa-save"></i>
          Save Draft
        </button>
        
        <button
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="!canSubmit || submitting"
        >
          <loading-spinner v-if="submitting" size="16px" color="white" />
          <template v-else>
            <i class="fas fa-rocket"></i>
            {{ submitButtonText }}
          </template>
        </button>
      </div>

      <p class="submission-note">
        <i class="fas fa-info-circle"></i>
        {{ submissionNote }}
      </p>
    </div>

    <!-- Validation Summary -->
    <div v-if="validationErrors.length > 0" class="validation-summary">
      <validation-message
        v-for="(error, index) in validationErrors"
        :key="index"
        :message="error"
        type="error"
      />
    </div>
  </div>
</template>

<script>
import FormField from '../../../forms/FormField.vue';
import ValidationMessage from '../../../ui/ValidationMessage.vue';
import LoadingSpinner from '../../../ui/LoadingSpinner.vue';

/**
 * ReviewSubmitStep - Final iOS workflow step for reviewing and submitting
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'ReviewSubmitStep',

  components: {
    FormField,
    ValidationMessage,
    LoadingSpinner
  },

  props: {
    /**
     * Step data from workflow
     * @type {Object}
     */
    stepData: {
      type: Object,
      default: () => ({})
    },

    /**
     * All workflow data for review
     * @type {Object}
     */
    workflowData: {
      type: Object,
      default: () => ({})
    },

    /**
     * Validation errors from parent
     * @type {Array}
     */
    validationErrors: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      // Submission Options
      autoReleaseAfterApproval: this.stepData.autoReleaseAfterApproval !== false,
      submitForReview: this.stepData.submitForReview !== false,
      versionReleaseNotes: this.stepData.versionReleaseNotes || '',
      
      // Checklist
      checkedItems: this.stepData.checkedItems || {},
      
      // UI State
      submitting: false
    };
  },

  computed: {
    // Get step data from workflow
    apiKeyData() {
      return this.workflowData.apiKey || {};
    },
    
    bundleData() {
      return this.workflowData.bundleId || {};
    },
    
    certificateData() {
      return this.workflowData.certificate || {};
    },
    
    assetsData() {
      return this.workflowData.appAssets || {};
    },
    
    metadataData() {
      return this.workflowData.metadata || {};
    },

    // Validation status for each section
    apiConfigValid() {
      return !!(this.apiKeyData.apiKeyId || this.apiKeyData.keyFileContent);
    },
    
    appConfigValid() {
      return !!(this.bundleData.bundleId && 
                this.bundleData.appName && 
                this.bundleData.version &&
                this.bundleData.buildNumber);
    },
    
    signingConfigValid() {
      return !!(this.certificateData.certificateId || this.certificateData.certificateFile);
    },
    
    assetsConfigValid() {
      return !!(this.assetsData.appIcon && this.getTotalScreenshots() >= 3);
    },
    
    metadataConfigValid() {
      return !!(this.metadataData.description && 
                this.metadataData.primaryCategory &&
                this.metadataData.supportUrl);
    },

    // Overall validation
    allSectionsValid() {
      return this.apiConfigValid &&
             this.appConfigValid &&
             this.signingConfigValid &&
             this.assetsConfigValid &&
             this.metadataConfigValid;
    },

    checklistItems() {
      return [
        { id: 'tested', text: 'App has been thoroughly tested on real devices' },
        { id: 'guidelines', text: 'App complies with App Store Review Guidelines' },
        { id: 'content', text: 'All content is appropriate for the selected age rating' },
        { id: 'permissions', text: 'App only requests necessary permissions' },
        { id: 'crashes', text: 'App is free of crashes and major bugs' },
        { id: 'performance', text: 'App performs well on supported devices' }
      ];
    },

    allChecklistItemsChecked() {
      return this.checklistItems.every(item => this.checkedItems[item.id]);
    },

    canSubmit() {
      return this.allSectionsValid && this.allChecklistItemsChecked;
    },

    submitButtonText() {
      if (!this.allSectionsValid) {
        return 'Complete All Steps';
      }
      if (!this.allChecklistItemsChecked) {
        return 'Complete Checklist';
      }
      return 'Submit to App Store';
    },

    submissionNote() {
      if (this.autoReleaseAfterApproval) {
        return 'Your app will be automatically released once approved by Apple.';
      }
      return 'You will need to manually release your app after approval.';
    },

    isValid() {
      // This step is always "valid" as it's just a review
      return true;
    }
  },

  watch: {
    autoReleaseAfterApproval(value) {
      this.updateStepData({ autoReleaseAfterApproval: value });
    },
    submitForReview(value) {
      this.updateStepData({ submitForReview: value });
    },
    versionReleaseNotes(value) {
      this.updateStepData({ versionReleaseNotes: value });
    },
    checkedItems: {
      deep: true,
      handler(value) {
        this.updateStepData({ checkedItems: value });
      }
    }
  },

  methods: {
    getTotalScreenshots() {
      if (!this.assetsData.screenshots) return 0;
      return Object.values(this.assetsData.screenshots)
        .reduce((total, deviceScreenshots) => total + (deviceScreenshots?.length || 0), 0);
    },

    formatCategory(category) {
      return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    async saveDraft() {
      this.$emit('save-draft');
      
      this.$root.$emit('show-notification', {
        type: 'success',
        message: 'Draft saved successfully',
        duration: 3000
      });
    },

    async handleSubmit() {
      if (!this.canSubmit) return;

      this.submitting = true;

      try {
        // Prepare submission data
        const submissionData = {
          configuration: {
            apiKey: this.apiKeyData,
            bundleId: this.bundleData,
            certificate: this.certificateData,
            assets: this.assetsData,
            metadata: this.metadataData
          },
          options: {
            autoReleaseAfterApproval: this.autoReleaseAfterApproval,
            submitForReview: this.submitForReview,
            versionReleaseNotes: this.versionReleaseNotes
          },
          timestamp: new Date().toISOString()
        };

        // Simulate API call
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const workflowController = window.PublishingMiddleware.getComponent('iosWorkflowController');
          await workflowController.submitToAppStore(submissionData);
        } else {
          // Simulate delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Success
        this.$emit('submit', submissionData);
        
        this.$root.$emit('show-notification', {
          type: 'success',
          message: 'Successfully submitted to App Store Connect!',
          duration: 5000
        });

      } catch (error) {
        console.error('Submission failed:', error);
        
        this.$root.$emit('show-notification', {
          type: 'error',
          message: error.message || 'Failed to submit. Please try again.',
          duration: 5000
        });
      } finally {
        this.submitting = false;
      }
    },

    updateStepData(data) {
      this.$emit('update', {
        ...this.stepData,
        ...data
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.review-submit-step {
  max-width: 800px;
}

.step-intro {
  margin-bottom: var(--spacing-xl);

  .intro-text {
    margin: 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
  }
}

// Review Sections
.review-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.review-section {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin: 0;
    padding: var(--spacing-md) var(--spacing-lg);
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    font-size: 1rem;

    i {
      color: var(--text-color-secondary);
    }
  }

  .review-content {
    padding: var(--spacing-lg);
  }
}

.status-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: normal;
  padding: 2px 8px;
  border-radius: 12px;

  &--success {
    background-color: #d1fae5;
    color: #065f46;
  }

  &--warning {
    background-color: #fef3c7;
    color: #92400e;
  }
}

.review-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }

  .review-label {
    font-weight: 500;
    color: var(--text-color-secondary);
    min-width: 120px;
  }

  .review-value {
    color: var(--text-color);
    word-break: break-word;

    &.mono {
      font-family: 'Courier New', monospace;
    }

    &.link {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .text-success {
      color: var(--success-color);
    }

    .text-error {
      color: var(--error-color);
    }
  }
}

// Submission Options
.submission-options,
.submission-checklist {
  margin-bottom: var(--spacing-xl);

  .section-title {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-color);
  }
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  cursor: pointer;

  input[type="checkbox"] {
    margin-top: 2px;
    cursor: pointer;
  }

  span {
    flex: 1;
    
    strong {
      display: block;
      color: var(--text-color);
      margin-bottom: 2px;
    }

    .option-hint {
      display: block;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }
  }
}

.checklist-items {
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);

  .checklist-item {
    margin-bottom: var(--spacing-md);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Submission Actions
.submission-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .submission-note {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &-primary {
    background-color: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(var(--primary-color), 10%);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &-outline {
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);

    &:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>