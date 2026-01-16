# API Usage Documentation by Screen

This document maps all API endpoints to their usage locations across the publishing dashboard screens. Use this for code review to verify correct API implementation.

---

## Table of Contents

1. [Global Code (PublishingManager)](#1-global-code-publishingmanager)
2. [Main Publishing Dashboard](#2-main-publishing-dashboard-screen-1856967)
3. [iOS Publishing Dashboard](#3-ios-publishing-dashboard-screen-1856966)
4. [iOS Publishing Flow](#4-ios-publishing-flow-screen-1856964)
5. [Android Publishing Dashboard](#5-android-publishing-dashboard-screen-1859844)
6. [Android Publishing Flow](#6-android-publishing-flow-screen-1859905)
7. [Web Publishing Dashboard](#7-web-publishing-dashboard-screen-1864908)
8. [Web Publishing Flow (Custom Domain)](#8-web-publishing-flow-custom-domain-screen-1867066)
9. [API Endpoint Reference](#9-api-endpoint-reference)

---

## 1. Global Code (PublishingManager)

**Location:** App Global JavaScript

The `PublishingManager` class is the centralized API layer that all screens use. It handles authentication (Studio session cookies via `withCredentials: true`) and provides a consistent interface for all API calls.

### API Methods Defined

| Method | HTTP | Endpoint | Description |
|--------|------|----------|-------------|
| `APIs.getAppData()` | GET | `/v1/apps/:appId` | Get app data and org ID |
| `APIs.publishApp()` | POST | `/v1/apps/:appId/publish` | Publish app if not already published |
| `APIs.SUBMISSIONS.getLatestSubmission(platform)` | GET | `/v2/apps/:appId/submissions/latest?platform=` | Get latest submission for platform |
| `APIs.SUBMISSIONS.getSubmissionById(id)` | GET | `/v2/apps/:appId/submissions/:id` | Get submission by ID |
| `APIs.initializePublishing(platform, teamId)` | POST | `/v2/apps/:appId/submissions/initialize` | Create new submission |
| `APIs.API_KEY.getAPIKeys()` | GET | `/v2/organizations/:orgId/credentials/api-keys` | List org API keys (iOS) |
| `APIs.API_KEY.setAPIKeyConfiguration(data)` | POST | `/v2/organizations/:orgId/credentials/api-key` | Save API key (iOS) |
| `APIs.API_KEY.validateAPIKeyConfigurationInternal(data)` | POST | `/v2/organizations/:orgId/credentials/api-key/validate` | Validate API key |
| `APIs.getBundleIds(submissionId)` | GET | `/v2/apps/:appId/submissions/:id/bundleId` | Get bundle IDs from ASC (iOS) |
| `APIs.fetchVersionNumberForBundleId(bundleId, submissionId)` | GET | `/v2/apps/:appId/submissions/:id/bundleId/details?bundleId=` | Get version for bundle |
| `APIs.CERTIFICATE.checkCertificate(submissionId)` | POST | `/v2/apps/:appId/submissions/:id/check-certificate` | Check certificate status (iOS) |
| `APIs.CERTIFICATE.createCertificate(submissionId)` | POST | `/v2/apps/:appId/submissions/:id/ios-app-store/certificate` | Create certificate (iOS) |
| `APIs.CERTIFICATE.uploadCertificate(privateKey, cert, submissionId)` | PUT | `/v2/apps/:appId/submissions/:id/ios-app-store/certificate` | Upload certificate (iOS) |
| `APIs.uploadFile(file, fileName)` | POST | `/v1/media/files?appId=&name=` | Upload media file |
| `APIs.KEYSTORE.uploadKeystore(submissionId, file, password)` | PUT | `/v2/apps/:appId/submissions/:id/keystore` | Upload keystore (Android) |
| `APIs.PUSH.getPushConfig(platform, submission)` | GET | `/v1/widget-instances/com.fliplet.push-notifications?appId=` | Get push config |
| `APIs.PUSH.setPushConfig(platform, config, submissionId, options)` | PUT | `/v1/widget-instances/com.fliplet.push-notifications/settings?appId=` | Set push config (iOS) |
| `APIs.PUSH.setAndroidPushConfig(submissionId, fcmConfig, googleServicesFile)` | PUT | `/v1/widget-instances/com.fliplet.push-notifications/settings?appId=` | Set push config (Android) |
| `APIs.PUSH.skipPushConfig(submissionId, platform)` | - | (No API call) | Skip push - local only |
| `APIs.submitStoreConfig(submissionId, storeConfig)` | PUT | `/v2/apps/:appId/submissions/:id/metadata` | Submit store config (validationType: STORE_CONFIG) |
| `APIs.submitMetadata(submissionId, metadata)` | PUT | `/v2/apps/:appId/submissions/:id/metadata` | Submit app metadata (validationType: APP_METADATA) |
| `APIs.BUILD.triggerBuild(submissionId, debug)` | POST | `/v2/apps/:appId/submissions/:id/build` | Trigger build |

### Authentication

All API calls use Studio session cookies:
```javascript
xhrFields: {
  withCredentials: true  // Inherit Studio session cookies
}
```

---

## 2. Main Publishing Dashboard (Screen 1856967)

**Purpose:** Shows build status for both iOS and Android, allows navigation to platform-specific dashboards.

### APIs Used

| API Call | Location in Code | Purpose |
|----------|------------------|---------|
| `publishingManager.APIs.SUBMISSIONS.getLatestSubmission('ios')` | `loadBuildStatus()` | Get iOS build status |
| `publishingManager.APIs.SUBMISSIONS.getLatestSubmission('android')` | `loadBuildStatus()` | Get Android build status |
| Direct AJAX: `DELETE /v1/apps/:appId/submissions/:submissionId` | `cancelBuild()` | Cancel an in-progress build |

### Code References

```javascript
// loadBuildStatus() - Lines ~55-80
const [iosResult, androidResult] = await Promise.allSettled([
  publishingManager.APIs.SUBMISSIONS.getLatestSubmission('ios'),
  publishingManager.APIs.SUBMISSIONS.getLatestSubmission('android')
]);

// cancelBuild() - Lines ~320-340
async function cancelBuild(submissionId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${publishingManager.METHODS.getRegion()}v1/apps/${appId}/submissions/${submissionId}`,
      method: 'DELETE',
      xhrFields: { withCredentials: true },
      // ...
    });
  });
}
```

### Build Status Detection

The screen checks these status values to determine if a build is in progress:
- **Top-level statuses:** `started`, `submitted`, `queued`, `processing`
- **Data statuses:** `BUILD_TRIGGERED`, `BUILD_IN_PROGRESS`, `BUILDING`, `STORE_CONFIG_SUBMITTED`, `PUSH_CONFIG_SUBMITTED`, `METADATA_SUBMITTED`, `CERTIFICATE_CREATED`, `CERTIFICATE_UPLOADED`

---

## 3. iOS Publishing Dashboard (Screen 1856966)

**Purpose:** Landing page for iOS publishing. Shows distribution options and navigates to the flow.

### APIs Used

**None** - This screen only handles navigation. No direct API calls.

### Navigation

- Navigates to iOS Publishing Flow: `Fliplet.Navigate.screen(1856964)`
- Navigates to Android Dashboard: `Fliplet.Navigate.screen(1859844)`
- Navigates to Web Dashboard: `Fliplet.Navigate.screen(1864908)`

---

## 4. iOS Publishing Flow (Screen 1856964)

**Purpose:** Step-by-step wizard for iOS app publishing (6 steps).

### APIs Used

| API Call | Step | Function | Purpose |
|----------|------|----------|---------|
| `publishingManager.APIs.SUBMISSIONS.getLatestSubmission('ios')` | Init | `tryResumeExistingSubmission()` | Check for existing submission to resume |
| `publishingManager.APIs.API_KEY.getAPIKeys()` | 2 | `loadExistingApiKeys()` | Load existing org API keys |
| `publishingManager.APIs.API_KEY.setAPIKeyConfiguration(data)` | 2 | `validateStep2()` | Save/validate API key |
| `publishingManager.APIs.initializePublishing('ios', teamId)` | 3, Retry | `initializeSubmission()`, `startFreshBuild()` | Create new submission |
| `publishingManager.APIs.getBundleIds(submissionId)` | 3 | `fetchBundleIds()` | Fetch bundle IDs from App Store Connect |
| `publishingManager.APIs.fetchVersionNumberForBundleId(bundleId, submissionId)` | 3 | Bundle ID change handler | Get current version for auto-increment |
| `publishingManager.APIs.CERTIFICATE.checkCertificate(submissionId)` | 3 | `checkCertificateStatus()` | Check for existing certificate |
| `publishingManager.APIs.CERTIFICATE.createCertificate(submissionId)` | 3 | `generateCertificate()` | Auto-generate certificate |
| `publishingManager.APIs.CERTIFICATE.uploadCertificate(privateKey, cert, submissionId)` | 3 | `handleCertUploadSubmit()` | Upload manual certificate |
| `publishingManager.APIs.submitStoreConfig(submissionId, storeConfig)` | 3, Retry | `validateStep3()`, `resubmitAllMetadata()` | Submit bundle ID and version |
| `publishingManager.APIs.PUSH.getPushConfig('ios', submission)` | 4 | `checkPushConfig()`, `checkTeamPushConfig()` | Get existing push config |
| `publishingManager.APIs.PUSH.setPushConfig('ios', config, submissionId, options)` | 4, Retry | `validateStep4()`, `resubmitAllMetadata()` | Save push notification config |
| Direct AJAX: `POST /v1/media/files` | 5 | `uploadMediaFile()` | Upload app icon and splash |
| `publishingManager.APIs.submitMetadata(submissionId, metadata)` | 5, Retry | `validateStep5()`, `resubmitAllMetadata()` | Submit app name, icon, splash |
| `publishingManager.APIs.BUILD.triggerBuild(submissionId, false)` | 6 | `startBuild()` | Trigger the build |
| `publishingManager.APIs.SUBMISSIONS.getSubmissionById(submissionId)` | 6 | `pollBuildStatus()`, `checkAndShowBuildStatus()` | Poll build status |
| Direct AJAX: `DELETE /v1/apps/:appId/submissions/:submissionId` | 6 | `cancelCurrentBuild()`, `startFreshBuild()` | Cancel build |

### Step-by-Step API Flow

1. **Step 1 (ASC Confirmation):** No API calls - checkbox confirmation only
2. **Step 2 (API Key):** `getAPIKeys()`, `setAPIKeyConfiguration()`
3. **Step 3 (Bundle & Certificate):** `initializePublishing()`, `getBundleIds()`, `checkCertificate()`, `createCertificate()`, `uploadCertificate()`, `submitStoreConfig()`
4. **Step 4 (Push Notifications):** `getPushConfig()`, `setPushConfig()`
5. **Step 5 (App Listing):** `uploadMediaFile()`, `submitMetadata()`
6. **Step 6 (Build):** `triggerBuild()`, `getSubmissionById()` (polling), `cancelCurrentBuild()`

### Step 5 Metadata Payload (IMPORTANT)

When submitting app metadata, the `splashScreen` field **must** include `isEncrypted: true` because Fliplet's media API encrypts uploaded files:

```javascript
// validateStep5() - Correct metadata format
const metadata = {
  appIcon: appIconUrl,
  splashScreen: {
    url: splashScreenUrl,
    isEncrypted: true  // CRITICAL: Must be true for encrypted files
  },
  'fl-store-iconName': appName
};

await publishingManager.APIs.submitMetadata(submissionId, metadata);
```

**Why this matters:** If `isEncrypted` is set to `false`, the build server will try to download the file without authentication, resulting in "improper image header" errors from ImageMagick.

### Build Status Detection

The submission response contains **two different status fields**:
- `submission.status` - Top-level status: `started`, `submitted`, `completed`, `failed`
- `submission.data.status` - Workflow status: `BUILD_TRIGGERED`, `METADATA_SUBMITTED`, etc.

**Check top-level status FIRST for terminal states:**
```javascript
// pollBuildStatus() - Correct status checking
const topLevelStatus = submission.status;
const workflowStatus = submission.data?.status;

// Check terminal states first
if (topLevelStatus === 'completed' || topLevelStatus === 'ready') {
  showBuildSuccess(submission);
} else if (topLevelStatus === 'failed') {
  showBuildError(submission.result?.message || 'Build failed');
} else {
  // Use workflow status for progress updates
  updateBuildProgress(workflowStatus);
}
```

### Cancel Build Logic

The cancel API returns 400 if the submission is not running:
```javascript
// cancelCurrentBuild() - Handle "not running" gracefully
$.ajax({
  url: `${regionUrl}v1/apps/${appId}/submissions/${submissionId}`,
  method: 'DELETE',
  error: function(xhr) {
    if (xhr.responseJSON?.message?.includes('not running')) {
      // Submission already stopped - proceed with new build
    }
  }
});
```

### Fresh Build After Failure

When a build fails, `startFreshBuild()` handles retry by:
1. Cancelling the failed submission (if running)
2. Creating a new submission via `initializePublishing()`
3. Re-submitting all metadata via `resubmitAllMetadata()`
4. Triggering a new build

```javascript
// startFreshBuild() - Creates new submission for retry
async function startFreshBuild() {
  // Cancel existing submission
  await cancelExistingSubmission();

  // Create new submission
  const result = await publishingManager.APIs.initializePublishing('ios', teamId);
  iosFlowState.submissionId = result.submission.id;

  // Re-submit all stored metadata
  await resubmitAllMetadata(iosFlowState.submissionId);

  // Start new build
  startBuild();
}
```

### Resume Logic

When resuming from an existing submission, the screen maps workflow statuses to completed steps:

```javascript
const statusToSteps = {
  'INITIALIZED': [1],
  'ASC_CONFIRMED': [1],
  'API_KEY_CONFIGURED': [1, 2],
  'API_KEY_SUBMITTED': [1, 2],
  'STORE_CONFIG_SUBMITTED': [1, 2, 3],
  'CERTIFICATE_CONFIGURED': [1, 2, 3],
  'PUSH_CONFIG_SUBMITTED': [1, 2, 3, 4],
  'PUSH_CONFIGURED': [1, 2, 3, 4],
  'METADATA_SUBMITTED': [1, 2, 3, 4, 5],
  'READY_TO_BUILD': [1, 2, 3, 4, 5],
  'BUILD_TRIGGERED': [1, 2, 3, 4, 5],
  'BUILD_IN_PROGRESS': [1, 2, 3, 4, 5],
  'BUILD_COMPLETE': [1, 2, 3, 4, 5, 6]
};
```

### Storing Metadata for Retry

When Step 5 completes, store actual URLs (not just booleans) for potential retry:

```javascript
// validateStep5() - Store URLs for retry capability
iosFlowState.formData.metadata = {
  appName: appName,
  appIcon: appIconUrl,           // Store actual URL
  splashScreen: splashScreenUrl, // Store actual URL
  hasIcon: true,
  hasSplash: true
};
```

---

## 5. Android Publishing Dashboard (Screen 1859844)

**Purpose:** Landing page for Android publishing. Checks for incomplete builds and allows resume.

### APIs Used

| API Call | Function | Purpose |
|----------|----------|---------|
| `Fliplet.API.request({ url: 'v2/apps/:appId/submissions/latest?platform=android' })` | `checkForIncompleteBuilds()` | Check for builds to resume |

**Note:** This screen uses `Fliplet.API.request()` directly instead of PublishingManager.

### Code Reference

```javascript
function checkForIncompleteBuilds() {
  Fliplet.API.request({
    method: 'GET',
    url: 'v2/apps/' + appId + '/submissions/latest?platform=android'
  }).then(function(response) {
    // Check for incomplete statuses: 'in_progress', 'failed', 'blocked', 'waiting'
    // ...
  });
}
```

### Navigation

- Stores resume data in `Fliplet.App.Storage` before navigating to flow
- Navigates to Android Publishing Flow: `Fliplet.Navigate.screen(1859905)`

---

## 6. Android Publishing Flow (Screen 1859905)

**Purpose:** Step-by-step wizard for Android app publishing (6 steps).

### APIs Used

| API Call | Step | Function | Purpose |
|----------|------|----------|---------|
| `publishingManager.APIs.getAppData()` | Init | `initAndroidFlow()` | Get app data and ensure published |
| `publishingManager.APIs.SUBMISSIONS.getLatestSubmission('android')` | Init | `checkForExistingSubmission()`, `resumeFromSubmission()` | Check for/resume existing submission |
| `publishingManager.APIs.initializePublishing('android')` | 2 | `initializeAndroidSubmission()` | Create new submission |
| `publishingManager.APIs.submitStoreConfig(submissionId, storeConfig)` | 2 | `validateStep2()` | Submit bundle ID, version, version code |
| `publishingManager.APIs.uploadFile(file, fileName)` | 2,4 | Keystore upload, Icon/Splash upload | Upload files to media |
| `publishingManager.APIs.KEYSTORE.uploadKeystore(submissionId, file, password)` | 2 | `handleKeystoreUpload()` | Validate and upload keystore |
| `publishingManager.APIs.PUSH.setAndroidPushConfig(submissionId, fcmConfig, googleServicesFile)` | 3 | `validateStep3()` | Set FCM push configuration |
| `publishingManager.APIs.submitMetadata(submissionId, metadata)` | 4 | `validateStep4()` | Submit app name, icon, splash |
| `publishingManager.APIs.BUILD.triggerBuild(submissionId, false)` | 5 | `startBuild()` | Trigger the build |
| `publishingManager.APIs.SUBMISSIONS.getSubmissionById(submissionId)` | 6 | `pollBuildStatus()` | Poll build status |
| Direct AJAX: `DELETE /v1/apps/:appId/submissions/:submissionId` | 6 | `cancelCurrentBuild()` | Cancel build |

### Step-by-Step API Flow

1. **Step 1 (Google Play Confirmation):** No API calls - checkbox confirmation only
2. **Step 2 (Bundle & Keystore):** `initializePublishing()`, `submitStoreConfig()`, `uploadFile()`, `uploadKeystore()`
3. **Step 3 (Push Notifications):** `uploadFile()` (google-services.json), `setAndroidPushConfig()`
4. **Step 4 (App Details):** `uploadFile()` (icon, splash), `submitMetadata()`
5. **Step 5 (Review):** No API calls - displays summary
6. **Step 6 (Build):** `triggerBuild()`, `getSubmissionById()` (polling), `cancelCurrentBuild()`

### Android-Specific Payloads

**Store Config (Step 2):**
```javascript
{
  'fl-store-bundleId': 'com.example.app',
  'fl-store-versionNumber': '1.0.0',
  'fl-store-versionCode': '1'  // Android-specific
}
```

**Push Config (Step 3):**
```javascript
{
  submissionId: 123,
  platform: 'android',
  fcm: true,
  project_id: 'firebase-project-id',
  private_key: '-----BEGIN PRIVATE KEY-----...',
  client_email: 'firebase-adminsdk@...iam.gserviceaccount.com',
  googleServicesTimestamp: Date.now(),
  serviceAccountTimestamp: Date.now(),
  'fl-store-firebase': { /* google-services.json file object */ }
}
```

**App Metadata (Step 4):**
```javascript
{
  'appIcon': appIconUrl,
  'splashScreen': {
    url: splashScreenUrl,
    isEncrypted: true  // CRITICAL: Must match actual file encryption status
  },
  'fl-store-iconName': appName
}
```

> **Note:** The `isEncrypted` flag must be `true` if the file was uploaded via Fliplet's media API (which encrypts files by default). Setting this incorrectly will cause build failures with "improper image header" errors.

---

## 7. Web Publishing Dashboard (Screen 1864908)

**Purpose:** Landing page for web publishing. Shows options to publish to Fliplet domain or set up a custom domain. Displays current publishing status on load.

### APIs Used

| API Call | Function | Purpose |
|----------|----------|---------|
| `Fliplet.API.request({ url: '/v1/apps/:appId' })` | `getAppData()` | Check if app is published to Fliplet domain |
| `Fliplet.API.request({ url: '/v1/apps/:appId/domainConfig' })` | `getDomainConfig()` | Check if custom domain is configured |
| `Fliplet.API.request({ url: '/v1/apps/:appId/publish/web', method: 'POST' })` | `publishToWeb()` | Publish app to Fliplet domain |
| `Fliplet.API.request({ url: '/v1/apps/:appId/unpublish/web', method: 'POST' })` | `unpublishFromWeb()` | Unpublish app from Fliplet domain |

**Note:** This screen uses `Fliplet.API.request()` directly with region-based API URLs (eu, us, ca).

### Code Reference

```javascript
// Configuration for region-based API URLs
var CONFIG = {
  regionUrls: {
    eu: 'https://api.fliplet.com',
    us: 'https://us.api.fliplet.com',
    ca: 'https://ca.api.fliplet.com'
  }
};

// Load publishing status on init
function loadPublishingStatus() {
  Promise.all([
    getAppData().catch(function(err) { return null; }),
    getDomainConfig().catch(function(err) { return null; })
  ]).then(function(results) {
    var appData = results[0];
    var domainConfig = results[1];

    // Check Fliplet domain status
    if (appData && appData.app && appData.app.webUrl) {
      state.flipletDomainPublished = true;
      state.flipletDomainUrl = appData.app.webUrl;
    }

    // Check custom domain status
    if (domainConfig && domainConfig.domain) {
      state.customDomainConfigured = true;
      state.customDomainUrl = domainConfig.domain;
      state.customDomainStatus = domainConfig.status || 'PENDING';
    }

    updateDashboardUI();
  });
}
```

### UI States

| Condition | UI Display |
|-----------|------------|
| Fliplet domain published | Green "Published" badge, live URL, Open/Unpublish buttons |
| Fliplet domain not published | "Publish to Fliplet domain" button |
| Custom domain active | Green "Active" badge, domain URL, "Manage domain" button |
| Custom domain pending | Yellow "Setup in Progress" badge, domain URL, "Manage domain" button |
| No custom domain | Feature list + "Set up my domain" button |

### Navigation

- Close button: `Fliplet.Navigate.screen(1856967)` (Main Publishing Dashboard)
- Set up my domain: `Fliplet.Navigate.screen(1867066)` (Web Publishing Flow)
- Manage domain: `Fliplet.Navigate.screen(1867066)` (Web Publishing Flow)

---

## 8. Web Publishing Flow - Custom Domain (Screen 1867066)

**Purpose:** Step-by-step wizard for custom domain setup (3 steps: Domain Name → SSL Verification → DNS Association).

### APIs Used

| API Call | Step | Function | Purpose |
|----------|------|----------|---------|
| `Fliplet.API.request({ url: '/v1/apps/:appId/domainConfig' })` | Init, All | `getDomainConfig()` | Get current domain configuration |
| `Fliplet.API.request({ url: '/v1/apps/:appId/domainConfig', method: 'PUT' })` | 1 | `saveDomainConfig()` | Save domain name configuration |
| `Fliplet.API.request({ url: '/v1/apps/:appId/domainConfig', method: 'DELETE' })` | Any | `deleteDomainConfig()` | Remove domain configuration |
| `Fliplet.API.request({ url: '/v1/apps/:appId/domainConfig/verify', method: 'POST' })` | 3 | `verifyDomainDns()` | Verify DNS records are configured |

### Step-by-Step API Flow

1. **Step 1 (Domain Name):** `saveDomainConfig(domain)` - Saves domain and returns SSL CNAME records
2. **Step 2 (SSL Verification):** `getDomainConfig()` (polling) - Checks if SSL certificate is issued
3. **Step 3 (DNS Association):** `verifyDomainDns()` - Verifies DNS CNAME is configured correctly

### Code Reference

```javascript
// API Functions
function getDomainConfig() {
  return Fliplet.API.request({
    url: getApiUrl() + '/v1/apps/' + state.appId + '/domainConfig',
    method: 'GET'
  });
}

function saveDomainConfig(domain) {
  return Fliplet.API.request({
    url: getApiUrl() + '/v1/apps/' + state.appId + '/domainConfig',
    method: 'PUT',
    data: { domain: domain }
  });
}

function deleteDomainConfig() {
  return Fliplet.API.request({
    url: getApiUrl() + '/v1/apps/' + state.appId + '/domainConfig',
    method: 'DELETE'
  });
}

function verifyDomainDns() {
  return Fliplet.API.request({
    url: getApiUrl() + '/v1/apps/' + state.appId + '/domainConfig/verify',
    method: 'POST'
  });
}
```

### Domain Status Detection

The screen determines the current step based on domain config status:

```javascript
function getDomainStatus(config) {
  if (!config || !config.domain) return 'NO_CONFIG';

  var status = (config.status || '').toUpperCase();
  var sslStatus = (config.sslStatus || '').toUpperCase();

  if (status === 'ACTIVE') return 'ACTIVE';
  if (sslStatus === 'PENDING_SSL_VERIFICATION' || sslStatus === 'PENDING') return 'PENDING_SSL';
  if (sslStatus === 'SSL_ISSUED' || sslStatus === 'ISSUED') return 'PENDING_DNS';
  if (status === 'FAILED' || sslStatus === 'FAILED') return 'FAILED';

  return 'PENDING_SSL';
}

function getStepFromStatus(status) {
  switch (status) {
    case 'NO_CONFIG': return 1;
    case 'PENDING_SSL': return 2;
    case 'PENDING_DNS': return 3;
    case 'ACTIVE': return 'success';
    default: return 1;
  }
}
```

### Polling

The screen polls every 5 seconds (max 120 attempts) to check for status updates:

```javascript
var CONFIG = {
  pollInterval: 5000,
  maxPollAttempts: 120
};

function startPolling() {
  state.pollingTimer = setInterval(function() {
    getDomainConfig().then(function(response) {
      var status = getDomainStatus(response);
      // Update UI based on status
      if (status === 'ACTIVE') {
        stopPolling();
        showSuccessState();
      }
    });
  }, CONFIG.pollInterval);
}
```

---

## 9. API Endpoint Reference

### Quick Reference Table

| Endpoint | Method | Used By Screens | Description |
|----------|--------|-----------------|-------------|
| `/v1/apps/:appId` | GET | Global | Get app data |
| `/v1/apps/:appId/publish` | POST | Global | Publish app |
| `/v1/apps/:appId/submissions/:id` | DELETE | Main Dashboard, iOS Flow, Android Flow | Cancel build |
| `/v2/apps/:appId/submissions/latest` | GET | Main Dashboard, iOS Flow, Android Dashboard, Android Flow | Get latest submission |
| `/v2/apps/:appId/submissions/:id` | GET | iOS Flow, Android Flow | Get submission by ID (polling) |
| `/v2/apps/:appId/submissions/initialize` | POST | iOS Flow, Android Flow | Create new submission |
| `/v2/apps/:appId/submissions/:id/bundleId` | GET | iOS Flow | Get bundle IDs from ASC |
| `/v2/apps/:appId/submissions/:id/bundleId/details` | GET | iOS Flow | Get version for bundle ID |
| `/v2/apps/:appId/submissions/:id/check-certificate` | POST | iOS Flow | Check certificate status |
| `/v2/apps/:appId/submissions/:id/ios-app-store/certificate` | POST/PUT | iOS Flow | Create/upload certificate |
| `/v2/apps/:appId/submissions/:id/keystore` | PUT | Android Flow | Upload keystore |
| `/v2/apps/:appId/submissions/:id/metadata` | PUT | iOS Flow, Android Flow | Submit store config or metadata |
| `/v2/apps/:appId/submissions/:id/build` | POST | iOS Flow, Android Flow | Trigger build |
| `/v2/organizations/:orgId/credentials/api-keys` | GET | iOS Flow | List API keys |
| `/v2/organizations/:orgId/credentials/api-key` | POST | iOS Flow | Save API key |
| `/v2/organizations/:orgId/credentials/api-key/validate` | POST | iOS Flow | Validate API key |
| `/v1/widget-instances/com.fliplet.push-notifications` | GET | iOS Flow | Get push config |
| `/v1/widget-instances/com.fliplet.push-notifications/settings` | PUT | iOS Flow, Android Flow | Set push config |
| `/v1/media/files` | POST | iOS Flow, Android Flow | Upload media files |
| `/v1/apps/:appId/publish/web` | POST | Web Dashboard | Publish app to Fliplet domain |
| `/v1/apps/:appId/unpublish/web` | POST | Web Dashboard | Unpublish app from Fliplet domain |
| `/v1/apps/:appId/domainConfig` | GET | Web Dashboard, Web Flow | Get custom domain configuration |
| `/v1/apps/:appId/domainConfig` | PUT | Web Flow | Save/update custom domain configuration |
| `/v1/apps/:appId/domainConfig` | DELETE | Web Flow | Remove custom domain configuration |
| `/v1/apps/:appId/domainConfig/verify` | POST | Web Flow | Verify DNS configuration for custom domain |

### Response Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed |
| 201 | Created | Submission/certificate created |
| 400 | Bad Request | Missing fields, invalid data, validation failed |
| 403 | Forbidden | Billing validation failed, insufficient permissions |
| 404 | Not Found | Submission/app not found |
| 500 | Server Error | Internal error during processing |

### Error Status Codes (in response body)

| Status | Description |
|--------|-------------|
| `MISSING_API_KEY_CONFIGURATION` | API key not configured |
| `FAILED_API_KEY_CONFIGURATION` | API key validation failed |
| `MAX_CERTIFICATES_REACHED` | Certificate limit reached |
| `INSUFFICIENT_PERMISSIONS` | API key lacks permissions |
| `INVALID_CERTIFICATE` | Certificate validation failed |
| `APP_NOT_FOUND` | Bundle ID not in ASC |
| `FAILED_STORE_CONFIG` | Store config validation failed |
| `MISSING_REQUIRED_METADATA` | Required metadata missing |
| `INVALID_KEYSTORE` | Keystore file or password invalid |
| `MISSING_PUSH_CONFIGURATION` | Push config required but missing |
| `INVALID_PUSH_CONFIG` | Push config validation failed |
| `BUILD_TRIGGERED` | Build has been queued |
| `BUILD_FAILED` | Build process failed |

### Build Server Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `improper image header` | Build server cannot read uploaded image | Ensure `isEncrypted: true` in metadata for files uploaded via Fliplet media API |
| `This submission is not running` | Trying to cancel a completed/failed submission | Handle gracefully - submission already stopped |
| `A submission for this app and platform is already in progress` | Duplicate submission | Cancel existing submission before creating new one |

---

## Appendix: Screen IDs

| Screen | ID | Type |
|--------|-----|------|
| Main Publishing Dashboard | 1856967 | Dashboard |
| iOS Publishing Dashboard | 1856966 | Landing |
| iOS Publishing Flow | 1856964 | Stepper Flow |
| Android Publishing Dashboard | 1859844 | Landing |
| Android Publishing Flow | 1859905 | Stepper Flow |
| Web Publishing Dashboard | 1864908 | Dashboard |
| Web Publishing Flow (Custom Domain) | 1867066 | Stepper Flow |

---

*Document generated for code review and engineer handover.*
