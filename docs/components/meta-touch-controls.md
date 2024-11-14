---
title: meta-touch-controls
type: components
layout: docs
parent_section: components
source_code: src/components/meta-touch-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The meta-touch-controls (formerly oculus-touch-controls) component interfaces with the Meta Touch controllers (Rift, Rift S, Oculus Quest 1, 2, 3 and 3s). It
wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a Touch controller model.

## Example

```html
<a-entity meta-touch-controls="hand: left"></a-entity>
<a-entity meta-touch-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                        | Default Value        |
|----------------------|----------------------------------------------------|----------------------|
| hand                 | The hand that will be tracked (i.e., right, left). | left                 |
| model                | Whether the Touch controller model is loaded.      | true                 |

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
<a-entity meta-touch-controls="hand: left" thumbstick-logging></a-entity>
<a-entity meta-touch-controls="hand: right" thumbstick-logging></a-entity>
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

- [Left Controller glTF](https://cdn.aframe.io/controllers/meta/quest-touch-plus-left.glb)
- [Right Controller glTF](https://cdn.aframe.io/controllers/meta/quest-touch-plus-right.glb)
