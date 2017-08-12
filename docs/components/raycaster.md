---
title: raycaster
type: components
layout: docs
parent_section: components
source_code: src/components/raycaster.js
examples: []
---

[3ray]: https://threejs.org/docs/#api/core/Raycaster
[line]: ./line.md
[wiki-raycasting]: https://en.wikipedia.org/wiki/Ray_casting

The raycaster component provides line-based intersection testing with a
[raycaster][wiki-raycasting]. Raycasting is the method of extending a line from
an origin towards a direction, and checking whether that line intersects with
other entites.

The raycaster component uses the [three.js raycaster][3ray]. The raycaster
checks for intersections at a certain interval against a list of objects, and
will emit events on the entity when it detects intersections or clearing of
intersections (i.e., when the raycaster is no longer intersecting an entity).

[cursor]: ./cursor.md
[laser-controls]: ./laser-controls.md

The [cursor component][cursor] and [laser-controls components][laser-controls]
both build on top of the raycaster component.

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

| Property            | Description                                                                                                                                           | Default Value |
| --------            | -----------                                                                                                                                           | ------------- |
| direction           | Vector3 coordinate of which direction the ray should point from relative to the entity's origin.                                                      | 0, 0, 0       |
| far                 | Maximum distance under which resulting entities are returned. Cannot be lower then `near`.                                                            | Infinity      |
| interval            | Number of milliseconds to wait in between each intersection test. Lower number is better for faster updates. Higher number is better for performance. | 100           |
| near                | Minimum distance over which resuilting entities are returned. Cannot be lower than 0.                                                                 | 0             |
| objects             | Query selector to pick which objects to test for intersection. If not specified, all entities will be tested.                                         | null          |
| origin              | Vector3 coordinate of where the ray should originate from relative to the entity's origin.                                                            | 0, 0, 0       |
| recursive           | Checks all children of objects if set. Else only checks intersections with root objects.                                                              | true          |
| showLine            | Whether or not to display the raycaster visually with the [line component][line].                                                                     | false         |
| useWorldCoordinates | Whether the raycaster origin and direction properties are specified in world coordinates.                                                             | false         |

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

## Refreshing the Target Entities of the Raycaster

The raycaster component keeps a local array of objects and entities that the
raycaster tests against for intersection. This array defaults to every 3D
object in the three.js Scene. If the `objects` property is specified, then
building this array requires running query selectors and additional filtering.
A-Frame tries not to run this process too often (via the `.refreshObjects()`
method) to save on performance.

To manually refresh the list of objects that the raycaster component tests
against, call the `.refreshObjects()` method:

```js
var raycasterEl = AFRAME.scenes[0].querySelector('[raycaster]');
raycasterEl.components.raycaster.refreshObjects();
```

A-Frame will call `.refreshObjects()` automatically when an entity is appended
or detached from the scene, but it will not get called during normal DOM
mutations (e.g., some entity changes its `class`).

## Customizing the Line

If `showLine` is set to `true`, the raycaster will configure the line given the
raycaster's `origin`, `direction`, and `far` properties. To customize the line
appearance provided by the `showLine: true` property, we configure the [line
component][line]:

```html
<a-entity raycaster="showLine: true; far: 100" line="color: orange; opacity: 0.5"></a-entity>
```

The line length is the raycaster's `far` property when the raycaster is not
intersecting any entity. By default, the `far` property defaults to 1000 meters
meaning the line drawn will be 1000 meters long. When the raycaster intersects
an object, the line will get truncated to the intersection point so it doesn't
shoot straight through.
