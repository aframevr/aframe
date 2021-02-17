---
title: oculus-touch-controls
type: components
layout: docs
parent_section: components
source_code: src/components/oculus-touch-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The oculus-touch-controls component interfaces with the Oculus Touch controllers (Rift, Rift S, Oculus Quest 1 and 2). It
wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a Touch controller model.

## Example

```html
<a-entity oculus-touch-controls="hand: left"></a-entity>
<a-entity oculus-touch-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| hand                 | The hand that will be tracked (i.e., right, left). | left                 |
| model                | Whether the Touch controller model is loaded.      | true                 |
| orientationOffset    | Offset to apply to model orientation.              | x: 0, y: 0, z: 0     |

## Events

| Event Name           | Description                       |
| ----------           | -----------                       |
| triggerdown          | Trigger pressed.                  |
| triggerup            | Trigger released.                 |
| triggertouchstart    | Trigger touched.                  |
| triggertouchend      | Trigger no longer touched.        |
| triggerchanged       | Trigger changed.                  |
| thumbstickdown       | Thumbstick pressed.               |
| thumbstickup         | Thumbstick released.              |
| thumbsticktouchstart | Thumbstick touched.               |
| thumbsticktouchend   | Thumbstick no longer touched.     |
| thumbstickchanged    | Thumbstick changed.               |
| thumbstickmoved      | Thumbstick direction changed.     |
| gripdown             | Grip button pressed.              |
| gripup               | Grip button released.             |
| griptouchstart       | Grip button touched.              |
| griptouchend         | Grip button no longer touched.    |
| gripchanged          | Grip button changed.              |
| abuttondown          | A button pressed.                 |
| abuttonup            | A button released.                |
| abuttontouchstart    | A button touched.                 |
| abuttontouchend      | A button no longer touched.       |
| abuttonchanged       | A button changed.                 |
| bbuttondown          | B button pressed.                 |
| bbuttonup            | B button released.                |
| bbuttontouchstart    | B button touched.                 |
| bbuttontouchend      | B button no longer touched.       |
| bbuttonchanged       | B button changed.                 |
| xbuttondown          | X button pressed.                 |
| xbuttonup            | X button released.                |
| xbuttontouchstart    | X button touched.                 |
| xbuttontouchend      | X button no longer touched.       |
| xbuttonchanged       | X button changed.                 |
| ybuttondown          | Y button pressed.                 |
| ybuttonup            | Y button released.                |
| ybuttontouchstart    | Y button touched.                 |
| ybuttontouchend      | Y button no longer touched.       |
| ybuttonchanged       | Y button changed.                 |
| surfacedown          | Surface button pressed.           |
| surfaceup            | Surface button released.          |
| surfacetouchstart    | Surface button touched.           |
| surfacetouchend      | Surface button no longer touched. |
| surfacechanged       | Surface button changed.           |

## Read thumbstick values

Listen to the `thumbstick` event and the values are available in the object passed to the handler

```html
<a-entity oculus-touch-controls="hand: left" thumbstick-logging></a-entity>
<a-entity oculus-touch-controls="hand: right" thumbstick-logging></a-entity>
```

```javascript
AFRAME.registerComponent('thumbstick-logging',{
  init: function () {
    this.el.addEventListener('thumbstickmoved', this.logThumbstick);
  },
  logThumbstick: function (evt) {
    if (evt.detail.y > 0.95) { console.log("DOWN"); }
    if (evt.detail.y < -0.95) { console.log("UP"); }
    if (evt.detail.x < -0.95) { console.log("LEFT"); }
    if (evt.detail.x > 0.95) { console.log("RIGHT"); }
  }
});
```

## Assets

- [Left Controller OBJ](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-left.obj)
- [Left Controller MTL](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-left.mtl)
- [Right Controller OBJ](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-right.obj)
- [Right Controller MTL](https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-right.mtl)
