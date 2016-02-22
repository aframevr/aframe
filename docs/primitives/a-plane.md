---
title: <a-plane>
type: primitives
layout: docs
parent_section: primitives
order: 9
---

The plane makes it easy to add flat surfaces to a scene. It wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute   | Default Value | Component Mapping    |
| ----------- | ------------- | -------------------- |
| color       | gray          | material.color       |
| height      | 1             | geometry.height      |
| metalness   | 0.0           | material.metalness   |
| opacity     | 1.0           | material.opacity     |
| roughness   | 0.5           | material.roughness   |
| shader      | standard      | material.shader      |
| src         | None          | material.src         |
| translate   | None          | geometry.translate   |
| transparent | None          | geometry.transparent |
| width       | 1             | material.width       |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-plane.html)

## Examples

A green plane:

```html
<a-plane rotation="0 -45 10" height="10" color="green"></a-plane>
```
