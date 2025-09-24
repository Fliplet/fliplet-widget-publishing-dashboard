# **API Flow**

## Table of Contents

- [Get list of submissions](#get-list-of-submissions)
- [Get latest submission](#get-latest-submission)
- [Get submission by ID](#get-submission-by-id)
- [Initialize Publishing](#initialize-publishing)
- [API Key management (For iOS Apps)](#api-key-management-for-ios-apps)
  - [User Flow for API Key Selection](#user-flow-for-api-key-selection)
    - [1. Get All API Keys (User Selection)](#1-get-all-api-keys-user-selection)
    - [2. Create New API Key (If None Available)](#2-create-new-api-key-if-none-available)
  - [System/AAB Internal Usage](#systemaab-internal-usage)
    - [3. Get API Key by Team ID (AAB Internal)](#3-get-api-key-by-team-id-aab-internal)
  - [Admin Management Operations](#admin-management-operations)
    - [4. Validate API Key (Optional)](#4-validate-api-key-optional)
    - [5. Update API Key Name (Organization Admin Only)](#5-update-api-key-name-organization-admin-only)
    - [6. Delete API Key (Organization Admin Only)](#6-delete-api-key-organization-admin-only)
- [Bundle ID details for iOS](#bundle-id-details-for-ios)
  - [Bundle ID Selection Flow](#bundle-id-selection-flow)
    - [1. Get List of Bundle IDs (New Submissions)](#1-get-list-of-bundle-ids-new-submissions)
    - [2. Get Bundle ID Details](#2-get-bundle-id-details)
- [Certificate flow for iOS](#certificate-flow-for-ios)
  - [Certificate Validation and Management Flow](#certificate-validation-and-management-flow)
    - [1. Check Certificate Status (Required)](#1-check-certificate-status-required)
    - [2. Generate New Certificate (Option 1 - If Invalid)](#2-generate-new-certificate-option-1---if-invalid)
    - [3. Upload Custom Certificate (Option 2 - If Invalid)](#3-upload-custom-certificate-option-2---if-invalid)
    - [4. Get Certificate Data (Info Display)](#4-get-certificate-data-info-display)
    - [5. Download Certificate Files (Optional)](#5-download-certificate-files-optional)
- [Upload Keystore file for Android](#upload-keystore-file-for-android)
- [Submit Store Config](#submit-store-config)
- [Submit Metadata](#submit-metadata)
- [Native App Permissions Management (Admin Only)](#native-app-permissions-management-admin-only)
  - [Permission Configuration Flow](#permission-configuration-flow)
    - [1. Get App Permissions](#1-get-app-permissions)
    - [2. Update App Permissions](#2-update-app-permissions)
    - [3. Reset App Permissions](#3-reset-app-permissions)
  - [Permission Structure](#permission-structure)
    - [Android Permissions](#android-permissions)
    - [iOS Permissions](#ios-permissions)
- [Push Notification Configuration (Optional)](#push-notification-configuration-optional)
  - [Push Configuration Flow](#push-configuration-flow)
    - [1. Check Existing Push Configuration](#1-check-existing-push-configuration)
    - [2a. iOS Push Configuration Flow](#2a-ios-push-configuration-flow)
    - [2b. Android Push Configuration Flow](#2b-android-push-configuration-flow)
- [Build the app](#build-the-app)
- [Cancel the build](#cancel-the-build)

## **Get list of submissions**

1. To retrieve all previous submissions for a specific platform.
2. Call **GET /v2/apps/:appId/submissions?platform={platform}\&status={status}\&type={type}**
   - **Required Query Parameters:**
     - `platform` (string): "android" or "ios"
   - **Optional Query Parameters:**
     - `status` (string): Comma-separated statuses (started,submitted,queued,processing,ready-for-testing,tested,completed,failed,cancelled)
     - `type` (string): Submission type (default: "appStore")
3. **Error Responses:**
   - **400 PLATFORM\_REQUIRED**: Platform parameter is missing
   - **400 INVALID\_PLATFORM**: Platform must be "android" or "ios"
   - **400 INVALID\_STATUS**: Invalid status values provided
4. Useful for displaying a history of builds with their current statuses.

## **Get latest submission**

1. **When to call**: At the start of publishing flow to check submission state
2. **Who calls**: Frontend UI to determine next steps
3. **Endpoint**: **GET /v2/apps/:appId/submissions/latest?platform={platform}\&type={type}**
   - **Required Query Parameters:**
     - `platform` (string): "android" or "ios"
   - **Optional Query Parameters:**
     - `type` (string): Submission type (default: "appStore")
4. **Purpose**: Determine if there's an existing submission in progress or if a new one should be created
5. **UI Logic**:
   - **If no submission exists**: Proceed to create new submission
   - **If submission exists and not completed**: Continue with existing submission workflow
   - **If last submission completed**: Create new submission
6. **Error Responses:**
   - **400 PLATFORM\_REQUIRED**: Platform parameter is missing
   - **400 INVALID\_PLATFORM**: Platform must be "android" or "ios"

## **Get submission by ID**

1. To retrieve a specific submission by its ID.
2. Call **GET /v2/apps/:appId/submissions/:submissionId**
3. **Error Responses:**
   - **400**: General error retrieving submission
   - **404**: Submission not found
4. Returns complete submission data including result files if build is completed.

## **Initialize Publishing**

1. Check if app has productionAppId or not
   1. Call **GET /v1/apps/:appId** to get app data, It will have productionAppId property
2. If app does not have production app Id:
   1. Call **POST /v1/apps/:appId/publish**
   2. It will create a productionAppId
3. To start the publishing process:
4. Call **POST /v2/apps/:appId/submissions/initialize**
   - **Required Fields:**
     - `platform` (string): "android" or "ios"
     - `type` (string): "appStore" (for both platforms)
     - `teamId` (string): Required for iOS platform only
2. **Error Responses:**
   - **400 ERROR**: Missing platform or type parameters
   - **400 ERROR**: Invalid platform (must be "android" or "ios")
   - **400 ERROR**: Invalid type (must be "appStore")
   - **400 ERROR**: Team ID required for iOS platform
   - **400 ERROR**: API key not found for specified Team ID (iOS only)
   - **400 ERROR**: Submission already exists and is in progress
3. Once initialized, proceed with metadata submission.

## **API Key management (For iOS Apps)**

### **User Flow for API Key Selection**

#### **1\. Get All API Keys (User Selection)**

- **When to call**: Before starting iOS app submission process
- **Who calls**: Frontend UI for user selection
- **Endpoint**: **GET /v2/organizations/:organizationId/credentials/api-keys**
- **Purpose**: Display list of available API keys for user to select from
- **Response**: Returns array of all API key configurations for the organization
- **UI Behavior**:
  - If API keys exist: Show dropdown/list for user to select
  - If no API keys exist: Show "Create API Key" option
- **Error Responses:**
  - **400**: Error retrieving API keys

#### **2\. Create New API Key (If None Available)**

- **When to call**: When user has no API keys or wants to create a new one
- **Who calls**: Frontend UI when user clicks "Create API Key"
- **Endpoint**: **POST /v2/organizations/:organizationId/credentials/api-key**
- **Purpose**: Create new API key configuration for a team
- **Required Fields:**
  - `teamId` (string): Team ID from App Store Connect
  - `keyId` (string): Key ID from App Store Connect
  - `issuerId` (string): Issuer ID from App Store Connect
  - `apiKey` (string): Private key content (p8 file)
  - `name` (string): Display name for the API key
- **Error Responses:**
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: Missing required parameters
  - **400 FAILED\_API\_KEY\_CONFIGURATION**: API key validation failed
- **UI Behavior**: After successful creation, refresh the API keys list

### **System/AAB Internal Usage**

#### **3\. Get API Key by Team ID (AAB Internal)**

- **When to call**: During app build process when AAB needs API key for specific team
- **Who calls**: AAB (App Auto Builder) system internally
- **Endpoint**: **GET /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId?includeSensitiveData=true**
- **Purpose**: Retrieve API key with sensitive data for App Store Connect operations
- **Query Parameters:**
  - `includeSensitiveData=true`: Include API key content for build operations
- **Error Responses:**
  - **404**: API key configuration not found

### **Admin Management Operations**

#### **4\. Validate API Key (Optional)**

- **When to call**: Before creating API key to test validity
- **Who calls**: Frontend UI during API key creation flow
- **Endpoint**: **POST /v2/organizations/:organizationId/credentials/api-key/validate**
- **Purpose**: Test API key validity before saving
- **Required Fields:**
  - `teamId` (string): Team ID from App Store Connect
  - `keyId` (string): Key ID from App Store Connect
  - `issuerId` (string): Issuer ID from App Store Connect
  - `apiKey` (string): Private key content (p8 file)
- **Response:**
  - `isValid` (boolean): Whether the API key is valid
  - `message` (string): Validation message

#### **5\. Update API Key Name (Organization Admin Only)**

- **When to call**: When organization admin wants to rename an API key
- **Who calls**: Frontend UI for organization admins
- **Endpoint**: **PUT /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId**
- **Role Requirement**: Organization Admin
- **Required Fields:**
  - `name` (string): New display name for the API key
- **Error Responses:**
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: Missing name parameter
  - **404 MISSING\_API\_KEY\_CONFIGURATION**: API key not found

#### **6\. Delete API Key (Organization Admin Only)**

- **When to call**: When organization admin wants to remove an API key
- **Who calls**: Frontend UI for organization admins
- **Endpoint**: **DELETE /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId**
- **Role Requirement**: Organization Admin
- **Error Responses:**
  - **400**: Error deleting API key

## **Bundle ID details for iOS**

### **Bundle ID Selection Flow**

#### **1\. Get List of Bundle IDs (New Submissions)**

- **When to call**: For new iOS submissions when user needs to select a bundle ID
- **Who calls**: Frontend UI during new submission creation
- **Endpoint**: **GET /v2/apps/:appId/submissions/:submissionId/bundleId**
- **Purpose**: Display available bundle IDs from App Store Connect for user selection
- **Uses**: teamId from submission data to get API key
- **UI Behavior**: Show dropdown/list of available bundle IDs for user to select
- **Error Responses:**
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: API key config not found or missing teamId
- **Returns**: List of apps with their bundle IDs, names, and SKUs

#### **2\. Get Bundle ID Details**

- **When to call**:
  - **New submissions**: After user selects a bundle ID from the list
  - **In-progress submissions**: To fetch stored bundle ID details for existing submission
- **Who calls**: Frontend UI after bundle ID selection or when loading existing submission
- **Endpoint**: **GET /v2/apps/:appId/submissions/:submissionId/bundleId/details?bundleId={bundleId}**
- **Purpose**: Get detailed information about the selected/stored bundle ID
- **Required Query Parameters:**
  - `bundleId` (string): Bundle ID to get details for
- **UI Behavior**:
  - **New submissions**: Display selected bundle ID details and proceed to next step
  - **In-progress submissions**: Load and display existing bundle ID configuration
- **Error Responses:**
  - **400 MISSING\_BUNDLE\_ID**: Bundle ID parameter is required
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: API key config not found or missing teamId
  - **404 APP\_NOT\_FOUND**: Bundle ID not found in App Store Connect
- **Returns**: Detailed app information including version details and App Store state

## **Certificate flow for iOS**

### **Certificate Validation and Management Flow**

#### **1\. Check Certificate Status (Required)**

- **When to call**: After bundle ID selection, before proceeding to store config
- **Who calls**: Frontend UI as part of iOS submission flow
- **Endpoint**: **POST /v2/apps/:appId/submissions/:submissionId/check-certificate**
- **Purpose**: Verify if a valid certificate exists for the submission
- **Platform Restriction:** iOS only
- **Response:**
  - `validCertificate` (boolean): Whether certificate is valid
  - `message` (string): Validation message
- **Error Responses:**
  - **400 INVALID\_PLATFORM**: Certificate check only available for iOS
  - **400**: Missing team ID (extracted from submission data)
- **UI Logic:**
  - **If validCertificate: true**: Proceed to store config step
  - **If validCertificate: false**: Show certificate options (Generate or Upload)

#### **2\. Generate New Certificate (Option 1 \- If Invalid)**

- **When to call**: When certificate check fails and user chooses to generate new certificate
- **Who calls**: Frontend UI when user clicks "Generate Certificate"
- **Endpoint**: **POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate**
- **Purpose**: Automatically generate new distribution certificate via App Store Connect API
- **Uses**: teamId from submission data to get API key
- **UI Messages for Errors:**
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: "API key configuration missing. Please check your API key setup."
  - **400 MAX\_CERTIFICATES\_REACHED**: "Maximum certificates reached. Please revoke unused certificates in App Store Connect and try again."
  - **400 INSUFFICIENT\_PERMISSIONS**: "API key doesn't have permission to create certificates. Please check API key permissions in App Store Connect."
  - **400 FAILED\_CERTIFICATE\_CONFIGURATION**: "Failed to generate certificate. Please try again or upload a certificate manually."
- **Success Behavior**: Automatically proceed to store config step

#### **3\. Upload Custom Certificate (Option 2 \- If Invalid)**

- **When to call**: When certificate check fails and user chooses to upload their own certificate
- **Who calls**: Frontend UI when user clicks "Upload Certificate"
- **Endpoint**: **PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate**
- **Purpose**: Allow user to upload their existing distribution certificate and private key
- **Required Fields:**
  - `privateKey` (string): Private key content in PEM format
  - `certificate` (string): Certificate content in PEM format
- **UI Messages for Errors:**
  - **400 MISSING\_CERTIFICATE\_CONFIGURATION**: "Please provide both certificate and private key files."
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: "Missing team ID configuration."
  - **400 INVALID\_CERTIFICATE**: "Certificate validation failed. Please check your certificate and private key files."
- **Success Behavior**: Automatically proceed to store config step

#### **4\. Get Certificate Data (Info Display)**

- **When to call**: To display certificate information in UI
- **Who calls**: Frontend UI for informational display
- **Endpoint**: **GET /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate**
- **Purpose**: Show certificate details to user
- **Error Responses:**
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: Missing teamId
  - **404 MISSING\_CERTIFICATE\_CONFIGURATION**: Certificate not found

#### **5\. Download Certificate Files (Optional)**

- **When to call**: When user wants to download certificate files
- **Who calls**: Frontend UI download buttons
- **Endpoint**: **GET /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate/download/:key**
- **Path Parameters:**
  - `key` (string): "p12" or "certificate"
- **Error Responses:**
  - **400 MISSING\_API\_KEY\_CONFIGURATION**: Missing teamId
  - **404**: Certificate not found for the specified key

## **Upload Keystore file for Android**

1. If users want to upload their own keystore file for signing Android application:
2. First, upload the keystore file: **POST /v1/media/files?appId={appId}\&name={fileName with extension}**
3. Use resulting file info along with keystore password:
4. Call **PUT /v2/apps/:appId/submissions/:submissionId/keystore**
   - **Required Fields:**
     - `keyStoreFile` (object): File object stored in DB
     - `keyStorePassword` (string): Password for the keystore file
   - **Error Responses:**
     - **400**: Missing required parameters (keyStoreFile and keyStorePassword)
     - **400 INVALID\_PLATFORM**: Keystore upload only available for Android
     - **400 INVALID\_KEYSTORE**: Invalid keystore file or incorrect password
     - **400 DOWNLOAD\_ERROR**: Failed to download keystore file from S3

## **Submit Store Config**

1. Submit values like bundleId, versionNumber, and versionCode (Android-only).
2. If this is the first build: version number will be "1.0.0" and version code will be "1000"
3. For follow-up builds: increment version (e.g., "1.0.1") and version code (e.g., "1010")
4. Call **PUT /v2/apps/:appId/submissions/:submissionId/metadata** with **validationType**: **STORE\_CONFIG**
   - **Required Fields:**
     - `fl-store-bundleId` (string): Bundle ID for the app
     - `fl-store-versionNumber` (string): Version number for the app
     - `fl-store-versionCode` (string): Version code (Android only)
5. **Error Responses:**
   - **400 MISSING\_REQUIRED\_STORE\_CONFIG**: Missing required fields
   - **400 MISSING\_REQUIRED\_STORE\_CONFIG**: Missing team ID (iOS)
   - **400 MISSING\_REQUIRED\_STORE\_CONFIG**: Missing credentials
   - **400 FAILED\_STORE\_CONFIG**: New version must be greater than current version
   - **400 APP\_NOT\_FOUND**: App with bundle ID not found in app store
   - **500 ERROR**: Failed to validate bundle ID configuration
6. **For iOS:** Validates bundle ID exists in App Store Connect and version is higher than current
7. **For Android:** Previous build results are automatically carried over for certificate reuse

## **Submit Metadata**

1. Submit metadata like app icon, splash screen, and icon name.
2. Call **PUT /v2/apps/:appId/submissions/:submissionId/metadata** with **validationType**: **APP\_METADATA**
   - **Required Fields:**
     - `appIcon` (string): URL to the app icon image
     - `splashScreen` (object): Splash screen configuration with `url` property
     - `fl-store-iconName` (string): App Label Text (1-30 characters)
3. **Icon Name Validation:**
   - Must be 1-30 characters
   - Must start with a letter
   - Can contain letters, numbers, spaces, hyphens, underscores, dots, parentheses, brackets
   - Must end with a letter or number
4. **Error Responses:**
   - **400 MISSING\_REQUIRED\_METADATA**: Missing validation type or data
   - **400 MISSING\_REQUIRED\_METADATA**: Missing required fields
   - **400 MISSING\_REQUIRED\_METADATA**: Invalid icon name format or length
   - **500 ERROR**: Failed to submit metadata

## **Native App Permissions Management (Admin Only)**

### **Permission Configuration Flow**

#### **1\. Get App Permissions**

- **When to call**: When admin wants to view current permission settings for an app
- **Who calls**: Frontend UI for admin users
- **Endpoint**: **GET /v2/admin/apps/:appId/submissions/:submissionId/permissions**
- **Role Requirement**: App publisher & App token
- **Purpose**: Retrieve merged permissions (default \+ custom changes) for the app
- **Platform-specific**: Uses platform from submission to get correct permission set
- **Response**: Returns complete permission object with all permissions and their current state
- **Error Responses:**
  - **400**: Error occurred in getting app permissions
  - **404**: Submission not found

#### **2\. Update App Permissions**

- **When to call**: When admin wants to modify permission settings for an app
- **Who calls**: Frontend UI for admin users when saving permission changes
- **Endpoint**: **PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions**
- **Role Requirement**: Admin Features (appSubmissions)
- **Purpose**: Update app permissions with custom values (only stores changes from defaults)
- **Platform-specific Validation**:
  - **Android**: Only requires `enable` boolean for each permission
  - **iOS**: Requires both `enable` boolean and `string` description for each permission
- **Request Body**: Complete permission object with all required permissions
- **Optimization**: Only stores permissions that differ from default values
- **Error Responses:**
  - **400 Permission JSON is not valid**: Invalid structure or missing required fields
  - **400 Permission JSON is missing fields**: Missing required permission keys
  - **500**: Failed to update app permissions

#### **3\. Reset App Permissions**

- **When to call**: When admin wants to reset all permissions to default values
- **Who calls**: Frontend UI for admin users when clicking "Reset to Default"
- **Endpoint**: **PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions/reset**
- **Role Requirement**: Admin Features (appSubmissions)
- **Purpose**: Clear all custom permission changes and revert to system defaults
- **Platform-specific**: Resets permissions for the submission's platform
- **Response**: Success message confirming reset
- **Error Responses:**
  - **400**: Error occurred in resetting app permissions
  - **404**: Submission not found

### **Permission Structure**

#### **Android Permissions**

- **Structure**: `{ "PERMISSION_NAME": { "enable": boolean } }`
- **Available Permissions**:
  - `USE_BIOMETRIC`, `USE_FINGERPRINT`, `WRITE_EXTERNAL_STORAGE`
  - `ACCESS_NETWORK_STATE`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`
  - `DOWNLOAD_WITHOUT_NOTIFICATION`, `INTERNET`, `VIBRATE`
  - `MODIFY_AUDIO_SETTINGS`, `READ_PHONE_STATE`, `RECEIVE_BOOT_COMPLETED`
  - `WAKE_LOCK`, `CAMERA`, `USE_FULL_SCREEN_INTENT`
  - `READ_MEDIA_AUDIO`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, `SYSTEM_ALERT_WINDOW`

#### **iOS Permissions**

- **Structure**: `{ "PERMISSION_NAME": { "string": "description", "enable": boolean } }`
- **Available Permissions**:
  - `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSFaceIDUsageDescription`
  - `NSLocationAlwaysUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`
  - `NSLocationWhenInUseUsageDescription`, `NSMotionUsageDescription`
  - `NSPhotoLibraryUsageDescription`, `NSBluetoothAlwaysUsageDescription`
  - `NSBluetoothPeripheralUsageDescription`, `NSLocalNetworkUsageDescription`
  - `NSContactsUsageDescription`, `NSUserTrackingUsageDescription`

## **Push Notification Configuration (Optional)**

### **Push Configuration Flow**

#### **1\. Check Existing Push Configuration**

- **When to call**: When user wants to configure push notifications
- **Who calls**: Frontend UI when user accesses push notification section
- **Endpoint**: **GET /v1/widget-instances/com.fliplet.push-notifications?appId={appId}**
- **Purpose**: Check if push notification configuration already exists for the app
- **Response**: Returns existing widget instance with push configuration or empty response
- **UI Logic:**
  - **If config exists**: Load and display existing configuration
  - For iOS
    - If `response`.`widgetInstance.settings.apn = true` then iOS push notification is configured
  - For Android
    - If `response.widgetInstance.settings.fcm = true` then Android push notification is configured
  - **If no config exists**: Proceed to platform-specific configuration steps

#### **2a. iOS Push Configuration Flow**

##### **Check Team-Specific Push Config (iOS)**

- **When to call**: If no app-specific config found in step 1
- **Who calls**: Frontend UI for iOS push configuration
- **Endpoint**: **GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId**
- **Purpose**: Retrieve stored push config for the team ID (reuse existing config)
- **Error Responses:**
  - **400 MISSING\_TEAM\_ID**: Team ID is required
- **Response:**
  - Returns push config object with `apnKeyId`, `apnAuthKey`, `apnTopic`, `apnTeamId`
  - Returns empty object `{}` if no config found
- **UI Logic:**
  - **If team config exists**: Pre-populate form with existing values
  - **If no team config**: Show empty form for new configuration

##### **Configure iOS Push Notifications**

- **When to call**: After user fills in push notification details
- **Who calls**: Frontend UI when user submits iOS push configuration
- **Endpoint**: **PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId**
- **Required Fields for iOS:**
  - `submissionId` (number): Submission ID
  - `platform` (string): "ios"
  - `apn` (boolean): true
  - `apnKeyId` (string): Apple Push Notification key ID
  - `apnAuthKey` (string): Apple Push Notification authentication key
  - `apnTopic` (string): Apple Push Notification topic (bundle ID)
  - `apnTeamId` (string): Apple Push Notification team ID
- **Error Responses:**
  - **400 MISSING\_PUSH\_CONFIGURATION**: Required push config fields missing
  - **400 FAILD\_PUSH\_CONFIGURATION**: Issue saving push config
  - **400 INVALID\_PUSH\_CONFIG**: Push config validation failed

#### **2b. Android Push Configuration Flow**

##### **Upload Google Services File**

- **When to call**: First step for Android push configuration
- **Who calls**: Frontend UI when user uploads google-services.json file
- **Endpoint**: **POST /v1/media/files?appId={appId}\&name={fileName}**
- **Purpose**: Upload google-services.json file and get file object for configuration
- **Validation**: Verify file contains valid app bundle ID matching the submission

##### **Configure Android Push Notifications**

- **When to call**: After uploading google-services.json and entering service account details
- **Who calls**: Frontend UI when user submits Android push configuration
- **Endpoint**: **PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId**
- **Required Fields for Android:**
  - `submissionId` (number): Submission ID
  - `platform` (string): "android"
  - `fcm` (boolean): true
  - `project_id` (string): Firebase project ID
  - `private_key` (string): Service account private key
  - `client_email` (string): Service account client email
  - `fl-store-firebase` (object): Google services file object from upload step
- **Service Account JSON Extraction**: Frontend should extract the following from service account JSON:
  - `client_email`
  - `private_key`
  - `project_id`

##### **Submit Firebase Config (Android)**

- **When to call**: After successful push configuration for Android
- **Who calls**: Frontend UI automatically after push config success
- **Endpoint**: **PUT /v2/apps/:appId/submissions/:submissionId/metadata** with **validationType**: **PUSH\_CONFIG**
- **Purpose**: Link the Firebase configuration to the submission

## **Build the app**

1. Ensure all required configurations are complete:
   - Metadata submitted (APP\_METADATA)
   - Store config submitted (STORE\_CONFIG)
   - Push notifications configured (if needed)
   - Valid certificates (iOS) or keystore (Android)
2. Call **POST /v2/apps/:appId/submissions/:submissionId/build**
   - **Optional Fields:**
     - `debug` (boolean): Set to true for debug build (default: false)
3. **Pre-build Validations:**
   - Checks for required fields based on platform
   - Validates push notification configuration if configured
   - Validates certificates/credentials
   - Validates billing permissions
4. **Error Responses:**
   - **400**: Build already completed/submitted
   - **400 INVALID\_BUILD\_STATUS**: No production app (need to publish app first)
   - **400 MISSING\_REQUIRED\_METADATA**: Required fields missing for build
   - **400 MISSING\_PUSH\_CONFIGURATION**: Push notification config not found
   - **400 INVALID\_PUSH\_CONFIG**: Invalid push notification configuration
   - **400 MISSING\_CERTIFICATE\_CONFIGURATION**: Missing credentials
   - **400 INVALID\_CERTIFICATE**: Certificate validation failed
   - **403**: Billing validation failed (plan doesn't allow this app type)
   - **500 BUILD\_FAILED**: Failed to trigger build process
5. Once build is triggered, monitor status through submissions endpoints.

## **Cancel the build**

1. To cancel an active app build:
2. Call **DELETE /v1/apps/:appId/submissions/:submissionId**
3. This will cancel the existing build process