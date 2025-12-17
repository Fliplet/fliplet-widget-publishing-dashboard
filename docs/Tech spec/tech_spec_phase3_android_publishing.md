# Tech Spec — Phase 3: Android Publishing (Verbatim Extract)

V1 Android Certificate management
Fliplet will generate a new keystore file for the new app.
If an existing certificate is available, Fliplet will use it; otherwise, a new one will be created.

Issues with Existing certificate management
Android submissions:
Fliplet does not allow users to upload their own certificates.
Users cannot download the certificates used for signing the app.

V2 certificate management
Android submissions:
Provide users with the option to download the keystore file along with its password for Android submissions.
Allow users to upload their own keystore file with a password for Android submissions.

Upload KeyStore file for Android
Endpoint: PUT /v2/apps/:appId/submissions/:submissionId/keystore
Description: Upload Android Keystore file
Payload
{
    "keyStoreFile": {
        "versions": {},
        "isOrganizationMedia": false,
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
        "createdAt": "2025-05-12T12:09:40.038Z",
        "thumbnail": null,
        "size": null,
        "deletedAt": null,
        "dataSourceEntryId": null,
        "dataTrackingId": null,
        "mediaFolderId": null,
        "masterMediaFileId": null
    },
    "keyStorePassword":"9MHSZ3feL5"
}

200 Response 
{
    "status": "SUCCESS",
    "message": "Keystore file uploaded and validated successfully"
}

400 Response (Invalid keystore file or password):
{
    "status": "INVALID_KEYSTORE",
    "message": "Invalid keystore file or incorrect password"
}

400 Response (Invalid keystore file or password):
{
    "status": "DOWNLOAD_ERROR",
    "message": "Failed to download keystore file from S3"
}

Submit store Configuration
Endpoint: PUT /v2/apps/:appId/submissions/:submissionId/metadata
Description: Submits store config for the app
Request Body:

{
  "validationType": "STORE_CONFIG",
  "data": {
    "fl-store-bundleId": "com.fliplet.iOsPublishingV2",
    "fl-store-versionNumber": "1.1.0"
    "fl-store-versionCode": "1010" // For android only
  }
}

Push Notification Configuration Validation (FCM & APNS)
Firebase Cloud Messaging (FCM) Validation via REST API
We use the FCM HTTP v1 REST API to validate FCM configuration. This requires obtaining a valid OAuth 2.0 access token using a service account and making an authenticated POST request to FCM.
Steps:
Use a service account JSON file to generate a short-lived access token.
Send a POST request with a test notification to a known working FCM device token.
Check the response for validation success or failure.
Example
const { google } = require("googleapis");
const axios = require("axios");
const serviceAccount = require("./path/to/serviceAccountKey.json");

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const token = await auth.getAccessToken();
  return token;
}

async function sendFCMTestNotification() {
  const accessToken = await getAccessToken();

  const message = {
    message: {
      token: "VALID_FCM_DEVICE_TOKEN",
      notification: {
        title: "Test",
        body: "This is a test push notification",
      }
    }
  };

  const projectId = serviceAccount.project_id;
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  try {
    const res = await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    });
    console.log("FCM validation success:", res.data);
  } catch (error) {
    console.error("FCM validation failed:", error.response?.data || error.message);
  }
}

sendFCMTestNotification();

Submit push notification config for Widget (Updated)
Endpoint: PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
Description: Submits push config for the app
Request Body: (Android)

{
  "submissionId": 123, //This will be the submission Id
  "platform": "Android",
  "fcm": true,
  "project_id": "android-notification-d2684",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQD6py4sjCnkYuwq\nz9V5vsJjQ5sjKqdi9JkF78O8lwvCsFmgVj8aPB/gz+8Xeenhtn76DqdU9rT4gEUR\nmyfQcHD6MDfkP21y8KvV2pG9cFjIgCTTb9n4oTu/g3XTuEHE5969Ouq1h4gdOjd4\nP/I3HmQMq3C5bm9Fh0gkZsd+7A/mG0Q2GrhOX9WioE+RRFLWlImSKYMwdf4yyk3d\noZe/e76zy12Xu1GYGNFYfpMw51VzG2WbvHsTYisxqfdWQJWDj4Fh9CsGSmugMJWV\n8mBUU524RxFrxmBqSsxeg+5JpOjtKNmFrF0eVs4LxlzusyeSTEDsmwHFXvJps/2n\nOdDycRZhAgMBAAECggEAFsSS1CcTMxStQSJJ0No8DAo7EFGyjLGNKNXjoMDTp6af\nLYpIBxkJCEG7BRXk4cTS+eHU30ndnGkCXRwL3Mop6P/yQ8BjL7qe0TkeXefTmLrT\nHYWedhAnPjkxvb6R8tHhEK1GXqDmA0mjej/Mv6b6DZCRF7bpUpZ8Pho76tKEizEm\n1wWO7vgBVLrjI86tYkN12eo/AbLyYM0V3B7Bcz30PnljwAOrsJREYuCbirSBpSep\n6pv8RhaTd3TSJsgZavPawYCk3jD8proiucv2vRs6FUlKY8W6JcMhBtngj/bF1auY\nyIvDvishs4QPRj/rM9BBFyMsXcxH88tYqnXp8NOowQKBgQD9YWKAqJQrHIhSLiO1\nZjo88A7oGdvykDpJILmYEYJZicfMeVM16UgkkUPsqhL1JaPOQVROlFtjdCWveeYE\n1p7qMbNK+28n88woLOalj2+DPa4ckXCZh+wU27Oks4XjuYZtqdMbWGJvBDB83LQb\nf89CLEZCrRWW0KbPZJWcGfTbyQKBgQD9PpPAl1lZjz57yafaVZx6EmHHr3AzH4LJ\num23Fvivq7pzg9V6lLa+yl5eT3Bgv0jB3zS/IpNKukdylJHx8oH/f+v4Y7VBiRh2\ns7aaQWNBuBOSzVfNL0qZqtqiLjXSIzBFPEgxkFWmmkfgOqBVfaIngHWfXAhC3how\n5E9M2k8B2QKBgFuNVIooX2E0bg1DnqNszJ44Hyq+LTr34heKO4U2zmKL5iV7sRVJ\ntUeBNYnN6guqDgX4lP3PnTXSQculv/b/lWwJiT8OmptU+++ISc6IhUJmhwLLimPv\nON5QhBh+xWIDJw94zU6UIPz8BokXNfy5sam3VavB3osf2SYWsfg1aMQBAoGAeSgJ\nFCjUjG5lnF97uI8gz54fvaMHcM3wioZwmxmYXKMyDrXR2lVvoJO81i33O7IIIwig\neZkXErdQG1dNA43b99rBkBJT00i9tXyBLgd+byCb7K3lBbtMW3xMIS8ufJxtKZKP\nj3bYI17IaFRkBMKYY4GnxFgJc8RCj4WLEt+W0PECgYAXiofByOs68uy+kLNWGsh3\n0Igqu3UmsYOSdTLo2e3xl02JlRzrYXiJ9kvKjMOAITKce1A0w7DbofhwAONY0OC2\nNe+GgQyu3aezuR4qHMIEH5E0etEPFXVx6kwjoRAdsSn9KBV8oL0GKXLPqlPdai47\nI5K7+eSVPzvjPmI8tH3zFQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-clybt@android-notification-d2684.iam.gserviceaccount.com",
"googleServicesTimestamp": 1718740291584,
"serviceAccountTimestamp": 1718740300843,
"fl-store-firebase": {
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

Submit push config metadata (Not needed now, API will manage it)
Endpoint: PUT /v2/apps/:appId/submissions/:submissionId/metadata
Description: User to update Push config metadata like fl-store-firebase for android
fl-store-firebase: fl-store-firebase property is for Android only. When a user update push notification configuration UI needs to pass fl-store-firebase property with the file object of google-service.json file to update it in the current submission. Please pass this from the previous submission as well if it was already configured.
