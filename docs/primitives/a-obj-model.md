---
title: <a-obj-model>
type: primitives
layout: docs
parent_section: primitives
---

> glTF is recommended for distributing assets in production over the web. Check out using the [glTF component](https://github.com/xirvr/aframe-gltf). You can either instead export to COLLADA and use [the converter](https://cesiumjs.org/convertmodel.html) or try out the [OBJ converter](https://github.com/AnalyticalGraphicsInc/OBJ2GLTF).

The .OBJ model primitive displays a 3D Wavefront model. It is an entity that maps the `src` and `mtl` attributes to the [obj-model component's][objcomponent] `obj` and `mtl` properties respectively.

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

If you don't see your model, try scaling it down. OBJ models generally have extremely large scales in comparison to A-Frame's scale.

[mesh]: ./mesh-attributes.md
[objcomponent]: ../components/obj-model.md
