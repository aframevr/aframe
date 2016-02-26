---
title: <a-sky>
type: primitives
layout: docs
parent_section: primitives
order: 10
---

The sky primitive is a large textured sphere that makes it easy to add a background to a scene. It wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute       | Default Value | Component Mapping       |
| --------------- | ------------- | -----------------       |
| color           | white         | material.color          |
| radius          | 5000          | geometry.radius         |
| segments-height | 64            | geometry.segmentsHeight |
| segments-width  | 64            | geometry.segmentsWidth  |
| src             | None          | material.src            |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-sky/index.html)

## Image format

To ensure a seamless background, images must use an [equirectangular projection](https://en.wikipedia.org/wiki/Equirectangular_projection). The [Flickr Equirectangular](https://www.flickr.com/groups/equirectangular/) is one source of compatible images, or you can [search for CC-licensed images](https://www.flickr.com/search/?text=equirectangular&license=4%2C5%2C9%2C10).

## Examples

A basic sky:

```html
<a-sky src="sky.png"></a-sky>
```
