/**
 * Android Publishing API Service
 * Handles all API calls for Android app publishing workflow
 */

const API_BASE = '/v2'; // Adjust based on your API configuration
const WIDGET_API_BASE = '/v1';

/**
 * Initialize a new Android publishing submission
 * @param {number} appId - The app ID
 * @returns {Promise<Object>} Submission data including submissionId
 */
export async function initializePublishing(appId) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      platform: 'Android'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize publishing');
  }

  return response.json();
}

/**
 * Get the latest submission for Android
 * @param {number} appId - The app ID
 * @returns {Promise<Object>} Latest submission data
 */
export async function getLatestSubmission(appId) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/latest?platform=android`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No submission exists
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch latest submission');
  }

  return response.json();
}

/**
 * Get submission by ID
 * @param {number} appId - The app ID
 * @param {number} submissionId - The submission ID
 * @returns {Promise<Object>} Submission data
 */
export async function getSubmission(appId, submissionId) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/${submissionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch submission');
  }

  return response.json();
}

/**
 * Submit store configuration (Bundle ID and version)
 * @param {number} appId - The app ID
 * @param {number} submissionId - The submission ID
 * @param {Object} config - Store configuration
 * @param {string} config.bundleId - Android bundle ID (e.g., com.company.app)
 * @param {string} config.versionNumber - Version number (e.g., "1.1.0")
 * @param {string} config.versionCode - Version code (e.g., "1010")
 * @returns {Promise<Object>} Response data
 */
export async function submitStoreConfig(appId, submissionId, config) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/${submissionId}/metadata`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      validationType: 'STORE_CONFIG',
      data: {
        'fl-store-bundleId': config.bundleId,
        'fl-store-versionNumber': config.versionNumber,
        'fl-store-versionCode': config.versionCode
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit store configuration');
  }

  return response.json();
}

/**
 * Upload a file to Fliplet media storage
 * @param {number} appId - The app ID
 * @param {File} file - The file to upload
 * @param {string} fileName - Optional custom file name
 * @returns {Promise<Object>} File object with URL and metadata
 */
export async function uploadFile(appId, file, fileName = null) {
  const formData = new FormData();
  formData.append('file', file);

  const name = fileName || file.name;
  const response = await fetch(`${WIDGET_API_BASE}/media/files?appId=${appId}&name=${encodeURIComponent(name)}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload file');
  }

  return response.json();
}

/**
 * Upload and validate keystore file for Android
 * @param {number} appId - The app ID
 * @param {number} submissionId - The submission ID
 * @param {Object} keystoreData - Keystore configuration
 * @param {Object} keystoreData.keyStoreFile - Uploaded file object from uploadFile()
 * @param {string} keystoreData.keyStorePassword - Keystore password
 * @param {string} keystoreData.keyAlias - Key alias (optional)
 * @param {string} keystoreData.keyPassword - Key password (optional)
 * @returns {Promise<Object>} Validation response
 */
export async function uploadKeystore(appId, submissionId, keystoreData) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/${submissionId}/keystore`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(keystoreData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload keystore');
  }

  return response.json();
}

/**
 * Get existing push notification configuration
 * @param {number} appId - The app ID
 * @returns {Promise<Object>} Push notification settings or null
 */
export async function getPushConfig(appId) {
  const response = await fetch(`${WIDGET_API_BASE}/widget-instances/com.fliplet.push-notifications?appId=${appId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No config exists
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch push config');
  }

  return response.json();
}

/**
 * Submit Firebase push notification configuration
 * @param {number} appId - The app ID
 * @param {number} submissionId - The submission ID
 * @param {Object} firebaseConfig - Firebase configuration
 * @param {string} firebaseConfig.projectId - Firebase project ID
 * @param {string} firebaseConfig.privateKey - Firebase private key
 * @param {string} firebaseConfig.clientEmail - Firebase client email
 * @param {Object} firebaseConfig.firebaseFile - Uploaded google-services.json file object (optional)
 * @returns {Promise<Object>} Response data
 */
export async function submitPushConfig(appId, submissionId, firebaseConfig) {
  const payload = {
    submissionId: submissionId,
    platform: 'Android',
    fcm: true,
    project_id: firebaseConfig.projectId,
    private_key: firebaseConfig.privateKey,
    client_email: firebaseConfig.clientEmail
  };

  // Add file timestamps if firebase file was uploaded
  if (firebaseConfig.firebaseFile) {
    payload.googleServicesTimestamp = Date.now();
    payload.serviceAccountTimestamp = Date.now();
    payload['fl-store-firebase'] = firebaseConfig.firebaseFile;
  }

  const response = await fetch(`${WIDGET_API_BASE}/widget-instances/com.fliplet.push-notifications/settings?appId=${appId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit push configuration');
  }

  return response.json();
}

/**
 * Trigger the build process
 * @param {number} appId - The app ID
 * @param {number} submissionId - The submission ID
 * @returns {Promise<Object>} Build response
 */
export async function triggerBuild(appId, submissionId) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/${submissionId}/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to trigger build');
  }

  return response.json();
}

/**
 * Cancel an in-progress build
 * @param {number} appId - The app ID
 * @param {number} submissionId - The submission ID
 * @returns {Promise<Object>} Cancellation response
 */
export async function cancelBuild(appId, submissionId) {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions/${submissionId}/build/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel build');
  }

  return response.json();
}

/**
 * Get list of all submissions for an app
 * @param {number} appId - The app ID
 * @param {string} platform - Platform filter ('android' or 'ios')
 * @returns {Promise<Array>} List of submissions
 */
export async function getSubmissions(appId, platform = 'android') {
  const response = await fetch(`${API_BASE}/apps/${appId}/submissions?platform=${platform}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch submissions');
  }

  return response.json();
}

/**
 * Parse google-services.json file to extract Firebase config
 * @param {File} file - The google-services.json file
 * @returns {Promise<Object>} Parsed Firebase configuration
 */
export async function parseFirebaseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        
        // Extract relevant fields from google-services.json
        const config = {
          projectId: json.project_info?.project_id || '',
          projectNumber: json.project_info?.project_number || '',
          clientId: json.client?.[0]?.client_info?.mobilesdk_app_id || '',
          apiKey: json.client?.[0]?.api_key?.[0]?.current_key || ''
        };
        
        resolve(config);
      } catch (error) {
        reject(new Error('Invalid google-services.json file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate Bundle ID format
 * @param {string} bundleId - The bundle ID to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export function validateBundleId(bundleId) {
  if (!bundleId) {
    return { valid: false, error: 'Bundle ID is required' };
  }

  const pattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  
  if (!pattern.test(bundleId)) {
    return { 
      valid: false, 
      error: 'Invalid format. Use lowercase letters, numbers, dots, and underscores (e.g., com.company.appname)' 
    };
  }

  return { valid: true };
}

/**
 * Generate version code from version number
 * Format: Major.Minor.Patch -> MajorMinorPatch (e.g., 1.2.3 -> 1020)
 * @param {string} versionNumber - Version number (e.g., "1.2.3")
 * @returns {string} Version code
 */
export function generateVersionCode(versionNumber) {
  const parts = versionNumber.split('.').map(n => parseInt(n) || 0);
  const [major = 1, minor = 0, patch = 0] = parts;
  
  // Format: Major * 1000 + Minor * 10 + Patch
  return String(major * 1000 + minor * 10 + patch);
}

export default {
  initializePublishing,
  getLatestSubmission,
  getSubmission,
  submitStoreConfig,
  uploadFile,
  uploadKeystore,
  getPushConfig,
  submitPushConfig,
  triggerBuild,
  cancelBuild,
  getSubmissions,
  parseFirebaseFile,
  validateBundleId,
  generateVersionCode
};








