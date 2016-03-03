---
title: raycaster
type: components
layout: docs
parent_section: components
order: 14
---

The `raycaster` component provides for an entity the ability to do intersection testing with a [raycaster](https://en.wikipedia.org/wiki/Ray_casting). The raycaster component is a helper component. By itself, it does not do anything, but it can be and is used by components such as the [cursor](cursor.html) component. The raycaster component will poll for intersections with other entities and set `this.intersectedEl` to the closest intersected entity.

## Members

| Member        | Description                                      |
|---------------+--------------------------------------------------|
| intersectedEl | The entity currently intersecting the raycaster. |
| raycaster     | three.js raycaster object.                       |

## Events

| Event Name          | Description                                      |
|---------------------+--------------------------------------------------|
| intersection        | Raycaster intersecting with an entity.           |
| intersectioncleared | Raycaster no longer intersecting with an entity. |

## Using the Raycaster

To use the raycaster, we can specify the raycaster component as a dependency of another component.

```js
AFRAME.registerComponent('my-component', {
  dependencies: ['raycaster'],

  init: function () {
    this.raycaster = this.el.components.raycaster;
  }
});
```
