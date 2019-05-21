---
title: scale
type: components
layout: docs
parent_section: components
source_code: src/components/scale.js
examples: []
---

The scale component defines a shrinking, stretching, or skewing transformation
of an entity. It takes three scaling factors for the X, Y, and Z axes.

All entities inherently have the scale component.

## Example

The example below shrinks the entity in half along the X direction, maintains
the same scale factor along the Y direction, and stretches the entity by
two-fold along the Z-direction:

```html
<a-entity scale="0.5 1 2"></a-entity>
```

## Value

If we set any of the scaling factors to 0, then A-Frame will assign instead a
negligible value.

| Axis | Description                        | Default Value |
|------|------------------------------------|---------------|
| x    | Scaling factor in the X direction. | 1             |
| y    | Scaling factor in the Y direction. | 1             |
| z    | Scaling factor in the Z direction. | 1             |

## Reflection

Scaling factors can be negative, which results in a reflection.

A notable use for this is for sky spheres. Sky spheres contain the entire scene
and have a texture mapped on the interior surface. To do this, we can reflect,
or invert, the sphere in the Z-direction.

```html
<a-entity geometry="primitive: sphere; radius: 1000"
          material="src: sky.png"
          scale="1 1 -1"></a-entity>
```

## Relative Scale

Similar to the rotation and position components, scales are applied in the
local coordinate system and multiply in nested entities.

## Updating Scale

[object3d]: https://threejs.org/docs/#api/core/Object3D
[update]: ../introduction/javascript-events-dom-apis.md#updating-a-component-with-setattribute
[vector]: https://threejs.org/docs/index.html#api/math/Vector3

For performance and ergonomics, we recommend updating scale directly via the
three.js [Object3D][object3d] `.scale` [Vector3][vector] versus [via
`.setAttribute`][update].

This method is easier because we have access to all the [Vector3
utilities][vector], and faster by skipping `.setAttribute` overhead and not
needing to create an object to set rotation:

```js
// With three.js
el.object3D.scale.set(1, 2, 3);

// With .setAttribute (not recommended).
el.setAttribute('scale', {x: 1, y: 2, z: 3});
```

Also easier to do incremental updates:

```js
el.object3D.scale.x += 1;
el.object3D.scale.multiplyScalar(2);
el.object3D.scale.sub(someOtherVector);
```

### Getting Scale

To reflect updates done at the three.js level, A-Frame returns the actual
`Object3D.scale` vector object when doing `.getAttribute('scale')`. Note
modifying the return value will modify the entity itself.

### Order of Transformations

Transformations are applied to entities in this order:

* scale
* [rotation](rotation.md)
* [position/translation](position.md)
