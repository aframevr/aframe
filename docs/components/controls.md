---
title: controls
type: components
layout: docs
parent_section: components
order: 4
---

The controls component defines the position and rotation of an entity, based on input from one or more input devices. Each input method is attached to its own component, and can be enabled/disabled or configured through that component.

The following input components are provided by A-Frame, in addition to any custom controls created by the user:

* [hmd-controls](#hmd-controls) *(position + rotation)*
* [keyboard-controls](#keyboard-controls) *(position)*
* [mouse-controls](#mouse-controls) *(rotation)*

## Example

The controls component is generally used alongside the [camera component][components-camera], and will automatically listen for the default input devices.

```html
<a-entity camera controls></a-entity>
```

To customize which input methods are enabled, specify the `position` or `rotation` properties:

```html
<a-entity camera controls="position: custom-controls, keyboard-controls; rotation: hmd-controls;"></a-entity>
```

To configure one of the input methods, include its component and set the properties you want to change:

```html
<a-entity camera controls mouse-controls="sensitivity: 0.005"></a-entity>
```

## Properties

### controls

| Property                | Description                                                                           | Default Value               |
|-------------------------|---------------------------------------------------------------------------------------|-----------------------------|
| enabled                 | Whether all controls are enabled.                                                     | true                        |
| flyingEnabled           | Whether or not movement is restricted to the entity's initial plane.                  | false                       |
| position                | List of input components used to track the entity's position, in order of precedence. | hmd-controls                |
| positionControlsEnabled | Whether positional tracking is enabled.                                               | true                        |
| positionEasing          | How quickly the entity slows down without input. Like friction.                       | 15                          |
| positionAcceleration    | How quickly the entity accelerates with input.                                        | 65                          |
| rotation                | List of input components used to track the entity's rotation, in order of precedence. | hmd-controls mouse-controls |

### hmd-controls

Rotate and move entity when the head-mounted display (HMD) is rotated and moved.

| Property | Description                   | Default Value |
|-------------|----------------------------|---------------|
| enabled  | Whether HMD input is enabled. | true          |

### keyboard-controls

Moves the entity using the WASD or ↑←↓→ keys.

| Property | Description                        | Default Value |
|----------|------------------------------------|---------------|
| enabled  | Whether keyboard input is enabled. | true          |

### mouse-controls

Rotates the entity when the mouse is clicked and dragged.

| Property | Description                                                 | Default Value |
|----------|-------------------------------------------------------------|---------------|
| enabled  | Whether mouse input is enabled.                             | true          |
| sensitivity | How quickly mouse movement rotates the entity or camera. | false         |

## Custom Controls

To create your own component for position or rotation controls, use the `AFRAME.registerControls()` API.

Example:

```js
AFRAME.registerControls('random-controls', {
  schema: {enabled: {default: true}},

  init: function () {
    this.dVelocity = new THREE.Vector3();
  },

  isPositionActive: function () {
    return true;
  },

  getVelocityDelta: function (dt) {
    this.dVelocity.set(Math.random(), 0, Math.random());
    return this.dVelocity.clone();
  }
});
```
