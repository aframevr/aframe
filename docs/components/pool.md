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
entities in dynamic scenes. Object pooling helps reduce GC pauses.

## Example

For example, we may have a game with enemy entities that we want to reuse.

```html
<a-scene pool__enemy="mixin: enemy; size : 10"></a-scene>
```

```js
var el = sceneEl.components.pool__enemy.requestEntity();
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

Request one of the available entities in the pool.

### .returnEntity (entityEl)

Relinquish an entity back to the pool.
