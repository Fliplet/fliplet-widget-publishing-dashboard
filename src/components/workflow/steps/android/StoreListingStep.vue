<template>
  <div class="store-listing-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Configure your app's Google Play Store listing. This information will be
        displayed to users on the Play Store.
      </p>
      <div class="help-link">
        <i class="fas fa-info-circle"></i>
        <a href="https://support.google.com/googleplay/android-developer/answer/9859348" target="_blank">
          Store listing best practices
        </a>
      </div>
    </div>

    <!-- Basic Information -->
    <div class="basic-info-section">
      <h4 class="section-title">Basic Information</h4>
      
      <form-field
        v-model="title"
        type="text"
        label="App Title"
        placeholder="My Amazing App"
        :required="true"
        :max-length="50"
        :show-counter="true"
        :rules="[validateTitle]"
        help-text="The name of your app as it appears on Google Play"
        @validation="handleFieldValidation('title', $event)"
      />

      <form-field
        v-model="shortDescription"
        type="textarea"
        label="Short Description"
        placeholder="A brief description of your app..."
        :required="true"
        :rows="2"
        :max-length="80"
        :show-counter="true"
        :rules="[validateShortDescription]"
        help-text="A concise summary displayed in search results"
        @validation="handleFieldValidation('shortDescription', $event)"
      />

      <form-field
        v-model="fullDescription"
        type="textarea"
        label="Full Description"
        placeholder="Describe your app's features and functionality..."
        :required="true"
        :rows="8"
        :max-length="4000"
        :show-counter="true"
        help-text="Detailed description of your app"
        @validation="handleFieldValidation('fullDescription', $event)"
      />
    </div>

    <!-- Category & Tags -->
    <div class="category-section">
      <h4 class="section-title">Category & Tags</h4>
      
      <div class="category-fields">
        <form-field
          v-model="category"
          type="select"
          label="App Category"
          placeholder="Select a category"
          :options="categoryOptions"
          :required="true"
          help-text="Primary category for your app"
          @validation="handleFieldValidation('category', $event)"
        />

        <form-field
          v-model="contentRating"
          type="select"
          label="Content Rating"
          placeholder="Select content rating"
          :options="contentRatingOptions"
          :required="true"
          help-text="Age appropriateness of your app"
          @validation="handleFieldValidation('contentRating', $event)"
        />
      </div>

      <form-field
        v-model="tags"
        type="text"
        label="Tags"
        placeholder="productivity, tools, business"
        :max-length="500"
        :show-counter="true"
        help-text="Comma-separated tags to help users find your app"
        @validation="handleFieldValidation('tags', $event)"
      />
    </div>

    <!-- Graphics & Screenshots -->
    <div class="graphics-section">
      <h4 class="section-title">Graphics & Screenshots</h4>
      
      <!-- App Icon -->
      <div class="icon-upload">
        <h5 class="subsection-title">
          App Icon
          <span class="required-badge">Required</span>
        </h5>
        <p class="subsection-description">512x512px PNG, no transparency</p>
        
        <div class="icon-preview-container">
          <div v-if="appIcon" class="icon-preview">
            <img :src="appIconPreview" alt="App Icon">
          </div>
          <file-upload-zone
            v-model="appIcon"
            accept="image/png"
            :max-size="1048576"
            help-text="PNG format, 512x512px"
            @input="handleAppIconUpload"
            class="icon-upload-zone"
          />
        </div>
      </div>

      <!-- Feature Graphic -->
      <div class="feature-graphic-upload">
        <h5 class="subsection-title">
          Feature Graphic
          <span class="required-badge">Required</span>
        </h5>
        <p class="subsection-description">1024x500px image displayed at the top of your listing</p>
        
        <file-upload-zone
          v-model="featureGraphic"
          accept="image/png,image/jpeg"
          :max-size="1048576"
          help-text="PNG or JPEG, 1024x500px"
          @input="handleFeatureGraphicUpload"
        />
        
        <div v-if="featureGraphic" class="graphic-preview">
          <img :src="featureGraphicPreview" alt="Feature Graphic">
        </div>
      </div>

      <!-- Screenshots -->
      <div class="screenshots-upload">
        <h5 class="subsection-title">
          Screenshots
          <span class="required-badge">Required</span>
        </h5>
        <p class="subsection-description">2-8 screenshots for phones, tablets optional</p>

        <!-- Device Type Tabs -->
        <div class="device-tabs">
          <button
            v-for="device in deviceTypes"
            :key="device.id"
            :class="['device-tab', { active: selectedDeviceType === device.id }]"
            @click="selectedDeviceType = device.id"
          >
            <i :class="device.icon"></i>
            {{ device.name }}
            <span class="screenshot-count" v-if="screenshots[device.id]?.length">
              ({{ screenshots[device.id].length }})
            </span>
          </button>
        </div>

        <!-- Screenshot Grid -->
        <draggable
          v-model="screenshots[selectedDeviceType]"
          class="screenshot-grid"
          :options="{ animation: 200 }"
          @change="handleScreenshotReorder"
        >
          <div
            v-for="(screenshot, index) in screenshots[selectedDeviceType]"
            :key="screenshot.id"
            class="screenshot-item"
          >
            <img :src="screenshot.preview" :alt="`Screenshot ${index + 1}`">
            <div class="screenshot-actions">
              <button
                class="btn-icon"
                @click="removeScreenshot(selectedDeviceType, index)"
                title="Remove"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Add Screenshot Button -->
          <div
            v-if="!screenshots[selectedDeviceType] || screenshots[selectedDeviceType].length < 8"
            class="add-screenshot"
            @click="$refs[`screenshotUpload_${selectedDeviceType}`].click()"
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

    <!-- Contact & Support -->
    <div class="contact-section">
      <h4 class="section-title">Contact & Support</h4>
      
      <form-field
        v-model="developerEmail"
        type="email"
        label="Developer Email"
        placeholder="support@example.com"
        :required="true"
        :rules="[validateEmail]"
        help-text="Contact email displayed on your store listing"
        @validation="handleFieldValidation('developerEmail', $event)"
      />

      <form-field
        v-model="developerWebsite"
        type="url"
        label="Developer Website"
        placeholder="https://www.example.com"
        :rules="[value => !value || validateUrl(value) === true]"
        help-text="Your website URL (optional)"
        @validation="handleFieldValidation('developerWebsite', $event)"
      />

      <form-field
        v-model="privacyPolicyUrl"
        type="url"
        label="Privacy Policy URL"
        placeholder="https://www.example.com/privacy"
        :required="true"
        :rules="[validateUrl]"
        help-text="Link to your app's privacy policy"
        @validation="handleFieldValidation('privacyPolicyUrl', $event)"
      />
    </div>

    <!-- Store Listing Preview -->
    <div class="preview-section">
      <h4 class="section-title">Store Listing Preview</h4>
      
      <div class="store-preview">
        <div class="preview-header">
          <img v-if="appIcon" :src="appIconPreview" alt="App Icon" class="preview-icon">
          <div class="preview-info">
            <h3>{{ title || 'App Title' }}</h3>
            <p class="preview-developer">{{ developerName || 'Developer Name' }}</p>
            <div class="preview-rating">
              <i class="fas fa-star"></i>
              <span>4.5</span>
              <span class="preview-category">{{ getCategoryLabel(category) }}</span>
            </div>
          </div>
          <button class="preview-install-btn">Install</button>
        </div>
        
        <p class="preview-short-desc">{{ shortDescription || 'Short description...' }}</p>
        
        <div v-if="screenshots.phone?.length" class="preview-screenshots">
          <img 
            v-for="(screenshot, index) in screenshots.phone.slice(0, 3)" 
            :key="index"
            :src="screenshot.preview" 
            alt="Screenshot"
          >
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
 * StoreListingStep - Android workflow step for Google Play Store listing
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'StoreListingStep',

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
      // Basic Info
      title: this.stepData.title || '',
      shortDescription: this.stepData.shortDescription || '',
      fullDescription: this.stepData.fullDescription || '',
      
      // Category
      category: this.stepData.category || '',
      contentRating: this.stepData.contentRating || '',
      tags: this.stepData.tags || '',
      
      // Graphics
      appIcon: this.stepData.appIcon || null,
      appIconPreview: this.stepData.appIconPreview || '',
      featureGraphic: this.stepData.featureGraphic || null,
      featureGraphicPreview: this.stepData.featureGraphicPreview || '',
      screenshots: this.stepData.screenshots || {
        phone: [],
        tablet7: [],
        tablet10: []
      },
      selectedDeviceType: 'phone',
      
      // Contact
      developerEmail: this.stepData.developerEmail || '',
      developerWebsite: this.stepData.developerWebsite || '',
      privacyPolicyUrl: this.stepData.privacyPolicyUrl || '',
      developerName: 'Your Company', // Would come from account
      
      // UI State
      fieldValidation: {},
      loading: false
    };
  },

  computed: {
    deviceTypes() {
      return [
        { id: 'phone', name: 'Phone', icon: 'fas fa-mobile-alt' },
        { id: 'tablet7', name: '7" Tablet', icon: 'fas fa-tablet-alt' },
        { id: 'tablet10', name: '10" Tablet', icon: 'fas fa-tablet-alt' }
      ];
    },

    categoryOptions() {
      return [
        { value: 'business', label: 'Business' },
        { value: 'communication', label: 'Communication' },
        { value: 'education', label: 'Education' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'finance', label: 'Finance' },
        { value: 'health_fitness', label: 'Health & Fitness' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'music_audio', label: 'Music & Audio' },
        { value: 'news_magazines', label: 'News & Magazines' },
        { value: 'photography', label: 'Photography' },
        { value: 'productivity', label: 'Productivity' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'social', label: 'Social' },
        { value: 'sports', label: 'Sports' },
        { value: 'tools', label: 'Tools' },
        { value: 'travel_local', label: 'Travel & Local' },
        { value: 'video_players', label: 'Video Players & Editors' },
        { value: 'weather', label: 'Weather' }
      ];
    },

    contentRatingOptions() {
      return [
        { value: 'everyone', label: 'Everyone' },
        { value: 'everyone_10', label: 'Everyone 10+' },
        { value: 'teen', label: 'Teen' },
        { value: 'mature', label: 'Mature 17+' },
        { value: 'adults_only', label: 'Adults only 18+' }
      ];
    },

    isValid() {
      const hasRequiredText = this.title &&
                             this.shortDescription &&
                             this.fullDescription &&
                             this.category &&
                             this.contentRating &&
                             this.developerEmail &&
                             this.privacyPolicyUrl;
                             
      const hasRequiredGraphics = this.appIcon &&
                                 this.featureGraphic &&
                                 this.screenshots.phone?.length >= 2;
      
      return hasRequiredText &&
             hasRequiredGraphics &&
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

      try {
        // Validate dimensions
        const validation = await this.validateImageDimensions(file, 512, 512);
        if (!validation.valid) {
          this.$root.$emit('show-notification', {
            type: 'error',
            message: validation.error,
            duration: 3000
          });
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
      }
    },

    async handleFeatureGraphicUpload(file) {
      if (!file) return;

      try {
        // Validate dimensions
        const validation = await this.validateImageDimensions(file, 1024, 500);
        if (!validation.valid) {
          this.$root.$emit('show-notification', {
            type: 'error',
            message: validation.error,
            duration: 3000
          });
          this.featureGraphic = null;
          return;
        }

        // Create preview
        this.featureGraphicPreview = await this.createImagePreview(file);
        this.updateStepData({
          featureGraphic: file,
          featureGraphicPreview: this.featureGraphicPreview
        });
      } catch (error) {
        console.error('Error handling feature graphic:', error);
      }
    },

    async handleScreenshotUpload(event, deviceType) {
      const files = Array.from(event.target.files);
      
      for (const file of files) {
        try {
          // Create preview
          const preview = await this.createImagePreview(file);
          
          if (!this.screenshots[deviceType]) {
            this.$set(this.screenshots, deviceType, []);
          }
          
          // Max 8 screenshots per device type
          if (this.screenshots[deviceType].length < 8) {
            this.screenshots[deviceType].push({
              id: Date.now() + Math.random(),
              file: file,
              preview: preview
            });
          }
        } catch (error) {
          console.error('Error processing screenshot:', error);
        }
      }

      this.updateScreenshots();
      event.target.value = ''; // Reset input
    },

    handleScreenshotReorder() {
      this.updateScreenshots();
    },

    removeScreenshot(deviceType, index) {
      if (this.screenshots[deviceType]) {
        this.screenshots[deviceType].splice(index, 1);
        this.updateScreenshots();
      }
    },

    updateScreenshots() {
      this.updateStepData({ screenshots: this.screenshots });
    },

    async validateImageDimensions(file, expectedWidth, expectedHeight) {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          
          if (img.width === expectedWidth && img.height === expectedHeight) {
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

    getCategoryLabel(value) {
      const category = this.categoryOptions.find(c => c.value === value);
      return category ? category.label : 'Category';
    },

    handleFieldValidation(field, validation) {
      this.$set(this.fieldValidation, field, validation);
    },

    updateStepData(data) {
      this.$emit('update', {
        ...this.stepData,
        ...data,
        // Always include current form values
        title: this.title,
        shortDescription: this.shortDescription,
        fullDescription: this.fullDescription,
        category: this.category,
        contentRating: this.contentRating,
        tags: this.tags,
        developerEmail: this.developerEmail,
        developerWebsite: this.developerWebsite,
        privacyPolicyUrl: this.privacyPolicyUrl
      });
    },

    getValidationErrors() {
      const errors = [];
      
      if (!this.title) errors.push('App title is required');
      if (!this.shortDescription) errors.push('Short description is required');
      if (!this.fullDescription) errors.push('Full description is required');
      if (!this.category) errors.push('Category is required');
      if (!this.contentRating) errors.push('Content rating is required');
      if (!this.developerEmail) errors.push('Developer email is required');
      if (!this.privacyPolicyUrl) errors.push('Privacy policy URL is required');
      if (!this.appIcon) errors.push('App icon is required');
      if (!this.featureGraphic) errors.push('Feature graphic is required');
      
      if (!this.screenshots.phone || this.screenshots.phone.length < 2) {
        errors.push('At least 2 phone screenshots are required');
      }
      
      return errors;
    },

    // Validation Rules
    validateTitle(value) {
      if (!value) return 'Title is required';
      if (value.length < 3) return 'Title must be at least 3 characters';
      return true;
    },

    validateShortDescription(value) {
      if (!value) return 'Short description is required';
      if (value.length < 10) return 'Short description must be at least 10 characters';
      return true;
    },

    validateEmail(value) {
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email';
      return true;
    },

    validateUrl(value) {
      if (!value) return 'URL is required';
      try {
        new URL(value);
        return true;
      } catch {
        return 'Please enter a valid URL';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.store-listing-step {
  max-width: 800px;
}

// ... styles similar to iOS AppAssetsStep but adapted for Android ...

.required-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: normal;
  background-color: #fee2e2;
  color: #991b1b;
  margin-left: var(--spacing-sm);
}

.icon-preview-container {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;

  .icon-preview {
    flex-shrink: 0;

    img {
      width: 128px;
      height: 128px;
      border-radius: 20%;
      box-shadow: var(--shadow-md);
    }
  }

  .icon-upload-zone {
    flex: 1;
    max-width: 400px;
  }
}

.graphic-preview {
  margin-top: var(--spacing-md);

  img {
    width: 100%;
    max-width: 500px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
  }
}

.device-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
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
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: #e5e7eb;
  }

  &.active {
    background-color: var(--android-color);
    color: white;
    border-color: var(--android-color);
  }

  .screenshot-count {
    font-size: 0.75rem;
    opacity: 0.8;
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
    border-color: var(--android-color);
    color: var(--android-color);
    background-color: rgba(61, 220, 132, 0.05);
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

// Store Preview
.store-preview {
  padding: var(--spacing-lg);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  max-width: 400px;
  margin: 0 auto;
}

.preview-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.preview-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;

  h3 {
    margin: 0 0 4px 0;
    font-size: 1.125rem;
    color: var(--text-color);
  }

  .preview-developer {
    margin: 0 0 8px 0;
    color: var(--android-color);
    font-size: 0.875rem;
  }

  .preview-rating {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--text-color-secondary);

    i {
      color: #fbbf24;
    }
  }

  .preview-category {
    margin-left: var(--spacing-sm);
  }
}

.preview-install-btn {
  align-self: flex-start;
  padding: 8px 24px;
  background-color: var(--android-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.preview-short-desc {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.preview-screenshots {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;

  img {
    width: 100px;
    height: 178px;
    border-radius: 4px;
    object-fit: cover;
  }
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>