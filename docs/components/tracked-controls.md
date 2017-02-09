---
title: tracked-controls
type: components
layout: docs
parent_section: components
---

[handcontrols]: ./hand-controls.md
[oculustouchcontrols]: ./oculus-touch-controls.md
[vivecontrols]: ./vive-controls.md

The tracked-controls component interfaces with tracked controllers.
tracked-controls uses the Gamepad API to handle tracked controllers, and is
abstracted by the [hand-controls component][handcontrols] as well as the
[vive-controls][vivecontrols] and [oculus-touch-controls][oculustouchcontrols]
components. This component elects the appropriate controller, applies pose to
the entity, observes buttons state and emits appropriate events.

## Example

Note that due to recent browser-specific changes, Vive controllers may be returned
by the Gamepad API with id values of either "OpenVR Gamepad" or "OpenVR Controller", 
so using idPrefix for Vive / OpenVR controllers is recommended.

```html
<a-entity tracked-controls="controller: 0; idPrefix: OpenVR"></a-entity>
```

## Value

| Property    | Description                                                     | Default Value |
|-------------|-------------------------------------------------------------- --|---------------|
| controller  | Index of the controller in array returned by the Gamepad API.   | 0             |
| id          | Selects the controller from the Gamepad API using exact match.  |               |
| idPrefix    | Selects the controller from the Gamepad API using prefix match. |               |

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
