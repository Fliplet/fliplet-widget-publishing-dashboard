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








