<template>
  <div
    :class="itemClasses"
    :style="itemStyles"
  >
    <slot></slot>
  </div>
</template>

<script>
/**
 * GridItem - Grid item component for ResponsiveGrid
 * Provides responsive column spanning and ordering
 */
export default {
  name: 'GridItem',

  props: {
    /**
     * Column span
     * @type {Number|Object}
     */
    span: {
      type: [Number, Object],
      default: 1,
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
     * Column offset
     * @type {Number|Object}
     */
    offset: {
      type: [Number, Object],
      default: 0
    },

    /**
     * Order in grid
     * @type {Number|Object}
     */
    order: {
      type: [Number, Object],
      default: null
    },

    /**
     * Align self
     * @type {String}
     */
    alignSelf: {
      type: String,
      default: null,
      validator: value => !value || [
        'start', 'end', 'center', 'baseline', 'stretch'
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
    itemClasses() {
      const classes = [
        'grid-item',
        this.className
      ];

      // Add responsive span classes
      if (typeof this.span === 'object') {
        Object.entries(this.span).forEach(([breakpoint, span]) => {
          classes.push(`grid-item--${breakpoint}-span-${span}`);
        });
      }

      // Add responsive offset classes
      if (typeof this.offset === 'object') {
        Object.entries(this.offset).forEach(([breakpoint, offset]) => {
          if (offset > 0) {
            classes.push(`grid-item--${breakpoint}-offset-${offset}`);
          }
        });
      }

      // Add responsive order classes
      if (typeof this.order === 'object') {
        Object.entries(this.order).forEach(([breakpoint, order]) => {
          classes.push(`grid-item--${breakpoint}-order-${order}`);
        });
      }

      // Add align self class
      if (this.alignSelf) {
        classes.push(`grid-item--align-${this.alignSelf}`);
      }

      return classes;
    },

    itemStyles() {
      const styles = {};

      // Set span if number
      if (typeof this.span === 'number') {
        styles.gridColumn = `span ${this.span}`;
      }

      // Set offset if number
      if (typeof this.offset === 'number' && this.offset > 0) {
        styles.gridColumnStart = this.offset + 1;
      }

      // Set order if number
      if (typeof this.order === 'number') {
        styles.order = this.order;
      }

      return styles;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.grid-item {
  min-width: 0; // Prevent overflow
  
  // Align self variations
  &--align-start { align-self: start; }
  &--align-end { align-self: end; }
  &--align-center { align-self: center; }
  &--align-baseline { align-self: baseline; }
  &--align-stretch { align-self: stretch; }
  
  // Responsive classes
  @each $breakpoint, $min-width in (
    xs: $breakpoint-xs,
    sm: $breakpoint-sm,
    md: $breakpoint-md,
    lg: $breakpoint-lg,
    xl: $breakpoint-xl
  ) {
    @media (min-width: $min-width) {
      // Span classes
      @for $i from 1 through 24 {
        &--#{$breakpoint}-span-#{$i} {
          grid-column: span $i;
        }
      }
      
      // Offset classes
      @for $i from 1 through 23 {
        &--#{$breakpoint}-offset-#{$i} {
          grid-column-start: $i + 1;
        }
      }
      
      // Order classes
      @for $i from -1 through 12 {
        &--#{$breakpoint}-order-#{$i} {
          order: $i;
        }
      }
    }
  }
}
</style>