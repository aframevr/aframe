---
title: raycaster
type: components
layout: docs
parent_section: components
---

[3ray]: http://threejs.org/docs/#Reference/Core/Raycaster
[wiki-raycasting]: https://en.wikipedia.org/wiki/Ray_casting

The raycaster component does general intersection testing with a
[raycaster][wiki-raycasting]. Raycasting is the method of extending a line from
an origin towards a direction, and checking whether that line intersects with
other entites. The raycaster component is a wrapper on top of the [three.js
raycaster][3ray]. It checks for intersections at a certain interval against a
list of objects, and will emit events on the entity when it detects
intersections or clearing of intersections (i.e., when the raycaster is no
longer intersecting an entity).

[components-cursor]: ./cursor.md

The [cursor component][components-cursor] builds on top of the raycaster
component.

## Example

```html
<a-entity id="player" collider-check>
  <a-entity raycaster="objects: .collidable" position="0 -0.9 0" rotation="90 0 0"></a-entity>
</a-entity>
<a-entity class="collidable" geometry="primitive: box" position="1 0 0"></a-entity>
```

```js
AFRAME.registerComponent('collider-check', {
  dependencies: ['raycaster'],

  init: function () {
    this.el.addEventListener('raycaster-intersected', function () {
      console.log('Player hit something!');
    });
  }
});
```

## Properties

| Property  | Description                                                                                                   | Default Value |
| --------  | -----------                                                                                                   | ------------- |
| far       | Maximum distance under which resulting entities are returned. Cannot be lower then `near`.                    | Infinity      |
| interval  | Number of milliseconds to wait in between each intersection test. Lower number is better for faster updates. Higher number is better for performance. | 100 |
| near      | Minimum distance over which resuilting entities are returned. Cannot be lower than 0.                         | 0             |
| objects   | Query selector to pick which objects to test for intersection. If not specified, all entities will be tested. | null          |
| recursive | Checks all children of objects if set. Else only checks intersections with root objects.                      | true          |

## Events

The raycaster component is useful because of the events it emits on entities. It will emit events on both the raycasting entity and the intersected entities.

| Event Name                     | Description                                                                            |
|--------------------------------|----------------------------------------------------------------------------------------|
| raycaster-intersected          | Emitted on the intersected entity. Entity is intersecting with a raycaster. Event detail will contain `el`, the raycasting entity, and `intersection`, an object containing detailed data about the intersection.            |
| raycaster-intersected-cleared  | Emitted on the intersected entity. Entity is no longer intersecting with a raycaster. Event detail will contain `el`, the raycasting entity.  |
| raycaster-intersection         | Emitted on the raycasting entity. Raycaster is intersecting with one or more entities. Event detail will contain `els`, an array with the intersected entities, and `intersections`, an array of objects containing detailed data about the intersections. |
| raycaster-intersection-cleared | Emitted on the raycasting entity. Raycaster is no longer intersecting with an entity. Event detail will contain `el`, the formerly intersected entity.  |

## Members

| Member         | Description                                                                                                      |
|----------------|------------------------------------------------------------------------------------------------------------------|
| intersectedEls | Entities currently intersecting the raycaster.                                                                   |
| objects        | three.js objects to test for intersections. Will be `scene.children` if not `objects` property is not specified. |
| raycaster      | three.js raycaster object.                                                                                       |

## Methods

| Method         | Description                                                                                 |
|----------------|---------------------------------------------------------------------------------------------|
| refreshObjects | Refreshes the list of objects based off of the `objects` property to test for intersection. |

## Setting the Origin and Direction of the Raycaster

The raycaster has an *origin*, where its ray starts, and a *direction*, where
the ray goes.

[position]: ./position.md

The origin of the raycaster is at the raycaster entity's position. We can
change the origin of the raycaster by setting the [position
component][position] of the raycaster entity (or parent entities of the
raycaster entity).

[rotation]: ./rotation.md

The direction of the raycaster is in "front" of the raycaster entity (i.e., `0
0 -1`, on the negative Z-axis). We can change the direction of the raycaster by
setting the [rotation component][rotation] of the raycaster entity (or parent
entities of the raycaster entity).

For example, here is applying a raycaster along the length of a rotated bullet:

```html
<!-- Bullet, rotated to be parallel with the ground. -->
<a-entity id="bullet" geometry="primitive: cylinder; height: 0.1" rotation="-90 0 0">
  <!-- Raycaster, targets enemies, made to be as long as the bullet, positioned to the start of the bullet, rotated to align with the bullet. -->
  <a-entity raycaster="objects: .enemies; far: 0.1" position="0 -0.5 0" rotation="90 0 0"></a-entity>
</a-entity>
```

## Whitelisting Entities to Test for Intersection

We usually don't want to test everything in the scene for intersections (e.g.,
for collisions or for clicks). Selective intersections are good for performance
to limit the number of entities to test for intersection since intersection
testing is an operation that will run over 60 times per second.

To select or pick the entities we want to test for intersection, we can use the
`objects` property. If this property is not defined, then the raycaster will
test every object in the scene for intersection. `objects` takes a query
selector value:

```html
<a-entity raycaster="objects: .clickable" cursor></a-entity>
<a-entity class="clickable" geometry="primitive: box" position="1 0 0"></a-entity>
<a-entity class="not-clickable" geometry="primitive: sphere" position="-1 0 0"></a-entity>
```
