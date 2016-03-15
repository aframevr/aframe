---
title: <a-curvedimage>
type: primitives
layout: docs
parent_section: primitives
order: 8
---


The curved image primitive creates images that bend around the user. Curved images arranged around the camera can be pleasing for legibility since each pixel sits at the same distance from the user. They can be a better choice than angled flat planes for complex layouts because they ensure a smooth surface rather than a series of awkward seams between planes. It is an entity that prescribes a double-sided open-ended cylinder with the [geometry component](../components/geometry.md) and rendering textures on the inside of the cylinder with the [material component](../components/material.md).

## Example

```html
<a-scene>
  <a-assets>
    <img id="my-image" src="image.png">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-curvedimage src="#my-image" height="3.0" radius="5.7" theta-length="72"
                 rotation="0 100 0" scale="0.8 0.8 0.8"></a-curvedimage>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-curvedimage src="another-image.png"></a-curved-image>
</a-scene>
```

## Attributes

Note that the curved image primitive inherits common [mesh attributes](./mesh-attributes.md).

| Attribute       | Component Mapping | Default Value           |
|-----------------|-------------------|-------------------------|
| height          | 1                 | geometry.height         |
| radius          | 2                 | geometry.radius         |
| segments-radial | 48                | geometry.segmentsRadial |
| theta-length    | 360               | geometry.thetaLength    |
| theta-start     | 0                 | geometry.thetaStart     |

## Fine-Tuning

Ensuring that the image is not distorted by stretching requires us to carefully set the `height`, `radius`, and `theta-length` attributes with respect to the image aspect ratio. Once those values are fine-tuned to avoid distortion, `scale` can then be used to safely adjust the distance of the curved image relative to the user.
