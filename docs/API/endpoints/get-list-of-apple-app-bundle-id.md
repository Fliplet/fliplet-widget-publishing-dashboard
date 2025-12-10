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

