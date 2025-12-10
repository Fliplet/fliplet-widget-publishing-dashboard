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

