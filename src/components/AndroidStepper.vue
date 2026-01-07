<template>
  <div class="android-stepper-container">
    <!-- Platform Sidebar -->
    <PlatformSidebar :active-platform="activePlatform" @platform-change="changePlatform" />

    <!-- Main Stepper Layout -->
    <div class="stepper-layout">
      <!-- Header Toolbar -->
      <div class="stepper-header">
        <div class="header-info">
          <h1>Android Build</h1>
          <div class="header-meta">
            <span class="build-id">Build #{{ buildId }}</span>
            <span class="version-number">v{{ versionNumber }}</span>
            <span class="status-chip" :class="overallStatus">
              {{ getOverallStatusLabel(overallStatus) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-text" @click="exitBuild">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Exit
          </button>
          <button class="btn-secondary-small" @click="viewDashboard">View Dashboard</button>
          <button 
            v-if="canResume" 
            class="btn-primary-small" 
            @click="resumeBuild"
          >
            Resume Build
          </button>
        </div>
      </div>

      <!-- Stepper Content -->
      <div class="stepper-content">
        <!-- Left: Step List -->
        <div class="stepper-sidebar-wrapper">
          <StepperSidebar 
            :steps="steps" 
            :allow-navigation="false"
            @step-click="handleStepClick"
          />
        </div>

        <!-- Right: Step Detail -->
        <div class="step-detail-wrapper">
          <StepDetailPanel 
            :step="currentStep" 
            @retry-step="retryCurrentStep"
          >
            <template #content>
              <!-- Step 1: Bundle ID -->
              <div v-if="currentStepIndex === 0" class="step-form">
                <div class="form-group">
                  <label for="bundleId">Bundle ID *</label>
                  <p class="field-help">
                    Enter your app's unique identifier (e.g., com.company.appname)
                  </p>
                  <input
                    id="bundleId"
                    v-model="formData.bundleId"
                    type="text"
                    class="form-input"
                    :class="{ error: bundleIdError }"
                    placeholder="com.example.myapp"
                    @input="validateBundleId"
                    @blur="validateBundleId"
                  />
                  <p v-if="bundleIdError" class="error-message">{{ bundleIdError }}</p>
                  <p v-else class="field-hint">
                    Must follow reverse domain name notation (lowercase letters, numbers, dots, underscores)
                  </p>
                </div>
                <button 
                  class="btn-primary" 
                  :disabled="!isBundleIdValid"
                  @click="submitBundleId"
                >
                  Validate & Continue
                </button>
              </div>

              <!-- Step 2: Firebase Push Config -->
              <div v-if="currentStepIndex === 1" class="step-form">
                <div class="push-config-option">
                  <label class="radio-label">
                    <input
                      v-model="pushConfigMethod"
                      type="radio"
                      value="file"
                    />
                    <span>Upload google-services.json file</span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="pushConfigMethod"
                      type="radio"
                      value="manual"
                    />
                    <span>Enter credentials manually</span>
                  </label>
                </div>

                <!-- File Upload Option -->
                <div v-if="pushConfigMethod === 'file'" class="form-group">
                  <label>Firebase Configuration File</label>
                  <div class="file-upload-area" @click="triggerFileUpload">
                    <input
                      ref="firebaseFileInput"
                      type="file"
                      accept=".json"
                      style="display: none"
                      @change="handleFirebaseFileUpload"
                    />
                    <div v-if="!formData.firebaseFile" class="upload-prompt">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 22V10M16 10l-4 4M16 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6 18v8a2 2 0 002 2h16a2 2 0 002-2v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <p><strong>Click to upload</strong> or drag and drop</p>
                      <p class="upload-hint">google-services.json</p>
                    </div>
                    <div v-else class="uploaded-file">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>{{ formData.firebaseFile.name }}</span>
                      <button class="btn-remove" @click.stop="removeFirebaseFile">Remove</button>
                    </div>
                  </div>
                  <a href="#" class="help-link">Where to find your Firebase configuration file?</a>
                </div>

                <!-- Manual Input Option -->
                <div v-if="pushConfigMethod === 'manual'" class="manual-fields">
                  <div class="form-group">
                    <label for="projectId">Project ID *</label>
                    <input
                      id="projectId"
                      v-model="formData.firebase.projectId"
                      type="text"
                      class="form-input"
                      placeholder="my-project-12345"
                    />
                  </div>
                  <div class="form-group">
                    <label for="serverKey">Server Key *</label>
                    <textarea
                      id="serverKey"
                      v-model="formData.firebase.privateKey"
                      class="form-textarea"
                      rows="4"
                      placeholder="-----BEGIN PRIVATE KEY-----&#10;..."
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label for="clientEmail">Client Email *</label>
                    <input
                      id="clientEmail"
                      v-model="formData.firebase.clientEmail"
                      type="email"
                      class="form-input"
                      placeholder="firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com"
                    />
                  </div>
                  <a href="#" class="help-link">Where to find these credentials?</a>
                </div>

                <button 
                  class="btn-primary" 
                  :disabled="!isFirebaseConfigValid"
                  @click="submitFirebaseConfig"
                >
                  Validate & Continue
                </button>
              </div>

              <!-- Step 3: Signing/Certificates -->
              <div v-if="currentStepIndex === 2" class="step-form">
                <div class="signing-option">
                  <label class="radio-label">
                    <input
                      v-model="signingMethod"
                      type="radio"
                      value="auto"
                    />
                    <span>Auto-generate signing certificate (Recommended)</span>
                  </label>
                  <p class="option-description">
                    Fliplet will automatically generate a secure keystore for your app.
                  </p>
                </div>

                <!-- Advanced Settings Toggle -->
                <button class="advanced-toggle" @click="showAdvancedSigning = !showAdvancedSigning">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    :class="{ rotated: showAdvancedSigning }"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Advanced Settings
                </button>

                <transition name="expand">
                  <div v-if="showAdvancedSigning" class="advanced-signing">
                    <div class="signing-option">
                      <label class="radio-label">
                        <input
                          v-model="signingMethod"
                          type="radio"
                          value="upload"
                        />
                        <span>Upload existing keystore</span>
                      </label>
                    </div>

                    <div v-if="signingMethod === 'upload'" class="upload-fields">
                      <div class="form-group">
                        <label>Keystore File (.jks) *</label>
                        <div class="file-upload-area" @click="triggerKeystoreUpload">
                          <input
                            ref="keystoreFileInput"
                            type="file"
                            accept=".jks,.keystore"
                            style="display: none"
                            @change="handleKeystoreUpload"
                          />
                          <div v-if="!formData.keystoreFile" class="upload-prompt">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <p>Click to upload keystore file</p>
                          </div>
                          <div v-else class="uploaded-file">
                            <span>{{ formData.keystoreFile.name }}</span>
                            <button class="btn-remove" @click.stop="removeKeystoreFile">Remove</button>
                          </div>
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group">
                          <label for="keystorePassword">Keystore Password *</label>
                          <input
                            id="keystorePassword"
                            v-model="formData.keystore.password"
                            type="password"
                            class="form-input"
                            placeholder="Enter keystore password"
                          />
                        </div>
                        <div class="form-group">
                          <label for="keyAlias">Key Alias *</label>
                          <input
                            id="keyAlias"
                            v-model="formData.keystore.alias"
                            type="text"
                            class="form-input"
                            placeholder="Enter key alias"
                          />
                        </div>
                      </div>

                      <div class="form-group">
                        <label for="keyPassword">Key Password *</label>
                        <input
                          id="keyPassword"
                          v-model="formData.keystore.keyPassword"
                          type="password"
                          class="form-input"
                          placeholder="Enter key password"
                        />
                      </div>
                    </div>
                  </div>
                </transition>

                <button 
                  class="btn-primary" 
                  @click="submitSigning"
                >
                  Continue
                </button>
              </div>

              <!-- Step 4, 5, 6: Build Progress (uses default slot content from StepDetailPanel) -->
            </template>
          </StepDetailPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlatformSidebar from './PlatformSidebar.vue';
import StepperSidebar from './StepperSidebar.vue';
import StepDetailPanel from './StepDetailPanel.vue';
import * as androidApi from '../services/androidPublishingApi.js';

export default {
  name: 'AndroidStepper',
  components: {
    PlatformSidebar,
    StepperSidebar,
    StepDetailPanel
  },
  props: {
    resumeData: {
      type: Object,
      default: null
    },
    isNewBuild: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activePlatform: 'android',
      appId: null,
      submissionId: null,
      buildId: 'A12345',
      versionNumber: '1.1.0',
      versionCode: '1010',
      overallStatus: 'in-progress', // 'in-progress' | 'failed' | 'success' | 'blocked'
      canResume: false,
      currentStepIndex: 0,
      
      // Form data
      formData: {
        bundleId: '',
        firebaseFile: null,
        firebase: {
          projectId: '',
          privateKey: '',
          clientEmail: ''
        },
        keystoreFile: null,
        keystore: {
          password: '',
          alias: '',
          keyPassword: ''
        }
      },

      // UI state
      bundleIdError: '',
      pushConfigMethod: 'file', // 'file' | 'manual'
      signingMethod: 'auto', // 'auto' | 'upload'
      showAdvancedSigning: false,

      // Steps configuration
      steps: [
        {
          id: 'bundle-id',
          name: 'Validate Bundle ID',
          status: 'in-progress',
          description: 'Enter and validate your Android app bundle identifier'
        },
        {
          id: 'push-config',
          name: 'Configure Push Notifications',
          status: 'pending',
          description: 'Set up Firebase Cloud Messaging for push notifications'
        },
        {
          id: 'signing',
          name: 'Signing / Certificates',
          status: 'pending',
          description: 'Configure app signing with keystore'
        },
        {
          id: 'build',
          name: 'Build Android App',
          status: 'pending',
          description: 'Compile and package your Android application'
        },
        {
          id: 'package',
          name: 'Package & Store Artifact',
          status: 'pending',
          description: 'Create AAB/APK and store build artifacts'
        },
        {
          id: 'complete',
          name: 'Complete',
          status: 'pending',
          description: 'Build complete and ready for submission'
        }
      ],

      // Polling
      buildStatusInterval: null
    };
  },
  async mounted() {
    // Get app ID
    this.appId = this.$root.appId || window.Fliplet?.Env?.get('appId');
    
    if (!this.appId) {
      console.error('App ID not found');
      return;
    }

    // Handle resume or new build
    if (this.resumeData && !this.isNewBuild) {
      await this.loadExistingSubmission(this.resumeData);
    } else {
      await this.initializeNewSubmission();
    }
  },
  beforeUnmount() {
    // Clear polling interval
    if (this.buildStatusInterval) {
      clearInterval(this.buildStatusInterval);
    }
  },
  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex] || this.steps[0];
    },
    isBundleIdValid() {
      return this.formData.bundleId && !this.bundleIdError;
    },
    isFirebaseConfigValid() {
      if (this.pushConfigMethod === 'file') {
        return this.formData.firebaseFile !== null;
      } else {
        return this.formData.firebase.projectId && 
               this.formData.firebase.privateKey && 
               this.formData.firebase.clientEmail;
      }
    }
  },
  methods: {
    changePlatform(platform) {
      this.activePlatform = platform;
      if (platform === 'ios') {
        this.$emit('navigate', 'ios');
      }
    },
    
    getOverallStatusLabel(status) {
      const labels = {
        'in-progress': 'In Progress',
        'failed': 'Failed',
        'success': 'Success',
        'blocked': 'Blocked'
      };
      return labels[status] || status;
    },

    validateBundleId() {
      const bundleIdPattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
      
      if (!this.formData.bundleId) {
        this.bundleIdError = 'Bundle ID is required';
      } else if (!bundleIdPattern.test(this.formData.bundleId)) {
        this.bundleIdError = 'Invalid format. Use lowercase letters, numbers, dots, and underscores (e.g., com.company.appname)';
      } else {
        this.bundleIdError = '';
      }
    },

    async submitBundleId() {
      try {
        this.steps[0].status = 'in-progress';
        
        // Submit store configuration with bundle ID
        await androidApi.submitStoreConfig(this.appId, this.submissionId, {
          bundleId: this.formData.bundleId,
          versionNumber: this.versionNumber,
          versionCode: this.versionCode
        });
        
        // Success - move to next step
        this.steps[0].status = 'completed';
        this.steps[0].timestamp = new Date().toISOString();
        this.steps[1].status = 'in-progress';
        this.currentStepIndex = 1;
      } catch (error) {
        console.error('Failed to submit bundle ID:', error);
        this.steps[0].status = 'failed';
        this.steps[0].error = {
          title: 'Bundle ID Validation Failed',
          message: error.message,
          resolution: 'Please check your bundle ID format and try again.',
          retryable: true
        };
      }
    },

    triggerFileUpload() {
      this.$refs.firebaseFileInput.click();
    },

    handleFirebaseFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.name.endsWith('.json')) {
        this.formData.firebaseFile = file;
      }
    },

    removeFirebaseFile() {
      this.formData.firebaseFile = null;
      if (this.$refs.firebaseFileInput) {
        this.$refs.firebaseFileInput.value = '';
      }
    },

    async submitFirebaseConfig() {
      try {
        this.steps[1].status = 'in-progress';
        
        let firebaseFileObject = null;
        
        // Upload firebase file if using file method
        if (this.pushConfigMethod === 'file' && this.formData.firebaseFile) {
          firebaseFileObject = await androidApi.uploadFile(
            this.appId, 
            this.formData.firebaseFile, 
            'google-services.json'
          );
        }
        
        // Submit push configuration
        await androidApi.submitPushConfig(this.appId, this.submissionId, {
          projectId: this.formData.firebase.projectId,
          privateKey: this.formData.firebase.privateKey,
          clientEmail: this.formData.firebase.clientEmail,
          firebaseFile: firebaseFileObject
        });
        
        // Success - move to next step
        this.steps[1].status = 'completed';
        this.steps[1].timestamp = new Date().toISOString();
        this.steps[2].status = 'in-progress';
        this.currentStepIndex = 2;
      } catch (error) {
        console.error('Failed to submit Firebase config:', error);
        this.steps[1].status = 'failed';
        this.steps[1].error = {
          title: 'Firebase Configuration Failed',
          message: error.message,
          resolution: 'Please verify your Firebase credentials and try again.',
          retryable: true
        };
      }
    },

    triggerKeystoreUpload() {
      this.$refs.keystoreFileInput.click();
    },

    handleKeystoreUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.keystoreFile = file;
      }
    },

    removeKeystoreFile() {
      this.formData.keystoreFile = null;
      if (this.$refs.keystoreFileInput) {
        this.$refs.keystoreFileInput.value = '';
      }
    },

    async submitSigning() {
      try {
        this.steps[2].status = 'in-progress';
        
        // If manual upload, submit keystore
        if (this.signingMethod === 'upload' && this.formData.keystoreFile) {
          // Upload keystore file first
          const keystoreFileObject = await androidApi.uploadFile(
            this.appId,
            this.formData.keystoreFile
          );
          
          // Submit keystore configuration
          await androidApi.uploadKeystore(this.appId, this.submissionId, {
            keyStoreFile: keystoreFileObject,
            keyStorePassword: this.formData.keystore.password,
            keyAlias: this.formData.keystore.alias,
            keyPassword: this.formData.keystore.keyPassword
          });
        }
        // If auto, the backend will generate keystore automatically
        
        // Success - move to next step
        this.steps[2].status = 'completed';
        this.steps[2].timestamp = new Date().toISOString();
        this.steps[3].status = 'in-progress';
        this.currentStepIndex = 3;
        
        // Auto-trigger build
        await this.triggerBuild();
      } catch (error) {
        console.error('Failed to submit signing config:', error);
        this.steps[2].status = 'failed';
        this.steps[2].error = {
          title: 'Signing Configuration Failed',
          message: error.message,
          resolution: 'Please check your keystore file and credentials.',
          retryable: true
        };
      }
    },

    async triggerBuild() {
      try {
        // Trigger the build
        await androidApi.triggerBuild(this.appId, this.submissionId);
        
        // Start polling for build status
        this.pollBuildStatus();
      } catch (error) {
        console.error('Failed to trigger build:', error);
        this.steps[3].status = 'failed';
        this.steps[3].error = {
          title: 'Build Trigger Failed',
          message: error.message,
          resolution: 'Please try triggering the build again.',
          retryable: true
        };
      }
    },

    pollBuildStatus() {
      // Poll every 5 seconds
      this.buildStatusInterval = setInterval(async () => {
        try {
          const submission = await androidApi.getSubmission(this.appId, this.submissionId);
          
          // Update step statuses based on submission status
          this.updateStepsFromSubmission(submission);
          
          // Stop polling if build is complete or failed
          if (submission.status === 'completed' || submission.status === 'failed') {
            clearInterval(this.buildStatusInterval);
            this.buildStatusInterval = null;
          }
        } catch (error) {
          console.error('Failed to poll build status:', error);
        }
      }, 5000);
    },

    updateStepsFromSubmission(submission) {
      // Update overall status
      this.overallStatus = submission.status;
      
      // Update individual step statuses if provided by API
      if (submission.steps && Array.isArray(submission.steps)) {
        submission.steps.forEach((apiStep, index) => {
          if (this.steps[index]) {
            this.steps[index].status = apiStep.status;
            this.steps[index].timestamp = apiStep.timestamp;
            if (apiStep.logs) {
              this.steps[index].logs = apiStep.logs;
            }
            if (apiStep.error) {
              this.steps[index].error = apiStep.error;
            }
          }
        });
      }
      
      // Update current step index to the first non-completed step
      const firstIncompleteIndex = this.steps.findIndex(
        step => step.status !== 'completed'
      );
      if (firstIncompleteIndex >= 0) {
        this.currentStepIndex = firstIncompleteIndex;
      }
    },

    async initializeNewSubmission() {
      try {
        const response = await androidApi.initializePublishing(this.appId);
        this.submissionId = response.submissionId;
        this.buildId = response.buildId || `A${this.submissionId}`;
        this.versionNumber = response.versionNumber || '1.1.0';
        this.versionCode = androidApi.generateVersionCode(this.versionNumber);
      } catch (error) {
        console.error('Failed to initialize submission:', error);
        alert('Failed to initialize publishing. Please try again.');
      }
    },

    async loadExistingSubmission(resumeData) {
      try {
        this.submissionId = resumeData.submissionId || resumeData.id;
        this.buildId = resumeData.buildId || `A${this.submissionId}`;
        this.versionNumber = resumeData.versionNumber || '1.1.0';
        this.versionCode = resumeData.versionCode || androidApi.generateVersionCode(this.versionNumber);
        
        // Update steps from resume data
        this.updateStepsFromSubmission(resumeData);
        
        // Set can resume flag
        this.canResume = true;
      } catch (error) {
        console.error('Failed to load existing submission:', error);
      }
    },

    retryCurrentStep() {
      console.log('Retrying step:', this.currentStep.id);
      // Reset current step status and retry
      this.steps[this.currentStepIndex].status = 'in-progress';
      this.steps[this.currentStepIndex].error = null;
    },

    handleStepClick({ step, index }) {
      // Optional: Allow navigation to completed steps
      console.log('Step clicked:', step, index);
    },

    exitBuild() {
      if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
        this.$emit('navigate', 'android-landing');
      }
    },

    viewDashboard() {
      this.$emit('navigate', 'dashboard');
    },

    resumeBuild() {
      console.log('Resuming build from last successful step');
    }
  }
};
</script>

<style scoped>
.android-stepper-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.stepper-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header */
.stepper-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.build-id,
.version-number {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.status-chip {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-chip.in-progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-chip.failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-chip.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-chip.blocked {
  background-color: #fef3c7;
  color: #92400e;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-text:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary-small {
  background: white;
  color: #5c6ac4;
  border: 2px solid #5c6ac4;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-small:hover {
  background-color: #5c6ac4;
  color: white;
}

.btn-primary-small {
  background-color: #5c6ac4;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary-small:hover {
  background-color: #4c5ab4;
}

/* Stepper Content */
.stepper-content {
  flex: 1;
  display: flex;
  gap: 32px;
  padding: 32px 40px;
}

.stepper-sidebar-wrapper {
  width: 320px;
  flex-shrink: 0;
}

.step-detail-wrapper {
  flex: 1;
  max-width: 800px;
}

/* Form Styles */
.step-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.field-help {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #5c6ac4;
  box-shadow: 0 0 0 3px rgba(92, 106, 196, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-textarea {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  font-family: 'Monaco', 'Courier New', monospace;
  resize: vertical;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #5c6ac4;
  box-shadow: 0 0 0 3px rgba(92, 106, 196, 0.1);
}

.error-message {
  font-size: 13px;
  color: #ef4444;
  margin: 0;
}

.field-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Radio Options */
.push-config-option,
.signing-option {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label:hover {
  border-color: #5c6ac4;
  background-color: #f9fafb;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-label input[type="radio"]:checked + span {
  font-weight: 600;
  color: #5c6ac4;
}

.radio-label span {
  font-size: 14px;
  color: #374151;
}

.option-description {
  font-size: 13px;
  color: #6b7280;
  margin: -8px 0 0 44px;
}

/* File Upload */
.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-area:hover {
  border-color: #5c6ac4;
  background-color: #f9fafb;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.upload-prompt svg {
  color: #9ca3af;
}

.upload-prompt p {
  margin: 0;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #10b981;
}

.uploaded-file span {
  font-size: 14px;
  font-weight: 500;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-remove:hover {
  background-color: #fee2e2;
}

.help-link {
  font-size: 13px;
  color: #5c6ac4;
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
}

/* Advanced Settings */
.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #e5e7eb;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.advanced-toggle:hover {
  border-color: #5c6ac4;
  color: #5c6ac4;
}

.advanced-toggle svg {
  transition: transform 0.2s;
}

.advanced-toggle svg.rotated {
  transform: rotate(180deg);
}

.advanced-signing {
  padding-top: 16px;
}

/* Buttons */
.btn-primary {
  background-color: #5c6ac4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: fit-content;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4c5ab4;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 800px;
  opacity: 1;
}
</style>

