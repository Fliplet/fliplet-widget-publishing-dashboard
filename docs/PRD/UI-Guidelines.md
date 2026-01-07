# General UI Guidelines for the Publishing Overhaul

These guidelines combine the full UI concept (dashboard + stepper flows + settings). These are guidance for you to follow as we wont be giving exact wireframes or requirements 
---

## 1. Look & Feel

### Pipeline-first UI
The core experience should look like a build pipeline with clear steps, statuses, and a single "current position."

### Calm, status-driven styling
Users should feel in control—no clutter, no surprises.

### Consistent patterns
Same structure across iOS and Android, with platform-specific steps swapped in/out.

### Trust cues everywhere
Show what's happening, what's saved, when it last updated, and what's next.

---

## 2. Vocabulary and Naming Rules

Pick a small set of consistent terms and reuse them across the entire UI:

- **Prefer "Build"** as the primary user-facing action.
- **Use "Build # / Build history"** instead of exposing "submission IDs" in the UI.
- **Use "Build app bundle"** (not "Submit to store") for the final step in iOS/Android flows.
- **Keep store responsibilities explicit**:
  - Fliplet: builds the bundle
  - User: completes listing/submission in Apple/Google consoles

---

## 3. Top-level Publishing Home (Dashboard)

### Landing experience

- **Primary button** should be **"Continue publishing"** (not "Start" vs "Resume" as the main decision).
- **Always show**:
  - Current platform selector (iOS / Android)
  - Current build state (friendly status pill)
  - "You're currently on Step X: <step name>"
- **Secondary action**: "Start new build" (with a confirmation/warning).

### Submissions / Build history table

Show a clean table of builds with:

- Build # (friendly)
- Platform
- Status (human readable + color)
- Version number / version code (where relevant)
- Bundle ID / package name (where relevant)
- Created/updated timestamps

**Actions**:
- View details (overlay)
- Download artifacts (only when available)
- Continue (only for resumable states)

### Build detail overlay

- **Read-only step timeline** (what happened at each step)
- **Expandable "details" sections** (don't dump raw JSON by default)
- **Artifacts section** (centralized):
  - APK / AAB / IPA links with created time and metadata (size/checksum if you have it)
  - Debug vs release clearly labeled
- **Errors & warnings log** (chronological)

---

## 4. Pre-flight Readiness Check (Before Entering the Stepper)

Before starting a new build or resuming, show a lightweight **Readiness Check modal** that:

- **Detects likely blockers early**
- **Sets expectations** ("you will need X file(s)")

**Examples**:
- **iOS**: API key present? Bundle IDs fetchable? certificate check result?
- **Android**: bundle ID formatting? keystore approach? push config files required?

The modal should end with one button:
- **"Continue to steps"**

---

## 5. Step-by-Step Flow (The "Signature" Experience)

### Stepper layout

- **Left**: vertical stepper (all steps, with status icons)
- **Center**: active step content
- **Right**: context panel:
  - What this step is
  - What you need
  - Links to docs
  - "Current selection" summary (team, key name, bundle ID)

### Step statuses

Every step must support these states visually:

- Not started
- Needs action
- In progress
- Complete
- Failed

### Step interaction rules

- **One primary action per step**
  - Examples: "Validate & Save", "Fetch bundle IDs", "Upload & Validate", "Trigger build"
- **Save progress at step completion**; returning users should land on the exact step they last reached.
- **If the process is resumed**, the UI must:
  - Highlight the current step
  - Show "Saved at <time>" for completed steps where helpful

---

## 6. Automation That Stays Transparent ("Smart Defaults + Override")

Wherever the system can reuse or auto-select values, it should:

- **Clearly state what it is doing**
- **Provide a visible override option**

**Examples**:
- **API key**: preselect last used key (marked "Recommended"), with dropdown to change
- **Certificate**: "We found a valid certificate for Team X. We'll use it." + "Use different / Upload / Generate new"
- **Push config suggestion**: "We found prior push settings for Team X. Reuse?"

**Automation should never feel like hidden magic.**

---

## 7. Error Handling That Actually Helps Users Finish

### Global error summary

At the top of the flow, include an **Error Summary panel** when there are issues:

- "2 issues need attention"
- Each item links directly to the failing step/field

### Step-level error patterns

When a step fails:

- **Expand that step automatically**
- **Show an inline error panel** containing:
  - Clear message
  - Required field name (if provided by API)
  - "How to fix" mini-guide
  - Provide a Retry validation button (or the relevant retry action)

### No end-of-flow surprises

**Errors must appear at the step where they occur, not at the end.**

---

## 8. Progress Updates (Feel Real-Time Without Overcomplicating)

You don't need to expose technical mechanisms. You do need:

- A visible **"Last updated X seconds ago"**
- A subtle **refresh indicator** while active
- A **manual refresh icon** (trust + control)
- **Build step status should update** as states change

---

## 9. "Build vs Store Submission" Separation (Very Explicit)

This should be enforced in copy and structure:

- **Final step label**: "Build app bundle"
- **Completion screen must show**:
  - What Fliplet did (bundle created, uploaded where applicable)
  - What the user must do next (console tasks)
  - Links to Apple/Google docs and Fliplet guidance
- **Do not label the process as "store submission"** unless Fliplet is actually submitting.

---

## 10. Notifications UX (In-Tool + Email)

### In-tool

- **Toasts for major transitions**:
  - Build queued, completed, failed
- **Optional lightweight notification center** items linking back to the build

### Email

- Send for build completed/failed (and any other status changes you deem high value)

---

## 11. Guardrails for Destructive or Risky Actions

Any action that can break future builds must have:

- **Clear confirmation**
- **Context about impact**

**Examples**:

- **Delete API key**:
  - show Team ID
  - warn it may block iOS builds for that team
- **Cancel build**:
  - confirm
  - explain "You can resume from Step X"

---

## 12. Advanced Settings Patterns

### Deep linking settings (separate from build flow)

- Lives in its own settings screen
- Shows hard requirement banners (custom domain required)
- Per-platform toggles (iOS Universal Links, Android App Links)
- Clear messaging: domain changes require rebuild to keep links working

### Admin-only manifest/plist editor

- Clearly marked **Admin only**
- Safe controls:
  - Save, Cancel, Reset to default
  - Validation error display
- **"Danger zone" warning text**: admin responsible for correctness

