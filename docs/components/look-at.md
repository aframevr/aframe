---
title: "Look-At"
type: components
layout: docs
parent_section: components
order: 7
---

The `look-at` component defines the behavior for an entity to dynamically face towards another entity or position. The `look-at` component can take either a static position or a [query selector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) to another entity.

Example applications might include having a monster stare at the player:

```html
<a-entity id="monster" geometry="primitive: box" material="src: monster.png"
          look-at="[camera]"></a-entity>

<a-entity id="player" camera></a-entity>
```

Or maybe having a dog look at a running squirrel:

```html
<a-entity id="dog" geometry="primitive: box" material="src: dog.png"
          look-at="#squirrel"></a-entity>

<a-entity id="squirrel">
  <a-animation id="running" attribute="position" to="100 0 0"></a-animation>
</a-entity>
```

Described in the table below are possible types of values:

| Value     | Description                                                        |
|-----------|---------------------------------------------------------------------
| position  | An XYZ coordinate. The entity will face towards a static position. |
| selector  | A query selector indicating another entity to track. If the other entity is moving then the `look-at` component will track the moving entity. |
