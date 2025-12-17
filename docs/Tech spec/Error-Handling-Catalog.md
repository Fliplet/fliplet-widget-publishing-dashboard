# Error Handling Catalog

## Introduction

This catalog serves as the single source of truth for all error handling in the Publishing Dashboard feature. Each error entry includes:

- **Error Code**: The technical error identifier returned by the API
- **HTTP Status**: The HTTP status code (400, 403, 404, 500)
- **User-Friendly Message**: Exact copy to display in the UI
- **Why It Happened**: Explanation for users
- **How to Fix**: Actionable steps to resolve the error
- **UI Behavior**: How and where to display the error
- **Links**: Documentation URLs for additional help
- **Is Retryable**: Whether the user can retry the action

## How to Use This Catalog

1. **For Developers**: Use the error code to map API responses to user-friendly messages
2. **For UI/UX**: Reference the UI Behavior section for display patterns
3. **For Support**: Use the "How to Fix" section to guide users
4. **For Testing**: Use this catalog to create comprehensive error test cases

---

## Error Categories

### 1. Initialization Errors

#### ERROR - Missing Parameters
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Platform and type are required"
- **Why It Happened**: The request is missing required fields (platform or type)
- **How to Fix**: 
  - Ensure both `platform` and `type` fields are included in the request
  - Platform must be "android" or "ios"
  - Type must be "appStore"
- **UI Behavior**: Show inline validation error on the initialization form, highlight missing fields
- **Links**: None
- **Is Retryable**: Yes (after fixing the form)

#### ERROR - Invalid Platform
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Invalid platform. Must be either Android or iOS"
- **Why It Happened**: The platform value provided is not "android" or "ios"
- **How to Fix**: 
  - Select a valid platform from the dropdown (Android or iOS)
  - Ensure the platform value matches exactly: "android" or "ios"
- **UI Behavior**: Show inline validation error on platform selection field
- **Links**: None
- **Is Retryable**: Yes (after selecting valid platform)

#### ERROR - Invalid Type
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Invalid type. Must be appStore"
- **Why It Happened**: The type value is not "appStore"
- **How to Fix**: 
  - Use "appStore" as the type value
  - This is automatically set by the UI, but if manually calling API, ensure correct value
- **UI Behavior**: Show error banner at top of form (this should not happen in normal UI flow)
- **Links**: None
- **Is Retryable**: Yes

#### ERROR - Missing Team ID for iOS
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Team ID is required for iOS platform"
- **Why It Happened**: iOS platform requires a Team ID, but it was not provided
- **How to Fix**: 
  - Select an API key that includes a Team ID
  - Or create a new API key with Team ID information
- **UI Behavior**: Show inline validation error on API key selection field, disable "Initialize" button until Team ID is available
- **Links**: [API Key Setup Documentation](#)
- **Is Retryable**: Yes (after selecting API key with Team ID)

#### ERROR - Invalid API Key
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "API key not found for the specified Team ID and API Key ID"
- **Why It Happened**: The selected Team ID doesn't have a valid API key configured
- **How to Fix**: 
  - Verify the API key exists for this Team ID in organization settings
  - Create a new API key if one doesn't exist
  - Contact your organization admin if you don't have permission to create API keys
- **UI Behavior**: Show error banner with link to API key management, offer "Create API Key" button
- **Links**: [API Key Management](#), [How to Create API Keys](#)
- **Is Retryable**: Yes (after creating/selecting valid API key)

#### ERROR - Submission Already Exists
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "A submission {submissionId} for this app and platform is already in progress, please complete the existing submission or cancel it if you want to create a new one"
- **Why It Happened**: There's already an active submission for this app and platform
- **How to Fix**: 
  - Option 1: Continue with the existing submission (click "Resume build")
  - Option 2: Cancel the existing submission first, then create a new one
- **UI Behavior**: Show prominent banner with submission ID, "View existing submission" and "Cancel and start new" buttons
- **Links**: [View Submission](#), [Cancel Build](#)
- **Is Retryable**: No (must resolve existing submission first)

---

### 2. API Key Errors (iOS)

#### MISSING_API_KEY_CONFIGURATION
- **Error Code**: `MISSING_API_KEY_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Required API key information is missing"
- **Why It Happened**: One or more required API key fields (keyId, issuerId, teamId, apiKey, name) are missing
- **How to Fix**: 
  - Fill in all required fields: Key ID, Issuer ID, Team ID, API Key (p8 file), and Name
  - Ensure all fields are complete before saving
- **UI Behavior**: Show inline validation errors on missing fields, highlight empty required fields in red
- **Links**: [How to Get API Key Information](#)
- **Is Retryable**: Yes (after filling missing fields)

#### FAILED_API_KEY_CONFIGURATION
- **Error Code**: `FAILED_API_KEY_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "API key validation failed. Please check your API key details and try again."
- **Why It Happened**: The API key provided is invalid or doesn't have the required permissions
- **How to Fix**: 
  - Verify the API key (p8 file) is correct and not corrupted
  - Check that the Key ID, Issuer ID, and Team ID match your App Store Connect account
  - Ensure the API key has the required permissions in App Store Connect
  - Try generating a new API key in App Store Connect
- **UI Behavior**: Show error card with detailed explanation, offer "Validate API Key" button to test before saving
- **Links**: [App Store Connect API Keys Guide](#), [API Key Permissions](#)
- **Is Retryable**: Yes (after correcting API key details)

#### API Key Not Found (404)
- **Error Code**: `MISSING_API_KEY_CONFIGURATION`
- **HTTP Status**: `404`
- **User-Friendly Message**: "API key configuration not found for this Team ID"
- **Why It Happened**: The requested API key doesn't exist in the system
- **How to Fix**: 
  - Create a new API key for this Team ID
  - Or select a different Team ID that has an API key configured
- **UI Behavior**: Show empty state with "Create API Key" button
- **Links**: [Create API Key](#)
- **Is Retryable**: No (must create API key first)

#### Error Retrieving API Keys
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Unable to load API keys. Please try again."
- **Why It Happened**: There was an error retrieving the list of API keys from the server
- **How to Fix**: 
  - Refresh the page
  - Check your internet connection
  - Contact support if the issue persists
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

#### Error Deleting API Key
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Unable to delete API key. It may be in use by an active submission."
- **Why It Happened**: The API key cannot be deleted, possibly because it's being used by an active build
- **How to Fix**: 
  - Wait for any active builds using this API key to complete
  - Cancel any in-progress submissions using this API key
  - Then try deleting again
- **UI Behavior**: Show error modal with list of active submissions using this key (if available)
- **Links**: [View Active Submissions](#)
- **Is Retryable**: Yes (after resolving dependencies)

---

### 3. Certificate Errors (iOS)

#### INVALID_CERTIFICATE
- **Error Code**: `INVALID_CERTIFICATE`
- **HTTP Status**: `400`
- **User-Friendly Message**: "The certificate provided is not valid. Please check your certificate and private key files."
- **Why It Happened**: The certificate or private key is invalid, expired, or doesn't match
- **How to Fix**: 
  - Verify the certificate and private key files are correct and not corrupted
  - Ensure the certificate hasn't expired
  - Check that the private key matches the certificate
  - Try generating a new certificate or uploading different files
- **UI Behavior**: Show error card in certificate step with "Generate New Certificate" and "Upload Certificate" options
- **Links**: [Certificate Troubleshooting Guide](#), [How to Generate Certificates](#)
- **Is Retryable**: Yes

#### MISSING_CERTIFICATE_CONFIGURATION
- **Error Code**: `MISSING_CERTIFICATE_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Please provide both certificate and private key files."
- **Why It Happened**: Either the certificate or private key file is missing from the upload
- **How to Fix**: 
  - Upload both the certificate (.cer or .p12) and private key files
  - If using a .p12 file, it should contain both certificate and private key
- **UI Behavior**: Show inline validation error on file upload fields, highlight missing file
- **Links**: [Certificate Upload Guide](#)
- **Is Retryable**: Yes (after uploading both files)

#### MAX_CERTIFICATES_REACHED
- **Error Code**: `MAX_CERTIFICATES_REACHED`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Maximum number of certificates reached. Please revoke unused certificates in App Store Connect and try again."
- **Why It Happened**: Apple limits the number of distribution certificates per team (typically 3)
- **How to Fix**: 
  - Go to App Store Connect → Certificates
  - Revoke any expired or unused distribution certificates
  - Return and click "Generate New Certificate" again
  - Alternatively, upload an existing certificate instead of generating a new one
- **UI Behavior**: Show error card with step-by-step instructions, "Open App Store Connect" link, and "I've revoked a certificate" confirmation button
- **Links**: [App Store Connect Certificates](#), [Certificate Limits](#)
- **Is Retryable**: Yes (after revoking certificates)

#### INSUFFICIENT_PERMISSIONS
- **Error Code**: `INSUFFICIENT_PERMISSIONS`
- **HTTP Status**: `400`
- **User-Friendly Message**: "The API key doesn't have permission to create certificates. Please check API key permissions in App Store Connect."
- **Why It Happened**: The API key lacks the "Certificates" permission in App Store Connect
- **How to Fix**: 
  - Go to App Store Connect → Users and Access → Keys
  - Edit your API key
  - Enable "Certificates" permission
  - Save and try again
- **UI Behavior**: Show error card with link to App Store Connect and permission checklist
- **Links**: [App Store Connect API Key Permissions](#)
- **Is Retryable**: Yes (after updating permissions)

#### FAILED_CERTIFICATE_CONFIGURATION
- **Error Code**: `FAILED_CERTIFICATE_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Failed to generate certificate. Please try again or upload a certificate manually."
- **Why It Happened**: There was an error communicating with Apple's servers or processing the certificate
- **How to Fix**: 
  - Wait a moment and try generating again
  - Check your internet connection
  - If it continues to fail, upload your own certificate instead
- **UI Behavior**: Show error card with "Retry" and "Upload Certificate" buttons
- **Links**: [Certificate Upload Guide](#)
- **Is Retryable**: Yes

#### Missing Team ID (Certificate)
- **Error Code**: `MISSING_API_KEY_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Team ID is required for iOS platform"
- **Why It Happened**: The submission is missing Team ID information needed for certificate operations
- **How to Fix**: 
  - Ensure you've selected an API key with a Team ID
  - Re-initialize the submission with the correct Team ID
- **UI Behavior**: Show error banner, redirect to API key selection step
- **Links**: None
- **Is Retryable**: Yes (after selecting API key)

#### INVALID_PLATFORM (Certificate Check)
- **Error Code**: `INVALID_PLATFORM`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Certificate check is only available for iOS"
- **Why It Happened**: Certificate operations are iOS-specific, but the request was made for Android
- **How to Fix**: This error should not occur in normal UI flow. If it does, contact support.
- **UI Behavior**: Show error toast (this is a system error)
- **Links**: None
- **Is Retryable**: No

---

### 4. Bundle ID Errors (iOS)

#### MISSING_BUNDLE_ID
- **Error Code**: `MISSING_BUNDLE_ID`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Bundle ID is required"
- **Why It Happened**: The bundle ID parameter was not provided in the request
- **How to Fix**: 
  - Select a bundle ID from the dropdown list
  - If no bundle IDs are available, ensure your API key has access to App Store Connect apps
- **UI Behavior**: Show inline validation error on bundle ID selection field
- **Links**: None
- **Is Retryable**: Yes (after selecting bundle ID)

#### APP_NOT_FOUND
- **Error Code**: `APP_NOT_FOUND`
- **HTTP Status**: `404`
- **User-Friendly Message**: "App with bundle ID {bundleId} not found in App Store Connect"
- **Why It Happened**: The bundle ID doesn't exist in your App Store Connect account, or the API key doesn't have access to it
- **How to Fix**: 
  - Verify the bundle ID exists in App Store Connect
  - Check that your API key has access to this app
  - Create the app in App Store Connect if it doesn't exist
  - Select a different bundle ID if this one is incorrect
- **UI Behavior**: Show error card with "Create App in App Store Connect" link and "Select Different Bundle ID" button
- **Links**: [App Store Connect Apps](#), [How to Create an App](#)
- **Is Retryable**: Yes (after creating app or selecting different bundle ID)

#### MISSING_API_KEY_CONFIGURATION (Bundle ID)
- **Error Code**: `MISSING_API_KEY_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "API key configuration not found or missing Team ID"
- **Why It Happened**: Cannot retrieve bundle IDs because API key or Team ID is missing
- **How to Fix**: 
  - Ensure an API key is selected with a valid Team ID
  - Re-select your API key if needed
- **UI Behavior**: Show error banner, redirect to API key selection step
- **Links**: [API Key Setup](#)
- **Is Retryable**: Yes (after selecting API key)

---

### 5. Metadata Errors

#### MISSING_REQUIRED_METADATA
- **Error Code**: `MISSING_REQUIRED_METADATA`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Required metadata field is missing: {requiredField}"
- **Why It Happened**: One or more required metadata fields (appIcon, splashScreen, fl-store-iconName) are missing
- **How to Fix**: 
  - Upload an app icon if missing
  - Upload a splash screen if missing
  - Enter an app name (icon name) if missing
  - Check the highlighted field(s) in the form
- **UI Behavior**: Show inline validation errors on missing fields, highlight empty required fields, disable "Continue" button
- **Links**: [Metadata Requirements](#)
- **Is Retryable**: Yes (after filling missing fields)

#### MISSING_REQUIRED_METADATA - Invalid Icon Name Format
- **Error Code**: `MISSING_REQUIRED_METADATA`
- **HTTP Status**: `400`
- **User-Friendly Message**: "App Label Text must start with a letter and can only contain letters, numbers, spaces, hyphens, underscores, dots, parentheses, and square brackets. It must end with a letter or number."
- **Why It Happened**: The app name (icon name) doesn't follow Apple's naming requirements
- **How to Fix**: 
  - Start the name with a letter (A-Z, a-z)
  - Use only allowed characters: letters, numbers, spaces, hyphens (-), underscores (_), dots (.), parentheses (), square brackets []
  - End with a letter or number (not a space or special character)
  - Example: "My App" ✓, "My App!" ✗, " My App" ✗
- **UI Behavior**: Show inline validation error with character requirements, real-time validation as user types
- **Links**: [App Name Guidelines](#)
- **Is Retryable**: Yes (after correcting name format)

#### MISSING_REQUIRED_METADATA - Invalid Icon Name Length
- **Error Code**: `MISSING_REQUIRED_METADATA`
- **HTTP Status**: `400`
- **User-Friendly Message**: "App Label Text must be between 1 and 30 characters"
- **Why It Happened**: The app name is either empty or longer than 30 characters
- **How to Fix**: 
  - Ensure the name has at least 1 character
  - Shorten the name to 30 characters or less
  - Character count should be visible in the UI
- **UI Behavior**: Show inline validation error with character counter (e.g., "15/30 characters"), highlight if over limit
- **Links**: None
- **Is Retryable**: Yes (after adjusting name length)

#### MISSING_REQUIRED_METADATA - Invalid Validation Type
- **Error Code**: `MISSING_REQUIRED_METADATA`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Invalid validation type. Must be APP_METADATA or STORE_CONFIG"
- **Why It Happened**: The validationType parameter is incorrect (system error, should not happen in UI)
- **How to Fix**: This is a system error. Refresh the page and try again. If it persists, contact support.
- **UI Behavior**: Show error toast
- **Links**: None
- **Is Retryable**: Yes

#### ERROR - Failed to Submit Metadata
- **Error Code**: `ERROR`
- **HTTP Status**: `500`
- **User-Friendly Message**: "Failed to save metadata. Please try again."
- **Why It Happened**: There was a server error while saving metadata
- **How to Fix**: 
  - Wait a moment and try again
  - Check your internet connection
  - If it continues to fail, contact support
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

---

### 6. Store Configuration Errors

#### MISSING_REQUIRED_STORE_CONFIG
- **Error Code**: `MISSING_REQUIRED_STORE_CONFIG`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Required store configuration field is missing: {requiredField}"
- **Why It Happened**: One or more required store config fields (fl-store-bundleId, fl-store-versionNumber, fl-store-versionCode for Android) are missing
- **How to Fix**: 
  - Select a bundle ID if missing
  - Enter a version number if missing
  - For Android, enter a version code if missing
  - Check the highlighted field(s) in the form
- **UI Behavior**: Show inline validation errors on missing fields, highlight empty required fields
- **Links**: [Store Configuration Guide](#)
- **Is Retryable**: Yes (after filling missing fields)

#### MISSING_REQUIRED_STORE_CONFIG - Missing Team ID
- **Error Code**: `MISSING_REQUIRED_STORE_CONFIG`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Team ID is required"
- **Why It Happened**: The submission is missing Team ID information (iOS only)
- **How to Fix**: 
  - Ensure you've selected an API key with a Team ID
  - Re-initialize the submission if needed
- **UI Behavior**: Show error banner, redirect to API key selection step
- **Links**: None
- **Is Retryable**: Yes (after selecting API key)

#### MISSING_REQUIRED_STORE_CONFIG - Missing Credentials
- **Error Code**: `MISSING_REQUIRED_STORE_CONFIG`
- **HTTP Status**: `400`
- **User-Friendly Message**: "This submission requires credentials, but they have not been set. Please configure certificates first."
- **Why It Happened**: Certificate configuration is missing (iOS only)
- **How to Fix**: 
  - Go back to the certificate step
  - Generate or upload a certificate
  - Then return to store configuration
- **UI Behavior**: Show error card with "Go to Certificate Step" button
- **Links**: [Certificate Setup](#)
- **Is Retryable**: Yes (after configuring certificate)

#### FAILED_STORE_CONFIG - Invalid Version
- **Error Code**: `FAILED_STORE_CONFIG`
- **HTTP Status**: `400`
- **User-Friendly Message**: "New version ({newVersion}) must be greater than current version ({currentVersion})"
- **Why It Happened**: The version number you entered is not higher than the current version in the app store
- **How to Fix**: 
  - Enter a version number higher than {currentVersion}
  - For example, if current is "1.0.25", use "1.0.26" or "1.1.0"
  - Version numbers should increment (e.g., 1.0 → 1.1 → 1.2)
- **UI Behavior**: Show inline validation error with current version displayed, suggest next valid version
- **Links**: [Version Numbering Guide](#)
- **Is Retryable**: Yes (after entering higher version)

#### APP_NOT_FOUND (Store Config)
- **Error Code**: `APP_NOT_FOUND`
- **HTTP Status**: `400`
- **User-Friendly Message**: "App with bundle ID {bundleId} not found in app store"
- **Why It Happened**: The bundle ID doesn't exist in App Store Connect, or API key doesn't have access
- **How to Fix**: 
  - Verify the bundle ID exists in App Store Connect
  - Create the app in App Store Connect if needed
  - Select a different bundle ID
- **UI Behavior**: Show error card with "Create App in App Store Connect" link
- **Links**: [App Store Connect Apps](#)
- **Is Retryable**: Yes (after creating app)

#### ERROR - Bundle ID Validation Failed
- **Error Code**: `ERROR`
- **HTTP Status**: `500`
- **User-Friendly Message**: "Failed to validate bundle ID configuration. Please try again."
- **Why It Happened**: There was an error communicating with App Store Connect to validate the bundle ID
- **How to Fix**: 
  - Wait a moment and try again
  - Check your internet connection
  - Verify your API key is still valid
  - If it continues to fail, contact support
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

---

### 7. Push Notification Errors

#### MISSING_PUSH_CONFIGURATION
- **Error Code**: `MISSING_PUSH_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Required push notification configuration is missing: {requiredField}"
- **Why It Happened**: One or more required push notification fields are missing
- **How to Fix**: 
  - **For iOS**: Provide APN Key ID, APN Topic (bundle ID), APN Team ID, and APN Auth Key
  - **For Android**: Provide Project ID, Server Key (or Service Account), Sender ID, and upload google-services.json
  - Check the highlighted field(s) in the form
- **UI Behavior**: Show inline validation errors on missing fields, highlight empty required fields
- **Links**: [iOS Push Setup Guide](#), [Android Push Setup Guide](#)
- **Is Retryable**: Yes (after filling missing fields)

#### FAILD_PUSH_CONFIGURATION
- **Error Code**: `FAILD_PUSH_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "There was an issue saving push notification configuration. Please try again."
- **Why It Happened**: There was an error saving the push configuration to the database
- **How to Fix**: 
  - Wait a moment and try saving again
  - Check your internet connection
  - If it continues to fail, contact support
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

#### INVALID_PUSH_CONFIG
- **Error Code**: `INVALID_PUSH_CONFIG`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Push notification configuration is not valid. {specificReason}"
- **Why It Happened**: The push configuration failed validation (e.g., invalid keys, mismatched project IDs, expired certificates)
- **How to Fix**: 
  - **For iOS**: 
    - Verify APN Key ID, Team ID, and Auth Key are correct
    - Ensure the Auth Key (p8 file) is valid and not expired
    - Check that the Topic (bundle ID) matches your app
  - **For Android**: 
    - Verify Project ID matches the one in google-services.json
    - Check that Service Account credentials are correct
    - Ensure google-services.json file is valid and contains the correct bundle ID
- **UI Behavior**: Show error card with specific validation failure reason, offer "Test Configuration" button
- **Links**: [Push Configuration Validation](#), [iOS Push Troubleshooting](#), [Android Push Troubleshooting](#)
- **Is Retryable**: Yes (after correcting configuration)

#### INVALID_PUSH_CONFIG - Project ID Mismatch (Android)
- **Error Code**: `INVALID_PUSH_CONFIG`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Project ID in google-services.json does not match the project ID in the push notification configuration"
- **Why It Happened**: The Project ID entered doesn't match the one in the uploaded google-services.json file
- **How to Fix**: 
  - Extract the Project ID from your google-services.json file
  - Use that exact Project ID in the configuration form
  - Or upload the correct google-services.json file that matches your Project ID
- **UI Behavior**: Show error card with both Project IDs displayed for comparison
- **Links**: [How to Find Project ID](#)
- **Is Retryable**: Yes (after matching Project IDs)

#### MISSING_PUSH_CONFIGURATION (Build)
- **Error Code**: `MISSING_PUSH_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Push notification configuration not found. Please configure push notifications before building."
- **Why It Happened**: Push notifications are required but haven't been configured yet
- **How to Fix**: 
  - Go to the Push Notifications step
  - Configure push notifications for your platform
  - Then return to build
- **UI Behavior**: Show error card with "Go to Push Notifications Step" button
- **Links**: [Push Notification Setup](#)
- **Is Retryable**: Yes (after configuring push notifications)

---

### 8. Build Errors

#### BUILD_FAILED - Invalid Status
- **Error Code**: `BUILD_FAILED`
- **HTTP Status**: `400`
- **User-Friendly Message**: "You cannot submit this build, as it is already completed."
- **Why It Happened**: Attempting to trigger a build that has already been completed
- **How to Fix**: 
  - View the completed build details
  - If you need a new build, create a new submission
- **UI Behavior**: Show info banner (not an error), disable "Build" button, show "View Build Details" and "Start New Build" buttons
- **Links**: [View Build Details](#)
- **Is Retryable**: No (must create new submission)

#### INVALID_BUILD_STATUS - No Production App
- **Error Code**: `INVALID_BUILD_STATUS`
- **HTTP Status**: `400`
- **User-Friendly Message**: "You need to publish this app first. Go to 'Step 1. Prepare your app' to publish your app."
- **Why It Happened**: The app hasn't been published to production yet (missing productionAppId)
- **How to Fix**: 
  - Go to "Step 1. Prepare your app" in the publishing flow
  - Publish the app to production
  - Then return to build
- **UI Behavior**: Show error card with "Go to Step 1" button
- **Links**: [Publish App Guide](#)
- **Is Retryable**: Yes (after publishing app)

#### MISSING_REQUIRED_METADATA (Build)
- **Error Code**: `MISSING_REQUIRED_METADATA`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Required fields are missing for build. Please ensure all required metadata and store configuration fields are provided. Missing: {missingFields}"
- **Why It Happened**: One or more required steps haven't been completed (metadata, store config, etc.)
- **How to Fix**: 
  - Review the build checklist
  - Complete any missing steps:
    - Submit metadata (app icon, splash screen, app name)
    - Submit store configuration (bundle ID, version number)
    - Configure certificates (iOS) or keystore (Android)
    - Configure push notifications (if required)
- **UI Behavior**: Show error card with checklist of completed/missing steps, link to each incomplete step
- **Links**: [Build Requirements Checklist](#)
- **Is Retryable**: Yes (after completing missing steps)

#### MISSING_CERTIFICATE_CONFIGURATION (Build)
- **Error Code**: `MISSING_CERTIFICATE_CONFIGURATION`
- **HTTP Status**: `400`
- **User-Friendly Message**: "This submission requires credentials, but they have not been set. Please configure certificates first."
- **Why It Happened**: Certificate/keystore configuration is missing (required for build)
- **How to Fix**: 
  - **For iOS**: Go to certificate step, generate or upload a certificate
  - **For Android**: Go to keystore step, upload a keystore or let the system generate one
- **UI Behavior**: Show error card with "Go to Certificate/Keystore Step" button
- **Links**: [Certificate Setup](#), [Keystore Setup](#)
- **Is Retryable**: Yes (after configuring certificates/keystore)

#### BUILD_FAILED - Server Error
- **Error Code**: `BUILD_FAILED`
- **HTTP Status**: `500`
- **User-Friendly Message**: "Failed to trigger build process. Please try again."
- **Why It Happened**: There was a server error while triggering the build
- **How to Fix**: 
  - Wait a moment and try again
  - Check your internet connection
  - If it continues to fail, contact support with the submission ID
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

#### Billing Validation Failed
- **Error Code**: `BILLING_ERROR` (implied)
- **HTTP Status**: `403`
- **User-Friendly Message**: "Your current plan does not allow publishing this type of app"
- **Why It Happened**: Your subscription plan doesn't include the required features for this build
- **How to Fix**: 
  - Upgrade your plan to one that supports app publishing
  - Contact your account manager or support for plan options
  - Check your plan limits in account settings
- **UI Behavior**: Show error modal with "Upgrade Plan" button and plan comparison, don't allow retry until plan is upgraded
- **Links**: [Pricing Plans](#), [Contact Sales](#)
- **Is Retryable**: No (must upgrade plan first)

---

### 9. Keystore Errors (Android)

#### INVALID_KEYSTORE
- **Error Code**: `INVALID_KEYSTORE`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Invalid keystore file or incorrect password. Please check your keystore file and password."
- **Why It Happened**: The keystore file is corrupted, invalid, or the password is incorrect
- **How to Fix**: 
  - Verify the keystore file is not corrupted
  - Double-check the keystore password is correct
  - Try opening the keystore with the password using keytool to verify
  - If the password is lost, you'll need to use a different keystore or contact support
- **UI Behavior**: Show error card with "Test Keystore" button, highlight password field
- **Links**: [Keystore Troubleshooting](#), [How to Verify Keystore](#)
- **Is Retryable**: Yes (after correcting password or uploading valid keystore)

#### DOWNLOAD_ERROR
- **Error Code**: `DOWNLOAD_ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Failed to download keystore file. Please try uploading again."
- **Why It Happened**: There was an error downloading the keystore file from storage
- **How to Fix**: 
  - Try uploading the keystore file again
  - Check your internet connection
  - Ensure the file wasn't deleted or moved
  - If it continues to fail, contact support
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

#### INVALID_PLATFORM (Keystore)
- **Error Code**: `INVALID_PLATFORM`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Keystore upload is only available for Android"
- **Why It Happened**: Keystore operations are Android-specific, but the request was made for iOS
- **How to Fix**: This error should not occur in normal UI flow. If it does, contact support.
- **UI Behavior**: Show error toast (this is a system error)
- **Links**: None
- **Is Retryable**: No

#### Missing Parameters (Keystore)
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Missing required parameters: keystore file and password are required"
- **Why It Happened**: Either the keystore file or password is missing
- **How to Fix**: 
  - Upload a keystore file
  - Enter the keystore password
  - Ensure both fields are filled
- **UI Behavior**: Show inline validation errors on missing fields
- **Links**: None
- **Is Retryable**: Yes (after filling missing fields)

---

### 10. Permission Errors (Admin Only)

#### Permission JSON is not valid
- **Error Code**: `INVALID_JSON`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Permission configuration is not valid. Please check the JSON format."
- **Why It Happened**: The permission JSON structure is invalid or malformed
- **How to Fix**: 
  - Check the JSON syntax (valid brackets, commas, quotes)
  - Ensure all permission objects have the required structure
  - For iOS: each permission needs both "string" and "enable" fields
  - For Android: each permission needs "enable" field
  - Use the "Reset to Default" button to restore valid structure
- **UI Behavior**: Show error card with JSON validation details, highlight syntax errors in editor
- **Links**: [Permission JSON Structure](#)
- **Is Retryable**: Yes (after fixing JSON)

#### Permission JSON is missing fields
- **Error Code**: `MISSING_FIELDS`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Permission configuration is missing required fields: {requiredFields}"
- **Why It Happened**: One or more required permission fields are missing from the JSON
- **How to Fix**: 
  - Add the missing permission fields listed in the error
  - Ensure all platform-specific permissions are included
  - Use the default structure as a reference
- **UI Behavior**: Show error card with list of missing fields, highlight in editor
- **Links**: [Required Permissions List](#)
- **Is Retryable**: Yes (after adding missing fields)

#### Error Getting App Permissions
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Unable to load app permissions. Please try again."
- **Why It Happened**: There was an error retrieving permission configuration
- **How to Fix**: 
  - Refresh the page
  - Check your internet connection
  - Contact support if the issue persists
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

#### Error Resetting App Permissions
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Unable to reset permissions to default. Please try again."
- **Why It Happened**: There was an error resetting permissions
- **How to Fix**: 
  - Wait a moment and try again
  - If it continues to fail, contact support
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

---

### 11. File Upload Errors

#### No Files Were Uploaded
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "No files were uploaded. Please select a file and try again."
- **Why It Happened**: The file upload request didn't include any files
- **How to Fix**: 
  - Select a file to upload
  - Click "Upload" button
  - Ensure the file selection dialog completed successfully
- **UI Behavior**: Show inline validation error on file input field
- **Links**: None
- **Is Retryable**: Yes (after selecting file)

#### Filename is Required
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "File name is required"
- **Why It Happened**: The file name parameter is missing from the upload request
- **How to Fix**: This is a system error. Try uploading the file again. If it persists, contact support.
- **UI Behavior**: Show error toast
- **Links**: None
- **Is Retryable**: Yes

#### File with Invalid Name Detected
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "File name contains invalid characters. Please rename the file and try again."
- **Why It Happened**: The file name contains characters that are not allowed
- **How to Fix**: 
  - Rename the file to remove special characters
  - Use only letters, numbers, hyphens, underscores, and dots
  - Avoid spaces and special characters like /, \, :, *, ?, ", <, >, |
- **UI Behavior**: Show inline validation error with allowed characters list
- **Links**: [File Naming Guidelines](#)
- **Is Retryable**: Yes (after renaming file)

#### Storage Limit Exceeded
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Your current plan is limited to {limit}MB of uploaded files. Please upgrade your plan or delete unused files."
- **Why It Happened**: You've reached the storage limit for your subscription plan
- **How to Fix**: 
  - Delete unused files from your media library
  - Upgrade your plan to increase storage limits
  - Contact support for storage options
- **UI Behavior**: Show error modal with storage usage, "Manage Files" and "Upgrade Plan" buttons
- **Links**: [Storage Management](#), [Pricing Plans](#)
- **Is Retryable**: No (must free up space or upgrade)

#### Font Files Location Error
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Font files can only be uploaded to apps. Please upload them to an app folder instead."
- **Why It Happened**: Font files were uploaded to an organization or folder instead of an app
- **How to Fix**: 
  - Navigate to the app's media folder
  - Upload the font file there instead
- **UI Behavior**: Show error card with "Go to App Media" button
- **Links**: [Media Management Guide](#)
- **Is Retryable**: Yes (after navigating to correct location)

#### Missing Location Parameter
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Please specify where to upload the file (app, organization, or folder)."
- **Why It Happened**: The upload request is missing appId, organizationId, or folderId
- **How to Fix**: This is a system error. Refresh the page and try again. If it persists, contact support.
- **UI Behavior**: Show error toast
- **Links**: None
- **Is Retryable**: Yes

---

### 12. General Errors

#### PLATFORM_REQUIRED
- **Error Code**: `PLATFORM_REQUIRED`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Platform parameter is required"
- **Why It Happened**: The platform query parameter is missing from the request
- **How to Fix**: This is a system error. Refresh the page and try again.
- **UI Behavior**: Show error toast
- **Links**: None
- **Is Retryable**: Yes

#### INVALID_PLATFORM
- **Error Code**: `INVALID_PLATFORM`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Invalid platform. Must be either Android or iOS"
- **Why It Happened**: The platform value is not "android" or "ios"
- **How to Fix**: This is a system error. Refresh the page and try again.
- **UI Behavior**: Show error toast
- **Links**: None
- **Is Retryable**: Yes

#### INVALID_STATUS
- **Error Code**: `INVALID_STATUS`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Invalid status. Must be one of: started, submitted, queued, processing, ready-for-testing, tested, completed, failed, cancelled"
- **Why It Happened**: An invalid status value was provided in a filter query
- **How to Fix**: Use only valid status values when filtering submissions
- **UI Behavior**: Show error toast (this should not happen in normal UI flow)
- **Links**: None
- **Is Retryable**: Yes

#### Submission Not Found (404)
- **Error Code**: `NOT_FOUND`
- **HTTP Status**: `404`
- **User-Friendly Message**: "Submission not found. It may have been deleted or you don't have access to it."
- **Why It Happened**: The requested submission doesn't exist or you don't have permission to view it
- **How to Fix**: 
  - Check that the submission ID is correct
  - Verify you have access to this app
  - Navigate back to the submissions list
- **UI Behavior**: Show error page with "Back to Submissions" button
- **Links**: [View All Submissions](#)
- **Is Retryable**: No

#### Error Retrieving Submission
- **Error Code**: `ERROR`
- **HTTP Status**: `400`
- **User-Friendly Message**: "Unable to load submission. Please try again."
- **Why It Happened**: There was an error retrieving submission data from the server
- **How to Fix**: 
  - Refresh the page
  - Check your internet connection
  - If it continues to fail, contact support
- **UI Behavior**: Show error toast with retry button
- **Links**: None
- **Is Retryable**: Yes

#### Internal Server Error
- **Error Code**: `ERROR`
- **HTTP Status**: `500`
- **User-Friendly Message**: "An unexpected error occurred. Please try again. If the problem persists, contact support."
- **Why It Happened**: There was an internal server error
- **How to Fix**: 
  - Wait a moment and try again
  - Check your internet connection
  - If it continues to fail, contact support with the error details
- **UI Behavior**: Show error modal with "Retry" and "Contact Support" buttons, include error ID if available
- **Links**: [Contact Support](#)
- **Is Retryable**: Yes

---

## Error Display Guidelines

### UI Patterns for Error Display

#### 1. Inline Validation Errors
- **Use for**: Form field validation errors
- **Display**: Red text below or next to the field
- **When**: Show immediately on blur or after submit attempt
- **Example**: "App Label Text must be between 1 and 30 characters"

#### 2. Error Cards
- **Use for**: Step-level errors that block progression
- **Display**: Prominent card with icon, title, message, and action buttons
- **When**: When a step fails and user action is required
- **Example**: Certificate errors with "Generate" and "Upload" options

#### 3. Error Banners
- **Use for**: Important errors that affect the entire flow
- **Display**: Top of screen, dismissible (if appropriate)
- **When**: Errors that require immediate attention but don't block current action
- **Example**: "A submission is already in progress"

#### 4. Error Toasts
- **Use for**: Transient errors that don't require immediate action
- **Display**: Bottom or top corner, auto-dismiss after 5 seconds
- **When**: Network errors, save failures that can be retried
- **Example**: "Failed to save. Please try again."

#### 5. Error Modals
- **Use for**: Critical errors that require user acknowledgment
- **Display**: Centered modal with close/action buttons
- **When**: Billing errors, permission errors, destructive actions
- **Example**: "Your plan doesn't allow this feature"

### Error State Indicators

- **Form Fields**: Red border, red text below field
- **Steps**: Red icon (X or exclamation), "Failed" status text
- **Buttons**: Disabled state with tooltip explaining why
- **Progress Indicators**: Red progress bar or step indicator

### Error Message Best Practices

1. **Be Specific**: Include the field name or step that failed
2. **Be Actionable**: Tell users exactly what to do
3. **Be Helpful**: Provide links to documentation when relevant
4. **Be Concise**: Keep messages short but informative
5. **Be Consistent**: Use the same terminology throughout

---

## Error Recovery Patterns

### Pattern 1: Retry with Same Input
- **When**: Network errors, transient server errors
- **Action**: Show "Retry" button
- **Example**: "Failed to save. [Retry]"

### Pattern 2: Fix and Retry
- **When**: Validation errors, missing required fields
- **Action**: Highlight errors, allow user to fix, then retry
- **Example**: Form validation with inline errors

### Pattern 3: Navigate to Fix
- **When**: Missing prerequisite step
- **Action**: Show "Go to [Step Name]" button
- **Example**: "Certificate required. [Go to Certificate Step]"

### Pattern 4: Alternative Action
- **When**: Primary action failed, but alternatives exist
- **Action**: Show alternative options
- **Example**: Certificate generation failed → "Upload Certificate" option

### Pattern 5: Cannot Retry
- **When**: Billing errors, permission errors, completed states
- **Action**: Show explanation and next steps (upgrade, contact support, etc.)
- **Example**: "Plan upgrade required. [Upgrade Plan]"

---

## Error Code Reference

### Quick Lookup by Error Code

| Error Code | Category | HTTP Status | Retryable |
|------------|----------|-------------|-----------|
| `ERROR` | General | 400/500 | Usually Yes |
| `MISSING_API_KEY_CONFIGURATION` | API Key | 400/404 | Yes |
| `FAILED_API_KEY_CONFIGURATION` | API Key | 400 | Yes |
| `INVALID_CERTIFICATE` | Certificate | 400 | Yes |
| `MISSING_CERTIFICATE_CONFIGURATION` | Certificate | 400 | Yes |
| `MAX_CERTIFICATES_REACHED` | Certificate | 400 | Yes (after revoke) |
| `INSUFFICIENT_PERMISSIONS` | Certificate | 400 | Yes (after update) |
| `FAILED_CERTIFICATE_CONFIGURATION` | Certificate | 400 | Yes |
| `MISSING_BUNDLE_ID` | Bundle ID | 400 | Yes |
| `APP_NOT_FOUND` | Bundle ID | 404 | Yes (after create) |
| `MISSING_REQUIRED_METADATA` | Metadata | 400 | Yes |
| `MISSING_REQUIRED_STORE_CONFIG` | Store Config | 400 | Yes |
| `FAILED_STORE_CONFIG` | Store Config | 400 | Yes |
| `MISSING_PUSH_CONFIGURATION` | Push | 400 | Yes |
| `FAILD_PUSH_CONFIGURATION` | Push | 400 | Yes |
| `INVALID_PUSH_CONFIG` | Push | 400 | Yes |
| `INVALID_BUILD_STATUS` | Build | 400 | Depends |
| `BUILD_FAILED` | Build | 400/500 | Usually Yes |
| `INVALID_KEYSTORE` | Keystore | 400 | Yes |
| `DOWNLOAD_ERROR` | Keystore | 400 | Yes |
| `INVALID_PLATFORM` | General | 400 | Usually No |
| `PLATFORM_REQUIRED` | General | 400 | Usually No |
| `INVALID_STATUS` | General | 400 | Usually No |

---

## Notes for Implementation

1. **Error Code Mapping**: Always map API error codes to user-friendly messages using this catalog
2. **Error Context**: Include relevant context (field names, values, submission IDs) in error messages when helpful
3. **Error Logging**: Log all errors with full context for debugging, but show user-friendly messages in UI
4. **Error Recovery**: Always provide a clear path forward, even if it's "contact support"
5. **Error Prevention**: Use client-side validation to prevent errors before API calls when possible
6. **Error Testing**: Test all error scenarios documented in this catalog

---

## Document Version

- **Version**: 1.0
- **Last Updated**: 2025-01-XX
- **Maintained By**: Development Team
- **Review Frequency**: Quarterly or when new errors are added

