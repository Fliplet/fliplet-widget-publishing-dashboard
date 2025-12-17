# Project PRD 5 — Admin-only Manifest / Info.plist Editor (Advanced Settings)

## 1. Executive Summary

Provide an internal-only tool for Fliplet Admins to customize the iOS Info.plist and Android manifest-related configuration used in app builds. This is for rare advanced cases where automated permissions/config is insufficient.

---

## 2. Goals

1. Allow Fliplet Admins to edit and persist custom manifest/plist configuration per build.
2. Keep the tool hidden from regular app builders.
3. Provide safe defaults, reset-to-default behavior, and validation.

---

## 3. Users / Permissions

* Only **Fliplet Admin** can access this feature.
* This must be enforced both in UI and backend authorization.

---

## 4. Scope

### In Scope

* A JSON editor in **Publishing → Advanced settings** for iOS and Android.
* Default JSON structure pre-populated.
* Save / Cancel / Reset-to-default actions.
* Validation on save with clear errors.

### Out of Scope

* Deep linking configuration
* General publishing improvements (handled elsewhere)
* Making this available to all paying plans (this tool is explicitly admin-only)

---

## 5. Functional Requirements

### 5.1 Location and Access

* UI placement:

  * Publishing flow → Advanced settings section
* Labeling:

  * Tagged as "Admin only"
* Visibility:

  * Only displayed for Fliplet Admin users

### 5.2 Editor UI

* A single text box (JSON editor) displaying the default structure.
* Buttons:

  * **Save** — persists the edited JSON
  * **Cancel** — discards unsaved changes and reverts to last saved state
  * **Reset to default** — reverts to original default JSON

    * Only visible when changes have been made from default

### 5.3 Editable Areas

**iOS**

* Update Info.plist configurations, including permission usage descriptions.
* Must support editing values like:

  * `NSCameraUsageDescription.string`
  * other plist keys and enable flags

**Android**

* Provide custom content/config to support manifest declarations.
* Note: direct permission changes are not supported via this feature (per your spec).

### 5.4 Validation

On Save:

* Validate JSON formatting
* Validate expected structure:

  * must include `android` and/or `ios` objects
  * values must match expected schema (string fields, enable booleans)
* If invalid:

  * block save
  * show error explaining what failed (e.g., "Invalid JSON: trailing comma" or "Missing required key: ios")

### 5.5 Persistence

* Persist custom configuration against the build context so the build pipeline uses it.
* Maintain previous saved state for Cancel behavior.
* Reset restores the baseline default used by Fliplet.

---

## 6. Acceptance Criteria

* Only Fliplet Admin can see and use the feature.
* Default JSON loads into editor.
* Save persists changes and subsequent loads show saved state.
* Cancel reverts to last saved state.
* Reset-to-default restores baseline and only appears when edited.
* Invalid JSON or schema fails validation with clear errors.

