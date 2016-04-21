---
title: controls
type: components
layout: docs
parent_section: components
order: 4
---

The controls component defines the position and rotation of an entity, based on input from one or more input devices. Each input method is attached to its own component, and can be enabled/disabled or configured through that component.

The following input components are provided by A-Frame, in addition to any custom controls created by the user:

* [gamepad-controls](#gamepad-controls) *(position + rotation)*
* [hmd-controls](#hmd-controls) *(position + rotation)*
* [keyboard-controls](#keyboard-controls) *(position)*
* [mouse-controls](#mouse-controls) *(rotation)*
* [touch-controls ](#touch-controls) *(position)*

## Example

The controls component is generally used alongside the [camera component][components-camera], and will automatically listen for the default input devices.

```html
<a-entity camera controls></a-entity>
```

To customize which input methods are enabled, specify the `position` or `rotation` properties:

```html
<a-entity camera controls="position: custom-controls gamepad-controls; rotation: hmd-controls;"></a-entity>
```

To configure one of the input methods, include its component and set the properties you want to change:

```html
<a-entity camera controls mouse-controls="pointerlockEnabled: true"></a-entity>
```

## Properties

### controls

| Property             | Description                                                                           | Default Value                                     |
|----------------------|---------------------------------------------------------------------------------------|----------------------------------------------------
| enabled              | Whether all controls are enabled.                                                     | true                                              |
| flyingEnabled        | Whether or not movement is restricted to the entity's initial plane.                  | false                                             |
| position             | List of input components used to track the entity's position, in order of precedence. | hmd-controls gamepad-controls keyboard-controls touch-controls |
| positionEnabled      | Whether positional tracking is enabled.                                               | true                                              |
| positionEasing       | How quickly the entity slows down without input. Like friction.                       | 15                                                |
| positionAcceleration | How quickly the entity accelerates with input.                                        | 65                                                |
| rotation             | List of input components used to track the entity's rotation, in order of precedence. | hmd-controls gamepad-controls mouse-controls      |

### gamepad-controls

Rotate entity with right joystick, and move the entity with the left joystick or D-pad.

| Property    | Description                                                                            | Default Value  |
|-------------|----------------------------------------------------------------------------------------|----------------|
| enabled     | Whether gamepad input is enabled.                                                      | true           |
| controller  | Which connected controller (1-4) should be used, if multiple are available.            | 1              |
| sensitivity | How quickly the gamepad's right joystick (if applicable) rotates the entity or camera. | 0.05           |

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

By default, rotates the entity when the mouse is clicked and dragged. With `pointerlockEnabled: true`, uses the [Pointerlock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API) to eliminate limits on how far mouse movement can go in a single direction and remove the cursor from view. The `pointerlockEnabled` option is ideal for first person 3D games.

| Property | Description                                                 | Default Value |
|----------|-------------------------------------------------------------|---------------|
| enabled  | Whether mouse input is enabled.                             | true          |
| pointerlockEnabled | Whether the mouse is locked within the canvas.    | false         |
| sensitivity | How quickly mouse movement rotates the entity or camera. | false         |

### touch-controls

Moves the entity forward when the canvas is touched. Useful for mobile devices and viewers with a single button.

| Property | Description                     | Default Value |
|----------|---------------------------------|---------------|
| enabled  | Whether touch input is enabled. | true          |

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
