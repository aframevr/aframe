---
title: rotation
type: components
layout: docs
parent_section: components
source_code: src/components/rotation.js
examples: []
---

The rotation component defines the orientation of an entity in degrees. It
takes the pitch (`x`), yaw (`y`), and roll (`z`) as three space-delimited
numbers indicating degrees of rotation.

All entities inherently have the rotation component.

## Example

```html
<a-entity rotation="45 90 180"></a-entity>
```

## Value

A-Frame uses a right-handed coordinate system. When aligning our right hand's
thumb with a positive axis, our hand will curl in the positive direction of
rotation.

| Axis | Description                       | Default Value
|------|-----------------------------------|---------------|
| x    | Pitch, rotation about the X-axis. | 0             |
| y    | Yaw, rotation about the Y-axis.   | 0             |
| z    | Roll, rotation about the Z-axis.  | 0             |

## Relative Rotation

Child entities inherit from world-space rotations from parent entities.
Consider this scene:

```html
<a-entity id="parent" rotation="0 45 0">
  <a-entity id="child1"></a-entity>
  <a-entity id="child2" rotation="15 45 30"></a-entity>
</a-entity>
```

The world-space rotation of `#child1` would be `0 45 0` as inherited by the
entity. In the local parent's space, `#child1`'s rotation would be `0 0 0`.

The world-space rotation of `#child2` would be `15 90 30`, by combining the
rotation with the parent entity. In the parent's local space, `#child2`'s
rotation would be `15 45 30`.

## Updating Rotation

[object3d]: https://threejs.org/docs/#api/core/Object3D
[euler]: https://threejs.org/docs/index.html#api/math/Euler
[update]: ../introduction/javascript-events-dom-apis.md#updating-a-component-with-setattribute

For performance and ergonomics, we recommend updating rotation directly via the
three.js [Object3D][object3d] `.rotation` [Euler][euler] (in radians) versus
[via `.setAttribute`][update].

This method is easier because we have access to all the [Euler
utilities][euler], and faster by skipping `.setAttribute` overhead and not
needing to create an object to set rotation:

```js
// With three.js
el.object3D.rotation.set(
  THREE.Math.degToRad(15),
  THREE.Math.degToRad(30),
  THREE.Math.degToRad(90)
);
el.object3D.rotation.x += Math.PI;

// With .setAttribute (less recommended).
el.setAttribute('rotation', {x: 15, y: 30, z: 90});
```

### Getting Rotation

Updates at the three.js level will still be reflected in A-Frame when doing
`entityEl.getAttribute('rotation');`. When calling `.getAttribute('rotation')`,
A-Frame will convert from radians and degrees and return a normal JavaScript
object with x/y/z properties.

See also [reading position and rotation of the camera](./camera.md#reading-position-or-rotation-of-the-camera).
