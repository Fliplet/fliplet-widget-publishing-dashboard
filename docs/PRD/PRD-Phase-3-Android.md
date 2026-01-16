# Project PRD 3 — Android Publishing (New Flow + Automation)

**Excludes:** Deep linking, Admin-only manifest edit

## 1. Executive Summary

Deliver a new Android publishing flow in Fliplet Studio that is **step-based, resumable, and transparent**, integrates **push setup during build**, validates **Bundle ID**, and produces build artifacts for manual Google Play submission (store listing is handled in Google Play Console).

## 2. Goals

1. Step-by-step progress visualization with real-time updates, early error detection, and resume.
2. Integrate push notification configuration into build (Firebase creds required every time).
3. Build bundles (AAB) with clear handoff instructions for Google Play listing/submission.
4. Generate version numbers with the specified incrementing pattern.
5. Ensure artifacts are available for download via the dashboard (from Project 1).

## 3. Supported Publishing Methods (from your table)

### In Scope (New flow)

* Android publishing (Google Play)

### Out of Scope (Existing flow / Phase 2)

* Signed APK (existing flow)

## 4. Users / Permissions

* Any user with **publishing permission** can access Android publishing flow for an app.
* Any user with **Full Access** can edit and publish.

## 5. Scope

### In Scope

* Android publishing setup screen (bundle ID input + push credential input)
* Stepper build/progress screen with real-time updates + logs
* Resume from last successful step
* Firebase push setup required each publish (no reuse across apps/org)
* Bundle ID formatting validation
* App version auto-increment behavior (1.1, 1.2, 1.3…)
* Build artifacts creation and persistence (AAB; APK if supported)
* Build run record consumable by dashboard + notifications

### Out of Scope

* Deep linking enablement
* Admin-only manifest edit tool
* Signed APK existing flow

---

## 6. Functional Requirements — Detailed Flow & UI

### 6.1 Step-by-Step Progress Visualization (Shared UX Spec for Android)

#### Objective

Enable app builders to visualize each step of Android publishing separately, detect errors early, and resume from the last successful step.

#### Entry Point UI (Publishing Setup Screen)

**Location:** App → Publishing → Android

Setup screen must show:

* **Bundle ID input** (required)

  * Inline validation and examples (e.g., `com.company.appname`)
  * If invalid, disable "Build & Publish" button with inline error message
* **Push Notifications (Firebase)** section

  * Firebase credentials upload/input
  * Inline validation for required fields
  * Help link: "Where to find your Firebase credentials" (links to documentation)
* **Advanced Settings** link (expands optional signing/certificate upload area)
* **Build & Publish** (primary CTA)
* **Save and exit** (secondary CTA, visible only when fields are valid)
* **View previous builds** link

If previous Build Run exists and is failed/incomplete:

* Show banner:

  * "A previous build failed at Step X. Resume from last successful step?"
  * Buttons: Resume build / Start new build / View details

#### Build Progress Screen Layout (Stepper UI)

**Left: Step List**

* Step names numbered vertically:
 
  * Step 6: Complete
* Each row includes:

  * Status icon + text (In progress, Completed, Failed, Needs input)
  * Timestamp or duration
  * Color coding:

    * Grey = Not started
    * Blue spinner = In progress
    * Green = Success
    * Red = Failed
    * Amber = Waiting for user

**Right: Step Detail Panel**

* Displays:

  * Step name + status
  * Inline logs (collapsible)
  * Progress bar (if applicable)
  * Input form (for user action steps)
  * Output summary for completed steps
  * Error card for failed steps:

    * Title, detailed message, and resolution guidance
    * Optional "Retry" button if the step is idempotent

**Header Toolbar**

* Build Run ID and version number
* Status chip (In Progress / Failed / Success / Blocked)
* Actions:

  * Exit (build continues in background)
  * View dashboard
  * Resume build (when failed/blocked)

#### Behavior Rules

* **Real-time updates:** Refresh statuses live (polling or socket events)
* **Error visibility:** Failed step turns red, right panel opens automatically, error is detailed
* **Resume logic:** Start from the next step after last successful one
* **Auto-save:** Each step persists outputs/logs
* **Waiting-for-user pattern:**

  * Stops build progression
  * Step shows "Action needed" banner
  * Input form displayed in right panel
  * Build resumes automatically after user submission validation

#### Status Notifications (Triggered by build status changes)

* In Progress: "App building is underway."
* Failed: "App build failed." (include failing step name)
* Success (Android): "App build complete. Follow instructions to submit your app to the Google playstore."

---

## 7. Android Functional Requirements — Platform Features

### 7.1 Bundle ID + Storefront Listing Separation (Android bundle-only)

#### Objective

Build the app bundle only and guide users to complete listing/submission in Google Play Console.

#### Requirements

* Users must input their **Bundle ID** manually.
* Fliplet validates formatting (e.g., must follow `com.domain.appname` pattern, no special chars).
* Show inline error messages for invalid formats.
* Provide clear post-build guidance text:

  * "Your bundle has been successfully built. Submit this AAB file manually in your Google Play Console."
  * Include documentation links to Google Play submission guides.

---

### 7.2 Integrated Push Notification Setup During Build (Android)

#### Objective

Configure push notifications during the build process without a separate setup screen.

#### Requirements

* Push configuration must be **part of the stepper**.
* Each publish requires Firebase credentials.
* Step 2 collects credentials (JSON or text input format):

  * Project ID
  * Server key
  * Sender ID
* Validation occurs instantly; if invalid, the step remains blocked until fixed.
* Push configuration is not stored or reused across apps or organizations.

---

### 7.3 Certificates / Signing (Android)

#### Objective

Automate certificate handling while allowing manual upload for migrations or advanced users.

#### Requirements

* Automatically generate signing certificates when not provided.
* "Advanced Settings" section provides manual upload option for:

  * Keystore file
  * Keystore password
  * Key alias + password
* Validation ensures all required fields exist before allowing build to proceed.
* If system cannot auto-generate or uploaded file invalid, step shows "Waiting for user" with error message.

---

### 7.4 App Version Number

* Auto-increment first decimal per build: 1.1, 1.2, 1.3…
* Display current version and next version on publishing setup screen.

---

## 8. Android Step List (Implementation Checklist)

1. **Enter & Validate Bundle ID**
2. **Configure Push Notifications (Firebase)** *(always required each publish)*
3. **Signing / Certificates** *(auto; manual upload via Advanced Settings if needed)*
4. **Build Android App**
5. **Package & Store Artifact**
6. **Complete**

Each step must:

* Persist status + logs
* Fail with actionable message
* Support resume from last successful step

---

## 9. Acceptance Criteria (Android)

* Stepper shows all steps independently with live updates
* Errors appear instantly at failing step with clear, actionable message
* Resume resumes from last successful step only
* Bundle ID validation enforced and error messages clear
* Firebase credentials required and validated on input
* Certificate generation automatic; manual upload path available for advanced use
* Build artifacts (AAB, APK) downloadable via dashboard
* Success notification includes guidance for Google Play submission
* Version auto-increments correctly per build

