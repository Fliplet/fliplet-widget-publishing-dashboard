# Project PRD 2 — iOS Publishing (New Flow + Automation)

**Excludes:** Deep linking, Admin-only manifest edit

## 1. Executive Summary

Deliver a new iOS publishing flow in Fliplet Studio that is **step-based, resumable, and transparent**, replacing the current multi-step opaque process. The flow must support **multiple Apple API keys / Team IDs**, automate **certificate management**, integrate **push notification setup** during build, and clearly separate **bundle upload** from **storefront listing/submission** work done in Apple's console.

## 2. Goals

1. Step-by-step progress visualization with real-time updates, early error detection, and resume from last successful step.
2. Multi Apple API key storage + reuse across apps (Team ID scoped), with Org Admin management UI.
3. Automated Apple certificate retrieval/validation/reuse and auto-generation where possible, with guided fallback.
4. Push notification setup included in build steps, automated reuse when possible.
5. Bundle upload to Apple via API; storefront listing/submission remains in Apple Developer/App Store Connect.

## 3. Supported Publishing Methods (from your table)

### In Scope (New flow with API key)

* iOS publishing (App Store)
* iOS unassigned
* iOS through ABM

### Out of Scope (Existing flow / Phase 2)

* Apple Enterprise
* Unassigned IPA

## 4. Users / Permissions

* Any user with **publishing permission** can access the iOS publishing flow for an app.
* Any user with **Full Access** to an app can edit and publish.
* **Organization Admin only** can access the organization-level API key management dashboard.

## 5. Scope

### In Scope

* iOS publishing setup screen (API key selection/creation, bundle ID selection, push setup inputs as required)
* Stepper build/progress screen with real-time updates + logs
* Resume from last successful step
* Multiple Apple API keys (store/manage/reuse) scoped by Team ID
* Automated certificate management (retrieve/validate/reuse/generate) + fallback upload path
* Push notifications integrated into build with iOS reuse logic
* App version auto-increment behavior (1.1, 1.2, 1.3…)
* Build artifact availability (IPA) and build run record (for dashboard consumption)

### Out of Scope

* Deep linking enablement (Universal Links/App Links)
* Admin-only manifest/Info.plist editor (separate PRD)
* Apple Enterprise / Unassigned IPA flows (existing flow)

---

## 6. Functional Requirements — Detailed Flow & UI

### 6.1 Step-by-Step Progress Visualization (Shared UX Spec for iOS)

#### Objective

Enable app builders to visualize each step of iOS publishing separately, detect errors early, and resume from the last successful step without restarting the entire process.

#### Core UX Principles

* One publishing attempt = one **Build Run** with a stable ID.
* A Build Run contains ordered **Steps**. Each step stores:

  * Status: `Not started` → `In progress` → `Success` OR `Failed` (plus `Waiting for user` when applicable)
  * Start/end timestamps
  * Logs (expandable)
  * Error payload (if failed): `title`, `message`, `why this happened`, `how to fix`, `links`
* Steps should be idempotent where possible so resume does not duplicate work.
* UI must always make clear:

  * where the user is in the process
  * what is complete
  * what is blocked
  * what action to take next

#### Entry Point UI (Publishing Setup Screen)

**Location:** App → Publishing → iOS

**Setup screen must show:**

* **API Key Name** dropdown (required)

  * Default: last used API key for this org/app (if any)
  * Option: **"Add new API key…"**
* When existing key selected:

  * Show Issuer ID, Team ID, Key ID as read-only summary (or collapsed details)
* When "Add new API key…" selected:

  * Show input fields:

    * API Key Name (defaults to organization name; editable; cannot be empty)
    * Issuer ID
    * Team ID
    * API Key ID
    * API key content (file upload or text area as per implementation)
  * Inline validation on required fields
  * Save occurs only after verification succeeds ("save-on-verify")
* **Bundle ID** dropdown (disabled until API key is verified)
* "Build & Publish" primary CTA
* "Save and exit" secondary CTA (only when current config valid)
* Link: "View previous builds"

**If a previous Build Run exists and is failed/incomplete:**

* Show banner:

  * "A previous build failed at Step X. Resume from last successful step?"
  * Buttons: **Resume build** (primary), **Start new build** (secondary), **View details** (link)

#### Build Progress Screen Layout (Stepper UI)

**Left: Vertical Step List**

* Each step row displays:

  * Step number + name
  * Status icon/color:

    * Grey dot = Not started
    * Spinner = In progress
    * Green check = Success
    * Red exclamation = Failed
    * Amber pause = Waiting for user
  * Microcopy: "Running…", "Completed", "Failed", "Needs input"
* Clicking a step opens its details on the right panel (including completed steps)

**Right: Step Detail Panel**

* Displays for selected step:

  * Title + status label
  * Progress indicator (if running)
  * Logs (collapsible)
  * Input form (only when the step requires user action)
  * Output summary (for completed steps)
  * Error card (if failed) with:

    * what failed + why + how to fix
    * links to Apple docs / Fliplet docs where relevant
    * "Resume" / "Retry step" options depending on safe behavior

**Top Header**

* Build Run status chip: In progress / Failed / Success / Blocked
* App version number + build number
* Platform label: iOS
* Buttons:

  * Exit (build continues server-side)
  * View dashboard
  * If failed/blocked: Resume button appears

#### Step Behavior Rules

1. **Real-time updates**

* Step statuses update live (polling or events)
* Current step shows spinner; completed steps flip to green; failures flip to red immediately

2. **Early error detection**

* When a step fails:

  * that step turns red
  * right panel auto-opens the failing step
  * show clear, actionable error messaging immediately

3. **Resume from last successful step**

* Resume starts from the next step after the last `Success`.
* Successful steps are not rerun unless user chooses **Start new build**.
* UI provides:

  * Primary: **Resume from Step X**
  * Secondary: **Start new build**
  * Optional: **Retry failed step** only if the step is idempotent and safe

4. **Save progress after every step**

* Persist step outputs required for future steps (e.g., selected bundle ID, chosen certificate reference)
* If user exits, build continues; returning shows the latest persisted state

5. **Waiting for user pattern**

* Some steps require user input (push keys first-time, cert upload fallback).
* When blocked:

  * Step becomes **Waiting for user**
  * Build status becomes **Blocked**
  * UI auto-opens required step and shows form + "Action needed" banner
* After user submits:

  * validate immediately
  * on valid: step runs and completes; on invalid: show inline errors and remain blocked

#### Status Notifications (Triggered by build status changes)

* **In Progress**: "App building is underway."
* **Failed**: "App build failed." (include failing step name where possible)
* **Success (iOS)**: "App build complete. Your app has been successfully uploaded to App Store."

---

## 7. iOS Functional Requirements — Platform Features

### 7.1 Support Multiple API Keys / Team IDs (iOS)

#### Objective

Enable app builders to manage and reuse multiple Apple API keys and Team IDs for iOS publishing.

#### Requirements

**Storing**

* Support storing >1 API key per organization
* Each key includes:

  * API key name, Team ID, Issuer ID, Key ID, API key content, push notification keys (where applicable)

**Adding**

* First-time publish: fields are blank
* Subsequent builds:

  * default to previously used API key
  * allow switching from dropdown or selecting "Add new API key…"
* API Key Name:

  * defaults to organization name
  * editable
  * cannot be empty
* Save-on-verify:

  * API key and name are persisted only after verification success

**Reuse across apps**

* Selecting API Key Name pre-populates:

  * Issuer ID, Team ID, Key ID, API key content, push notification keys
* When API Key Name selected:

  * Bundle ID list must filter to those associated with that Team ID
  * Push credentials should reuse the ones previously used with that API Key Name (where the platform allows)
  * Publisher certificates must filter to match Team ID

**Org Admin Management UI**

* Location: Organization Dashboard (Org Admin only)
* Table columns:

  * API key name (editable)
  * Date created (read-only)
  * Created by (read-only)
  * Issuer ID (read-only)
  * Team ID (read-only)
  * Key ID (read-only)
* Actions:

  * Rename API key name
  * Delete API key (with confirmation)
* Also show: which apps use each key (at least count + list on click, if feasible)

---

### 7.2 Automated Certificate Management (Apple)

#### Objective

Automate retrieval, validation, reuse, and generation of distribution certificates, with safe fallback flows.

#### Requirements

**Automatic Retrieval & Validation**

* System determines valid certificates for selected Team ID
* Automatically validates certificate state so only valid certificates used

**Automatic Generation**

* If no valid cert found and capacity allows:

  * system initiates certificate creation automatically
  * generates new distribution certificate + private key without user interaction
  * show message: "Valid distribution certificate"
  * provide download access to generated certificate + private key

**Reuse**

* If valid cert exists (from previous successful build), system reuses automatically without manual selection
* show message: "Valid distribution certificate" and allow download reference

**Capacity / Cannot generate**

* If max certificate capacity reached and all are expired/invalid:

  * show error with two user options:

    1. **Revoke expired certificate**: provide guided step-by-step instructions (Apple portal)

       * user returns and confirms "I revoked it"
       * show "Generate new certificate" button
    2. **Upload your own certificate**:

       * upload combined cert + private key file
       * if needed, allow separate uploads for cert + private key
* If generation fails again, show the same error and keep upload options available

---

### 7.3 Integrated Push Notification Setup During Build (iOS)

#### Objective

Configure push notifications during the build process and automate reuse when possible.

#### Requirements

* Push configuration is included as a build step
* iOS first-time:

  * user must input required keys/certificates
  * step becomes Waiting for user until provided
* Subsequent builds:

  * system auto-pulls push config from last successful submission
* Same organization suggestion:

  * if another app in org has push configured, suggest reuse
* Validation:

  * validate inputs immediately
  * show actionable feedback on failures (invalid keys, permissions, etc.)

---

### 7.4 Storefront Listing Separation (iOS Bundle Upload Only)

#### Objective

Fliplet builds and uploads the bundle; users manage listing/submission in Apple console.

#### Requirements

* Bundle ID:

  * retrieved from Apple API for Team ID
  * user selects from dropdown
* After upload success:

  * show guidance that remaining steps are handled in Apple Developer/App Store Connect
  * provide documentation links (storefront features and updates)

---

### 7.5 App Version Number

* Generate version number per build
* Automatically increase first decimal for each build: 1.1, 1.2, 1.3…

---

## 8. iOS Step List (Implementation Checklist)

The iOS stepper must implement at least these steps in order:

1. **Validate Apple API Key**
2. **Select Bundle ID**
3. **Certificates (Automated)**
4. **Push Notifications Setup (iOS)**
5. *App store listing details**
5. **Build iOS App**
6. **Upload to Apple (Bundle delivery)**
7. **Complete**

Each step must:

* persist status + logs
* fail with actionable messaging
* support resume from last successful step

---

## 9. Acceptance Criteria (iOS)

* Stepper shows all steps independently with live updates
* Errors appear immediately at the failing step with clear messaging
* Resume continues from last successful step without rerunning successful steps
* Multi API keys supported; save-on-verify enforced; reuse + filtering logic works
* Org Admin can view/rename/delete API keys and see app usage
* Certificates: auto-retrieve/validate/reuse/generate; capacity error flow + upload fallback implemented
* Push: first-time requires input; subsequent auto-reuse; org suggestion exists
* Bundle ID dropdown sourced via Apple API; upload completes with guidance text
* Version increments 1st decimal per new build (1.1, 1.2…)

