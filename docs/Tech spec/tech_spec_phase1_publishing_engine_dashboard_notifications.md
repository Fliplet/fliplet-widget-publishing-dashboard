# Tech Spec — Phase 1: Publishing Engine + Main Dashboard + Notifications (Verbatim Extract)

Overview
This tech spec outlines the enhancements and overhauls for the publishing build processes for both Google Play Store and Apple App Store within Fliplet’s platform. The objective is to streamline and automate the publishing workflow, ensuring efficient, traceable, and scalable operations through the Fliplet API platform.

ROI/Success Metric 
Reduction in failed app builds 
Reduction in AAB queries to CS/ engineering team 
Reduction in AAB related bugs/tickets 
Improvement on clarification on responsibilities between app stores vs. Fliplet studio 
Time to Market: Measure the time it takes from completing app development to publishing it on the desired app stores. Decreasing the time to market indicates improved efficiency in the publishing process.
Increase in the use of additional app store features not currently managed by AAB by asking users to engage with the app stores instead of AAB

Publishing methods & Flow
Publishing Method 
Required Work 
Web publishing - Fliplet domain 
Existing flow 
Web publishing - Custom domain
New flow custom domain flow (Completed)
IOS publishing ( App store) 
New flow with API key & Certificate management
Apple Enterprise 
Existing flow 
Unassigned IPA 
Existing flow 
Android publishing (Google Play) 
New flow 
Signed APK
Existing flow 

Key Changes & Features
Allow users to integrate API key (replacement of apple credentials) for building and uploading apps to App store.
Client needs to provide API key (p8 file, issuer Id, team Id and key Id)
Note: Apple enterprise will still require apple credentials
Allow users to select bundle Id created in ASC for the app store submission. 
Note: For app store submission user won’t be able to update bundle Id from studio
Allow users to upload their own certificate (keystore file and password) to build android app
Note: For Google play store app only
Allow users to select certificates created in Apple developer portal to use for app store build.
Allow users to configure push notifications before the app build and validate push configs for Android google play and Apple app store builds
Users need to manage and upload Metadata and screenshots for Apple app store builds. Fliplet will manage ipa build and upload to ASC only.
Provide feedback to users about each step whether any action is needed or not
Notify users about the build status
Allow users to configure URL scheme that allows Fliplet apps to be opened via web links, directing users to the mobile app if installed, instead of the web version
Allow users to manage app permissions which android and iOS apps needs.

Key Components

Frontend Implementation:
Interface: Utilises embedded Fliplet apps within Fliplet Studio.
User Actions: Facilitates user interactions such as initialising the publishing process, uploading necessary files (e.g., keystores, certificates), and triggering builds.

Backend Implementation:
State Machine: Manages and maintains the correct states throughout the publishing process.

Fliplet JS APIs:
New JS APIs are introduced to handle specific functionalities for Google Play and Apple App Store, including initialisation, state management, file uploads, and submission processes.

REST APIs:
New endpoints are created to support the functionalities exposed by the JS APIs. These handle operations like state transitions, metadata submissions, and file management.

Database Enhancements:
Audit Logs: Storing additional information in our audit logs to provide increased visibility of actions.
API Key Management: Secure storage of API keys necessary for app store interactions.
Certificate Management: Secure storage of certificates for singing iOS and Android apps

Security and Compliance:
Ensures that all data handling and storage are compliant with relevant data protection regulations.
Implements robust security measures to safeguard sensitive information such as API keys and user data.

Integration Points:
Primary Service Interaction: Fetches app data, organisation data, and user data from Fliplet’s primary service.
Debug and Release Builds: Facilitates both debug and release builds to accommodate development and production needs.
Fastlane Integration for Apple: Automates the submission of apps to the Apple App Store using Fastlane tools.

API (Please refer this link for detail API documentation)
REST APIs

Existing endpoints that must be used:
Publish: /v1/apps/:appId/publish
App meta data: /v1/apps/:appId https://developers.fliplet.com/API/core/app.html 
Organisation meta data: /v1/organizations/:organizationId https://developers.fliplet.com/API/core/organizations.html 
Media file for uploading https://developers.fliplet.com/API/fliplet-media.html
Android submission endpoint?

State Machine Specifications for App Publishing Process

The state machine is designed to manage the state transitions of the app publishing process for both the Google Play Store and Apple App Store. It ensures that each step in the publishing workflow is executed in the correct sequence and maintains consistency and traceability of app states throughout the process.

Purpose
The purpose of the state machine is to automate and streamline the app publishing process, reduce human errors, enhance tracking, and provide a systematic approach to managing complex workflows.

Data Flow Diagram

Apple Mermaid Chart 

Android Mermaid Chart 

State Definitions
Each app will transition through several states from initiation to completion. Below are the common states defined for the state machine:
INITIALIZED: The publishing process has been started by the user.
METADATA_SUBMITTED: Required metadata including icon, splash screen, icon name etc…  for the app has been successfully submitted.
MISSING_REQUIRED_METADATA: Required metadata for the app is not submitted
API_KEY_CONFIGURED: API key for apple app store submission has been configured successfully
MISSING_API_KEY_CONFIGURATION: Some of the required fields for API key has not been submitted
FAILED_API_KEY_CONFIGURATION: The process has encountered an error in configuring API key
STORE_CONFIG_SUBMITTED: All required assets including certificates, bundle Id and configuration files has been configured
MISSING_REQUIRED_STORE_CONFIG: Some of the required fields has not been configured
FAILED_STORE_CONFIG: The process has encountered an error in configuring store configs
APP_NOT_FOUND: App with provided bundle Id is not found in your Apple account.
INVALID_CERTIFICATE: The certificate provided for app build is not valid
MISSING_CERTIFICATE_CONFIGURATION: Missing private key or certificate file
PUSH_NOTIFICATION_CONFIGURED: Data for push notifications has been configured
MISSING_PUSH_CONFIGURATION: Some configuration for push notifications is missing
FAILD_PUSH_CONFIGURATION: The process has encountered an error
INVALID_PUSH_CONFIG: The push config is not valid
BUILD_TRIGGERED: The build of the app (AAB for Android or IPA for iOS) has been initiated.
BUILD_COMPLETED: The app build has been successfully completed.
BUILD_FAILED: The process has encountered an error at any step.

Transitions
The transitions between states are triggered by specific actions performed either by the user or automatically by the system. Here are the key transitions:
INITIALIZED: Transitions from null to INITIALIZED.
METADATA_SUBMITTED: Transitions from Initialized to METADATA_SUBMITTED.
MISSING_REQUIRED_METADATA: Transitions from INITIALIZED to MISSING_REQUIRED_METADATA.
API_KEY_CONFIGURED: Transitions from from METADATA_SUBMITTED to API_KEY_CONFIGURED
MISSING_API_KEY_CONFIGURATION:  Transitions from from METADATA_SUBMITTED to MISSING_API_KEY_CONFIGURATION
FAILED_API_KEY_CONFIGURATION: Transitions from from METADATA_SUBMITTED to FAILED_API_KEY_CONFIGURATION
STORE_CONFIG_SUBMITTED: Transitions from API_KEY_CONFIGURED to STORE_CONFIG_SUBMITTED
MISSING_REQUIRED_STORE_CONFIG: Transitions from from API_KEY_CONFIGURED to MISSING_REQUIRED_STORE_CONFIG
FAILED_STORE_CONFIG: Transitions from from API_KEY_CONFIGURED to FAILED_STORE_CONFIG
INVALID_CERTIFICATE: Transitions from from API_KEY_CONFIGURED to INVALID_CERTIFICATE
MISSING_CERTIFICATE_CONFIGURATION: Transitions from from API_KEY_CONFIGURED to MISSING_CERTIFICATE_CONFIGURATION
APP_NOT_FOUND:Transitions from from API_KEY_CONFIGURED to APP_NOT_FOUND
PUSH_NOTIFICATION_CONFIGURED: Transitions from STORE_CONFIG_SUBMITTED to PUSH_NOTIFICATION_CONFIGURED
MISSING_PUSH_CONFIGURATION: Transitions from from STORE_CONFIG_SUBMITTED to MISSING_PUSH_CONFIGURATION
FAILD_PUSH_CONFIGURATION: Transitions from from STORE_CONFIG_SUBMITTED to FAILD_PUSH_CONFIGURATION
BUILD_TRIGGERED: Transitions from PUSH_NOTIFICATION_CONFIGURED or STORE_CONFIG_SUBMITTED Submitted to BUILD_TRIGGERED
BUILD_COMPLETED:Transitions from BUILD_TRIGGERED Submitted to BUILD_COMPLETED
BUILD_FAILED: Transitions from BUILD_TRIGGERED to  BUILD_FAILED

State Management
Data Storage: Each state transition is recorded in the database along with a timestamp and user ID to maintain a history of actions.
Error Handling: The state machine includes robust error handling to manage exceptions and unexpected errors, logging them appropriately and notifying users and administrators.
Integration with Backend Systems
API Interactions: The state machine interacts with various backend APIs to fetch data, trigger builds, and submit apps to the app stores.
Database Updates: After each transition, the state machine updates the database to reflect the new state of the app, ensuring data consistency.
Security and Compliance
Data Security: Ensures that all data transitions through the state machine are secured and comply with organisational data security policies.
Audit Trails: Maintains comprehensive logs for compliance and auditing purposes.
Authentication and Authorization: All endpoints require authentication and appropriate authorization to ensure that only authorised users can initiate and manage the app publishing process.
Data Encryption: Sensitive data such as API keys and user IDs are encrypted in transit and at rest.

Monitoring and Reporting
Real-time Monitoring: Provides real-time insights into the status of each app’s publishing process.
Alerts and Notifications: Configurable alerts for significant events or failures in the publishing process.

Initialize Publishing (Updated)
Endpoint: POST /v2/apps/:appId/submissions/initialize
Description: Starts the publishing process for an app.
Request Body:

{
  "platform": "android" // Or "ios"
  "type": "appStore",
  "teamId": "AFIG8RX79F" // iOS only, New field
}

201 Response:
{
  "status": "INITIALIZED",
  "message": "Publishing process initialized.",
  "data": {
    "appId": 12345,
    "submissionId": 12345,
    "platform": "android",
    "type": "GooglePlay"
  }
}

Submit Metadata
Endpoint: PUT /v2/apps/:appId/submissions/:submissionId/metadata
Description: Submits metadata for the app to move the state to Metadata Submitted.
previousResults: Pass previous build result object in previousResult object. If this is the first submission then it will be an empty object.
Request Body:

{
  "validationType": "APP_METADATA",
  "data": {
    "appIcon": "https://cdn.fliplet.com/apps/20/icon-1526650155893.jpg",
    "splashScreen": {
      "url": "https://cdn.fliplet.com/widgets/com.fliplet.apple-app-request/1.0.0/2501231519/img/splash-screen.png?_=1741873491",
"isEncrypted": true //Set this when custom splash screen is uploaded
    },
    "fl-store-iconName": "Example App"   
}

201 Response:
{
  "status": "METADATA_SUBMITTED",
  "message": "Metadata for the app has been submitted",
  "data": {
    // Data will contains all the available properties of submission
    "appId": 12345,
    "submissionId": 12345,
    "platform": "android",
    "type": "GooglePlay"
  }
}

400 Response (MISSING_REQUIRED_METADATA):
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "Required metadata is missing",
  "requiredField": "appIconName"
}

Submit store Configuration
Endpoint: PUT /v2/apps/:appId/submissions/:submissionId/metadata
Description: Submits store config for the app
Request Body:

{
  "validationType": "STORE_CONFIG",
  "data": {
    "fl-store-bundleId": "com.fliplet.iOsPublishingV2",
    "fl-store-versionNumber": "1.1.0"
    "fl-store-versionCode": "1010" // For android only
  }
}

201 Response:
{
  "status": "STORE_CONFIG_SUBMITTED",
  "message": "Metadata for the app has been submitted",
  "data": {
    // Data will contains all the available properties of submission
    "appId": 12345,
    "submissionId": 12345,
    "platform": "android",
    "type": "GooglePlay"
  }
}

400 Response (MISSING_REQUIRED_STORE_CONFIG):
{
  "status": "MISSING_REQUIRED_STORE_CONFIG",
  "message": "Required metadata is missing",
  "requiredField": "fl-store-bundleId"
}

400 Response (FAILED_STORE_CONFIG):
{
  "status": "FAILED_STORE_CONFIG",
  "message": "There is some issue in savind store config"
}

400 Response (INVALID_CERTIFICATE):
{
  "status": "INVALID_CERTIFICATE",
  "message": "Certificate provided for the app is not valid"
}

400 Response (APP_NOT_FOUND):
{
  "status": "APP_NOT_FOUND",
  "message": "App with bundle Id com.fliplet.iOsPublishingV2 not found in app store"
}

Trigger Build
Endpoint: POST /v2/apps/:appId/submissions/:submissionId/build
Description: Triggers the build process for the app.
Request Body:

{
  "debug": false // Or true for a debug build
}

201 Response:
{
  "status":"BUILD_TRIGGERED",
  "message": "Build process has been triggered."  
}

400 Response:
{
  "status":"BUILD_FAILED",
  "message": "Build process has been failed."  
}

Get Submissions
Endpoint: GET /v2/apps/:appId/submissions/
Description: Get list of submissions for the app
Request Params:
platform:Mandatory 
android or ios
status : Optional
 'started', 'submitted', 'queued', 'processing', 'ready-for-testing', 'tested', 'completed', 'failed', 'cancelled
You can pass multiple values comma separated'

400 Response:
{
  "status":"PLATFORM_REQUIRED",
  "message": "Platform is required"  
}

400 Response:
{
  "status":"INVALID_PLATFORM",
  "message": "Invalid platform. Must be either Android or iOS"  
}

400 Response:
{
  "status":"INVALID_STATUS",
  "message": "Invalid status. Must be one of: started, submitted, queued, processing, ready-for-testing, tested, completed, failed, cancelled"  
}

Get latest Submission
Endpoint: GET /v2/apps/:appId/submissions/latest
Description: Get latest submission for specific platform for the app
Request Params:
platform:Mandatory 
android or ios

400 Response:
{
  "status":"PLATFORM_REQUIRED",
  "message": "Platform is required"  
}

400 Response:
{
  "status":"INVALID_PLATFORM",
  "message": "Invalid platform. Must be either Android or iOS"  
}

Get Submission By Id
Endpoint: GET /v2/apps/:appId/submissions/:submissionId
Description: Get submission by id

Cancel build
Endpoint: DELETE /v1/apps/:appId/submissions/:submissionId
Description: cancel the build
Request Body:

{  
}

200 Response:
{
}

Detailed Testing Plan
BDD-Style Unit Tests
API Endpoints
Integration and Functional Tests
State Transitions
Security and Compliance
Backend and Database Interactions
Manual Testing for QA Engineers
UI Testing (Fliplet Studio Interface)
Real-World Publishing Scenarios
Compatibility Testing
Performance and Load Testing
Reporting and Monitoring
Notification
Limitations
Logging
Sample log payload
Documentation
API Key Documentation
Team API Keys
Individual API Keys (Option declined)
APNs Documentation
Project Timeline
App build failed
Grooming
