---
title: camera
type: components
layout: docs
parent_section: components
---

The camera component defines from which perspective the user views the scene. It is often paired with controls components that allow input devices to move and rotate the camera.

It is recommended to wrap entities with the camera component within another entity. This allows us to change the position and rotation of the camera without colliding with controls.

## Example

A camera situated at human-level height (1.8 meters), and 5 meters back.

```html
<a-entity position="0 1.8 5">
  <a-entity camera look-controls></a-entity>
</a-entity>
```

For room-scale experiences, design the experience with the camera at the origin (0, 0, 0):

```html
<a-entity>
  <a-entity camera look-controls></a-entity>
</a-entity>
```

## Properties

| Property | Description                                                                         | Default Value |
|----------|-------------------------------------------------------------------------------------|---------------|
| active   | Whether the camera is currently the active camera in a scene with multiple cameras. | true          |
| far      | Camera frustum far clipping plane.                                                  | 10000         |
| fov      | Field of view (in degrees).                                                         | 80            |
| near     | Camera frustum near clipping plane.                                                 | 0.5           |
| zoom     | Zoom factor of the camera.                                                          | 1             |

## Changing the Active Camera

When the `active` property is toggled, the component will notify the camera system to change the current camera used by the renderer:

```js
var secondCameraEl = document.querySelector('#second-camera');
secondCameraEl.setAttribute('camera', 'active', true);
```

## Fixing Entities to the Camera

To fix entities onto the camera such that they stay within view no matter where the user looks, you can attach those entities as a child of the camera. Use cases might be a heads-up display (HUD).

```html
<a-entity camera look-controls>
  <a-entity geometry="primitive: plane; height: 0.2; width: 0.2" position="0 0 -1"
            material="color: gray; opacity: 0.5"></a-entity>
</a-entity>
```

Note that you should use HUDs sparingly as they cause irritation and eye strain in VR. Consider integrating menus into the fabric of the world itself. If you do create a HUD, make sure that it is more in the center of the field of view such that the user does not have to strain their eyes to read it.
