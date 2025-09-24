# UI/UX Plan: Publishing Dashboard

## Overview

The Publishing Dashboard UI provides a comprehensive interface for managing iOS and Android app publishing workflows within Fliplet Studio. This widget enables users to configure app store submissions, manage certificates and API keys, and monitor build progress through an intuitive, step-by-step interface that enforces workflow dependencies while providing clear error recovery paths.

## Technical Stack

### Framework
- **Vue.js Version:** 2.6.14
- **Component API:** Options API (Vue 2 style)
- **Build Context:** build - Runtime UI shown to end users in the published app

### Available Dependencies
From widget.json:
- **vue.js** - Vue.js 2.6.14 framework
- **fliplet-core** - Core Fliplet functionality and APIs
- **fliplet-studio-ui** - Fliplet's UI component library

Additional assets that can be dynamically loaded:
- **Bootstrap 4** - For responsive grid and base styling (available through Fliplet)
- **Font Awesome 5** - For icons (available through Fliplet)
- **Axios** - For HTTP requests (though we'll use Fliplet.API.request)

## Design Principles

### Core Principles
- **Responsive Design:** Mobile-first approach with fluid layouts for all device sizes
- **Accessibility:** WCAG 2.1 AA compliance throughout with keyboard navigation and screen reader support
- **Brand Flexibility:** Customizable theming system using CSS custom properties
- **User Experience:** Clear step-by-step workflows with visual progress indicators
- **Performance:** Optimized loading with progressive enhancement and lazy loading

### Design System Integration
- **Fliplet Studio UI:** Leverage fliplet-studio-ui components for consistent design language
- **Custom Components:** Extend base components for publishing-specific functionality
- **Theming Architecture:** CSS custom properties with SCSS variables for easy customization

## User Journey Mapping

### Primary User Flow: iOS App Publishing
**User Goal:** Successfully publish an iOS app to the App Store
**Entry Point:** Publishing Dashboard main screen with platform selection
**Success Criteria:** App successfully submitted for App Store review

**Steps:**
1. **Platform Selection**
   - User Action: Select iOS platform from dashboard
   - System Response: Load iOS publishing workflow
   - Data Displayed: Available platforms with current status
   - Possible Errors: Platform unavailable, insufficient permissions

2. **API Key Configuration**
   - User Action: Select existing API key or create new one
   - System Response: Validate API key and fetch team information
   - Data Displayed: List of available API keys with team names
   - Possible Errors: Invalid API key, missing permissions, API connection failure

3. **Submission Initialization**
   - User Action: Start new submission
   - System Response: Create submission record and load bundle IDs
   - Data Displayed: Submission ID and available bundle identifiers
   - Possible Errors: Initialization failure, network errors

4. **Bundle ID Selection**
   - User Action: Choose bundle ID from dropdown
   - System Response: Validate bundle ID availability
   - Data Displayed: Bundle ID list with App Store Connect status
   - Possible Errors: Bundle ID already in use, invalid format

5. **Certificate Management**
   - User Action: Validate existing or generate new certificate
   - System Response: Check certificate status and offer generation
   - Data Displayed: Certificate status, expiry date, generation options
   - Possible Errors: Certificate expired, generation limit reached

6. **Store Configuration**
   - User Action: Enter version number and release notes
   - System Response: Validate against current App Store version
   - Data Displayed: Current version, new version field, release notes
   - Possible Errors: Version conflict, invalid format, missing metadata

7. **App Metadata**
   - User Action: Configure app name, icons, and splash screens
   - System Response: Validate asset requirements and formats
   - Data Displayed: Current assets, upload areas, preview
   - Possible Errors: Invalid image formats, missing required assets

8. **Push Notifications (Optional)**
   - User Action: Configure push notification settings
   - System Response: Validate push certificate and configuration
   - Data Displayed: Push status, certificate info, configuration options
   - Possible Errors: Invalid push certificate, missing configuration

9. **Build Submission**
   - User Action: Review and submit for building
   - System Response: Trigger build process and show progress
   - Data Displayed: Build progress, logs, estimated time
   - Possible Errors: Build failure, timeout, validation errors

### Secondary User Flow: Android App Publishing
**User Goal:** Successfully publish an Android app to Google Play Store
**Entry Point:** Publishing Dashboard main screen with platform selection
**Success Criteria:** App successfully built and ready for Play Store upload

**Steps:**
1. **Platform Selection**
   - User Action: Select Android platform
   - System Response: Load Android publishing workflow
   - Data Displayed: Platform options with status indicators
   - Possible Errors: Platform unavailable

2. **Submission Initialization**
   - User Action: Start Android submission
   - System Response: Create submission and load configuration
   - Data Displayed: Submission details and workflow steps
   - Possible Errors: Initialization failure

3. **Store Configuration**
   - User Action: Enter version code and version name
   - System Response: Validate version increments
   - Data Displayed: Current versions, new version inputs
   - Possible Errors: Version code conflict, invalid format

4. **App Metadata**
   - User Action: Configure app details and assets
   - System Response: Validate requirements
   - Data Displayed: App information forms, asset uploads
   - Possible Errors: Missing required fields, invalid assets

5. **Keystore Management (Optional)**
   - User Action: Upload keystore or use Fliplet's
   - System Response: Validate keystore file
   - Data Displayed: Keystore status, upload interface
   - Possible Errors: Invalid keystore, wrong password

6. **Push Configuration (Optional)**
   - User Action: Configure Firebase settings
   - System Response: Validate Firebase configuration
   - Data Displayed: Firebase setup, service account info
   - Possible Errors: Invalid Firebase config

7. **Build Submission**
   - User Action: Submit for building
   - System Response: Start build and track progress
   - Data Displayed: Build status and logs
   - Possible Errors: Build failure

### Admin User Flow: Permission Management
**User Goal:** Configure app permissions for iOS/Android
**Entry Point:** Admin section of Publishing Dashboard
**Success Criteria:** Permissions successfully updated

**Steps:**
1. **Permission Access**
   - User Action: Navigate to permissions section
   - System Response: Load current permissions
   - Data Displayed: Permission list by platform
   - Possible Errors: Insufficient admin rights

2. **Permission Configuration**
   - User Action: Toggle permissions and add descriptions
   - System Response: Validate permission requirements
   - Data Displayed: Permission toggles with descriptions
   - Possible Errors: Missing required descriptions (iOS)

3. **Save Permissions**
   - User Action: Save permission changes
   - System Response: Update app configuration
   - Data Displayed: Success confirmation
   - Possible Errors: Save failure, validation errors

## Component Architecture

### Layout Components

#### AppShell
**Purpose:** Main application wrapper providing consistent structure and navigation
**Features:**
- Responsive header with branding
- Platform switcher
- User account menu
- Main content area with workflow container
- Footer with help links

**Props:**
```javascript
{
  currentPlatform: String,    // 'ios' | 'android' | null
  user: Object,              // Current user information
  appInfo: Object,           // Current app details
  showAdminMenu: Boolean     // Show admin options
}
```

#### NavigationHeader
**Purpose:** Primary navigation and platform switching
**Responsive Behavior:**
- Desktop: Full horizontal navigation with platform tabs
- Tablet: Condensed navigation with dropdown
- Mobile: Hamburger menu with slide-out drawer

### Page Components

#### PlatformSelectorView
**Purpose:** Initial platform selection screen
**Data Requirements:** Available platforms from middleware
**User Actions:** Select iOS or Android platform
**States:**
- Loading: Skeleton screen while fetching platform status
- Ready: Show platform cards with current status
- Error: Display connection error with retry

#### IOSWorkflowView
**Purpose:** Container for iOS publishing workflow steps
**Data Requirements:** Workflow state, current step, validation status
**User Actions:** Navigate between steps, submit data
**States:**
- Loading: Show current step loading
- Active: Display current step with progress
- Error: Show step-specific errors
- Complete: Show completion summary

#### AndroidWorkflowView
**Purpose:** Container for Android publishing workflow steps
**Data Requirements:** Workflow state, current step, validation status
**User Actions:** Navigate between steps, submit data
**States:**
- Similar to IOSWorkflowView but with Android-specific steps

### Form Components

#### ApiKeyForm
**Purpose:** Select or create iOS API keys
**Fields:**
- API Key dropdown (existing keys)
- Create new key option
- Key name input
- Key file upload
- Issuer ID input
- Private key ID input
**Validation:** Required fields, file format validation
**Submission:** Validates with App Store Connect

#### CertificateForm
**Purpose:** Manage iOS certificates
**Fields:**
- Certificate status display
- Generate new option
- Upload existing option
- Certificate file input
- Private key file input
**Validation:** Certificate validity, format checks
**Submission:** Validates and stores certificate

#### StoreConfigForm
**Purpose:** Configure store listing details
**Fields:**
- Version number/code
- Version name (Android)
- Release notes
- Minimum OS version
**Validation:** Version increment rules, format validation
**Submission:** Saves store configuration

#### MetadataForm
**Purpose:** App metadata configuration
**Fields:**
- App name
- App icon upload
- Splash screen upload
- Description fields
**Validation:** Image format/size, character limits
**Submission:** Validates and stores metadata

### UI Components

#### WorkflowStepper
**Purpose:** Visual workflow progress indicator
**Features:**
- Step numbers with labels
- Current step highlight
- Completed step checkmarks
- Error state indicators
- Clickable navigation (completed steps only)

#### StatusCard
**Purpose:** Display current submission status
**States:**
- Not Started
- In Progress
- Building
- Build Complete
- Build Failed
- Submitted

#### FileUploadZone
**Purpose:** Drag-and-drop file upload area
**Features:**
- Drag-and-drop support
- File type validation
- Progress indicator
- Preview for images
- Error messages

#### ValidationMessage
**Purpose:** Display field validation errors
**Variants:** Error, Warning, Success, Info
**Features:** Icon, message text, optional details

### Feedback Components

#### NotificationToast
**Purpose:** Temporary success/error messages
**Types:** Success, Warning, Error, Info
**Behavior:** 
- Auto-dismiss after 5 seconds
- Manual close button
- Stacks multiple notifications

#### ConfirmDialog
**Purpose:** Confirmation for destructive actions
**Variants:** 
- Delete confirmation
- Cancel workflow
- Override warning

#### LoadingOverlay
**Purpose:** Full-screen loading indicator
**Features:**
- Semi-transparent backdrop
- Spinner with message
- Progress bar for long operations

## Responsive Design Strategy

### Breakpoints
```scss
$breakpoints: (
  'mobile': 320px,    // Base mobile design
  'tablet': 768px,    // Tablet portrait
  'desktop': 1024px,  // Desktop and larger
  'wide': 1440px     // Wide screens
);
```

### Layout Patterns

#### Mobile First
- Single column layout
- Stacked workflow steps
- Full-width forms
- Bottom sheet modals
- Collapsed metadata sections

#### Tablet Adaptations
- Two-column forms where appropriate
- Side-by-side platform cards
- Expanded workflow stepper
- Modal dialogs for confirmations

#### Desktop Enhancements
- Three-column dashboard layout
- Persistent workflow sidebar
- Inline help panels
- Split-view for logs/progress

## Theming & Customization

### CSS Custom Properties
```css
:root {
  /* Fliplet Brand Colors */
  --primary-color: #00abd1;
  --secondary-color: #36344c;
  --accent-color: #e4f4f7;
  
  /* Publishing Dashboard Specific */
  --ios-color: #007aff;
  --android-color: #3ddc84;
  
  /* Semantic Colors */
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
  --info-color: #17a2b8;
  
  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-size-base: 14px;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Layout */
  --container-max-width: 1200px;
  --sidebar-width: 280px;
  
  /* Components */
  --border-radius: 6px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --transition-speed: 200ms;
}
```

### Theme Configuration
```javascript
{
  name: "Publishing Dashboard Theme",
  colors: {
    primary: "var(--primary-color)",
    secondary: "var(--secondary-color)",
    platforms: {
      ios: "var(--ios-color)",
      android: "var(--android-color)"
    }
  },
  typography: {
    headingFont: "var(--font-family-base)",
    bodyFont: "var(--font-family-base)",
    monoFont: "'SF Mono', 'Monaco', 'Inconsolata', monospace"
  },
  layout: {
    containerWidth: "var(--container-max-width)",
    sidebarWidth: "var(--sidebar-width)"
  }
}
```

## Interaction Patterns

### Form Interactions
- **Progressive Disclosure:** Show fields based on previous selections
- **Inline Validation:** Real-time validation with debouncing
- **Auto-save:** Save form progress to state automatically
- **Smart Defaults:** Pre-fill with sensible defaults where possible

### Workflow Navigation
- **Linear Progression:** Enforce step completion before proceeding
- **Jump to Error:** Click to navigate to first error field
- **Breadcrumb Trail:** Show current position in workflow
- **Quick Actions:** Common actions in step header

### File Handling
- **Drag and Drop:** Primary upload method
- **Click to Browse:** Fallback file selection
- **Paste Support:** Paste images directly
- **Preview Generation:** Show thumbnails for images

### Error Recovery
- **Contextual Help:** Show help text near errors
- **Retry Actions:** Clear retry buttons for failures
- **Fallback Options:** Alternative paths for blocked workflows
- **Support Links:** Direct links to documentation

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast:** Minimum 4.5:1 for body text, 3:1 for large text
- **Keyboard Navigation:** Full keyboard support with visible focus indicators
- **Screen Reader Support:** Semantic HTML with ARIA labels
- **Error Identification:** Clear error messages linked to fields

### Implementation Guidelines
```vue
<!-- Accessible form field example -->
<template>
  <div class="form-group" :class="{ 'has-error': hasError }">
    <label :for="fieldId" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    <input
      :id="fieldId"
      v-model="value"
      :type="type"
      :aria-describedby="errorId"
      :aria-invalid="hasError"
      class="form-control"
      @blur="validate"
    >
    <span v-if="hasError" :id="errorId" class="error-message" role="alert">
      {{ errorMessage }}
    </span>
  </div>
</template>
```

### Testing Requirements
- **Keyboard Testing:** Tab through entire workflow
- **Screen Reader Testing:** Test with NVDA/JAWS
- **Color Contrast:** Validate with axe DevTools
- **Focus Management:** Ensure focus moves logically

## Performance Optimization

### Loading Strategy
- **Lazy Component Loading:** Load workflow steps on demand
- **Progressive Enhancement:** Core functionality first
- **Asset Optimization:** Compressed images, minified CSS/JS
- **Caching Strategy:** Cache API responses appropriately

### Runtime Performance
- **Debounced Validation:** Prevent excessive validation calls
- **Virtual Scrolling:** For long lists (API keys, submissions)
- **Optimistic UI:** Update UI before API confirmation
- **Request Batching:** Combine related API calls

## Error Handling & Feedback

### Error States
- **Field Errors:** Inline validation messages
- **API Errors:** Toast notifications with details
- **Network Errors:** Offline banner with retry
- **Workflow Errors:** Step-specific error cards

### User Feedback
- **Loading States:** Skeleton screens and spinners
- **Progress Indicators:** For long operations
- **Success Confirmations:** Clear success messages
- **Help Integration:** Contextual help links

## Integration with Middleware

### State Management Integration
```javascript
// Vue component integration with Publishing Middleware
export default {
  name: 'IOSWorkflowView',
  
  data() {
    return {
      workflowState: null,
      currentStep: null,
      loading: false,
      error: null
    };
  },

  async created() {
    try {
      this.loading = true;
      
      // Initialize middleware if not already done
      if (!window.PublishingMiddleware.isInitialized) {
        await window.PublishingMiddleware.initialize({
          authToken: Fliplet.User.getAuthToken(),
          environment: Fliplet.Env.get('environment')
        });
      }
      
      // Get current workflow state
      const stateManager = window.PublishingMiddleware.getComponent('stateManager');
      this.workflowState = await stateManager.getWorkflowState('ios');
      this.currentStep = this.workflowState.currentStep;
      
    } catch (error) {
      const errorHandler = window.PublishingMiddleware.getComponent('errorHandler');
      this.error = errorHandler.getUserMessage(error);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async submitStep(stepData) {
      try {
        const controller = window.PublishingMiddleware.getController('iosPublishingController');
        await controller.processStep(this.currentStep, stepData);
        
        // Move to next step
        this.currentStep = await controller.getNextStep();
        
      } catch (error) {
        this.handleError(error);
      }
    }
  }
};
```

### Event System Integration
```javascript
// Listen for middleware events
mounted() {
  // Listen for workflow updates
  window.PublishingMiddleware.on('workflow-updated', this.handleWorkflowUpdate);
  window.PublishingMiddleware.on('step-completed', this.handleStepComplete);
  window.PublishingMiddleware.on('build-progress', this.handleBuildProgress);
  
  // Listen for errors
  window.PublishingMiddleware.on('api-error', this.handleApiError);
  window.PublishingMiddleware.on('validation-error', this.handleValidationError);
},

beforeDestroy() {
  // Clean up event listeners
  window.PublishingMiddleware.off('workflow-updated', this.handleWorkflowUpdate);
  window.PublishingMiddleware.off('step-completed', this.handleStepComplete);
  window.PublishingMiddleware.off('build-progress', this.handleBuildProgress);
  window.PublishingMiddleware.off('api-error', this.handleApiError);
  window.PublishingMiddleware.off('validation-error', this.handleValidationError);
}
```

## Component Documentation

### Component Template
```vue
<template>
  <div class="workflow-step" :class="stepClasses">
    <div class="step-header">
      <h2 class="step-title">{{ stepTitle }}</h2>
      <span class="step-status" :class="statusClass">
        {{ stepStatus }}
      </span>
    </div>
    
    <div class="step-content">
      <slot />
    </div>
    
    <div class="step-actions">
      <button
        v-if="canGoBack"
        @click="goBack"
        class="btn btn-secondary"
        :disabled="processing"
      >
        Back
      </button>
      <button
        @click="submitStep"
        class="btn btn-primary"
        :disabled="!isValid || processing"
      >
        {{ nextButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
/**
 * WorkflowStep - Base component for workflow steps
 * Vue 2.6.14 component using Options API
 *
 * @example
 * <WorkflowStep
 *   :step-name="currentStep"
 *   :is-valid="formIsValid"
 *   @submit="handleSubmit"
 *   @back="handleBack"
 * >
 *   <!-- Step content -->
 * </WorkflowStep>
 */
export default {
  name: 'WorkflowStep',

  props: {
    /**
     * Current step identifier
     * @type {String}
     * @required
     */
    stepName: {
      type: String,
      required: true
    },
    
    /**
     * Whether the step data is valid
     * @type {Boolean}
     */
    isValid: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether step is currently processing
     * @type {Boolean}
     */
    processing: {
      type: Boolean,
      default: false
    }
  },

  // Events: submit, back

  computed: {
    stepClasses() {
      return {
        'is-processing': this.processing,
        'is-complete': this.isComplete,
        'has-errors': this.hasErrors
      };
    },
    
    canGoBack() {
      // Logic to determine if back navigation is allowed
      return this.stepIndex > 0 && !this.processing;
    }
  },

  methods: {
    submitStep() {
      if (this.isValid && !this.processing) {
        this.$emit('submit');
      }
    },
    
    goBack() {
      if (this.canGoBack) {
        this.$emit('back');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.workflow-step {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  
  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .step-actions {
    display: flex;
    justify-content: space-between;
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid #e0e0e0;
  }
}
</style>
```

## Testing Strategy

### Component Testing
- **Unit Tests:** Test individual component logic and methods
- **Integration Tests:** Test component interaction with middleware
- **Visual Regression Tests:** Ensure UI consistency across changes
- **Accessibility Tests:** Automated a11y testing with jest-axe

### User Testing
- **Workflow Testing:** Complete end-to-end workflow tests
- **Error Scenario Testing:** Test all error paths
- **Device Testing:** Test on various devices and browsers
- **Performance Testing:** Measure and optimize load times

## Implementation Priorities

### Phase 1: Core Components (Week 1-2)
1. AppShell with navigation
2. Platform selector
3. Basic workflow containers
4. Form components
5. Error handling components

### Phase 2: Workflow Implementation (Week 3-4)
1. iOS workflow steps
2. Android workflow steps
3. State persistence
4. API integration
5. Validation system

### Phase 3: Advanced Features (Week 5)
1. Permission management
2. Build monitoring
3. Push notifications
4. Advanced error recovery

### Phase 4: Polish & Optimization (Week 6)
1. Performance optimization
2. Accessibility improvements
3. Animation and transitions
4. Documentation

## Success Metrics

### User Experience Metrics
- **Task Completion Rate:** 95%+ successful app submissions
- **Time to Complete:** < 10 minutes for experienced users
- **Error Rate:** < 5% user-caused errors
- **Support Tickets:** 50% reduction in publishing-related tickets

### Technical Metrics
- **Page Load Time:** < 2 seconds initial load
- **API Response Time:** < 500ms for most operations
- **Browser Support:** Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Accessibility Score:** 100% WCAG 2.1 AA compliance

### Design System Metrics
- **Component Reuse:** 80%+ shared components
- **Theme Consistency:** All components use CSS variables
- **Documentation Coverage:** 100% of components documented
- **Test Coverage:** 90%+ code coverage

## File Structure Plan

```
/src/
├── components/
│   ├── layout/
│   │   ├── AppShell.vue
│   │   ├── NavigationHeader.vue
│   │   ├── PlatformSelector.vue
│   │   └── FooterSection.vue
│   ├── pages/
│   │   ├── DashboardView.vue
│   │   ├── IOSWorkflowView.vue
│   │   ├── AndroidWorkflowView.vue
│   │   └── PermissionsView.vue
│   ├── workflows/
│   │   ├── ios/
│   │   │   ├── ApiKeyStep.vue
│   │   │   ├── BundleIdStep.vue
│   │   │   ├── CertificateStep.vue
│   │   │   ├── StoreConfigStep.vue
│   │   │   ├── MetadataStep.vue
│   │   │   └── BuildStep.vue
│   │   └── android/
│   │       ├── StoreConfigStep.vue
│   │       ├── MetadataStep.vue
│   │       ├── KeystoreStep.vue
│   │       └── BuildStep.vue
│   ├── forms/
│   │   ├── ApiKeyForm.vue
│   │   ├── CertificateForm.vue
│   │   ├── StoreConfigForm.vue
│   │   ├── MetadataForm.vue
│   │   └── FormField.vue
│   ├── ui/
│   │   ├── WorkflowStepper.vue
│   │   ├── StatusCard.vue
│   │   ├── FileUploadZone.vue
│   │   ├── LoadingSpinner.vue
│   │   └── ValidationMessage.vue
│   ├── feedback/
│   │   ├── NotificationToast.vue
│   │   ├── ConfirmDialog.vue
│   │   └── LoadingOverlay.vue
│   └── shared/
│       ├── BaseComponent.vue
│       └── ErrorBoundary.vue
├── styles/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _base.scss
│   ├── _forms.scss
│   ├── _utilities.scss
│   └── themes/
│       └── default.scss
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   └── accessibility.js
├── Application.vue
└── main.js
```

## Next Steps

This UI/UX plan should be reviewed for:
1. **User Experience:** Intuitive workflow navigation and clear error handling
2. **Visual Design:** Consistent with Fliplet's design system
3. **Technical Feasibility:** Vue.js 2.6.14 implementation within Fliplet framework
4. **Accessibility:** WCAG 2.1 AA compliance throughout
5. **Performance:** Optimal loading and smooth interactions

Once approved, this plan will be converted to implementation tasks using `generate-tasks.mdc`.