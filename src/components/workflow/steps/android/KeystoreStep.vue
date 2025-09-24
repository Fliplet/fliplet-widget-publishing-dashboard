<template>
  <div class="keystore-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your app signing key. Android apps must be signed with a keystore
        to be published on Google Play.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developer.android.com/studio/publish/app-signing" target="_blank">
          Learn about app signing
        </a>
      </div>
    </div>

    <!-- Signing Method Selection -->
    <div class="signing-method-section">
      <h4 class="section-title">Signing Method</h4>
      
      <div class="method-options">
        <label class="radio-option">
          <input 
            type="radio" 
            v-model="signingMethod" 
            value="google-managed"
            @change="handleMethodChange"
          >
          <span class="option-content">
            <span class="option-title">
              <i class="fas fa-shield-alt"></i>
              Google Play App Signing
            </span>
            <span class="option-description">
              Recommended - Let Google manage your app signing key
            </span>
          </span>
        </label>
        
        <label class="radio-option">
          <input 
            type="radio" 
            v-model="signingMethod" 
            value="self-managed"
            @change="handleMethodChange"
          >
          <span class="option-content">
            <span class="option-title">
              <i class="fas fa-key"></i>
              Self-Managed Signing
            </span>
            <span class="option-description">
              Upload and manage your own keystore
            </span>
          </span>
        </label>
      </div>
    </div>

    <!-- Google Play App Signing -->
    <div v-if="signingMethod === 'google-managed'" class="google-signing-section">
      <h4 class="section-title">Google Play App Signing</h4>
      
      <div class="info-box">
        <i class="fas fa-info-circle"></i>
        <div>
          <p>With Google Play App Signing, Google manages and protects your app's signing key.</p>
          <ul>
            <li>More secure - key is protected by Google's infrastructure</li>
            <li>Key upgrade support for new Android features</li>
            <li>Lost key recovery options</li>
          </ul>
        </div>
      </div>

      <div class="upload-signing-section">
        <h5 class="subsection-title">Upload Signing Key</h5>
        <p class="subsection-description">
          You'll sign your app bundle with an upload key. Google will then sign it with the app signing key.
        </p>

        <!-- Existing Upload Keys -->
        <div v-if="existingUploadKeys.length > 0" class="existing-keys">
          <form-field
            v-model="selectedUploadKeyId"
            type="select"
            label="Use Existing Upload Key"
            placeholder="Select an upload key"
            :options="uploadKeyOptions"
            @input="handleUploadKeySelection"
          />
        </div>

        <!-- Or Create New -->
        <div v-if="existingUploadKeys.length > 0" class="divider-small">
          <span>or</span>
        </div>

        <button 
          class="btn btn-outline"
          @click="generateUploadKey"
          :disabled="generatingKey"
        >
          <loading-spinner v-if="generatingKey" size="16px" />
          <template v-else>
            <i class="fas fa-plus"></i>
            Generate New Upload Key
          </template>
        </button>

        <!-- Generated Key Info -->
        <div v-if="generatedUploadKey" class="generated-key-info">
          <div class="success-message">
            <i class="fas fa-check-circle"></i>
            Upload key generated successfully!
          </div>
          <div class="key-details">
            <div class="detail-item">
              <span class="detail-label">Alias:</span>
              <span class="detail-value">{{ generatedUploadKey.alias }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Validity:</span>
              <span class="detail-value">{{ generatedUploadKey.validity }} years</span>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" @click="downloadUploadKey">
            <i class="fas fa-download"></i>
            Download Keystore
          </button>
        </div>
      </div>
    </div>

    <!-- Self-Managed Signing -->
    <div v-else-if="signingMethod === 'self-managed'" class="self-signing-section">
      <h4 class="section-title">Upload Keystore</h4>
      
      <!-- Existing Keystores -->
      <div v-if="existingKeystores.length > 0" class="existing-keystores">
        <form-field
          v-model="selectedKeystoreId"
          type="select"
          label="Use Existing Keystore"
          placeholder="Select a keystore"
          :options="keystoreOptions"
          @input="handleKeystoreSelection"
        />
        
        <div v-if="selectedKeystore" class="keystore-details">
          <div class="detail-item">
            <span class="detail-label">Alias:</span>
            <span class="detail-value">{{ selectedKeystore.alias }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created:</span>
            <span class="detail-value">{{ formatDate(selectedKeystore.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Expires:</span>
            <span class="detail-value" :class="{ 'text-warning': isExpiringSoon(selectedKeystore.expiryDate) }">
              {{ formatDate(selectedKeystore.expiryDate) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Upload New Keystore -->
      <div v-if="!selectedKeystoreId || uploadingNew" class="upload-keystore">
        <div v-if="existingKeystores.length > 0" class="divider">
          <span>OR</span>
        </div>

        <h5 class="subsection-title">Upload New Keystore</h5>
        
        <file-upload-zone
          v-model="keystoreFile"
          accept=".keystore,.jks"
          :max-size="5242880"
          help-text="Upload your .keystore or .jks file (max 5MB)"
          @input="handleKeystoreUpload"
        />

        <div v-if="keystoreFile" class="keystore-credentials">
          <form-field
            v-model="keystorePassword"
            type="password"
            label="Keystore Password"
            placeholder="Enter keystore password"
            :required="true"
            help-text="Password for the keystore file"
            @validation="handleFieldValidation('keystorePassword', $event)"
          />

          <form-field
            v-model="keyAlias"
            type="text"
            label="Key Alias"
            placeholder="Enter key alias"
            :required="true"
            help-text="Alias of the key within the keystore"
            @validation="handleFieldValidation('keyAlias', $event)"
          />

          <form-field
            v-model="keyPassword"
            type="password"
            label="Key Password"
            placeholder="Enter key password"
            :required="true"
            help-text="Password for the key (often same as keystore password)"
            @validation="handleFieldValidation('keyPassword', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Keystore Validation -->
    <div v-if="keystoreFile || selectedKeystoreId" class="validation-section">
      <h4 class="section-title">Validate Keystore</h4>
      
      <button
        class="btn btn-outline-primary"
        @click="validateKeystore"
        :disabled="!canValidateKeystore || validating"
      >
        <loading-spinner v-if="validating" size="16px" />
        <template v-else>
          <i class="fas fa-check-circle"></i>
          Validate Keystore
        </template>
      </button>

      <div v-if="validationResult" :class="['validation-result', `validation-result--${validationResult.type}`]">
        <i :class="validationResultIcon"></i>
        <div>
          <strong>{{ validationResult.title }}</strong>
          <p>{{ validationResult.message }}</p>
          <div v-if="validationResult.details" class="validation-details">
            <div v-for="(value, key) in validationResult.details" :key="key" class="detail-item">
              <span class="detail-label">{{ formatLabel(key) }}:</span>
              <span class="detail-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Notice -->
    <div class="security-notice">
      <i class="fas fa-lock"></i>
      <div>
        <strong>Security Notice</strong>
        <p>Your keystore credentials are encrypted and stored securely. Never share your keystore file or passwords.</p>
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
 * KeystoreStep - Android workflow step for app signing configuration
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'KeystoreStep',

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
      // Signing Method
      signingMethod: this.stepData.signingMethod || 'google-managed',
      
      // Google Play App Signing
      selectedUploadKeyId: this.stepData.uploadKeyId || '',
      existingUploadKeys: [],
      generatingKey: false,
      generatedUploadKey: null,
      
      // Self-Managed Signing
      selectedKeystoreId: this.stepData.keystoreId || '',
      existingKeystores: [],
      uploadingNew: false,
      keystoreFile: null,
      keystorePassword: '',
      keyAlias: '',
      keyPassword: '',
      
      // Validation
      validating: false,
      validationResult: null,
      
      // UI State
      fieldValidation: {},
      loading: false
    };
  },

  computed: {
    uploadKeyOptions() {
      return this.existingUploadKeys.map(key => ({
        value: key.id,
        label: `${key.alias} (created ${this.formatDate(key.createdAt)})`
      }));
    },

    keystoreOptions() {
      return this.existingKeystores.map(ks => ({
        value: ks.id,
        label: `${ks.alias} (${ks.name})`
      }));
    },

    selectedKeystore() {
      return this.existingKeystores.find(ks => ks.id === this.selectedKeystoreId);
    },

    validationResultIcon() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle'
      };
      return icons[this.validationResult?.type] || 'fas fa-info-circle';
    },

    canValidateKeystore() {
      if (this.signingMethod === 'google-managed') {
        return false; // No validation needed for Google-managed
      }
      
      return (this.selectedKeystoreId || 
              (this.keystoreFile && this.keystorePassword && this.keyAlias && this.keyPassword));
    },

    isValid() {
      if (this.signingMethod === 'google-managed') {
        return !!(this.selectedUploadKeyId || this.generatedUploadKey);
      } else {
        const hasKeystore = this.selectedKeystoreId || 
                           (this.keystoreFile && this.keystorePassword && this.keyAlias && this.keyPassword);
        
        return hasKeystore && 
               this.validationResult?.type === 'success' &&
               Object.values(this.fieldValidation).every(v => v.isValid !== false);
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
        
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          
          // Load upload keys
          const uploadKeysResponse = await apiService.request('getUploadKeys', { platform: 'android' });
          this.existingUploadKeys = uploadKeysResponse.keys || [];
          
          // Load keystores
          const keystoresResponse = await apiService.request('getKeystores', { platform: 'android' });
          this.existingKeystores = keystoresResponse.keystores || [];
        } else {
          // Mock data
          this.existingUploadKeys = [
            {
              id: 'key1',
              alias: 'upload-key',
              createdAt: new Date('2024-01-15'),
              validity: 25
            }
          ];
          
          this.existingKeystores = [
            {
              id: 'ks1',
              name: 'Production Keystore',
              alias: 'prod-key',
              createdAt: new Date('2023-06-01'),
              expiryDate: new Date('2048-06-01')
            }
          ];
        }
      } catch (error) {
        console.error('Failed to load keys:', error);
      } finally {
        this.loading = false;
      }
    },

    handleMethodChange() {
      // Reset validation when changing methods
      this.validationResult = null;
      this.updateStepData({ signingMethod: this.signingMethod });
    },

    handleUploadKeySelection(keyId) {
      const key = this.existingUploadKeys.find(k => k.id === keyId);
      if (key) {
        this.updateStepData({
          uploadKeyId: keyId,
          uploadKeyDetails: key
        });
      }
    },

    async generateUploadKey() {
      try {
        this.generatingKey = true;
        
        // Simulate key generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.generatedUploadKey = {
          alias: 'upload-key-' + Date.now(),
          validity: 25,
          createdAt: new Date()
        };
        
        this.updateStepData({
          uploadKeyGenerated: true,
          uploadKeyDetails: this.generatedUploadKey
        });
        
        this.$root.$emit('show-notification', {
          type: 'success',
          message: 'Upload key generated successfully',
          duration: 3000
        });
      } catch (error) {
        console.error('Failed to generate key:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Failed to generate upload key',
          duration: 3000
        });
      } finally {
        this.generatingKey = false;
      }
    },

    downloadUploadKey() {
      // In real implementation, this would download the generated keystore
      console.log('Downloading upload key...');
    },

    handleKeystoreSelection(keystoreId) {
      const keystore = this.existingKeystores.find(ks => ks.id === keystoreId);
      if (keystore) {
        this.updateStepData({
          keystoreId: keystoreId,
          keystoreDetails: keystore
        });
      }
    },

    handleKeystoreUpload(file) {
      if (file) {
        this.uploadingNew = true;
        this.selectedKeystoreId = '';
        this.updateStepData({
          keystoreFile: file.name,
          keystoreId: null
        });
      }
    },

    async validateKeystore() {
      this.validating = true;
      this.validationResult = null;

      try {
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In real implementation, this would validate the keystore
        if (this.keystorePassword && this.keyAlias) {
          this.validationResult = {
            type: 'success',
            title: 'Keystore Valid',
            message: 'The keystore and credentials are valid',
            details: {
              keyAlias: this.keyAlias,
              algorithm: 'RSA',
              keySize: '2048 bits',
              validity: '25 years'
            }
          };
          
          this.updateStepData({
            keystoreValidated: true,
            keystorePassword: this.keystorePassword, // In real app, encrypt this
            keyAlias: this.keyAlias,
            keyPassword: this.keyPassword
          });
        } else {
          throw new Error('Invalid keystore or credentials');
        }
      } catch (error) {
        this.validationResult = {
          type: 'error',
          title: 'Validation Failed',
          message: error.message || 'Unable to validate keystore'
        };
      } finally {
        this.validating = false;
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
      
      if (this.signingMethod === 'google-managed') {
        if (!this.selectedUploadKeyId && !this.generatedUploadKey) {
          errors.push('Please select or generate an upload key');
        }
      } else {
        if (!this.selectedKeystoreId && !this.keystoreFile) {
          errors.push('Please select or upload a keystore');
        }
        
        if (this.keystoreFile && (!this.keystorePassword || !this.keyAlias || !this.keyPassword)) {
          errors.push('Please provide all keystore credentials');
        }
        
        if (!this.validationResult || this.validationResult.type !== 'success') {
          errors.push('Keystore validation is required');
        }
      }
      
      return errors;
    },

    isExpiringSoon(date) {
      if (!date) return false;
      const expiryDate = new Date(date);
      const now = new Date();
      const yearsUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24 * 365);
      return yearsUntilExpiry < 2;
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    },

    formatLabel(key) {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }
};
</script>

<style lang="scss" scoped>
.keystore-step {
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

.subsection-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.signing-method-section,
.google-signing-section,
.self-signing-section,
.validation-section {
  margin-bottom: var(--spacing-xl);
}

.method-options {
  display: flex;
  gap: var(--spacing-md);
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.radio-option {
  flex: 1;
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

.info-box {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);

  i {
    font-size: 1.25rem;
    color: #16a34a;
    flex-shrink: 0;
  }

  p {
    margin: 0 0 var(--spacing-sm) 0;
    color: #166534;
  }

  ul {
    margin: 0;
    padding-left: var(--spacing-lg);
    color: #166534;
    font-size: 0.875rem;
  }
}

.keystore-details,
.generated-key-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--success-color);
  font-weight: 500;
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
    min-width: 80px;
  }

  .detail-value {
    color: var(--text-color);
  }
}

.divider,
.divider-small {
  text-align: center;
  margin: var(--spacing-lg) 0;
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

.divider-small {
  margin: var(--spacing-md) 0;
}

.keystore-credentials {
  margin-top: var(--spacing-lg);
  display: grid;
  gap: var(--spacing-md);
}

.validation-result {
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

  i {
    font-size: 1.25rem;
  }

  strong {
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 0.875rem;
  }

  .validation-details {
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.security-notice {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);

  i {
    font-size: 1.25rem;
    color: #2563eb;
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: #1e40af;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    color: #1e40af;
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

  &-primary {
    background-color: var(--android-color);
    color: white;

    &:hover {
      background-color: darken(var(--android-color), 10%);
    }
  }

  &-sm {
    padding: 6px 12px;
    font-size: 0.875rem;
  }
}

.text-warning {
  color: var(--warning-color);
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>