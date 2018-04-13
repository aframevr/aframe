---
title: daydream-controls
type: components
layout: docs
parent_section: components
source_code: src/components/daydream-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The daydream-controls component interfaces with the Google Daydream controllers.
It wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a Daydream controller model that highlights the touched
and/or pressed buttons (trackpad).

As a first time set up, to use the Daydream controller on Chrome for Android
enable both `WebVR` and `Gamepad Extensions` experiments in `chrome://flags`
and relaunch the browser.

Then, open your web app, enter VR mode and place the phone inside the headset.
It can occassionally take a few seconds before the controller can be used.

## Example

```html
<!-- Match Daydream controller if present, regardless of hand. -->
<a-entity daydream-controls></a-entity>
```

```html
<!-- Match Daydream controller if present and for specified hand. -->
 <a-entity daydream-controls="hand: left"></a-entity>
 <a-entity daydream-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default              |
|----------------------|----------------------------------------------------|----------------------|
| armModel             | Whether the arm model is used for positional data. | true                 |
| buttonColor          | Button colors when not pressed.                    | #000000              |
| buttonTouchedColor   | Button colors when touched.                        | #777777              |
| buttonHighlightColor | Button colors when pressed and active.             | #FFFFFF              |
| hand                 | Set hand that will be tracked (i.e., right, left). |                      |
| model                | Whether the Daydream controller model is loaded.   | true                 |
| orientationOffset    | Offset to apply to model orientation.              | x: 0, y: 0, z: 0     |


## Events

| Event Name         | Description           |
| ----------         | -----------           |
| trackpadchanged    | Trackpad changed.     |
| trackpaddown       | Trackpad pressed.     |
| trackpadup         | Trackpad released.    |
| trackpadtouchstart | Trackpad touched.     |
| trackpadtouchend   | Trackpad not touched. |

## Assets

- [Controller OBJ](https://cdn.aframe.io/controllers/google/vr_controller_daydream.obj)
- [Controller MTL](https://cdn.aframe.io/controllers/google/vr_controller_daydream.mtl)

