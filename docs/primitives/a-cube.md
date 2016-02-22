---
title: <a-cube>
type: primitives
layout: docs
parent_section: primitives
order: 3
---

The cube primitive wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute   | Default Value  | Component Mapping    |
|-------------|----------------|----------------------|
| color       | gray           | material.color       |
| depth       | 1.5            | geometry.depth       |
| height      | 1.5            | geometry.height      |
| metalness   | 0              | material.metalness   |
| opacity     | 1              | material.opacity     |
| roughness   | 0.5            | material.roughness   |
| shader      | standard       | material.shader      |
| transparent | true           | material.transparent |
| translate   | 0 0 0          | geometry.translate   |
| src         | None           | material.src         |
| width       | 1.5            | geometry.width       |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-cube.html)

## Examples

A default gray cube:

```html
<a-cube></a-cube>
```

A flattened textured cube:

```html
<a-cube rotation="0 45 0" width="8" depth="8" height="1" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Trefoil_knot_left.svg/2000px-Trefoil_knot_left.svg.png" opacity="0.5">
</a-cube>
```
