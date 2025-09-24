<template>
  <div
    :class="gridClasses"
    :style="gridStyles"
  >
    <slot></slot>
  </div>
</template>

<script>
/**
 * ResponsiveGrid - Responsive grid layout component
 * Provides flexible grid layouts with responsive breakpoints
 */
export default {
  name: 'ResponsiveGrid',

  props: {
    /**
     * Number of columns
     * @type {Number|Object}
     */
    columns: {
      type: [Number, Object],
      default: 12,
      validator: value => {
        if (typeof value === 'number') {
          return value > 0 && value <= 24;
        }
        if (typeof value === 'object') {
          return Object.keys(value).every(key => 
            ['xs', 'sm', 'md', 'lg', 'xl'].includes(key)
          );
        }
        return false;
      }
    },

    /**
     * Gap between grid items
     * @type {String|Object}
     */
    gap: {
      type: [String, Object],
      default: 'md',
      validator: value => {
        if (typeof value === 'string') {
          return ['xs', 'sm', 'md', 'lg', 'xl', 'none'].includes(value);
        }
        return typeof value === 'object';
      }
    },

    /**
     * Align items
     * @type {String}
     */
    alignItems: {
      type: String,
      default: 'stretch',
      validator: value => [
        'start', 'end', 'center', 'baseline', 'stretch'
      ].includes(value)
    },

    /**
     * Justify content
     * @type {String}
     */
    justifyContent: {
      type: String,
      default: 'start',
      validator: value => [
        'start', 'end', 'center', 'between', 'around', 'evenly'
      ].includes(value)
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
    gridClasses() {
      const classes = [
        'responsive-grid',
        this.className
      ];

      // Add responsive column classes if columns is an object
      if (typeof this.columns === 'object') {
        Object.entries(this.columns).forEach(([breakpoint, cols]) => {
          classes.push(`responsive-grid--${breakpoint}-${cols}`);
        });
      }

      // Add gap classes
      if (typeof this.gap === 'string') {
        classes.push(`responsive-grid--gap-${this.gap}`);
      }

      // Add alignment classes
      classes.push(`responsive-grid--align-${this.alignItems}`);
      classes.push(`responsive-grid--justify-${this.justifyContent}`);

      return classes;
    },

    gridStyles() {
      const styles = {};

      // Set columns if number
      if (typeof this.columns === 'number') {
        styles.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
      }

      // Set custom gap if object
      if (typeof this.gap === 'object') {
        if (this.gap.row) styles.rowGap = this.gap.row;
        if (this.gap.column) styles.columnGap = this.gap.column;
      }

      return styles;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.responsive-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  
  // Gap variations
  &--gap-none { gap: 0; }
  &--gap-xs { gap: $spacing-xs; }
  &--gap-sm { gap: $spacing-sm; }
  &--gap-md { gap: $spacing-md; }
  &--gap-lg { gap: $spacing-lg; }
  &--gap-xl { gap: $spacing-xl; }
  
  // Alignment variations
  &--align-start { align-items: start; }
  &--align-end { align-items: end; }
  &--align-center { align-items: center; }
  &--align-baseline { align-items: baseline; }
  &--align-stretch { align-items: stretch; }
  
  // Justify variations
  &--justify-start { justify-content: start; }
  &--justify-end { justify-content: end; }
  &--justify-center { justify-content: center; }
  &--justify-between { justify-content: space-between; }
  &--justify-around { justify-content: space-around; }
  &--justify-evenly { justify-content: space-evenly; }
  
  // Responsive column classes
  @each $breakpoint, $min-width in (
    xs: $breakpoint-xs,
    sm: $breakpoint-sm,
    md: $breakpoint-md,
    lg: $breakpoint-lg,
    xl: $breakpoint-xl
  ) {
    @media (min-width: $min-width) {
      @for $i from 1 through 24 {
        &--#{$breakpoint}-#{$i} {
          grid-template-columns: repeat($i, 1fr);
        }
      }
    }
  }
}
</style>