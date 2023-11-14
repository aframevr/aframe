---
title: obb-collider
type: components
layout: docs
parent_section: components
source_code: src/components/obb-collider.js
examples: []
---

[obb]: https://threejs.org/docs/#examples/en/math/OBB

Collision system using Oriented Bounding Boxes based on [`THREE.OBB`][obb].

It checks collision accross all entities with the obb-collider component. It emits events when bounding boxes start and stop intersecting.

## Example

```html
<a-entity obb-collider></a-entity>
```

Set `showColliders` to `true` on the scene to render colliders for debugging purposes:

```html
<a-scene obb-collider="showColliders: true"></a-scene>
```

## Properties

| Property         | Description                                                                            | Default Value |
|------------------|----------------------------------------------------------------------------------------|---------------|
| size             | Force collider to a specific size                                                      | 0 0 0         |
| trackedObject3D  | Variable path to the object3D used to calculate the collider. el.object3D by default   | ''            |
| minimumColliderDimension  | Minimum dimension size for the collider. Not practical if too small. e.g planes or small models   | 0.02            |
| centerModel  | Centers the model before calculating the bounding box and corresponding collider.  | false            |


## Events

| Event Name          | Description                                                                                 |
| ----------          | ------------------------------------------------------------------------------------------- |
| obbcollisionstarted | Emitted on the entities that start colliding. Event detail will contain `withEl` referencing the entity that has collided with.                            |
| obbcollisionended   | Emitted on the entities that stop colliding. Event detail will contain `withEl` referencing the entity that was colliding with                                                |

