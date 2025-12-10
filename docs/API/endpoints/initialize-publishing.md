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

