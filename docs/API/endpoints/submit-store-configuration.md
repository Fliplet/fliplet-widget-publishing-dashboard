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

