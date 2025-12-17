# Tech Spec — Phase 4: Deep Linking / App URL Scheme (Verbatim Extract)

App URL Scheme
This feature allows app users to open Fliplet apps directly to a specific screen or path via a web URL. Deep linking on Android (App Links) and iOS (Universal Links) enhances user experience by routing users to the native app when installed, or the web fallback when not.
Note: App must be configured with custom domain to enable this functionality

Supported Platforms
Android (App Links)
iOS (Universal Links)
Web fallback support

Cordova Plugin
Use the cordova-universal-links-plugin or cordova-plugin-deeplinks (depending on stability and compatibility).

Cordova-universal-links-plugin
Fork version of Cordova-universal-links-plugin
Ionic-plugin-deeplinks
Custom-URL-scheme

Comparison
Cordova-universal-links-plugin
Universal Links (iOS 9+): ✅ full support via Associated Domains; configure <universal-links> hosts/paths in config.xml and serve an AASA file on your server.
Android App Links: ✅ deep-linking support; you must host assetlinks.json and configure in Google Play.
Custom-scheme fallback: ❌ not built-in—you’ll need a separate scheme plugin.
Route parsing: ❌ only basic subscribe API (universalLinks.subscribe(event, callback)); you parse URL parameters yourself.
Automatic fallback: ❌ if the app isn’t installed, the link simply opens the website (no scheme fallback).
Configuration: uses <universal-links> block in config.xml.
Maintenance: Deprecated—archived Oct 1, 2018; no further updates or support github.comgithub.com.
Stars/Forks: ~350 stars, 533 forks.

Fork version of Cordova-universal-links-plugin
Universal Links (iOS 9+) & Android App Links: ✅ same feature-set as the original nordnet fork.
Custom-scheme fallback: ❌ not included.
Route parsing: ⚠️ still basic host→event mapping; you handle params manually.
Automatic fallback: ❌ none.
Configuration: <universal-links> entries in plugin.xml (identical to nordnet’s).
Maintenance: minimal activity—fork of nordnet with 156 commits but very few recent changes and only 3 stars github.comgithub.com.
Stars/Forks: 3 stars, 1 fork.

Ionic-plugin-deeplinks
Universal Links (iOS) & App Links (Android): ✅ full support, including entitlement/manifest injection for Associated Domains and assetlinks.json
Custom-scheme fallback: ✅ built-in fallback to your HTTP domain or myapp://… scheme if Universal/App Link fails.
Route parsing: ✅ define patterns like /products/:id in JavaScript—matched args are extracted for you.
Automatic fallback: ✅ seamless, zero-extra plumbing.
Configuration: simple CLI vars in config.xml (URL_SCHEME, DEEPLINK_SCHEME, DEEPLINK_HOST, ANDROID_PATH_PREFIX, plus up to 5 host sets).
Maintenance: Archived Aug 17, 2023; last active ~1.8 years ago—but remains the richest, Ionic-backed solution github.com.
Stars/Forks: 335 stars, 222 forks.

Custom-URL-scheme
Universal/App Links: ❌ only custom URI schemes (myapp://…), no domain-based links.
Custom-scheme fallback: ✅ robust, battle-tested on iOS/Android since Cordova 3+; registers handleOpenURL.
Route parsing: ❌ you subscribe via window.handleOpenURL(url) and parse the URL yourself.
Automatic fallback: n/a.
Configuration: CLI install with --variable URL_SCHEME=myapp; edits Info.plist/AndroidManifest accordingly.
Maintenance: latest release v5.0.2 on Jul 30, 2020; still the de facto custom-scheme plugin github.com.
Stars/Forks: 1 000 stars, 366 forks.

Summary
The Fork version of Cordova-universal-links-plugin handles both Universal Links (iOS) and deep links (Android) in a single package and doesn’t rely on the Ionic framework.
The Ionic-plugin-deeplinks is built on top of the universal-links plugin but is designed to work specifically with Ionic’s routing system. For a standard Cordova app, the universal-links plugin is simpler to integrate, while the Ionic plugin is preferable only if the app already uses Ionic’s navigation.
So, the Fork version of Cordova-universal-links-plugin is more suitable for our use case.

Plugin Configuration
Add the following to config.xml (this is what gets added automatically if you offer a UI for configuration):
<universal-links>
  <host name="app.yourdomain.com" scheme="https">
    <path url="/*" />
  </host>
</universal-links>

Host domain: Custom domain configured for the app will be used  (e.g., app.mydomain.com)
URL paths and screen mapping: All the screens will be mapped by default. 

Studio/UI configuration
We should provide users with an option to enable or disable App Links (Android) and Universal Links (iOS).

App Logic to Handle Universal Links
In your app's JavaScript (usually within a deviceready event), handle the incoming link:

document.addEventListener('deviceready', function () {
  universalLinks.subscribe(null, function (event) {
    console.log('Received link:', event.url);
    // Parse the URL and navigate accordingly
    Fliplet.Navigate.to(event.url); // or your custom navigation logic
  });
});

You can also use query params or fragments to customize behavior (e.g. ?id=123).

Hosting Association Files
We will host these files on the apps configured custom domain so the OS can verify the app’s authority over the domains. 

Changes in custom domain
When a user changes the custom domain, Universal Links (iOS) and App Links (Android) will no longer work until a new native app build is generated. A rebuild is required to reflect the updated domain in the app.
When a user switches back to a Fliplet domain, Universal Links (iOS) and App Links (Android) will no longer work until a new native app build is generated. A rebuild is required to reflect the updated domain in the app.
When a user switches back to a Fliplet domain, Universal Links (iOS) and App Links (Android) will no longer work.
When a user removes the custom domain, Universal Links (iOS) and App Links (Android) will no longer work
The Custom Domain UI should be updated to display a message informing users that changing, removing, or switching back to a Fliplet domain will affect the functionality of Universal Links (iOS) and App Links (Android).
Note: We need to host files for both Android and iOS using the sub domain name provided by the user. To enable this feature, the user must first set up a custom domain for their app.

iOS (Universal Links)
Host apple-app-site-association at: https://app.yourdomain.com/apple-app-site-association
Example: https://twitter.com/.well-known/apple-app-site-association
Must be hosted at either:
https://app.yourdomain.com/apple-app-site-association
or
https://app.yourdomain.com/.well-known/apple-app-site-association

Note: For iOS Universal Links, the apple-app-site-association (AASA) file must be hosted at specific, fixed locations. You cannot serve it from just any path.
It should be JSON with no file extension, served as application/json:
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "<TEAM_ID>.<BUNDLE_ID>", // e.g. 1H23KDU.com.fliplet.viewer
        "paths": ["/*"]
      }
    ]
  }
}
Required Fields
Field
Description
appID
A combination of Apple Team ID and the App’s Bundle ID (e.g., ABCDE12345.com.fliplet.myapp)
paths
List of URL paths that should open the app. You can use wildcards (*) for flexibility, e.g., "/app-slug/*"

Note:
Apple validates ownership via your app's entitlements and this file.
The file must not have a .json extension.
Serve it as application/json without any redirects.

Android (App Links)
Host assetlinks.json at: https://yourdomain.com/.well-known/assetlinks.json
Example: https://twitter.com/.well-known/assetlinks.json
Must be hosted at:
https://app.yourdomain.com/.well-known/assetlinks.json

Structure
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.fliplet.myapp",
      "sha256_cert_fingerprints": [
        "12:34:56:78:...:AB:CD" // SHA-256 fingerprint of signing certificate
      ]
    }
  }
]

Required Fields
Field
Description
relation
Always: ["delegate_permission/common.handle_all_urls"]
namespace
Always "android_app"
package_name
The Android package name of the app, e.g., com.fliplet.myapp
sha256_cert_fingerprints	
SHA-256 fingerprint of the signing certificate used to sign the app (can be retrieved using keytool or from Play Console)

Notes:
Fingerprint must match the certificate used to sign the app (debug and release certs have different values).
Required even for apps distributed outside the Play Store if you want App Links to work.

Backend Changes
REST APIs
Enable/Disable deep link feature
Endpoint: PUT /v1/apps/:appId/deep-link
Description: Enable and disable deeplink feature for android and iOS
We will store the status in apps.settings column in apps table
We will generate apple-app-site-association and assetlinks file when user enable the feature
For android apps, if users upload their own keystore file, API will update the uploaded key store file fingerprint in the assetlinks file.
Request payload

{
  "platform": "iOS", //"android"
  "enable":true //false
}

Responses
200 Response:
{
  "status": "SUCCESS",
  "message": "Deep link feature is updated",
  "enable": true // false
}

400 Response (Custom domain not enabled):
{
  "status": "ERROR",
  "message": "Custom domain feature must be configured to enable deep link"
}

Challenge
To support Universal Links (iOS) and App Links (Android), apps must have specific verification files hosted at the root of the domain:
https://apps.fliplet.com/apple-app-site-association
https://apps.fliplet.com/.well-known/assetlinks.json
However, these files are app-specific — they contain values like the app's bundle ID, paths, or SHA256 fingerprints. This poses a challenge on a multi-tenant platform like Fliplet where multiple apps are hosted under a shared domain. 

Solution : Setup custom domain for the app and host the files on custom domain
Configure and host AASA and assetlinks.json files based on their app's configuration, and host them on custom domain
Pros:
Ensures complete isolation and customization per app.
Cons:
Not feasible for users who rely solely on Fliplet's default hosting (e.g., apps.fliplet.com).

Test cases
Deep Linking Test Plan
