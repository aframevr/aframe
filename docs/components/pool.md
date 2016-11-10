---
title: pool
type: components
layout: docs
parent_section: components
---

A pool of entities that will be reused. It avoids creating and destroying the
same kind of entities in dynamic scenes. It will help reduce GC pauses. Useful
for instance in a game where you want to reuse enemy entities.

## Example

```html
<a-scene pool="mixin: enemy; size : 10"></a-scene>
```

## Properties

| Property | Description                                                                                 | Default Value |
|----------|---------------------------------------------------------------------------------------------|---------------|
| mixin    | Mixin used to initialize the entities of the pool.                                          | ''            |
| size     | the number of preallocated entities in the pool                                             | 0             |
| dynamic  | the pool grows automatically if more entities are requested after reaching the current size | false         |
