### **Set App Permissions**

* **Endpoint:** PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions
* **Description:** Set Native apps permissions for the app
* **Role:** Fliplet Admin
* **Platform:** Android & iOS

**Request Body: (Android)**

```javascript
{
  "USE_BIOMETRIC": {
    "enable": true
  },
  "USE_FINGERPRINT": {
    "enable": true
  },
  "WRITE_EXTERNAL_STORAGE": {
    "enable": true
  },
  "ACCESS_NETWORK_STATE": {
    "enable": true
  },
  "ACCESS_COARSE_LOCATION": {
    "enable": true
  },
  "ACCESS_FINE_LOCATION": {
    "enable": true
  },
  "DOWNLOAD_WITHOUT_NOTIFICATION": {
    "enable": true
  },
  "INTERNET": {
    "enable": true
  },
  "VIBRATE": {
    "enable": true
  },
  "MODIFY_AUDIO_SETTINGS": {
    "enable": true
  },
  "READ_PHONE_STATE": {
    "enable": true
  },
  "RECEIVE_BOOT_COMPLETED": {
    "enable": true
  },
  "WAKE_LOCK": {
    "enable": true
  },
  "CAMERA": {
    "enable": true
  },
  "USE_FULL_SCREEN_INTENT": {
    "enable": true
  },
  "READ_MEDIA_AUDIO": {
    "enable": true
  },
  "POST_NOTIFICATIONS": {
    "enable": true
  },
  "FOREGROUND_SERVICE": {
    "enable": true
  },
  "SYSTEM_ALERT_WINDOW": {
    "enable": true
  }
}
```

**Request Body: (iOS)**

```javascript
{
  "NSCameraUsageDescription": {
    "string": "To upload photos for other users to access or manage images in the content, allow camera access.",
    "enable": true
  },
  "NSMicrophoneUsageDescription": {
    "string": "To record sound, allow microphone access.",
    "enable": true
  },
  "NSFaceIDUsageDescription": {
    "string": "To use Face ID for authentication and unlocking the app, allow Face ID access.",
    "enable": true
  },
  "NSLocationAlwaysUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSLocationAlwaysAndWhenInUseUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSLocationWhenInUseUsageDescription": {
    "string": "To provide your current location or display a map with your location, allow location access.",
    "enable": true
  },
  "NSMotionUsageDescription": {
    "string": "To track the device motion, allow access to motion activity.",
    "enable": true
  },
  "NSPhotoLibraryUsageDescription": {
    "string": "To upload photos for other users to access or manage images in the content, allow access to the photo library.",
    "enable": true
  },
  "NSBluetoothAlwaysUsageDescription": {
    "string": "To connect to nearby Bluetooth accessories, allow Bluetooth access.",
    "enable": true
  },
  "NSBluetoothPeripheralUsageDescription": {
    "string": "To connect to nearby Bluetooth accessories, allow Bluetooth access.",
    "enable": true
  },
  "NSLocalNetworkUsageDescription": {
    "string": "To discover and communicate with devices on your local network, allow local network access.",
    "enable": true
  },
  "NSContactsUsageDescription": {
    "string": "To look up and share contacts from your address book, allow access to Contacts.",
    "enable": true
  },
  "NSUserTrackingUsageDescription": {
    "string": "Your data may be used to deliver personalized content and measure performance across apps and websites you use. Allow tracking to improve your experience.",
    "enable": false
  }
}
```

**200 Response:**

```javascript
{
  "message": "App permissions are updated",
}
```

**400 Response (Invalid JSON):**

```javascript
{
  "message": "Permission JSON is not valid"
}
```

**400 Response (Missing JSON field):**

```javascript
{
  "message": "Permission JSON is missing fields",
  "requiredFields": ["NSLocalNetworkUsageDescription"]
}
```








