---
title: <a-image>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-image.js
---

The image primitive shows an image on a flat plane.

## Example

```html
<a-scene>
  <a-assets>
    <img id="my-image" src="image.png">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-image src="#my-image"></a-image>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-image src="another-image.png"></a-image>
</a-scene>
```

## Attributes

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| height          | geometry.height         | 1             |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-height | geometry.segmentsHeight | 1             |
| segments-width  | geometry.segmentsWidth  | 1             |
| shader          | material.shader         | flat          |
| side            | material.side           | front         |
| src             | material.src            | None          |
| transparent     | material.transparent    | true          |
| width           | geometry.width          | 1             |

## Fine-Tuning

Ensuring that the image is not distorted by stretching requires us to appropriately set the `width` and `height` preserving the original aspect ratio of the image. This properties are set in meters, don't confuse with pixels.

For example, a 2:1 image:

```html
<a-image src="#logo" width="3" height="1.5"></a-image>
```
