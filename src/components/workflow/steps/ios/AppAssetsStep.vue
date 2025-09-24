<template>
  <div class="app-assets-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Upload your app's visual assets. These will be displayed on the App Store and are required
        for submission. All images should be in PNG format without transparency.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://developer.apple.com/app-store/product-page/" target="_blank">
          App Store asset guidelines
        </a>
      </div>
    </div>

    <!-- App Icon -->
    <div class="asset-section">
      <h4 class="section-title">
        App Icon
        <span class="required-badge">Required</span>
      </h4>
      <p class="section-description">
        1024x1024px PNG without transparency or rounded corners
      </p>
      
      <div class="icon-upload-container">
        <div class="icon-preview" v-if="appIcon">
          <img :src="appIconPreview" alt="App Icon Preview">
          <div class="icon-sizes">
            <span v-for="size in iconSizes" :key="size" class="size-preview">
              {{ size }}px
            </span>
          </div>
        </div>
        
        <file-upload-zone
          v-model="appIcon"
          accept="image/png"
          :max-size="5242880"
          help-text="PNG format, 1024x1024px, no transparency"
          @input="handleAppIconUpload"
          class="icon-upload"
        />
      </div>
      
      <validation-message
        v-if="iconValidation.error"
        :message="iconValidation.error"
        type="error"
      />
    </div>

    <!-- Screenshots -->
    <div class="asset-section">
      <h4 class="section-title">
        Screenshots
        <span class="required-badge">Required</span>
      </h4>
      <p class="section-description">
        Upload 3-10 screenshots for each device type you support
      </p>

      <!-- Device Type Tabs -->
      <div class="device-tabs">
        <button
          v-for="device in deviceTypes"
          :key="device.id"
          :class="['device-tab', { active: selectedDevice === device.id }]"
          @click="selectedDevice = device.id"
        >
          <i :class="device.icon"></i>
          {{ device.name }}
          <span class="screenshot-count" v-if="screenshots[device.id]?.length">
            ({{ screenshots[device.id].length }})
          </span>
        </button>
      </div>

      <!-- Screenshot Upload Area -->
      <div class="screenshots-container">
        <div class="device-requirements">
          <i class="fas fa-info-circle"></i>
          <span>{{ getDeviceRequirements(selectedDevice) }}</span>
        </div>

        <draggable
          v-model="screenshots[selectedDevice]"
          class="screenshot-grid"
          :options="{ animation: 200 }"
          @change="handleScreenshotReorder"
        >
          <div
            v-for="(screenshot, index) in screenshots[selectedDevice]"
            :key="screenshot.id"
            class="screenshot-item"
          >
            <img :src="screenshot.preview" :alt="`Screenshot ${index + 1}`">
            <div class="screenshot-actions">
              <button
                class="btn-icon"
                @click="removeScreenshot(selectedDevice, index)"
                title="Remove"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <span class="screenshot-number">{{ index + 1 }}</span>
          </div>

          <!-- Add Screenshot Button -->
          <div
            v-if="!screenshots[selectedDevice] || screenshots[selectedDevice].length < 10"
            class="add-screenshot"
            @click="$refs[`screenshotUpload_${selectedDevice}`].click()"
          >
            <i class="fas fa-plus"></i>
            <span>Add Screenshot</span>
          </div>
        </draggable>

        <input
          v-for="device in deviceTypes"
          :key="`input_${device.id}`"
          :ref="`screenshotUpload_${device.id}`"
          type="file"
          accept="image/png,image/jpeg"
          multiple
          style="display: none"
          @change="handleScreenshotUpload($event, device.id)"
        >
      </div>
    </div>

    <!-- App Preview (Optional) -->
    <div class="asset-section">
      <h4 class="section-title">
        App Preview Video
        <span class="optional-badge">Optional</span>
      </h4>
      <p class="section-description">
        15-30 second video showcasing your app's features
      </p>

      <file-upload-zone
        v-model="appPreviewVideo"
        accept="video/mp4,video/mov"
        :max-size="524288000"
        help-text="MP4 or MOV format, max 500MB, 15-30 seconds"
        @input="handleVideoUpload"
      />

      <div v-if="appPreviewVideo" class="video-preview">
        <video :src="videoPreview" controls></video>
        <div class="video-info">
          <span>Duration: {{ videoDuration }}s</span>
          <span>Size: {{ formatFileSize(appPreviewVideo.size) }}</span>
        </div>
      </div>
    </div>

    <!-- Promotional Text -->
    <div class="asset-section">
      <h4 class="section-title">Promotional Text</h4>
      
      <form-field
        v-model="promotionalText"
        type="textarea"
        label="Short Description"
        placeholder="A brief, compelling description of your app"
        :max-length="170"
        :show-counter="true"
        :rows="3"
        help-text="Displayed above your app description (max 170 characters)"
        @validation="handleFieldValidation('promotionalText', $event)"
      />

      <form-field
        v-model="keywords"
        type="text"
        label="Keywords"
        placeholder="game, puzzle, fun, challenging"
        :max-length="100"
        :show-counter="true"
        help-text="Comma-separated keywords for App Store search (max 100 characters)"
        :rules="[validateKeywords]"
        @validation="handleFieldValidation('keywords', $event)"
      />
    </div>

    <!-- Asset Validation Summary -->
    <div class="asset-validation">
      <h4 class="section-title">Asset Checklist</h4>
      <div class="checklist">
        <div :class="['checklist-item', { completed: appIcon }]">
          <i :class="appIcon ? 'fas fa-check-circle' : 'far fa-circle'"></i>
          App Icon (1024x1024)
        </div>
        <div
          v-for="device in deviceTypes"
          :key="`check_${device.id}`"
          :class="['checklist-item', { completed: hasMinimumScreenshots(device.id) }]"
        >
          <i :class="hasMinimumScreenshots(device.id) ? 'fas fa-check-circle' : 'far fa-circle'"></i>
          {{ device.name }} Screenshots (min 3)
        </div>
        <div :class="['checklist-item', { completed: promotionalText }]">
          <i :class="promotionalText ? 'fas fa-check-circle' : 'far fa-circle'"></i>
          Promotional Text
        </div>
        <div :class="['checklist-item', { completed: keywords }]">
          <i :class="keywords ? 'fas fa-check-circle' : 'far fa-circle'"></i>
          Keywords
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
import draggable from 'vuedraggable';
import FormField from '../../../forms/FormField.vue';
import FileUploadZone from '../../../ui/FileUploadZone.vue';
import ValidationMessage from '../../../ui/ValidationMessage.vue';

/**
 * AppAssetsStep - iOS workflow step for uploading App Store assets
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'AppAssetsStep',

  components: {
    draggable,
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
      // App Icon
      appIcon: this.stepData.appIcon || null,
      appIconPreview: this.stepData.appIconPreview || '',
      iconValidation: {},

      // Screenshots
      screenshots: this.stepData.screenshots || {
        iphone65: [],
        iphone58: [],
        iphone55: [],
        ipadPro129: [],
        ipadPro11: []
      },
      selectedDevice: 'iphone65',

      // App Preview
      appPreviewVideo: this.stepData.appPreviewVideo || null,
      videoPreview: this.stepData.videoPreview || '',
      videoDuration: 0,

      // Text Assets
      promotionalText: this.stepData.promotionalText || '',
      keywords: this.stepData.keywords || '',

      // UI State
      fieldValidation: {},
      loading: false
    };
  },

  computed: {
    deviceTypes() {
      return [
        { id: 'iphone65', name: 'iPhone 6.5"', icon: 'fas fa-mobile-alt', width: 1284, height: 2778 },
        { id: 'iphone58', name: 'iPhone 5.8"', icon: 'fas fa-mobile-alt', width: 1170, height: 2532 },
        { id: 'iphone55', name: 'iPhone 5.5"', icon: 'fas fa-mobile-alt', width: 1242, height: 2208 },
        { id: 'ipadPro129', name: 'iPad Pro 12.9"', icon: 'fas fa-tablet-alt', width: 2048, height: 2732 },
        { id: 'ipadPro11', name: 'iPad Pro 11"', icon: 'fas fa-tablet-alt', width: 1668, height: 2388 }
      ];
    },

    iconSizes() {
      return [180, 120, 80, 60, 40];
    },

    isValid() {
      const hasIcon = !!this.appIcon && !this.iconValidation.error;
      const hasScreenshots = this.deviceTypes.some(device => 
        this.hasMinimumScreenshots(device.id)
      );
      const hasText = !!this.promotionalText && !!this.keywords;
      
      return hasIcon && hasScreenshots && hasText &&
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

  methods: {
    async handleAppIconUpload(file) {
      if (!file) return;

      this.iconValidation = {};

      try {
        // Validate image dimensions
        const validation = await this.validateImageDimensions(file, 1024, 1024);
        if (!validation.valid) {
          this.iconValidation = { error: validation.error };
          this.appIcon = null;
          return;
        }

        // Create preview
        this.appIconPreview = await this.createImagePreview(file);
        
        this.updateStepData({
          appIcon: file,
          appIconPreview: this.appIconPreview
        });
      } catch (error) {
        console.error('Error handling app icon:', error);
        this.iconValidation = { error: 'Failed to process image' };
      }
    },

    async handleScreenshotUpload(event, deviceId) {
      const files = Array.from(event.target.files);
      const device = this.deviceTypes.find(d => d.id === deviceId);
      
      if (!device) return;

      for (const file of files) {
        try {
          // Validate dimensions
          const validation = await this.validateImageDimensions(
            file, 
            device.width, 
            device.height,
            0.9 // Allow 10% tolerance
          );
          
          if (!validation.valid) {
            this.$root.$emit('show-notification', {
              type: 'error',
              message: `${file.name}: ${validation.error}`
            });
            continue;
          }

          // Create preview and add to screenshots
          const preview = await this.createImagePreview(file);
          
          if (!this.screenshots[deviceId]) {
            this.$set(this.screenshots, deviceId, []);
          }
          
          this.screenshots[deviceId].push({
            id: Date.now() + Math.random(),
            file: file,
            preview: preview
          });
        } catch (error) {
          console.error('Error processing screenshot:', error);
        }
      }

      this.updateScreenshots();
      event.target.value = ''; // Reset input
    },

    async handleVideoUpload(file) {
      if (!file) return;

      try {
        // Create preview URL
        this.videoPreview = URL.createObjectURL(file);
        
        // Get video duration
        const video = document.createElement('video');
        video.src = this.videoPreview;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            this.videoDuration = Math.round(video.duration);
            resolve();
          };
        });

        // Validate duration
        if (this.videoDuration < 15 || this.videoDuration > 30) {
          this.$root.$emit('show-notification', {
            type: 'error',
            message: 'Video must be between 15-30 seconds'
          });
          this.appPreviewVideo = null;
          this.videoPreview = '';
          return;
        }

        this.updateStepData({
          appPreviewVideo: file,
          videoPreview: this.videoPreview,
          videoDuration: this.videoDuration
        });
      } catch (error) {
        console.error('Error processing video:', error);
      }
    },

    handleScreenshotReorder() {
      this.updateScreenshots();
    },

    removeScreenshot(deviceId, index) {
      if (this.screenshots[deviceId]) {
        this.screenshots[deviceId].splice(index, 1);
        this.updateScreenshots();
      }
    },

    updateScreenshots() {
      this.updateStepData({ screenshots: this.screenshots });
    },

    async validateImageDimensions(file, expectedWidth, expectedHeight, tolerance = 0) {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          
          const widthMatch = Math.abs(img.width - expectedWidth) / expectedWidth <= tolerance;
          const heightMatch = Math.abs(img.height - expectedHeight) / expectedHeight <= tolerance;
          
          if (widthMatch && heightMatch) {
            resolve({ valid: true });
          } else {
            resolve({
              valid: false,
              error: `Expected ${expectedWidth}×${expectedHeight}px, got ${img.width}×${img.height}px`
            });
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve({ valid: false, error: 'Failed to load image' });
        };
        
        img.src = url;
      });
    },

    async createImagePreview(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    },

    hasMinimumScreenshots(deviceId) {
      return this.screenshots[deviceId] && this.screenshots[deviceId].length >= 3;
    },

    getDeviceRequirements(deviceId) {
      const device = this.deviceTypes.find(d => d.id === deviceId);
      if (!device) return '';
      return `Required: ${device.width}×${device.height}px PNG or JPEG`;
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
      
      if (!this.appIcon) {
        errors.push('App icon is required');
      }
      
      const hasAnyScreenshots = this.deviceTypes.some(device => 
        this.hasMinimumScreenshots(device.id)
      );
      
      if (!hasAnyScreenshots) {
        errors.push('At least 3 screenshots are required for one device type');
      }
      
      if (!this.promotionalText) {
        errors.push('Promotional text is required');
      }
      
      if (!this.keywords) {
        errors.push('Keywords are required');
      }
      
      return errors;
    },

    validateKeywords(value) {
      if (!value) return 'Keywords are required';
      const keywords = value.split(',').map(k => k.trim());
      if (keywords.length === 0) return 'At least one keyword is required';
      if (keywords.some(k => k.length === 0)) return 'Empty keywords are not allowed';
      return true;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style lang="scss" scoped>
.app-assets-step {
  max-width: 800px;
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
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.required-badge,
.optional-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: normal;
}

.required-badge {
  background-color: #fee2e2;
  color: #991b1b;
}

.optional-badge {
  background-color: #e0e7ff;
  color: #3730a3;
}

.section-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.asset-section {
  margin-bottom: var(--spacing-xxl);
}

// App Icon
.icon-upload-container {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;

  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.icon-preview {
  flex-shrink: 0;

  img {
    width: 180px;
    height: 180px;
    border-radius: 20%;
    box-shadow: var(--shadow-lg);
  }

  .icon-sizes {
    display: flex;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .size-preview {
    font-size: 0.75rem;
    padding: 2px 6px;
    background-color: #f3f4f6;
    border-radius: 4px;
    color: var(--text-color-secondary);
  }
}

.icon-upload {
  flex: 1;
  max-width: 400px;
}

// Screenshots
.device-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.device-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: #e5e7eb;
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .screenshot-count {
    font-size: 0.75rem;
    opacity: 0.8;
  }
}

.screenshots-container {
  .device-requirements {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: var(--border-radius);
    color: #1e40af;
    font-size: 0.875rem;
    margin-bottom: var(--spacing-md);
  }
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.screenshot-item {
  position: relative;
  aspect-ratio: 9/16;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: move;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .screenshot-actions {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    opacity: 0;
    transition: opacity var(--transition-speed) ease;
  }

  &:hover .screenshot-actions {
    opacity: 1;
  }

  .screenshot-number {
    position: absolute;
    bottom: var(--spacing-xs);
    left: var(--spacing-xs);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
  }
}

.add-screenshot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 9/16;
  border: 2px dashed #e5e7eb;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  color: var(--text-color-secondary);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background-color: rgba(0, 171, 209, 0.05);
  }

  i {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-xs);
  }

  span {
    font-size: 0.875rem;
  }
}

.btn-icon {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: white;
    box-shadow: var(--shadow-sm);
  }
}

// Video Preview
.video-preview {
  margin-top: var(--spacing-md);

  video {
    width: 100%;
    max-width: 400px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
  }

  .video-info {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }
}

// Asset Validation
.asset-validation {
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);

  .checklist {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    color: var(--text-color-secondary);

    &.completed {
      color: var(--success-color);
    }

    i {
      font-size: 1rem;
      min-width: 20px;
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