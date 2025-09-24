# **API Endpoints**

## Table of Contents

- [Initialize Publishing](#initialize-publishing)
- [Submit Metadata](#submit-metadata)
- [Set API Key Configuration (For Apple app store apps only)](#set-api-key-configuration-for-apple-app-store-apps-only)
- [Get list of API Keys for organization (For Apple app store apps only)](#get-list-of-api-keys-for-organization-for-apple-app-store-apps-only)
- [Get API Key Configuration (For Apple app store apps only)](#get-api-key-configuration-for-apple-app-store-apps-only)
- [Update API key Configuration (For Apple app store apps only)](#update-api-key-configuration-for-apple-app-store-apps-only)
- [Delete API key Configuration (For Apple app store apps only)](#delete-api-key-configuration-for-apple-app-store-apps-only)
- [Validate API Key Configuration (For Apple app store apps only)](#validate-api-key-configuration-for-apple-app-store-apps-only)
- [Get list of Apple app bundle Id (For Apple app store apps only) (Updated)](#get-list-of-apple-app-bundle-id-for-apple-app-store-apps-only-updated)
- [Get App detail of Apple app bundle Id (For Apple app store apps only)](#get-app-detail-of-apple-app-bundle-id-for-apple-app-store-apps-only)
- [Check iOS Certificate](#check-ios-certificate)
- [Create new iOS Certificate](#create-new-ios-certificate)
- [Upload iOS Certificate](#upload-ios-certificate)
- [Upload KeyStore file for Android](#upload-keystore-file-for-android)
- [Submit Store Configuration](#submit-store-configuration)
- [Submit push notification config for Widget (Updated)](#submit-push-notification-config-for-widget-updated)
- [Get Push config data](#get-push-config-data)
- [Get Push config data from TeamId (For Apple app store apps only)](#get-push-config-data-from-teamid-for-apple-app-store-apps-only)
- [Trigger Build](#trigger-build)
- [Get Submissions](#get-submissions)
- [Get Latest Submission](#get-latest-submission)
- [Get Submission By Id](#get-submission-by-id)
- [Cancel build](#cancel-build)
- [Set App Permissions](#set-app-permissions)
- [Get App Permissions](#get-app-permissions)
- [Reset App Permissions](#reset-app-permissions)
- [Publish app (Used for generating productionAppId)](#publish-app-used-for-generating-productionappid)
- [Upload file](#upload-file)

### **Initialize Publishing**

* **Endpoint:** POST /v2/apps/:appId/submissions/initialize
* **Description:** Starts the publishing process for an app.
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Fields:**

- `platform` (string): Platform type \- must be either "android" or "ios"
- `type` (string): Store type \- always "appStore" for both platforms
- `teamId` (string): Team ID from App Store Connect \- **required for iOS platform only**

**Request Body:**

```javascript
{
  "platform": "android", // Or "ios" - required
  "type": "appStore", // required, always "appStore" for both platforms
  "teamId": "AFIG8RX79F" // required for iOS only
}
```

**201 Response:**

```javascript
{
  "status": "INITIALIZED",
  "message": "Publishing process initialized",
  "submission": {
    "id": 12345,
  "data": {
      "submissionType": "appStore",
      "status": "INITIALIZED",
      "isV2Submission": true,
      "teamId": "AFIG8RX79F" // iOS only
    },
    "platform": "android",
    "status": "started",
    "appId": 12345,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**400 Response (Missing Parameters):**

```javascript
{
  "status": "ERROR",
  "message": "Platform and type are required"
}
```

**400 Response (Invalid Platform):**

```javascript
{
  "status": "ERROR",
  "message": "Invalid platform. Must be either Android or iOS"
}
```

**400 Response (Invalid Type):**

```javascript
{
  "status": "ERROR",
  "message": "Invalid type. Must be appStore"
}
```

**400 Response (Missing Team ID for iOS):**

```javascript
{
  "status": "ERROR",
  "message": "Team ID is required for iOS platform"
}
```

**400 Response (Invalid API Key):**

```javascript
{
  "status": "ERROR",
  "message": "API key not found for the specified Team ID and API Key ID"
}
```

**400 Response (Submission Already Exists):**

```javascript
{
  "status": "ERROR",
  "message": "A submission 12345 for this app and platform is already in progress, please complete the existing submission or cancel it if you want to create a new one"
}
```

### **Submit Metadata**

* **Endpoint:** PUT /v2/apps/:appId/submissions/:submissionId/metadata
* **Description:** Submits metadata for the app to move the state to Metadata Submitted.
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Fields:**

- `validationType` (string): Type of validation \- must be "APP\_METADATA"
- `data` (object): Metadata container object
- `data.appIcon` (string): URL to the app icon image
- `data.splashScreen` (object): Splash screen configuration object
- `data.splashScreen.url` (string): URL to the splash screen image
- `data.fl-store-iconName` (string): App Label Text (1-30 characters, must start with letter, can contain letters, numbers, spaces, hyphens, underscores, dots, parentheses, brackets, must end with letter or number)

**Optional Fields:**

- `data.splashScreen.isEncrypted` (boolean): Set to true when custom splash screen is uploaded

**Request Body:**

```javascript
{
  "validationType": "APP_METADATA", // required
  "data": { // required
    "appIcon": "https://cdn.fliplet.com/apps/20/icon-1526650155893.jpg", // required
    "splashScreen": { // required
      "url": "https://cdn.fliplet.com/widgets/com.fliplet.apple-app-request/1.0.0/2501231519/img/splash-screen.png?_=1741873491",
      "isEncrypted": true // Set this when custom splash screen is uploaded
    },
    "fl-store-iconName": "Example App" // required - App Label Text (1-30 characters)
  }
}
```

**201 Response:**

```javascript
{
  "status": "METADATA_SUBMITTED",
  "message": "Metadata for the app has been submitted",
  "submission": {
    "id": 12345,
  "data": {
      "submissionType": "appStore",
      "status": "METADATA_SUBMITTED",
      "isV2Submission": true,
      "appIcon": "https://cdn.fliplet.com/apps/20/icon-1526650155893.jpg",
      "splashScreen": {
        "url": "https://cdn.fliplet.com/widgets/com.fliplet.apple-app-request/1.0.0/2501231519/img/splash-screen.png?_=1741873491",
        "isEncrypted": true
      },
      "fl-store-iconName": "Example App"
    },
    "platform": "android",
    "status": "started",
    "appId": 12345,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**400 Response (Missing Parameters):**

```javascript
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "Validation type and data are required"
}
```

**400 Response (Missing Required Fields):**

```javascript
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "Required metadata field is missing",
  "requiredField": "appIcon"
}
```

**400 Response (Invalid Icon Name):**

```javascript
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "App Label Text must start with a letter and can only contain letters, numbers, spaces, hyphens, underscores, dots, parentheses, and square brackets. It must end with a letter or number.",
  "requiredField": "fl-store-iconName"
}
```

**400 Response (Invalid Icon Name Length):**

```javascript
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "App Label Text must be between 1 and 30 characters",
  "requiredField": "fl-store-iconName"
}
```

**400 Response (Invalid Validation Type):**

```javascript
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "Invalid validation type. Must be APP_METADATA or STORE_CONFIG"
}
```

**500 Response (Server Error):**

```javascript
{
  "status": "ERROR",
  "message": "Failed to submit metadata"
}
```

###

### **Set API Key Configuration (For Apple app store apps only)**

* **Endpoint:** POST /v2/organizations/:organizationId/credentials/api-key
* **Description:** Create a new Apple App Store API key configuration for a team
* **Role:** Publisher
* **Platform:** iOS

**Required Fields:**

- `apiKey` (string): Private key content (p8 file content) from App Store Connect
- `issuerId` (string): Issuer ID from App Store Connect
- `keyId` (string): Key ID from App Store Connect
- `teamId` (string): Team ID from App Store Connect
- `name` (string): Display name for the API key

**Request Body:**

```javascript
{
  "apiKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----", // required
  "issuerId": "69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1", // required
  "keyId": "977G8RX79F", // required
  "teamId": "AFIG8RX79F", // required
  "name": "Fliplet org" // required
}
```

**201 Response:**

```javascript
{
  "teamId": "AFIG8RX79F",
  "config": {
    "keyId": "977G8RX79F",
    "issuerId": "69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1",
    "teamId": "AFIG8RX79F",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "name": "Fliplet org"
  },
  "message": "API key configuration saved successfully"
}
```

**400 Response (Missing Parameters):**

```javascript
{
  "message": "Missing required parameters: name, keyId, issuerId, teamId and apiKey are required",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**400 Response (API Key Validation Failed):**

```javascript
{
  "message": "API key validation failed: Invalid key format",
  "status": "FAILED_API_KEY_CONFIGURATION"
}
```

**500 Response (Server Error):**

```javascript
{
  "message": "Internal server error"
}
```

### **Get list of API Keys for organization (For Apple app store apps only)**

* **Endpoint:** GET /v2/organizations/:organizationId/credentials/api-keys
* **Description:** Retrieves all Apple App Store API key configurations for an organization across all teams.
* **Role:** Publisher

**Required Fields:**

- None (GET endpoint with no parameters)

**200 Response:**

```javascript
{
  "apiKeys": [
    {
      "teamId": "team123",
      "keyId": "ABC123DEF4",
      "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "createdFromUserId": 123,
      "name": "Production API Key"
    },
    {
      "teamId": "team456",
      "keyId": "DEF456GHI7",
      "issuerId": "8a9b7c6d-5e4f-3g2h-1i0j-987654321098",
      "updatedAt": "2024-01-17T09:15:00.000Z",
      "createdFromUserId": 456,
      "name": "Team 456 API Key"
    }
  ]
}
```

**200 Response (No API keys configured):**

```javascript
{
  "apiKeys": []
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving API keys"
}
```

###

### **Get API Key Configuration (For Apple app store apps only)**

* **Endpoint:** GET /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
* **Description:** Retrieves a specific Apple App Store API key configuration by team ID
* **Role:** Publisher & AAB token
* **Platform:** iOS

**Required Fields:**

- `teamId` (path parameter): Team ID from App Store Connect

**Optional Query Parameters:**

- `includeSensitiveData` (boolean): Whether to include API key content or not (default: false)

**200 Response (with includeSensitiveData=true):**

```javascript
{
  "teamId": "team123",
  "keyId": "ABC123DEF4",
  "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
  "apiKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...",
  "name": "Production API Key",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdFromUserId": 123
}
```

**200 Response (with includeSensitiveData=false or not provided):**

```javascript
{
  "teamId": "team123",
  "keyId": "ABC123DEF4",
  "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
  "hasApiKey": true,
  "name": "Production API Key",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdFromUserId": 123
}
```

**404 Response (API key not found):**

```javascript
{
  "message": "API key configuration not found"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving API key"
}
```

### **Update API key Configuration (For Apple app store apps only)**

* **Endpoint:** PUT /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
* **Description:** Update a specific Apple App Store API key name by team ID.
* **Role:** Organization Admin
* **Platform:** iOS

**Required Fields:**

- `name` (string): Display name for the API key

**Request Body:**

```javascript
{
  "name": "Fliplet org" // required
}
```

**200 Response:**

```javascript
{
  "teamId": "AFIG8RX79F",
  "config": {
    "keyId": "ABC123DEF4",
    "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
    "teamId": "AFIG8RX79F",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "name": "Fliplet org"
  },
  "message": "API key name updated successfully"
}
```

**400 Response (Missing Name):**

```javascript
{
  "message": "API key name is required",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**404 Response (API key not found):**

```javascript
{
  "message": "API key configuration not found",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**500 Response (Server Error):**

```javascript
{
  "message": "Internal server error"
}
```

### **Delete API key Configuration (For Apple app store apps only)**

* **Endpoint:** DELETE /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
* **Description:** Delete a specific Apple App Store API key configuration by team ID.
* **Role:** Organization Admin
* **Platform:** iOS

**200 Response:**

```javascript
{
  "message": "API key configuration deleted successfully"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error deleting API key"
}
```

### **Validate API Key Configuration (For Apple app store apps only)**

* **Endpoint:** POST /v2/organizations/:organizationId/credentials/api-key/validate
* **Description:** Validate API key for apple app store submission
* **Role:** Publisher
* **Platform:** iOS

**Required Fields:**

- `apiKey` (string): Private key content (p8 file content) from App Store Connect
- `issuerId` (string): Issuer ID from App Store Connect
- `keyId` (string): Key ID from App Store Connect
- `teamId` (string): Team ID from App Store Connect

**Request Body:**

```javascript
{
  "apiKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----", // required
  "issuerId": "69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1", // required
  "keyId": "977G8RX79F", // required
  "teamId": "AFIG8RX79F" // required
}
```

**200 Response (Valid API Key):**

```javascript
{
  "isValid": true,
  "message": "API key is valid"
}
```

**200 Response (Invalid API Key):**

```javascript
{
  "isValid": false,
  "message": "API key is not valid",
  "details": "Invalid key format or credentials"
}
```

**400 Response (Missing Parameters):**

```javascript
{
  "message": "Missing required parameters: name, keyId, issuerId, teamId and apiKey are required",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**400 Response (Validation Error):**

```javascript
{
  "message": "API key validation error"
}
```

### **Get list of Apple app bundle Id (For Apple app store apps only) (Updated)**

* **Endpoint:** GET /v2/apps/:appId/submissions/:submissionId/bundleId
* **Description:** Get list of apps created in ASC
* **Role:** Publisher
* **Platform:** iOS

**200 Response:**

```javascript
{
  "apps": [
    {
      "appId": "6743122423",
      "bundleId": "com.fliplet.iOsPublishingV2",
      "name": "iOS Publishing V2",
      "sku": "1741696667"
    }
  ]
}
```

**400 Response (MISSING\_API\_KEY\_CONFIGURATION):**

```javascript
{
  "status": "MISSING_API_KEY_CONFIGURATION",
  "message": "API key config is not found, please configure API config",
}
```

### **Get App detail of Apple app bundle Id (For Apple app store apps only)**

* **Endpoint:** GET /v2/apps/:appId/submissions/:submissionId/bundleId/details
* **Description:** Get app details from bundle Id for Apple apps
* **Role:** Publisher
* **Platform:** iOS

**Required Query Parameters:**

- `bundleId` (string): Bundle ID to get the app details from App Store Connect

**200 Response:**

```javascript
{
    "exists": true,
    "data": {
        "appStoreAppId": "6743122423",
        "bundleId": "com.fliplet.iOsPublishingV2",
        "name": "iOS Publishing V2",
        "sku": "1741696667",
        "appStoreAppDetails": {
            "platform": "IOS",
            "versionString": "1.0.25", //This is the app version
            "appStoreState": "PREPARE_FOR_SUBMISSION",
            "appVersionState": "PREPARE_FOR_SUBMISSION",
            "copyright": "2025 Fliplet",
            "reviewType": "APP_STORE",
            "releaseType": "MANUAL",
            "earliestReleaseDate": null,
            "usesIdfa": null,
            "downloadable": true,
            "createdDate": "2025-03-11T05:37:54-07:00"
        }
    }
}
```

**400 Response (MISSING\_API\_KEY\_CONFIGURATION):**

```javascript
{
  "status": "MISSING_API_KEY_CONFIGURATION",
  "message": "API key config is not found, please configure API config",
}
```

**400 Response (MISSING\_BUNDLE\_ID):**

```javascript
{
    "message": "Bundle ID parameter is required",
    "status": "MISSING_BUNDLE_ID"
}
```

### **Check iOS Certificate**

* **Endpoint:** POST /v2/apps/:appId/submissions/:submissionId/check-certificate
* **Description:** Check if existing iOS certificate is valid or not
* **Role:** Publisher
* **Platform:** iOS

**200 Response (Valid Certificate):**

```javascript
{
  "validCertificate": true,
  "message": "Certificate provided for the app is valid"
}
```

**400 Response (Invalid Certificate):**

```javascript
{
  "validCertificate": false,
  "message": "Certificate provided for the app is not valid"
}
```

**400 Response (Missing Team ID):**

```javascript
{
  "validCertificate": false,
  "message": "Team ID is required"
}
```

**400 Response (Invalid Platform):**

```javascript
{
  "status": "INVALID_PLATFORM",
  "message": "Certificate check is only available for iOS"
}
```

**500 Response (Server Error):**

```javascript
{
  "status": "ERROR",
  "message": "Internal server error"
}
```

### **Create new iOS Certificate**

* **Endpoint:** POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
* **Description:** Create new iOS distribution certificate
* **Role:** Publisher
* **Platform:** iOS

**200 Response:**

```javascript
{
  "credentials": {
"createdAt": 1730816402422,
"type": "apple",
"status": "created",
"email": "arpan.exe@hotmail.com",
"createdFromUserId": 567094,
"updatedAt": 1745913972615,
"verifiedAt": 1745913864647,
"appPassword": "cnoj-rbor-jaik-cmrh",
"teamId": "H25Z7T6F52",
"teamName": "Weboo Online Limited",
"certSigningRequest": "-----BEGIN CERTIFICATE REQUEST-----\nMIICUzCCATsCAQAwDjEMMAoGA1UEAwwDUEVNMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA3RFlDIMxYgGazaNTpgVgN0XbrfkUI20OHWwuAUVp4By5Wys5\nSLBsZYliVRkHCIXeHCBf1UJAKNixHrXbepmS4iiuGLGNRN+R9BvdpFHHCml5imop\nEqGi79iwMOKkCE+n+yAPe5jZHD9KN8aHwfShkQ6pMyXSlv102SXmaHnq56smAVgd\nn8dQUUqnMannbnS71/qvzFQHzenXc5l8KVf4v58fDDhLL8AwfbWjcRkHH9Q8Owtx\nef2q9c8dzPAC4Ab6Vx3tvYGynCywU8Qy8FqrWUPsx5UG//ZO26P7ldgVY+8iMAQV\nBmgLLAI1mSbiwhipIuvDXCdLcpGm/Hez832gkwIDAQABoAAwDQYJKoZIhvcNAQEL\nBQADggEBAMncMp/cmSYV2i5mBVerniR8x+fi1aAz/14E2FXd0cvJ5Bsf7AuCgLG5\nUqxcShZxmLNk0veEyvfH0CdsP3ZY1uU9faeBjazWglbrrOc9uZCDGsVNIEBaKHVu\ns0zsx3lXEuXKh+UjbQSNsHG22IPfBu9tXiKmpZ5JUaDv4u/tFDofORs3FfSmvK5K\nO4+pInxW7Su1SW/hvpjDW17JCBhjgieD3yBO7hvyCHULBQ5FGvK/fGfNW/GlbyNC\nllnqGwHaOq5uxnTzpDLRRbXQJrS/a4ojR9pb4zJfNBbePDBIMNhfe4UCraNCVRlq\nBxpEWbqnLaRtOpGodhTHaZMWqLVzEMY=\n-----END CERTIFICATE REQUEST-----\n",
"p12": {
"url": "https://cdn.fliplet.com/organizations/2845/credentials/73b77527caabcbea7db61521a534dd52.p12"
},
"iTunesConnectTeamId": 913727,
"certificateName": "WJ287HZG6R.p12"
},
  "message": "Certificate generated successfully"
}
```

**400 Response:**

```javascript
{
  "message": "Submission not found"
}
```

**400 Response:**

```javascript
{
  "message": "Maximum number of certificates reached. Please revoke unused certificates",  "status": "MAX_CERTIFICATES_REACHED"
}
```

**400 Response:**

```javascript
{
  "message": "Insufficient permissions to create distribution certificates",  "status": "INSUFFICIENT_PERMISSIONS"
}
```

**400 Response:**

```javascript
{
  "message": "Failed to generate distribution certificate",  "status": "FAILED_CERTIFICATE_CONFIGURATION"
}
```

### **Upload iOS Certificate**

* **Endpoint:** PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
* **Description:** Upload iOS distribution certificate and private key
* **Role:** Publisher
* **Platform:** iOS

**Required Fields:**

- `privateKey` (string): Private key content in PEM format
- `certificate` (string): Certificate content in PEM format

**Request Body:**

```javascript
{
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA1gfHx9oOy+wqOCYF6VQKcrKnhCrVZgXxW553D/gu0ZjzAhFd\n3VN6fJKm6lK3V2i0SNcfzImD7JmW6SHQD9lGZrDvZK9J8nI/caWgjca9nyfDO5rM\ndXBMPpPGgSGBqyxmt8UcWX2JxwlvCAw9WeVunQYwb155lxWfnQlHnj3t2/ayCy0t\nS0afovSQeqeU9/9apZ84u3LLJ241E56uzX8d84K1D22Nidsu8gLzYGWa03UjnxvB\ni7wmtYAov12cMEF4tFnUsN/ZUWm4nkDAB+SlURbIFb9biel/SxiBEEsCW0FqpfoO\ncoBIsT/FiZQU6/NXuYC03WYdS6x5y/A5KOqx0QIDAQABAoIBAQCVDdwTEYhmefU5\nHznUsiOIl2TURaRSJeddn/FZHMU2UOdD1GZjQcS2xscZvztR02hipfbOUiKe/qO7\nfkHRF8bQs340x2KfRvNqKSe0NOlP0rhDZV3ol6lxlyaSPYx5cjWi29IPfL8b7zT1\nDNkZJxAuqOXIWaoiDvwWuCS5TnW9Tjz9m5VWCgDEKwLt/2+NfCOG+zyx64IoO/XS\nOGqlJ7gB/XljKdMO1+pWIz9wZrpzjjH4CPIOapCUnPDytUah2ZxSUSIvUJNPM+lH\n3E1frYOJdLFFLZgiJmZKRKkFhwuIjaxnfMSRSgwiuopZb5iHp4CACXT9bN3d7LbL\nlRSC69yFAoGBAPsx5FPKUSSt+A0/XMDiB0ZTybbHFqe4Oaz6hJCvjihXAFOxJtW8\n5Z0bwj/sYUEJ6wEuoeuZlb1zMhyjqMcfha0E6BhaaP5Pr1DaOz147LVNVxZH67+0\nYKiYLU616K/YEvhxNA2Igjt8d9tOym2ktcWlEiNAHzGVLHgxLR0EfY5nAoGBANof\n5JhF9i1JzopwabsdcpRme2anmYdFMXUk7hfqcttuIxZJ0D5cuTXWg1lymkNZhj6b\nPrX4/VHYmEpWGx8exBLUh0QLd8FKb69r/xBe59r5uWiNIhxFLyMfj0Ch67hHU6O7\njnrXi+xMqnNTIvuAYn5mg56EBUKgGZ2d8uGVm6sHAoGAMaHBAIFIGRw6l7t+Qyol\nz9J8V53srwTqeHAjQ0c8qmHOUbr99ltVbv5uGh1FdglUoq4pFhkJih45t4jqrzVe\nPzpp9W3fsufhtvL3o4TCGGyImYFqZj1on8c5pISyzhO+Y9JSO55ORRypve5KdvGF\nbODZvZdM0oor+C+XP1WEzV8CgYBVgoM/Hs4vWuvZYdBRRm4Qt0xRJgsN+JY28k9U\nmNiGJVsj9bPpfrgs3veHLWJEXOg/yuR+uim02FB7c94WCR2ctCyDBGviHqhCAPhx\nFoOWWKfS0OE6a/TatBiYoeGi0HN9kJ1+ktmLvVJk+4aPSflSzCV1ExRs1g60t6Lr\nxJbOKQKBgENemy7fDWpVStv1n4TG9nR2O+nN16IXY0SDIsixIDF5sOd6csd8F1H1\nvi980wrOwq1L/SGE4vgH6fXnj/vFLHy1OnAVD1QUUOy0lAaL4QMDJaK9PC0t1mtq\nzP6IeGY6GJ01xHQRnYaj1X1r9BYe0ixWxOOTRpEFS7OiZN5HOFEC\n-----END RSA PRIVATE KEY-----\n", // required
  "certificate": "-----BEGIN CERTIFICATE-----\nMIIFwzCCBKugAwIBAgIQC7ibXmbzMA6wsrp2H1hNeDANBgkqhkiG9w0BAQsFADB1\nMUQwQgYDVQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBD\nZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTELMAkGA1UECwwCRzMxEzARBgNVBAoMCkFw\ncGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTI1MDQyMzE1MDgwMVoXDTI2MDQyMzE1\nMDgwMFowgZ4xGjAYBgoJkiaJk/IsZAEBDApIMjVaN1Q2RjUyMT8wPQYDVQQDDDZp\nUGhvbmUgRGlzdHJpYnV0aW9uOiBXZWJvbyBPbmxpbmUgTGltaXRlZCAoSDI1WjdU\nNkY1MikxEzARBgNVBAsMCkgyNVo3VDZGNTIxHTAbBgNVBAoMFFdlYm9vIE9ubGlu\nZSBMaW1pdGVkMQswCQYDVQQGEwJHQjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBANYHx8faDsvsKjgmBelUCnKyp4Qq1WYF8Vuedw/4LtGY8wIRXd1TenyS\npupSt1dotEjXH8yJg+yZlukh0A/ZRmaw72SvSfJyP3GloI3GvZ8nwzuazHVwTD6T\nxoEhgassZrfFHFl9iccJbwgMPVnlbp0GMG9eeZcVn50JR5497dv2sgstLUtGn6L0\nkHqnlPf/WqWfOLtyyyduNROers1/HfOCtQ9tjYnbLvIC82BlmtN1I58bwYu8JrWA\nKL9dnDBBeLRZ1LDf2VFpuJ5AwAfkpVEWyBW/W4npf0sYgRBLAltBaqX6DnKASLE/\nxYmUFOvzV7mAtN1mHUusecvwOSjqsdECAwEAAaOCAiMwggIfMAwGA1UdEwEB/wQC\nMAAwHwYDVR0jBBgwFoAUCf7AFZD5r2QKkhK5JihjDJfsp7IwcAYIKwYBBQUHAQEE\nZDBiMC0GCCsGAQUFBzAChiFodHRwOi8vY2VydHMuYXBwbGUuY29tL3d3ZHJnMy5k\nZXIwMQYIKwYBBQUHMAGGJWh0dHA6Ly9vY3NwLmFwcGxlLmNvbS9vY3NwMDMtd3dk\ncmczMDIwggEeBgNVHSAEggEVMIIBETCCAQ0GCSqGSIb3Y2QFATCB/zCBwwYIKwYB\nBQUHAgIwgbYMgbNSZWxpYW5jZSBvbiB0aGlzIGNlcnRpZmljYXRlIGJ5IGFueSBw\nYXJ0eSBhc3N1bWVzIGFjY2VwdGFuY2Ugb2YgdGhlIHRoZW4gYXBwbGljYWJsZSBz\ndGFuZGFyZCB0ZXJtcyBhbmQgY29uZGl0aW9ucyBvZiB1c2UsIGNlcnRpZmljYXRl\nIHBvbGljeSBhbmQgY2VydGlmaWNhdGlvbiBwcmFjdGljZSBzdGF0ZW1lbnRzLjA3\nBggrBgEFBQcCARYraHR0cHM6Ly93d3cuYXBwbGUuY29tL2NlcnRpZmljYXRlYXV0\naG9yaXR5LzAWBgNVHSUBAf8EDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUjfISr7Aa\nmfXIMXgv/OWWOEiKrcEwDgYDVR0PAQH/BAQDAgeAMBMGCiqGSIb3Y2QGAQQBAf8E\nAgUAMA0GCSqGSIb3DQEBCwUAA4IBAQAb1uTAdN6nWnYIV9pSSEhAmrkoTrTqdDHP\n8HfhtPQrhEbpSUXRB7oAiwOY6dGX2GWue4Pd9cVTYds3ujmaTwcLNPepwAl70i+j\n7YzajHlKZm9rtbJaxo2cn/ORdq7MUje3+2LD/A8TIwQCiBBkY6AcREso86HxLZhG\nfwrCxpjF3cyLckKV+rLarpJFXIjWZRUOwkNH1GsYAONy5eaOcjhJHo1/QPVKoJhu\nxwPe1pNJ8q7nusJvbLLixH4y4F6GNM5DjqKxXspakWU2oPyGkkVnJcXwqpOEPzA8\nFLPldVaSEJMXToI2B5mcOt9arUWMhlBGGxqVBW4o33C+2gsGRnJF\n-----END CERTIFICATE-----" // required
}
```

**200 Response:**

```javascript
{
  "credentials": {
"createdAt": 1730816402422,
"type": "apple",
"status": "created",
"email": "arpan.exe@hotmail.com",
"createdFromUserId": 567094,
"updatedAt": 1745913972615,
"verifiedAt": 1745913864647,
"appPassword": "cnoj-rbor-jaik-cmrh",
"teamId": "H25Z7T6F52",
"teamName": "Weboo Online Limited",
"certSigningRequest": "-----BEGIN CERTIFICATE REQUEST-----\nMIICUzCCATsCAQAwDjEMMAoGA1UEAwwDUEVNMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA3RFlDIMxYgGazaNTpgVgN0XbrfkUI20OHWwuAUVp4By5Wys5\nSLBsZYliVRkHCIXeHCBf1UJAKNixHrXbepmS4iiuGLGNRN+R9BvdpFHHCml5imop\nEqGi79iwMOKkCE+n+yAPe5jZHD9KN8aHwfShkQ6pMyXSlv102SXmaHnq56smAVgd\nn8dQUUqnMannbnS71/qvzFQHzenXc5l8KVf4v58fDDhLL8AwfbWjcRkHH9Q8Owtx\nef2q9c8dzPAC4Ab6Vx3tvYGynCywU8Qy8FqrWUPsx5UG//ZO26P7ldgVY+8iMAQV\nBmgLLAI1mSbiwhipIuvDXCdLcpGm/Hez832gkwIDAQABoAAwDQYJKoZIhvcNAQEL\nBQADggEBAMncMp/cmSYV2i5mBVerniR8x+fi1aAz/14E2FXd0cvJ5Bsf7AuCgLG5\nUqxcShZxmLNk0veEyvfH0CdsP3ZY1uU9faeBjazWglbrrOc9uZCDGsVNIEBaKHVu\ns0zsx3lXEuXKh+UjbQSNsHG22IPfBu9tXiKmpZ5JUaDv4u/tFDofORs3FfSmvK5K\nO4+pInxW7Su1SW/hvpjDW17JCBhjgieD3yBO7hvyCHULBQ5FGvK/fGfNW/GlbyNC\nllnqGwHaOq5uxnTzpDLRRbXQJrS/a4ojR9pb4zJfNBbePDBIMNhfe4UCraNCVRlq\nBxpEWbqnLaRtOpGodhTHaZMWqLVzEMY=\n-----END CERTIFICATE REQUEST-----\n",
"p12": {
"url": "https://cdn.fliplet.com/organizations/2845/credentials/73b77527caabcbea7db61521a534dd52.p12"
},
"iTunesConnectTeamId": 913727,
"certificateName": "WJ287HZG6R.p12"
},
  "message": "Certificate generated successfully"
}
```

**400 Response:**

```javascript
{
  "message": "Submission not found"
}
```

**400 Response:**

```javascript
{
  "message": "Missing required parameters: privateKey and certificate are required",  "status": "MISSING_CERTIFICATE_CONFIGURATION"
}
```

**400 Response:**

```javascript
{
  "message": "Team ID is required for iOS platform",  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**400 Response:**

```javascript
{
  "message": "Certificate provided for the app is not valid",  "status": "INVALID_CERTIFICATE"
}
```

### **Upload KeyStore file for Android**

* **Endpoint:** PUT /v2/apps/:appId/submissions/:submissionId/keystore
* **Description:** Upload Android Keystore file for app signing
* **Role:** Publisher
* **Platform:** Android

**Required Fields:**

- `keyStoreFile` (object): File object stored in DB containing keystore file information
- `keyStoreFile.id` (number): File ID in the database
- `keyStoreFile.url` (string): URL to access the keystore file
- `keyStoreFile.name` (string): Name of the keystore file
- `keyStorePassword` (string): Password for the keystore file

**Request Body:**

```javascript
{
  "keyStoreFile": { // required - File object stored in DB
        "id": 176,
        "name": "comflipletstagingAndroidNotification1.jks",
        "path": "apps/186/comflipletstagingAndroidNotification1-809-078-9789.jks",
        "contentType": "application/octet-stream",
        "userId": 7,
        "metadata": {
            "av": {
                "status": "queued"
            },
            "size": 2839,
            "checksum": "ca25b5c40b43face9437a2ee471903a9"
        },
        "organizationId": 2,
        "isEncrypted": true,
        "url": "https://api.fliplet.test/v1/media/files/176/contents/comflipletstagingAndroidNotification1.jks",
        "appId": 186,
        "updatedAt": "2025-05-12T12:09:40.074Z",
    "createdAt": "2025-05-12T12:09:40.038Z"
  },
  "keyStorePassword": "9MHSZ3feL5" // required - Password for the keystore file
}
```

**201 Response:**

```javascript
{
    "status": "SUCCESS",
    "message": "Keystore file uploaded and validated successfully"
}
```

**400 Response (Missing Parameters):**

```javascript
{
  "message": "Missing required parameters: keyStoreFilePath and keyStorePassword are required"
}
```

**400 Response (Invalid Platform):**

```javascript
{
  "status": "INVALID_PLATFORM",
  "message": "Keystore check is only available for Android"
}
```

**400 Response (Invalid Keystore):**

```javascript
{
    "status": "INVALID_KEYSTORE",
    "message": "Invalid keystore file or incorrect password"
}
```

**400 Response (Download Error):**

```javascript
{
    "status": "DOWNLOAD_ERROR",
    "message": "Failed to download keystore file from S3"
}
```

**500 Response (Server Error):**

```javascript
{
  "message": "Internal server error"
}
```

###

### **Submit Store Configuration**

* **Endpoint:** PUT /v2/apps/:appId/submissions/:submissionId/metadata
* **Description:** Submits store configuration for the app
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Fields:**

- `validationType` (string): Type of validation \- must be "STORE\_CONFIG"
- `data` (object): Store configuration container object
- `data.fl-store-bundleId` (string): Bundle ID for the app store
- `data.fl-store-versionNumber` (string): Version number for the app
- `data.fl-store-versionCode` (string): Version code \- **required for Android platform only**

**Request Body:**

```javascript
{
  "validationType": "STORE_CONFIG", // required
  "data": { // required
    "fl-store-bundleId": "com.fliplet.iOsPublishingV2", // required
    "fl-store-versionNumber": "1.1.0", // required
    "fl-store-versionCode": "1010" // required for Android only
  }
}
```

**201 Response:**

```javascript
{
  "status": "STORE_CONFIG_SUBMITTED",
  "message": "Store configuration has been submitted",
  "submission": {
    "id": 12345,
  "data": {
      "submissionType": "appStore",
      "status": "STORE_CONFIG_SUBMITTED",
      "isV2Submission": true,
      "fl-store-bundleId": "com.fliplet.iOsPublishingV2",
      "fl-store-versionNumber": "1.1.0",
      "fl-store-versionCode": "1010", // Android only
      // Additional app store data for iOS
      "appStoreAppId": "6743122423",
      "bundleId": "com.fliplet.iOsPublishingV2",
      "name": "iOS Publishing V2",
      "sku": "1741696667"
    },
    "platform": "ios",
    "status": "started",
    "appId": 12345,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**400 Response (Missing Required Fields):**

```javascript
{
  "status": "MISSING_REQUIRED_STORE_CONFIG",
  "message": "Required store configuration field is missing",
  "requiredField": "fl-store-bundleId"
}
```

**400 Response (Missing Team ID):**

```javascript
{
  "status": "MISSING_REQUIRED_STORE_CONFIG",
  "message": "Team ID is required"
}
```

**400 Response (Missing Credentials):**

```javascript
{
  "status": "MISSING_REQUIRED_STORE_CONFIG",
  "message": "This submission requires credentials, but they have not been set on the submission data for the key fl-credentials."
}
```

**400 Response (Invalid Version):**

```javascript
{
  "status": "FAILED_STORE_CONFIG",
  "message": "New version (1.1.0) must be greater than current version (1.0.25)"
}
```

**400 Response (App Not Found):**

```javascript
{
  "status": "APP_NOT_FOUND",
  "message": "App with bundle Id com.fliplet.iOsPublishingV2 not found in app store"
}
```

**500 Response (Bundle ID Validation Failed):**

```javascript
{
  "status": "ERROR",
  "message": "Failed to validate bundle ID configuration"
}
```

### **Submit push notification config for Widget (Updated)**

* **Endpoint:** PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
* **Description:** Submits push config for the app
* **Role:** Publisher
* **Platform:** Android & iOS

**Request Body: (iOS)**

```javascript
{
  "submissionId": 123, //This will be the submission Id //New field
  "platform": "ios",
  "apn": true,
  "apnKeyId": "977G8RX79F",
  "apnTopic": "com.fliplet.iOsPublishingV2",
  "apnTeamId": "H25Z7T6F52",
  "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----"
}

```

**Request Body: (Android)**

```javascript
{
  "submissionId": 123, //This will be the submission Id
  "platform": "android",
  "fcm": true,
  "project_id": "android-notification-d2684",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQD6py4sjCnkYuwq\nz9V5vsJjQ5sjKqdi9JkF78O8lwvCsFmgVj8aPB/gz+8Xeenhtn76DqdU9rT4gEUR\nmyfQcHD6MDfkP21y8KvV2pG9cFjIgCTTb9n4oTu/g3XTuEHE5969Ouq1h4gdOjd4\nP/I3HmQMq3C5bm9Fh0gkZsd+7A/mG0Q2GrhOX9WioE+RRFLWlImSKYMwdf4yyk3d\noZe/e76zy12Xu1GYGNFYfpMw51VzG2WbvHsTYisxqfdWQJWDj4Fh9CsGSmugMJWV\n8mBUU524RxFrxmBqSsxeg+5JpOjtKNmFrF0eVs4LxlzusyeSTEDsmwHFXvJps/2n\nOdDycRZhAgMBAAECggEAFsSS1CcTMxStQSJJ0No8DAo7EFGyjLGNKNXjoMDTp6af\nLYpIBxkJCEG7BRXk4cTS+eHU30ndnGkCXRwL3Mop6P/yQ8BjL7qe0TkeXefTmLrT\nHYWedhAnPjkxvb6R8tHhEK1GXqDmA0mjej/Mv6b6DZCRF7bpUpZ8Pho76tKEizEm\n1wWO7vgBVLrjI86tYkN12eo/AbLyYM0V3B7Bcz30PnljwAOrsJREYuCbirSBpSep\n6pv8RhaTd3TSJsgZavPawYCk3jD8proiucv2vRs6FUlKY8W6JcMhBtngj/bF1auY\nyIvDvishs4QPRj/rM9BBFyMsXcxH88tYqnXp8NOowQKBgQD9YWKAqJQrHIhSLiO1\nZjo88A7oGdvykDpJILmYEYJZicfMeVM16UgkkUPsqhL1JaPOQVROlFtjdCWveeYE\n1p7qMbNK+28n88woLOalj2+DPa4ckXCZh+wU27Oks4XjuYZtqdMbWGJvBDB83LQb\nf89CLEZCrRWW0KbPZJWcGfTbyQKBgQD9PpPAl1lZjz57yafaVZx6EmHHr3AzH4LJ\num23Fvivq7pzg9V6lLa+yl5eT3Bgv0jB3zS/IpNKukdylJHx8oH/f+v4Y7VBiRh2\ns7aaQWNBuBOSzVfNL0qZqtqiLjXSIzBFPEgxkFWmmkfgOqBVfaIngHWfXAhC3how\n5E9M2k8B2QKBgFuNVIooX2E0bg1DnqNszJ44Hyq+LTr34heKO4U2zmKL5iV7sRVJ\ntUeBNYnN6guqDgX4lP3PnTXSQculv/b/lWwJiT8OmptU+++ISc6IhUJmhwLLimPv\nON5QhBh+xWIDJw94zU6UIPz8BokXNfy5sam3VavB3osf2SYWsfg1aMQBAoGAeSgJ\nFCjUjG5lnF97uI8gz54fvaMHcM3wioZwmxmYXKMyDrXR2lVvoJO81i33O7IIIwig\neZkXErdQG1dNA43b99rBkBJT00i9tXyBLgd+byCb7K3lBbtMW3xMIS8ufJxtKZKP\nj3bYI17IaFRkBMKYY4GnxFgJc8RCj4WLEt+W0PECgYAXiofByOs68uy+kLNWGsh3\n0Igqu3UmsYOSdTLo2e3xl02JlRzrYXiJ9kvKjMOAITKce1A0w7DbofhwAONY0OC2\nNe+GgQyu3aezuR4qHMIEH5E0etEPFXVx6kwjoRAdsSn9KBV8oL0GKXLPqlPdai47\nI5K7+eSVPzvjPmI8tH3zFQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-clybt@android-notification-d2684.iam.gserviceaccount.com",
"googleServicesTimestamp": 1718740291584,
"serviceAccountTimestamp": 1718740300843,"fl-store-firebase": {
        "id": 49,
        "url": "https://api.fliplet.test/v1/media/files/49/contents/google-services%20%2815%29.json",
        "name": "google-services (15).json",
        "path": "apps/186/google-services-15-994-614-3787.json",
        "size": null,
        "appId": 186,
        "userId": 7,
        "metadata": {
            "av": {
                "status": "queued"
            },
            "size": 712,
            "checksum": "2a07737d949a03da8629c4dadd48a3fd"
        },
        "versions": {},
        "createdAt": "2024-06-12T06:10:53.496Z",
        "deletedAt": null,
        "thumbnail": null,
        "updatedAt": "2024-06-12T06:10:53.532Z",
        "contentType": "application/json",
        "isEncrypted": true,
        "mediaFolderId": null,
        "dataTrackingId": null,
        "organizationId": 2,
        "dataSourceEntryId": null,
        "masterMediaFileId": null,
        "isOrganizationMedia": false
    }
}
```

**201 Response:**

```javascript
{
  "status": "PUSH_NOTIFICATION_CONFIGURED",
  "message": "Push notification data submitted",
  "data": {
    // Data will contains all the push notificaiton data
   "platform": "Android",
   "fcm": true,
   "project_id": "android-notification-d2684",
  }
}
```

**400 Response (MISSING\_PUSH\_CONFIGURATION):**

```javascript
{
  "status": "MISSING_PUSH_CONFIGURATION",
  "message": "Required push config is missing",
  "requiredField": "project_id"
}
```

**400 Response (FAILD\_PUSH\_CONFIGURATION):**

```javascript
{
  "status": "FAILD_PUSH_CONFIGURATION",
  "message": "There is some issue in savind store config"
}
```

**400 Response (INVALID\_PUSH\_CONFIG):**

```javascript
{
  "status": "INVALID_PUSH_CONFIG",
  "message": "Push config is not valid"
}
```

### **Get Push config data**

* **Endpoint:** GET v1/widget-instances/com.fliplet.push-notifications?appId=:appId
* **Description:** Get push notifications config for the app
* **Role:** Viewer
* **Platform:** Android & iOS

**200 Response:**

```javascript
{
    "widgetInstance": {
        "id": 29057329,
        "settings": {
            "apn": true,
            "apnKeyId": "CKBB258L37",
            "apnTopic": "com.fliplet.iOsPublishingV2",
            "apnTeamId": "H25Z7T6F52",
            "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----"
        },
        "uuid": "d852f952-f236-4467-8340-ce7c585449f4",
        "createdAt": "2025-03-10T07:17:35.572Z",
        "updatedAt": "2025-06-16T07:13:26.924Z",
        "deletedAt": null,
        "widgetId": 44,
        "parentId": null,
        "widget": {
            "isTheme": false,
            "isFunction": false,
            "isInline": false,
            "package": "com.fliplet.push-notifications",
            "tags": [
                "type:appComponent",
                "visibility:hidden"
            ],
            "id": 44,
            "name": "Push notifications",
            "updatedAt": "2024-10-17T10:34:47.701Z"
        }
    },
    "apps": []
}
```

### **Get Push config data from TeamId (For Apple app store apps only)**

* **Endpoint:** GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId
* **Description:** Get push notifications config for the app stored by teamId
* **Role:** Publisher
* **Platform:** iOS

**200 Response (Push Config Found):**

```javascript
{
  "pushConfig": {
    "apnKeyId": "CKBB258L37",
    "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----",
    "apnTopic": "com.fliplet.iOsPublishingV2",
    "apnTeamId": "H25Z7T6F52"
  }
}
```

**200 Response (No Push Config Found):**

```javascript
{
  "pushConfig": {}
}
```

**400 Response (Missing Team ID):**

```javascript
{
  "message": "Team ID is required",
  "status": "MISSING_TEAM_ID"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving push configuration"
}
```

### **Trigger Build**

* **Endpoint:** POST /v2/apps/:appId/submissions/:submissionId/build
* **Description:** Triggers the build process for the app.
* **Role:** Publisher
* **Platform:** Android & iOS

**Request Body:**

```javascript
{
  "debug": false // Optional - Or true for a debug build
}
```

**200 Response:**

```javascript
{
  "status": "BUILD_TRIGGERED",
  "message": "Build process has been triggered successfully",
  "submission": {
    "id": 12345,
    "data": {
      "submissionType": "appStore",
      "status": "BUILD_TRIGGERED",
      "isV2Submission": true,
      "fl-store-bundleId": "com.fliplet.iOsPublishingV2",
      "fl-store-versionNumber": "1.1.0",
      "appIcon": "https://cdn.fliplet.com/apps/20/icon-1526650155893.jpg",
      "fl-store-iconName": "Example App",
      "splashScreen": {
        "url": "https://cdn.fliplet.com/widgets/com.fliplet.apple-app-request/1.0.0/2501231519/img/splash-screen.png"
      }
    },
    "platform": "ios",
    "status": "started",
    "appId": 12345,
    "submittedByUserId": 567094,
    "targetAppId": 98765,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**400 Response (Invalid Status):**

```javascript
{
  "message": "You cannot submit this build, as it is completed already."
}
```

**400 Response (No Production App):**

```javascript
{
  "status": "INVALID_BUILD_STATUS",
  "message": "You need to publish this app first. Go to 'Step 1. Prepare your app' to publish your app."
}
```

**400 Response (Missing Required Fields):**

```javascript
{
  "status": "MISSING_REQUIRED_METADATA",
  "message": "Required fields are missing for build. Please ensure all required metadata and store configuration fields are provided.",
  "requiredField": "fl-store-bundleId",
  "missingFields": ["fl-store-bundleId", "fl-store-versionNumber"]
}
```

**400 Response (Missing Push Configuration):**

```javascript
{
  "status": "MISSING_PUSH_CONFIGURATION",
  "message": "Push notification configuration not found"
}
```

**400 Response (Invalid Push Configuration):**

```javascript
{
  "status": "INVALID_PUSH_CONFIG",
  "message": "Project ID in google-service.json does not match the project ID in the push notification configuration"
}
```

**400 Response (Missing Credentials):**

```javascript
{
  "status": "MISSING_CERTIFICATE_CONFIGURATION",
  "message": "This submission requires credentials, but they have not been set on the submission data for the key fl-credentials."
}
```

**400 Response (Invalid Certificate):**

```javascript
{
  "status": "INVALID_CERTIFICATE",
  "message": "Certificate provided for the app is not valid"
}
```

**403 Response (Billing Validation Failed):**

```javascript
{
  "message": "Your current plan does not allow publishing this type of app"
}
```

**500 Response (Build Failed):**

```javascript
{
  "status": "BUILD_FAILED",
  "message": "Failed to trigger build process"
}
```

###

### **Get Submissions**

* **Endpoint:** GET /v2/apps/:appId/submissions/
* **Description:** Get list of submissions for the app
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Query Parameters:**

- `platform` (string): Platform type \- must be either "android" or "ios"

**Optional Query Parameters:**

- `status` (string): Comma-separated list of statuses to filter by: `started`, `submitted`, `queued`, `processing`, `ready-for-testing`, `tested`, `completed`, `failed`, `cancelled`
- `type` (string): Submission type (default: `appStore`)

**200 Response:**

```json
{
  "submissions": [
    {
      "id": 246,
      "data": {
        "status": "BUILD_TRIGGERED",
        "appIcon": "https://cdn-development.fliplet.com/apps/2555/icon-1707137333662.jpg",
        "splashScreen": {
          "url": "https://cdn-development.fliplet.com/widgets/com.fliplet.google-app-request/1.0.0/2211030722/img/splash-screen.png?_=1707214717"
        },
        "fl-credentials": "iosAppStoreCertificate",
        "isV2Submission": true,
        "submissionType": "appStore",
        "fl-store-bundleId": "com.fliplet.developmentiOsPublishingV2",
        "fl-store-iconName": "publishv2",
        "fl-store-versionCode": 1030,
        "fl-store-versionNumber": "1.0.3",
        "teamId": "AFIG8RX79F"
      },
      "result": {
        "appBuild": {
          "files": [
            {
              "id": "5749",
              "url": "https://development.api.fliplet.com/v1/media/files/5749/contents/publishv2-release-signed.apk",
              "name": "publishv2-release-signed.apk",
              "path": "apps/4238/publishv2-release-signed-144-467-3559.apk",
              "appId": "4238",
              "userId": "3098",
              "metadata": {
                "av": {
                  "status": "queued"
                },
                "size": "18108696",
                "checksum": "cee6a4b78ca54f9ab4e4cf109b77f20c"
              },
              "createdAt": "2025-05-22T09:42:54.093Z",
              "updatedAt": "2025-05-22T09:42:54.103Z",
              "contentType": "application/vnd.android.package-archive",
              "isEncrypted": "true",
              "organizationId": "325"
            }
          ]
        },
        "debugApp": {
          "files": [
            {
              "id": "5748",
              "url": "https://development.api.fliplet.com/v1/media/files/5748/contents/fliplet-android-version-2-debug.apk",
              "name": "fliplet-android-version-2-debug.apk",
              "path": "apps/4238/fliplet-android-version-2-debug-230-382-7579.apk",
              "appId": "4238",
              "userId": "3098",
              "metadata": {
                "av": {
                  "status": "queued"
                },
                "size": "20160637",
                "checksum": "723d3aef0411f8b210223b84b9984397"
              },
              "createdAt": "2025-05-22T09:42:52.848Z",
              "updatedAt": "2025-05-22T09:42:52.862Z",
              "contentType": "application/vnd.android.package-archive",
              "isEncrypted": "true",
              "organizationId": "325"
            }
          ]
        },
        "branchName": "builds/development/eu-851-app-4238-com-fliplet-developmenti-691543",
        "versionCode": "1030",
        "versionNumber": "1.0.3",
        "certificatePassword": "Q3BxDnNJ1K",
        "certificateUsername": "comflipletdevelopmentiOsPublishingV2"
      },
      "platform": "android",
      "status": "started",
      "submittedAt": null,
      "createdAt": "2025-04-22T10:36:21.972Z",
      "updatedAt": "2025-04-22T10:38:20.619Z",
      "deletedAt": null,
      "appId": 275,
      "submittedByUserId": null,
      "targetAppId": null
    }
  ]
}
```

**400 Response (Missing Platform):**

```javascript
{
  "status": "PLATFORM_REQUIRED",
  "message": "Platform is required"
}
```

**400 Response (Invalid Platform):**

```javascript
{
  "status": "INVALID_PLATFORM",
  "message": "Invalid platform. Must be either Android or iOS"
}
```

**400 Response (Invalid Status):**

```javascript
{
  "status": "INVALID_STATUS",
  "message": "Invalid status. Must be one of: started, submitted, queued, processing, ready-for-testing, tested, completed, failed, cancelled"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving submissions"
}
```

### **Get Latest Submission**

* **Endpoint:** GET /v2/apps/:appId/submissions/latest
* **Description:** Get latest submission for specific platform for the app
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Query Parameters:**

- `platform` (string): Platform type \- must be either "android" or "ios"

**Optional Query Parameters:**

- `type` (string): Submission type (default: `appStore`)

**200 Response:**

```json
        {
            "id": 246,
            "data": {
                "submissionType": "appStore",
    "status": "STORE_CONFIG_SUBMITTED",
    "isV2Submission": true,
                "fl-store-bundleId": "com.fliplet.publishingV2",
    "fl-store-iconName": "My App",
                "fl-store-versionCode": "1000",
    "fl-store-versionNumber": "1.0.0",
    "appIcon": "https://cdn.fliplet.com/apps/20/icon-1526650155893.jpg",
    "splashScreen": {
      "url": "https://cdn.fliplet.com/widgets/com.fliplet.apple-app-request/1.0.0/2501231519/img/splash-screen.png",
      "isEncrypted": true
    },
    "teamId": "AFIG8RX79F"
            },
            "result": {},
            "platform": "android",
            "status": "started",
            "submittedAt": null,
            "createdAt": "2025-04-22T10:36:21.972Z",
            "updatedAt": "2025-04-22T10:38:20.619Z",
            "deletedAt": null,
            "appId": 275,
            "submittedByUserId": null,
            "targetAppId": null
        }
```

**400 Response (Missing Platform):**

```javascript
{
  "status": "PLATFORM_REQUIRED",
  "message": "Platform is required"
}
```

**400 Response (Invalid Platform):**

```javascript
{
  "status": "INVALID_PLATFORM",
  "message": "Invalid platform. Must be either Android or iOS"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving submission"
}
```

### **Get Submission By Id**

* **Endpoint:** GET /v2/apps/:appId/submissions/:submissionId
* **Description:** Get submission by id
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Fields:**

- `submissionId` (path parameter): Submission ID

**200 Response:**

```json
{
    "submission": {
        "id": 246,
        "data": {
            "submissionType": "appStore",
      "status": "STORE_CONFIG_SUBMITTED",
      "isV2Submission": true,
            "fl-store-bundleId": "com.fliplet.publishingV2",
      "fl-store-iconName": "My App",
            "fl-store-versionCode": "1000",
      "fl-store-versionNumber": "1.0.0",
      "appIcon": "https://cdn.fliplet.com/apps/20/icon-1526650155893.jpg",
      "splashScreen": {
        "url": "https://cdn.fliplet.com/widgets/com.fliplet.apple-app-request/1.0.0/2501231519/img/splash-screen.png",
        "isEncrypted": true
      },
      "teamId": "AFIG8RX79F"
        },
        "result": {},
        "platform": "android",
        "status": "started",
        "submittedAt": null,
        "createdAt": "2025-04-22T10:36:21.972Z",
        "updatedAt": "2025-04-22T10:38:20.619Z",
        "deletedAt": null,
        "appId": 275,
        "submittedByUserId": null,
        "targetAppId": null
    }
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving submission"
}
```

**404 Response (Submission Not Found):**

```javascript
{
  "message": "Submission not found"
}
```

### **Cancel build**

* **Endpoint:** DELETE /v1/apps/:appId/submissions/:submissionId
* **Description:** cancel the build
* **Role:** Publisher
* **Platform:** Android & iOS

**Request Body:**

```javascript
{
}
```

**200 Response:**

```javascript
{
}
```

### **Set App Permissions**

* **Endpoint:** PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions
* **Description:** Set Native apps permissions for the app
* **Role:** Fliplet Admin
* **Platform:** Android & iOS

**Request Body: (Android)**

```javascript
{
  "USE_BIOMETRIC": {
    "enable": true
  },
  "USE_FINGERPRINT": {
    "enable": true
  },
  "WRITE_EXTERNAL_STORAGE": {
    "enable": true
  },
  "ACCESS_NETWORK_STATE": {
    "enable": true
  },
  "ACCESS_COARSE_LOCATION": {
    "enable": true
  },
  "ACCESS_FINE_LOCATION": {
    "enable": true
  },
  "DOWNLOAD_WITHOUT_NOTIFICATION": {
    "enable": true
  },
  "INTERNET": {
    "enable": true
  },
  "VIBRATE": {
    "enable": true
  },
  "MODIFY_AUDIO_SETTINGS": {
    "enable": true
  },
  "READ_PHONE_STATE": {
    "enable": true
  },
  "RECEIVE_BOOT_COMPLETED": {
    "enable": true
  },
  "WAKE_LOCK": {
    "enable": true
  },
  "CAMERA": {
    "enable": true
  },
  "USE_FULL_SCREEN_INTENT": {
    "enable": true
  },
  "READ_MEDIA_AUDIO": {
    "enable": true
  },
  "POST_NOTIFICATIONS": {
    "enable": true
  },
  "FOREGROUND_SERVICE": {
    "enable": true
  },
  "SYSTEM_ALERT_WINDOW": {
    "enable": true
  }
}
```

**Request Body: (iOS)**

```javascript
{
  "NSCameraUsageDescription": {
    "string": "To upload photos for other users to access or manage images in the content, allow camera access.",
    "enable": true
  },
  "NSMicrophoneUsageDescription": {
    "string": "To record sound, allow microphone access.",
    "enable": true
  },
  "NSFaceIDUsageDescription": {
    "string": "To use Face ID for authentication and unlocking the app, allow Face ID access.",
    "enable": true
  },
  "NSLocationAlwaysUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSLocationAlwaysAndWhenInUseUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSLocationWhenInUseUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSMotionUsageDescription": {
    "string": "To track the device motion, allow access to motion activity.",
    "enable": true
  },
  "NSPhotoLibraryUsageDescription": {
    "string": "To upload photos for other users to access or manage images in the content, allow access to the photo library.",
    "enable": true
  },
  "NSBluetoothAlwaysUsageDescription": {
    "string": "To connect to nearby Bluetooth accessories, allow Bluetooth access.",
    "enable": true
  },
  "NSBluetoothPeripheralUsageDescription": {
    "string": "To connect to nearby Bluetooth accessories, allow Bluetooth access.",
    "enable": true
  },
  "NSLocalNetworkUsageDescription": {
    "string": "To discover and communicate with devices on your local network, allow local network access.",
    "enable": true
  },
  "NSContactsUsageDescription": {
    "string": "To look up and share contacts from your address book, allow access to Contacts.",
    "enable": true
  },
  "NSUserTrackingUsageDescription": {
    "string": "Your data may be used to deliver personalized content and measure performance across apps and websites you use. Allow tracking to improve your experience.",
    "enable": false
  }
}
```

**200 Response:**

```javascript
{
  "message": "App permissions are updated",
}
```

**400 Response (Invalid JSON):**

```javascript
{
  "message": "Permission JSON is not valid"
}
```

**400 Response (Missing JSON field):**

```javascript
{
  "message": "Permission JSON is missing fields",
  "requiredFields": ["NSLocalNetworkUsageDescription"]
}
```

### **Get App Permissions**

* **Endpoint:** GET /v2/admin/apps/:appId/submissions/:submissionId/permissions
* **Description:** Get Native apps permissions for the app
* **Role:** Publisher
* **Platform:** Android & iOS

**200 Response (Android):**

```javascript
{
  "USE_BIOMETRIC": {
    "enable": true
  },
  "USE_FINGERPRINT": {
    "enable": true
  },
  "WRITE_EXTERNAL_STORAGE": {
    "enable": true
  },
  "ACCESS_NETWORK_STATE": {
    "enable": true
  },
  "ACCESS_COARSE_LOCATION": {
    "enable": true
  },
  "ACCESS_FINE_LOCATION": {
    "enable": true
  },
  "DOWNLOAD_WITHOUT_NOTIFICATION": {
    "enable": true
  },
  "INTERNET": {
    "enable": true
  },
  "VIBRATE": {
    "enable": true
  },
  "MODIFY_AUDIO_SETTINGS": {
    "enable": true
  },
  "READ_PHONE_STATE": {
    "enable": true
  },
  "RECEIVE_BOOT_COMPLETED": {
    "enable": true
  },
  "WAKE_LOCK": {
    "enable": true
  },
  "CAMERA": {
    "enable": true
  },
  "USE_FULL_SCREEN_INTENT": {
    "enable": true
  },
  "READ_MEDIA_AUDIO": {
    "enable": true
  },
  "POST_NOTIFICATIONS": {
    "enable": true
  },
  "FOREGROUND_SERVICE": {
    "enable": true
  },
  "SYSTEM_ALERT_WINDOW": {
    "enable": true
  }
}
```

**200 Response (iOS):**

```javascript
{
  "NSCameraUsageDescription": {
    "string": "To upload photos for other users to access or manage images in the content, allow camera access.",
    "enable": true
  },
  "NSMicrophoneUsageDescription": {
    "string": "To record sound, allow microphone access.",
    "enable": true
  },
  "NSFaceIDUsageDescription": {
    "string": "To use Face ID for authentication and unlocking the app, allow Face ID access.",
    "enable": true
  },
  "NSLocationAlwaysUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSLocationAlwaysAndWhenInUseUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSLocationWhenInUseUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSMotionUsageDescription": {
    "string": "To track the device motion, allow access to motion activity.",
    "enable": true
  },
  "NSPhotoLibraryUsageDescription": {
    "string": "To upload photos for other users to access or manage images in the content, allow access to the photo library.",
    "enable": true
  },
  "NSBluetoothAlwaysUsageDescription": {
    "string": "To connect to nearby Bluetooth accessories, allow Bluetooth access.",
    "enable": true
  },
  "NSBluetoothPeripheralUsageDescription": {
    "string": "To connect to nearby Bluetooth accessories, allow Bluetooth access.",
    "enable": true
  },
  "NSLocalNetworkUsageDescription": {
    "string": "To discover and communicate with devices on your local network, allow local network access.",
    "enable": true
  },
  "NSContactsUsageDescription": {
    "string": "To look up and share contacts from your address book, allow access to Contacts.",
    "enable": true
  },
  "NSUserTrackingUsageDescription": {
    "string": "Your data may be used to deliver personalized content and measure performance across apps and websites you use. Allow tracking to improve your experience.",
    "enable": false
  }
}
```

**400 Response:**

```javascript
{
  "message": "An error occurred in getting app permissions"
}
```

### **Reset App Permissions**

* **Endpoint:** PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions/reset
* **Description:** Reset Native apps permissions for the app to the default
* **Role:** Fliplet Admin
* **Platform:** Android & iOS

**Request Body:**

```javascript
{

}
```

**200 Response**

```javascript
{
  "message": "App permissions are reset to default"
}
```

**400 Response:**

```javascript
{
  "message": "An error occured in resetting the app permissions"
}
```

### **Publish app (Used for generating productionAppId)**

* **Endpoint:** POST /v1/apps/:appId/publish
* **Description:** Create Production App for the master app
* **Role:** Publisher
* **Platform:** Android & iOS

**Request Body:**

```javascript
{
  "release": {
    "type": "silent",
    "changelog": "Initial version"
  }
}
```

**201 Response**

```javascript
{
  "app": {
    "version": "1",
    "id": 410641,
    "updatedAt": "2025-09-23T10:19:21.300Z"
  }
}
```

**400 Response:**

```javascript
{
  "error": "Failed to publish app"
}
```

### **Upload file**

* **Endpoint:** POST /v1/media/files?appId={appId}\&name={fileName}
* **Description:** Uploads files (images, documents, fonts, videos, etc.) to the media library with support for encryption, thumbnails, and storage management.
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Query Parameters:**

- `appId` (string): App Id of the app
- `fileName`(string): File name of the file being uploaded

**Required Form data:**

- `name[0]` (string): File name
- `files[0]`(binary): File content

**201 Response**

```javascript
{
    "files": [
        {
            "versions": {},
            "isOrganizationMedia": false,
            "id": 8326584,
            "name": "fliplet-android-version-2-debug.apk",
            "path": "apps/388070/fliplet-android-version-2-debug-277-599-0697.apk",
            "contentType": "application/vnd.android.package-archive",
            "userId": 567094,
            "metadata": {
                "av": {
                    "status": "queued"
                },
                "size": 34922039,
                "checksum": "78e8d924a141d0a579f04adc59675523"
            },
            "organizationId": 2845,
            "isEncrypted": true,
            "url": "https://api.fliplet.com/v1/media/files/8326584/contents/fliplet-android-version-2-debug.apk",
            "appId": 388070,
            "updatedAt": "2025-09-23T10:22:44.630Z",
            "createdAt": "2025-09-23T10:22:44.615Z",
            "thumbnail": null,
            "dataTrackingId": null,
            "mediaFolderId": null,
            "dataSourceEntryId": null,
            "size": null,
            "deletedAt": null,
            "masterMediaFileId": null
        }
    ]
}
```

**400 Response:**

```javascript
{
  "message": "No files were uploaded"
}
```

**400 Response:**

```javascript
{
  "error": "Filename is required"
}
```

**400 Response:**

```javascript
{
  "error": "File with invalid name detected."
}
```

**400 Response:**

```javascript
{
  "error": "Your current plan is limited to XMb of uploaded files."
}
```

**400 Response:**

```javascript
{
  "error": "Font files can only be uploaded to apps. Please upload them to an app folder instead."
}
```

**400 Response:**

```javascript
{
  "error": "appId or organizationId or folderId is required"
}
```