---
title: <a-collada-model>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-collada-model.js
---

The COLLADA model primitive displays a 3D COLLADA model created from a 3D
modeling program or downloaded from the web.

> **DEPRECATED**: The `collada-model` component is deprecated. Consider
converting models with [COLLADA2GLTF][collada2gltf] and using `gltf-model`
instead.

[collada2gltf]: https://github.com/KhronosGroup/COLLADA2glTF

## Example

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree" src="tree.dae"></a-asset-item>
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
