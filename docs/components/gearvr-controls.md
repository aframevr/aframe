---
title: gearvr-controls
type: components
layout: docs
parent_section: components
---

[trackedcontrols]: ./tracked-controls.md
[lookcontrols]: ./look-controls.md
[handcontrols]: ./hand-controls.md

The gearvr-controls component interfaces with the Gear VR Touchpad
controller exposed by the Carmel and Samsung Internet VR browsers.
The [tracked-controls component][trackedcontrols] cannot provide its usual
functionality, since the Gear VR touchpad has no pose.  Instead,
the [look-controls component][lookcontrols] is used to mimic a 3DOF controller.
(Note that a dummy instance of tracked-controls is currently added anyway
for compatibility, since other components such as aframe-teleport-controls
query for entities with that component attached.)

This component adds button mappings and events, but does not currently provide
a controller model since it is assumed that end users will use this indirectly
through higher level components such as the [hand-controls component][handcontrols].  

As there is only one Gear VR Touchpad, currently this component should only be
bound to one hand (e.g. to the right hand, not the left).

## Example

```html
<a-entity gearvr-controls></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| hand                 | The hand that will be tracked (i.e., right, left). | right                |
| model                | Whether the controller model is loaded.            | false                |
| rotationOffset       | Offset to apply to model rotation.                 | 0                    |

## Events

| Event Name   | Description             |
| ----------   | -----------             |
| trackpaddown | Trackpad pressed.       |
| trackpadup   | Trackpad released.      |
