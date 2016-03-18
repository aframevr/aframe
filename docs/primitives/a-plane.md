---
title: <a-plane>
type: primitives
layout: docs
parent_section: primitives
order: 13
---

The plane primitive creates flat surfaces. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `plane`.

## Example

```html
<a-scene>
  <a-assets>
    <img id="ground" src="ground.jpg">
  </a-assets>

  <!-- Basic plane. -->
  <a-plane color="#CCC" height="20" width="20"></a-plane>

  <!-- Textured plane. -->
  <a-plane src="#ground" height="100" width="100"></a-plane>
</a-scene>
```

## Attributes

Note that the plane primitive inherits common [mesh attributes](./mesh-attributes.md).

| Attribute | Component Mapping | Default Value |
|-----------|-------------------|---------------|
| height    | geometry.height   | 2             |
| width     | geometry.width    | 2             |
