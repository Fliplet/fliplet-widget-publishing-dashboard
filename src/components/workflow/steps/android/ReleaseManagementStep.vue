<template>
  <div class="release-management-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure how your app will be released on Google Play. Choose release type,
        rollout percentage, and release notes.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://support.google.com/googleplay/android-developer/answer/9844679" target="_blank">
          Learn about release management
        </a>
      </div>
    </div>

    <!-- Release Track -->
    <div class="release-track-section">
      <h4 class="section-title">Release Track</h4>
      
      <div class="track-options">
        <label class="radio-option">
          <input 
            type="radio" 
            v-model="releaseTrack" 
            value="internal"
            @change="handleTrackChange"
          >
          <span class="option-content">
            <span class="option-title">
              <i class="fas fa-user-shield"></i>
              Internal Testing
            </span>
            <span class="option-description">
              Limited to internal testers (up to 100 users)
            </span>
          </span>
        </label>

        <label class="radio-option">
          <input 
            type="radio" 
            v-model="releaseTrack" 
            value="closed"
            @change="handleTrackChange"
          >
          <span class="option-content">
            <span class="option-title">
              <i class="fas fa-users"></i>
              Closed Testing
            </span>
            <span class="option-description">
              Invite-only testing with specific user groups
            </span>
          </span>
        </label>

        <label class="radio-option">
          <input 
            type="radio" 
            v-model="releaseTrack" 
            value="open"
            @change="handleTrackChange"
          >
          <span class="option-content">
            <span class="option-title">
              <i class="fas fa-globe"></i>
              Open Testing
            </span>
            <span class="option-description">
              Public beta available to any user
            </span>
          </span>
        </label>

        <label class="radio-option">
          <input 
            type="radio" 
            v-model="releaseTrack" 
            value="production"
            @change="handleTrackChange"
          >
          <span class="option-content">
            <span class="option-title">
              <i class="fas fa-rocket"></i>
              Production
            </span>
            <span class="option-description">
              Full release to all users on Google Play
            </span>
          </span>
        </label>
      </div>
    </div>

    <!-- Rollout Configuration -->
    <div v-if="releaseTrack === 'production'" class="rollout-section">
      <h4 class="section-title">Staged Rollout</h4>
      
      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="enableStagedRollout"
        >
        <span>
          <strong>Enable staged rollout</strong>
          <span class="option-hint">Gradually release to a percentage of users</span>
        </span>
      </label>

      <div v-if="enableStagedRollout" class="rollout-config">
        <form-field
          v-model="rolloutPercentage"
          type="number"
          label="Rollout Percentage"
          placeholder="10"
          :min="1"
          :max="99"
          :rules="[validateRolloutPercentage]"
          help-text="Percentage of users who will receive the update"
          @validation="handleFieldValidation('rolloutPercentage', $event)"
        >
          <template #append>
            <span class="input-append">%</span>
          </template>
        </form-field>

        <div class="rollout-stages">
          <h5 class="subsection-title">Suggested Rollout Plan</h5>
          <div class="stage-list">
            <div 
              v-for="stage in rolloutStages" 
              :key="stage.percentage"
              :class="['stage-item', { active: rolloutPercentage >= stage.percentage }]"
            >
              <span class="stage-percentage">{{ stage.percentage }}%</span>
              <span class="stage-label">{{ stage.label }}</span>
              <span class="stage-duration">{{ stage.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Release Notes -->
    <div class="release-notes-section">
      <h4 class="section-title">Release Notes</h4>
      
      <div class="language-selector">
        <form-field
          v-model="selectedLanguage"
          type="select"
          label="Language"
          :options="languageOptions"
          help-text="Add release notes in multiple languages"
          @input="handleLanguageChange"
        />
        
        <button 
          v-if="!releaseNotes[selectedLanguage]"
          class="btn btn-sm btn-outline"
          @click="addLanguage"
        >
          <i class="fas fa-plus"></i>
          Add Language
        </button>
      </div>

      <form-field
        v-model="currentReleaseNotes"
        type="textarea"
        label="What's New"
        placeholder="• Bug fixes and performance improvements&#10;• New feature: ..."
        :rows="6"
        :max-length="500"
        :show-counter="true"
        :required="true"
        help-text="Describe what's new in this release"
        @validation="handleFieldValidation('releaseNotes', $event)"
        @input="updateReleaseNotes"
      />

      <div v-if="Object.keys(releaseNotes).length > 1" class="language-list">
        <h5 class="subsection-title">Release Notes by Language</h5>
        <div
          v-for="(notes, lang) in releaseNotes"
          :key="lang"
          class="language-item"
        >
          <span class="language-code">{{ getLanguageLabel(lang) }}</span>
          <span class="notes-preview">{{ notes.substring(0, 50) }}...</span>
          <button
            v-if="lang !== 'en-US'"
            class="btn-icon-sm"
            @click="removeLanguage(lang)"
            title="Remove"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Release Settings -->
    <div class="release-settings-section">
      <h4 class="section-title">Release Settings</h4>
      
      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="autoPublish"
        >
        <span>
          <strong>Auto-publish after review</strong>
          <span class="option-hint">Automatically publish when approved by Google</span>
        </span>
      </label>

      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="managedPublishing"
        >
        <span>
          <strong>Managed publishing</strong>
          <span class="option-hint">Control exactly when your update goes live</span>
        </span>
      </label>

      <div v-if="managedPublishing" class="managed-publishing-info">
        <i class="fas fa-info-circle"></i>
        <p>
          With managed publishing, your update will be reviewed but not published
          until you manually release it. You have up to 7 days after approval.
        </p>
      </div>
    </div>

    <!-- Countries & Regions -->
    <div class="countries-section">
      <h4 class="section-title">Countries & Regions</h4>
      
      <div class="country-options">
        <label class="radio-option">
          <input 
            type="radio" 
            v-model="countrySelection" 
            value="all"
          >
          <span>
            <strong>All countries & regions</strong>
            <span class="option-hint">Available everywhere Google Play operates</span>
          </span>
        </label>

        <label class="radio-option">
          <input 
            type="radio" 
            v-model="countrySelection" 
            value="selected"
          >
          <span>
            <strong>Selected countries & regions</strong>
            <span class="option-hint">Choose specific markets for your app</span>
          </span>
        </label>
      </div>

      <div v-if="countrySelection === 'selected'" class="country-selector">
        <p class="selector-hint">
          Select countries where your app will be available:
        </p>
        <!-- In real implementation, this would be a searchable multi-select -->
        <div class="selected-countries">
          <span class="country-tag" v-for="country in selectedCountries" :key="country">
            {{ country }}
            <button class="remove-country" @click="removeCountry(country)">
              <i class="fas fa-times"></i>
            </button>
          </span>
          <button class="btn btn-sm btn-outline" @click="showCountryPicker = true">
            <i class="fas fa-plus"></i>
            Add Countries
          </button>
        </div>
      </div>
    </div>

    <!-- Release Summary -->
    <div class="release-summary">
      <h4 class="section-title">Release Summary</h4>
      
      <div class="summary-card">
        <div class="summary-item">
          <span class="summary-label">Track:</span>
          <span class="summary-value">{{ getReleaseTrackLabel() }}</span>
        </div>
        <div v-if="enableStagedRollout" class="summary-item">
          <span class="summary-label">Rollout:</span>
          <span class="summary-value">{{ rolloutPercentage }}% of users</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Countries:</span>
          <span class="summary-value">
            {{ countrySelection === 'all' ? 'All countries' : `${selectedCountries.length} selected` }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Publishing:</span>
          <span class="summary-value">
            {{ managedPublishing ? 'Managed (manual release)' : 'Automatic' }}
          </span>
        </div>
      </div>
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

/**
 * ReleaseManagementStep - Android workflow step for release configuration
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'ReleaseManagementStep',

  components: {
    FormField,
    ValidationMessage
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
      // Release Track
      releaseTrack: this.stepData.releaseTrack || 'production',
      
      // Rollout
      enableStagedRollout: this.stepData.enableStagedRollout || false,
      rolloutPercentage: this.stepData.rolloutPercentage || '10',
      
      // Release Notes
      selectedLanguage: 'en-US',
      releaseNotes: this.stepData.releaseNotes || { 'en-US': '' },
      currentReleaseNotes: '',
      
      // Settings
      autoPublish: this.stepData.autoPublish !== false,
      managedPublishing: this.stepData.managedPublishing || false,
      
      // Countries
      countrySelection: this.stepData.countrySelection || 'all',
      selectedCountries: this.stepData.selectedCountries || ['United States', 'United Kingdom', 'Canada'],
      showCountryPicker: false,
      
      // UI State
      fieldValidation: {}
    };
  },

  computed: {
    languageOptions() {
      return [
        { value: 'en-US', label: 'English (US)' },
        { value: 'en-GB', label: 'English (UK)' },
        { value: 'es-ES', label: 'Spanish' },
        { value: 'fr-FR', label: 'French' },
        { value: 'de-DE', label: 'German' },
        { value: 'it-IT', label: 'Italian' },
        { value: 'ja-JP', label: 'Japanese' },
        { value: 'ko-KR', label: 'Korean' },
        { value: 'pt-BR', label: 'Portuguese (Brazil)' },
        { value: 'zh-CN', label: 'Chinese (Simplified)' }
      ];
    },

    rolloutStages() {
      return [
        { percentage: 5, label: 'Initial', duration: '1-2 days' },
        { percentage: 10, label: 'Early', duration: '2-3 days' },
        { percentage: 25, label: 'Expanded', duration: '3-5 days' },
        { percentage: 50, label: 'Broad', duration: '5-7 days' },
        { percentage: 100, label: 'Full', duration: 'Complete' }
      ];
    },

    isValid() {
      const hasReleaseNotes = this.releaseNotes['en-US'] && 
                             this.releaseNotes['en-US'].trim().length > 0;
      
      const hasValidRollout = !this.enableStagedRollout || 
                             (this.rolloutPercentage && 
                              this.rolloutPercentage >= 1 && 
                              this.rolloutPercentage <= 99);
      
      return hasReleaseNotes && 
             hasValidRollout &&
             Object.values(this.fieldValidation).every(v => v.isValid !== false);
    }
  },

  watch: {
    isValid: {
      immediate: true,
      handler(valid) {
        this.$emit('validate', {
          isValid: valid,
          errors: this.getValidationErrors()
        });
      }
    },

    selectedLanguage: {
      immediate: true,
      handler(lang) {
        this.currentReleaseNotes = this.releaseNotes[lang] || '';
      }
    }
  },

  methods: {
    handleTrackChange() {
      this.updateStepData({ releaseTrack: this.releaseTrack });
    },

    handleLanguageChange(lang) {
      this.currentReleaseNotes = this.releaseNotes[lang] || '';
    },

    addLanguage() {
      this.$set(this.releaseNotes, this.selectedLanguage, '');
      this.currentReleaseNotes = '';
    },

    removeLanguage(lang) {
      this.$delete(this.releaseNotes, lang);
      if (this.selectedLanguage === lang) {
        this.selectedLanguage = 'en-US';
      }
    },

    updateReleaseNotes(value) {
      this.$set(this.releaseNotes, this.selectedLanguage, value);
      this.updateStepData({ releaseNotes: this.releaseNotes });
    },

    removeCountry(country) {
      const index = this.selectedCountries.indexOf(country);
      if (index > -1) {
        this.selectedCountries.splice(index, 1);
      }
    },

    getReleaseTrackLabel() {
      const labels = {
        internal: 'Internal Testing',
        closed: 'Closed Testing',
        open: 'Open Testing',
        production: 'Production'
      };
      return labels[this.releaseTrack] || this.releaseTrack;
    },

    getLanguageLabel(code) {
      const lang = this.languageOptions.find(l => l.value === code);
      return lang ? lang.label : code;
    },

    handleFieldValidation(field, validation) {
      this.$set(this.fieldValidation, field, validation);
    },

    updateStepData(data) {
      this.$emit('update', {
        ...this.stepData,
        ...data,
        releaseTrack: this.releaseTrack,
        enableStagedRollout: this.enableStagedRollout,
        rolloutPercentage: this.rolloutPercentage,
        autoPublish: this.autoPublish,
        managedPublishing: this.managedPublishing,
        countrySelection: this.countrySelection,
        selectedCountries: this.selectedCountries
      });
    },

    getValidationErrors() {
      const errors = [];
      
      if (!this.releaseNotes['en-US'] || !this.releaseNotes['en-US'].trim()) {
        errors.push('Release notes in English (US) are required');
      }
      
      if (this.enableStagedRollout) {
        if (!this.rolloutPercentage) {
          errors.push('Rollout percentage is required');
        } else if (this.rolloutPercentage < 1 || this.rolloutPercentage > 99) {
          errors.push('Rollout percentage must be between 1% and 99%');
        }
      }
      
      if (this.countrySelection === 'selected' && this.selectedCountries.length === 0) {
        errors.push('At least one country must be selected');
      }
      
      return errors;
    },

    validateRolloutPercentage(value) {
      if (!value) return 'Rollout percentage is required';
      const percentage = parseInt(value);
      if (isNaN(percentage) || percentage < 1 || percentage > 99) {
        return 'Must be between 1% and 99%';
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.release-management-step {
  max-width: 700px;
}

.step-intro {
  margin-bottom: var(--spacing-xl);

  .intro-text {
    margin: 0 0 var(--spacing-md) 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
  }

  .help-link {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--primary-color);
    font-size: 0.875rem;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-color);
}

.subsection-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
}

.release-track-section,
.rollout-section,
.release-notes-section,
.release-settings-section,
.countries-section,
.release-summary {
  margin-bottom: var(--spacing-xl);
}

.track-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.radio-option {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:hover {
    border-color: var(--android-color);
  }

  input[type="radio"] {
    margin-right: var(--spacing-sm);
    margin-top: 2px;
  }

  &:has(input:checked) {
    border-color: var(--android-color);
    background-color: rgba(61, 220, 132, 0.05);
  }

  .option-content {
    display: flex;
    flex-direction: column;
  }

  .option-title {
    font-weight: 500;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    i {
      color: var(--android-color);
    }
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
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

.rollout-config {
  margin-top: var(--spacing-md);
  padding-left: var(--spacing-lg);
}

.input-append {
  padding: 0 var(--spacing-sm);
  color: var(--text-color-secondary);
}

.rollout-stages {
  margin-top: var(--spacing-lg);
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.stage-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  align-items: center;
  transition: all var(--transition-speed) ease;

  &.active {
    background-color: #d1fae5;
    color: #065f46;
  }

  .stage-percentage {
    font-weight: 600;
  }

  .stage-duration {
    color: var(--text-color-secondary);
  }
}

.language-selector {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  margin-bottom: var(--spacing-md);
}

.language-list {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
}

.language-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  font-size: 0.875rem;

  .language-code {
    font-weight: 500;
    min-width: 120px;
  }

  .notes-preview {
    flex: 1;
    color: var(--text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.managed-publishing-info {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--border-radius);

  i {
    color: #2563eb;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    color: #1e40af;
    font-size: 0.875rem;
  }
}

.country-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.country-selector {
  margin-top: var(--spacing-md);
  padding-left: var(--spacing-lg);

  .selector-hint {
    margin: 0 0 var(--spacing-md) 0;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }
}

.selected-countries {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.country-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 12px;
  background-color: #e0e7ff;
  color: #3730a3;
  border-radius: 16px;
  font-size: 0.875rem;

  .remove-country {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

.summary-card {
  padding: var(--spacing-lg);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }

  .summary-label {
    font-weight: 500;
    color: var(--text-color-secondary);
    min-width: 100px;
  }

  .summary-value {
    color: var(--text-color);
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

  &-outline {
    background-color: transparent;
    color: var(--android-color);
    border: 1px solid var(--android-color);

    &:hover {
      background-color: var(--android-color);
      color: white;
    }
  }

  &-sm {
    padding: 6px 12px;
    font-size: 0.875rem;
  }
}

.btn-icon-sm {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: color var(--transition-speed) ease;

  &:hover {
    color: var(--error-color);
  }
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>