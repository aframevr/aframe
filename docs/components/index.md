---
title: camera
section_title: Components
type: components
layout: docs
parent_section: docs
order: 1
section_order: 3
---

The `camera` component defines from which perspective the user views the scene. It is often paired with controls-related components that allow user input to move and rotate the camera.

It is recommended to wrap entities with the `camera` component within another entity. This allows us to change the position of the camera without colliding with controls.

## Example

```html
<a-entity position="0 1.8 5">
  <a-entity camera look-controls></a-entity>
</a-entity>
```

## Properties

| Property | Description                                                                         | Default Value |
|----------+-------------------------------------------------------------------------------------+---------------|
| active   | Whether the camera is currently the active camera in a scene with multiple cameras. | true          |
| far      | Camera frustum far clipping plane.                                                  | 10000         |
| fov      | Field of view (in degrees).                                                         | 80            |
| near     | Camera frustum near clipping plane.                                                 | 0.5           |

## Changing the Active Camera

When the `active` property is toggled, the component will notify the camera system to change the current camera used by the renderer.
