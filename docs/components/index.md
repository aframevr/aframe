---
title: Camera
section_title: Components
type: components
layout: docs
parent_section: docs
order: 1
section_order: 4
---

The `camera` component defines from which perspective the user views the scene. It is often paired with control-related components, such as user input which moves and rotates the camera. Note that is recommended to wrap entities with the `camera` component within another entity. This allows a clean abstraction where we are free to modify the position or rotation of the parent entity.

```html
<a-entity position="0 1.8 5">
  <a-entity camera look-controls wasd-controls></a-entity>
</a-entity>
```

| Property  | Description                                                                          | Default Value  |
|-----------|--------------------------------------------------------------------------------------|----------------|
| far       | Camera frustum far clipping plane.                                                   | 10000          |
| fov       | Field of view (in degrees).                                                          | 80             |
| near      | Camera frustum near clipping plane.                                                  | 0.5            |
