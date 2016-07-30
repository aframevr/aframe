---
title: rotation
type: components
layout: docs
parent_section: components
---

The rotation component defines the orientation of an entity. It takes the roll (`x`), pitch (`y`), and yaw (`z`) as three space-delimited numbers indicating degrees of rotation.

All entities inherently have the rotation component.

## Example

```html
<a-entity rotation="45 90 180"></a-entity>
```

## Value

A-Frame uses a right-handed coordinate system. When aligning our right hand's thumb with a positive axis, our hand will curl in the positive direction of rotation.

| Axis | Description                       | Default Value
|------|-----------------------------------|---------------|
| x    | Roll, rotation about the X-axis.  | 0             |
| y    | Pitch, rotation about the Y-axis. | 0             |
| z    | Yaw, rotation about the Z-axis.   | 0             |

## Relative Rotation

World-space rotations of child entities are inherited from parent entities. Consider this scene:

```html
<a-entity id="parent" rotation="0 45 0">
  <a-entity id="child-1"></a-entity>
  <a-entity id="child-2" rotation="15 45 30"></a-entity>
</a-entity>
```

The world-space rotation of `#child1` would be `0 45 0` as inherited by the entity. In the local parent's space, `#child1`'s rotation would be seen as `0 0 0`.

The world-space rotation of `#child2` would be `15 90 30`, by combining the rotation with the parent entity. In the parent's local space, `#child2`'s rotation would be seen as `15 45 30`.
