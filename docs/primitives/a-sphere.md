---
title: <a-sphere>
type: primitives
layout: docs
parent_section: primitives
order: 11
---

The sphere primitive wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute       | Default Value | Component Mapping       |
| --------------- | ------------- | -----------------       |
| color           | gray          | material.color          |
| metalness       | 0.0           | material.metalness      |
| opacity         | 1.0           | material.opacity        |
| radius          | 0.85          | geometry.radius         |
| roughness       | 0.5           | material.roughness      |
| segments-height | 18            | geometry.segmentsHeight |
| segments-width  | 36            | geometry.segmentsWidth  |
| shader          | standard      | material.shader         |
| src             | None          | material.src            |
| translate       | 0 0 0         | geometry.translate      |
| transparent     | true          | material.transparent    |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-sphere.html)

## Image format

To ensure a seamless texture on a sphere sphere, images must use an [equirectangular projection](https://en.wikipedia.org/wiki/Equirectangular_projection).

## Examples

Yellow sphere:

```html
<a-sphere color="yellow" radius="5"></a-sphere>
```
