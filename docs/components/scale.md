---
title: scale
type: components
layout: docs
parent_section: components
---

The scale component defines a shrinking, stretching, or skewing transformation of an entity. It takes three scaling factors for the X, Y, and Z axes.

All entities inherently have the scale component.

## Example

The example below shrinks the entity in half along the X direction, maintains the same scale factor along the Y direction, and stretches the entity by two-fold along the Z-direction:

```html
<a-entity scale="0.5 1 2"></a-entity>
```

## Value

A-Frame uses a right-handed coordinate system. When aligning our right hand's thumb with a positive axis, our hand will curl in the positive direction of rotation.

If any of the scaling factors are set to 0, then A-Frame will assign instead an extremely small value such that things don't break.

| Axis | Description                        | Default Value |
|------|------------------------------------|---------------|
| x    | Scaling factor in the X direction. | 1             |
| y    | Scaling factor in the Y direction. | 1             |
| z    | Scaling factor in the Z direction. | 1             |

## Reflection

Scaling factors can be negative, which results in a reflection.

A notable use for this is for sky spheres. Sky spheres contain the entire scene and have a texture mapped on the interior surface. To accomplish this, we can reflect, or invert, the sphere in the Z-direction.

```html
<a-entity geometry="primitive: sphere; radius: 1000"
          material="src: sky.png"
          scale="1 1 -1"></a-entity>
```
