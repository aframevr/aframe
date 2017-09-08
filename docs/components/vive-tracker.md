---
title: vive-tracker
type: components
layout: docs
parent_section: components
---

[trackedcontrols]: ./tracked-controls.md

The vive-tracker component interfaces with the HTC Vive Tracker. It
wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a model.

## Example

```html
<a-box vive-tracker></a-box>

<a-box vive-tracker="index: 0"></a-entity>
<a-box vive-tracker="index: 1"></a-entity>
<a-box vive-tracker="index: 2"></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| buttonColor          | Button colors when not pressed.                    | #FAFAFA (off-white)  |
| buttonHighlightColor | Button colors when pressed and active.             | #22D1EE (light blue) |
| index                | The index of the tracker that will be tracked.     | 0                    |
| model                | Whether the model is loaded.                       | true                 |
| rotationOffset       | Offset to apply to model rotation.                 | 0                    |

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

