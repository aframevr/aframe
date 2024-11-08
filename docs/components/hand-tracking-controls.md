---
title: hand-tracking-controls
type: components
layout: docs
parent_section: components
source_code: src/components/hand-tracking-controls.js
examples: []
---

[webxrhandinput]: https://immersive-web.github.io/webxr-hand-input/

Use `hand-tracking-controls` to integrate [hand tracked input][webxrhandinput] in your application. The component provides a visual representation of the hand and basic gesture recognition. It can be used along tracked controllers (e.g: meta-touch-controls) for applications requiring multiple input methods. Component is only active when the browser and underlying system starts tracking the user's hands.

## Example

```html
<a-entity id="leftHand" hand-tracking-controls="hand: left;"></a-entity>
<a-entity id="rightHand" hand-tracking-controls="hand: right;"></a-entity>
```

## Properties

| Property       | Description                                                                            | Default Value |
|----------------|----------------------------------------------------------------------------------------|---------------|
| hand                 | The hand that will be tracked (i.e., right, left). | left                 |
| modelColor          | Color of hand material.                                                                | white         |
| modelOpacity         | Opacity of the hand material.                                   | 1.0          |
| modelStyle           | Mesh representing the hand or dots matching the joints        | mesh

## Events

| Event Name    | Description                                                    |
| ----------    | -----------                                                    |
| pinchstarted  | The pinch gesture has started. World coordinates passed as event detail.                                 |
| pinchended    | The pinch gesture has ended. World coordinates passed as event detail.                                    |
| pinchmoved    | The hand moved while making the pinch gesture. Useful for interactions that track the hand while the gesture is engaged. World coordinates passed as event detail.                  |

## Assets

- [Left hand low poly model](https://cdn.aframe.io/controllers/oculus-hands/unity/left.glb)
- [Right hand low poly model](https://cdn.aframe.io/controllers/oculus-hands/unity/right.glb)

