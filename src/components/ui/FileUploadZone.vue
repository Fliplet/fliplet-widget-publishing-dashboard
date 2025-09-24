<template>
  <div
    class="file-upload-zone"
    :class="zoneClasses"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
  >
    <!-- Upload Area -->
    <div
      class="file-upload-zone__area"
      :class="{ 'file-upload-zone__area--highlight': isDragging }"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled || isUploading"
        class="file-upload-zone__input"
        @change="handleFileSelect"
      >

      <!-- Drop Zone Content -->
      <div v-if="!hasFiles" class="file-upload-zone__content">
        <div class="file-upload-zone__icon">
          <i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>
        </div>
        
        <div class="file-upload-zone__text">
          <p class="file-upload-zone__main-text">
            {{ mainText }}
          </p>
          <p class="file-upload-zone__sub-text">
            {{ subText }}
          </p>
        </div>

        <button
          type="button"
          class="file-upload-zone__button btn btn-primary"
          :disabled="disabled || isUploading"
          @click="triggerFileSelect"
        >
          {{ buttonText }}
        </button>

        <div v-if="accept" class="file-upload-zone__accepted">
          Accepted formats: {{ acceptedFormats }}
        </div>
      </div>

      <!-- File Preview Area -->
      <div v-else class="file-upload-zone__preview">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="file-item"
          :class="{ 'file-item--error': file.error }"
        >
          <div class="file-item__icon">
            <i v-if="isImage(file)" class="fas fa-image" aria-hidden="true"></i>
            <i v-else-if="isPDF(file)" class="fas fa-file-pdf" aria-hidden="true"></i>
            <i v-else class="fas fa-file" aria-hidden="true"></i>
          </div>

          <div class="file-item__info">
            <div class="file-item__name">{{ file.name }}</div>
            <div class="file-item__size">{{ formatFileSize(file.size) }}</div>
            <div v-if="file.error" class="file-item__error">{{ file.error }}</div>
            <div v-if="file.progress !== undefined" class="file-item__progress">
              <div class="progress-bar">
                <div 
                  class="progress-bar__fill" 
                  :style="{ width: file.progress + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ file.progress }}%</span>
            </div>
          </div>

          <button
            v-if="!file.uploading"
            type="button"
            class="file-item__remove"
            :aria-label="`Remove ${file.name}`"
            @click="removeFile(index)"
          >
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <button
          v-if="!isUploading"
          type="button"
          class="file-upload-zone__add-more btn btn-secondary"
          @click="triggerFileSelect"
        >
          <i class="fas fa-plus" aria-hidden="true"></i>
          Add More Files
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <validation-message
      v-if="errorMessage"
      :message="errorMessage"
      type="error"
    />
  </div>
</template>

<script>
import ValidationMessage from './ValidationMessage.vue';

/**
 * FileUploadZone - Drag-and-drop file upload component
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <FileUploadZone
 *   :accept="'.jpg,.png,.pdf'"
 *   :max-size="10485760"
 *   :multiple="true"
 *   @files-selected="handleFiles"
 *   @upload="handleUpload"
 * />
 */
export default {
  name: 'FileUploadZone',

  components: {
    ValidationMessage
  },

  props: {
    /**
     * Accepted file types
     * @type {String}
     */
    accept: {
      type: String,
      default: ''
    },

    /**
     * Allow multiple files
     * @type {Boolean}
     */
    multiple: {
      type: Boolean,
      default: false
    },

    /**
     * Maximum file size in bytes
     * @type {Number}
     */
    maxSize: {
      type: Number,
      default: 10485760 // 10MB
    },

    /**
     * Maximum number of files
     * @type {Number}
     */
    maxFiles: {
      type: Number,
      default: 10
    },

    /**
     * Disabled state
     * @type {Boolean}
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * Main text
     * @type {String}
     */
    mainText: {
      type: String,
      default: 'Drag and drop files here'
    },

    /**
     * Sub text
     * @type {String}
     */
    subText: {
      type: String,
      default: 'or click to browse'
    },

    /**
     * Button text
     * @type {String}
     */
    buttonText: {
      type: String,
      default: 'Choose Files'
    },

    /**
     * Auto upload files
     * @type {Boolean}
     */
    autoUpload: {
      type: Boolean,
      default: false
    }
  },

  // Events: files-selected, upload, remove, error

  data() {
    return {
      files: [],
      isDragging: false,
      isUploading: false,
      errorMessage: ''
    };
  },

  computed: {
    zoneClasses() {
      return {
        'file-upload-zone--dragging': this.isDragging,
        'file-upload-zone--disabled': this.disabled,
        'file-upload-zone--uploading': this.isUploading,
        'file-upload-zone--has-files': this.hasFiles
      };
    },

    hasFiles() {
      return this.files.length > 0;
    },

    acceptedFormats() {
      if (!this.accept) return 'All files';
      
      return this.accept
        .split(',')
        .map(ext => ext.trim().replace('.', '').toUpperCase())
        .join(', ');
    }
  },

  methods: {
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.processFiles(files);
      event.target.value = ''; // Reset input
    },

    handleDrop(event) {
      this.isDragging = false;
      const files = Array.from(event.dataTransfer.files);
      this.processFiles(files);
    },

    handleDragOver(event) {
      event.dataTransfer.dropEffect = 'copy';
    },

    handleDragEnter() {
      this.isDragging = true;
    },

    handleDragLeave(event) {
      // Only set to false if leaving the entire zone
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragging = false;
      }
    },

    processFiles(files) {
      this.errorMessage = '';

      // Check max files
      if (!this.multiple && files.length > 1) {
        this.errorMessage = 'Only one file is allowed';
        return;
      }

      if (this.files.length + files.length > this.maxFiles) {
        this.errorMessage = `Maximum ${this.maxFiles} files allowed`;
        return;
      }

      // Validate and add files
      const validFiles = [];
      const errors = [];

      files.forEach(file => {
        // Validate file type
        if (this.accept && !this.validateFileType(file)) {
          errors.push(`${file.name}: Invalid file type`);
          return;
        }

        // Validate file size
        if (file.size > this.maxSize) {
          errors.push(`${file.name}: File too large (max ${this.formatFileSize(this.maxSize)})`);
          return;
        }

        validFiles.push({
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          uploading: false,
          error: null
        });
      });

      if (errors.length > 0) {
        this.errorMessage = errors.join(', ');
      }

      if (validFiles.length > 0) {
        if (!this.multiple) {
          this.files = validFiles;
        } else {
          this.files.push(...validFiles);
        }

        this.$emit('files-selected', validFiles);

        if (this.autoUpload) {
          this.uploadFiles(validFiles);
        }
      }
    },

    validateFileType(file) {
      if (!this.accept) return true;

      const acceptedTypes = this.accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const fileMimeType = file.type;

      return acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        } else {
          return fileMimeType === type || fileMimeType.startsWith(type.replace('*', ''));
        }
      });
    },

    removeFile(index) {
      const removed = this.files.splice(index, 1)[0];
      this.$emit('remove', removed);
      
      if (this.files.length === 0) {
        this.errorMessage = '';
      }
    },

    async uploadFiles(filesToUpload = null) {
      const files = filesToUpload || this.files.filter(f => !f.uploading && !f.error);
      
      if (files.length === 0) return;

      this.isUploading = true;
      
      for (const fileWrapper of files) {
        fileWrapper.uploading = true;
        
        try {
          await this.uploadFile(fileWrapper);
        } catch (error) {
          fileWrapper.error = error.message || 'Upload failed';
          fileWrapper.uploading = false;
        }
      }

      this.isUploading = false;
    },

    async uploadFile(fileWrapper) {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (fileWrapper.progress < 90) {
          fileWrapper.progress += 10;
        }
      }, 200);

      try {
        // Emit upload event for parent to handle actual upload
        const result = await new Promise((resolve, reject) => {
          this.$emit('upload', {
            file: fileWrapper.file,
            onProgress: (progress) => {
              fileWrapper.progress = progress;
            },
            onSuccess: resolve,
            onError: reject
          });
        });

        clearInterval(progressInterval);
        fileWrapper.progress = 100;
        fileWrapper.uploading = false;
        
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    isImage(file) {
      return file.type && file.type.startsWith('image/');
    },

    isPDF(file) {
      return file.type === 'application/pdf';
    },

    clear() {
      this.files = [];
      this.errorMessage = '';
      this.isDragging = false;
      this.isUploading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.file-upload-zone {
  width: 100%;

  &__area {
    border: 2px dashed #d1d5db;
    border-radius: var(--border-radius);
    background-color: #f9fafb;
    transition: all var(--transition-speed) ease;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;

    &--highlight {
      border-color: var(--primary-color);
      background-color: rgba(0, 171, 209, 0.05);
    }
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: -1;
  }

  &__content {
    text-align: center;
    padding: var(--spacing-xl);
  }

  &__icon {
    font-size: 3rem;
    color: #9ca3af;
    margin-bottom: var(--spacing-md);
  }

  &__main-text {
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: var(--spacing-xs);
  }

  &__sub-text {
    color: var(--text-color-secondary);
    margin-bottom: var(--spacing-lg);
  }

  &__button {
    margin-bottom: var(--spacing-md);
  }

  &__accepted {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }

  &__preview {
    padding: var(--spacing-lg);
    width: 100%;
  }

  &__add-more {
    width: 100%;
    margin-top: var(--spacing-md);
  }

  // States
  &--dragging {
    .file-upload-zone__area {
      border-color: var(--primary-color);
      background-color: rgba(0, 171, 209, 0.05);
    }

    .file-upload-zone__icon {
      color: var(--primary-color);
      animation: bounce 0.5s ease infinite;
    }
  }

  &--disabled {
    .file-upload-zone__area {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }

    .file-upload-zone__input {
      cursor: not-allowed;
    }
  }

  &--uploading {
    pointer-events: none;
  }
}

// File items
.file-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-sm);

  &__icon {
    font-size: 1.5rem;
    color: #6b7280;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__size {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }

  &__error {
    font-size: 0.875rem;
    color: var(--error-color);
    margin-top: var(--spacing-xs);
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xs);
  }

  &__remove {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    transition: all var(--transition-speed) ease;

    &:hover {
      background-color: #fee;
      color: var(--error-color);
    }

    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }

  &--error {
    border-color: var(--error-color);
    background-color: #fef2f2;
  }
}

// Progress bar
.progress-bar {
  flex: 1;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  min-width: 35px;
  text-align: right;
}

// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &-primary {
    background-color: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(#00abd1, 10%);
    }
  }

  &-secondary {
    background-color: #6c757d;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(#6c757d, 10%);
    }
  }
}

// Animations
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>