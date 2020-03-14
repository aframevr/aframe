---
title: webxr
type: components
layout: docs
parent_section: components
source_code: src/systems/webxr.js
examples: []
---

The `webxr` system configures a scene's WebXR device setup,
specifically the options for the [requestSession](https://immersive-web.github.io/webxr/#dom-xrsystem-requestsession) call.

When modifying these options, please pay attention to the browser console for
diagnostic messages such as trying to use features without properly requesting
them.

## Example

```html
<a-scene webxr="requiredFeatures: hit-test,local-floor;
                optionalFeatures: dom-overlay,unbounded;
                overlayElement: #overlay;"></a-scene>
```

## Properties

| Property                | Description                                                    | Default Value |
|-------------------------|----------------------------------------------------------------|---------------|
| requiredFeatures        | Required WebXR session features.                               | local-floor   |
| optionalFeatures        | Optional WebXR session features.                               | bounded-floor |
| overlayElement          | Element selector for use as a WebXR DOM Overlay in AR mode.    | null          |

> **NOTE:** Once the scene is initialized, these properties may no longer be changed.

### requiredFeatures

Array (comma-separated list) of WebXR feature names that are required for the
application to work correctly. If one of the features is not supported by the
system, or if the user doesn't agree to it being used, the session request will
fail.

Currently, the list of available features includes the [reference space
names](https://immersive-web.github.io/webxr/#xrreferencespace), and the
following additional features for AR mode:

| Feature | Description |
|---------|-------------|
| hit-test | https://immersive-web.github.io/hit-test/ |
| dom-overlay | https://immersive-web.github.io/dom-overlays/ |

### optionalFeatures

Array (comma-separated list) of WebXR feature names that an application can use,
but where the application will still work if they are not supported. The
session will be created without these features if they are unavailable or
if the user declined their use.

See [requiredFeatures](#requiredFeatures) for more information of available
WebXR feature names.

### overlayElement

Selector for a DOM element that should be used as a WebXR DOM Overlay during
an AR session. This is currently only supported for handheld AR using Chrome
on Android version 82 or newer. 

You must request the feature `dom-overlay` to use this, either as an optional or
required feature.

If the feature is available, `sceneEl.xrSession.domOverlayMode` will have
a string value indicating the type of DOM Overlay being used. This is currently
`screen` for handheld AR, but may also be `floating` or `head-locked` on a
headset. Also, the overlay element will have the `:xr-overlay` pseudoclass
while active, and you can use this in CSS rules to show/hide UI.
