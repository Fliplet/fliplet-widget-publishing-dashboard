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

