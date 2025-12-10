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

