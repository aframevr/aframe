---
title: <a-cubemap>
type: primitives
layout: docs
parent_section: primitives
source_code: src/core/a-cubemap.js
---

[material]: ../components/material.md#environment-maps
[probe-light]: ../components/light.md#probe
[cube-texture]: https://threejs.org/docs/#api/en/textures/CubeTexture

The cubemap primitive is used to create a [CubeTexture][cube-texture] environment map from 6 square images.

This can then be used as an [envMap](material.html#built_in_materials_envmap) in the [material component][material], or on a [probe light][probe-light].

## Example

```html
<a-scene>
  <a-assets>
    <!-- Cubemap asset -->
    <a-cubemap id="reflection">
      <img src="milkyway/px.jpg">
      <img src="milkyway/nx.jpg">
      <img src="milkyway/py.jpg">
      <img src="milkyway/ny.jpg">
      <img src="milkyway/pz.jpg">
      <img src="milkyway/nz.jpg">
    </a-cubemap>
  </a-assets>

  <!-- Sphere with reflection. -->
  <a-sphere position="0 1 -2"
            material="envMap:#reflection; metalness:1.0; roughness:0.0">
  </a-sphere>
</a-scene>
```

## Attributes

No attributes.  The cubemap is configured by creating 6 child elements beneath it.



