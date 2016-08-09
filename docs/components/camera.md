---
title: camera
type: components
layout: docs
parent_section: components
---

The camera component defines from which perspective the user views the scene.
It is often paired with controls components that allow input devices to move
and rotate the camera.

It is recommended to wrap entities with the camera component within another
entity. This allows us to change the position and rotation of the camera
without colliding with controls.

## Example

A camera situated at human-level height (1.8 meters).

```html
<a-entity camera="userHeight: 1.8" look-controls></a-entity>
```

## Properties

| Property   | Description                                                                                                                     | Default Value |
|------------|---------------------------------------------------------------------------------------------------------------------------------|---------------|
| active     | Whether the camera is currently the active camera in a scene with multiple cameras.                                             | true          |
| far        | Camera frustum far clipping plane.                                                                                              | 10000         |
| fov        | Field of view (in degrees).                                                                                                     | 80            |
| near       | Camera frustum near clipping plane.                                                                                             | 0.005         |
| userHeight | How much height to add to the camera when *not* in VR mode. The default camera has this set to 1.8 (to represent human height). | 0             |
| zoom       | Zoom factor of the camera.                                                                                                      | 1             |

## VR Behavior

When not in VR mode, `userHeight` translates the camera up to simulate human
height. The injected camera has this set to 1.8 (meters). When entering VR,
this height offset is *removed* such that the absolute position return from the
VR headset is used. This is very convenient for experiences that work both in
and out of VR, as well as making experiences look decent from the monitor as
opposed to clipping the ground if the headset was resting on the ground.

When exiting VR, the camera will restore its rotation to its rotation *before*
it entered VR. This is so when we exit VR, the rotation of the camera is back
to normal for monitor display.

## Changing the Active Camera

When the `active` property is toggled, the component will notify the camera
system to change the current camera used by the renderer:

```js
var secondCameraEl = document.querySelector('#second-camera');
secondCameraEl.setAttribute('camera', 'active', true);
```

## Fixing Entities to the Camera

To fix entities onto the camera such that they stay within view no matter where
the user looks, you can attach those entities as a child of the camera. Use
cases might be a heads-up display (HUD).

```html
<a-entity camera look-controls>
  <a-entity geometry="primitive: plane; height: 0.2; width: 0.2" position="0 0 -1"
            material="color: gray; opacity: 0.5"></a-entity>
</a-entity>
```

Note that you should use HUDs sparingly as they cause irritation and eye strain
in VR. Consider integrating menus into the fabric of the world itself. If you
do create a HUD, make sure that it is more in the center of the field of view
such that the user does not have to strain their eyes to read it.
