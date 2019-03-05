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

We prescribe that the set of objects that the raycaster tests for intersection
is explicitly defined via the `objects` selector property described below.
Raycasting is an expensive operation, and we should raycast against only
targets that need to be interactable at any given time.

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

Whenever an entity adds or removes the class `collidable`, the raycaster will
refresh its list of objects it is raycasting against.

```js
AFRAME.registerComponent('collider-check', {
  dependencies: ['raycaster'],

  init: function () {
    this.el.addEventListener('raycaster-intersection', function () {
      console.log('Player hit something!');
    });
  }
});
```

## Properties

| Property            | Description                                                                                                                                                                                                    | Default Value |
| --------            | -----------                                                                                                                                                                                                    | ------------- |
| autoRefresh         | Whether to automatically refresh raycaster's list of objects to test for intersection using mutation observers to detect added or removed entities and components.                                             | true          |
| direction           | Vector3 coordinate of which direction the ray should point from relative to the entity's origin.                                                                                                               | 0, 0, -1      |
| enabled             | Whether raycaster is actively checking for intersections.                                                                                                                                                      | true          |
| far                 | Maximum distance under which resulting entities are returned. Cannot be lower than `near`.                                                                                                                     | Infinity      |
| interval            | Number of milliseconds to wait in between each intersection test. Lower number is better for faster updates. Higher number is better for performance. Intersection tests are performed at most once per frame. | 0             |
| near                | Minimum distance over which resuilting entities are returned. Cannot be lower than 0.                                                                                                                          | 0             |
| objects             | Query selector to pick which objects to test for intersection. If not specified, all entities will be tested. Note that only objects attached via `.setObject3D` and their recursive children will be tested.                               | null          |
| origin              | Vector3 coordinate of where the ray should originate from relative to the entity's origin.                                                                                                                     | 0, 0, 0       |
| showLine            | Whether or not to display the raycaster visually with the [line component][line].                                                                                                                              | false         |
| useWorldCoordinates | Whether the raycaster origin and direction properties are specified in world coordinates.                                                                                                                      | false         |

## Events

The raycaster component is useful because of the events it emits on entities. It will emit events on both the raycasting entity and the intersected entities.

| Event Name                     | Description                                                                            |
|--------------------------------|----------------------------------------------------------------------------------------|
| raycaster-intersected          | Emitted on the intersected entity. Entity is intersecting with a raycaster. Event detail will contain `el`, the raycasting entity, and `intersection`, and `.getIntersection (el)` function which can be used to obtain current intersection data.            |
| raycaster-intersected-cleared  | Emitted on the intersected entity. Entity is no longer intersecting with a raycaster. Event detail will contain `el`, the raycasting entity.  |
| raycaster-intersection         | Emitted on the raycasting entity. Raycaster is intersecting with one or more entities. Event detail will contain `els`, an array with the intersected entities, and `intersections`, and `.getIntersection (el)` function which can be used to obtain current intersection data. |
| raycaster-intersection-cleared | Emitted on the raycasting entity. Raycaster is no longer intersecting with one or more entities. Event detail will contain `clearedEls`, an array with the formerly intersected entities.  |

### Intersection Object

[3ray]: https://threejs.org/docs/#api/core/Raycaster

The event detail contains intersection objects. They are returned straight from
[three.js `Raycaster.intersectObjects.`][3ray]:

| Property  | Description                                                 |
|-----------|-------------------------------------------------------------|
| distance  | distance between the origin of the ray and the intersection |
| point     | point of intersection, in world coordinates                 |
| face      | intersected face                                            |
| faceIndex | index of the intersected face                               |
| indices   | indices of vertices comprising the intersected face         |
| object    | the intersected object                                      |
| uv        | U,V coordinates at point of intersection                    |

## Members

| Member         | Description                                                                                                      |
|----------------|------------------------------------------------------------------------------------------------------------------|
| intersectedEls | Entities currently intersecting the raycaster.                                                                   |
| objects        | three.js objects to test for intersections. Will be `scene.children` if `objects` property is not specified. |
| raycaster      | three.js raycaster object.                                                                                       |

## Methods

| Method               | Description                                                                                                                           |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| getIntersection (el) | Given an entity, return current intersection data if any. This method is also passed into intersection event details for convenience. |
| refreshObjects       | Refreshes the list of objects based off of the `objects` property to test for intersection.                                           |

## Selecting Entities to Test for Intersection

Raycasting is a relatively expensive operation. We heavily recommend and
prescribe setting the `objects` property which will filter what entities the
raycaster is listening to for intersections.  Selective intersections are good
for performance to limit the number of entities to test for intersection since
  intersection testing is an operation that many times per second.

To select or pick the entities we want to test for intersection, we can use the
`objects` property. If this property is not defined, then the raycaster will
test every object in the scene for intersection. `objects` takes a query
selector value:

```html
<a-entity raycaster="objects: .clickable" cursor></a-entity>
<a-entity class="clickable" geometry="primitive: box" position="1 0 0"></a-entity>
<a-entity class="not-clickable" geometry="primitive: sphere" position="-1 0 0"></a-entity>
```

In that example, we can remove or add entities to the raycast list by setting
or removing the `clickable` class (`el.classList.toggle('clickable')`). Another
good way to filter is using data attributes instead of classes
(`[data-raycastable]` and `el.setAttribute('data-raycastable', '')`).

## Listening for Raycaster Intersection Data Change

When we want to listen for change to the intersection data (e.g., listen to
change of the actual point of intersection), we can use the `.getIntersection
(el)` method, which takes an entity and returns intersection data if the
raycaster is currently intersecting the entity. Below is an example component
of doing so in the tick handler:

```js
AFRAME.registerComponent('raycaster-listen', {
	init: function () {
    // Use events to figure out what raycaster is listening so we don't have to
    // hardcode the raycaster.
    this.el.addEventListener('raycaster-intersected', evt => {
      this.raycaster = evt.detail.el;
    });
    this.el.addEventListener('raycaster-intersected-cleared', evt => {
      this.raycaster = null;
    });
  },

  tick: function () {
    if (!this.raycaster) { return; }  // Not intersecting.

    let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
    if (!intersection) { return; }
    console.log(intersection.point);
  }
});

// <a-entity id="raycaster" raycaster></a-entity>
// <a-entity geometry material raycaster-listen></a-entity>
```

Now on every frame, the entity will check its intersection data and do
something with it (e.g., draw a sphere at the point of intersection).

## Manually Refreshing the Target Entities of the Raycaster

The raycaster component keeps a local array of objects and entities that the
raycaster tests against for intersection. This array defaults to every 3D
object in the three.js Scene. If the `objects` property is specified, then
building this array requires running query selectors and additional filtering.

By default with `autoRefresh` set to `true`, the raycaster component will
automatically refresh this list when it detects entities or components are
added and removed. While it is more friendly to auto-refresh, more advanced
developers may want to disable `autoRefresh` and control when the raycaster
is refreshed for performance.

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
