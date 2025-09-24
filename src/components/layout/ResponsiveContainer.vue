<template>
  <div
    :class="containerClasses"
    :style="containerStyles"
  >
    <slot></slot>
  </div>
</template>

<script>
/**
 * ResponsiveContainer - Responsive layout container
 * Provides consistent padding and max-width across breakpoints
 */
export default {
  name: 'ResponsiveContainer',

  props: {
    /**
     * Container type
     * @type {String}
     */
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'fluid', 'narrow', 'wide'].includes(value)
    },

    /**
     * Custom max width
     * @type {String}
     */
    maxWidth: {
      type: String,
      default: null
    },

    /**
     * Disable padding
     * @type {Boolean}
     */
    noPadding: {
      type: Boolean,
      default: false
    },

    /**
     * Additional CSS classes
     * @type {String}
     */
    className: {
      type: String,
      default: ''
    }
  },

  computed: {
    containerClasses() {
      return [
        'responsive-container',
        `responsive-container--${this.type}`,
        {
          'responsive-container--no-padding': this.noPadding
        },
        this.className
      ];
    },

    containerStyles() {
      const styles = {};
      
      if (this.maxWidth) {
        styles.maxWidth = this.maxWidth;
      }
      
      return styles;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.responsive-container {
  @include container();
  
  &--fluid {
    max-width: 100%;
  }
  
  &--narrow {
    max-width: 800px;
  }
  
  &--wide {
    max-width: 1440px;
  }
  
  &--no-padding {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>