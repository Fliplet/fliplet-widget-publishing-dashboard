# Tech Spec — Phase 2: iOS Publishing (Verbatim Extract)

API key (iOS)
API keys allow users to publish their app to Apple Store Connect (ASC) without needing to enter their Apple credentials.
User needs to provide following information to configure API key:
Key Id: The unique alphanumeric identifier Apple assigns to your API key (e.g., “ABCD1234EF”).
Issuer Id: The GUID that represents your App Store Connect organization—used as the “iss” claim in your JWT.
API key content: The private key itself (the .p8 file’s contents) that you use to sign authentication tokens.
API key name: Your own descriptive label for the key (e.g., “Fliplet org”) to help you manage multiple keys.
App publisher can add API keys
Organization admin can:
Update the existing API key name
Remove API key
API keys will be associated with an organization, and app publishers can add multiple API keys
A single organization can have multiple API keys linked to different Apple Team IDs.
All sensitive data (API keys, certificates, push notification keys) are encrypted using the organization's encryption key before storage. The encryption key is generated using:
encryptionKey = `${config.password_salt}${organizationId}${moment(createdAt).unix()}`

Organization Credentials Storage Structure for API keys
The organization credentials are stored in a structured JSONB format within the credentials column of the organization table. This structure supports multiple API keys per team, along with team-specific certificates and push notification configurations.

Root Structure

{
  "credentials": {
    "iosAppStoreApiKey": { /* API Keys by Team */ },
    "iosAppStoreDistributionCertificate": { /* Certificates by Team */ },
    "iosPushNotificationKey": { /* Push Notifications by Team */ }
  }
}

API Keys Structure (credentials.iosAppStoreApiKey)
{
  "iosAppStoreApiKey": {
    "team123": {
      "keyId": "ABC123DEF4",
      "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
      "teamId": "team123",
      "apiKey": "-----BEGIN PRIVATE KEY-----\n...",
      "name": "Production API Key",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "createdFromUserId": 123
    },
    "team124": {
      "keyId": "XYZ789GHI0",
      "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
      "teamId": "team123",
      "apiKey": "-----BEGIN PRIVATE KEY-----\n...",
      "name": "Development API Key",
      "updatedAt": "2024-01-16T14:20:00.000Z",
      "createdFromUserId": 123
    }
  }
}

Key Naming Convention: {teamId}
teamId: Apple Developer Team ID

API Key Fields
Field
Type
Description
Required
keyId
String
App Store Connect Key ID
Yes
issuerId
String
App Store Connect Issuer ID
Yes
teamId
String
Apple Developer Team ID
Yes
apiKey
String
Private key content (P8 file)
Yes
name
String
Display name for the API key
Yes
createdAt
Date
created timestamp
Yes
updatedAt
Date
Last update timestamp
Yes
createdFromUserId
Number
User ID who created the key
Yes

Using the API Key in Fastlane Configuration
For iOS App Store submissions, we will use an API key for authentication and app submission to Apple Store Connect. This will replace the need for an Apple ID and password, eliminating the requirement for two-factor authentication (2FA) and simplifying the process.
Create a new file fastlane/Appfile and add:

app_identifier "com.example.app" # Replace with your app's bundle ID

json_key_file "./fastlane/api_key.json"

Then, create fastlane/api_key.json manually with the following format:
{
  "key_id": "YOUR_KEY_ID",
  "issuer_id": "YOUR_ISSUER_ID",
  "key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
}

Using the API Key with Spaceship

require 'spaceship'

Spaceship::ConnectAPI.token = Spaceship::ConnectAPI::Token.create(
  key_id: "YOUR_KEY_ID",
  issuer_id: "YOUR_ISSUER_ID",
  key: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----"
)

# Example: Fetch all apps
apps = Spaceship::ConnectAPI::App.all
apps.each do |app|
  puts "App: #{app.name} (#{app.bundle_id})"
end

Using the API Key with REST API
Generate JWT Token

const fs = require("fs");
const jwt = require("jsonwebtoken");

const generateJWT = () => {
  const keyId = "YOUR_KEY_ID"; // Found in App Store Connect
  const issuerId = "YOUR_ISSUER_ID"; // Found in App Store Connect
  const privateKey = "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----";

  const token = jwt.sign(
    {
      iss: issuerId,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Expiration time: 5 minutes
      aud: "appstoreconnect-v1",
    },
    privateKey,
    {
      algorithm: "ES256",
      keyid: keyId,
    }
  );

  return token;
};

module.exports = generateJWT;

Make the request

const axios = require("axios");
const generateJWT = require("./generateJWT");

const getApps = async () => {
  try {
    const token = generateJWT();

    const response = await axios.get("https://api.appstoreconnect.apple.com/v1/apps", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Apps:", response.data);
  } catch (error) {
    console.error("Error fetching apps:", error.response ? error.response.data : error.message);
  }
};

getApps();

iOS API Endpoints (Apple app store apps only)

Set API Key Configuration (For Apple app store apps only) (Updated)
Endpoint: PUT /v2/organizations/:organizationId/credentials/api-Key
Description: Set API key for apple app store submission
Request Body:

{
  "apiKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----",
  "issuerId": "69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1",
  "keyId": "977G8RX79F",
  "teamId":"AFIG8RX79F",
  "name": "Fliplet org" //New Field
}

201 Response:
{
  "status": "API_KEY_CONFIGURED",
  "message": "API key configured",
}

400 Response (MISSING_API_KEY_CONFIGURATION):
{
  "status": "MISSING_API_KEY_CONFIGURATION",
  "message": "Required API key is missing",
  "requiredField": "keyId"
}

400 Response (FAILED_API_KEY_CONFIGURATION):
{
  "status": "FAILED_API_KEY_CONFIGURATION",
  "message": "API key validation is failed"
}

Get list of API Keys for organization (For Apple app store apps only) (Updated)
Endpoint: GET /v2/organizations/:organization/credentials/api-keys
Description: Retrieves all Apple App Store API key configurations for an organization across all teams.

Get API Key Configuration (For Apple app store apps only) (Updated)
Endpoint: GET /v2/organizations/:organizationId/credentials/api-Key/teams/:teamId
Description: Retrieves a specific Apple App Store API key configuration by team ID
Query parameter: includeSensitiveData -> Whether to include API key content or not

Update API key Configuration (For Apple app store apps only) (Added)
Endpoint: PUT /v2/organizations/:organizationId/credentials/api-Keys/teams/:teamId
Description: Update a specific Apple App Store API key name by team ID.

Delete API key Configuration (For Apple app store apps only) (Updated)
Endpoint: DELETE /v2/organizations/:organizationId/credentials/api-Keys/teams/:teamId
Description: Delete a specific Apple App Store API key name by team ID.

Validate API Key Configuration (For Apple app store apps only)
Endpoint: POST /v2/organizations/:organizationId/credentials/api-Key/validate
Description: Validate API key for apple app store submission

Get list of Apple app bundle Id (For Apple app store apps only) (Updated)
Endpoint: GET /v2/apps/:appId/submissions/:submissionId/bundleId
Description: Get list of apps created in ASC

Get App detail of Apple app bundle Id (For Apple app store apps only) (Updated)
Endpoint: GET GET /v2/apps/:appId/submissions/:submissionId/bundleId/details
Query parameter: bundleId 
Pass bundle Id to get the app details from the ASCƒ
Description: Get app details from bundle Id for Apple apps

Certificate Management
What's required to sign a new app?
Distribution Certificate (.cer or .p12)
Private Key associated with that certificate or .p12 file combining both private key and certificate
Why you need both:
The certificate contains your public key, which Apple uses to verify your app.
The private key is used to sign the app locally. It never leaves your machine.

What's required to sign an app that will replace an existing app?
To sign an app that will replace an existing app on the App Store, your new build must match the original app’s code signing identity. Here's exactly what you need:
Requirements for Signing a Replacement App
Same Bundle Identifier
Must match the existing app’s Bundle ID exactly.
Example: com.companyname.appname
Same Team / Apple Developer Account
The new app must be signed with a certificate from the same Apple Developer account used for the existing app.
Valid Distribution Certificate + Private Key
Either:
Use the same distribution certificate and private key used previously, or
Generate a new distribution certificate in the same team account and update your provisioning profile.
Provisioning Profile
App Store distribution provisioning profile must match the bundle ID and be generated from the correct certificate.
Can be updated if the certificate changes.
Incremented Build Number
The version number (CFBundleShortVersionString) and/or build number (CFBundleVersion) must be higher than the last release.
Matching App Entitlements (optional but important)
If your app uses specific entitlements like push notifications, iCloud, etc., ensure they match or are compatible with the original entitlements.=

V1 iOS Certificate management 
Users can create new certificates for signing. Fliplet stores certificates, certificate requests and private keys. User can download certificate and private key using 
GET v1/organizations/:orgId/credentials/submission-:submissionId/download/p12
GET v1/organizations/:orgId/credentials/submission-:submissionId/download/certificate
Users can use certificate which is used for previous submission
User can upload their own certificate, a p12 file combining certificate + private key

V2 certificate management
iOS submissions:
We will store one certificate per team Id and use it, If user upload or create a new one existing certificate will be replaced
Enable users to download certificates for each iOS submission.
Allow users to upload separate certificate and private key files for iOS submissions, matching the format downloaded from the Studio UI.

Certificates Structure (credentials.iosCertificate)

{
  "iosAppStoreCertificate": {
    "team123": {
      "p12": "-----BEGIN PRIVATE KEY-----\n...",
      "certificate": {
        "content": "-----BEGIN CERTIFICATE-----\n...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": "2025-01-01T00:00:00.000Z"
      },
      "teamId": "team123",
      "updatedAt": "2024-01-15T11:00:00.000Z",
      "createdFromUserId": 123
    }
  }
}

Key Naming Convention: {teamId} (one certificate per team)

Check iOS certificate
Endpoint: POST /v2/apps/:appId/submissions/:submissionId/check-certificate
Description: Check if existing iOS certificate is valid or not

Create new iOS Certificate (Updated)
Endpoint: POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
Description: Create new iOS distribution certificate

Upload iOS Certificate (Updated)
Endpoint: PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
Description: Upload iOS distribution certificate

Push Notification Configuration Validation (FCM & APNS)
Apple Push Notification Service (APNS) Validation
We use the node-pushnotifications library for APNS validation via token-based authentication.
Steps:
Load the .p8 token file with Apple Key ID and Team ID.
Define the topic using the app's bundle ID.
Send a test notification to a known valid APNS device token.
Analyze the response for any delivery or auth errors.

async function checkAPNsConfig(options) {
  const { apnKeyId, apnTopic, apnTeamId, apnAuthKey } = options;
  const token = {
    token: {
      key: apnAuthKey,
      keyId: apnKeyId,
      teamId: apnTeamId
    },
    production: true
  };
  const settings = {
    apn: token
  };
  const deviceToken = 'a9d0ed10e9cfd022a61cb08753f49c5a0b0dfb383697bf9f9d750a1003da19c7';
  // const apnProvider = new APN.Provider(apnConfig);
  const pushNotification = new PushNotifications(settings);
  const notificationData = {
    expiry: Math.floor(Date.now() / 1000) + 3600,
    badge: 3,
    alert: '\uD83D\uDCE7 \u2709 You have a new message',
    payload: { 'messageFrom': 'Test' },
    topic: apnTopic
  };

  try {
    const result = await pushNotification.send(deviceToken, notificationData);

    return result;
  } catch (error) {
    console.log(`[APNS_CHECK_ERROR], Error: ${error}`);
    throw error;
  }
}

Push Notifications Structure (credentials.pushNotificationKey)

{
  "pushNotificationKey": {
    "team123": {
      "keyId": "PUSH123KEY",
      "key": "-----BEGIN PRIVATE KEY-----\n...",
      "teamId": "team123",
      "updatedAt": "2024-01-15T12:00:00.000Z",
      "createdFromUserId": 123
    }
  }
}

Submit push notification config for Widget (Updated)
Endpoint: PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
Description: Submits push config for the app
Request Body: (iOS)

{
  "submissionId": 123, //This will be the submission Id //New field
  "platform": "ios",
  "apn": true,
  "apnKeyId": "977G8RX79F",
  "apnTopic": "com.fliplet.iOsPublishingV2",
  "apnTeamId": "H25Z7T6F52",
  "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----"
}

Get Push config data from TeamId (For Apple app store apps only) (Added)
Endpoint: GET v2/organizations/:organizationId/credentials/ios-push-config/:teamId
Description: Get push notifications config for the app stored by teamId
