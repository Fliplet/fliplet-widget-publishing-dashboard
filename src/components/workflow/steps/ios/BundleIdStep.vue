<template>
  <div class="bundle-id-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your app's Bundle ID and version information. This must match the Bundle ID
        registered in your Apple Developer account.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleidentifier" target="_blank">
          Learn about Bundle IDs
        </a>
      </div>
    </div>

    <!-- App Selection -->
    <div v-if="availableApps.length > 0" class="app-selection">
      <h4 class="section-title">Select App</h4>
      <form-field
        v-model="selectedAppId"
        type="select"
        label="Choose from existing apps"
        placeholder="Select an app"
        :options="appOptions"
        help-text="Select an app to use its Bundle ID configuration"
        @input="handleAppSelection"
      />
    </div>

    <!-- Bundle ID Configuration -->
    <div class="bundle-config">
      <h4 class="section-title">Bundle ID Configuration</h4>
      
      <form-field
        v-model="bundleId"
        type="text"
        label="Bundle ID"
        placeholder="com.company.appname"
        :required="true"
        :rules="[validateBundleId]"
        help-text="Reverse domain notation (e.g., com.yourcompany.appname)"
        @validation="handleFieldValidation('bundleId', $event)"
      />

      <form-field
        v-model="appName"
        type="text"
        label="App Name"
        placeholder="My App"
        :required="true"
        :rules="[validateAppName]"
        help-text="The display name for your app"
        @validation="handleFieldValidation('appName', $event)"
      />

      <div class="version-fields">
        <form-field
          v-model="version"
          type="text"
          label="Version"
          placeholder="1.0.0"
          :required="true"
          :rules="[validateVersion]"
          help-text="Marketing version (e.g., 1.0.0)"
          @validation="handleFieldValidation('version', $event)"
        />

        <form-field
          v-model="buildNumber"
          type="text"
          label="Build Number"
          placeholder="1"
          :required="true"
          :rules="[validateBuildNumber]"
          help-text="Unique build number"
          @validation="handleFieldValidation('buildNumber', $event)"
        />
      </div>
    </div>

    <!-- App SKU Configuration -->
    <div class="sku-config">
      <h4 class="section-title">App Store Information</h4>
      
      <form-field
        v-model="appSku"
        type="text"
        label="App SKU"
        placeholder="MYAPP2024"
        :required="true"
        :rules="[validateAppSku]"
        help-text="Unique identifier for your app (not visible to users)"
        @validation="handleFieldValidation('appSku', $event)"
      />

      <form-field
        v-model="primaryLanguage"
        type="select"
        label="Primary Language"
        :options="languageOptions"
        :required="true"
        help-text="The primary language for your app listing"
        @validation="handleFieldValidation('primaryLanguage', $event)"
      />
    </div>

    <!-- Team Selection -->
    <div v-if="availableTeams.length > 1" class="team-selection">
      <h4 class="section-title">Development Team</h4>
      
      <form-field
        v-model="selectedTeamId"
        type="select"
        label="Select Team"
        :options="teamOptions"
        :required="true"
        help-text="Choose the Apple Developer team for this app"
        @input="handleTeamSelection"
      />

      <div v-if="selectedTeam" class="team-details">
        <div class="detail-item">
          <span class="detail-label">Team ID:</span>
          <span class="detail-value">{{ selectedTeam.teamId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Team Name:</span>
          <span class="detail-value">{{ selectedTeam.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Program:</span>
          <span class="detail-value">{{ selectedTeam.program }}</span>
        </div>
      </div>
    </div>

    <!-- Advanced Options -->
    <div class="advanced-options">
      <button 
        class="toggle-advanced"
        @click="showAdvanced = !showAdvanced"
      >
        <i :class="['fas', showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
        Advanced Options
      </button>

      <div v-if="showAdvanced" class="advanced-content">
        <form-field
          v-model="bundleSeedId"
          type="text"
          label="App ID Prefix"
          placeholder="ABC123DEF"
          help-text="Optional: Specify a custom App ID prefix"
          @validation="handleFieldValidation('bundleSeedId', $event)"
        />

        <div class="capability-options">
          <label class="field-label">App Capabilities</label>
          <div class="checkbox-list">
            <label class="checkbox-option">
              <input type="checkbox" v-model="capabilities.pushNotifications">
              <span>Push Notifications</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" v-model="capabilities.appGroups">
              <span>App Groups</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" v-model="capabilities.inAppPurchase">
              <span>In-App Purchase</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" v-model="capabilities.siriKit">
              <span>SiriKit</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Version History -->
    <div v-if="versionHistory.length > 0" class="version-history">
      <h4 class="section-title">Recent Versions</h4>
      <div class="version-list">
        <div 
          v-for="(versionItem, index) in versionHistory"
          :key="index"
          class="version-item"
        >
          <span class="version-number">{{ versionItem.version }} ({{ versionItem.buildNumber }})</span>
          <span class="version-date">{{ formatDate(versionItem.date) }}</span>
          <span :class="['version-status', `version-status--${versionItem.status}`]">
            {{ versionItem.status }}
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
 * BundleIdStep - iOS workflow step for configuring Bundle ID and app version
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'BundleIdStep',

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
      // Form fields
      selectedAppId: this.stepData.appId || '',
      bundleId: this.stepData.bundleId || '',
      appName: this.stepData.appName || '',
      version: this.stepData.version || '1.0.0',
      buildNumber: this.stepData.buildNumber || '1',
      appSku: this.stepData.appSku || '',
      primaryLanguage: this.stepData.primaryLanguage || 'en-US',
      selectedTeamId: this.stepData.teamId || '',
      bundleSeedId: this.stepData.bundleSeedId || '',
      
      // Capabilities
      capabilities: {
        pushNotifications: this.stepData.capabilities?.pushNotifications || false,
        appGroups: this.stepData.capabilities?.appGroups || false,
        inAppPurchase: this.stepData.capabilities?.inAppPurchase || false,
        siriKit: this.stepData.capabilities?.siriKit || false
      },

      // UI state
      showAdvanced: false,
      fieldValidation: {},
      
      // Data
      availableApps: [],
      availableTeams: [],
      versionHistory: [],
      loading: false
    };
  },

  computed: {
    appOptions() {
      return this.availableApps.map(app => ({
        value: app.id,
        label: `${app.name} (${app.bundleId})`
      }));
    },

    teamOptions() {
      return this.availableTeams.map(team => ({
        value: team.id,
        label: `${team.name} (${team.teamId})`
      }));
    },

    selectedTeam() {
      return this.availableTeams.find(team => team.id === this.selectedTeamId);
    },

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
        { value: 'zh-CN', label: 'Chinese (Simplified)' },
        { value: 'zh-TW', label: 'Chinese (Traditional)' }
      ];
    },

    isValid() {
      return this.bundleId &&
             this.appName &&
             this.version &&
             this.buildNumber &&
             this.appSku &&
             this.primaryLanguage &&
             (this.availableTeams.length <= 1 || this.selectedTeamId) &&
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

    // Watch individual fields to update step data
    bundleId(value) {
      this.updateStepData({ bundleId: value });
    },
    appName(value) {
      this.updateStepData({ appName: value });
    },
    version(value) {
      this.updateStepData({ version: value });
    },
    buildNumber(value) {
      this.updateStepData({ buildNumber: value });
    },
    appSku(value) {
      this.updateStepData({ appSku: value });
    },
    primaryLanguage(value) {
      this.updateStepData({ primaryLanguage: value });
    },
    capabilities: {
      deep: true,
      handler(value) {
        this.updateStepData({ capabilities: value });
      }
    }
  },

  created() {
    this.loadData();
  },

  methods: {
    async loadData() {
      try {
        this.loading = true;
        
        // Load from middleware if available
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          
          // Load available apps
          const appsResponse = await apiService.request('getApps', { platform: 'ios' });
          this.availableApps = appsResponse.apps || [];
          
          // Load teams
          const teamsResponse = await apiService.request('getTeams');
          this.availableTeams = teamsResponse.teams || [];
          
          // Load version history
          if (this.bundleId) {
            const historyResponse = await apiService.request('getVersionHistory', { 
              bundleId: this.bundleId 
            });
            this.versionHistory = historyResponse.versions || [];
          }
        } else {
          // Mock data for development
          this.availableApps = [
            { id: 'app1', name: 'My App', bundleId: 'com.company.myapp' },
            { id: 'app2', name: 'Another App', bundleId: 'com.company.anotherapp' }
          ];
          
          this.availableTeams = [
            { id: 'team1', teamId: 'ABC123', name: 'My Company', program: 'Apple Developer Program' }
          ];
          
          this.versionHistory = [
            { version: '1.0.0', buildNumber: '1', date: new Date('2024-01-15'), status: 'live' },
            { version: '1.0.1', buildNumber: '2', date: new Date('2024-02-20'), status: 'review' }
          ];
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        this.loading = false;
      }
    },

    handleAppSelection(appId) {
      const app = this.availableApps.find(a => a.id === appId);
      if (app) {
        this.bundleId = app.bundleId;
        this.appName = app.name;
        this.updateStepData({
          appId: appId,
          bundleId: app.bundleId,
          appName: app.name
        });
      }
    },

    handleTeamSelection(teamId) {
      const team = this.availableTeams.find(t => t.id === teamId);
      if (team) {
        this.updateStepData({
          teamId: teamId,
          teamDetails: team
        });
      }
    },

    handleFieldValidation(field, validation) {
      this.$set(this.fieldValidation, field, validation);
    },

    updateStepData(data) {
      this.$emit('update', {
        ...this.stepData,
        ...data
      });
    },

    getValidationErrors() {
      const errors = [];
      
      if (!this.bundleId) errors.push('Bundle ID is required');
      if (!this.appName) errors.push('App name is required');
      if (!this.version) errors.push('Version is required');
      if (!this.buildNumber) errors.push('Build number is required');
      if (!this.appSku) errors.push('App SKU is required');
      if (this.availableTeams.length > 1 && !this.selectedTeamId) {
        errors.push('Please select a development team');
      }
      
      return errors;
    },

    // Validation Rules
    validateBundleId(value) {
      if (!value) return 'Bundle ID is required';
      const bundleIdRegex = /^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;
      if (!bundleIdRegex.test(value)) {
        return 'Invalid Bundle ID format (e.g., com.company.app)';
      }
      if (value.length > 155) return 'Bundle ID must not exceed 155 characters';
      return true;
    },

    validateAppName(value) {
      if (!value) return 'App name is required';
      if (value.length > 30) return 'App name must not exceed 30 characters';
      return true;
    },

    validateVersion(value) {
      if (!value) return 'Version is required';
      const versionRegex = /^\d+\.\d+(\.\d+)?$/;
      if (!versionRegex.test(value)) {
        return 'Invalid version format (e.g., 1.0.0)';
      }
      return true;
    },

    validateBuildNumber(value) {
      if (!value) return 'Build number is required';
      if (!/^\d+$/.test(value)) return 'Build number must be numeric';
      const num = parseInt(value, 10);
      if (num < 1) return 'Build number must be greater than 0';
      return true;
    },

    validateAppSku(value) {
      if (!value) return 'App SKU is required';
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        return 'App SKU can only contain letters and numbers';
      }
      if (value.length > 100) return 'App SKU must not exceed 100 characters';
      return true;
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>

<style lang="scss" scoped>
.bundle-id-step {
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

.app-selection,
.bundle-config,
.sku-config,
.team-selection,
.version-history {
  margin-bottom: var(--spacing-xl);
}

.version-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.team-details {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }

  .detail-label {
    font-weight: 500;
    color: var(--text-color-secondary);
    min-width: 100px;
  }

  .detail-value {
    color: var(--text-color);
  }
}

.advanced-options {
  margin-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-lg);
}

.toggle-advanced {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.advanced-content {
  margin-top: var(--spacing-lg);
}

.field-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-color);
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;

  input[type="checkbox"] {
    cursor: pointer;
  }

  span {
    color: var(--text-color);
  }
}

.version-history {
  .version-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .version-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: #f9fafb;
    border-radius: var(--border-radius);
    border: 1px solid #e5e7eb;
    font-size: 0.875rem;
    align-items: center;

    .version-number {
      font-weight: 500;
      color: var(--text-color);
    }

    .version-date {
      color: var(--text-color-secondary);
    }

    .version-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;

      &--live {
        background-color: #d1fae5;
        color: #065f46;
      }

      &--review {
        background-color: #fef3c7;
        color: #92400e;
      }

      &--rejected {
        background-color: #fee2e2;
        color: #991b1b;
      }
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