<template>
  <div class="api-key-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your App Store Connect API access. You can either select an existing API key 
        or create a new one.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developer.apple.com/documentation/appstoreconnectapi" target="_blank">
          Learn about App Store Connect API
        </a>
      </div>
    </div>

    <!-- API Key Selection -->
    <div class="api-key-selection">
      <h4 class="section-title">Select API Key</h4>
      
      <!-- Existing Keys -->
      <div v-if="existingKeys.length > 0" class="existing-keys">
        <form-field
          v-model="selectedKeyId"
          type="select"
          label="Use Existing API Key"
          placeholder="Select an API key"
          :options="keyOptions"
          :required="!isCreatingNew"
          @input="handleKeySelection"
        />
        
        <!-- Selected Key Details -->
        <div v-if="selectedKey" class="key-details">
          <div class="detail-item">
            <span class="detail-label">Key ID:</span>
            <span class="detail-value">{{ selectedKey.keyId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Issuer ID:</span>
            <span class="detail-value">{{ selectedKey.issuerId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created:</span>
            <span class="detail-value">{{ formatDate(selectedKey.createdAt) }}</span>
          </div>
          <div v-if="selectedKey.roles" class="detail-item">
            <span class="detail-label">Roles:</span>
            <span class="detail-value">{{ selectedKey.roles.join(', ') }}</span>
          </div>
        </div>
      </div>

      <!-- Or Divider -->
      <div v-if="existingKeys.length > 0" class="divider">
        <span>OR</span>
      </div>

      <!-- Create New Key -->
      <div class="create-new-section">
        <button 
          v-if="!isCreatingNew"
          class="btn btn-outline"
          @click="startCreateNew"
        >
          <i class="fas fa-plus"></i>
          Create New API Key
        </button>

        <!-- New Key Form -->
        <div v-if="isCreatingNew" class="new-key-form">
          <h4 class="section-title">
            Create New API Key
            <button 
              class="btn-text"
              @click="cancelCreateNew"
            >
              Cancel
            </button>
          </h4>

          <form-field
            v-model="newKey.name"
            type="text"
            label="Key Name"
            placeholder="e.g., My Publishing Key"
            :required="true"
            :rules="[validateKeyName]"
            help-text="A descriptive name for this API key"
            @validation="handleFieldValidation('name', $event)"
          />

          <form-field
            v-model="newKey.issuerId"
            type="text"
            label="Issuer ID"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            :required="true"
            :rules="[validateIssuerId]"
            help-text="Your App Store Connect Issuer ID"
            @validation="handleFieldValidation('issuerId', $event)"
          />

          <form-field
            v-model="newKey.keyId"
            type="text"
            label="Key ID"
            placeholder="XXXXXXXXXX"
            :required="true"
            :rules="[validateKeyId]"
            help-text="The ID of your API key"
            @validation="handleFieldValidation('keyId', $event)"
          />

          <div class="key-file-upload">
            <label class="field-label">
              Private Key File (.p8)
              <span class="required">*</span>
            </label>
            <file-upload-zone
              v-model="newKey.keyFile"
              accept=".p8"
              :max-size="1048576"
              help-text="Upload your .p8 private key file (max 1MB)"
              @input="handleKeyFileUpload"
            />
          </div>

          <div class="key-permissions">
            <label class="field-label">Key Permissions</label>
            <div class="permission-options">
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="newKey.permissions.manageApps"
                >
                <span>Manage Apps</span>
              </label>
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="newKey.permissions.uploadBuilds"
                  checked
                  disabled
                >
                <span>Upload Builds (Required)</span>
              </label>
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="newKey.permissions.viewReports"
                >
                <span>View Reports</span>
              </label>
            </div>
          </div>
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

    <!-- Step Actions (handled by parent WorkflowStep) -->
  </div>
</template>

<script>
import FormField from '../../../forms/FormField.vue';
import FileUploadZone from '../../../ui/FileUploadZone.vue';
import ValidationMessage from '../../../ui/ValidationMessage.vue';

/**
 * ApiKeyStep - iOS workflow step for configuring App Store Connect API access
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'ApiKeyStep',

  components: {
    FormField,
    FileUploadZone,
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
      selectedKeyId: this.stepData.apiKeyId || '',
      isCreatingNew: false,
      existingKeys: [],
      newKey: {
        name: '',
        issuerId: '',
        keyId: '',
        keyFile: null,
        permissions: {
          manageApps: false,
          uploadBuilds: true,
          viewReports: false
        }
      },
      fieldValidation: {},
      loading: false
    };
  },

  computed: {
    keyOptions() {
      return this.existingKeys.map(key => ({
        value: key.id,
        label: `${key.name} (${key.keyId})`
      }));
    },

    selectedKey() {
      if (!this.selectedKeyId) return null;
      return this.existingKeys.find(key => key.id === this.selectedKeyId);
    },

    isValid() {
      if (this.isCreatingNew) {
        // Check if all required fields are valid
        return this.newKey.name &&
               this.newKey.issuerId &&
               this.newKey.keyId &&
               this.newKey.keyFile &&
               Object.values(this.fieldValidation).every(v => v.isValid !== false);
      } else {
        // Check if a key is selected
        return !!this.selectedKeyId;
      }
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
    }
  },

  created() {
    this.loadExistingKeys();
  },

  methods: {
    async loadExistingKeys() {
      try {
        this.loading = true;
        
        // Load from middleware if available
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          const response = await apiService.request('getApiKeys', { platform: 'ios' });
          this.existingKeys = response.keys || [];
        } else {
          // Mock data for development
          this.existingKeys = [
            {
              id: 'key1',
              name: 'Production Key',
              keyId: 'ABC123DEF4',
              issuerId: '12345678-1234-1234-1234-123456789012',
              createdAt: new Date('2024-01-15'),
              roles: ['Admin']
            },
            {
              id: 'key2',
              name: 'Development Key',
              keyId: 'XYZ789GHI5',
              issuerId: '12345678-1234-1234-1234-123456789012',
              createdAt: new Date('2024-03-20'),
              roles: ['Developer']
            }
          ];
        }
      } catch (error) {
        console.error('Failed to load API keys:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Failed to load existing API keys'
        });
      } finally {
        this.loading = false;
      }
    },

    handleKeySelection(keyId) {
      const key = this.existingKeys.find(k => k.id === keyId);
      if (key) {
        this.updateStepData({
          apiKeyId: keyId,
          apiKeyName: key.name,
          issuerId: key.issuerId,
          keyId: key.keyId
        });
      }
    },

    startCreateNew() {
      this.isCreatingNew = true;
      this.selectedKeyId = '';
      this.updateStepData({
        apiKeyId: null,
        isNewKey: true
      });
    },

    cancelCreateNew() {
      this.isCreatingNew = false;
      this.newKey = {
        name: '',
        issuerId: '',
        keyId: '',
        keyFile: null,
        permissions: {
          manageApps: false,
          uploadBuilds: true,
          viewReports: false
        }
      };
      this.updateStepData({
        isNewKey: false
      });
    },

    handleKeyFileUpload(file) {
      if (file) {
        // Read file content if needed
        const reader = new FileReader();
        reader.onload = (e) => {
          this.updateStepData({
            keyFileContent: e.target.result,
            keyFileName: file.name
          });
        };
        reader.readAsText(file);
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
      
      if (!this.isValid) {
        if (this.isCreatingNew) {
          if (!this.newKey.name) errors.push('Key name is required');
          if (!this.newKey.issuerId) errors.push('Issuer ID is required');
          if (!this.newKey.keyId) errors.push('Key ID is required');
          if (!this.newKey.keyFile) errors.push('Private key file is required');
        } else {
          if (!this.selectedKeyId) errors.push('Please select an API key or create a new one');
        }
      }
      
      return errors;
    },

    // Validation Rules
    validateKeyName(value) {
      if (!value) return 'Key name is required';
      if (value.length < 3) return 'Key name must be at least 3 characters';
      if (value.length > 50) return 'Key name must not exceed 50 characters';
      return true;
    },

    validateIssuerId(value) {
      if (!value) return 'Issuer ID is required';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) return 'Invalid Issuer ID format';
      return true;
    },

    validateKeyId(value) {
      if (!value) return 'Key ID is required';
      if (value.length !== 10) return 'Key ID must be 10 characters';
      if (!/^[A-Z0-9]+$/.test(value)) return 'Key ID must contain only uppercase letters and numbers';
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
.api-key-step {
  max-width: 600px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.existing-keys {
  margin-bottom: var(--spacing-lg);
}

.key-details {
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
    font-family: monospace;
  }
}

.divider {
  text-align: center;
  margin: var(--spacing-xl) 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e5e7eb;
  }

  span {
    position: relative;
    background-color: white;
    padding: 0 var(--spacing-md);
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.new-key-form {
  .field-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var(--text-color);

    .required {
      color: var(--error-color);
      margin-left: 2px;
    }
  }
}

.key-file-upload {
  margin-bottom: var(--spacing-lg);
}

.key-permissions {
  margin-top: var(--spacing-lg);
}

.permission-options {
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

  input:disabled + span {
    color: var(--text-color-secondary);
  }
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
    color: var(--primary-color);
    border: 1px solid var(--primary-color);

    &:hover {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &-text {
    background: none;
    border: none;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    padding: 4px 8px;

    &:hover {
      color: var(--text-color);
    }
  }
}

// Loading state
.api-key-step[data-loading="true"] {
  opacity: 0.7;
  pointer-events: none;
}
</style>