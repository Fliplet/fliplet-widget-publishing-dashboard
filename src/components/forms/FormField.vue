<template>
  <div 
    class="form-field"
    :class="fieldClasses"
  >
    <!-- Label -->
    <label 
      v-if="label"
      :for="fieldId"
      class="form-field__label"
    >
      {{ label }}
      <span v-if="required" class="form-field__required" aria-label="required">*</span>
    </label>

    <!-- Input Types -->
    <div class="form-field__input-wrapper">
      <!-- Text/Email/Password/Number Input -->
      <input
        v-if="isTextInput"
        :id="fieldId"
        v-model="internalValue"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError ? 'true' : 'false'"
        class="form-field__input"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <!-- Textarea -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="fieldId"
        v-model="internalValue"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError ? 'true' : 'false'"
        class="form-field__input form-field__textarea"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      ></textarea>

      <!-- Select -->
      <select
        v-else-if="type === 'select'"
        :id="fieldId"
        v-model="internalValue"
        :name="name"
        :disabled="disabled"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError ? 'true' : 'false'"
        class="form-field__input form-field__select"
        @change="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Checkbox -->
      <label
        v-else-if="type === 'checkbox'"
        class="form-field__checkbox-label"
      >
        <input
          :id="fieldId"
          v-model="internalValue"
          type="checkbox"
          :name="name"
          :disabled="disabled"
          :required="required"
          :aria-describedby="ariaDescribedBy"
          :aria-invalid="hasError ? 'true' : 'false'"
          class="form-field__checkbox"
          @change="handleInput"
        >
        <span class="form-field__checkbox-text">{{ checkboxLabel || label }}</span>
      </label>

      <!-- Input Icon -->
      <span v-if="icon" class="form-field__icon">
        <i :class="icon" aria-hidden="true"></i>
      </span>
    </div>

    <!-- Help Text -->
    <small
      v-if="helpText && !hasError"
      :id="helpTextId"
      class="form-field__help"
    >
      {{ helpText }}
    </small>

    <!-- Validation Message -->
    <validation-message
      v-if="hasError"
      :id="errorId"
      :message="errorMessage"
      :type="errorType"
    />

    <!-- Character Counter -->
    <div
      v-if="showCounter && maxLength"
      class="form-field__counter"
      :class="{ 'form-field__counter--exceeded': characterCount > maxLength }"
    >
      {{ characterCount }} / {{ maxLength }}
    </div>
  </div>
</template>

<script>
import ValidationMessage from '../ui/ValidationMessage.vue';

/**
 * FormField - Reusable form field component with validation support
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <FormField
 *   v-model="email"
 *   type="email"
 *   label="Email Address"
 *   placeholder="Enter your email"
 *   :required="true"
 *   :rules="emailRules"
 *   @validation="handleValidation"
 * />
 */
export default {
  name: 'FormField',

  components: {
    ValidationMessage
  },

  props: {
    /**
     * v-model binding value
     */
    value: {
      type: [String, Number, Boolean, Array],
      default: ''
    },

    /**
     * Input type
     * @type {String}
     */
    type: {
      type: String,
      default: 'text',
      validator: (value) => {
        return [
          'text', 'email', 'password', 'number', 'tel', 'url',
          'textarea', 'select', 'checkbox', 'radio', 'file'
        ].includes(value);
      }
    },

    /**
     * Field label
     * @type {String}
     */
    label: {
      type: String,
      default: ''
    },

    /**
     * Field name attribute
     * @type {String}
     */
    name: {
      type: String,
      default: ''
    },

    /**
     * Placeholder text
     * @type {String}
     */
    placeholder: {
      type: String,
      default: ''
    },

    /**
     * Whether field is required
     * @type {Boolean}
     */
    required: {
      type: Boolean,
      default: false
    },

    /**
     * Whether field is disabled
     * @type {Boolean}
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * Whether field is readonly
     * @type {Boolean}
     */
    readonly: {
      type: Boolean,
      default: false
    },

    /**
     * Validation rules array
     * @type {Array}
     */
    rules: {
      type: Array,
      default: () => []
    },

    /**
     * Help text to display
     * @type {String}
     */
    helpText: {
      type: String,
      default: ''
    },

    /**
     * Icon class to display
     * @type {String}
     */
    icon: {
      type: String,
      default: ''
    },

    /**
     * Options for select field
     * @type {Array}
     */
    options: {
      type: Array,
      default: () => []
    },

    /**
     * Number of rows for textarea
     * @type {Number}
     */
    rows: {
      type: Number,
      default: 3
    },

    /**
     * Autocomplete attribute
     * @type {String}
     */
    autocomplete: {
      type: String,
      default: 'off'
    },

    /**
     * Maximum character length
     * @type {Number}
     */
    maxLength: {
      type: Number,
      default: null
    },

    /**
     * Show character counter
     * @type {Boolean}
     */
    showCounter: {
      type: Boolean,
      default: false
    },

    /**
     * Validate on blur
     * @type {Boolean}
     */
    validateOnBlur: {
      type: Boolean,
      default: true
    },

    /**
     * Validate on input
     * @type {Boolean}
     */
    validateOnInput: {
      type: Boolean,
      default: false
    },

    /**
     * Label for checkbox
     * @type {String}
     */
    checkboxLabel: {
      type: String,
      default: ''
    }
  },

  // Events: input, blur, focus, validation

  data() {
    return {
      internalValue: this.value,
      touched: false,
      focused: false,
      errors: [],
      fieldId: null
    };
  },

  computed: {
    fieldClasses() {
      return {
        'form-field--focused': this.focused,
        'form-field--touched': this.touched,
        'form-field--disabled': this.disabled,
        'form-field--readonly': this.readonly,
        'form-field--required': this.required,
        'form-field--has-error': this.hasError,
        'form-field--has-icon': this.icon,
        [`form-field--${this.type}`]: true
      };
    },

    isTextInput() {
      return ['text', 'email', 'password', 'number', 'tel', 'url'].includes(this.type);
    },

    hasError() {
      return this.errors.length > 0;
    },

    errorMessage() {
      return this.errors[0] || '';
    },

    errorType() {
      return 'error';
    },

    ariaDescribedBy() {
      const ids = [];
      if (this.helpText && !this.hasError) ids.push(this.helpTextId);
      if (this.hasError) ids.push(this.errorId);
      return ids.join(' ') || null;
    },

    helpTextId() {
      return `${this.fieldId}-help`;
    },

    errorId() {
      return `${this.fieldId}-error`;
    },

    characterCount() {
      const value = String(this.internalValue || '');
      return value.length;
    }
  },

  watch: {
    value(newValue) {
      this.internalValue = newValue;
    },

    internalValue(newValue) {
      if (this.validateOnInput && this.touched) {
        this.validate();
      }
    }
  },

  created() {
    this.fieldId = this.name || `field-${this._uid}`;
  },

  methods: {
    handleInput(event) {
      const value = this.type === 'checkbox' 
        ? event.target.checked 
        : event.target.value;
      
      this.internalValue = value;
      this.$emit('input', value);

      if (this.validateOnInput && this.touched) {
        this.validate();
      }
    },

    handleBlur(event) {
      this.touched = true;
      this.focused = false;
      this.$emit('blur', event);

      if (this.validateOnBlur) {
        this.validate();
      }
    },

    handleFocus(event) {
      this.focused = true;
      this.$emit('focus', event);
    },

    async validate() {
      this.errors = [];

      // Required validation
      if (this.required && !this.internalValue) {
        this.errors.push(`${this.label || 'Field'} is required`);
      }

      // Run custom validation rules
      for (const rule of this.rules) {
        if (typeof rule === 'function') {
          const result = await rule(this.internalValue);
          if (result !== true) {
            this.errors.push(result);
          }
        } else if (typeof rule === 'object' && rule.validator) {
          const result = await rule.validator(this.internalValue);
          if (result !== true) {
            this.errors.push(rule.message || result);
          }
        }
      }

      // Email validation
      if (this.type === 'email' && this.internalValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.internalValue)) {
          this.errors.push('Please enter a valid email address');
        }
      }

      // Max length validation
      if (this.maxLength && this.characterCount > this.maxLength) {
        this.errors.push(`Maximum ${this.maxLength} characters allowed`);
      }

      const isValid = this.errors.length === 0;
      
      this.$emit('validation', {
        field: this.name || this.fieldId,
        valid: isValid,
        errors: this.errors
      });

      return isValid;
    },

    focus() {
      const input = this.$el.querySelector('input, textarea, select');
      if (input) {
        input.focus();
      }
    },

    reset() {
      this.internalValue = '';
      this.touched = false;
      this.focused = false;
      this.errors = [];
      this.$emit('input', '');
    }
  }
};
</script>

<style lang="scss" scoped>
.form-field {
  margin-bottom: var(--spacing-lg);

  &__label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var(--text-color, #333);
  }

  &__required {
    color: var(--error-color, #dc3545);
    margin-left: 2px;
  }

  &__input-wrapper {
    position: relative;
  }

  &__input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid #d1d5db;
    border-radius: var(--border-radius, 6px);
    font-family: inherit;
    font-size: var(--font-size-base, 14px);
    line-height: 1.5;
    color: var(--text-color, #333);
    background-color: white;
    transition: all var(--transition-speed, 200ms) ease;

    &:hover:not(:disabled) {
      border-color: #9ca3af;
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color, #00abd1);
      box-shadow: 0 0 0 3px rgba(0, 171, 209, 0.1);
    }

    &:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
      opacity: 0.6;
    }

    &[readonly] {
      background-color: #f9fafb;
      cursor: default;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  &__textarea {
    min-height: 80px;
    resize: vertical;
  }

  &__select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right var(--spacing-sm) center;
    background-size: 20px;
    padding-right: calc(var(--spacing-md) + 24px);
  }

  &__checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  &__checkbox {
    width: 18px;
    height: 18px;
    margin-right: var(--spacing-sm);
    cursor: pointer;
  }

  &__checkbox-text {
    color: var(--text-color, #333);
    user-select: none;
  }

  &__icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }

  &__help {
    display: block;
    margin-top: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--text-color-secondary, #666);
  }

  &__counter {
    text-align: right;
    margin-top: var(--spacing-xs);
    font-size: 0.75rem;
    color: var(--text-color-secondary, #666);

    &--exceeded {
      color: var(--error-color, #dc3545);
      font-weight: 500;
    }
  }

  // Field states
  &--has-error {
    .form-field__input {
      border-color: var(--error-color, #dc3545);

      &:focus {
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }
    }
  }

  &--has-icon {
    .form-field__input {
      padding-left: calc(var(--spacing-md) + 24px);
    }
  }

  &--required {
    .form-field__label::after {
      content: ' *';
      color: var(--error-color, #dc3545);
    }
  }

  // Type-specific styles
  &--checkbox {
    .form-field__label {
      display: none;
    }
  }

  &--file {
    .form-field__input {
      padding: var(--spacing-xs) var(--spacing-sm);
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .form-field {
    &__input {
      background-color: #1f2937;
      border-color: #374151;
      color: #f9fafb;

      &:hover:not(:disabled) {
        border-color: #4b5563;
      }

      &:disabled {
        background-color: #111827;
      }

      &[readonly] {
        background-color: #1f2937;
      }

      &::placeholder {
        color: #6b7280;
      }
    }
  }
}
</style>