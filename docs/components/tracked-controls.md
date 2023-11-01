---
title: tracked-controls
type: components
layout: docs
parent_section: components
source_code: src/components/tracked-controls.js
examples: []
---

[handcontrols]: ./hand-controls.md
[oculustouchcontrols]: ./oculus-touch-controls.md
[vivecontrols]: ./vive-controls.md
[windowsmotioncontrols]: ./windows-motion-controls.md

The tracked-controls component interfaces with tracked controllers.
tracked-controls uses the Gamepad API to handle tracked controllers, and is
abstracted by the [hand-controls component][handcontrols] as well as the
[vive-controls][vivecontrols], [oculus-touch-controls][oculustouchcontrols],
[windows-motion-controls][windowsmotioncontrols] components.
This component elects the appropriate controller, applies pose to
the entity, observes buttons state and emits appropriate events.  For non-6DOF controllers,
a primitive arm model is used to emulate positional data.

tracked-controls sets two components that handles different Web API versions for VR:

- tracked-controls-webvr
- tracked-controls-webxr

## Example

Note that due to recent browser-specific changes, Vive controllers may be returned
by the Gamepad API with id values of either "OpenVR Gamepad" or "OpenVR Controller",
so using idPrefix for Vive / OpenVR controllers is recommended.

```html
<a-entity tracked-controls="controller: 0; idPrefix: OpenVR"></a-entity>
```

## Value

| Property          | Description                                                                              | Default Value    |
|-------------------|------------------------------------------------------------------------------------------|------------------|
| armModel          | Whether the arm model is used for positional data if absent.                             | true             |
| autoHide          | Whether to toggle visibility automatically when controller is connected or disconnected. | true             |
| controller        | Index of the controller in array returned by the Gamepad API.                            | 0                |
| id                | Selects the controller from the Gamepad API using exact match.                           |                  |
| idPrefix          | Selects the controller from the Gamepad API using prefix match.                          |                  |
| headElement       | Head element for arm model if needed (if not active camera).                             |                  |
| hand              | Which hand to use, if arm model is needed.  (left negates X)                             | right            |
| orientationOffset | Offset to apply to model orientation.                                                    | x: 0, y: 0, z: 0 |
| space             | Specifies whether to use targetRayspace or gripSpace to determine controller pose.       | targetRaySpace   |

## Events

| Event Name    | Description                                                                                                                                                                       |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| controllerconnected    | Controller connected and set up.          |
| controllerdisconnected | Controller disconnected.               |
| axismove               | Axis changed (e.g., for thumbstick, touchpad). Contains `axis` and `axesChanged` in the event detail. `axis` is an array of values from `-1.0` (left, down) to `1.0` (right, up). |
| buttonchanged          | Any touch or press of a button fires this.                                                                                                                                         |
| buttondown             | Button pressed.                                                                                                                                                                   |
| buttonup               | Button released.                                                                                                                                                                   |
| touchstart             | Touch sensitive button touched.                                                                                                                                                   |
| touchend               | Touch sensitive button released.                                                                                                                                                   |

### More Resources

[gamepadAPI]: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
[openVR]: https://github.com/ValveSoftware/openvr/wiki/API-Documentation

- [Gamepad API][gamepadAPI] - W3C Gamepad API
- [OpenVR][openVR] - OpenVR Documentation
