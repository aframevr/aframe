---
title: <a-video>
type: primitives
layout: docs
parent_section: primitives
order: 12
---

The video primitive makes it easy to add flat two-dimensional video screens to a scene. It wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components. The [`material component`](../components/material.html) uses a video texture.

| Attribute           | Default Value   | Component Mapping         |
| ------------------- | --------------- | ------------------------- |
| autoplay            | true            | `<video>`.autoplay        |
| crossOrigin         | anonymous       | `<video>`.crossOrigin     |
| height              | 1.75            | geometry.height           |
| loop                | true            | `<video>`.loop            |
| src                 | None            | material.src              |
| translate           | 0 0 0           | geometry.translate        |
| width               | 3               | geometry.width            |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-video.html)

## Examples

A basic video:

```html
<a-video src="penguin-sledding.mp4" width="16" height="9" position="0 0 -20"></a-video>
```
