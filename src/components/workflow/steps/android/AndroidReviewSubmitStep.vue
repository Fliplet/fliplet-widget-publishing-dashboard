<template>
  <div class="android-review-submit-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Review your app configuration before submitting to Google Play Console. 
        Make sure all information is accurate and complete.
      </p>
    </div>

    <!-- Configuration Summary -->
    <div class="review-sections">
      <!-- Store Configuration -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-store"></i>
          Store Configuration
          <span :class="['status-badge', storeConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ storeConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="storeConfigData.serviceAccountEmail" class="review-item">
            <span class="review-label">Service Account:</span>
            <span class="review-value">{{ storeConfigData.serviceAccountEmail }}</span>
          </div>
          <div v-if="storeConfigData.developerId" class="review-item">
            <span class="review-label">Developer ID:</span>
            <span class="review-value">{{ storeConfigData.developerId }}</span>
          </div>
          <div v-if="storeConfigData.connectionVerified" class="review-item">
            <span class="review-label">Connection:</span>
            <span class="review-value text-success">
              <i class="fas fa-check-circle"></i> Verified
            </span>
          </div>
        </div>
      </div>

      <!-- App Signing -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-key"></i>
          App Signing
          <span :class="['status-badge', signingConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ signingConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="keystoreData.signingMethod" class="review-item">
            <span class="review-label">Signing Method:</span>
            <span class="review-value">
              {{ keystoreData.signingMethod === 'google-managed' ? 'Google Play App Signing' : 'Self-Managed' }}
            </span>
          </div>
          <div v-if="keystoreData.uploadKeyGenerated || keystoreData.uploadKeyId" class="review-item">
            <span class="review-label">Upload Key:</span>
            <span class="review-value">
              <i class="fas fa-check"></i> Configured
            </span>
          </div>
          <div v-if="keystoreData.keystoreValidated" class="review-item">
            <span class="review-label">Keystore:</span>
            <span class="review-value text-success">
              <i class="fas fa-check-circle"></i> Validated
            </span>
          </div>
        </div>
      </div>

      <!-- App Bundle -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-cube"></i>
          App Bundle
          <span :class="['status-badge', bundleConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ bundleConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="bundleData.packageName" class="review-item">
            <span class="review-label">Package:</span>
            <span class="review-value mono">{{ bundleData.packageName }}</span>
          </div>
          <div v-if="bundleData.versionName" class="review-item">
            <span class="review-label">Version:</span>
            <span class="review-value">{{ bundleData.versionName }} ({{ bundleData.versionCode }})</span>
          </div>
          <div v-if="bundleData.targetSdkVersion" class="review-item">
            <span class="review-label">Target SDK:</span>
            <span class="review-value">API {{ bundleData.targetSdkVersion }}</span>
          </div>
          <div v-if="bundleData.selectedArchitectures" class="review-item">
            <span class="review-label">Architectures:</span>
            <span class="review-value">{{ bundleData.selectedArchitectures.join(', ') }}</span>
          </div>
        </div>
      </div>

      <!-- Store Listing -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-list"></i>
          Store Listing
          <span :class="['status-badge', listingConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ listingConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="listingData.title" class="review-item">
            <span class="review-label">Title:</span>
            <span class="review-value">{{ listingData.title }}</span>
          </div>
          <div v-if="listingData.category" class="review-item">
            <span class="review-label">Category:</span>
            <span class="review-value">{{ formatCategory(listingData.category) }}</span>
          </div>
          <div v-if="listingData.contentRating" class="review-item">
            <span class="review-label">Content Rating:</span>
            <span class="review-value">{{ formatContentRating(listingData.contentRating) }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Graphics:</span>
            <span class="review-value">
              <i :class="['fas', listingData.appIcon ? 'fa-check text-success' : 'fa-times text-error']"></i> Icon,
              <i :class="['fas', listingData.featureGraphic ? 'fa-check text-success' : 'fa-times text-error']"></i> Feature,
              <i :class="['fas', hasScreenshots() ? 'fa-check text-success' : 'fa-times text-error']"></i> Screenshots
            </span>
          </div>
        </div>
      </div>

      <!-- Release Settings -->
      <div class="review-section">
        <h4 class="section-title">
          <i class="fas fa-rocket"></i>
          Release Settings
          <span :class="['status-badge', releaseConfigValid ? 'status-badge--success' : 'status-badge--warning']">
            {{ releaseConfigValid ? 'Complete' : 'Incomplete' }}
          </span>
        </h4>
        
        <div class="review-content">
          <div v-if="releaseData.releaseTrack" class="review-item">
            <span class="review-label">Track:</span>
            <span class="review-value">{{ formatReleaseTrack(releaseData.releaseTrack) }}</span>
          </div>
          <div v-if="releaseData.enableStagedRollout" class="review-item">
            <span class="review-label">Rollout:</span>
            <span class="review-value">{{ releaseData.rolloutPercentage }}% staged rollout</span>
          </div>
          <div v-if="releaseData.managedPublishing" class="review-item">
            <span class="review-label">Publishing:</span>
            <span class="review-value">Managed (manual release)</span>
          </div>
          <div v-if="releaseData.countrySelection" class="review-item">
            <span class="review-label">Countries:</span>
            <span class="review-value">
              {{ releaseData.countrySelection === 'all' ? 'All countries' : `${releaseData.selectedCountries?.length || 0} selected` }}
            </span>
          </div>
        </div>
      </div>
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

    <!-- Build Options -->
    <div class="build-options">
      <h4 class="section-title">Build Options</h4>
      
      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="buildOptions.generateAAB"
        >
        <span>
          <strong>Generate Android App Bundle (.aab)</strong>
          <span class="option-hint">Required format for Google Play (recommended)</span>
        </span>
      </label>

      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="buildOptions.uploadToPlayConsole"
        >
        <span>
          <strong>Upload to Play Console after build</strong>
          <span class="option-hint">Automatically upload the AAB file when build completes</span>
        </span>
      </label>

      <form-field
        v-model="internalNotes"
        type="textarea"
        label="Internal Notes"
        placeholder="Notes for your team about this release..."
        :rows="3"
        help-text="These notes are for internal use only"
      />
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
            <i class="fab fa-google-play"></i>
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
 * AndroidReviewSubmitStep - Final Android workflow step for reviewing and submitting
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'AndroidReviewSubmitStep',

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
      // Checklist
      checkedItems: this.stepData.checkedItems || {},
      
      // Build Options
      buildOptions: {
        generateAAB: this.stepData.buildOptions?.generateAAB !== false,
        uploadToPlayConsole: this.stepData.buildOptions?.uploadToPlayConsole !== false
      },
      
      // Internal Notes
      internalNotes: this.stepData.internalNotes || '',
      
      // UI State
      submitting: false
    };
  },

  computed: {
    // Get step data from workflow
    storeConfigData() {
      return this.workflowData.storeConfig || {};
    },
    
    keystoreData() {
      return this.workflowData.keystore || {};
    },
    
    bundleData() {
      return this.workflowData.appBundle || {};
    },
    
    listingData() {
      return this.workflowData.storeListing || {};
    },
    
    releaseData() {
      return this.workflowData.releaseManagement || {};
    },

    // Validation status for each section
    storeConfigValid() {
      return !!(this.storeConfigData.connectionVerified);
    },
    
    signingConfigValid() {
      return !!(this.keystoreData.signingMethod && 
                (this.keystoreData.uploadKeyGenerated || 
                 this.keystoreData.uploadKeyId ||
                 this.keystoreData.keystoreValidated));
    },
    
    bundleConfigValid() {
      return !!(this.bundleData.packageName && 
                this.bundleData.versionName && 
                this.bundleData.versionCode);
    },
    
    listingConfigValid() {
      return !!(this.listingData.title && 
                this.listingData.category &&
                this.listingData.appIcon &&
                this.hasScreenshots());
    },
    
    releaseConfigValid() {
      return !!(this.releaseData.releaseTrack &&
                this.releaseData.releaseNotes?.['en-US']);
    },

    // Overall validation
    allSectionsValid() {
      return this.storeConfigValid &&
             this.signingConfigValid &&
             this.bundleConfigValid &&
             this.listingConfigValid &&
             this.releaseConfigValid;
    },

    checklistItems() {
      return [
        { id: 'tested', text: 'App has been thoroughly tested on multiple Android devices' },
        { id: 'policies', text: 'App complies with Google Play Developer policies' },
        { id: 'content', text: 'All content is appropriate for the selected rating' },
        { id: 'permissions', text: 'App requests only necessary permissions' },
        { id: 'data', text: 'Privacy policy accurately describes data collection' },
        { id: 'ads', text: 'Ad content (if any) follows Google Play ad policies' }
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
      return 'Submit to Google Play';
    },

    submissionNote() {
      if (this.releaseData.managedPublishing) {
        return 'Your app will be reviewed but not published until you manually release it.';
      }
      return 'Your app will be published automatically once approved by Google.';
    }
  },

  watch: {
    buildOptions: {
      deep: true,
      handler(value) {
        this.updateStepData({ buildOptions: value });
      }
    },
    checkedItems: {
      deep: true,
      handler(value) {
        this.updateStepData({ checkedItems: value });
      }
    },
    internalNotes(value) {
      this.updateStepData({ internalNotes: value });
    }
  },

  methods: {
    hasScreenshots() {
      const screenshots = this.listingData.screenshots;
      return screenshots && screenshots.phone && screenshots.phone.length >= 2;
    },

    formatCategory(category) {
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    formatContentRating(rating) {
      const ratings = {
        everyone: 'Everyone',
        everyone_10: 'Everyone 10+',
        teen: 'Teen',
        mature: 'Mature 17+',
        adults_only: 'Adults only 18+'
      };
      return ratings[rating] || rating;
    },

    formatReleaseTrack(track) {
      const tracks = {
        internal: 'Internal Testing',
        closed: 'Closed Testing',
        open: 'Open Testing',
        production: 'Production'
      };
      return tracks[track] || track;
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
            storeConfig: this.storeConfigData,
            keystore: this.keystoreData,
            appBundle: this.bundleData,
            storeListing: this.listingData,
            releaseManagement: this.releaseData
          },
          buildOptions: this.buildOptions,
          internalNotes: this.internalNotes,
          timestamp: new Date().toISOString()
        };

        // Simulate API call
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const workflowController = window.PublishingMiddleware.getComponent('androidWorkflowController');
          await workflowController.submitToGooglePlay(submissionData);
        } else {
          // Simulate delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Success
        this.$emit('submit', submissionData);
        
        this.$root.$emit('show-notification', {
          type: 'success',
          message: 'Successfully submitted to Google Play Console!',
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
.android-review-submit-step {
  max-width: 800px;
}

// Most styles are similar to iOS ReviewSubmitStep
// Reusing the same structure with Android-specific colors

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
      color: var(--android-color);
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

    &.text-success {
      color: var(--success-color);
    }

    &.text-error {
      color: var(--error-color);
    }
  }
}

// Checklist & Build Options
.submission-checklist,
.build-options {
  margin-bottom: var(--spacing-xl);

  .section-title {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-color);
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
    background-color: var(--android-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(var(--android-color), 10%);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &-outline {
    background-color: transparent;
    color: var(--android-color);
    border: 1px solid var(--android-color);

    &:hover:not(:disabled) {
      background-color: var(--android-color);
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