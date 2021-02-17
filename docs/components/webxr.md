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
| referenceSpaceType      | The scene's reference space type for camera and controllers.   | local-floor   |
| requiredFeatures        | Required WebXR session features.                               | local-floor   |
| optionalFeatures        | Optional WebXR session features.                               | bounded-floor |
| overlayElement          | Element selector for use as a WebXR DOM Overlay in AR mode.    | null          |

> **NOTE:** Once the scene is initialized, these properties may no longer be changed.

### referenceSpaceType

Name of the reference space used by default for the scene, must be one of the
entries in [reference space names](https://immersive-web.github.io/webxr/#xrreferencespace).

| Name | Description |
|------|-------------|
| viewer | Rigidly attached to the camera and moves/rotates with it |
| local | Origin is an arbitrary point close to the user's head location at session start. |
| local-floor | Origin is an arbitrary point close to the user's feet at session start. |
| bounded-floor | Same as local-floor, but supports room-scale tracking with safety bounds. |
| unbounded | Same as local, but supports large-scale movement beyond ~5 meters / 15 feet. |

The default 'local-floor' should work reasonably well on all systems, but please
be aware that the floor position may be a rough estimate for 3DoF VR systems, or
for handheld AR. For AR applications that need accurate floor location, it's
recommended to use type 'local' along with world hit testing or plane detection.

Make sure the reference space name is included in `requiredFeatures`. ('viewer' and
'local' are automatically available, all others must be requested as features.)

Applications are free to use additional reference spaces internally, but it's
important that the viewer (camera) and controllers are consistent.

For consistency when used in components, this name is available as
`sceneEl.systems.webxr.sessionReferenceSpaceType`, and the corresponding
reference space object is available during the XR session as
`sceneEl.systems['tracked-controls-webxr'].referenceSpace`.

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
