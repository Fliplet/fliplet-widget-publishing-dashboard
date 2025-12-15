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








