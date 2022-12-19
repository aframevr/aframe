---
title: attached
type: components
layout: docs
parent_section: components
source_code: src/components/attached.js
examples: []
---

[visible]: ./visible.md
[pool]: ./pool.md

The attached component determines whether an entity is attached to the THREE.js scene graph at all.

All entities are attached by default.  Detaching an entity from the scene means that the entity and its descendants will have no interactions in the 3D scene at all: it is not rendered, it will not interact with raycasters.

This is similar to the [visible][visible] component, but places even more limitations on the entity.

Invisible entities are not rendered, but their position in space is still updated every frame, and they can interact with raycasters, be checked for collisions etc.

In contrast, when an entity is detached from the scene, by setting `attached="false"`, even these interactions do not occur, which will improve performance even further vs. just making an entity invisible.  For example, entity pools implemented by the [pool][pool] component detach entities in the pool when they are not in use.

It's a common pattern to create container entities that contain an entire group of entities that you can flip on an off with `attached`.


## Example

```html
<a-entity attached="false"></a-entity>
```

## Value

| Value | Description                                                                            |
|-------|----------------------------------------------------------------------------------------|
| true  | The entity will be rendered and visible; the default value.                            |
| false | The entity will be detached from the THREE.js scene.  It will not be rendered nor
          visible, and will not interact with anything else in the scene. |

## Updating Attachment

It is slightly faster to control attachment to the THREE.js scene using direct calls to [`attachToScene()`](../core/entity.md#attachtoscene-) and [`detachFromScene()`](../core/entity.md#detachfromscene-):

```js
// direct use of entity interface
el.detachFromScene()

// with setAttribute.
e.setAttribute('attached', false)

```

Updates at the three.js level will still be reflected when doing
`entityEl.getAttribute('attached');`.
