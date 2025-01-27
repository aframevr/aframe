---
title: <a-plane>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/meshPrimitives.js
---

[geometry]: ../components/geometry.md

The plane primitive creates flat surfaces using the [geometry][geometry]
component with the type set to `plane`.

## Example

```html
<a-scene>
  <a-assets>
    <img id="ground" src="ground.jpg">
  </a-assets>

  <!-- Basic plane. -->
  <a-plane color="#CCC" height="20" width="20"></a-plane>

  <!-- Textured plane parallel to ground. -->
  <a-plane src="#ground" height="100" width="100" rotation="-90 0 0"></a-plane>
</a-scene>
```

## Attributes

| Attribute                        | Component Mapping                      | Default Value |
| --------                         | -----------------                      | ------------- |
| alpha-test                       | material.alphaTest                     | 0             |
| ambient-occlusion-map            | material.ambientOcclusionMap           | None          |
| ambient-occlusion-map-intensity  | material.ambientOcclusionMapIntensity  | 1             |
| ambient-occlusion-texture-offset | material.ambientOcclusionTextureOffset | 0 0           |
| ambient-occlusion-texture-repeat | material.ambientOcclusionTextureRepeat | 1 1           |
| anisotropy                       | material.anisotropy                    | 0             |
| blending                         | material.blending                      | normal        |
| color                            | material.color                         | #FFF          |
| depth-test                       | material.depthTest                     | true          |
| depth-write                      | material.depthWrite                    | true          |
| displacement-bias                | material.displacementBias              | 0.5           |
| displacement-map                 | material.displacementMap               | None          |
| displacement-scale               | material.displacementScale             | 1             |
| displacement-texture-offset      | material.displacementTextureOffset     | 0 0           |
| displacement-texture-repeat      | material.displacementTextureRepeat     | 1 1           |
| dithering                        | material.dithering                     | true          |
| emissive                         | material.emissive                      | #000          |
| emissive-intensity               | material.emissiveIntensity             | 1             |
| env-map                          | material.envMap                        | None          |
| flat-shading                     | material.flatShading                   | false         |
| height                           | geometry.height                        | 1             |
| material-fog                     | material.fog                           | true          |
| material-visible                 | material.visible                       | true          |
| metalness                        | material.metalness                     | 0             |
| metalness-map                    | material.metalnessMap                  | None          |
| metalness-texture-offset         | material.metalnessTextureOffset        | 0 0           |
| metalness-texture-repeat         | material.metalnessTextureRepeat        | 1 1           |
| normal-map                       | material.normalMap                     | None          |
| normal-scale                     | material.normalScale                   | 1 1           |
| normal-texture-offset            | material.normalTextureOffset           | 0 0           |
| normal-texture-repeat            | material.normalTextureRepeat           | 1 1           |
| npot                             | material.npot                          | false         |
| offset                           | material.offset                        | 0 0           |
| opacity                          | material.opacity                       | 1             |
| repeat                           | material.repeat                        | 1 1           |
| roughness                        | material.roughness                     | 0.5           |
| roughness-map                    | material.roughnessMap                  | None          |
| roughness-texture-offset         | material.roughnessTextureOffset        | 0 0           |
| roughness-texture-repeat         | material.roughnessTextureRepeat        | 1 1           |
| segments-height                  | geometry.segmentsHeight                | 1             |
| segments-width                   | geometry.segmentsWidth                 | 1             |
| shader                           | material.shader                        | standard      |
| side                             | material.side                          | front         |
| spherical-env-map                | material.sphericalEnvMap               | None          |
| src                              | material.src                           | None          |
| transparent                      | material.transparent                   | false         |
| vertex-colors-enabled            | material.vertexColorsEnabled           | false         |
| width                            | geometry.width                         | 1             |
| wireframe                        | material.wireframe                     | false         |
| wireframe-linewidth              | material.wireframeLinewidth            | 2             |

## Parallelizing to the Ground

To make a plane parallel to the ground or make a plane the ground itself,
rotate it around the X-axis:

```html
<a-plane rotation="-90 0 0"></a-plane>
```
