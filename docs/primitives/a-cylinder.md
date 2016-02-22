---
title: <a-cylinder>
type: primitives
layout: docs
parent_section: primitives
order: 5
---

The cylinder primitive makes it easy to add tubes and curved surfaces to a scene. It wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute           | Default Value  | Component Mapping                                                  |
| ------------------- | -------------- | ------------------------------------------------------------------ |
| color               | gray           | material.color                                                     |
| height              | 1.5            | geometry.height                                                    |
| metalness           | 0.0            | material.metalness                                                 |
| opacity             | 1.0            | material.opacity                                                   |
| open-ended          | false          | geometry.openEnded                                                 |
| radius              | 0.75           | geometry.radius                                                    |
| radius-bottom       | 0.75           | geometry.radiusBottom                                              |
| radius-top          | 0.75           | geometry.radiusTop                                                 |
| roughness           | 0.5            | material.roughness                                                 |
| segments-height     | 1              | geometry.segmentsHeight                                            |
| segments-radial     | 36             | geometry.segmentsRadial                                            |
| shader              | standard       | material.shader                                                    |
| side                | front          | material.side                                                      |
| src                 | None           | material.src                                                       |
| theta-length        | 360            | geometry.thetaLength                                               |
| theta-start         | 0              | geometry.thetaStart                                                |
| transparent         | true           | material.transparent                                               |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-cylinder.html)

## Examples

Default gray cylinder with end-caps:

```html
<a-cylinder></a-cylinder>
```

Various shapes using cylinders:

```html
<!-- A red hexagon -->
<a-cylinder position="-4 0 -3" rotation="90 -90 20" radius="2" segments-radial="8" color="red"></a-cylinder>

<!-- Pacman -->
<a-cylinder position="0 0 -3" rotation="65 45 0" radius="1" height="1" theta-start="57" theta-length="286" side="double" color="yellow"></a-cylinder>

<!-- A green pipe -->
<a-cylinder position="4 0 -3" rotation="-80 15 -20" height="5" open-ended="true" color="green"></a-cylinder>
```
