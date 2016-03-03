---
title: <a-collada-model>
type: primitives
layout: docs
parent_section: primitives
order: 5
---

The COLLADA model primitive displays a 3D COLLADA model created from a 3D modeling program or downloaded from the web. It is an entity that maps the `src` attribute to the [collada-model component](../components/collada-model.html).

## Example

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree" src="tree.dae">
  </a-assets>

  <!-- Using the asset management system. -->
  <a-collada-model src="#tree"></a-collada-model>

  <!-- Defining the URL inline. Not recommended but more comfortable for web developers. -->
  <a-collada-model src="tree.dae"></a-collada-model>
</a-scene>
```

## Attribute

Note that the COLLADA model primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute | Component Mapping | Default Value |
|-----------+-------------------+---------------|
| src       | collada-model.src | null          |
