---
title: position
type: components
layout: docs
parent_section: components
---

The position component defines where an entity is placed in the scene's world space. It takes a coordinate value as three space-delimited numbers.

All entities inherently have the position component.

## Example

```html
<a-entity position="0 1 -1"></a-entity>
```

## Value

A-Frame uses a right-handed coordinate system where the negative Z axis extends into the screen. The table below assumes looking down the negative Z axis from the origin.

| Axis | Description                                                  | Default Value |
|------|--------------------------------------------------------------|---------------|
| x    | Negative X axis extends left. Positive X Axis extends right. | 0             |
| y    | Negative Y axis extends down. Positive Y Axis extends up.    | 0             |
| z    | Negative Z axis extends in. Positive Z Axis extends out.     | 0             |

## Relative Positioning

World-space positions of child entities are inherited from parent entities. Consider this scene:

```html
<a-entity id="parent" position="1 2 3">
  <a-entity id="child-1"></a-entity>
  <a-entity id="child-2" position="2 3 4"></a-entity>
</a-entity>
```

The world-space position of `#child1` would be `1 2 3` as inherited by the entity. In the local parent's space, `#child1`'s position would be seen as `0 0 0`.

The world-space position of `#child2` would be `3 5 7`, by combining the position with the parent entity. In the parent's local space, `#child2`'s position would be seen as `2 3 4`.
