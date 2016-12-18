---
title: carmel-gearvr-controls
type: components
layout: docs
parent_section: components
---

[trackedcontrols]: ./tracked-controls.md
[lookcontrols]: ./look-controls.md
[handcontrols]: ./hand-controls.md

The carmel-gearvr-controls component interfaces with the Gear VR Touchpad
controller exposed by the Carmel browser.  As that controller has no pose,
the [tracked-controls component][trackedcontrols] cannot provide its usual
functionality, but an instance is added anyway since other components such 
as aframe-teleport-controls use that to find controller entities.  Instead,
the [look-controls component][lookcontrols] is used to mimic a 3DOF controller.

This component adds button mappings and events, but does not currently provide
a controller model since it is assumed that end users will use this indirectly
through higher level components such as the [hand-controls component][handcontrols].  

As there is only one Gear VR Touchpad, currently this component will only bind
to the right hand, not the left.

## Example

```html
<a-entity carmel-gearvr-controls="hand: right"></a-entity>
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
