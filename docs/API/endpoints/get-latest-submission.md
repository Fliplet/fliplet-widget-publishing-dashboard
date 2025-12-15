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








