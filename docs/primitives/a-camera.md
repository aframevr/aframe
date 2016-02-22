---
title: <a-camera>
type: primitives
layout: docs
parent_section: primitives
order: 2
---

The camera primitive makes it easy to customize the controls and viewing parameters of our scene. It wraps an entity that contains a [`camera` component](../components/), and within that a second entity for the cursor, which has [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute             | Default Value                          | Component Mapping |
|-----------------------|----------------------------------------|-------------------|
| cursor-color          | #FFF                                   |                   |
| cursor-maxdistance    | 1000                                   | cursor.maxDistance|
| cursor-offset         | 1                                      |                   |
| cursor-opacity        | 1                                      |                   |
| cursor-scale          | 1                                      |                   |
| cursor-visible        | true                                   |                   |
| far                   | 10000                                  | camera.far        |
| fov                   | 80                                     | camera.fov        |
| look-controls-enabled | true                                   | look-controls     |
| near                  | 0.5                                    | camera.near       |
| wasd-controls-enabled | true                                   | wasd-controls     |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-camera.html)

## Replacing the default scene camera

When we manually add a camera primitive to our scene, A-Frame does not create a [default scene camera](../guide/cameras-and-lights.html). This has the potential for confusion because the default scene camera is positioned at `0 1.8 4`, whereas a new instance of `<a-camera>` is positioned at `0 0 0`. This means that with the following markup, we can see a cube:

```html
<a-cube></a-cube>
```

But if we add a camera primitive and do not adjust its position...

```html
<a-camera></a-camera>
<a-cube></a-cube>
```

... the cube seems to disappear, because both the cube and camera are positioned at `0 0 0`, and the camera is therefore _inside_ the cube.

## Examples

A camera with all the defaults:

```html
<a-camera></a-camera>
```

A camera with the cursor hidden and positioned in the scene:

```html
<a-camera cursor-visible="false" position="6 1.8 23"></a-camera>
```

A camera with keyboard controls disabled and a large red cursor:

```html
<a-camera wasd-controls-enabled="false" cursor-scale="3" cursor-color="red"></a-camera>
```
