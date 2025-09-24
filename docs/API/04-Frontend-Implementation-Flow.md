# **Recommended Implementation Flow for Frontend**

## Table of Contents

- [Initial Setup and Data Loading](#initial-setup-and-data-loading)
- [iOS Publishing Flow](#ios-publishing-flow)
- [Android Publishing Flow](#android-publishing-flow)
- [Progress Monitoring](#progress-monitoring)
- [Error Handling Guidelines](#error-handling-guidelines)
- [Key Implementation Notes](#key-implementation-notes)

### **Initial Setup and Data Loading**

1. **Check submission state**: Call `GET /v2/apps/:appId/submissions/latest?platform={platform}` to determine next steps:
   - **If no submission exists**: Proceed to create new submission
   - **If submission exists and not completed**: Continue with existing submission workflow
   - **If last submission completed**: Create new submission

### **iOS Publishing Flow**

1. **API Key Selection** (Required first step):

   - Get available API keys: `GET /v2/organizations/:organizationId/credentials/api-keys`
   - If no API keys exist: Show "Create API Key" option
   - If API keys exist: Show dropdown/list for user to select teamId
   - Create new API key (if needed): `POST /v2/organizations/:organizationId/credentials/api-key`
   - Optional validation: `POST /v2/organizations/:organizationId/credentials/api-key/validate`

2. **Initialize Publishing**: `POST /v2/apps/:appId/submissions/initialize` (with selected teamId)

3. **Bundle ID Selection**:

   - **New submissions**:
     - List available: `GET /v2/apps/:appId/submissions/:submissionId/bundleId`
     - User selects from list
     - Get details: `GET /v2/apps/:appId/submissions/:submissionId/bundleId/details?bundleId={selectedBundleId}`
   - **In-progress submissions**:
     - Get stored details: `GET /v2/apps/:appId/submissions/:submissionId/bundleId/details?bundleId={storedBundleId}`

4. **Certificate Management**:

   - Check status: `POST /v2/apps/:appId/submissions/:submissionId/check-certificate`
   - **If validCertificate: true**: Proceed to store config
   - **If validCertificate: false**: Show options:
     - Generate: `POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate`
     - Upload: `PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate`

5. **Store Configuration**: `PUT /v2/apps/:appId/submissions/:submissionId/metadata` (STORE\_CONFIG)

6. **App Metadata**: `PUT /v2/apps/:appId/submissions/:submissionId/metadata` (APP\_METADATA)

7. **Push Notifications** (optional):

   - Check existing app config: `GET /v1/widget-instances/com.fliplet.push-notifications?appId={appId}`
   - If no app config, check team config: `GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId`
   - Configure: `PUT /v1/widget-instances/com.fliplet.push-notifications/settings`

8. **Build**: `POST /v2/apps/:appId/submissions/:submissionId/build`

### **Android Publishing Flow**

1. **Initialize Publishing**: `POST /v2/apps/:appId/submissions/initialize`

2. **Store Configuration**: `PUT /v2/apps/:appId/submissions/:submissionId/metadata` (STORE\_CONFIG)

3. **App Metadata**: `PUT /v2/apps/:appId/submissions/:submissionId/metadata` (APP\_METADATA)

4. **Keystore Upload** (optional):

   - Upload keystore file: `POST /v1/media/files?appId={appId}&name={fileName}`
   - Submit keystore: `PUT /v2/apps/:appId/submissions/:submissionId/keystore`

5. **Push Notifications** (optional):

   - Check existing app config: `GET /v1/widget-instances/com.fliplet.push-notifications?appId={appId}`
   - If configuring new:
     - Upload google-services.json: `POST /v1/media/files?appId={appId}&name={fileName}`
     - Configure: `PUT /v1/widget-instances/com.fliplet.push-notifications/settings`
     - Submit config: `PUT /v2/apps/:appId/submissions/:submissionId/metadata` (PUSH\_CONFIG)

6. **Build**: `POST /v2/apps/:appId/submissions/:submissionId/build`

### **Progress Monitoring**

- Use `GET /v2/apps/:appId/submissions/:submissionId` to monitor build progress
- Use `GET /v2/apps/:appId/submissions?platform={platform}` to show build history

### **Error Handling Guidelines**

- Always check for specific error status codes (e.g., `MISSING_API_KEY_CONFIGURATION`, `INVALID_CERTIFICATE`)
- Display user-friendly error messages based on status codes
- For certificate errors on iOS, provide options to generate new or upload existing certificates
- For validation errors, highlight the specific fields that need attention
- For billing errors, redirect to upgrade plan or contact support

### **Key Implementation Notes**

- **teamId is crucial for iOS**: It's used throughout the iOS flow to identify the correct API keys and certificates
- **Submission state management**: Track submission status to enable/disable UI sections appropriately
- **File uploads**: Handle file uploads for keystores, certificates, and Firebase configs properly
- **Reusability**: For iOS, leverage existing push configs and certificates when available for the same team ID
- **Platform differences**: Android has version codes, iOS doesn't; iOS requires teamId, Android doesn't