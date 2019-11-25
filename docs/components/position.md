---
title: position
type: components
layout: docs
parent_section: components
source_code: src/components/position.js
examples: []
---

The position component places entities at certain spots in 3D space. Position
takes a coordinate value as three space-delimited numbers.

All entities inherently have the position component.

## Example

```html
<a-entity position="0 1 -1"></a-entity>
```

## Value

A-Frame uses a right-handed coordinate system where the negative Z axis extends into the screen. The table below assumes looking down the negative Z axis from the origin.

| Axis | Description                                                  | Default Value |
|------|--------------------------------------------------------------|---------------|
| x    | Negative X axis extends left. Positive X Axis extends right. | 0             |
| y    | Negative Y axis extends down. Positive Y Axis extends up.    | 0             |
| z    | Negative Z axis extends in. Positive Z Axis extends out.     | 0             |

## Relative Positioning

World-space positions of child entities inherit from parent entities. Consider this scene:

```html
<a-entity id="parent" position="1 2 3">
  <a-entity id="child1"></a-entity>
  <a-entity id="child2" position="2 3 4"></a-entity>
</a-entity>
```

The world-space position of `#child1` would be `1 2 3` as inherited by the
entity. In the local parent's space, `#child1`'s position would be `0 0 0`.

The world-space position of `#child2` would be `3 5 7`, by combining the
position with the parent entity. In the parent's local space, `#child2`'s
position would be `2 3 4`.

## Updating Position

[object3d]: https://threejs.org/docs/#api/core/Object3D
[update]: ../introduction/javascript-events-dom-apis.md#updating-a-component-with-setattribute
[vector]: https://threejs.org/docs/index.html#api/math/Vector3

For performance and ergonomics, we recommend updating position directly via the
three.js [Object3D][object3d] `.position` [Vector3][vector] versus [via
`.setAttribute`][update].

This method is easier because we have access to all the [Vector3
utilities][vector], and faster by skipping `.setAttribute` overhead and not
needing to create an object to set position:

```js
// With three.js
el.object3D.position.set(1, 2, 3);

// With .setAttribute (less recommended).
el.setAttribute('position', {x: 1, y: 2, z: 3});
```

We can also do incremental updates (which is just modifying a number) and use
[Vector3][vector] utilities:

```js
el.object3D.position.x += 1;
el.object3D.position.multiplyScalar(2);
el.object3D.position.sub(someOtherVector);
```

### Getting Position

To reflect updates done at the three.js level, A-Frame returns the actual
`Object3D.position` vector object when doing `.getAttribute('position')`.  Note
modifying the return value will modify the entity itself.

See also [reading position and rotation of the camera](./camera.md#reading-position-or-rotation-of-the-camera).

### Order of Transformations

Transformations are applied to entities in this order:

* [scale](scale.md)
* [rotation](rotation.md)
* position/translation
