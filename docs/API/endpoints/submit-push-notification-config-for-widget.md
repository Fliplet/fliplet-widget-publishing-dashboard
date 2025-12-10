### **Submit push notification config for Widget (Updated)**

* **Endpoint:** PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
* **Description:** Submits push config for the app
* **Role:** Publisher
* **Platform:** Android & iOS

**Request Body: (iOS)**

```javascript
{
  "submissionId": 123, //This will be the submission Id //New field
  "platform": "ios",
  "apn": true,
  "apnKeyId": "977G8RX79F",
  "apnTopic": "com.fliplet.iOsPublishingV2",
  "apnTeamId": "H25Z7T6F52",
  "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----"
}

```

**Request Body: (Android)**

```javascript
{
  "submissionId": 123, //This will be the submission Id
  "platform": "android",
  "fcm": true,
  "project_id": "android-notification-d2684",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQD6py4sjCnkYuwq\nz9V5vsJjQ5sjKqdi9JkF78O8lwvCsFmgVj8aPB/gz+8Xeenhtn76DqdU9rT4gEUR\nmyfQcHD6MDfkP21y8KvV2pG9cFjIgCTTb9n4oTu/g3XTuEHE5969Ouq1h4gdOjd4\nP/I3HmQMq3C5bm9Fh0gkZsd+7A/mG0Q2GrhOX9WioE+RRFLWlImSKYMwdf4yyk3d\noZe/e76zy12Xu1GYGNFYfpMw51VzG2WbvHsTYisxqfdWQJWDj4Fh9CsGSmugMJWV\n8mBUU524RxFrxmBqSsxeg+5JpOjtKNmFrF0eVs4LxlzusyeSTEDsmwHFXvJps/2n\nOdDycRZhAgMBAAECggEAFsSS1CcTMxStQSJJ0No8DAo7EFGyjLGNKNXjoMDTp6af\nLYpIBxkJCEG7BRXk4cTS+eHU30ndnGkCXRwL3Mop6P/yQ8BjL7qe0TkeXefTmLrT\nHYWedhAnPjkxvb6R8tHhEK1GXqDmA0mjej/Mv6b6DZCRF7bpUpZ8Pho76tKEizEm\n1wWO7vgBVLrjI86tYkN12eo/AbLyYM0V3B7Bcz30PnljwAOrsJREYuCbirSBpSep\n6pv8RhaTd3TSJsgZavPawYCk3jD8proiucv2vRs6FUlKY8W6JcMhBtngj/bF1auY\nyIvDvishs4QPRj/rM9BBFyMsXcxH88tYqnXp8NOowQKBgQD9YWKAqJQrHIhSLiO1\nZjo88A7oGdvykDpJILmYEYJZicfMeVM16UgkkUPsqhL1JaPOQVROlFtjdCWveeYE\n1p7qMbNK+28n88woLOalj2+DPa4ckXCZh+wU27Oks4XjuYZtqdMbWGJvBDB83LQb\nf89CLEZCrRWW0KbPZJWcGfTbyQKBgQD9PpPAl1lZjz57yafaVZx6EmHHr3AzH4LJ\num23Fvivq7pzg9V6lLa+yl5eT3Bgv0jB3zS/IpNKukdylJHx8oH/f+v4Y7VBiRh2\ns7aaQWNBuBOSzVfNL0qZqtqiLjXSIzBFPEgxkFWmmkfgOqBVfaIngHWfXAhC3how\n5E9M2k8B2QKBgFuNVIooX2E0bg1DnqNszJ44Hyq+LTr34heKO4U2zmKL5iV7sRVJ\ntUeBNYnN6guqDgX4lP3PnTXSQculv/b/lWwJiT8OmptU+++ISc6IhUJmhwLLimPv\nON5QhBh+xWIDJw94zU6UIPz8BokXNfy5sam3VavB3osf2SYWsfg1aMQBAoGAeSgJ\nFCjUjG5lnF97uI8gz54fvaMHcM3wioZwmxmYXKMyDrXR2lVvoJO81i33O7IIIwig\neZkXErdQG1dNA43b99rBkBJT00i9tXyBLgd+byCb7K3lBbtMW3xMIS8ufJxtKZKP\nj3bYI17IaFRkBMKYY4GnxFgJc8RCj4WLEt+W0PECgYAXiofByOs68uy+kLNWGsh3\n0Igqu3UmsYOSdTLo2e3xl02JlRzrYXiJ9kvKjMOAITKce1A0w7DbofhwAONY0OC2\nNe+GgQyu3aezuR4qHMIEH5E0etEPFXVx6kwjoRAdsSn9KBV8oL0GKXLPqlPdai47\nI5K7+eSVPzvjPmI8tH3zFQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-clybt@android-notification-d2684.iam.gserviceaccount.com",
"googleServicesTimestamp": 1718740291584,
"serviceAccountTimestamp": 1718740300843,"fl-store-firebase": {
        "id": 49,
        "url": "https://api.fliplet.test/v1/media/files/49/contents/google-services%20%2815%29.json",
        "name": "google-services (15).json",
        "path": "apps/186/google-services-15-994-614-3787.json",
        "size": null,
        "appId": 186,
        "userId": 7,
        "metadata": {
            "av": {
                "status": "queued"
            },
            "size": 712,
            "checksum": "2a07737d949a03da8629c4dadd48a3fd"
        },
        "versions": {},
        "createdAt": "2024-06-12T06:10:53.496Z",
        "deletedAt": null,
        "thumbnail": null,
        "updatedAt": "2024-06-12T06:10:53.532Z",
        "contentType": "application/json",
        "isEncrypted": true,
        "mediaFolderId": null,
        "dataTrackingId": null,
        "organizationId": 2,
        "dataSourceEntryId": null,
        "masterMediaFileId": null,
        "isOrganizationMedia": false
    }
}
```

**201 Response:**

```javascript
{
  "status": "PUSH_NOTIFICATION_CONFIGURED",
  "message": "Push notification data submitted",
  "data": {
    // Data will contains all the push notificaiton data
   "platform": "Android",
   "fcm": true,
   "project_id": "android-notification-d2684",
  }
}
```

**400 Response (MISSING\_PUSH\_CONFIGURATION):**

```javascript
{
  "status": "MISSING_PUSH_CONFIGURATION",
  "message": "Required push config is missing",
  "requiredField": "project_id"
}
```

**400 Response (FAILD\_PUSH\_CONFIGURATION):**

```javascript
{
  "status": "FAILD_PUSH_CONFIGURATION",
  "message": "There is some issue in savind store config"
}
```

**400 Response (INVALID\_PUSH\_CONFIG):**

```javascript
{
  "status": "INVALID_PUSH_CONFIG",
  "message": "Push config is not valid"
}
```

