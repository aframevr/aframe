---
title: pool
type: components
layout: docs
parent_section: components
source_code: src/components/scene/pool.js
examples: []
---

The pool component allows for [object
pooling](https://en.wikipedia.org/wiki/Object_pool_pattern). This gives us a
reusable pool of entities to avoid creating and destroying the same kind of
entities in dynamic scenes. Object pooling helps reduce garbage collection pauses.

Note that entities requested from the pool are paused by default and you need 
to call `.play()` in order to activate their components' tick functions.

For performance reasons, unused entities in the pool are detached from the THREE.js scene graph, which means that they are not rendered, their matrices are not updated, and they are excluded from raycasting.

## Example

For example, we may have a game with enemy entities that we want to reuse.

```html
<a-scene pool__enemy="mixin: enemy; size: 10"></a-scene>
```

```js
var el = sceneEl.components.pool__enemy.requestEntity();
el.play();
sceneEl.components.pool__enemy.returnEntity(el);
```

## Properties

| Property | Description                                                                           | Default Value |
|----------|---------------------------------------------------------------------------------------|---------------|
| container | Selector to store pooled entities. Defaults to the scene. | '' |
| dynamic  | Grow the pool automatically if more entities are requested after reaching the `size`. | false         |
| mixin    | Mixin required to initialize the entities of the pool.                                | ''            |
| size     | Number of preallocated entities in the pool.                                          | 0             |

## Methods

### .requestEntity ()

Request one of the available entities in the pool. Will return `undefined` and 
log a warning if `dynamic` is set to `false` and you have exhausted the pool.

### .returnEntity (entityEl)

Relinquish an entity back to the pool. Will log a warning if you attempt to return
an entity that did not belong to this pool.
