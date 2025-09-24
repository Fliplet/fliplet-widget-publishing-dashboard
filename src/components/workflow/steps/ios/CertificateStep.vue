<template>
  <div class="certificate-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your app's signing certificate and provisioning profile. These are required
        to build and distribute your iOS app.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developer.apple.com/support/certificates/" target="_blank">
          Learn about code signing
        </a>
      </div>
    </div>

    <!-- Certificate Type Selection -->
    <div class="certificate-type">
      <h4 class="section-title">Certificate Type</h4>
      <div class="type-options">
        <label class="radio-option">
          <input 
            type="radio" 
            v-model="certificateType" 
            value="development"
            @change="handleTypeChange"
          >
          <span class="option-content">
            <span class="option-title">Development</span>
            <span class="option-description">For testing on devices</span>
          </span>
        </label>
        <label class="radio-option">
          <input 
            type="radio" 
            v-model="certificateType" 
            value="distribution"
            @change="handleTypeChange"
          >
          <span class="option-content">
            <span class="option-title">Distribution</span>
            <span class="option-description">For App Store submission</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Certificate Selection/Upload -->
    <div class="certificate-section">
      <h4 class="section-title">Signing Certificate</h4>
      
      <!-- Existing Certificates -->
      <div v-if="availableCertificates.length > 0" class="existing-certificates">
        <form-field
          v-model="selectedCertificateId"
          type="select"
          label="Use Existing Certificate"
          placeholder="Select a certificate"
          :options="certificateOptions"
          @input="handleCertificateSelection"
        />

        <div v-if="selectedCertificate" class="certificate-details">
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">{{ selectedCertificate.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Type:</span>
            <span class="detail-value">{{ selectedCertificate.type }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Expires:</span>
            <span class="detail-value" :class="{ 'text-warning': isExpiringSoon(selectedCertificate.expiryDate) }">
              {{ formatDate(selectedCertificate.expiryDate) }}
              <span v-if="isExpiringSoon(selectedCertificate.expiryDate)" class="expiry-warning">
                <i class="fas fa-exclamation-triangle"></i> Expiring soon
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Serial Number:</span>
            <span class="detail-value mono">{{ selectedCertificate.serialNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Upload New Certificate -->
      <div v-if="!selectedCertificateId || uploadingNew" class="upload-certificate">
        <div v-if="availableCertificates.length > 0" class="divider">
          <span>OR</span>
        </div>

        <h5 class="subsection-title">Upload Certificate</h5>
        
        <file-upload-zone
          v-model="certificateFile"
          accept=".p12,.pfx"
          :max-size="5242880"
          help-text="Upload your .p12 or .pfx certificate file (max 5MB)"
          @input="handleCertificateUpload"
        />

        <form-field
          v-if="certificateFile"
          v-model="certificatePassword"
          type="password"
          label="Certificate Password"
          placeholder="Enter certificate password"
          :required="true"
          help-text="Password used when exporting the certificate"
          @validation="handleFieldValidation('certificatePassword', $event)"
        />
      </div>
    </div>

    <!-- Provisioning Profile -->
    <div class="provisioning-section">
      <h4 class="section-title">Provisioning Profile</h4>
      
      <!-- Auto-manage option -->
      <div class="auto-manage-option">
        <label class="checkbox-option">
          <input 
            type="checkbox" 
            v-model="autoManageProvisioning"
            @change="handleAutoManageChange"
          >
          <span>
            <strong>Automatically manage provisioning</strong>
            <span class="option-hint">Recommended - Let Fliplet handle provisioning profile creation</span>
          </span>
        </label>
      </div>

      <!-- Manual Profile Upload -->
      <div v-if="!autoManageProvisioning" class="manual-provisioning">
        <!-- Existing Profiles -->
        <div v-if="availableProfiles.length > 0" class="existing-profiles">
          <form-field
            v-model="selectedProfileId"
            type="select"
            label="Use Existing Profile"
            placeholder="Select a provisioning profile"
            :options="profileOptions"
            @input="handleProfileSelection"
          />

          <div v-if="selectedProfile" class="profile-details">
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedProfile.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedProfile.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">App ID:</span>
              <span class="detail-value mono">{{ selectedProfile.appId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Expires:</span>
              <span class="detail-value" :class="{ 'text-warning': isExpiringSoon(selectedProfile.expiryDate) }">
                {{ formatDate(selectedProfile.expiryDate) }}
              </span>
            </div>
            <div v-if="selectedProfile.devices" class="detail-item">
              <span class="detail-label">Devices:</span>
              <span class="detail-value">{{ selectedProfile.devices.length }} device(s)</span>
            </div>
          </div>
        </div>

        <!-- Upload New Profile -->
        <div v-if="!selectedProfileId || uploadingNewProfile" class="upload-profile">
          <div v-if="availableProfiles.length > 0" class="divider">
            <span>OR</span>
          </div>

          <h5 class="subsection-title">Upload Provisioning Profile</h5>
          
          <file-upload-zone
            v-model="profileFile"
            accept=".mobileprovision"
            :max-size="1048576"
            help-text="Upload your .mobileprovision file (max 1MB)"
            @input="handleProfileUpload"
          />
        </div>
      </div>
    </div>

    <!-- Certificate Validation Status -->
    <div v-if="validationStatus" class="validation-status">
      <div :class="['status-card', `status-card--${validationStatus.type}`]">
        <i :class="validationStatusIcon"></i>
        <div class="status-content">
          <h5>{{ validationStatus.title }}</h5>
          <p>{{ validationStatus.message }}</p>
          <ul v-if="validationStatus.issues" class="issue-list">
            <li v-for="(issue, index) in validationStatus.issues" :key="index">
              {{ issue }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h4 class="section-title">Quick Actions</h4>
      <div class="action-buttons">
        <button 
          class="btn btn-outline-primary"
          @click="downloadCertificateGuide"
        >
          <i class="fas fa-download"></i>
          Certificate Guide
        </button>
        <button 
          class="btn btn-outline-primary"
          @click="validateCertificates"
          :disabled="validating"
        >
          <i class="fas fa-check-circle"></i>
          Validate Setup
        </button>
        <button 
          class="btn btn-outline-primary"
          @click="openAppleDeveloper"
        >
          <i class="fas fa-external-link-alt"></i>
          Apple Developer
        </button>
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

/**
 * CertificateStep - iOS workflow step for configuring signing certificates and provisioning profiles
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'CertificateStep',

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
      // Certificate settings
      certificateType: this.stepData.certificateType || 'distribution',
      selectedCertificateId: this.stepData.certificateId || '',
      certificateFile: null,
      certificatePassword: '',
      uploadingNew: false,

      // Provisioning settings
      autoManageProvisioning: this.stepData.autoManageProvisioning !== false,
      selectedProfileId: this.stepData.profileId || '',
      profileFile: null,
      uploadingNewProfile: false,

      // Data
      availableCertificates: [],
      availableProfiles: [],
      validationStatus: null,
      
      // UI state
      fieldValidation: {},
      validating: false,
      loading: false
    };
  },

  computed: {
    certificateOptions() {
      return this.availableCertificates
        .filter(cert => cert.type === this.certificateType)
        .map(cert => ({
          value: cert.id,
          label: `${cert.name} (expires ${this.formatDate(cert.expiryDate)})`
        }));
    },

    profileOptions() {
      return this.availableProfiles.map(profile => ({
        value: profile.id,
        label: `${profile.name} (${profile.type})`
      }));
    },

    selectedCertificate() {
      return this.availableCertificates.find(cert => cert.id === this.selectedCertificateId);
    },

    selectedProfile() {
      return this.availableProfiles.find(profile => profile.id === this.selectedProfileId);
    },

    validationStatusIcon() {
      const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
      };
      return icons[this.validationStatus?.type] || 'fas fa-info-circle';
    },

    isValid() {
      const hasCertificate = this.selectedCertificateId || 
                            (this.certificateFile && this.certificatePassword);
      
      const hasProvisioning = this.autoManageProvisioning || 
                             this.selectedProfileId || 
                             this.profileFile;

      return hasCertificate && hasProvisioning;
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
    this.loadCertificatesAndProfiles();
  },

  methods: {
    async loadCertificatesAndProfiles() {
      try {
        this.loading = true;
        
        if (window.PublishingMiddleware && window.PublishingMiddleware.isInitialized) {
          const apiService = window.PublishingMiddleware.getComponent('apiService');
          
          // Load certificates
          const certResponse = await apiService.request('getCertificates', { 
            platform: 'ios',
            type: this.certificateType 
          });
          this.availableCertificates = certResponse.certificates || [];
          
          // Load provisioning profiles
          const profileResponse = await apiService.request('getProvisioningProfiles', { 
            platform: 'ios' 
          });
          this.availableProfiles = profileResponse.profiles || [];
        } else {
          // Mock data for development
          this.availableCertificates = [
            {
              id: 'cert1',
              name: 'iOS Distribution: My Company',
              type: 'distribution',
              expiryDate: new Date('2025-03-15'),
              serialNumber: 'ABCD1234EFGH'
            },
            {
              id: 'cert2',
              name: 'iOS Development: John Doe',
              type: 'development',
              expiryDate: new Date('2024-12-31'),
              serialNumber: 'WXYZ5678IJKL'
            }
          ];
          
          this.availableProfiles = [
            {
              id: 'profile1',
              name: 'MyApp App Store',
              type: 'App Store',
              appId: 'com.company.myapp',
              expiryDate: new Date('2025-03-15'),
              devices: []
            },
            {
              id: 'profile2',
              name: 'MyApp Development',
              type: 'Development',
              appId: 'com.company.myapp',
              expiryDate: new Date('2024-12-31'),
              devices: ['Device1', 'Device2']
            }
          ];
        }
      } catch (error) {
        console.error('Failed to load certificates and profiles:', error);
        this.$root.$emit('show-notification', {
          type: 'error',
          message: 'Failed to load certificates and profiles'
        });
      } finally {
        this.loading = false;
      }
    },

    handleTypeChange(event) {
      this.selectedCertificateId = '';
      this.selectedProfileId = '';
      this.updateStepData({ certificateType: this.certificateType });
    },

    handleCertificateSelection(certId) {
      const cert = this.availableCertificates.find(c => c.id === certId);
      if (cert) {
        this.updateStepData({
          certificateId: certId,
          certificateDetails: cert
        });
      }
    },

    handleCertificateUpload(file) {
      if (file) {
        this.uploadingNew = true;
        this.selectedCertificateId = '';
        this.updateStepData({
          certificateFile: file.name,
          certificateId: null
        });
      }
    },

    handleAutoManageChange(event) {
      this.updateStepData({ 
        autoManageProvisioning: this.autoManageProvisioning 
      });
      
      if (this.autoManageProvisioning) {
        this.selectedProfileId = '';
        this.profileFile = null;
      }
    },

    handleProfileSelection(profileId) {
      const profile = this.availableProfiles.find(p => p.id === profileId);
      if (profile) {
        this.updateStepData({
          profileId: profileId,
          profileDetails: profile
        });
      }
    },

    handleProfileUpload(file) {
      if (file) {
        this.uploadingNewProfile = true;
        this.selectedProfileId = '';
        this.updateStepData({
          profileFile: file.name,
          profileId: null
        });
      }
    },

    handleFieldValidation(field, validation) {
      this.$set(this.fieldValidation, field, validation);
    },

    async validateCertificates() {
      this.validating = true;
      this.validationStatus = null;
      
      try {
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const issues = [];
        
        // Check certificate expiry
        if (this.selectedCertificate && this.isExpiringSoon(this.selectedCertificate.expiryDate)) {
          issues.push('Certificate is expiring soon');
        }
        
        // Check profile expiry
        if (this.selectedProfile && this.isExpiringSoon(this.selectedProfile.expiryDate)) {
          issues.push('Provisioning profile is expiring soon');
        }
        
        // Check profile matches certificate
        if (this.selectedCertificate && this.selectedProfile) {
          if (this.selectedCertificate.type !== this.selectedProfile.type.toLowerCase()) {
            issues.push('Certificate type does not match provisioning profile type');
          }
        }
        
        if (issues.length === 0) {
          this.validationStatus = {
            type: 'success',
            title: 'Validation Successful',
            message: 'Your certificates and provisioning profiles are configured correctly.'
          };
        } else {
          this.validationStatus = {
            type: 'warning',
            title: 'Validation Complete with Warnings',
            message: 'Your setup is valid but has some issues:',
            issues: issues
          };
        }
      } catch (error) {
        this.validationStatus = {
          type: 'error',
          title: 'Validation Failed',
          message: 'Unable to validate certificates. Please try again.'
        };
      } finally {
        this.validating = false;
      }
    },

    downloadCertificateGuide() {
      // In real implementation, this would download a PDF guide
      window.open('https://developer.apple.com/support/certificates/', '_blank');
    },

    openAppleDeveloper() {
      window.open('https://developer.apple.com/account/', '_blank');
    },

    updateStepData(data) {
      this.$emit('update', {
        ...this.stepData,
        ...data
      });
    },

    getValidationErrors() {
      const errors = [];
      
      if (!this.selectedCertificateId && !this.certificateFile) {
        errors.push('Please select or upload a signing certificate');
      }
      
      if (this.certificateFile && !this.certificatePassword) {
        errors.push('Certificate password is required');
      }
      
      if (!this.autoManageProvisioning && !this.selectedProfileId && !this.profileFile) {
        errors.push('Please select or upload a provisioning profile');
      }
      
      return errors;
    },

    isExpiringSoon(date) {
      if (!date) return false;
      const expiryDate = new Date(date);
      const now = new Date();
      const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry < 30;
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>

<style lang="scss" scoped>
.certificate-step {
  max-width: 700px;
}

// ... rest of styles similar to previous components ...

.certificate-type {
  margin-bottom: var(--spacing-xl);

  .type-options {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
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
    border-color: var(--primary-color);
  }

  input[type="radio"] {
    margin-right: var(--spacing-sm);
    margin-top: 2px;
  }

  input[type="radio"]:checked + .option-content {
    color: var(--primary-color);
  }

  &:has(input:checked) {
    border-color: var(--primary-color);
    background-color: rgba(0, 171, 209, 0.05);
  }

  .option-content {
    display: flex;
    flex-direction: column;
  }

  .option-title {
    font-weight: 500;
    margin-bottom: 2px;
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }
}

.certificate-details,
.profile-details {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.mono {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.text-warning {
  color: var(--warning-color);
}

.expiry-warning {
  margin-left: var(--spacing-xs);
  font-size: 0.875rem;
}

.auto-manage-option {
  margin-bottom: var(--spacing-lg);

  .checkbox-option {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: var(--border-radius);
    cursor: pointer;

    .option-hint {
      display: block;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-top: 2px;
    }
  }
}

.validation-status {
  margin-top: var(--spacing-xl);

  .status-card {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    border: 1px solid;

    &--success {
      background-color: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }

    &--warning {
      background-color: #fffbeb;
      border-color: #fde68a;
      color: #92400e;
    }

    &--error {
      background-color: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }

    &--info {
      background-color: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
    }

    i {
      font-size: 1.5rem;
    }

    .status-content {
      flex: 1;

      h5 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      p {
        margin: 0 0 var(--spacing-sm) 0;
      }

      .issue-list {
        margin: 0;
        padding-left: var(--spacing-lg);
        font-size: 0.875rem;
      }
    }
  }
}

.quick-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);

  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
}

.btn-outline-primary {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);

  &:hover {
    background-color: var(--primary-color);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.divider {
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

.subsection-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-color);
}
</style>