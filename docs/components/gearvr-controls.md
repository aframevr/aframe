---
title: gearvr-controls
type: components
layout: docs
parent_section: components
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

| Property             | Description                                        | Default |
|----------------------|----------------------------------------------------|---------|
| buttonColor          | Button colors when not pressed.                    | #000000 |
| buttonTouchedColor   | Button colors when touched.                        | #777777 |
| buttonHighlightColor | Button colors when pressed and active.             | #FFFFFF |
| hand                 | The hand that will be tracked (e.g., right, left). |         |
| model                | Whether the Daydream controller model is loaded.   | true    |
| rotationOffset       | Offset to apply to model rotation.                 | 0       |

## Events

| Event Name         | Description           |
| ----------         | -----------           |
| trackpaddown       | Trackpad pressed.     |
| trackpadup         | Trackpad released.    |
| trackpadtouchstart | Trackpad touched.     |
| trackpadtouchend   | Trackpad not touched. |
| triggerdown        | Trigger pressed.      |
| triggerup          | Trigger released.     |

## Assets

- [Controller OBJ](https://cdn.aframe.io/controllers/google/vr_controller_daydream.obj)
- [Controller MTL](https://cdn.aframe.io/controllers/google/vr_controller_daydream.mtl)

