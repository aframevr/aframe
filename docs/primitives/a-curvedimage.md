---
title: <a-curvedimage>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-curvedimage.js
---


The curved image primitive creates images that bend around the user. Curved
images arranged around the camera can be pleasing for legibility since each
pixel sits at the same distance from the user. They can be a better choice than
angled flat planes for complex layouts because they ensure a smooth surface
rather than a series of awkward seams between planes.

Under the hood, a curved image is a double-sided open-ended cylinder with
textures mapped to the inside of the cylinder.

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
  <a-curvedimage src="another-image.png"></a-curvedimage>
</a-scene>
```

## Attributes

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| height          | geometry.height         | 1             |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| open-ended      | geometry.openEnded      | true          |
| radius          | geometry.radius         | 2             |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-height | geometry.segmentsHeight | 18            |
| segments-radial | geometry.segmentsRadial | 48            |
| shader          | material.shader         | flat          |
| side            | material.side           | double        |
| src             | material.src            | None          |
| theta-length    | geometry.thetaLength    | 270           |
| theta-start     | geometry.thetaStart     | 0             |
| transparent     | material.transparent    | true          |

## Fine-Tuning

Ensuring that the image is not distorted by stretching requires us to carefully
set the `height`, `radius`, and `theta-length` attributes relative to the image
aspect ratio. 

According to this formula:

S = r * θ

We need to calculate `r` or `θ` for `S` to match the `height` value preserving 
the original aspect ratio of the image. In this formula, `θ` is set in radians 
and `radius` and `S` properties are set in meters.

<p align="center"><img width="350" alt="Arc formula" src="https://user-images.githubusercontent.com/21111451/46638723-e28f3800-cb27-11e8-9d6f-f8ddf5c87f62.png"></p>

In degrees, `thetaStart` defines where to start the arc and `thetaLength` defines where the arc ends. 

Once those values are fine-tuned to avoid distortion, we can use
`scale` to safely adjust the distance of the curved image relative to the user.
