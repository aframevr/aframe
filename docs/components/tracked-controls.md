---
title: tracked-controls
type: components
layout: docs
parent_section: components
---

[handcontrols]: ./hand-controls.md
[vivecontrols]: ./vive-controls.md

The tracked-controls component interfaces with tracked controllers. 
It uses the Gamepad API to handle tracked controllers, 
and is abstracted by the [hand-controls component][handcontrols] & the [vive-controls component][vivecontrols].
This component elects the appropriate controller, applies pose to the entity, observes buttons state and emits appropriate events.


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

### Additional Resources

- [Gamepad API][gamepadAPI] - W3C Gamepad API
- [OpenVR][openVR] - OpenVR Documentation

[gamepadAPI]: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
[openVR]: https://github.com/ValveSoftware/openvr/wiki/API-Documentation
