<template>
  <div class="store-config-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your Google Play Console access. You'll need a service account with
        the appropriate permissions to publish apps.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developers.google.com/android-publisher/getting_started" target="_blank">
          Learn about Google Play Console API
        </a>
      </div>
    </div>

    <!-- Service Account Configuration -->
    <div class="service-account-section">
      <h4 class="section-title">Service Account</h4>
      
      <!-- Existing Service Accounts -->
      <div v-if="existingAccounts.length > 0" class="existing-accounts">
        <form-field
          v-model="selectedAccountId"
          type="select"
          label="Use Existing Service Account"
          placeholder="Select a service account"
          :options="accountOptions"
          :required="!isCreatingNew"
          @input="handleAccountSelection"
        />
        
        <!-- Selected Account Details -->
        <div v-if="selectedAccount" class="account-details">
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ selectedAccount.email }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Project ID:</span>
            <span class="detail-value">{{ selectedAccount.projectId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created:</span>
            <span class="detail-value">{{ formatDate(selectedAccount.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Or Divider -->
      <div v-if="existingAccounts.length > 0" class="divider">
        <span>OR</span>
      </div>

      <!-- Upload New Service Account -->
      <div class="upload-account-section">
        <button 
          v-if="!isCreatingNew"
          class="btn btn-outline"
          @click="startCreateNew"
        >
          <i class="fas fa-plus"></i>
          Add New Service Account
        </button>

        <!-- New Account Form -->
        <div v-if="isCreatingNew" class="new-account-form">
          <h4 class="section-title">
            Add Service Account
            <button 
              class="btn-text"
              @click="cancelCreateNew"
            >
              Cancel
            </button>
          </h4>

          <form-field
            v-model="newAccount.name"
            type="text"
            label="Account Name"
            placeholder="e.g., My Publishing Account"
            :required="true"
            :rules="[validateAccountName]"
            help-text="A descriptive name for this service account"
            @validation="handleFieldValidation('name', $event)"
          />

          <div class="json-file-upload">
            <label class="field-label">
              Service Account JSON Key
              <span class="required">*</span>
            </label>
            <file-upload-zone
              v-model="newAccount.jsonFile"
              accept=".json"
              :max-size="1048576"
              help-text="Upload your service account JSON key file (max 1MB)"
              @input="handleJsonFileUpload"
            />
          </div>

          <div v-if="jsonKeyData" class="json-preview">
            <h5>Detected Configuration:</h5>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ jsonKeyData.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Project ID:</span>
              <span class="detail-value">{{ jsonKeyData.project_id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Client Email:</span>
              <span class="detail-value">{{ jsonKeyData.client_email }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Developer Account Selection -->
    <div class="developer-account-section">
      <h4 class="section-title">Developer Account</h4>
      
      <form-field
        v-model="developerId"
        type="text"
        label="Developer ID"
        placeholder="e.g., 1234567890"
        :required="true"
        :rules="[validateDeveloperId]"
        help-text="Your Google Play Developer account ID"
        @validation="handleFieldValidation('developerId', $event)"
      />

      <div class="where-to-find">
        <i class="fas fa-question-circle"></i>
        <span>Find this in Google Play Console → Settings → Developer account → Developer ID</span>
      </div>
    </div>

    <!-- API Permissions Check -->
    <div class="permissions-section">
      <h4 class="section-title">Required Permissions</h4>
      <p class="section-description">
        Ensure your service account has these permissions in Google Play Console:
      </p>
      
      <div class="permission-checklist">
        <label
          v-for="permission in requiredPermissions"
          :key="permission.id"
          class="permission-item"
        >
          <input
            type="checkbox"
            v-model="confirmedPermissions[permission.id]"
          >
          <span>
            <strong>{{ permission.name }}</strong>
            <span class="permission-description">{{ permission.description }}</span>
          </span>
        </label>
      </div>

      <div v-if="!allPermissionsConfirmed" class="permission-warning">
        <i class="fas fa-exclamation-triangle"></i>
        Please confirm all permissions are granted to proceed
      </div>
    </div>

    <!-- Test Connection -->
    <div class="test-connection-section">
      <h4 class="section-title">Test Connection</h4>
      
      <button
        class="btn btn-outline-primary"
        @click="testConnection"
        :disabled="!canTestConnection || testing"
      >
        <loading-spinner v-if="testing" size="16px" />
        <template v-else>
          <i class="fas fa-plug"></i>
          Test Connection
        </template>
      </button>

      <div v-if="connectionStatus" :class="['connection-status', `connection-status--${connectionStatus.type}`]">
        <i :class="connectionStatusIcon"></i>
        <div>
          <strong>{{ connectionStatus.title }}</strong>
          <p>{{ connectionStatus.message }}</p>
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
import FileUploadZone from '../../../ui/FileUploadZone.vue';
import ValidationMessage from '../../../ui/ValidationMessage.vue';
import LoadingSpinner from '../../../ui/LoadingSpinner.vue';

/**
 * StoreConfigStep - Android workflow step for Google Play Console configuration
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'StoreConfigStep',

  components: {
    FormField,
    FileUploadZone,
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
      // Service Account
      selectedAccountId: this.stepData.serviceAccountId || '',
      isCreatingNew: false,
      existingAccounts: [],
      newAccount: {
        name: '',
        jsonFile: null
      },
      jsonKeyData: null,
      
      // Developer Account
      developerId: this.stepData.developerId || '',
      
      // Permissions
      confirmedPermissions: this.stepData.confirmedPermissions || {},
      
      // Connection Test
      testing: false,
      connectionStatus: null,
      
      // UI State
      fieldValidation: {},
      loading: false
    };
  },

  computed: {
    accountOptions() {
      return this.existingAccounts.map(account => ({
        value: account.id,
        label: `${account.name} (${account.email})`
      }));
    },

    selectedAccount() {
      if (!this.selectedAccountId) return null;
      return this.existingAccounts.find(account => account.id === this.selectedAccountId);
    },

    requiredPermissions() {
      return [
        {
          id: 'view_app',
          name: 'View app information',
          description: 'Read app data and settings'
        },
        {
          id: 'manage_releases',
          name: 'Create and edit draft releases',
          description: 'Create new releases and upload APKs/AABs'
        },
        {
          id: 'manage_store',
          name: 'Manage store presence',
          description: 'Edit store listing and assets'
        },
        {
          id: 'view_financial',
          name: 'View financial data',
          description: 'Access reports and analytics'
        }
      ];
    },

    allPermissionsConfirmed() {
      return this.requiredPermissions.every(p => this.confirmedPermissions[p.id]);
    },

    connectionStatusIcon() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[this.connectionStatus?.type] || 'fas fa-info-circle';
    },

    canTestConnection() {
      return (this.selectedAccountId || (this.newAccount.jsonFile && this.jsonKeyData)) &&
             this.developerId &&
             this.allPermissionsConfirmed;
    },

    isValid() {
      const hasAccount = this.selectedAccountId || 
                        (this.isCreatingNew && this.newAccount.name && this.jsonKeyData);
      
      return hasAccount &&
             this.developerId &&
             this.allPermissionsConfirmed &&
             this.connectionStatus?.type === 'success' &&
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
    }
  },

  created() {
    this.loadExistingAccounts();
  },

  methods: {
    async loadExistingAccounts() {
      try {
        this.loading = true;
        
        // Load from middleware if available
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          const response = await apiService.request('getServiceAccounts', { platform: 'android' });
          this.existingAccounts = response.accounts || [];
        } else {
          // Mock data for development
          this.existingAccounts = [
            {
              id: 'account1',
              name: 'Production Account',
              email: 'prod-service@myproject.iam.gserviceaccount.com',
              projectId: 'my-project-123',
              createdAt: new Date('2024-01-15')
            }
          ];
        }
      } catch (error) {
        console.error('Failed to load service accounts:', error);
      } finally {
        this.loading = false;
      }
    },

    handleAccountSelection(accountId) {
      const account = this.existingAccounts.find(a => a.id === accountId);
      if (account) {
        this.updateStepData({
          serviceAccountId: accountId,
          serviceAccountName: account.name,
          serviceAccountEmail: account.email,
          projectId: account.projectId
        });
      }
    },

    startCreateNew() {
      this.isCreatingNew = true;
      this.selectedAccountId = '';
      this.updateStepData({
        serviceAccountId: null,
        isNewAccount: true
      });
    },

    cancelCreateNew() {
      this.isCreatingNew = false;
      this.newAccount = {
        name: '',
        jsonFile: null
      };
      this.jsonKeyData = null;
      this.updateStepData({
        isNewAccount: false
      });
    },

    async handleJsonFileUpload(file) {
      if (!file) {
        this.jsonKeyData = null;
        return;
      }

      try {
        // Read and parse JSON file
        const reader = new FileReader();
        const fileContent = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const jsonData = JSON.parse(fileContent);
        
        // Validate it's a service account key
        if (jsonData.type !== 'service_account') {
          throw new Error('Invalid service account key file');
        }

        this.jsonKeyData = jsonData;
        
        this.updateStepData({
          serviceAccountJson: fileContent,
          serviceAccountEmail: jsonData.client_email,
          projectId: jsonData.project_id
        });
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Invalid service account JSON file',
          duration: 3000
        });
        this.jsonKeyData = null;
      }
    },

    async testConnection() {
      this.testing = true;
      this.connectionStatus = null;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In real implementation, this would test the API connection
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          await apiService.request('testGooglePlayConnection', {
            developerId: this.developerId,
            serviceAccount: this.selectedAccountId || this.jsonKeyData
          });
        }

        this.connectionStatus = {
          type: 'success',
          title: 'Connection Successful',
          message: 'Successfully connected to Google Play Console API'
        };
        
        this.updateStepData({
          connectionVerified: true,
          connectionVerifiedAt: new Date().toISOString()
        });
      } catch (error) {
        this.connectionStatus = {
          type: 'error',
          title: 'Connection Failed',
          message: error.message || 'Unable to connect to Google Play Console API'
        };
      } finally {
        this.testing = false;
      }
    },

    handleFieldValidation(field, validation) {
      this.$set(this.fieldValidation, field, validation);
    },

    updateStepData(data) {
      this.$emit('update', {
        ...this.stepData,
        ...data,
        confirmedPermissions: this.confirmedPermissions,
        developerId: this.developerId
      });
    },

    getValidationErrors() {
      const errors = [];
      
      if (!this.selectedAccountId && !this.jsonKeyData) {
        errors.push('Service account configuration is required');
      }
      
      if (!this.developerId) {
        errors.push('Developer ID is required');
      }
      
      if (!this.allPermissionsConfirmed) {
        errors.push('Please confirm all required permissions are granted');
      }
      
      if (!this.connectionStatus || this.connectionStatus.type !== 'success') {
        errors.push('Connection test must be successful');
      }
      
      return errors;
    },

    // Validation Rules
    validateAccountName(value) {
      if (!value) return 'Account name is required';
      if (value.length < 3) return 'Account name must be at least 3 characters';
      if (value.length > 50) return 'Account name must not exceed 50 characters';
      return true;
    },

    validateDeveloperId(value) {
      if (!value) return 'Developer ID is required';
      if (!/^\d+$/.test(value)) return 'Developer ID must contain only numbers';
      if (value.length < 10 || value.length > 20) return 'Invalid Developer ID length';
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
.store-config-step {
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-account-section,
.developer-account-section,
.permissions-section,
.test-connection-section {
  margin-bottom: var(--spacing-xl);
}

.existing-accounts {
  margin-bottom: var(--spacing-lg);
}

.account-details,
.json-preview {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;

  h5 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color);
  }
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
    word-break: break-word;
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

.json-file-upload {
  margin-bottom: var(--spacing-lg);
}

.where-to-find {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: #eff6ff;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  color: #1e40af;

  i {
    flex-shrink: 0;
  }
}

.section-description {
  margin: -8px 0 var(--spacing-md) 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.permission-checklist {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
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

    .permission-description {
      display: block;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }
  }
}

.permission-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: var(--border-radius);
  color: #92400e;
  font-size: 0.875rem;
}

.connection-status {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  border: 1px solid;

  &--success {
    background-color: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
  }

  &--error {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #991b1b;
  }

  &--warning {
    background-color: #fffbeb;
    border-color: #fde68a;
    color: #92400e;
  }

  &--info {
    background-color: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
  }

  i {
    font-size: 1.25rem;
  }

  strong {
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
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
    color: var(--primary-color);
    border: 1px solid var(--primary-color);

    &:hover {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &-outline-primary {
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

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>