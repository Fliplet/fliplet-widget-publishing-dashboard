---
name: Connect iOS Flow APIs
overview: Connect the existing iOS Publishing Flow UI (screen 1856964) to real Fliplet v2 APIs by replacing mock JavaScript with actual API integration for all 6 steps.
todos:
  - id: add-helpers
    content: Add API helper functions (fileReader, errorHandler, apiRequest)
    status: completed
  - id: step-2-api
    content: "Connect Step 2: API key validation and creation"
    status: completed
    dependencies:
      - add-helpers
  - id: step-3-init
    content: "Connect Step 3: Initialize submission and fetch bundle IDs"
    status: completed
    dependencies:
      - step-2-api
  - id: step-3-cert
    content: "Connect Step 3: Certificate check, generation, and upload"
    status: completed
    dependencies:
      - step-3-init
  - id: step-3-store
    content: "Connect Step 3: Submit store configuration"
    status: completed
    dependencies:
      - step-3-cert
  - id: step-4-push
    content: "Connect Step 4: Push notification configuration with reuse"
    status: completed
    dependencies:
      - step-3-store
  - id: step-5-metadata
    content: "Connect Step 5: File uploads and metadata submission"
    status: completed
    dependencies:
      - step-4-push
  - id: step-6-build
    content: "Connect Step 6: Build trigger and real-time polling"
    status: completed
    dependencies:
      - step-5-metadata
  - id: test-flow
    content: Test complete end-to-end flow with error handling
    status: completed
    dependencies:
      - step-6-build
---

# Connect iOS Publishing Flow to Real APIs

## Overview
The iOS Publishing Flow UI already exists in app 427437 (screen 1856964) with complete HTML, CSS, and mock JavaScript. Replace mock functions with real Fliplet API v2 calls to make it fully functional.

## Current State Analysis

**Screen:** iOS Publishing Flow (ID: 1856964)

**Existing Structure:**
- ✅ Complete 6-step UI with stepper sidebar
- ✅ All form fields and file uploads
- ✅ Certificate automation UI states
- ✅ Build progress monitoring UI
- ✅ Mock state management (`iosFlowState`)
- ✅ Navigation functions (`goToStep`, `submitStep`)
- ✅ Context panel with dynamic content

**Mock Data to Replace:**
```javascript
// These simulate API responses:
IOS_MOCK_DATA.existingApiKeys
IOS_MOCK_DATA.bundleIds
IOS_MOCK_DATA.existingCertificate
IOS_MOCK_DATA.existingPushConfig
IOS_MOCK_DATA.buildLogs
```

## Implementation Strategy

### Phase 1: API Integration Layer
Create helper functions to call real Fliplet v2 APIs from the existing JavaScript.

### Phase 2: Replace Mock Functions
Update each `validate` and `submit` function to use real API calls.

### Phase 3: Real-Time Build Monitoring
Replace simulated build logs with actual polling of submission status.

## Detailed Changes by Step

### Step 1: App Store Connect Confirmation
**Current:** Mock confirmation checkbox
**Changes Needed:**
- No API call needed (user confirmation only)
- Keep existing validation

**Function:** `validateStep1()` - **NO CHANGES**

---

### Step 2: Apple API Key
**Current:** Mock validation, saves to `iosFlowState.formData.apiKey`

**Changes Needed:**
1. Check for existing API keys on page load
```javascript
// GET /v2/organizations/:orgId/credentials/api-keys
async function loadExistingApiKeys() {
  const orgId = Fliplet.Env.get('organizationId');
  const response = await Fliplet.API.request({
    url: `v2/organizations/${orgId}/credentials/api-keys`
  });
  // Show suggestion banner if keys exist
}
```

2. Validate and create API key on submit
```javascript
// POST /v2/organizations/:orgId/credentials/api-key/validate
// Then POST /v2/organizations/:orgId/credentials/api-key
async function validateStep2() {
  const apiKeyData = {
    name: $('#api-key-name').val(),
    teamId: $('#team-id').val(),
    issuerId: $('#issuer-id').val(),
    keyId: $('#key-id').val(),
    apiKey: // read .p8 file content
  };
  
  // Validate first
  await Fliplet.API.request({
    url: `v2/organizations/${orgId}/credentials/api-key/validate`,
    method: 'POST',
    data: apiKeyData
  });
  
  // Then create
  await Fliplet.API.request({
    url: `v2/organizations/${orgId}/credentials/api-key`,
    method: 'POST',
    data: apiKeyData
  });
}
```

**Functions to Update:**
- `validateStep2()`
- `useExistingApiKey()`
- Add: `loadExistingApiKeys()` on init

---

### Step 3: Bundle & Certificate
**Current:** Mock bundle IDs, simulated certificate check/generation

**Changes Needed:**

1. **Initialize Submission**
```javascript
// POST /v2/apps/:appId/submissions/initialize
async function initializeSubmission() {
  const teamId = iosFlowState.formData.apiKey.teamId;
  const response = await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/initialize`,
    method: 'POST',
    data: {
      platform: 'ios',
      type: 'appStore',
      teamId: teamId
    }
  });
  iosFlowState.submissionId = response.submission.id;
}
```

2. **Fetch Bundle IDs**
```javascript
// GET /v2/apps/:appId/submissions/:submissionId/bundleId
async function fetchBundleIds() {
  const response = await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/bundleId`
  });
  // Populate dropdown with response.apps
}
```

3. **Get Bundle Details on Selection**
```javascript
// GET /v2/apps/:appId/submissions/:submissionId/bundleId/details?bundleId={id}
$('#bundle-id-select').on('change', async function() {
  const bundleId = $(this).val();
  const details = await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/bundleId/details`,
    data: { bundleId: bundleId }
  });
  // Auto-fill version number from details
});
```

4. **Certificate Check (Automated)**
```javascript
// POST /v2/apps/:appId/submissions/:submissionId/check-certificate
async function checkCertificateStatus() {
  const response = await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/check-certificate`,
    method: 'POST'
  });
  
  if (response.validCertificate) {
    certState.status = 'found';
    renderCertStatus('found');
  } else {
    generateCertificate();
  }
}
```

5. **Generate Certificate**
```javascript
// POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
async function generateCertificate() {
  try {
    await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${submissionId}/ios-app-store/certificate`,
      method: 'POST'
    });
    certState.status = 'generated';
    renderCertStatus('generated');
  } catch (error) {
    if (error.status === 'MAX_CERTIFICATES_REACHED') {
      certState.status = 'error';
      certState.errorType = 'capacity';
      renderCertStatus('error');
    }
  }
}
```

6. **Upload Certificate (Manual)**
```javascript
// PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
async function handleCertUploadSubmit() {
  const certFile = await readFile($('#cert-file-input')[0].files[0]);
  const privateKey = await readFile($('#private-key-input')[0].files[0]);
  
  await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/ios-app-store/certificate`,
    method: 'PUT',
    data: {
      certificate: certFile,
      privateKey: privateKey
    }
  });
}
```

7. **Submit Store Config**
```javascript
// PUT /v2/apps/:appId/submissions/:submissionId/metadata (STORE_CONFIG)
async function validateStep3() {
  await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/metadata`,
    method: 'PUT',
    data: {
      validationType: 'STORE_CONFIG',
      data: {
        'fl-store-bundleId': $('#bundle-id-select').val(),
        'fl-store-versionNumber': $('#app-version-input').val()
      }
    }
  });
}
```

**Functions to Update:**
- `initializeSubmission()` - NEW
- `fetchBundleIds()`
- `checkCertificateStatus()`
- `generateCertificate()`
- `handleCertUploadSubmit()`
- `handleRevokedConfirmation()`
- `validateStep3()`

---

### Step 4: Push Notifications
**Current:** Mock push config suggestion

**Changes Needed:**

1. **Check Existing App Config**
```javascript
// GET /v1/widget-instances/com.fliplet.push-notifications?appId=:appId
async function checkPushConfig() {
  try {
    const response = await Fliplet.API.request({
      url: `v1/widget-instances/com.fliplet.push-notifications`,
      data: { appId: appId }
    });
    if (response.widgetInstance && response.widgetInstance.settings.apn) {
      // Show suggestion banner
    }
  } catch (error) {
    // No config exists
  }
}
```

2. **Check Team Push Config**
```javascript
// GET /v2/organizations/:orgId/credentials/ios-push-config/:teamId
async function checkTeamPushConfig() {
  const teamId = iosFlowState.formData.apiKey.teamId;
  const orgId = Fliplet.Env.get('organizationId');
  
  const response = await Fliplet.API.request({
    url: `v2/organizations/${orgId}/credentials/ios-push-config/${teamId}`
  });
  
  if (response && Object.keys(response).length > 0) {
    // Show suggestion to reuse
  }
}
```

3. **Submit Push Config**
```javascript
// PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
async function validateStep4() {
  if (!$('#enable-push').is(':checked')) {
    return true; // Skip if disabled
  }
  
  const apnAuthKey = await readFile($('#apns-key-input')[0].files[0]);
  
  await Fliplet.API.request({
    url: `v1/widget-instances/com.fliplet.push-notifications/settings`,
    method: 'PUT',
    data: {
      appId: appId,
      submissionId: iosFlowState.submissionId,
      platform: 'ios',
      apn: true,
      apnKeyId: $('#apns-key-id').val(),
      apnTeamId: $('#apns-team-id').val(),
      apnTopic: $('#apns-topic').val(),
      apnAuthKey: apnAuthKey
    }
  });
}
```

**Functions to Update:**
- `checkPushConfig()` - NEW
- `checkTeamPushConfig()` - NEW  
- `reuseExistingPushConfig()`
- `validateStep4()`

---

### Step 5: App Store Listing (Metadata)
**Current:** Mock file uploads

**Changes Needed:**

1. **Upload Files**
```javascript
// POST /v1/media/files?appId={appId}&name={fileName}
async function uploadMediaFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await Fliplet.API.request({
    url: `v1/media/files`,
    method: 'POST',
    data: formData,
    dataType: 'formdata',
    params: {
      appId: appId,
      name: file.name
    }
  });
  
  return response.file;
}
```

2. **Submit Metadata**
```javascript
// PUT /v2/apps/:appId/submissions/:submissionId/metadata (APP_METADATA)
async function validateStep5() {
  const appIconFile = $('#app-icon-input')[0].files[0];
  const splashFile = $('#splash-screen-input')[0].files[0];
  
  // Upload files
  const appIcon = await uploadMediaFile(appIconFile);
  const splashScreen = await uploadMediaFile(splashFile);
  
  // Submit metadata
  await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/metadata`,
    method: 'PUT',
    data: {
      validationType: 'APP_METADATA',
      data: {
        appIcon: appIcon.url,
        splashScreen: { url: splashScreen.url },
        'fl-store-iconName': $('#app-name-input').val()
      }
    }
  });
}
```

**Functions to Update:**
- `uploadMediaFile()` - NEW
- `validateStep5()`

---

### Step 6: Review & Build
**Current:** Simulated build with mock logs

**Changes Needed:**

1. **Trigger Build**
```javascript
// POST /v2/apps/:appId/submissions/:submissionId/build
async function startBuild() {
  await Fliplet.API.request({
    url: `v2/apps/${appId}/submissions/${submissionId}/build`,
    method: 'POST'
  });
  
  // Start polling
  pollBuildStatus();
}
```

2. **Poll Build Status**
```javascript
// GET /v2/apps/:appId/submissions/:submissionId
async function pollBuildStatus() {
  const pollInterval = setInterval(async () => {
    const response = await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${submissionId}`
    });
    
    const submission = response.submission;
    
    // Update progress based on status
    if (submission.status === 'completed') {
      clearInterval(pollInterval);
      showBuildSuccess();
    } else if (submission.status === 'failed') {
      clearInterval(pollInterval);
      showBuildError(submission.error);
    } else {
      // Update progress
      updateBuildProgress(submission);
    }
  }, 5000); // Poll every 5 seconds
}
```

**Functions to Update:**
- `startBuild()`
- `simulateBuildProcess()` → `pollBuildStatus()`
- `updateBuildProgress()` - NEW
- `showBuildSuccess()` - NEW
- `showBuildError()` - NEW

---

## Helper Functions Needed

### File Reading
```javascript
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
```

### Error Handling
```javascript
function handleApiError(stepNumber, error) {
  const errorMessages = {
    'MISSING_API_KEY_CONFIGURATION': 'API key configuration is missing or invalid.',
    'FAILED_API_KEY_CONFIGURATION': 'API key validation failed. Please check your credentials.',
    'MAX_CERTIFICATES_REACHED': 'Maximum certificates reached. Please revoke an existing certificate.',
    'INSUFFICIENT_PERMISSIONS': 'API key lacks permission to create certificates.',
    'INVALID_CERTIFICATE': 'Certificate validation failed.',
    'APP_NOT_FOUND': 'Bundle ID not found in App Store Connect.',
    'FAILED_STORE_CONFIG': 'Store configuration validation failed.',
    'MISSING_REQUIRED_METADATA': 'Required metadata fields are missing.'
  };
  
  const message = errorMessages[error.status] || error.message || 'An error occurred';
  showStepError(stepNumber, 'Error', message);
}
```

## Implementation Checklist

### Prerequisites
- [x] Screen exists (1856964)
- [x] UI is complete
- [x] Mock functions identified

### API Integration
- [ ] Add `Fliplet.API.request` wrapper helper
- [ ] Add file reading helper
- [ ] Add error handling helper
- [ ] Get appId and orgId from Fliplet.Env

### Step-by-Step API Connection
- [ ] Step 1: Keep as-is (no API needed)
- [ ] Step 2: Connect API key validation & creation
- [ ] Step 3: Initialize submission, fetch bundles, certificate automation
- [ ] Step 4: Push notification config with reuse logic
- [ ] Step 5: File uploads and metadata submission
- [ ] Step 6: Build trigger and real-time polling

### Testing & Deployment
- [ ] Test Step 2: API key creation
- [ ] Test Step 3: Certificate automation flow
- [ ] Test Step 3: Manual certificate upload
- [ ] Test Step 4: Push config
- [ ] Test Step 5: File uploads
- [ ] Test Step 6: Build and monitoring
- [ ] Handle all error states
- [ ] Test resume flow

## Key Technical Details

**App ID:** Get from `Fliplet.Env.get('appId')`
**Organization ID:** Get from `Fliplet.Env.get('organizationId')`
**Submission ID:** Store after `initialize` call in `iosFlowState.submissionId`

**API Request Pattern:**
```javascript
const response = await Fliplet.API.request({
  url: 'v2/path/to/endpoint',
  method: 'POST', // or 'GET', 'PUT', 'DELETE'
  data: { /* request body */ }
});
```

**File Uploads:**
- Use `FormData` for file uploads
- Set `dataType: 'formdata'` in request options
- Use `/v1/media/files` endpoint

**Error States:**
- All error statuses from tech spec are handled
- Show user-friendly messages
- Allow retry where applicable

## Success Criteria

- All 6 steps connect to real APIs
- Certificate automation works with fallback options
- Build process monitored in real-time
- Errors displayed with clear guidance
- Resume capability functional
- Files upload successfully
- App can be built end-to-end