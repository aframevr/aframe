---
title: <a-obj-model>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-obj-model.js
---

> We recommend glTF for distributing assets in production over the web. Check
> out using the [glTF model primitive](a-gltf-model.md). You can
> either instead export to COLLADA and use [the
> converter](https://cesiumjs.org/convertmodel.html) or try out the [OBJ
> converter](https://github.com/AnalyticalGraphicsInc/OBJ2GLTF).

The .OBJ model primitive displays a 3D Wavefront model.

## Example

```html
<a-scene>
  <a-assets>
    <a-asset-item id="crate-obj" src="crate.obj"></a-asset-item>
    <a-asset-item id="crate-mtl" src="crate.mtl"></a-asset-item>
  </a-assets>

  <!-- Using the asset management system. -->
  <a-obj-model src="#crate-obj" mtl="#crate-mtl"></a-obj-model>

  <!-- Defining the URL inline. Not recommended but may be more comfortable. -->
  <a-obj-model src="crate.obj" mtl="crate.mtl"></a-obj-model>
</a-scene>
```

## Attribute

| Attribute | Component Mapping | Default Value |
|-----------|-------------------|---------------|
| mtl       | obj-model.mtl     | null          |
| src       | obj-model.obj     | null          |

## Troubleshooting

See [Introduction → 3D Models → Troubleshooting](../introduction/models.md#troubleshooting).
