---
title: <a-collada-model>
type: primitives
layout: docs
parent_section: primitives
---

The COLLADA model primitive displays a 3D COLLADA model created from a 3D
modeling program or downloaded from the web.

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

[collada]: ../components/collada-model.md

| Attribute | Component Mapping            | Default Value |
|-----------|------------------------------|---------------|
| src       | [collada-model][collada].src | null          |
