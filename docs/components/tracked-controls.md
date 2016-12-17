---
title: tracked-controls
type: components
layout: docs
parent_section: components
---

[handcontrols]: ./hand-controls.md
[vivecontrols]: ./vive-controls.md

The tracked-controls component interfaces with tracked controllers. The component uses
the Gamepad API to handle tracked controllers. This component choose the
appropriate controller, applies pose to the entity, observes buttons state and
emits appropriate events.

The [hand-controls component][handcontrols] and the [vive-controls
component][vivecontrols] abstract the tracked-controls component further.

## Example

```html
<a-entity tracked-controls="controller: 0; id: OpenVR Gamepad"></a-entity>
```

## Value

| Property    | Description                                                    | Default Value    |
|-------------|----------------------------------------------------------------|------------------|
| controller  | Index of the controller in array returned by the Gamepad API.  | 0                |
| id          | Selects the controller returned by the Gamepad API.            | OpenVR Gamepad   |

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
