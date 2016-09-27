---
title: <a-image>
type: primitives
layout: docs
parent_section: primitives
---

The image primitive displays an image on a flat plane. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `plane`.

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
| shader          | material.shader         | standard      |
| side            | material.side           | front         |
| src             | material.src            | None          |
| transparent     | material.transparent    | false         |
| width           | geometry.width          | 1             |

## Fine-Tuning

Ensuring that the image is not distorted by stretching requires us to appropriately set the `width` and `height`.

```html
<a-image src="#logo" width="200" height="100"></a-image>
```
