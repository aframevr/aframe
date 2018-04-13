---
title: gearvr-controls
type: components
layout: docs
parent_section: components
source_code: src/components/gearvr-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The gearvr-controls component interfaces with the Samsung/Oculus Gear VR controllers.
It wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a Gear VR controller model that highlights the touched
and/or pressed buttons (trackpad, trigger).

## Example

```html
<!-- Match Gear VR controller if present, regardless of hand. -->
<a-entity gearvr-controls></a-entity>

<!-- Match Gear VR controller if present and for specified hand. -->
<a-entity gearvr-controls="hand: left"></a-entity>
<a-entity gearvr-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default              |
|----------------------|----------------------------------------------------|----------------------|
| armModel             | Whether the arm model is used for positional data. | true                 |
| buttonColor          | Button colors when not pressed.                    | #000000              |
| buttonTouchedColor   | Button colors when touched.                        | #777777              |
| buttonHighlightColor | Button colors when pressed and active.             | #FFFFFF              |
| hand                 | The hand that will be tracked (e.g., right, left). |                      |
| model                | Whether the Gear controller model is loaded.       | true                 |
| orientationOffset    | Offset to apply to model orientation.              | x: 0, y: 0, z: 0     |

## Events

| Event Name         | Description           |
| ----------         | -----------           |
| trackpadchanged    | Trackpad changed.     |
| trackpaddown       | Trackpad pressed.     |
| trackpadup         | Trackpad released.    |
| trackpadtouchstart | Trackpad touched.     |
| trackpadtouchend   | Trackpad not touched. |
| triggerchanged     | Trigger changed.      |
| triggerdown        | Trigger pressed.      |
| triggerup          | Trigger released.     |

## Assets

- [Controller OBJ](https://cdn.aframe.io/controllers/samsung/gear_vr_controller.obj)
- [Controller MTL](https://cdn.aframe.io/controllers/samsung/gear_vr_controller.mtl)

