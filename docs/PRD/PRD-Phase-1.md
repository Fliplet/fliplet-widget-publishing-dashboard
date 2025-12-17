# Project PRD 1 — Publishing Engine + Main Dashboard + Notifications

## 1. Executive Summary

Build the **shared foundation** for the new publishing experience across iOS and Android:

* A **Publishing Engine** that runs publishing as a sequence of persisted steps with real-time progress, early error detection, and resume.
* A **Main Dashboard** that surfaces build history, step outcomes, artifacts, and actionable errors.
* **Notifications** (in-tool and/or email) triggered by build status changes.

This project is a prerequisite for the iOS and Android publishing projects found in PRD-Phase-2-iOS.md and PRD-Phase-3-Android.md

---

## 2. Goals

1. Provide a reliable, resumable, step-based publishing system that all platforms use.
2. Persist build state and step outputs to enable resume and accurate history.
3. Offer real-time build progress to the UI.
4. Provide a comprehensive dashboard for monitoring and troubleshooting builds.
5. Send notifications on build status changes.

---

## 3. Users / Permissions

* All users with **publishing permission** can access:

  * platform publishing flows
  * build dashboard for apps they can access
* Users with **Full Access** to an app can initiate builds.
* Dashboard visibility respects existing app access permissions.

---

## 4. Scope

### In Scope

**A) Publishing Engine (shared backend + shared UI behavior)**

* Build Run + Step Run persistence (see Data Model)
* Step orchestration + resume
* Real-time status updates
* Standard error model (actionable)
* Artifact storage references (IPA/AAB/APK links)
* Version numbering service (app version + build number)

**B) Main Dashboard (per app + per org)**

* App build list, status, platform, version/build numbers, timestamps
* Submission history overlay (details per build)
* Step-level error summary + resolution guidance
* Artifact download links

**C) Notifications**

* In-tool notification for build status changes
* Email notification (optional toggle) for build status changes

### Out of Scope

* iOS-specific API key / certificates / push logic (Project PRD 2)
* Android-specific Firebase/signing logic (Project PRD 3)
* Deep linking (Project PRD 4)
* Admin-only manifest editor (Project PRD 5)

---

## 5. Publishing Engine — Data Model

### 5.1 Build Run

A Build Run represents one publish attempt for a platform.
Required fields:

* `buildRunId`
* `appId`
* `platform`: `ios | android | web`
* `status`: `in_progress | failed | success | blocked | cancelled`
* `createdBy`, `createdAt`, `updatedAt`
* `appVersion` (e.g., 1.3)
* `buildNumber` (integer)
* `bundleId` (string; platform-dependent)
* `artifactRefs`: array of artifacts (type + URL)

### 5.2 Step Run

Each Build Run contains ordered Step Runs.
Required fields:

* `stepId` (stable key)
* `stepName` (UI label)
* `status`: `not_started | in_progress | success | failed | waiting_for_user`
* `startedAt`, `endedAt`
* `inputs` (sanitized)
* `outputs` (needed for subsequent steps)
* `logs` (string/structured list)
* `error` (if failed)

### 5.3 Standard Error Payload

All step failures must produce a structured error:

* `title` (short)
* `message` (clear description)
* `step` (name/id)
* `whyItHappened` (optional)
* `howToFix` (bullet list)
* `links` (docs URLs)
* `isRetryable` (boolean)

---

## 6. Publishing Engine — Step Orchestration & Resume

### 6.1 Step Execution

* Steps execute in the defined order for the platform.
* After each step completes, persist Step Run status + outputs.
* If a step fails:

  * mark Build Run `failed`
  * stop subsequent steps

### 6.2 Waiting-for-user / Blocked

* Some steps may require user input.
* When encountered:

  * step status becomes `waiting_for_user`
  * build status becomes `blocked`
  * UI must show an "Action needed" state

### 6.3 Resume Rules

* Resume starts from the **first step that is not `success`**.
* Successful steps must not re-run unless user chooses **Start new build**.
* Steps should be idempotent where feasible.

### 6.4 Build Concurrency

* Prevent duplicate simultaneous builds for the same app + platform unless explicitly supported.
* If user attempts to start a new build while one is in progress:

  * show warning + option to view existing run.

---

## 7. Publishing Engine — Real-time Updates

The engine must support UI updates via:

* polling endpoints OR
* event stream / websockets

Required UI-facing updates:

* step status changes
* step logs updates
* build status changes
* artifact availability

---

## 8. Version Numbering Rules

* Generate `appVersion` for each new build.
* Increment the **first decimal** each time (e.g., 1.1, 1.2, 1.3…).
* Generate a monotonically increasing `buildNumber`.
* Display version/build numbers in setup screen + progress screen + dashboard.

---

## 9. Main Dashboard — UI & Flow

### 9.1 Entry Points

* From Publishing setup screen: "View previous builds"
* From Build Progress header: "View dashboard"


### 9.2 App Builds List (per app)

Display table/list with:

* Platform (iOS/Android/Web)
* App Version
* Build Number
* Status (In progress / Failed / Success / Blocked)
* Date/Time
* Primary actions per row:

  * **View details**
  * **Download artifacts** (if present)
  * **Resume** (if failed/blocked and user has publish permission)

### 9.3 Build Details View

When user clicks a build:

* Show step list with statuses
* Show per-step logs and outputs
* Show the failing step error card (if failed)
* Show artifact links

### 9.4 Submission History Overlay

A "Submission history" button opens an overlay listing previous builds for the app.
Each build row must show:

* Status
* Date/Time
* App version number
* Build number
* Bundle ID

### 9.5 Error Presentation

* Highlight errors and warnings
* Provide actionable guidance with links
* Where possible, link directly to the step that failed

---

## 10. Notifications

### 10.1 Triggers

Send notifications whenever Build Run status changes:

* `in_progress`
* `failed`
* `success`
* `blocked`

### 10.2 Required Copy

* **In Progress**: "App building is underway."
* **Failed**: "App build failed." (include failing step name where possible)
* **Success**:

  * iOS: "App build complete. Your app has been successfully uploaded to App Store."
  * Android: "App build complete. Follow instructions to submit your app to the Google playstore"
  * Web: "Verified"

### 10.3 Channels

* In-tool notifications: required
* Email notifications: optional (configurable), but supported by the backend triggers

---

## 11. Acceptance Criteria

* Build Run + Step Run are persisted and replayable for UI.
* UI can render step-by-step progress with real-time updates.
* Errors are tied to a step and shown immediately.
* Resume continues from last successful step.
* Dashboard lists all builds and supports build details + submission history overlay.
* Artifacts are downloadable when available.
* Notifications fire on status changes with required copy.

