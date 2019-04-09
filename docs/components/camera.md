---
title: camera
type: components
layout: docs
parent_section: components
source_code: src/components/camera.js
examples: []
---

The camera component defines from which perspective the user views the scene.
The camera is commonly paired with controls components that allow input devices
to move and rotate the camera.

## Examples

A camera should usually be positioned at the average height of human eye level
(1.6 meters). When used with controls that receive rotation or position (e.g.
from a VR device) this position will be overridden.

```html
<a-entity camera look-controls position="0 1.6 0"></a-entity>
```

When moving or rotating the camera relative to the scene, use a camera rig.
By doing so, the camera's height offset can be updated by roomscale devices,
while still allowing the tracked area to be moved independently around the
scene.

```html
<a-entity id="rig" position="25 10 0">
  <a-entity id="camera" camera look-controls></a-entity>
</a-entity>
```

## Properties

| Property   | Description                                                                                                                                                                                                                                                                         | Default Value |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| active     | Whether the camera is the active camera in a scene with more than one camera.                                                                                                                                                                                                       | true          |
| far        | Camera frustum far clipping plane.                                                                                                                                                                                                                                                  | 10000         |
| fov        | Field of view (in degrees).                                                                                                                                                                                                                                                         | 80            |
| near       | Camera frustum near clipping plane.                                                                                                                                                                                                                                                 | 0.005         |
| spectator  | Whether the camera is used to render a third-person view of the scene on the 2D display while in VR mode.                                                                                                                                                                                       | false         |
| zoom       | Zoom factor of the camera.                                                                                                                                                                                                                                                          | 1             |

## Default Camera

If a camera is not specified, A-Frame will inject a default camera:

```html
<a-entity camera="active: true" look-controls wasd-controls position="0 1.6 0" data-aframe-default-camera></a-entity>
```

If a camera is specified (e.g., our own `<a-camera>` or `<a-entity camera>`),
then the default camera will not be added.

## VR Behavior

When exiting VR, the camera will restore its rotation to its rotation *before*
it entered VR. This is so when we exit VR, the rotation of the camera is back
to normal for a desktop screen.

Far, near, fov, zoom properties only apply in 2D and magic window modes. 
In VR mode the camera parameters are supplied by the WebVR / WebXR API to match IPD and headset FOV. Those aren't configurable. 

## Changing the Active Camera

When the `active` property gets toggled, the component will notify the camera system
to change the current camera used by the renderer:

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
do create a HUD, make sure that the HUD is more in the center of the field of
view such that the user does not have to strain their eyes to read it.

## Reading Position or Rotation of the Camera

To actively read the position or rotation of the camera, use a `tick` handler
of a component that reads the position or rotation, and does something with it.
Then attach the component to the camera.

```js
AFRAME.registerComponent('rotation-reader', {
  tick: function () {
    // `this.el` is the element.
    // `object3D` is the three.js object.

    // `rotation` is a three.js Euler using radians. `quaternion` also available.
    console.log(this.el.object3D.rotation);

    // `position` is a three.js Vector3.
    console.log(this.el.object3D.position);
  }
});

// <a-entity camera look-controls rotation-reader>
```

### Reading World Position or Rotation of the Camera

three.js has methods to attain position or rotation (or scale) in world space
versus object local space.

```js
AFRAME.registerComponent('rotation-reader', {
  /**
   * We use IIFE (immediately-invoked function expression) to only allocate one
   * vector or euler and not re-create on every tick to save memory.
   */
  tick: (function () {
    var position = new THREE.Vector3();
    var rotation = new THREE.Euler();

    return function () {
      this.el.object3D.getWorldPosition(position);
      this.el.object3D.getWorldRotation(rotation);
      // position and rotation now contain vector and euler in world space.
    };
  })
});
```
