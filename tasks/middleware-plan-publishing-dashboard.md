# Middleware Architecture Plan: Publishing Dashboard

## Overview

This middleware system provides a comprehensive abstraction layer for the Fliplet Publishing Dashboard widget, handling complex multi-platform app publishing workflows for both iOS and Android. The system enforces sequential processing, validates data integrity, manages state transitions, and provides robust error handling while abstracting all REST API interactions from the UI layer.

## System Architecture

### Core Principles

- **Workflow Enforcement**: Sequential step validation ensures users cannot skip required configurations before proceeding to the next stage
- **Data Integrity**: Multi-layer validation system prevents invalid data from reaching the backend APIs
- **State Management**: Centralized state tracking with automatic persistence and recovery mechanisms
- **Error Handling**: Comprehensive error mapping with user-friendly messages and recovery strategies
- **API Abstraction**: Complete wrapping of Fliplet.API.request() calls with authentication and error handling

### Component Hierarchy

```
PublishingMiddleware
├── Core Foundation
│   ├── BaseMiddleware (Foundation class)
│   ├── StateManager (State persistence & transitions)
│   ├── ValidationEngine (Data validation & business rules)
│   └── ErrorHandler (Error mapping & recovery)
├── API Services
│   ├── ApiClient (Fliplet.API.request wrapper)
│   ├── SubmissionApiService (Submission CRUD operations)
│   ├── ApiKeyService (iOS API key management)
│   ├── CertificateApiService (iOS certificate management)
│   ├── PushNotificationApiService (Push config management)
│   └── FileUploadApiService (File upload operations)
├── Workflow Controllers
│   ├── WorkflowManager (Orchestrates publishing flows)
│   ├── IOSPublishingController (iOS-specific workflow)
│   ├── AndroidPublishingController (Android-specific workflow)
│   └── PermissionController (App permission management)
└── Configuration
    ├── EndpointConfig (API endpoint definitions)
    ├── ValidationRules (Validation configurations)
    └── ErrorMessages (Error message mappings)
```

## Functional Requirements

### FR1: Multi-Platform Publishing Workflow Management
**Description:** Orchestrate complete publishing workflows for iOS and Android platforms with platform-specific validation and configuration steps
**Dependencies:** StateManager, ValidationEngine, API Services
**Validation Rules:** Platform-specific field requirements, version validation, certificate validation
**Error Handling:** Platform validation errors, workflow state conflicts, dependency resolution failures

### FR2: iOS-Specific Publishing Flow
**Description:** Handle iOS publishing with API key selection, bundle ID management, certificate validation, and App Store Connect integration
**Dependencies:** ApiKeyService, CertificateApiService, SubmissionApiService
**Validation Rules:** Team ID requirements, API key format validation, certificate validity checks, bundle ID format validation
**Error Handling:** API key configuration errors, certificate generation/upload failures, App Store Connect connectivity issues

### FR3: Android-Specific Publishing Flow
**Description:** Manage Android publishing with keystore handling, version code management, and Google Play Console integration
**Dependencies:** FileUploadApiService, SubmissionApiService
**Validation Rules:** Keystore file validation, version code increment rules, bundle ID format requirements
**Error Handling:** Keystore validation failures, file upload errors, version conflicts

### FR4: State Management and Persistence
**Description:** Maintain publishing workflow state across sessions with automatic recovery and validation
**Dependencies:** ValidationEngine, ErrorHandler
**Validation Rules:** State transition validation, data consistency checks, workflow progress validation
**Error Handling:** State corruption recovery, validation conflicts, session timeout handling

### FR5: Comprehensive Validation Framework
**Description:** Multi-layer validation system covering field validation, business rules, and platform-specific requirements
**Dependencies:** StateManager, API Services
**Validation Rules:** Required field validation, format validation, cross-field dependencies, platform-specific constraints
**Error Handling:** Validation failures, business rule violations, data format errors

## Technical Architecture

### Core Foundation Classes

#### BaseMiddleware
**Purpose:** Provides foundation functionality including dependency injection, event handling, and common utilities
**Key Methods:**
- `initialize()`: Set up middleware dependencies and configuration
- `getState()`: Access current workflow state
- `emit()`: Event notification system
- `validateDependencies()`: Ensure required services are available
**Dependencies:** StateManager, ValidationEngine, ErrorHandler

#### StateManager
**Purpose:** Centralized state management with persistence, validation, and transition control
**State Schema:** Workflow progress, submission data, validation results, error states, user preferences
**Validation Rules:** State transition validation, data consistency checks, workflow completion requirements

#### ValidationEngine
**Purpose:** Comprehensive data validation covering field validation, business rules, and platform requirements
**Validation Types:** Required field validation, format validation, cross-field validation, platform-specific validation, business rule validation
**Integration:** Integrates with all controllers and API services for pre-request validation

### API Service Classes

#### ApiClient
**Purpose:** HTTP communication wrapper using Fliplet.API.request() with authentication, retry logic, and error handling
**Features:** Automatic authentication via Fliplet.Navigate.query, retry mechanism for failed requests, response transformation, error normalization
**Configuration:** Supports custom apiUrl and auth_token from Fliplet.Navigate.query as per documentation
**Implementation:** Must use Fliplet.API.request() as documented at https://developers.fliplet.com/API/core/api.html. When implementing API requests, check `Fliplet.Navigate.query` (Object):
- If `Fliplet.Navigate.query` contains `apiUrl`, then the custom apiUrl should be used by using the `{ apiUrl }` option.
- If `Fliplet.Navigate.query` contains `auth_token`, then use the custom auth token by using the `{ headers: { 'Auth-token': auth_token } }` option.

#### SubmissionApiService
**Purpose:** Wraps all submission-related API endpoints including initialization, metadata submission, and build operations
**Methods:**
- `initializeSubmission()`: POST /v2/apps/:appId/submissions/initialize
- `submitMetadata()`: PUT /v2/apps/:appId/submissions/:submissionId/metadata
- `submitStoreConfig()`: Store configuration submission
- `triggerBuild()`: POST /v2/apps/:appId/submissions/:submissionId/build
- `getSubmissions()`: GET /v2/apps/:appId/submissions
- `getLatestSubmission()`: GET /v2/apps/:appId/submissions/latest
- `getSubmissionById()`: GET /v2/apps/:appId/submissions/:submissionId
- `cancelBuild()`: DELETE /v1/apps/:appId/submissions/:submissionId
**Validation:** Request/response validation, platform-specific requirements, workflow state validation
**Error Mapping:** Maps API errors to user-friendly messages with recovery suggestions

#### ApiKeyService
**Purpose:** Manages iOS App Store Connect API key operations including creation, validation, and team management
**Methods:**
- `listApiKeys()`: GET /v2/organizations/:organizationId/credentials/api-keys
- `createApiKey()`: POST /v2/organizations/:organizationId/credentials/api-key
- `getApiKeyByTeam()`: GET /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
- `validateApiKey()`: POST /v2/organizations/:organizationId/credentials/api-key/validate
- `updateApiKeyName()`: PUT /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
- `deleteApiKey()`: DELETE /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
**Validation:** API key format validation, team ID validation, issuer ID format checks
**Error Mapping:** API key configuration errors, validation failures, permission issues

#### CertificateApiService
**Purpose:** Handles iOS certificate management including validation, generation, and upload operations
**Methods:**
- `checkCertificate()`: POST /v2/apps/:appId/submissions/:submissionId/check-certificate
- `generateCertificate()`: POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
- `uploadCertificate()`: PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
- `getBundleIds()`: GET /v2/apps/:appId/submissions/:submissionId/bundleId
- `getBundleIdDetails()`: GET /v2/apps/:appId/submissions/:submissionId/bundleId/details
**Validation:** Certificate format validation, private key validation, team ID verification
**Error Mapping:** Certificate validation errors, generation failures, upload issues

#### PushNotificationApiService
**Purpose:** Manages push notification configuration for both iOS and Android platforms
**Methods:**
- `getPushConfig()`: GET /v1/widget-instances/com.fliplet.push-notifications
- `submitPushConfig()`: PUT /v1/widget-instances/com.fliplet.push-notifications/settings
- `getTeamPushConfig()`: GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId (iOS)
**Validation:** Platform-specific push configuration validation, certificate validation for iOS, service account validation for Android
**Error Mapping:** Push configuration errors, validation failures, service connectivity issues

#### FileUploadApiService
**Purpose:** Handles file upload operations for keystores, certificates, and configuration files
**Methods:**
- `uploadFile()`: POST /v1/media/files
- `uploadKeystore()`: Specialized keystore upload and validation
- `uploadFirebaseConfig()`: Google Services file upload for Android
**Validation:** File format validation, size limits, content validation
**Error Mapping:** Upload failures, file format errors, storage issues

### Workflow Controller Classes

#### WorkflowManager
**Purpose:** Central orchestrator managing publishing workflows with step validation and state transitions
**Workflow Types:** iOS publishing workflow, Android publishing workflow, permission management workflow
**Dependencies:** Enforces sequential execution through state validation and step completion checks

#### IOSPublishingController
**Purpose:** Manages complete iOS publishing workflow with App Store Connect integration
**Steps:**
1. API key selection/creation → API key validation → Team ID configuration
2. Submission initialization → Bundle ID selection → Bundle ID validation
3. Certificate validation → Certificate generation/upload (if needed)
4. Store configuration → Version validation against App Store Connect
5. Metadata submission → App icon and splash screen validation
6. Push notification configuration (optional) → APN certificate validation
7. Build trigger → Pre-build validation and execution
**Validation:** iOS-specific requirements, App Store Connect integration, certificate validation
**State Management:** Tracks iOS workflow progress with platform-specific state properties

#### AndroidPublishingController
**Purpose:** Controls Android publishing workflow with Google Play Console integration
**Steps:**
1. Submission initialization → Platform configuration
2. Store configuration → Version code increment validation
3. Metadata submission → App icon and splash screen validation
4. Keystore upload (optional) → Keystore validation and testing
5. Push notification configuration (optional) → Firebase configuration validation
6. Build trigger → Pre-build validation and execution
**Validation:** Android-specific requirements, version code management, keystore validation
**State Management:** Tracks Android workflow progress with platform-specific state properties

#### PermissionController
**Purpose:** Manages native app permissions for both iOS and Android platforms (Admin only)
**Steps:**
1. Get current permissions → Merge defaults with custom changes
2. Update permissions → Validate platform-specific requirements
3. Reset permissions → Clear custom changes and revert to defaults
**Validation:** Platform-specific permission validation, description requirements for iOS
**State Management:** Tracks permission changes and validates against platform requirements

### Supporting Infrastructure

#### ErrorHandler
**Purpose:** Centralized error management with categorization, mapping, and recovery strategies
**Error Categories:** API errors, validation errors, network errors, business logic errors, permission errors
**Recovery Strategies:** Retry mechanisms, fallback options, user guidance, state recovery
**User Experience:** User-friendly error messages, actionable recovery steps, progress preservation

#### DataMapper
**Purpose:** Data transformation between API responses and internal state representations
**Transformations:** API response normalization, state serialization/deserialization, validation result mapping
**Validation:** Data integrity checks, format conversion validation, schema compliance

## API Integration Mapping

### Endpoint Groups

#### Submission Management (Maps to SubmissionApiService)
- **POST /v2/apps/:appId/submissions/initialize** → `initializeSubmission()`: Start publishing process
- **PUT /v2/apps/:appId/submissions/:submissionId/metadata** → `submitMetadata()`: Submit app metadata and store config
- **POST /v2/apps/:appId/submissions/:submissionId/build** → `triggerBuild()`: Start app build process
- **GET /v2/apps/:appId/submissions** → `getSubmissions()`: Retrieve submission history
- **GET /v2/apps/:appId/submissions/latest** → `getLatestSubmission()`: Get current submission
- **GET /v2/apps/:appId/submissions/:submissionId** → `getSubmissionById()`: Get specific submission
- **DELETE /v1/apps/:appId/submissions/:submissionId** → `cancelBuild()`: Cancel active build

#### iOS API Key Management (Maps to ApiKeyService)
- **GET /v2/organizations/:organizationId/credentials/api-keys** → `listApiKeys()`: List available API keys
- **POST /v2/organizations/:organizationId/credentials/api-key** → `createApiKey()`: Create new API key
- **GET /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId** → `getApiKeyByTeam()`: Get team-specific API key
- **POST /v2/organizations/:organizationId/credentials/api-key/validate** → `validateApiKey()`: Validate API key configuration
- **PUT /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId** → `updateApiKeyName()`: Update API key name
- **DELETE /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId** → `deleteApiKey()`: Remove API key

#### iOS Certificate Management (Maps to CertificateApiService)
- **POST /v2/apps/:appId/submissions/:submissionId/check-certificate** → `checkCertificate()`: Validate certificate status
- **POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate** → `generateCertificate()`: Create new certificate
- **PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate** → `uploadCertificate()`: Upload existing certificate
- **GET /v2/apps/:appId/submissions/:submissionId/bundleId** → `getBundleIds()`: List available bundle IDs
- **GET /v2/apps/:appId/submissions/:submissionId/bundleId/details** → `getBundleIdDetails()`: Get bundle ID details

#### Push Notification Management (Maps to PushNotificationApiService)
- **GET /v1/widget-instances/com.fliplet.push-notifications** → `getPushConfig()`: Get existing push config
- **PUT /v1/widget-instances/com.fliplet.push-notifications/settings** → `submitPushConfig()`: Configure push notifications
- **GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId** → `getTeamPushConfig()`: Get team push config

#### File Operations (Maps to FileUploadApiService)
- **POST /v1/media/files** → `uploadFile()`: Upload files to media library
- **PUT /v2/apps/:appId/submissions/:submissionId/keystore** → `uploadKeystore()`: Configure Android keystore

### Workflow Sequences

#### iOS Publishing Workflow (Maps to IOSPublishingController)
**Steps:**
1. API Key Selection → `ApiKeyService.listApiKeys()` → Validate team selection → Update state
2. Submission Initialization → `SubmissionApiService.initializeSubmission()` → Validate platform setup → Update state
3. Bundle ID Selection → `CertificateApiService.getBundleIds()` → User selection → `CertificateApiService.getBundleIdDetails()` → Update state
4. Certificate Validation → `CertificateApiService.checkCertificate()` → Generate/Upload if needed → Update state
5. Store Configuration → `SubmissionApiService.submitStoreConfig()` → Validate version against App Store → Update state
6. Metadata Submission → `SubmissionApiService.submitMetadata()` → Validate app assets → Update state
7. Push Configuration → `PushNotificationApiService.getPushConfig()` → Configure if needed → Update state
8. Build Trigger → `SubmissionApiService.triggerBuild()` → Monitor progress → Update state

**Dependencies:** API key must exist before initialization, bundle ID required before certificate check, certificate valid before store config
**Validation Points:** API key format, team ID validity, certificate status, version requirements, metadata completeness
**Error Handling:** API key issues redirect to key creation, certificate errors show generation/upload options, validation failures highlight specific fields

#### Android Publishing Workflow (Maps to AndroidPublishingController)
**Steps:**
1. Submission Initialization → `SubmissionApiService.initializeSubmission()` → Validate platform setup → Update state
2. Store Configuration → `SubmissionApiService.submitStoreConfig()` → Validate version codes → Update state
3. Metadata Submission → `SubmissionApiService.submitMetadata()` → Validate app assets → Update state
4. Keystore Upload → `FileUploadApiService.uploadKeystore()` → Validate keystore → Update state
5. Push Configuration → `PushNotificationApiService.submitPushConfig()` → Validate Firebase setup → Update state
6. Build Trigger → `SubmissionApiService.triggerBuild()` → Monitor progress → Update state

**Dependencies:** Store config required before metadata, metadata required before build
**Validation Points:** Version code increments, metadata completeness, keystore validity, Firebase configuration
**Error Handling:** Version conflicts show increment suggestions, keystore errors provide upload guidance, Firebase issues highlight configuration problems

## State Management Design

### State Schema
```javascript
{
  workflows: {
    ios: {
      currentStep: 'api-key-selection|initialization|bundle-selection|certificate|store-config|metadata|push-config|build',
      progress: 0-100,
      data: {
        teamId: string,
        submissionId: number,
        bundleId: string,
        apiKeyId: string,
        certificateValid: boolean,
        storeConfig: object,
        metadata: object,
        pushConfig: object
      },
      errors: [],
      isComplete: boolean,
      dependencies: ['api-key', 'bundle-id', 'certificate', 'store-config', 'metadata']
    },
    android: {
      currentStep: 'initialization|store-config|metadata|keystore|push-config|build',
      progress: 0-100,
      data: {
        submissionId: number,
        storeConfig: object,
        metadata: object,
        keystoreConfig: object,
        pushConfig: object
      },
      errors: [],
      isComplete: boolean,
      dependencies: ['store-config', 'metadata']
    }
  },
  cache: {
    'api-keys': {
      data: [],
      timestamp: string,
      ttl: 300000
    },
    'submissions': {
      data: object,
      timestamp: string,
      ttl: 60000
    }
  },
  user: {
    organizationId: number,
    selectedPlatform: 'ios|android',
    preferences: object
  },
  config: {
    endpoints: object,
    validation: object,
    retryAttempts: 3,
    requestTimeout: 30000
  }
}
```

### State Transitions
- **iOS**: api-key-selection → initialization → bundle-selection → certificate → store-config → metadata → push-config → build
- **Android**: initialization → store-config → metadata → keystore → push-config → build
- **Validation**: Each transition validates completion of current step and prerequisites for next step
- **Error Recovery**: Failed transitions maintain current state with error details for retry/correction

### Persistence Strategy
- **Local Storage**: Persist workflow state for session recovery
- **Automatic Save**: Save state after each successful step completion
- **Recovery**: Restore state on page load with validation of cached data freshness
- **Cleanup**: Clear completed workflows after 24 hours, maintain error states for debugging

## Validation Framework Design

### Validation Rules

#### Field Validation
- **Required Fields**: Platform-specific required fields (teamId for iOS, versionCode for Android)
- **Data Types**: String format validation, number range validation, boolean validation
- **Format Validation**: Email format, URL format, bundle ID format, version number format
- **Range Validation**: Version code ranges (1000-999999999), string length limits (1-30 chars for app names)

#### Business Rules
- **Cross-field Validation**: Version number must be greater than current App Store version
- **Conditional Requirements**: TeamId required for iOS, versionCode required for Android
- **Workflow Validation**: Certificate must be valid before store config submission
- **Platform Constraints**: API key required for iOS operations, keystore optional for Android

### Error Messages
```javascript
{
  'MISSING_API_KEY_CONFIGURATION': 'API key configuration missing. Please set up your App Store Connect API key.',
  'INVALID_CERTIFICATE': 'Certificate validation failed. Please check your certificate files or generate a new one.',
  'MISSING_REQUIRED_METADATA': 'Required information is missing. Please complete all required fields.',
  'FAILED_STORE_CONFIG': 'Version validation failed. New version must be higher than the current App Store version.',
  'INVALID_PUSH_CONFIG': 'Push notification configuration is invalid. Please check your settings.',
  'MAX_CERTIFICATES_REACHED': 'Maximum certificates reached. Please revoke unused certificates in App Store Connect.',
  'INSUFFICIENT_PERMISSIONS': 'API key lacks required permissions. Please check App Store Connect permissions.'
}
```

## Error Handling Strategy

### Error Categories
1. **Validation Errors**: Field validation failures, format errors, business rule violations
2. **API Errors**: Server-side errors, authentication failures, quota exceeded
3. **Network Errors**: Connection timeouts, network unavailable, DNS resolution failures
4. **Business Logic Errors**: Workflow violations, dependency conflicts, state inconsistencies

### Recovery Strategies
- **Validation Errors**: Highlight problematic fields, provide correction guidance, prevent form submission
- **API Errors**: Retry with exponential backoff, fallback to cached data when possible, user notification with action options
- **Network Errors**: Queue operations for retry, offline mode indicators, automatic retry on reconnection
- **Business Logic Errors**: State reset options, step-by-step recovery guidance, alternative workflow paths

### User Experience
- **Progressive Disclosure**: Show errors contextually at the relevant step
- **Actionable Messages**: Provide specific actions users can take to resolve issues
- **Recovery Guidance**: Step-by-step instructions for complex error scenarios
- **Status Indicators**: Clear visual feedback on validation state and error conditions

## Integration Patterns

### Dependency Injection
```javascript
// Constructor-based dependency injection
class IOSPublishingController {
  constructor(stateManager, apiKeyService, certificateService, submissionService) {
    this.stateManager = stateManager;
    this.apiKeyService = apiKeyService;
    this.certificateService = certificateService;
    this.submissionService = submissionService;
  }
}
```

### Event System
```javascript
// Event-driven communication between components
workflowManager.on('step-completed', (step, data) => {
  stateManager.updateProgress(step, data);
  validationEngine.validateNextStep(step);
});

certificateService.on('certificate-generated', (cert) => {
  workflowManager.emit('certificate-ready', cert);
});
```

### Configuration Management
```javascript
// Centralized configuration with environment-specific overrides
const config = {
  api: {
    baseUrl: 'https://api.fliplet.com',
    timeout: 30000,
    retryAttempts: 3
  },
  validation: {
    iconNameMaxLength: 30,
    versionCodeRange: [1000, 999999999]
  },
  workflows: {
    ios: ['api-key', 'initialization', 'bundle-selection', 'certificate', 'store-config', 'metadata', 'build'],
    android: ['initialization', 'store-config', 'metadata', 'build']
  }
};
```

## File Structure Plan

```
src/middleware/
├── core/
│   ├── BaseMiddleware.js
│   ├── StateManager.js
│   ├── ValidationEngine.js
│   ├── ErrorHandler.js
│   └── DataMapper.js
├── api/
│   ├── ApiClient.js
│   ├── SubmissionApiService.js
│   ├── ApiKeyService.js
│   ├── CertificateApiService.js
│   ├── PushNotificationApiService.js
│   └── FileUploadApiService.js
├── controllers/
│   ├── WorkflowManager.js
│   ├── IOSPublishingController.js
│   ├── AndroidPublishingController.js
│   └── PermissionController.js
├── config/
│   ├── endpoints.js
│   ├── validation-rules.js
│   ├── error-messages.js
│   └── workflows.js
└── middleware.js
```

## Implementation Considerations

### Development Approach
- **No Module System**: Pure vanilla JavaScript with global namespace pattern
- **Fliplet API Integration**: ALL HTTP requests must use Fliplet.API.request() (https://developers.fliplet.com/API/core/api.html)
- **Dependency Injection**: Constructor-based dependency injection for testability
- **Event-Driven**: Event system for loose coupling between components
- **Self-Documenting**: Comprehensive JSDoc documentation for all methods and classes

### Testing Strategy
- **Unit Tests**: Individual class testing with mock dependencies - one test file per class
- **Integration Tests**: End-to-end workflow testing with realistic data scenarios
- **Mock Data**: Complete mock datasets covering all API responses and error conditions
- **Error Simulation**: Comprehensive testing of all error conditions and recovery paths

### Vanilla JavaScript Testing Patterns

#### Class Inheritance Resolution
**Problem:** Child classes extending BaseMiddleware fail in Jest when BaseMiddleware isn't available during class definition.

**Solution Pattern:** All child classes should use this resolution pattern:
```javascript
// Ensure BaseMiddleware is available in Jest/jsdom environment
const ensureBaseMiddleware = () => {
  if (typeof window !== 'undefined' && window.BaseMiddleware) {
    return window.BaseMiddleware;
  }
  try {
    require('./BaseMiddleware.js');
    if (typeof window !== 'undefined' && window.BaseMiddleware) {
      return window.BaseMiddleware;
    }
  } catch (e) {}
  throw new Error('BaseMiddleware is not available');
};

const BaseMiddlewareClass = ensureBaseMiddleware();

class ChildClass extends BaseMiddlewareClass {
  // Implementation
}
```

#### Jest Configuration for Vanilla JS
- **Remove deprecated configs:** No `globals` or `transform` for Jest 29+
- **Use jsdom environment:** `testEnvironment: 'jsdom'`
- **Setup file pattern:** `setupFilesAfterEnv: ['<rootDir>/tests/setup.js']`
- **Module directories:** `moduleDirectories: ['node_modules', 'src']`

#### Required Jest Configuration
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js', '**/src/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/middleware/**/*.js', '!**/*.test.js'],
  moduleDirectories: ['node_modules', 'src'],
  clearMocks: true,
  verbose: true
};
```

#### Test Setup Patterns
**Mock Management:** Global mocks should persist between tests, only clear call history:
```javascript
// DON'T clear global.window.BaseMiddleware between tests
afterEach(() => {
  localStorage.clear();
  console.warn.mockClear(); // Clear call history only
  Fliplet.API.request.mockClear();
  // DON'T: global.window.BaseMiddleware = undefined;
});
```

#### Storage API Testing
**Pattern for localStorage spy compatibility:**
```javascript
const storageSetItem = (key, value) => {
  const hasProto = typeof Storage !== 'undefined' && Storage.prototype;
  const isProtoMocked = hasProto && (Storage.prototype.setItem)._isMockFunction === true;

  if (isProtoMocked) {
    return Storage.prototype.setItem.call(window.localStorage, key, value);
  }
  return window.localStorage.setItem(key, value);
};
```

#### Test-Implementation Contract Alignment
- **State Schema:** Tests define expected state structure; implementation must match exactly
- **Method Signatures:** Document expected method signatures in architecture plan
- **Event Contracts:** Define exactly what events are emitted with what data
- **Error Handling:** Specify exact error return patterns (boolean success, exception throwing, etc.)

### Performance Considerations
- **Caching Strategy**: API response caching with TTL, intelligent cache invalidation, cache size limits
- **State Optimization**: Lazy loading of workflow steps, minimal state updates, efficient state serialization
- **Memory Management**: Event listener cleanup, cache pruning, object reference management

## Success Metrics

### Functional Success
- **Workflow Enforcement**: Users cannot bypass required steps or submit incomplete configurations
- **Data Integrity**: Invalid data is prevented from reaching backend APIs through comprehensive validation
- **Error Recovery**: All error conditions have clear resolution paths with user guidance
- **State Consistency**: Application state remains valid across page reloads and session recovery

### Technical Success
- **API Abstraction**: UI components never directly call REST APIs, all communication goes through middleware
- **Code Reusability**: Middleware components can be reused across different Fliplet widgets and projects
- **Maintainability**: Clear separation of concerns with well-documented interfaces and dependencies
- **Testability**: All components have comprehensive test coverage with easy mock integration

## Next Steps

This architecture plan should be reviewed for:
1. **Completeness**: All API endpoints and workflows are properly covered and mapped
2. **Accuracy**: Component relationships and data flows correctly represent the system requirements
3. **Feasibility**: Implementation approach is technically sound and achievable with vanilla JavaScript
4. **Scalability**: Architecture can accommodate future enhancements and additional publishing platforms

Once approved, this plan will be converted to implementation tasks using `generate-tasks.mdc`.
