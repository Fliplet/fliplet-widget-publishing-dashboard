<template>
  <div class="metadata-step">
    <!-- Step Introduction -->
    <div class="step-intro">
      <p class="intro-text">
        Provide detailed information about your app that will be displayed on the App Store.
        This includes descriptions, categories, and content ratings.
      </p>
    </div>

    <!-- App Description -->
    <div class="metadata-section">
      <h4 class="section-title">App Description</h4>
      
      <form-field
        v-model="description"
        type="textarea"
        label="Description"
        placeholder="Describe your app's features and functionality..."
        :required="true"
        :rows="8"
        :max-length="4000"
        :show-counter="true"
        help-text="A detailed description of your app (max 4000 characters)"
        :rules="[validateDescription]"
        @validation="handleFieldValidation('description', $event)"
      />

      <form-field
        v-model="whatsNew"
        type="textarea"
        label="What's New in This Version"
        placeholder="Describe what's new in this release..."
        :rows="4"
        :max-length="4000"
        :show-counter="true"
        help-text="Release notes for this version"
        @validation="handleFieldValidation('whatsNew', $event)"
      />
    </div>

    <!-- App Category -->
    <div class="metadata-section">
      <h4 class="section-title">App Category</h4>
      
      <div class="category-fields">
        <form-field
          v-model="primaryCategory"
          type="select"
          label="Primary Category"
          placeholder="Select primary category"
          :options="categoryOptions"
          :required="true"
          help-text="The main category for your app"
          @validation="handleFieldValidation('primaryCategory', $event)"
        />

        <form-field
          v-model="secondaryCategory"
          type="select"
          label="Secondary Category"
          placeholder="Select secondary category (optional)"
          :options="secondaryCategoryOptions"
          help-text="An additional category to help users discover your app"
          @validation="handleFieldValidation('secondaryCategory', $event)"
        />
      </div>
    </div>

    <!-- Age Rating -->
    <div class="metadata-section">
      <h4 class="section-title">Age Rating</h4>
      <p class="section-description">
        Answer questions about your app's content to determine its age rating
      </p>

      <div class="age-rating-questions">
        <div
          v-for="question in ageRatingQuestions"
          :key="question.id"
          class="rating-question"
        >
          <label class="question-label">{{ question.text }}</label>
          <div class="frequency-options">
            <label
              v-for="option in frequencyOptions"
              :key="option.value"
              class="radio-option"
            >
              <input
                type="radio"
                :name="`rating_${question.id}`"
                :value="option.value"
                v-model="ageRatings[question.id]"
                @change="calculateAgeRating"
              >
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="calculatedRating" class="calculated-rating">
        <i class="fas fa-shield-alt"></i>
        <div>
          <strong>Age Rating: {{ calculatedRating.rating }}</strong>
          <p>{{ calculatedRating.description }}</p>
        </div>
      </div>
    </div>

    <!-- App Information -->
    <div class="metadata-section">
      <h4 class="section-title">Additional Information</h4>
      
      <form-field
        v-model="subtitle"
        type="text"
        label="Subtitle"
        placeholder="A brief summary of your app"
        :max-length="30"
        :show-counter="true"
        help-text="Appears below your app name (max 30 characters)"
        @validation="handleFieldValidation('subtitle', $event)"
      />

      <form-field
        v-model="copyrightHolder"
        type="text"
        label="Copyright"
        placeholder="© 2024 Company Name"
        :required="true"
        help-text="Copyright notice for your app"
        :rules="[validateCopyright]"
        @validation="handleFieldValidation('copyrightHolder', $event)"
      />

      <div class="url-fields">
        <form-field
          v-model="supportUrl"
          type="url"
          label="Support URL"
          placeholder="https://support.example.com"
          :required="true"
          help-text="Where users can get support for your app"
          :rules="[validateUrl]"
          @validation="handleFieldValidation('supportUrl', $event)"
        />

        <form-field
          v-model="marketingUrl"
          type="url"
          label="Marketing URL"
          placeholder="https://www.example.com"
          help-text="Your app's marketing website (optional)"
          :rules="[value => !value || validateUrl(value) === true]"
          @validation="handleFieldValidation('marketingUrl', $event)"
        />
      </div>

      <form-field
        v-model="privacyPolicyUrl"
        type="url"
        label="Privacy Policy URL"
        placeholder="https://www.example.com/privacy"
        :required="true"
        help-text="Link to your app's privacy policy"
        :rules="[validateUrl]"
        @validation="handleFieldValidation('privacyPolicyUrl', $event)"
      />
    </div>

    <!-- Contact Information -->
    <div class="metadata-section">
      <h4 class="section-title">App Review Contact</h4>
      <p class="section-description">
        Contact information for Apple to use during the review process
      </p>

      <div class="contact-fields">
        <form-field
          v-model="reviewContact.firstName"
          type="text"
          label="First Name"
          placeholder="John"
          :required="true"
          @validation="handleFieldValidation('reviewFirstName', $event)"
        />

        <form-field
          v-model="reviewContact.lastName"
          type="text"
          label="Last Name"
          placeholder="Doe"
          :required="true"
          @validation="handleFieldValidation('reviewLastName', $event)"
        />
      </div>

      <form-field
        v-model="reviewContact.email"
        type="email"
        label="Email Address"
        placeholder="review@example.com"
        :required="true"
        help-text="Email for App Review team to contact"
        :rules="[validateEmail]"
        @validation="handleFieldValidation('reviewEmail', $event)"
      />

      <form-field
        v-model="reviewContact.phone"
        type="tel"
        label="Phone Number"
        placeholder="+1 (555) 123-4567"
        :required="true"
        help-text="Include country code"
        :rules="[validatePhone]"
        @validation="handleFieldValidation('reviewPhone', $event)"
      />

      <form-field
        v-model="reviewNotes"
        type="textarea"
        label="Review Notes"
        placeholder="Additional information for reviewers..."
        :rows="4"
        help-text="Any special instructions or demo credentials for reviewers"
        @validation="handleFieldValidation('reviewNotes', $event)"
      />
    </div>

    <!-- Demo Account (if applicable) -->
    <div class="metadata-section">
      <h4 class="section-title">Demo Account</h4>
      <p class="section-description">
        If your app requires sign-in, provide demo credentials for reviewers
      </p>

      <label class="checkbox-option">
        <input
          type="checkbox"
          v-model="requiresSignIn"
        >
        <span>App requires sign-in</span>
      </label>

      <div v-if="requiresSignIn" class="demo-credentials">
        <form-field
          v-model="demoAccount.username"
          type="text"
          label="Demo Username"
          placeholder="demo@example.com"
          :required="requiresSignIn"
          @validation="handleFieldValidation('demoUsername', $event)"
        />

        <form-field
          v-model="demoAccount.password"
          type="text"
          label="Demo Password"
          placeholder="demopass123"
          :required="requiresSignIn"
          help-text="Provide a working demo account password"
          @validation="handleFieldValidation('demoPassword', $event)"
        />
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
 * MetadataStep - iOS workflow step for App Store metadata
 * Vue 2.6.14 component using Options API
 */
export default {
  name: 'MetadataStep',

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
      // App Information
      description: this.stepData.description || '',
      whatsNew: this.stepData.whatsNew || '',
      subtitle: this.stepData.subtitle || '',
      copyrightHolder: this.stepData.copyrightHolder || '',
      
      // Categories
      primaryCategory: this.stepData.primaryCategory || '',
      secondaryCategory: this.stepData.secondaryCategory || '',
      
      // URLs
      supportUrl: this.stepData.supportUrl || '',
      marketingUrl: this.stepData.marketingUrl || '',
      privacyPolicyUrl: this.stepData.privacyPolicyUrl || '',
      
      // Age Rating
      ageRatings: this.stepData.ageRatings || {
        violence: 'none',
        sexualContent: 'none',
        profanity: 'none',
        alcohol: 'none',
        gambling: 'none',
        horror: 'none',
        medical: 'none'
      },
      calculatedRating: null,
      
      // Review Contact
      reviewContact: {
        firstName: this.stepData.reviewContact?.firstName || '',
        lastName: this.stepData.reviewContact?.lastName || '',
        email: this.stepData.reviewContact?.email || '',
        phone: this.stepData.reviewContact?.phone || ''
      },
      reviewNotes: this.stepData.reviewNotes || '',
      
      // Demo Account
      requiresSignIn: this.stepData.requiresSignIn || false,
      demoAccount: {
        username: this.stepData.demoAccount?.username || '',
        password: this.stepData.demoAccount?.password || ''
      },
      
      // UI State
      fieldValidation: {}
    };
  },

  computed: {
    categoryOptions() {
      return [
        { value: 'business', label: 'Business' },
        { value: 'developer-tools', label: 'Developer Tools' },
        { value: 'education', label: 'Education' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'finance', label: 'Finance' },
        { value: 'food-drink', label: 'Food & Drink' },
        { value: 'games', label: 'Games' },
        { value: 'graphics-design', label: 'Graphics & Design' },
        { value: 'health-fitness', label: 'Health & Fitness' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'medical', label: 'Medical' },
        { value: 'music', label: 'Music' },
        { value: 'news', label: 'News' },
        { value: 'photo-video', label: 'Photo & Video' },
        { value: 'productivity', label: 'Productivity' },
        { value: 'reference', label: 'Reference' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'social-networking', label: 'Social Networking' },
        { value: 'sports', label: 'Sports' },
        { value: 'travel', label: 'Travel' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'weather', label: 'Weather' }
      ];
    },

    secondaryCategoryOptions() {
      return [
        { value: '', label: 'None' },
        ...this.categoryOptions.filter(cat => cat.value !== this.primaryCategory)
      ];
    },

    ageRatingQuestions() {
      return [
        { id: 'violence', text: 'Cartoon or Fantasy Violence' },
        { id: 'sexualContent', text: 'Sexual Content or Nudity' },
        { id: 'profanity', text: 'Profanity or Crude Humor' },
        { id: 'alcohol', text: 'Alcohol, Tobacco, or Drug Use' },
        { id: 'gambling', text: 'Simulated Gambling' },
        { id: 'horror', text: 'Horror/Fear Themes' },
        { id: 'medical', text: 'Medical/Treatment Information' }
      ];
    },

    frequencyOptions() {
      return [
        { value: 'none', label: 'None' },
        { value: 'infrequent', label: 'Infrequent/Mild' },
        { value: 'frequent', label: 'Frequent/Intense' }
      ];
    },

    isValid() {
      const hasRequiredFields = this.description &&
                               this.primaryCategory &&
                               this.copyrightHolder &&
                               this.supportUrl &&
                               this.privacyPolicyUrl &&
                               this.reviewContact.firstName &&
                               this.reviewContact.lastName &&
                               this.reviewContact.email &&
                               this.reviewContact.phone;
                               
      const hasDemoIfRequired = !this.requiresSignIn || 
                               (this.demoAccount.username && this.demoAccount.password);
      
      return hasRequiredFields && hasDemoIfRequired &&
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
    description(value) { this.updateStepData({ description: value }); },
    whatsNew(value) { this.updateStepData({ whatsNew: value }); },
    subtitle(value) { this.updateStepData({ subtitle: value }); },
    copyrightHolder(value) { this.updateStepData({ copyrightHolder: value }); },
    primaryCategory(value) { this.updateStepData({ primaryCategory: value }); },
    secondaryCategory(value) { this.updateStepData({ secondaryCategory: value }); },
    supportUrl(value) { this.updateStepData({ supportUrl: value }); },
    marketingUrl(value) { this.updateStepData({ marketingUrl: value }); },
    privacyPolicyUrl(value) { this.updateStepData({ privacyPolicyUrl: value }); },
    reviewNotes(value) { this.updateStepData({ reviewNotes: value }); },
    requiresSignIn(value) { this.updateStepData({ requiresSignIn: value }); },
    ageRatings: {
      deep: true,
      handler(value) { 
        this.updateStepData({ ageRatings: value });
        this.calculateAgeRating();
      }
    },
    reviewContact: {
      deep: true,
      handler(value) { this.updateStepData({ reviewContact: value }); }
    },
    demoAccount: {
      deep: true,
      handler(value) { this.updateStepData({ demoAccount: value }); }
    }
  },

  created() {
    this.calculateAgeRating();
  },

  methods: {
    calculateAgeRating() {
      // Simple age rating calculation based on content
      const ratings = Object.values(this.ageRatings);
      
      if (ratings.some(r => r === 'frequent')) {
        this.calculatedRating = {
          rating: '17+',
          description: 'May contain frequent/intense mature content'
        };
      } else if (ratings.some(r => r === 'infrequent')) {
        this.calculatedRating = {
          rating: '12+',
          description: 'May contain infrequent/mild mature content'
        };
      } else if (this.ageRatings.medical !== 'none') {
        this.calculatedRating = {
          rating: '12+',
          description: 'Contains medical/treatment information'
        };
      } else {
        this.calculatedRating = {
          rating: '4+',
          description: 'No objectionable content'
        };
      }
      
      this.updateStepData({ calculatedRating: this.calculatedRating });
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
      
      if (!this.description) errors.push('App description is required');
      if (!this.primaryCategory) errors.push('Primary category is required');
      if (!this.copyrightHolder) errors.push('Copyright information is required');
      if (!this.supportUrl) errors.push('Support URL is required');
      if (!this.privacyPolicyUrl) errors.push('Privacy policy URL is required');
      
      if (!this.reviewContact.firstName) errors.push('Review contact first name is required');
      if (!this.reviewContact.lastName) errors.push('Review contact last name is required');
      if (!this.reviewContact.email) errors.push('Review contact email is required');
      if (!this.reviewContact.phone) errors.push('Review contact phone is required');
      
      if (this.requiresSignIn) {
        if (!this.demoAccount.username) errors.push('Demo username is required');
        if (!this.demoAccount.password) errors.push('Demo password is required');
      }
      
      return errors;
    },

    // Validation Rules
    validateDescription(value) {
      if (!value) return 'Description is required';
      if (value.length < 10) return 'Description must be at least 10 characters';
      return true;
    },

    validateCopyright(value) {
      if (!value) return 'Copyright is required';
      if (!value.includes('©')) return 'Copyright must include © symbol';
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
    },

    validateEmail(value) {
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email';
      return true;
    },

    validatePhone(value) {
      if (!value) return 'Phone number is required';
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
      if (value.replace(/\D/g, '').length < 10) return 'Phone number is too short';
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.metadata-step {
  max-width: 700px;
}

.step-intro {
  margin-bottom: var(--spacing-xl);

  .intro-text {
    margin: 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
  }
}

.metadata-section {
  margin-bottom: var(--spacing-xxl);
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-color);
}

.section-description {
  margin: -8px 0 var(--spacing-md) 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.category-fields,
.url-fields,
.contact-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

// Age Rating
.age-rating-questions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.rating-question {
  .question-label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    color: var(--text-color);
  }

  .frequency-options {
    display: flex;
    gap: var(--spacing-md);
  }
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;

  input[type="radio"] {
    cursor: pointer;
  }

  span {
    font-size: 0.875rem;
    color: var(--text-color);
  }
}

.calculated-rating {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);

  i {
    font-size: 1.5rem;
    color: #0284c7;
    margin-top: 2px;
  }

  strong {
    display: block;
    margin-bottom: 4px;
    color: #0284c7;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #0369a1;
  }
}

// Demo Account
.checkbox-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  cursor: pointer;

  input[type="checkbox"] {
    cursor: pointer;
  }

  span {
    color: var(--text-color);
  }
}

.demo-credentials {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding-left: var(--spacing-lg);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.validation-summary {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>