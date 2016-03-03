---
title: <a-obj-model>
type: primitives
layout: docs
parent_section: primitives
order: 12
---

The .OBJ model primitive displays a 3D Wavefront model. It is an entity that maps the `src` and `mtl` attributes to the [obj-model component's](../components/collada-model.html) `obj` and `mtl` properties respectively.

## Example

```html
<a-scene>
  <a-assets>
    <a-asset-item id="crate-obj" src="crate.obj">
    <a-asset-item id="crate-mtl" src="crate.mtl">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-obj-model src="#crate-obj" mtl="#crate-mtl"></a-collada-model>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-obj-model src="crate.obj" mtl="crate.mtl"></a-collada-model>
</a-scene>
```

## Attribute

Note that the .OBJ model primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute | Component Mapping | Default Value |
|-----------+-------------------+---------------|
| mtl       | obj-model.mtl     | null          |
| src       | obj-model.obj     | null          |
