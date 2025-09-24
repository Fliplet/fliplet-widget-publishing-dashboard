# Tasks: Middleware Plan Publishing Dashboard

## Relevant Files

- `src/middleware/middleware.js` - Main entry point for the publishing middleware system
- `src/middleware/core/BaseMiddleware.js` - Foundation class providing dependency injection and common utilities
- `src/middleware/core/StateManager.js` - Centralized state management with persistence and validation
- `src/middleware/core/ValidationEngine.js` - Comprehensive data validation framework
- `src/middleware/core/ErrorHandler.js` - Error categorization, mapping, and recovery strategies
- `src/middleware/core/DataMapper.js` - Data transformation between API responses and internal state
- `src/middleware/api/ApiClient.js` - Fliplet.API.request() wrapper with authentication and retry logic
- `src/middleware/api/SubmissionApiService.js` - Submission-related API operations wrapper
- `src/middleware/api/ApiKeyService.js` - iOS API key management service
- `src/middleware/api/CertificateApiService.js` - iOS certificate management service
- `src/middleware/api/PushNotificationApiService.js` - Push notification configuration service
- `src/middleware/api/FileUploadApiService.js` - File upload operations service
- `src/middleware/controllers/WorkflowManager.js` - Central workflow orchestrator
- `src/middleware/controllers/IOSPublishingController.js` - iOS-specific publishing workflow controller
- `src/middleware/controllers/AndroidPublishingController.js` - Android-specific publishing workflow controller
- `src/middleware/controllers/PermissionController.js` - App permissions management controller
- `src/middleware/config/endpoints.js` - API endpoint definitions
- `src/middleware/config/validation-rules.js` - Validation rule configurations
- `src/middleware/config/error-messages.js` - Error message mappings
- `src/middleware/config/workflows.js` - Workflow step definitions
- `tests/middleware/core/BaseMiddleware.test.js` - Unit tests for BaseMiddleware
- `tests/middleware/core/StateManager.test.js` - Unit tests for StateManager
- `tests/middleware/core/ValidationEngine.test.js` - Unit tests for ValidationEngine
- `tests/middleware/core/ErrorHandler.test.js` - Unit tests for ErrorHandler
- `tests/middleware/api/ApiClient.test.js` - Unit tests for ApiClient
- `tests/middleware/api/SubmissionApiService.test.js` - Unit tests for SubmissionApiService
- `tests/middleware/api/ApiKeyService.test.js` - Unit tests for ApiKeyService
- `tests/middleware/controllers/WorkflowManager.test.js` - Unit tests for WorkflowManager
- `tests/middleware/controllers/IOSPublishingController.test.js` - Unit tests for IOSPublishingController
- `tests/middleware/controllers/AndroidPublishingController.test.js` - Unit tests for AndroidPublishingController
- `tests/middleware/integration/workflows.test.js` - Integration tests for complete workflows
- `tests/middleware/mocks/api-responses.js` - Mock API response data for testing
- `tests/middleware/mocks/error-scenarios.js` - Mock error scenarios for testing

### Notes

- Unit tests should be placed in the `tests/middleware/` directory structure matching the source files
- Use Jest as the testing framework - tests can be run with `npm test` or `npx jest [optional/path/to/test/file]`
- All middleware classes use vanilla JavaScript with constructor-based dependency injection
- Event system is used for loose coupling between components
- All HTTP requests must use Fliplet.API.request() as per Fliplet platform requirements

### Testing Patterns for Vanilla JavaScript + Jest

**CRITICAL:** All child classes extending BaseMiddleware must use the inheritance resolution pattern to avoid Jest module loading issues:

```javascript
// Required pattern for all child classes
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
class YourClass extends BaseMiddlewareClass { /* implementation */ }
```

**Jest Setup:**
- Remove deprecated `globals` and `transform` config for Jest 29+
- Persist global mocks between tests, only clear call history in `afterEach()`
- Use storage helpers that respect `Storage.prototype` spies for error testing

## Tasks

- [x] 1.0 Create Core Foundation Infrastructure ✅ ALL TESTS PASSING
 - [x] 1.1 Create BaseMiddleware foundation class with dependency injection, event system, and common utilities ✅
 - [x] 1.2 Implement StateManager with workflow state schema, persistence to localStorage, and state transition validation ✅
 - [x] 1.3 Build ValidationEngine with field validation, business rules, and platform-specific validation logic ✅
 - [x] 1.4 Create ErrorHandler with error categorization, user-friendly message mapping, and recovery strategies ✅
 - [x] 1.5 Implement DataMapper for API response transformation and state serialization/deserialization ✅
 - [x] 1.6 Create comprehensive unit tests for all core foundation classes (188 tests passing) ✅
- [x] 2.0 Implement API Service Layer ✅ (All 6 API services completed - 112 tests passing)
  - [x] 2.1 Create ApiClient wrapper for Fliplet.API.request() with authentication, retry logic, and custom apiUrl/auth_token support ✅ (Fixed: Corrected URL handling - Fliplet.API.request() expects base URL with trailing slash and endpoint without leading slash)
  - [x] 2.2 Implement SubmissionApiService with all submission endpoints (initialize, metadata, build, get, cancel) ✅ (23 tests passing)
  - [x] 2.3 Build ApiKeyService for iOS API key management (list, create, validate, update, delete) ✅ (25 tests passing)
  - [x] 2.4 Create CertificateApiService for iOS certificate operations (check, generate, upload, bundle IDs) ✅ (22 tests passing)
  - [x] 2.5 Implement PushNotificationApiService for both iOS and Android push configuration ✅ (21 tests passing)
  - [x] 2.6 Build FileUploadApiService for keystore, certificate, and configuration file uploads ✅ (21 tests passing)
- [x] 3.0 Build Workflow Controller System ✅ ALL TESTS PASSING
  - [x] 3.1 Create WorkflowManager as central orchestrator with step validation and state transitions ✅ (42 tests passing)
  - [x] 3.2 Implement IOSPublishingController with complete iOS workflow (API key → bundle ID → certificate → store config → metadata → push → build) ✅ (38 tests passing)
  - [x] 3.3 Build AndroidPublishingController with Android workflow (initialization → store config → metadata → keystore → push → build) ✅ (38 tests passing)
  - [x] 3.4 Create PermissionController for native app permissions management (get, update, reset) ✅ (36 tests passing)
  - [x] 3.5 Integrate workflow controllers with WorkflowManager and implement cross-workflow state management ✅
- [x] 4.0 Create Configuration Management ✅ COMPLETE
  - [x] 4.1 Create endpoints.js with all API endpoint definitions and URL templates ✅
  - [x] 4.2 Build validation-rules.js with field validation rules, format patterns, and platform-specific constraints ✅
  - [x] 4.3 Implement error-messages.js with comprehensive error code to user message mappings ✅
  - [x] 4.4 Create workflows.js with step definitions, dependencies, and progress tracking configurations ✅
  - [x] 4.5 Build main middleware.js entry point with dependency injection setup and global initialization ✅
- [ ] 5.0 Implement Comprehensive Testing Framework
  - [ ] 5.1 Create unit tests for all core foundation classes with mock dependencies and error scenario testing
  - [ ] 5.2 Build unit tests for all API service classes with mock Fliplet.API.request() responses and error handling
  - [ ] 5.3 Implement unit tests for all workflow controllers with state validation and step progression testing
  - [ ] 5.4 Create integration tests for complete iOS and Android publishing workflows with realistic data scenarios
  - [ ] 5.5 Build comprehensive mock data sets for API responses, error conditions, and state scenarios
