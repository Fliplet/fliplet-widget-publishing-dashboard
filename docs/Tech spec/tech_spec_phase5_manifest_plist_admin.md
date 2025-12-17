# Tech Spec — Phase 5: Admin-only Manifest / Plist Updates (Verbatim Extract)

Update Manifest and Plist File
This feature allows Fliplet Admins to update the Android manifest file and the iOS Info.plist file for Fliplet apps.
This feature is restricted to Fliplet Admins only — regular users will not have access.
Fliplet Admins can provide custom content for:
Uses-permission in Android AndroidManifest.xml
Usage description in iOS Info.plist file
Fliplet Admins can update the permission strings/Message for iOS apps only via the Info.plist file. For Android, it is not possible to update permissions message through the manifest file using this feature.
During the build process, the AAB will replace the default file content with the custom content provided.
API will provide JSON object (Similar to organization plan context). Fliplet Admins can enable and disable the permission and save it.
However, it is the Fliplet Admin’s responsibility to ensure the content is accurate and complete.
Missing permissions or incorrect configurations may lead to unexpected app behavior.
Changes must be set separately for Android and iOS apps.
Once saved, the custom content will be applied to all future builds of the respective platform.
This feature is limited to updating only the permissions section of the Android Manifest and iOS Info.plist files. These files contain other critical information that should not be modified externally to ensure app stability and integrity.

Implementation Plan
Sample JSON file for the permissions
{
  "android": {
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
  },
  "iOS": {
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
}

1. Backend Changes
API to retrieve and store selected permissions (See list of APIs)

3. Native App Updates
Modify AndroidManifest.xml and Info.plist dynamically from the fliplet wrapper utility before app build.

Get App permissions - not ready
Endpoint: GET /v2/apps/:appId/permissions?platform
Description: Get app permissions based on device platform

Update App permissions - not ready
Endpoint: PUT /v2/apps/:appId/permissions
Description: Update app permissions

Reset App permissions - not ready
Endpoint: DELETE /v2/apps/:appId/permissions
Description: Reset app permissions to the default
