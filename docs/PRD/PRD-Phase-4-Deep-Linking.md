# Project PRD 4 — Deep Linking (Universal Links + App Links)

## 1. Executive Summary

Enable deep linking so that when users click a Fliplet-configured web link:

* the **native mobile app opens** (if installed)
* otherwise the link **falls back to the web app**

Deep linking is **gated by custom web domain publishing** status and must handle portal app rules and edge cases safely.

---

## 2. Goals

1. Configure Universal Links (iOS) and App Links (Android) for eligible apps.
2. Auto-enable deep linking when custom web domain is published.
3. Provide clear UI states and guidance when not eligible.
4. Ensure robust fallback behavior and edge-case handling.

---

## 3. Scope

### In Scope

* Eligibility logic (custom domain published => enabled)
* Publishing UI indicators for deep linking state
* Association configuration for iOS and Android
* Portal app logic
* Link open behavior + fallbacks
* Edge cases listed below

### Out of Scope

* Publishing stepper engine/dashboard (handled in Projects 1–3)
* Admin-only manifest editing (Project 5)

---

## 4. Functional Requirements

### 4.1 Enablement Logic

* If a **custom web domain is published**:

  * deep linking is automatically enabled
  * the publishing UI must show deep linking is enabled
  * it **cannot be turned off** via normal UI

* If a **custom web domain is NOT published**:

  * deep linking is disabled
  * UI must show instructions recommending publishing custom domain first

### 4.2 Publishing Requirements

* Custom domain must be published to web for deep linking to work.
* System uses the **latest bundle ID** associated with the app.
* Universal Links/App Links support **one app per custom domain**.

### 4.3 Portal Apps

* If the app is a **portal app**, it must be published to ensure correct configuration.
* The portal app bundle is associated with the web app domain (not apps inside the portal).

### 4.4 Link Behavior

* If app installed:

  * clicking the link opens the app directly to corresponding screen/content.
* If app not installed:

  * link opens in browser version of the app.

---

## 5. UI / UX Requirements

### 5.1 Where the UI appears

* App → Publishing → (iOS / Android) setup pages
* App → Web Publishing (custom domain)
* Optional: a dedicated "Deep linking" section in Publishing settings

### 5.2 Eligibility State UI

When custom domain is published:

* Show a non-dismissible info block:

  * Title: "Deep linking enabled"
  * Body: "Because your app is published on a custom domain, Universal Links/App Links are enabled automatically."
  * Subtext: "Links will open the native app when installed, otherwise the web version."

When custom domain is not published:

* Show a warning block:

  * Title: "Deep linking unavailable"
  * Body: "Publish your web app to a custom domain to enable Universal Links/App Links."
  * CTA link: "Publish custom domain"

### 5.3 One App Per Domain Constraint UI

If another app is already linked to the same custom domain:

* Show blocking error:

  * "This domain is already associated with another app for deep linking. Universal Links/App Links only support one app per domain."
* Provide recommended next steps (choose different domain, detach previous app, etc.)

---

## 6. Edge Cases (Must Handle)

* Custom domain configured but web not published: deep linking remains disabled until publish completes.
* If user manually disables deep linking after system enables it:

  * manual setting takes priority and prevents deep linking behavior.
* Unsupported device or browser:

  * fall back to opening in the browser.
* User clicks deep link before app updated to support deep linking:

  * fall back to web version without error.

---

## 7. Acceptance Criteria

* Deep linking is auto-enabled only when custom domain is published.
* Publishing UI clearly communicates enabled/disabled state with guidance.
* Portal app rules are respected.
* One-app-per-domain constraint is enforced with clear messaging.
* Links open native app when installed, else open web.
* All listed edge cases fall back safely without breaking navigation.

