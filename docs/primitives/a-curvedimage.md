---
title: <a-curvedimage>
type: primitives
layout: docs
parent_section: primitives
order: 4
---

The curved image primitive makes it easy to create layouts that seem to bend around the user. Curved images arranged around the camera can be a pleasing choice for legibility because each pixel sits at the same distance from the user. They can also be a better choice than angled flat planes for complex layouts because they ensure a smooth surface, instead of a series of awkward seams between planes.

The curved image primitive wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute       | Default Value  | Component Mapping       |
|-----------------|----------------|-------------------------|
| height          | 1              | geometry.height         |
| opacty          | 1              | geometry.radius         |
| radius          | 2              | geometry.radius         |
| segments-radial | 48             | geometry.segmentsRadial |
| src             | None           | material.src            |
| theta-length    | 360            | geometry.thetaLength    |
| theta-start     | 0              | geometry.thetaStart     |
| transparent     | true           | material.transparent    |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-curvedimage.html)

Note that the current `<a-curvedimage>` primitive implementation is a bit difficult to work with. Ensuring that the image is not distorted by stretching requires the developer to carefully set the radius, theta-length and height in relation to the source image aspect ration. Our intent is to dramatically simplify curved images in future versions of A-Frame, so that developers can simply provide an image, a length and a radius, and get back an undistorted image, perfectly fit to the cylinder surface.

Once `radius`, `theta-length` and `height` have been set to avoid distortion, `scale` can then be used to safely adjust the distance of the curved image relative to the user, assuming both camera and curved image share the same position.


## Examples

A 1247 × 461 bitmap applied undistorted to a curved image:

```html
<a-curvedimage src="../_images/ui/2.png" radius="5.7" theta-length="72" height="3.02" rotation="0 100 0" scale="0.8 0.8 0.8"></a-curvedimage>
```
