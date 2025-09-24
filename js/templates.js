(function() {
  'use strict';

  // Initialize the PublishingDashboard namespace
  window.PublishingDashboard = window.PublishingDashboard || {};
  window.PublishingDashboard.templates = window.PublishingDashboard.templates || {};

  // AppShell Template
  window.PublishingDashboard.templates['app-shell'] = `
    <div class="app-shell">
      <header class="app-shell__header">
        <navigation-header
          :user="user"
          :app-info="appInfo"
          :current-platform="currentPlatform"
          :show-admin-menu="showAdminMenu"
          @platform-change="$emit('platform-change', $event)"
          @navigate="$emit('navigate', $event)"
        ></navigation-header>
      </header>
      <main class="app-shell__main">
        <div class="app-shell__content">
          <slot></slot>
        </div>
      </main>
      <footer-section class="app-shell__footer"></footer-section>
      <loading-overlay :active="isLoading"></loading-overlay>
      <notification-toast></notification-toast>
    </div>
  `;

  // NavigationHeader Template
  window.PublishingDashboard.templates['navigation-header'] = `
    <nav class="navigation-header">
      <div class="navigation-header__left">
        <a href="#" class="navigation-header__logo" @click.prevent="$emit('navigate', 'dashboard')">
          <img src="https://cdn.fliplet.com/assets/logo-white.svg" alt="Fliplet Logo">
          <span>Publishing Dashboard</span>
        </a>
      </div>
      <div class="navigation-header__center">
        <div class="platform-switcher" v-if="currentPlatform">
          <button
            :class="['platform-switcher__button', { 'platform-switcher__button--active': currentPlatform === 'ios' }]"
            @click="$emit('platform-change', 'ios')"
          >
            <i class="fa fa-apple"></i> iOS
          </button>
          <button
            :class="['platform-switcher__button', { 'platform-switcher__button--active': currentPlatform === 'android' }]"
            @click="$emit('platform-change', 'android')"
          >
            <i class="fa fa-android"></i> Android
          </button>
        </div>
      </div>
      <div class="navigation-header__right">
        <div class="user-menu">
          <button class="user-menu__button" @click="toggleUserMenu">
            <i class="fa fa-user-circle"></i> {{ user.name || 'Guest' }}
          </button>
          <div v-if="userMenuOpen" class="user-menu__dropdown">
            <a href="#" @click.prevent="$emit('navigate', 'settings')">Settings</a>
            <a href="#" v-if="showAdminMenu" @click.prevent="$emit('navigate', 'permissions')">Permissions</a>
            <a href="#" @click.prevent="$emit('navigate', 'help')">Help</a>
          </div>
        </div>
      </div>
    </nav>
  `;

  // PlatformSelector Template
  window.PublishingDashboard.templates['platform-selector'] = `
    <div class="platform-selector">
      <h2 class="platform-selector__title">Select a platform to manage publishing</h2>
      <div class="platform-selector__cards">
        <div class="platform-card" @click="$emit('select-platform', 'ios')">
          <i class="fa fa-apple platform-card__icon platform-card__icon--ios"></i>
          <h3 class="platform-card__title">iOS</h3>
          <p class="platform-card__description">Manage your iOS app publishing to App Store Connect.</p>
          <div class="platform-card__status">
            <status-indicator :status="iosStatus"></status-indicator>
            <span v-if="lastIosSubmission">Last submission: {{ lastIosSubmission.version }} ({{ formatTimestamp(lastIosSubmission.timestamp) }})</span>
          </div>
        </div>
        <div class="platform-card" @click="$emit('select-platform', 'android')">
          <i class="fa fa-android platform-card__icon platform-card__icon--android"></i>
          <h3 class="platform-card__title">Android</h3>
          <p class="platform-card__description">Manage your Android app publishing to Google Play Console.</p>
          <div class="platform-card__status">
            <status-indicator :status="androidStatus"></status-indicator>
            <span v-if="lastAndroidSubmission">Last submission: {{ lastAndroidSubmission.version }} ({{ formatTimestamp(lastAndroidSubmission.timestamp) }})</span>
          </div>
        </div>
      </div>
      <div v-if="showAdminSection" class="platform-selector__admin-section">
        <button class="btn btn-secondary" @click="$emit('navigate', 'permissions')">
          <i class="fa fa-shield"></i> Manage App Permissions
        </button>
      </div>
    </div>
  `;

  // FooterSection Template
  window.PublishingDashboard.templates['footer-section'] = `
    <footer class="footer-section">
      <div class="footer-section__content">
        <div class="footer-section__links">
          <a href="#" @click.prevent="$emit('navigate', 'help')">Help & Support</a>
          <a href="#" @click.prevent="$emit('navigate', 'privacy')">Privacy Policy</a>
          <a href="#" @click.prevent="$emit('navigate', 'terms')">Terms of Service</a>
        </div>
        <div class="footer-section__info">
          <span>&copy; {{ currentYear }} Fliplet. All rights reserved.</span>
          <span class="footer-section__version">Version 1.0.0</span>
        </div>
      </div>
    </footer>
  `;

  // LoadingOverlay Template
  window.PublishingDashboard.templates['loading-overlay'] = `
    <transition name="fade">
      <div v-if="active" class="loading-overlay">
        <div class="loading-overlay__spinner">
          <loading-spinner size="60px"></loading-spinner>
          <p v-if="message" class="loading-overlay__message">{{ message }}</p>
        </div>
      </div>
    </transition>
  `;

  // LoadingSpinner Template
  window.PublishingDashboard.templates['loading-spinner'] = `
    <div class="loading-spinner" :style="{ width: size, height: size }">
      <div class="spinner-circle" :style="spinnerStyle"></div>
    </div>
  `;

  // StatusIndicator Template
  window.PublishingDashboard.templates['status-indicator'] = `
    <span :class="['status-indicator', 'status-indicator--' + status]">
      <i :class="iconClass"></i>
      <span class="status-indicator__text">{{ formattedStatus }}</span>
    </span>
  `;

  // NotificationToast Template
  window.PublishingDashboard.templates['notification-toast'] = `
    <transition-group name="toast" tag="div" class="notification-toast-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-toast', 'notification-toast--' + notification.type]"
        @click="dismiss(notification.id)"
      >
        <div class="notification-toast__icon">
          <i :class="getIconClass(notification.type)"></i>
        </div>
        <div class="notification-toast__content">
          <p class="notification-toast__message">{{ notification.message }}</p>
          <button v-if="notification.duration === 0" class="notification-toast__close">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
    </transition-group>
  `;

})();