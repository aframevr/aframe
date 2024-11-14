---
title: vive-controls
type: components
layout: docs
parent_section: components
source_code: src/components/vive-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The vive-controls component interfaces with the HTC Vive controllers/wands. It
wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a Vive controller model that highlights the pressed
buttons (trigger, grip, menu, system) and trackpad.

## Example

```html
<a-entity vive-controls="hand: left"></a-entity>
<a-entity vive-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| buttonColor          | Button colors when not pressed.                    | #FAFAFA (off-white)  |
| buttonHighlightColor | Button colors when pressed and active.             | #22D1EE (light blue) |
| hand                 | The hand that will be tracked (i.e., right, left). | left                 |
| model                | Whether the Vive controller model is loaded.       | true                 |

## Events

| Event Name      | Description              |
| ----------      | -----------              |
| gripdown        | Grip button pressed.     |
| gripup          | Grip button released.    |
| gripchanged     | Grip button changed.     |
| menudown        | Menu button pressed.     |
| menuup          | Menu button released.    |
| menuchanged     | Menu button changed.     |
| systemdown      | System button pressed.   |
| systemup        | System button released.  |
| systemchanged   | System button changed.   |
| trackpaddown    | Trackpad pressed.        |
| trackpadup      | Trackpad released.       |
| trackpadchanged | Trackpad button changed. |
| triggerdown     | Trigger pressed.         |
| triggerup       | Trigger released.        |
| triggerchanged  | Trigger changed.         |

## Assets

- [Controller OBJ](https://cdn.aframe.io/controllers/vive/vr_controller_vive.obj)
- [Controller MTL](https://cdn.aframe.io/controllers/vive/vr_controller_vive.mtl)

