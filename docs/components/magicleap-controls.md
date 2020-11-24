---
title: magicleap-controls
type: components
layout: docs
parent_section: components
source_code: src/components/magicleap-controls.js

examples: []
---

[trackedcontrols]: ./tracked-controls.md

The magicleap-controls component interfaces with the Magic Leap controller.
It wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and Magic Leap controller model/

## Example

```html
<!-- Match Magic Leap controller if present, regardless of hand. -->
<a-entity magicleap-controls></a-entity>

<!-- Match Magic Leap controller if present and for specified hand. -->
<a-entity magicleap-controls="hand: left"></a-entity>
<a-entity magicleap-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default              |
|----------------------|----------------------------------------------------|----------------------|
| hand                 | The hand that will be tracked (e.g., right, left). |                      |
| model                | Whether the Magic Leap controller model is loaded. | true                 |
| orientationOffset    | Offset to apply to model orientation.              | x: 0, y: 0, z: 0     |

## Events

| Event Name         | Description           |
| ----------         | -----------           |
| touchpadchanged    | Touchpad changed.     |
| touchpaddown       | Touchpad pressed.     |
| touchpadmoved      | Touchpad axis changed.|
| touchpadup         | Touchpad released.    |
| touchpadtouchstart | Touchpad touched.     |
| touchpadtouchend   | Touchpad not touched. |
| gripchanged        | Grip changed.         |
| gripdown           | Grip pressed.         |
| gripup             | Grip released.        |
| triggerchanged     | Trigger changed.      |
| triggerdown        | Trigger pressed.      |
| triggerup          | Trigger released.     |
| menuchanged        | Menu changed.         |
| menudown           | Menu pressed.         |
| menuup             | Menu released.        |

## Assets

- [Controller GLTF](https://cdn.aframe.io/controllers/magicleap/magicleap-one-controller.glb)

