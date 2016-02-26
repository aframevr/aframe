---
title: <a-videosphere>
type: primitives
layout: docs
parent_section: primitives
order: 13
---

The videosphere primitive makes it easy to add 360-degree videos to a scene. It is essentially a large sphere with a video texture. The primitive wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components. The [`material component`](../components/material.html) uses a video texture.

| Attribute   | Component Mapping     | Default Value |
| ---------   | -----------------     | ------------- |
| autoplay    | `<video>`.autoplay    | true          |
| crossOrigin | `<video>`.crossOrigin | anonymous     |
| height      | geometry.height       | 2             |
| loop        | `<video>`.loop        | true          |
| radius      | geometry.radius       | 5000          |
| src         | material.src          | None          |
| translate   | geometry.translate    | 0 0 0         |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-videosphere.html)

## Video format

To ensure a seamless 360 image, source videos must use an [equirectangular projection](https://en.wikipedia.org/wiki/Equirectangular_projection).


## Examples

A basic videosphere:

```html
<a-videosphere src="antarctica.mp4"><a-videosphere>
```
