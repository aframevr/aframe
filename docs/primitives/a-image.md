---
title: <a-image>
type: primitives
layout: docs
parent_section: primitives
order: 10
---

The image primitive displays an image on a flat plane. It is an entity that prescribes the [geometry](../components/geometry.html) with its geometric primitive set to `plane`.

## Example

```html
<a-scene>
  <a-assets>
    <img id="my-image src="image.png">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-image src="#my-image"></a-image>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-image src="another-image.png"></a-image>
</a-scene>
```

## Attributes

Note that the image primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute | Component Mapping | Default Value |
|-----------+-------------------+---------------|
| height    | geometry.height   | 1.75          |
| width     | geometry.width    | 1.75          |

## Fine-Tuning

Ensuring that the image is not distorted by stretching requires us to approriately set the `width` and `height`.

```html
<a-image src="#logo" width="200" height="100"></a-image>
```
