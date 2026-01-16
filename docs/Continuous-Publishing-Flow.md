# Continuous Publishing Flow

## Overview

The Continuous Publishing Flow is designed to guide users through publishing their app across all three platforms (Web, iOS, and Android) in an uninterrupted journey. Instead of returning to the main dashboard after completing one platform, users are automatically redirected to the next unpublished platform until all publishing methods are complete.

## Goals

1. **Seamless Experience**: Keep users in the publishing flow without manual navigation
2. **Complete Coverage**: Encourage users to publish across all platforms
3. **Reduced Friction**: Minimize steps between platform completions
4. **Clear Progress**: Users always know what's next in their publishing journey

## Flow Logic

### Platform Completion Detection

A platform is considered "complete" when:

- **iOS**: Build status is `completed` or `ready` (IPA successfully built)
- **Android**: Build status is `completed` or `ready` (APK/AAB successfully built)
- **Web**: App is published to either Fliplet domain OR custom domain

### Redirect Decision Tree

```
After Platform Completion
│
├─ Check which platforms are complete
│
├─ If iOS completed:
│  └─ Is Android complete? 
│     ├─ NO → Redirect to Android Publishing Dashboard
│     └─ YES → Is Web complete?
│        ├─ NO → Redirect to Web Publishing Dashboard
│        └─ YES → Return to Main Dashboard (all done!)
│
├─ If Android completed:
│  └─ Is Web complete?
│     ├─ NO → Redirect to Web Publishing Dashboard
│     └─ YES → Is iOS complete?
│        ├─ NO → Redirect to iOS Publishing Dashboard
│        └─ YES → Return to Main Dashboard (all done!)
│
└─ If Web completed:
   └─ Is iOS complete?
      ├─ NO → Redirect to iOS Publishing Dashboard
      └─ YES → Is Android complete?
         ├─ NO → Redirect to Android Publishing Dashboard
         └─ YES → Return to Main Dashboard (all done!)
```

## Priority Order

When multiple platforms are incomplete, the redirect follows this priority:

1. **Web** (quickest to publish - instant)
2. **iOS** (typically longest to build)
3. **Android** (second longest to build)

This ensures users start with the quickest win (Web publishing is instant), then tackle the more time-intensive builds.

## Example Scenarios

### Scenario 1: Starting from Web (Recommended)

```
User starts → Web Publishing Dashboard
   ↓
Web Published ✓
   ↓
Show modal: "Continue to iOS Publishing"
   ↓
User clicks → iOS Dashboard
   ↓
iOS Build Complete ✓
   ↓
Auto-redirect → Android Dashboard
   ↓
Android Build Complete ✓
   ↓
Return to Main Dashboard (All platforms complete!)
```

### Scenario 2: Starting from iOS

```
User starts → iOS Flow
   ↓
iOS Build Complete ✓
   ↓
Auto-redirect → Android Dashboard
   ↓
Android Build Complete ✓
   ↓
Auto-redirect → Web Dashboard
   ↓
Web Published ✓
   ↓
Show modal: "All platforms published!"
```

### Scenario 3: Starting from Android

```
User starts → Android Flow
   ↓
Android Build Complete ✓
   ↓
Auto-redirect → Web Dashboard
   ↓
Web Published ✓
   ↓
Show modal: "Continue to iOS Publishing"
   ↓
iOS Build Complete ✓
   ↓
Return to Main Dashboard (All platforms complete!)
```

### Scenario 4: User Already Has Some Platforms Complete

```
Status: Web ✓, iOS ✗, Android ✗

User goes to iOS Flow
   ↓
iOS Build Complete ✓
   ↓
Auto-redirect → Android Dashboard
   ↓
Android Build Complete ✓
   ↓
Show modal: "All platforms published!"
```

## User Experience

### Visual Feedback

When redirecting, show appropriate messages:

**Web Publishing (Modal):**
- "Web Publishing Complete! Great! Your web app is now live. Let's continue with iOS publishing next."
- User can click "Continue to iOS Publishing" or "Stay here"

**iOS Build Success (Auto-redirect):**
- "Great! Your iOS app is ready. Let's continue with Android publishing next."
- Button changes to "Continue to Android Publishing →"

**Android Build Success (Auto-redirect):**
- "Awesome! Your Android app is ready. Let's continue with Web publishing next."
- Button changes to "Continue to Web Publishing →"

**All Complete (Modal):**
- "Congratulations! Amazing work! You've successfully published your app across all platforms - Web, iOS, and Android!"

### Opt-Out Option

Users can always return to the main dashboard manually via:
- "Back to Dashboard" button (available throughout flows)
- Browser back button
- Sidebar navigation

The system remembers their progress and they can resume the flow anytime.

## Implementation Points

### When to Trigger Redirect

**Web:**
- Trigger immediately after successful publish (instant)
- Happens after publish API call succeeds
- Show modal with "Continue to [Next Platform]" button
- Modal gives user choice to continue or stay

**iOS/Android:**
- Trigger after build reaches `completed` or `ready` status
- Happens in the "Build Success" screen
- Replace "Back to Dashboard" button with "Continue to [Next Platform]" button
- Auto-redirects on button click

### API Checks Required

Before redirecting, check:

```javascript
// Get latest submission status for each platform
const iosStatus = await getLatestSubmission('ios');
const androidStatus = await getLatestSubmission('android');
const webStatus = await getWebPublishingStatus();

// Determine which platforms are complete
const iosComplete = iosStatus?.status === 'completed' || iosStatus?.status === 'ready';
const androidComplete = androidStatus?.status === 'completed' || androidStatus?.status === 'ready';
const webComplete = webStatus?.isPublished === true;

// Decide where to redirect (priority: Web → iOS → Android)
if (completedPlatform === 'web') {
  // Just completed Web
  if (!iosComplete) {
    showModal('Continue to iOS Publishing', IOS_DASHBOARD_SCREEN_ID);
  } else if (!androidComplete) {
    showModal('Continue to Android Publishing', ANDROID_DASHBOARD_SCREEN_ID);
  } else {
    showModal('All platforms complete!', MAIN_DASHBOARD_SCREEN_ID);
  }
} else if (completedPlatform === 'ios') {
  // Just completed iOS
  if (!androidComplete) {
    redirectTo(ANDROID_DASHBOARD_SCREEN_ID);
  } else if (!webComplete) {
    redirectTo(WEB_DASHBOARD_SCREEN_ID);
  } else {
    redirectTo(MAIN_DASHBOARD_SCREEN_ID);
  }
} else if (completedPlatform === 'android') {
  // Just completed Android
  if (!webComplete) {
    redirectTo(WEB_DASHBOARD_SCREEN_ID);
  } else if (!iosComplete) {
    redirectTo(IOS_DASHBOARD_SCREEN_ID);
  } else {
    redirectTo(MAIN_DASHBOARD_SCREEN_ID);
  }
}
```

### Screen IDs Reference

- Main Publishing Dashboard: `1868026`
- iOS Publishing Dashboard: `1856966`
- iOS Publishing Flow: `1856964`
- Android Publishing Dashboard: `1859844`
- Android Publishing Flow: `1859905`
- Web Publishing Dashboard: `1864908`

## Edge Cases

### Build Failures

If a build fails, do NOT auto-redirect. Allow user to:
- Retry the build
- Go back to dashboard manually
- Start a different platform if desired

### Multiple Builds

If user creates multiple builds for same platform:
- Only redirect after FIRST successful build
- Subsequent builds (updates) should return to main dashboard normally
- Check if this is the first completion by looking at submission history

### Session Resumption

If user returns to a flow screen with an already-completed build:
- Show the success state
- Do NOT auto-redirect (they intentionally came to this screen)
- Provide manual "Continue to Next Platform" option

## Success Metrics

Track these metrics to measure effectiveness:

1. **Completion Rate**: % of users who publish to all 3 platforms
2. **Time to Complete**: Average time from first platform to all platforms published
3. **Drop-off Points**: Where users exit the continuous flow
4. **User Feedback**: Survey responses about the flow experience

## Future Enhancements

- **Smart Ordering**: Analyze which platform takes longest for user's app and suggest starting there
- **Progress Indicator**: Show "2 of 3 platforms complete" progress bar
- **Skip Option**: Allow users to skip a platform and come back later
- **Celebration**: Show confetti animation when all 3 platforms are complete! 🎉

---

**Last Updated**: January 14, 2026
**Status**: Ready for Implementation
