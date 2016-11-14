---
title: visible
type: components
layout: docs
parent_section: components
---

The visible component determines whether to render an entity.

## Example

```html
<a-entity visible="false"></a-entity>
```

## Value

| Value | Description                                                                            |
|-------|----------------------------------------------------------------------------------------|
| true  | The entity will be rendered and visible; the default value.                            |
| false | The entity will not be rendered nor visible. The entity will still exist in the scene. |

## Animating Visibility

The visible value can be "animated" to delay the visibility of an entity:

```html
<!-- Wait 1 second before showing the entity. -->
<a-entity visible="false">
  <a-animation attribute="visible" begin="1000" to="true"></a-animation>
</a-entity>
```
