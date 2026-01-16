# Custom Web Domain Setup - Complete Code Reference

This document contains all the code needed to implement custom domain setup functionality.

---

## Table of Contents
1. [Configuration & Constants](#configuration--constants)
2. [API Layer](#api-layer)
3. [Domain Setup Functions](#domain-setup-functions)
4. [Publishing Functions](#publishing-functions)
5. [Helper Functions](#helper-functions)
6. [Status Determination](#status-determination)
7. [UI Interaction Handlers](#ui-interaction-handlers)
8. [Error Messages](#error-messages)

---

## Configuration & Constants

```javascript
// API base URLs by region
const API_BASE_URLS = {
  eu: 'https://api.fliplet.com/',
  us: 'https://us.api.fliplet.com/',
  ca: 'https://ca.api.fliplet.com/'
};

// Default Fliplet web app URLs by region
const FLIPLET_APP_URLS = {
  eu: 'https://apps.fliplet.com/',
  us: 'https://us-apps.fliplet.com/',
  ca: 'https://ca-apps.fliplet.com/'
};

// All possible domain configuration statuses
const DOMAIN_STATUSES = {
  NOT_STARTED: ['NO_CONFIG_FOUND'],
  IN_PROGRESS: ['PENDING_SSL_VERIFICATION', 'PENDING_DNS_VERIFICATION', 'SSL_ISSUED'],
  FAILED_RECOVERABLE: ['FAILED_DNS', 'FAILED_SSL', 'CNAME_ALREADY_EXISTS', 'VALIDATION_TIMED_OUT'],
  FAILED_TERMINAL: ['CERTIFICATE_EXPIRED'],
  COMPLETE: ['ACTIVE', 'INACTIVE']
};

// User-friendly error messages for each status
const ERROR_MESSAGES = {
  DOMAIN_NAME_NOT_PROVIDED: `Please enter the subdomain you'd like to set up (for example, blog.example.com) to continue.`,
  INVALID_DOMAIN_NAME: `That doesn't look like a valid subdomain. Make sure you include both the prefix and main domain (e.g., blog.example.com) and try again.`,
  DOMAIN_NAME_EXISTS: 'This domain name is already in use. Please choose an alternative option.',
  DOMAIN_CONFIG_EXISTS: 'A domain configuration already exists for your app. If you recently removed a domain, please note that it may take up to 20 minutes before you can add a new one.',
  ISSUE_IN_CERTIFICATE_REQUEST: 'We encountered an issue generating the SSL certificate for your subdomain. Please try again, or contact support if it continues.',
  CF_DISTRIBUTION_NOT_FOUND: 'We couldn\'t locate DNS records for that subdomain. Click the "Refresh status" button to try again',
  CERTIFICATE_ISSUE_ERROR: 'There was an error issuing an SSL certificate for your subdomain. Retry now, or reach out to support if the problem persists.',
  FAILED_DNS: 'Failed to verify DNS records',
  FAILED_SSL: 'SSL setup failed because you do not have ownership of this domain. Please verify that you own the domain and have the correct permissions. If the issue persists, contact support for assistance',
  CNAME_ALREADY_EXISTS: 'The specified subdomain already has a CNAME entry pointing to another domain',
  CERTIFICATE_EXPIRED: 'Certificate is expired',
  VALIDATION_TIMED_OUT: 'SSL validation error — please verify that DNS records were entered correctly, and try again. If the issue persists, contact support for assistance'
};

// Get API base URL for current region
function getApiBaseUrl(region) {
  return API_BASE_URLS[region || 'eu'];
}

// Get Fliplet app URL for current region
function getFlipletAppUrl(region) {
  return FLIPLET_APP_URLS[region || 'eu'];
}
```

---

## API Layer

### Base AJAX Function

```javascript
/**
 * Make authenticated API request
 * @param {string} url - Full API URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body (optional)
 * @returns {Promise} - Resolves with response data
 */
function apiRequest(url, method, data = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: method,
      contentType: 'application/json',
      data: method !== 'GET' ? JSON.stringify(data) : undefined,
      xhrFields: {
        withCredentials: true
      },
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}
```

### Domain APIs

```javascript
/**
 * Get current domain configuration status
 * @param {number} appId
 * @param {string} region - 'eu', 'us', or 'ca'
 * @returns {Promise<{status: string, domainName?: string, message?: string}>}
 */
function getDomainStatus(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains/status`;

  return apiRequest(url, 'GET')
    .then(response => response)
    .catch(error => {
      // 500 error typically means no configuration exists
      if (error.status === 500) {
        return { status: 'NO_CONFIG_FOUND' };
      }
      throw getErrorMessage(error);
    });
}

/**
 * Validate domain name format and availability
 * @param {string} domainName - e.g., "app.example.com"
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{valid: boolean, message?: string, error?: string}>}
 */
function verifyDomainName(domainName, appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains/verify-domain`;

  return apiRequest(url, 'POST', { domainName })
    .catch(error => {
      throw getErrorMessage(error);
    });
}

/**
 * Start domain configuration process
 * @param {number} appId
 * @param {string} domainName
 * @param {string} region
 * @returns {Promise<{status: string}>}
 */
function configureDomain(appId, domainName, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains`;

  return apiRequest(url, 'POST', { domainName })
    .catch(error => {
      throw getErrorMessage(error);
    });
}

/**
 * Get SSL certificate validation CNAME records
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{domainValidationRecords: Array}>}
 */
function getCertificateValidationRecords(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains/certificate-validation-records`;

  return apiRequest(url, 'GET')
    .catch(error => {
      throw getErrorMessage(error);
    });
}

/**
 * Get DNS CNAME records for domain association
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{dnsRecord: {Type: string, Name: string, Value: string}}>}
 */
function getDNSRecords(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains/dns-records`;

  return apiRequest(url, 'GET')
    .catch(error => {
      throw getErrorMessage(error);
    });
}

/**
 * Trigger domain verification check
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{status: string, domainValidationRecords?: Array, dnsRecord?: object}>}
 */
function triggerDomainVerification(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains/verify`;

  return apiRequest(url, 'POST')
    .catch(error => {
      throw getErrorMessage(error);
    });
}

/**
 * Remove domain configuration
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{message: string}>}
 */
function removeDomainConfiguration(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains`;

  return apiRequest(url, 'DELETE')
    .catch(error => {
      throw getErrorMessage(error);
    });
}

/**
 * Publish to custom domain (true) or switch back to Fliplet domain (false)
 * @param {number} appId
 * @param {boolean} publishToCustom
 * @param {string} region
 */
function setDomainPublishState(appId, publishToCustom, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/domains/publish`;

  return apiRequest(url, 'POST', { published: publishToCustom })
    .catch(error => {
      throw getErrorMessage(error);
    });
}
```

### App APIs

```javascript
/**
 * Get app information including publishing settings
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{app: object}>}
 */
function getAppInfo(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}`;
  return apiRequest(url, 'GET');
}

/**
 * Get user's plan for the app
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{plan: {name: string}}>}
 */
function getAppPlan(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/user/plan?appId=${appId}`;
  return apiRequest(url, 'GET');
}

/**
 * Get organization name
 * @param {number} organizationId
 * @param {string} region
 * @returns {Promise<string>}
 */
function getOrganizationName(organizationId, region) {
  const url = `${getApiBaseUrl(region)}v1/organizations/${organizationId}`;

  return apiRequest(url, 'GET')
    .then(response => response.name);
}

/**
 * Update app URL slug
 * @param {number} appId
 * @param {string} slug
 * @param {string} region
 */
function updateAppSlug(appId, slug, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/slug/${slug}`;
  return apiRequest(url, 'PUT');
}

/**
 * Delete app slug (unpublish from Fliplet domain)
 * @param {number} appId
 * @param {string} region
 */
function deleteAppSlug(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/slug`;
  return apiRequest(url, 'DELETE');
}

/**
 * Publish app to web
 * @param {number} appId
 * @param {string} region
 */
function publishApp(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/publish`;
  return apiRequest(url, 'POST');
}

/**
 * Update app settings
 * @param {number} appId
 * @param {object} settings - e.g., { allowWebEmbed: true, gtmTrackingId: 'G-XXX' }
 * @param {string} region
 */
function updateAppSettings(appId, settings, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/settings`;
  return apiRequest(url, 'POST', settings);
}

/**
 * Get app auth tokens
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{appTokens: Array}>}
 */
function getAppTokens(appId, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/tokens`;
  return apiRequest(url, 'GET');
}

/**
 * Create new app token
 * @param {number} appId
 * @param {string} tokenName
 * @param {string} region
 */
function createAppToken(appId, tokenName, region) {
  const url = `${getApiBaseUrl(region)}v1/apps/${appId}/tokens`;
  return apiRequest(url, 'POST', { tokens: [{ name: tokenName }] });
}
```

---

## Domain Setup Functions

### Step 1: Domain Name Validation & Configuration

```javascript
/**
 * Validate domain name with debounce for real-time feedback
 * @param {string} domainName
 * @param {number} appId
 * @param {string} region
 * @param {function} onValid - Callback when domain is valid
 * @param {function} onInvalid - Callback when domain is invalid
 * @param {function} onError - Callback on error
 */
let domainValidationTimer;

function validateDomainNameDebounced(domainName, appId, region, onValid, onInvalid, onError) {
  clearTimeout(domainValidationTimer);

  // Don't validate empty input
  if (!domainName || !domainName.trim()) {
    return;
  }

  domainValidationTimer = setTimeout(() => {
    verifyDomainName(domainName.trim(), appId, region)
      .then(response => {
        if (response.valid) {
          onValid(response.message);
        } else {
          onInvalid(response.error);
        }
      })
      .catch(error => {
        onError(error);
      });
  }, 1500); // 1.5 second debounce
}

/**
 * Start domain configuration after validation
 * @param {number} appId
 * @param {string} domainName
 * @param {string} region
 * @returns {Promise<{status: string}>}
 */
async function startDomainConfiguration(appId, domainName, region) {
  // Ensure app has a slug first (required for publishing)
  await ensureAppHasSlug(appId, region);

  // Start domain configuration
  const response = await configureDomain(appId, domainName, region);

  // If configuration started successfully, wait a bit then check status
  if (DOMAIN_STATUSES.IN_PROGRESS.includes(response.status)) {
    await delay(5000);
    return await getDomainStatus(appId, region);
  }

  return response;
}

/**
 * Remove domain configuration with confirmation
 * @param {number} appId
 * @param {string} region
 */
async function removeDomain(appId, region) {
  const response = await removeDomainConfiguration(appId, region);

  // Clean up settings data source entry if exists
  await deleteAppSettingsEntry(appId, region);

  return response;
}
```

### Step 2: SSL Certificate Verification

```javascript
/**
 * Fetch SSL CNAME records with retry logic
 * @param {number} appId
 * @param {string} region
 * @param {number} maxRetries - Default 3
 * @param {number} retryDelayMs - Default 5000
 * @returns {Promise<{Type: string, Name: string, Value: string}>}
 */
async function fetchSSLRecords(appId, region, maxRetries = 3, retryDelayMs = 5000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await getCertificateValidationRecords(appId, region);

      const record = response.domainValidationRecords?.[0]?.resourceRecord;

      if (record) {
        return {
          Type: record.Type,
          Name: record.Name,
          Value: record.Value
        };
      }

      // Check if still pending
      const validationStatus = response.domainValidationRecords?.[0]?.validationStatus;

      if (validationStatus === 'PENDING_VALIDATION' && attempt < maxRetries - 1) {
        await delay(retryDelayMs);
        continue;
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await delay(retryDelayMs);
    }
  }

  throw new Error('Could not retrieve SSL validation records');
}

/**
 * Check SSL verification status
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{verified: boolean, pending?: boolean, error?: string, status: string}>}
 */
async function checkSSLStatus(appId, region) {
  // Trigger verification check
  await triggerDomainVerification(appId, region);

  // Get updated status
  const status = await getDomainStatus(appId, region);

  if (status.status === 'PENDING_SSL_VERIFICATION') {
    return { verified: false, pending: true, status: status.status };
  }

  if (['SSL_ISSUED', 'PENDING_DNS_VERIFICATION', 'ACTIVE', 'INACTIVE'].includes(status.status)) {
    return { verified: true, status: status.status };
  }

  if (['VALIDATION_TIMED_OUT', 'FAILED_SSL'].includes(status.status)) {
    return { verified: false, error: getErrorMessage({ status: status.status }), status: status.status };
  }

  return { verified: false, error: status.message || 'Unknown error', status: status.status };
}
```

### Step 3: DNS Association

```javascript
/**
 * Fetch DNS CNAME records
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{Type: string, Name: string, Value: string}>}
 */
async function fetchDNSRecords(appId, region) {
  const response = await getDNSRecords(appId, region);

  if (response.dnsRecord) {
    return {
      Type: response.dnsRecord.Type,
      Name: response.dnsRecord.Name,
      Value: response.dnsRecord.Value
    };
  }

  throw new Error('DNS records not available');
}

/**
 * Check DNS verification status
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{verified: boolean, pending?: boolean, error?: string, domainName?: string, status: string}>}
 */
async function checkDNSStatus(appId, region) {
  // Trigger verification check
  const verifyResponse = await triggerDomainVerification(appId, region);

  // Get updated status
  const status = await getDomainStatus(appId, region);

  if (status.status === 'PENDING_DNS_VERIFICATION') {
    return { verified: false, pending: true, status: status.status, dnsRecord: verifyResponse.dnsRecord };
  }

  if (['ACTIVE', 'INACTIVE'].includes(status.status)) {
    return { verified: true, domainName: status.domainName, status: status.status };
  }

  if (['FAILED_DNS', 'CNAME_ALREADY_EXISTS'].includes(status.status)) {
    return { verified: false, error: getErrorMessage({ status: status.status }), status: status.status };
  }

  return { verified: false, error: status.message || 'Unknown error', status: status.status };
}
```

---

## Publishing Functions

```javascript
/**
 * Check if app is published to web
 * @param {object} appInfo - Response from getAppInfo
 * @returns {boolean}
 */
function isAppPublishedToWeb(appInfo) {
  return !!appInfo.app.productionAppId && !!appInfo.app.settings?.slug;
}

/**
 * Get complete publishing state
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<object>}
 */
async function getPublishingState(appId, region) {
  const [appInfo, domainStatus] = await Promise.all([
    getAppInfo(appId, region),
    getDomainStatus(appId, region).catch(() => ({ status: 'NO_CONFIG_FOUND' }))
  ]);

  const isPublished = isAppPublishedToWeb(appInfo);
  const customDomainActive = domainStatus.status === 'ACTIVE';
  const customDomainConfigured = ['ACTIVE', 'INACTIVE'].includes(domainStatus.status);

  return {
    appInfo,
    domainStatus,
    flipletDomain: {
      published: isPublished && !customDomainActive,
      canPublish: !isPublished || customDomainActive,
      canUnpublish: isPublished && !customDomainActive,
      canSwitchTo: customDomainActive,
      url: isPublished ? `${getFlipletAppUrl(region)}${appInfo.app.settings.slug}` : null,
      slug: appInfo.app.settings?.slug
    },
    customDomain: {
      configured: customDomainConfigured,
      published: customDomainActive,
      canPublish: customDomainConfigured && !customDomainActive && !isPublished,
      canSwitchTo: customDomainConfigured && !customDomainActive && isPublished,
      canUnpublish: customDomainActive,
      url: customDomainActive ? `https://${domainStatus.domainName}` : null,
      domainName: domainStatus.domainName,
      status: domainStatus.status
    }
  };
}

/**
 * Ensure app has a URL slug (generate one if needed)
 * @param {number} appId
 * @param {string} region
 */
async function ensureAppHasSlug(appId, region) {
  const appInfo = await getAppInfo(appId, region);

  if (!appInfo.app.settings?.slug) {
    const orgName = await getOrganizationName(appInfo.app.organizationId, region);
    const slug = generateSlug(orgName, appInfo.app.name);
    await updateAppSlug(appId, slug, region);
  }
}

/**
 * Ensure app has at least one auth token
 * @param {number} appId
 * @param {string} region
 */
async function ensureAppHasToken(appId, region) {
  const response = await getAppTokens(appId, region);

  if (!response.appTokens || response.appTokens.length === 0) {
    await createAppToken(appId, 'Web app', region);
  }
}

/**
 * Publish to Fliplet domain
 * @param {number} appId
 * @param {string} region
 */
async function publishToFlipletDomain(appId, region) {
  await ensureAppHasSlug(appId, region);
  await publishApp(appId, region);
  await ensureAppHasToken(appId, region);
}

/**
 * Publish to custom domain
 * @param {number} appId
 * @param {string} region
 */
async function publishToCustomDomain(appId, region) {
  // Check if app is already published to web
  const appInfo = await getAppInfo(appId, region);

  if (!isAppPublishedToWeb(appInfo)) {
    // Need to do initial web publish first (without the final publish step)
    await ensureAppHasSlug(appId, region);
    await ensureAppHasToken(appId, region);
  }

  // Switch to custom domain
  await setDomainPublishState(appId, true, region);
}

/**
 * Switch from custom domain to Fliplet domain
 * @param {number} appId
 * @param {string} region
 */
async function switchToFlipletDomain(appId, region) {
  await setDomainPublishState(appId, false, region);
}

/**
 * Switch from Fliplet domain to custom domain
 * @param {number} appId
 * @param {string} region
 */
async function switchToCustomDomain(appId, region) {
  await setDomainPublishState(appId, true, region);
}

/**
 * Unpublish from Fliplet domain
 * @param {number} appId
 * @param {string} region
 */
async function unpublishFlipletDomain(appId, region) {
  await deleteAppSlug(appId, region);
}

/**
 * Unpublish from custom domain
 * @param {number} appId
 * @param {string} region
 */
async function unpublishCustomDomain(appId, region) {
  await switchToFlipletDomain(appId, region);
  await deleteAppSlug(appId, region);
}

/**
 * Update Fliplet domain slug
 * @param {number} appId
 * @param {string} newSlug
 * @param {string} region
 */
async function updateFlipletDomainSlug(appId, newSlug, region) {
  await updateAppSlug(appId, newSlug, region);
}
```

---

## Helper Functions

```javascript
/**
 * Generate URL-friendly slug from org and app name
 * @param {string} orgName
 * @param {string} appName
 * @returns {string}
 */
function generateSlug(orgName, appName) {
  const randomId = generateRandomId(8);
  const combined = `${orgName}-${appName}-${randomId}`;
  return kebabCase(combined.toLowerCase());
}

/**
 * Generate random alphanumeric string
 * @param {number} length
 * @returns {string}
 */
function generateRandomId(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert string to kebab-case
 * @param {string} str
 * @returns {string}
 */
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Delay execution
 * @param {number} ms
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {boolean} - Success status
 */
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Copy failed:', err);
  }

  document.body.removeChild(textarea);
  return success;
}

/**
 * Generate embed script code
 * @param {number} productionAppId
 * @param {string} authToken
 * @returns {string}
 */
function generateEmbedCode(productionAppId, authToken) {
  return `<script src="https://cdn.api.fliplet.com/v1/apps/${productionAppId}/embed.js?auth_token=${authToken}"><\/script>`;
}

/**
 * Validate Google Tag Manager ID format
 * @param {string} code
 * @returns {boolean}
 */
function isValidGTMId(code) {
  // G-XXXXXXXXXX (GA4) or GTM-XXXXXXX (Tag Manager)
  return /^(G-[0-9A-Z]{10,}|GTM-[0-9A-Z]{6,})$/.test(code);
}

/**
 * Get error message from response or status code
 * @param {object|string} response
 * @returns {string}
 */
function getErrorMessage(response) {
  // Handle string status directly
  if (typeof response === 'string' && ERROR_MESSAGES[response]) {
    return ERROR_MESSAGES[response];
  }

  // Handle response object
  let status;
  if (response?.responseJSON?.status) {
    status = response.responseJSON.status;
  } else if (response?.status && typeof response.status === 'string') {
    status = response.status;
  }

  if (status && ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }

  // Fall back to message in response
  if (response?.responseJSON?.message) {
    return response.responseJSON.message;
  }

  if (response?.message) {
    return response.message;
  }

  return 'There was an error. Please try again or contact support.';
}
```

---

## Status Determination

```javascript
/**
 * Determine which step of the setup process we're on
 * @param {string} domainStatus
 * @returns {object} - { step: number|string, canProceed: boolean }
 */
function determineCurrentStep(domainStatus) {
  // Not started - show domain input
  if (DOMAIN_STATUSES.NOT_STARTED.includes(domainStatus)) {
    return { step: 1, phase: 'input', canProceed: false };
  }

  // SSL verification pending
  if (domainStatus === 'PENDING_SSL_VERIFICATION') {
    return { step: 2, phase: 'pending', canProceed: false };
  }

  // SSL failed
  if (domainStatus === 'VALIDATION_TIMED_OUT' || domainStatus === 'FAILED_SSL') {
    return { step: 2, phase: 'failed', canProceed: false, error: getErrorMessage(domainStatus) };
  }

  // SSL done, DNS pending
  if (domainStatus === 'SSL_ISSUED' || domainStatus === 'PENDING_DNS_VERIFICATION') {
    return { step: 3, phase: 'pending', canProceed: false };
  }

  // DNS failed
  if (domainStatus === 'FAILED_DNS' || domainStatus === 'CNAME_ALREADY_EXISTS') {
    return { step: 3, phase: 'failed', canProceed: false, error: getErrorMessage(domainStatus) };
  }

  // Complete
  if (DOMAIN_STATUSES.COMPLETE.includes(domainStatus)) {
    return { step: 'complete', phase: 'success', canProceed: true };
  }

  // Terminal failure
  if (DOMAIN_STATUSES.FAILED_TERMINAL.includes(domainStatus)) {
    return { step: 'error', phase: 'terminal', canProceed: false, error: getErrorMessage(domainStatus) };
  }

  return { step: 1, phase: 'unknown', canProceed: false };
}

/**
 * Get stepper/progress indicator state for each step
 * @param {string} domainStatus
 * @param {number} currentViewStep - Which step the UI is currently showing
 * @returns {object} - State for each step
 */
function getStepperState(domainStatus, currentViewStep) {
  const currentStep = determineCurrentStep(domainStatus);

  const stepStates = {
    step1: 'inactive',
    step2: 'inactive',
    step3: 'inactive'
  };

  // Determine step 1 state
  if (currentStep.step === 1) {
    stepStates.step1 = currentViewStep === 1 ? 'active' : 'incomplete';
  } else if (currentStep.step > 1 || currentStep.step === 'complete') {
    stepStates.step1 = 'complete';
  } else if (domainStatus === 'FAILED_SSL' || domainStatus === 'CNAME_ALREADY_EXISTS' || domainStatus === 'CERTIFICATE_EXPIRED') {
    stepStates.step1 = 'error';
  }

  // Determine step 2 state
  if (currentStep.step === 2) {
    if (currentStep.phase === 'failed') {
      stepStates.step2 = 'error';
    } else {
      stepStates.step2 = currentViewStep === 2 ? 'active' : 'incomplete';
    }
  } else if (currentStep.step > 2 || currentStep.step === 'complete') {
    stepStates.step2 = 'complete';
  }

  // Determine step 3 state
  if (currentStep.step === 3) {
    if (currentStep.phase === 'failed') {
      stepStates.step3 = 'error';
    } else {
      stepStates.step3 = currentViewStep === 3 ? 'active' : 'incomplete';
    }
  } else if (currentStep.step === 'complete') {
    stepStates.step3 = 'complete';
  }

  return stepStates;
}

/**
 * Check if user can use custom domain feature (plan check)
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<boolean>}
 */
async function canUseCustomDomain(appId, region) {
  const planInfo = await getAppPlan(appId, region);
  return planInfo.plan.name !== 'free';
}
```

---

## UI Interaction Handlers

### Embed Code Management

```javascript
/**
 * Enable web embedding
 * @param {number} appId
 * @param {string} region
 */
async function enableWebEmbed(appId, region) {
  await updateAppSettings(appId, { allowWebEmbed: true }, region);
}

/**
 * Disable web embedding
 * @param {number} appId
 * @param {string} region
 */
async function disableWebEmbed(appId, region) {
  await updateAppSettings(appId, { allowWebEmbed: false }, region);
}

/**
 * Get embed code for display
 * @param {number} appId
 * @param {string} region
 * @param {string} selectedToken - Optional specific token to use
 * @returns {Promise<{embedCode: string, tokens: Array}>}
 */
async function getEmbedCodeData(appId, region, selectedToken = null) {
  const [appInfo, tokensResponse] = await Promise.all([
    getAppInfo(appId, region),
    getAppTokens(appId, region)
  ]);

  const productionAppId = appInfo.app.productionAppId;
  const tokens = tokensResponse.appTokens || [];

  // Find token to use
  let authToken = selectedToken;
  if (!authToken) {
    const webAppToken = tokens.find(t => t.fullName === 'Web app');
    const appToken = tokens.find(t => t.type === 'appToken');
    authToken = webAppToken?.auth_token || appToken?.auth_token;
  }

  return {
    embedCode: authToken ? generateEmbedCode(productionAppId, authToken) : null,
    tokens: tokens.map(t => ({ id: t.auth_token, name: t.fullName || t.name })),
    webEmbedEnabled: appInfo.app.settings?.allowWebEmbed || false
  };
}
```

### Token Management

```javascript
/**
 * Create a new auth token
 * @param {number} appId
 * @param {string} tokenName
 * @param {string} region
 * @returns {Promise<{token: string, tokens: Array}>}
 */
async function createNewToken(appId, tokenName, region) {
  const response = await createAppToken(appId, tokenName, region);

  // Get updated token list
  const tokensResponse = await getAppTokens(appId, region);

  // Find the newly created token
  const newToken = response.appTokens?.[tokenName]?.token;

  return {
    token: newToken,
    tokens: tokensResponse.appTokens.map(t => ({ id: t.auth_token, name: t.fullName || t.name }))
  };
}
```

### Google Analytics

```javascript
/**
 * Save Google Analytics tracking ID
 * @param {number} appId
 * @param {string} gtmId
 * @param {string} region
 */
async function saveGoogleAnalytics(appId, gtmId, region) {
  if (!isValidGTMId(gtmId)) {
    throw new Error('Invalid tracking ID format. Use G-XXXXXXXXXX or GTM-XXXXXXX');
  }

  await updateAppSettings(appId, { gtmTrackingId: gtmId }, region);
}
```

---

## Settings Data Source (Progress Tracking)

```javascript
/**
 * Get or create settings data source for app
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<{dataSourceId: number, entry: object|null}>}
 */
async function getOrCreateSettingsDataSource(appId, region) {
  const dsName = `Analytics - Integrations [${appId}]`;

  // Get all data sources
  const response = await apiRequest(`${getApiBaseUrl(region)}v1/data-sources`, 'GET');

  // Find existing
  let dataSource = response.dataSources.find(ds => ds.name === dsName && ds.appId == appId);

  // Create if doesn't exist
  if (!dataSource) {
    const createResponse = await apiRequest(`${getApiBaseUrl(region)}v1/data-sources`, 'POST', {
      name: dsName,
      appId: appId,
      type: 'bookmarks'
    });
    dataSource = createResponse.dataSource;
  }

  // Find entry for this app
  const entriesResponse = await apiRequest(
    `${getApiBaseUrl(region)}v1/data-sources/${dataSource.id}/data/query`,
    'POST',
    { where: { AppId: appId } }
  );

  return {
    dataSourceId: dataSource.id,
    entry: entriesResponse.entries?.[0] || null
  };
}

/**
 * Save progress settings
 * @param {number} appId
 * @param {string} region
 * @param {object} settings - e.g., { 'SSL copied': 'Yes' }
 */
async function saveAppSettings(appId, region, settings) {
  const { dataSourceId, entry } = await getOrCreateSettingsDataSource(appId, region);

  const data = { AppId: appId, ...settings };

  if (entry) {
    // Update existing
    await apiRequest(
      `${getApiBaseUrl(region)}v1/data-sources/${dataSourceId}/data/${entry.id}`,
      'PUT',
      data
    );
  } else {
    // Create new
    await apiRequest(
      `${getApiBaseUrl(region)}v1/data-sources/${dataSourceId}/data`,
      'PUT',
      data
    );
  }
}

/**
 * Get app settings entry
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<object|null>}
 */
async function getAppSettings(appId, region) {
  const { entry } = await getOrCreateSettingsDataSource(appId, region);
  return entry;
}

/**
 * Delete app settings entry
 * @param {number} appId
 * @param {string} region
 */
async function deleteAppSettingsEntry(appId, region) {
  const { dataSourceId, entry } = await getOrCreateSettingsDataSource(appId, region);

  if (entry) {
    await apiRequest(
      `${getApiBaseUrl(region)}v1/data-sources/${dataSourceId}/commit`,
      'POST',
      {
        entries: [],
        delete: [entry.id],
        append: true,
        extend: true,
        runHooks: []
      }
    );
  }
}
```

---

## Complete Initialization Example

```javascript
/**
 * Initialize the domain setup UI with all necessary data
 * @param {number} appId
 * @param {string} region
 * @returns {Promise<object>} - All data needed to render UI
 */
async function initializeDomainSetup(appId, region) {
  // Check if feature is available
  const canUse = await canUseCustomDomain(appId, region);

  if (!canUse) {
    return {
      available: false,
      reason: 'Custom domain is not available on your current plan'
    };
  }

  // Get publishing state (includes app info and domain status)
  const publishingState = await getPublishingState(appId, region);

  // Determine current step
  const stepInfo = determineCurrentStep(publishingState.customDomain.status);

  // Get saved progress
  const savedSettings = await getAppSettings(appId, region);

  // Build response based on current step
  const result = {
    available: true,
    publishingState,
    currentStep: stepInfo,
    savedSettings: savedSettings?.data || {},
    stepperState: getStepperState(publishingState.customDomain.status, stepInfo.step)
  };

  // Add step-specific data
  if (stepInfo.step === 2 && stepInfo.phase !== 'failed') {
    try {
      result.sslRecord = await fetchSSLRecords(appId, region);
    } catch (e) {
      result.sslRecordError = e.message;
    }
  }

  if (stepInfo.step === 3 && stepInfo.phase !== 'failed') {
    try {
      result.dnsRecord = await fetchDNSRecords(appId, region);
    } catch (e) {
      result.dnsRecordError = e.message;
    }
  }

  return result;
}
```

---

## Usage Notes

### Required Query Parameters
The app expects these in the URL:
- `appId` - The Fliplet app ID
- `region` - API region ('eu', 'us', 'ca')

```javascript
const appId = Fliplet.Navigate.query.appId;
const region = Fliplet.Navigate.query.region || 'eu';
```

### Key User Flows

1. **First-time setup**: Domain input → SSL verification → DNS verification → Auto-publish
2. **Resume setup**: Detect current step from status → Show appropriate UI
3. **Change domain**: Remove existing → Start fresh
4. **Switch publishing**: Toggle between Fliplet/custom domain

### Important Warnings to Show Users
- Cloudflare proxy must be OFF during setup
- Changing/removing domain affects live apps
- SSO settings may need updating after domain changes
- Requires republishing to app stores after domain change
