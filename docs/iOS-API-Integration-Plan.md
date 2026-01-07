# Connect iOS Publishing Flow to Real APIs

## What We're Actually Doing

**Context:** Fliplet App 427437 has a screen called "iOS Publishing Flow" (ID: 1856964) that is FULLY BUILT with complete UI but uses MOCK data and fake API calls.

**Task:** Replace the mock JavaScript functions with real Fliplet API v2 calls to make the screen fully functional.

**What We're NOT Doing:**
- ❌ Building new Vue components
- ❌ Creating new screens
- ❌ Modifying HTML structure
- ❌ Changing CSS styles

**What We ARE Doing:**
- ✅ Editing JavaScript in screen 1856964 ONLY
- ✅ Replacing mock data with real API calls
- ✅ Keeping all existing UI/UX exactly as-is

---

## Current State Analysis

**Location:** Fliplet App 427437 → Screen 1856964 "iOS Publishing Flow"

**Existing Assets:**
- ✅ Complete 6-step stepper UI (HTML)
- ✅ All form fields, file uploads, buttons (HTML)
- ✅ Certificate automation UI states (HTML/CSS)
- ✅ Build progress monitoring UI (HTML/CSS)
- ✅ Mock JavaScript with state management
- ✅ Navigation functions working
- ✅ Context panel working

**Current JavaScript Structure:**
```javascript
// Mock data that simulates API responses
const IOS_MOCK_DATA = {
  existingApiKeys: [...],
  bundleIds: [...],
  existingCertificate: {...},
  buildLogs: [...]
};

// State management (keep this)
const iosFlowState = {
  currentStep: 1,
  completedSteps: [],
  formData: { ... }
};

// Navigation functions (keep these)
function goToStep(stepNumber) { ... }
function updateStepperState(currentStep) { ... }

// Validation functions (REPLACE THESE)
function validateStep1() { return true; }
function validateStep2() { /* mock */ return true; }
function validateStep3() { /* mock */ return true; }
// etc.
```

---

## Implementation Strategy

### Approach: Surgical JavaScript Replacement

1. **Keep intact:**
   - All UI navigation functions
   - State management structure
   - DOM manipulation code
   - File upload handlers
   - Stepper visual updates

2. **Replace:**
   - Mock data with API calls
   - `validateStepX()` functions
   - Build polling simulation with real polling

3. **Add:**
   - Helper functions for API calls
   - Error handling
   - File reading utilities

---

## Step-by-Step API Integration

### Prerequisites & Helpers

**Add at the top of JavaScript section:**

```javascript
// Get app and org IDs
const appId = Fliplet.Env.get('appId');
const orgId = Fliplet.Env.get('organizationId');

// Helper: Read file as text
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Helper: Handle API errors
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

---

### Step 1: App Store Connect Confirmation

**Current Status:** ✅ No changes needed
**Function:** `validateStep1()`

This step is just user confirmation with no API call.

```javascript
// Keep as-is:
function validateStep1() {
  iosFlowState.formData.ascConfirmed = true;
  return true;
}
```

---

### Step 2: Apple API Key Configuration

**Replace:** `validateStep2()`, `useExistingApiKey()`, add `loadExistingApiKeys()`

**1. Load existing API keys on page load:**

```javascript
async function loadExistingApiKeys() {
  try {
    const response = await Fliplet.API.request({
      url: `v2/organizations/${orgId}/credentials/api-keys`
    });
    
    if (response && response.length > 0) {
      // Store for later use
      IOS_MOCK_DATA.existingApiKeys = response;
      
      // Show suggestion banner if keys exist
      const firstKey = response[0];
      $('#suggested-team-id').text(firstKey.teamId);
      $('#api-key-suggestion').show();
    }
  } catch (error) {
    console.log('No existing API keys found');
  }
}

// Call on init:
$(document).ready(function() {
  initializeIOSFlow();
  loadExistingApiKeys(); // Add this
});
```

**2. Use existing API key (update function):**

```javascript
function useExistingApiKey(e) {
  e.preventDefault();
  const existingKey = IOS_MOCK_DATA.existingApiKeys[0];
  $('#api-key-name').val(existingKey.name);
  $('#team-id').val(existingKey.teamId);
  $('#issuer-id').val(existingKey.issuerId);
  $('#key-id').val(existingKey.keyId);
  alert('Existing API key loaded. File still required for verification.');
}
```

**3. Validate and create API key (REPLACE function):**

```javascript
async function validateStep2() {
  try {
    const apiKeyName = $('#api-key-name').val().trim();
    const teamId = $('#team-id').val().trim();
    const issuerId = $('#issuer-id').val().trim();
    const keyId = $('#key-id').val().trim();
    const apiKeyFile = $('#api-key-file-input')[0].files[0];
    
    // Validation
    if (!apiKeyName || !teamId || !issuerId || !keyId || !apiKeyFile) {
      showStepError(2, 'Missing Information', 'Please fill in all required fields and upload the .p8 file.');
      return false;
    }
    
    // Read API key file
    const apiKeyContent = await readFileAsText(apiKeyFile);
    
    const apiKeyData = {
      name: apiKeyName,
      teamId: teamId,
      issuerId: issuerId,
      keyId: keyId,
      apiKey: apiKeyContent
    };
    
    // Create/validate API key
    const response = await Fliplet.API.request({
      url: `v2/organizations/${orgId}/credentials/api-key`,
      method: 'POST',
      data: apiKeyData
    });
    
    // Save to state
    iosFlowState.formData.apiKey = {
      name: apiKeyName,
      teamId: teamId,
      issuerId: issuerId,
      keyId: keyId
    };
    
    return true;
  } catch (error) {
    handleApiError(2, error);
    return false;
  }
}
```

---

### Step 3: Bundle & Certificate

**Replace:** `fetchBundleIds()`, `checkCertificateStatus()`, `generateCertificate()`, `handleCertUploadSubmit()`, `validateStep3()`

**Add:** `initializeSubmission()`

**1. Initialize submission when entering Step 3:**

```javascript
// Add to goToStep function, when stepNumber === 3:
if (stepNumber === 3) {
  if (!iosFlowState.submissionId) {
    await initializeSubmission();
  }
  initCertificateAutomation();
  fetchBundleIds(); // Trigger immediately
}

async function initializeSubmission() {
  try {
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
    console.log('Submission initialized:', iosFlowState.submissionId);
  } catch (error) {
    console.error('Failed to initialize submission:', error);
    alert('Failed to initialize submission. Please try again.');
  }
}
```

**2. Fetch bundle IDs (REPLACE):**

```javascript
async function fetchBundleIds() {
  $('#bundle-id-select').html('<option value="">Loading...</option>');
  
  try {
    const response = await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/bundleId`
    });
    
    const options = response.apps.map(app => 
      `<option value="${app.bundleId}">${app.name} (${app.bundleId})</option>`
    ).join('');
    
    $('#bundle-id-select').html('<option value="">Select a bundle ID</option>' + options);
  } catch (error) {
    console.error('Failed to fetch bundle IDs:', error);
    $('#bundle-id-select').html('<option value="">Error loading bundle IDs</option>');
  }
}

// Add bundle ID selection handler to fetch details
$('#bundle-id-select').on('change', async function() {
  const bundleId = $(this).val();
  if (!bundleId) return;
  
  try {
    const response = await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/bundleId/details`,
      data: { bundleId: bundleId }
    });
    
    // Auto-fill version number if available
    if (response.app && response.app.versionString) {
      // Increment version for new build
      const currentVersion = response.app.versionString;
      const parts = currentVersion.split('.');
      parts[1] = parseInt(parts[1] || 0) + 1;
      $('#app-version-input').val(parts.join('.'));
    }
  } catch (error) {
    console.error('Failed to get bundle details:', error);
  }
});
```

**3. Check certificate status (REPLACE):**

```javascript
async function checkCertificateStatus() {
  renderCertStatus('checking');
  
  try {
    const response = await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/check-certificate`,
      method: 'POST'
    });
    
    if (response.validCertificate) {
      certState.status = 'found';
      certState.certificate = {
        teamId: iosFlowState.formData.apiKey.teamId,
        isValid: true
      };
      renderCertStatus('found');
      iosFlowState.formData.certificate = { configured: true, status: 'found' };
    } else {
      generateCertificate();
    }
  } catch (error) {
    console.error('Certificate check failed:', error);
    generateCertificate();
  }
}
```

**4. Generate certificate (REPLACE):**

```javascript
async function generateCertificate() {
  certState.status = 'generating';
  renderCertStatus('generating');
  
  try {
    await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/ios-app-store/certificate`,
      method: 'POST'
    });
    
    certState.status = 'generated';
    certState.certificate = {
      teamId: iosFlowState.formData.apiKey.teamId,
      isValid: true,
      generated: true
    };
    renderCertStatus('generated');
    iosFlowState.formData.certificate = { configured: true, status: 'generated' };
  } catch (error) {
    if (error.status === 'MAX_CERTIFICATES_REACHED') {
      certState.status = 'error';
      certState.errorType = 'capacity';
      renderCertStatus('error');
    } else {
      console.error('Certificate generation failed:', error);
      certState.status = 'error';
      renderCertStatus('error');
    }
  }
}
```

**5. Upload certificate manually (REPLACE):**

```javascript
async function handleCertUploadSubmit() {
  const certFile = $('#cert-file-input')[0].files[0];
  const privateKeyFile = $('#private-key-input')[0].files[0];
  
  if (!certFile) {
    alert('Please upload a certificate file');
    return;
  }
  
  try {
    const certificate = await readFileAsText(certFile);
    const privateKey = privateKeyFile ? await readFileAsText(privateKeyFile) : null;
    
    await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/ios-app-store/certificate`,
      method: 'PUT',
      data: {
        certificate: certificate,
        privateKey: privateKey
      }
    });
    
    certState.status = 'uploaded';
    certState.certificate = {
      teamId: iosFlowState.formData.apiKey.teamId,
      isValid: true,
      uploaded: true
    };
    renderCertStatus('uploaded');
    iosFlowState.formData.certificate = { configured: true, status: 'uploaded' };
  } catch (error) {
    console.error('Certificate upload failed:', error);
    alert('Certificate upload failed: ' + (error.message || 'Unknown error'));
  }
}
```

**6. Submit store config (REPLACE):**

```javascript
async function validateStep3() {
  const bundleId = $('#bundle-id-select').val();
  const appVersion = $('#app-version-input').val().trim();
  
  if (!bundleId) {
    showStepError(3, 'Bundle ID Required', 'Please select a bundle ID to continue.');
    return false;
  }
  
  if (!appVersion) {
    showStepError(3, 'App Version Required', 'Please enter an app version to continue.');
    return false;
  }
  
  if (!iosFlowState.formData.certificate || !iosFlowState.formData.certificate.configured) {
    showStepError(3, 'Certificate Not Configured', 'Please wait for certificate configuration to complete.');
    return false;
  }
  
  try {
    await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/metadata`,
      method: 'PUT',
      data: {
        validationType: 'STORE_CONFIG',
        data: {
          'fl-store-bundleId': bundleId,
          'fl-store-versionNumber': appVersion
        }
      }
    });
    
    iosFlowState.formData.storeConfig = {
      bundleId: bundleId,
      appVersion: appVersion
    };
    
    return true;
  } catch (error) {
    handleApiError(3, error);
    return false;
  }
}
```

---

### Step 4: Push Notifications

**Replace:** `validateStep4()`, `reuseExistingPushConfig()`

**Add:** `checkPushConfig()`, `checkTeamPushConfig()`

**1. Check for existing push config when entering step:**

```javascript
// Add to goToStep function when stepNumber === 4:
if (stepNumber === 4) {
  checkPushConfig();
  checkTeamPushConfig();
}

async function checkPushConfig() {
  try {
    const response = await Fliplet.API.request({
      url: 'v1/widget-instances/com.fliplet.push-notifications',
      data: { appId: appId }
    });
    
    if (response.widgetInstance && response.widgetInstance.settings.apn) {
      // Pre-fill form with existing config
      const settings = response.widgetInstance.settings;
      $('#apns-key-id').val(settings.apnKeyId);
      $('#apns-team-id').val(settings.apnTeamId);
      $('#apns-topic').val(settings.apnTopic);
    }
  } catch (error) {
    console.log('No existing push config');
  }
}

async function checkTeamPushConfig() {
  try {
    const teamId = iosFlowState.formData.apiKey.teamId;
    const response = await Fliplet.API.request({
      url: `v2/organizations/${orgId}/credentials/ios-push-config/${teamId}`
    });
    
    if (response && Object.keys(response).length > 0) {
      $('#push-team-id').text(teamId);
      $('#push-suggestion').show();
      
      // Store for reuse
      IOS_MOCK_DATA.existingPushConfig = {
        teamId: teamId,
        keyId: response.apnKeyId,
        configured: true
      };
    }
  } catch (error) {
    console.log('No team push config');
  }
}
```

**2. Reuse push config (REPLACE):**

```javascript
function reuseExistingPushConfig(e) {
  e.preventDefault();
  const config = IOS_MOCK_DATA.existingPushConfig;
  if (config) {
    $('#apns-key-id').val(config.keyId || '');
    $('#apns-team-id').val(config.teamId || '');
    $('#apns-topic').val(iosFlowState.formData.storeConfig.bundleId || '');
    alert('Push config pre-filled. Auth key file still required.');
  }
}
```

**3. Submit push config (REPLACE):**

```javascript
async function validateStep4() {
  const pushEnabled = $('#enable-push').is(':checked');
  
  if (!pushEnabled) {
    iosFlowState.formData.pushConfig = { enabled: false };
    return true;
  }
  
  try {
    const keyId = $('#apns-key-id').val().trim();
    const teamId = $('#apns-team-id').val().trim();
    const topic = $('#apns-topic').val().trim();
    const authKeyFile = $('#apns-key-input')[0].files[0];
    
    if (!keyId || !teamId || !topic || !authKeyFile) {
      showStepError(4, 'Missing Information', 'Please fill in all push notification fields and upload the .p8 file.');
      return false;
    }
    
    const authKey = await readFileAsText(authKeyFile);
    
    await Fliplet.API.request({
      url: 'v1/widget-instances/com.fliplet.push-notifications/settings',
      method: 'PUT',
      data: {
        appId: appId,
        submissionId: iosFlowState.submissionId,
        platform: 'ios',
        apn: true,
        apnKeyId: keyId,
        apnTeamId: teamId,
        apnTopic: topic,
        apnAuthKey: authKey
      }
    });
    
    iosFlowState.formData.pushConfig = {
      enabled: true,
      keyId: keyId,
      teamId: teamId,
      topic: topic
    };
    
    return true;
  } catch (error) {
    handleApiError(4, error);
    return false;
  }
}
```

---

### Step 5: App Store Listing (Metadata)

**Replace:** `validateStep5()`

**Add:** `uploadMediaFile()`

**1. Upload media file helper:**

```javascript
async function uploadMediaFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await Fliplet.API.request({
    url: `v1/media/files?appId=${appId}&name=${encodeURIComponent(file.name)}`,
    method: 'POST',
    data: formData,
    dataType: 'formdata'
  });
  
  return response.file || response;
}
```

**2. Submit metadata (REPLACE):**

```javascript
async function validateStep5() {
  const appIconFile = $('#app-icon-input')[0].files[0];
  const splashFile = $('#splash-screen-input')[0].files[0];
  const appName = $('#app-name-input').val().trim();
  
  if (!appIconFile || !splashFile || !appName) {
    showStepError(5, 'Missing Information', 'Please upload app icon, splash screen, and enter app name.');
    return false;
  }
  
  try {
    // Upload files
    const appIcon = await uploadMediaFile(appIconFile);
    const splashScreen = await uploadMediaFile(splashFile);
    
    // Submit metadata
    await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/metadata`,
      method: 'PUT',
      data: {
        validationType: 'APP_METADATA',
        data: {
          appIcon: appIcon.url,
          splashScreen: { url: splashScreen.url },
          'fl-store-iconName': appName
        }
      }
    });
    
    iosFlowState.formData.metadata = {
      appName: appName,
      hasIcon: true,
      hasSplash: true
    };
    
    return true;
  } catch (error) {
    handleApiError(5, error);
    return false;
  }
}
```

---

### Step 6: Review & Build

**Replace:** `startBuild()`, `simulateBuildProcess()`

**Add:** `pollBuildStatus()`, `updateBuildProgress()`, `showBuildSuccess()`, `showBuildError()`

**1. Trigger build (REPLACE):**

```javascript
async function startBuild() {
  $('#step-6-back').hide();
  $('#step-6-submit').hide();
  $('#build-section').show();
  $('#build-status-container').show();
  $('#build-success-container').hide();
  $('#build-error').hide();
  
  try {
    await Fliplet.API.request({
      url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}/build`,
      method: 'POST'
    });
    
    // Start polling
    pollBuildStatus();
  } catch (error) {
    showBuildError(error.message || 'Failed to trigger build');
  }
}
```

**2. Poll build status (NEW):**

```javascript
let buildPollingInterval = null;

async function pollBuildStatus() {
  buildPollingInterval = setInterval(async () => {
    try {
      const response = await Fliplet.API.request({
        url: `v2/apps/${appId}/submissions/${iosFlowState.submissionId}`
      });
      
      const submission = response.submission;
      
      if (submission.status === 'completed') {
        clearInterval(buildPollingInterval);
        showBuildSuccess();
      } else if (submission.status === 'failed') {
        clearInterval(buildPollingInterval);
        showBuildError(submission.error || 'Build failed');
      } else {
        updateBuildProgress(submission);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000); // Poll every 5 seconds
}

function updateBuildProgress(submission) {
  // Update progress based on submission data
  const statusMessages = {
    'started': 'Build started...',
    'processing': 'Building your app...',
    'uploading': 'Uploading to App Store Connect...'
  };
  
  const message = statusMessages[submission.status] || 'Processing...';
  $('#build-status-message').text(message);
  
  // Add to logs if available
  if (submission.logs && submission.logs.length > 0) {
    submission.logs.forEach(log => {
      if (!$('#build-logs').text().includes(log.message)) {
        $('#build-logs').append(`<div class="build-log-item">${log.message}</div>`);
      }
    });
  }
}

function showBuildSuccess() {
  $('#build-status-icon').html('<div class="success-checkmark">✓</div>');
  $('#build-status-title').text('Build Complete!');
  $('#build-status-message').text('Your app is ready');
  
  setTimeout(() => {
    $('#build-status-container').hide();
    $('#build-success-container').show();
  }, 1000);
  
  if (!iosFlowState.completedSteps.includes(6)) {
    iosFlowState.completedSteps.push(6);
  }
  updateStepperState(6);
}

function showBuildError(errorMessage) {
  $('#build-status-container').hide();
  $('#build-error').show();
  $('#build-error .error-message').text(errorMessage);
}
```

---

## Implementation Checklist

### Phase 1: Setup & Helpers
- [ ] Add app/org ID retrieval
- [ ] Add `readFileAsText()` helper
- [ ] Add `handleApiError()` helper
- [ ] Add `uploadMediaFile()` helper

### Phase 2: Step-by-Step Integration
- [ ] Step 1: Verify no changes needed
- [ ] Step 2: Add `loadExistingApiKeys()` and update `validateStep2()`
- [ ] Step 3: Add `initializeSubmission()`, update `fetchBundleIds()`, certificate functions, and `validateStep3()`
- [ ] Step 4: Add push config check functions and update `validateStep4()`
- [ ] Step 5: Update `validateStep5()` with file upload
- [ ] Step 6: Replace build simulation with real polling

### Phase 3: Testing
- [ ] Test Step 2: API key creation
- [ ] Test Step 3: Bundle fetch and certificate automation
- [ ] Test Step 3: Manual certificate upload fallback
- [ ] Test Step 4: Push notification configuration
- [ ] Test Step 5: File uploads and metadata
- [ ] Test Step 6: Complete build flow end-to-end
- [ ] Test error handling for all steps
- [ ] Test navigation and resume

---

## Deployment Method

**Tool:** Fliplet MCP Studio tools

**Command:**
```javascript
mcp_fliplet-studio_edit_screen_code({
  screenId: "1856964",
  js_edits: [
    {
      old_string: "// existing code to replace",
      new_string: "// new code with API calls"
    }
  ]
})
```

**Strategy:** Make surgical edits to specific functions rather than replacing entire JavaScript file.

---

## Success Criteria

✅ All 6 steps connect to real Fliplet v2 APIs
✅ Certificate automation works with fallback options
✅ Build monitored in real-time via polling
✅ Errors displayed with user-friendly messages
✅ Files upload successfully
✅ Complete iOS app can be built end-to-end
✅ UI/UX remains exactly as designed
✅ No changes to HTML or CSS







