# Overlay Mapping

This document maps the buttons across the publishing dashboard screens to the Studio overlays they open.

## Overlay Opening Pattern

```javascript
Fliplet.Studio.emit('overlay', {
  name: 'overlay-name',
  options: { appId: appId, size: 'large|medium', title: 'Title', hideStoreTab: true }
});
```

## Closing an Overlay

```javascript
Fliplet.Studio.emit('close-overlay', { name: 'app-publishing' });
```

## Available Overlays

| Overlay Name | Purpose | Common Options |
|--------------|---------|----------------|
| `publish-web` | Web publishing | `size: 'large'` |
| `publish-app` | Update live apps | `size: 'medium'` |
| `publish-apple` | iOS publishing | `hideStoreTab: true`, `size: 'medium'` |
| `publish-google` | Android publishing | `hideStoreTab: true`, `size: 'medium'` |

## Button to Overlay Mapping

### Main Publishing Dashboard (Screen ID: 1868026)

| Button | Action | Overlay |
|--------|--------|---------|
| Configure update | Opens app update overlay | `publish-app` |

### iOS Publishing Dashboard (Screen ID: 1856966)

| Button | Action | Overlay |
|--------|--------|---------|
| Enterprise Distribution - Start setup | Opens iOS publishing | `publish-apple` |
| Unsigned IPA - Start setup | Opens iOS publishing | `publish-apple` |

### Android Publishing Dashboard (Screen ID: 1859844)

| Button | Action | Overlay |
|--------|--------|---------|
| Signed APK - Use existing flow | Opens Android publishing | `publish-google` |
| Debug Build - Start setup | Opens Android publishing | `publish-google` |

## Reference Screen

The **Overlay Test** screen (ID: 1868075) contains example code for all overlay types and can be used as a reference for implementing new overlay triggers.
