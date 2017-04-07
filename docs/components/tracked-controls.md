---
title: tracked-controls
type: components
layout: docs
parent_section: components
---

[handcontrols]: ./hand-controls.md
[oculustouchcontrols]: ./oculus-touch-controls.md
[vivecontrols]: ./vive-controls.md
[daydreamcontrols]: ./daydream-controls.md

The tracked-controls component interfaces with tracked controllers.
tracked-controls uses the Gamepad API to handle tracked controllers, and is
abstracted by the [hand-controls component][handcontrols] as well as the
[vive-controls][vivecontrols], [oculus-touch-controls][oculustouchcontrols], and
[daydream-controls][daydreamcontrols]
components. This component elects the appropriate controller, applies pose to
the entity, observes buttons state and emits appropriate events.  For non-6DOF controllers
such as [daydream-controls][daydreamcontrols], a primitive arm model is used to emulate
positional data.

## Example

Note that due to recent browser-specific changes, Vive controllers may be returned
by the Gamepad API with id values of either "OpenVR Gamepad" or "OpenVR Controller", 
so using idPrefix for Vive / OpenVR controllers is recommended.

```html
<a-entity tracked-controls="controller: 0; idPrefix: OpenVR"></a-entity>
```

## Value

| Property          | Description                                                     | Default Value              |
|-------------------|-------------------------------------------------------------- --|----------------------------|
| controller        | Index of the controller in array returned by the Gamepad API.   | 0                          |
| id                | Selects the controller from the Gamepad API using exact match.  |                            |
| idPrefix          | Selects the controller from the Gamepad API using prefix match. |                            |
| rotationOffset    | Offset to add to model rotation.                                | 0                          |
| headElement       | Head element for arm model if needed (if not active camera).    |                            |
| hand              | Which hand to use, if arm model is needed.  (left negates X)    | right                      |
| eyesToElbow       | Arm model vector from eyes to elbow as user height ratio.       | {x:0.175, y:-0.3, z:-0.03} |
| forearm           | Arm model vector for forearm as user height ratio.              | {x:0, y:0, z:-0.175}       |
| defaultUserHeight | Default user height (for cameras with zero).                    | 1.6                        |

## Events

| Event Name     | Description                                |
|----------------|--------------------------------------------|
| axismove       | Axis changed.                              |
| buttonchanged  | Any touch or press of a button fires this. |
| buttondown     | Button pressed.                            |
| buttonup       | Button released.                           |
| touchstart     | Touch sensitive button touched.            |
| touchend       | Touch sensitive button released.           |

### More Resources

[gamepadAPI]: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
[openVR]: https://github.com/ValveSoftware/openvr/wiki/API-Documentation

- [Gamepad API][gamepadAPI] - W3C Gamepad API
- [OpenVR][openVR] - OpenVR Documentation
