<template>
  <header class="navigation-header" :class="headerClasses" role="banner">
    <div class="navigation-header__container">
      <!-- Mobile menu toggle -->
      <button
        v-if="isMobile"
        class="navigation-header__toggle"
        :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <span class="hamburger">
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
        </span>
      </button>

      <!-- Logo/Brand -->
      <div class="navigation-header__brand">
        <img 
          v-if="appInfo.logo" 
          :src="appInfo.logo" 
          :alt="appInfo.name + ' logo'"
          class="brand-logo"
        >
        <h1 class="brand-title">{{ appInfo.name || 'Publishing Dashboard' }}</h1>
      </div>

      <!-- Desktop Navigation -->
      <nav 
        v-if="!isMobile"
        class="navigation-header__nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul class="nav-list" role="list">
          <li class="nav-item">
            <button
              class="nav-link platform-switcher"
              :class="{ active: currentPlatform === 'ios' }"
              @click="selectPlatform('ios')"
            >
              <i class="fa fa-apple" aria-hidden="true"></i>
              <span>iOS</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link platform-switcher"
              :class="{ active: currentPlatform === 'android' }"
              @click="selectPlatform('android')"
            >
              <i class="fa fa-android" aria-hidden="true"></i>
              <span>Android</span>
            </button>
          </li>
          <li v-if="showAdminMenu" class="nav-item">
            <button
              class="nav-link"
              @click="navigateTo('permissions')"
            >
              <i class="fa fa-shield-alt" aria-hidden="true"></i>
              <span>Permissions</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- User Menu -->
      <div class="navigation-header__user">
        <button
          class="user-menu-toggle"
          :aria-expanded="userMenuOpen ? 'true' : 'false'"
          aria-label="User menu"
          @click="toggleUserMenu"
          @blur="handleUserMenuBlur"
        >
          <span class="user-avatar">
            <i class="fa fa-user-circle" aria-hidden="true"></i>
          </span>
          <span v-if="!isMobile" class="user-name">{{ userName }}</span>
          <i class="fa fa-chevron-down user-menu-arrow" aria-hidden="true"></i>
        </button>

        <!-- User Dropdown -->
        <transition name="dropdown">
          <div 
            v-if="userMenuOpen"
            class="user-dropdown"
            role="menu"
            @mousedown.prevent
          >
            <div class="user-info">
              <strong>{{ userName }}</strong>
              <small>{{ user.email }}</small>
            </div>
            <div class="dropdown-divider"></div>
            <button
              class="dropdown-item"
              role="menuitem"
              @click="navigateTo('help')"
            >
              <i class="fa fa-question-circle" aria-hidden="true"></i>
              Help & Documentation
            </button>
            <button
              class="dropdown-item"
              role="menuitem"
              @click="navigateTo('settings')"
            >
              <i class="fa fa-cog" aria-hidden="true"></i>
              Settings
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <transition name="slide">
      <nav 
        v-if="isMobile && mobileMenuOpen"
        class="mobile-nav"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div class="mobile-nav__header">
          <h2>Navigation</h2>
          <button
            class="close-btn"
            aria-label="Close navigation"
            @click="closeMobileMenu"
          >
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <ul class="mobile-nav__list" role="list">
          <li>
            <button
              class="mobile-nav__link"
              :class="{ active: currentPlatform === 'ios' }"
              @click="selectPlatformMobile('ios')"
            >
              <i class="fa fa-apple" aria-hidden="true"></i>
              iOS Publishing
            </button>
          </li>
          <li>
            <button
              class="mobile-nav__link"
              :class="{ active: currentPlatform === 'android' }"
              @click="selectPlatformMobile('android')"
            >
              <i class="fa fa-android" aria-hidden="true"></i>
              Android Publishing
            </button>
          </li>
          <li v-if="showAdminMenu">
            <button
              class="mobile-nav__link"
              @click="navigateToMobile('permissions')"
            >
              <i class="fa fa-shield-alt" aria-hidden="true"></i>
              Permissions
            </button>
          </li>
        </ul>
      </nav>
    </transition>

    <!-- Mobile backdrop -->
    <transition name="fade">
      <div 
        v-if="isMobile && mobileMenuOpen"
        class="mobile-backdrop"
        @click="closeMobileMenu"
      ></div>
    </transition>
  </header>
</template>

<script>
/**
 * NavigationHeader - Primary navigation and platform switching
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <NavigationHeader
 *   :current-platform="platform"
 *   :user="userInfo"
 *   :app-info="appData"
 *   :show-admin-menu="isAdmin"
 *   @platform-change="handlePlatformChange"
 *   @navigate="handleNavigation"
 * />
 */
export default {
  name: 'NavigationHeader',

  props: {
    /**
     * Currently selected platform
     * @type {String}
     */
    currentPlatform: {
      type: String,
      default: null,
      validator: (value) => {
        return value === null || ['ios', 'android'].includes(value);
      }
    },

    /**
     * User information
     * @type {Object}
     */
    user: {
      type: Object,
      default: () => ({
        name: 'User',
        email: 'user@example.com'
      })
    },

    /**
     * App information
     * @type {Object}
     */
    appInfo: {
      type: Object,
      default: () => ({
        name: 'Publishing Dashboard',
        logo: null
      })
    },

    /**
     * Show admin menu items
     * @type {Boolean}
     */
    showAdminMenu: {
      type: Boolean,
      default: false
    }
  },

  // Events: platform-change, navigate

  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false,
      isMobile: false,
      isTablet: false
    };
  },

  computed: {
    headerClasses() {
      return {
        'navigation-header--mobile': this.isMobile,
        'navigation-header--tablet': this.isTablet,
        'navigation-header--menu-open': this.mobileMenuOpen
      };
    },

    userName() {
      return this.user.name || this.user.fullName || 'User';
    }
  },

  created() {
    this.checkViewport();
  },

  mounted() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('click', this.handleDocumentClick);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('click', this.handleDocumentClick);
  },

  methods: {
    checkViewport() {
      const width = window.innerWidth;
      this.isMobile = width < 768;
      this.isTablet = width >= 768 && width < 1024;
    },

    handleResize() {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.checkViewport();
        if (!this.isMobile) {
          this.mobileMenuOpen = false;
        }
      }, 150);
    },

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
    },

    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },

    handleUserMenuBlur() {
      // Close menu after a short delay to allow clicks on menu items
      setTimeout(() => {
        this.userMenuOpen = false;
      }, 200);
    },

    handleDocumentClick(event) {
      // Close user menu if clicking outside
      if (!event.target.closest('.navigation-header__user')) {
        this.userMenuOpen = false;
      }
    },

    selectPlatform(platform) {
      if (platform !== this.currentPlatform) {
        this.$emit('platform-change', platform);
      }
    },

    selectPlatformMobile(platform) {
      this.selectPlatform(platform);
      this.closeMobileMenu();
    },

    navigateTo(route) {
      this.userMenuOpen = false;
      this.$emit('navigate', route);
    },

    navigateToMobile(route) {
      this.closeMobileMenu();
      this.$emit('navigate', route);
    }
  }
};
</script>

<style lang="scss" scoped>
.navigation-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-md);
    height: 60px;
    max-width: var(--container-max-width, 1200px);
    margin: 0 auto;
  }

  &__toggle {
    background: none;
    border: none;
    padding: var(--spacing-sm);
    cursor: pointer;
    
    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .brand-logo {
      height: 32px;
      width: auto;
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-color, #333);
      
      @media (max-width: 767px) {
        font-size: 1.1rem;
      }
    }
  }

  &__nav {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  &__user {
    position: relative;
  }
}

// Navigation list
.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-xs);
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-color, #333);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }

  i {
    font-size: 1.2rem;
  }
}

// Platform switcher specific styles
.platform-switcher {
  &.active {
    &:nth-child(1) {
      background-color: var(--ios-color, #007aff);
    }
    
    &:nth-child(2) {
      background-color: var(--android-color, #3ddc84);
    }
  }
}

// User menu
.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-speed) ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}

.user-avatar {
  font-size: 1.5rem;
  color: var(--text-color-secondary, #666);
}

.user-name {
  font-weight: 500;
  color: var(--text-color, #333);
}

.user-menu-arrow {
  font-size: 0.75rem;
  transition: transform var(--transition-speed) ease;
  
  [aria-expanded="true"] & {
    transform: rotate(180deg);
  }
}

// User dropdown
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  min-width: 200px;
  overflow: hidden;
}

.user-info {
  padding: var(--spacing-md);
  
  strong {
    display: block;
    color: var(--text-color, #333);
  }
  
  small {
    color: var(--text-color-secondary, #666);
  }
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-speed) ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.1);
  }

  i {
    color: var(--text-color-secondary, #666);
  }
}

// Hamburger menu
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;

  &__line {
    height: 2px;
    background-color: var(--text-color, #333);
    transition: all var(--transition-speed) ease;
    
    .navigation-header--menu-open & {
      &:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
      }
      
      &:nth-child(2) {
        opacity: 0;
      }
      
      &:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
      }
    }
  }
}

// Mobile navigation
.mobile-nav {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 99;
  overflow-y: auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid #e0e0e0;

    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-color-secondary, #666);
      cursor: pointer;
      padding: var(--spacing-xs);
    }
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: var(--spacing-md) 0;
    
    li {
      margin: 0;
    }
  }

  &__link {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    background: none;
    border: none;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color var(--transition-speed) ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.active {
      background-color: var(--primary-color);
      color: white;
    }

    i {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }
  }
}

.mobile-backdrop {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-speed) ease;
}

.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform var(--transition-speed) ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed) ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>