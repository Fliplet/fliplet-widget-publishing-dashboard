<template>
  <div class="app-bundle-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your Android App Bundle settings. This includes package name,
        version information, and build configuration.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developer.android.com/guide/app-bundle" target="_blank">
          Learn about Android App Bundles
        </a>
      </div>
    </div>

    <!-- Package Configuration -->
    <div class="package-section">
      <h4 class="section-title">Package Configuration</h4>
      
      <form-field
        v-model="packageName"
        type="text"
        label="Package Name"
        placeholder="com.company.appname"
        :required="true"
        :rules="[validatePackageName]"
        help-text="Unique identifier for your app (e.g., com.yourcompany.appname)"
        @validation="handleFieldValidation('packageName', $event)"
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
    </div>

    <!-- Version Information -->
    <div class="version-section">
      <h4 class="section-title">Version Information</h4>
      
      <div class="version-fields">
        <form-field
          v-model="versionName"
          type="text"
          label="Version Name"
          placeholder="1.0.0"
          :required="true"
          :rules="[validateVersionName]"
          help-text="User-visible version (e.g., 1.0.0)"
          @validation="handleFieldValidation('versionName', $event)"
        />

        <form-field
          v-model="versionCode"
          type="number"
          label="Version Code"
          placeholder="1"
          :required="true"
          :rules="[validateVersionCode]"
          help-text="Internal version number (must increment)"
          @validation="handleFieldValidation('versionCode', $event)"
        />
      </div>

      <!-- Version History -->
      <div v-if="versionHistory.length > 0" class="version-history">
        <h5 class="subsection-title">Recent Versions</h5>
        <div class="version-list">
          <div 
            v-for="(version, index) in versionHistory"
            :key="index"
            class="version-item"
          >
            <span class="version-number">{{ version.versionName }} ({{ version.versionCode }})</span>
            <span class="version-date">{{ formatDate(version.date) }}</span>
            <span :class="['version-status', `version-status--${version.status}`]">
              {{ version.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Build Configuration -->
    <div class="build-section">
      <h4 class="section-title">Build Configuration</h4>
      
      <form-field
        v-model="minSdkVersion"
        type="number"
        label="Minimum SDK Version"
        placeholder="21"
        :required="true"
        :rules="[validateSdkVersion]"
        help-text="Minimum Android version (API level)"
        @validation="handleFieldValidation('minSdkVersion', $event)"
      />

      <form-field
        v-model="targetSdkVersion"
        type="number"
        label="Target SDK Version"
        placeholder="33"
        :required="true"
        :rules="[validateSdkVersion]"
        help-text="Target Android version (API level)"
        @validation="handleFieldValidation('targetSdkVersion', $event)"
      />

      <div class="sdk-info">
        <i class="fas fa-info-circle"></i>
        <span>
          Google Play requires targeting API level {{ requiredTargetSdk }} or higher
        </span>
      </div>
    </div>

    <!-- App Bundle Options -->
    <div class="bundle-options-section">
      <h4 class="section-title">App Bundle Options</h4>
      
      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="enableSplitApks"
        >
        <span>
          <strong>Enable Split APKs</strong>
          <span class="option-hint">Optimize app size by splitting APKs per device configuration</span>
        </span>
      </label>

      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="enableProguard"
        >
        <span>
          <strong>Enable ProGuard/R8</strong>
          <span class="option-hint">Obfuscate and optimize code</span>
        </span>
      </label>

      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="enableResourceShrinking"
        >
        <span>
          <strong>Enable Resource Shrinking</strong>
          <span class="option-hint">Remove unused resources to reduce app size</span>
        </span>
      </label>
    </div>

    <!-- Architecture Selection -->
    <div class="architecture-section">
      <h4 class="section-title">Supported Architectures</h4>
      <p class="section-description">
        Select which device architectures to support
      </p>
      
      <div class="architecture-options">
        <label
          v-for="arch in architectureOptions"
          :key="arch.value"
          class="checkbox-option"
        >
          <input
            type="checkbox"
            v-model="selectedArchitectures"
            :value="arch.value"
          >
          <span>
            <strong>{{ arch.label }}</strong>
            <span class="option-hint">{{ arch.description }}</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Build Preview -->
    <div class="build-preview-section">
      <h4 class="section-title">Build Configuration Summary</h4>
      
      <div class="preview-card">
        <div class="preview-item">
          <span class="preview-label">Package:</span>
          <span class="preview-value">{{ packageName || 'Not set' }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Version:</span>
          <span class="preview-value">{{ versionName }} ({{ versionCode }})</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">SDK Range:</span>
          <span class="preview-value">API {{ minSdkVersion }} - {{ targetSdkVersion }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Architectures:</span>
          <span class="preview-value">{{ selectedArchitectures.join(', ') || 'None' }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Optimizations:</span>
          <span class="preview-value">
            {{ getOptimizationSummary() }}
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
 * AppBundleStep - Android workflow step for app bundle configuration
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'AppBundleStep',

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
      // Package Info
      packageName: this.stepData.packageName || '',
      appName: this.stepData.appName || '',
      
      // Version Info
      versionName: this.stepData.versionName || '1.0.0',
      versionCode: this.stepData.versionCode || '1',
      versionHistory: [],
      
      // Build Config
      minSdkVersion: this.stepData.minSdkVersion || '21',
      targetSdkVersion: this.stepData.targetSdkVersion || '33',
      requiredTargetSdk: 33, // Google Play requirement
      
      // Bundle Options
      enableSplitApks: this.stepData.enableSplitApks !== false,
      enableProguard: this.stepData.enableProguard !== false,
      enableResourceShrinking: this.stepData.enableResourceShrinking !== false,
      
      // Architectures
      selectedArchitectures: this.stepData.selectedArchitectures || ['armeabi-v7a', 'arm64-v8a'],
      
      // UI State
      fieldValidation: {},
      loading: false
    };
  },

  computed: {
    architectureOptions() {
      return [
        {
          value: 'armeabi-v7a',
          label: 'ARMv7',
          description: '32-bit ARM devices'
        },
        {
          value: 'arm64-v8a',
          label: 'ARM64',
          description: '64-bit ARM devices (recommended)'
        },
        {
          value: 'x86',
          label: 'x86',
          description: '32-bit Intel devices (emulators)'
        },
        {
          value: 'x86_64',
          label: 'x86_64',
          description: '64-bit Intel devices'
        }
      ];
    },

    isValid() {
      return this.packageName &&
             this.appName &&
             this.versionName &&
             this.versionCode &&
             this.minSdkVersion &&
             this.targetSdkVersion &&
             this.selectedArchitectures.length > 0 &&
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

    // Watch all fields to update step data
    packageName(value) { this.updateStepData({ packageName: value }); },
    appName(value) { this.updateStepData({ appName: value }); },
    versionName(value) { this.updateStepData({ versionName: value }); },
    versionCode(value) { this.updateStepData({ versionCode: value }); },
    minSdkVersion(value) { this.updateStepData({ minSdkVersion: value }); },
    targetSdkVersion(value) { this.updateStepData({ targetSdkVersion: value }); },
    enableSplitApks(value) { this.updateStepData({ enableSplitApks: value }); },
    enableProguard(value) { this.updateStepData({ enableProguard: value }); },
    enableResourceShrinking(value) { this.updateStepData({ enableResourceShrinking: value }); },
    selectedArchitectures(value) { this.updateStepData({ selectedArchitectures: value }); }
  },

  created() {
    this.loadVersionHistory();
  },

  methods: {
    async loadVersionHistory() {
      try {
        // In real implementation, load from middleware
        this.versionHistory = [
          {
            versionName: '0.9.0',
            versionCode: 9,
            date: new Date('2024-01-15'),
            status: 'production'
          },
          {
            versionName: '0.9.1',
            versionCode: 10,
            date: new Date('2024-02-01'),
            status: 'beta'
          }
        ];
      } catch (error) {
        console.error('Failed to load version history:', error);
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

    getOptimizationSummary() {
      const optimizations = [];
      if (this.enableSplitApks) optimizations.push('Split APKs');
      if (this.enableProguard) optimizations.push('ProGuard');
      if (this.enableResourceShrinking) optimizations.push('Resource Shrinking');
      return optimizations.length > 0 ? optimizations.join(', ') : 'None';
    },

    getValidationErrors() {
      const errors = [];
      
      if (!this.packageName) errors.push('Package name is required');
      if (!this.appName) errors.push('App name is required');
      if (!this.versionName) errors.push('Version name is required');
      if (!this.versionCode) errors.push('Version code is required');
      if (!this.minSdkVersion) errors.push('Minimum SDK version is required');
      if (!this.targetSdkVersion) errors.push('Target SDK version is required');
      
      if (this.targetSdkVersion && parseInt(this.targetSdkVersion) < this.requiredTargetSdk) {
        errors.push(`Target SDK must be ${this.requiredTargetSdk} or higher`);
      }
      
      if (this.selectedArchitectures.length === 0) {
        errors.push('At least one architecture must be selected');
      }
      
      return errors;
    },

    // Validation Rules
    validatePackageName(value) {
      if (!value) return 'Package name is required';
      const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
      if (!packageRegex.test(value)) {
        return 'Invalid package name format (e.g., com.company.app)';
      }
      if (value.length > 255) return 'Package name too long';
      return true;
    },

    validateAppName(value) {
      if (!value) return 'App name is required';
      if (value.length > 50) return 'App name must not exceed 50 characters';
      return true;
    },

    validateVersionName(value) {
      if (!value) return 'Version name is required';
      const versionRegex = /^\d+\.\d+(\.\d+)?$/;
      if (!versionRegex.test(value)) {
        return 'Invalid version format (e.g., 1.0.0)';
      }
      return true;
    },

    validateVersionCode(value) {
      if (!value) return 'Version code is required';
      const code = parseInt(value);
      if (isNaN(code) || code < 1) return 'Version code must be a positive number';
      if (code > 2100000000) return 'Version code too large';
      
      // Check against history
      const latestCode = Math.max(...this.versionHistory.map(v => v.versionCode), 0);
      if (code <= latestCode) {
        return `Version code must be greater than ${latestCode}`;
      }
      
      return true;
    },

    validateSdkVersion(value) {
      if (!value) return 'SDK version is required';
      const version = parseInt(value);
      if (isNaN(version) || version < 1) return 'Invalid SDK version';
      if (version > 99) return 'SDK version too high';
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
.app-bundle-step {
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

.section-description {
  margin: -8px 0 var(--spacing-md) 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.package-section,
.version-section,
.build-section,
.bundle-options-section,
.architecture-section,
.build-preview-section {
  margin-bottom: var(--spacing-xl);
}

.version-fields {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-md);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.version-history {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.version-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
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

    &--production {
      background-color: #d1fae5;
      color: #065f46;
    }

    &--beta {
      background-color: #fef3c7;
      color: #92400e;
    }

    &--alpha {
      background-color: #e0e7ff;
      color: #3730a3;
    }
  }
}

.sdk-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: #eff6ff;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  color: #1e40af;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  cursor: pointer;

  &:last-child {
    margin-bottom: 0;
  }

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

.architecture-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.preview-card {
  padding: var(--spacing-lg);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.preview-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }

  .preview-label {
    font-weight: 500;
    color: var(--text-color-secondary);
    min-width: 120px;
  }

  .preview-value {
    color: var(--text-color);
  }
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>