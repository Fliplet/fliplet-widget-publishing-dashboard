### **Upload file**

* **Endpoint:** POST /v1/media/files?appId={appId}\&name={fileName}
* **Description:** Uploads files (images, documents, fonts, videos, etc.) to the media library with support for encryption, thumbnails, and storage management.
* **Role:** Publisher
* **Platform:** Android & iOS

**Required Query Parameters:**

- `appId` (string): App Id of the app
- `fileName`(string): File name of the file being uploaded

**Required Form data:**

- `name[0]` (string): File name
- `files[0]`(binary): File content

**201 Response**

```javascript
{
    "files": [
        {
            "versions": {},
            "isOrganizationMedia": false,
            "id": 8326584,
            "name": "fliplet-android-version-2-debug.apk",
            "path": "apps/388070/fliplet-android-version-2-debug-277-599-0697.apk",
            "contentType": "application/vnd.android.package-archive",
            "userId": 567094,
            "metadata": {
                "av": {
                    "status": "queued"
                },
                "size": 34922039,
                "checksum": "78e8d924a141d0a579f04adc59675523"
            },
            "organizationId": 2845,
            "isEncrypted": true,
            "url": "https://api.fliplet.com/v1/media/files/8326584/contents/fliplet-android-version-2-debug.apk",
            "appId": 388070,
            "updatedAt": "2025-09-23T10:22:44.630Z",
            "createdAt": "2025-09-23T10:22:44.615Z",
            "thumbnail": null,
            "dataTrackingId": null,
            "mediaFolderId": null,
            "dataSourceEntryId": null,
            "size": null,
            "deletedAt": null,
            "masterMediaFileId": null
        }
    ]
}
```

**400 Response:**

```javascript
{
  "message": "No files were uploaded"
}
```

**400 Response:**

```javascript
{
  "error": "Filename is required"
}
```

**400 Response:**

```javascript
{
  "error": "File with invalid name detected."
}
```

**400 Response:**

```javascript
{
  "error": "Your current plan is limited to XMb of uploaded files."
}
```

**400 Response:**

```javascript
{
  "error": "Font files can only be uploaded to apps. Please upload them to an app folder instead."
}
```

**400 Response:**

```javascript
{
  "error": "appId or organizationId or folderId is required"
}
```








