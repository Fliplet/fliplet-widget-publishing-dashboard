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

