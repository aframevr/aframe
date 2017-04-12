---
title: <a-circle>
type: primitives
layout: docs
parent_section: primitives
---

The circle primitive creates circles surfaces using the [geometry][geometry]
component with the type set to `circle`.

## Example

```html
<a-scene>
  <a-assets>
    <img id="platform" src="platform.jpg">
  </a-assets>

  <!-- Basic circle. -->
  <a-circle color="#CCC" radius="20"></a-circle>

  <!-- Textured circle parallel to ground. -->
  <a-circle src="#platform" radius="50" rotation="-90 0 0"></a-circle>
</a-scene>
```

## Attributes

| Attribute                        | Component Mapping                      | Default Value |
| --------                         | -----------------                      | ------------- |
| ambient-occlusion-map            | material.ambientOcclusionMap           | None          |
| ambient-occlusion-map-intensity  | material.ambientOcclusionMapIntensity  | 1             |
| ambient-occlusion-texture-offset | material.ambientOcclusionTextureOffset | 0 0           |
| ambient-occlusion-texture-repeat | material.ambientOcclusionTextureRepeat | 1 1           |
| color                            | material.color                         | #FFF          |
| displacement-bias                | material.displacementBias              | 0.5           |
| displacement-map                 | material.displacementMap               | None          |
| displacement-scale               | material.displacementScale             | 1             |
| displacement-texture-offset      | material.displacementTextureOffset     | 0 0           |
| displacement-texture-repeat      | material.displacementTextureRepeat     | 1 1           |
| env-map                          | material.envMap                        | None          |
| fog                              | material.fog                           | true          |
| height                           | material.height                        | 256           |
| metalness                        | material.metalness                     | 0             |
| normal-map                       | material.normalMap                     | None          |
| normal-scale                     | material.normalScale                   | 1 1           |
| normal-texture-offset            | material.normalTextureOffset           | 0 0           |
| normal-texture-repeat            | material.normalTextureRepeat           | 1 1           |
| radius                           | geometry.radius                        | 1             |
| repeat                           | material.repeat                        | 1 1           |
| roughness                        | material.roughness                     | 0.5           |
| segments                         | geometry.segments                      | 32            |
| spherical-env-map                | material.sphericalEnvMap               | None          |
| src                              | material.src                           | None          |
| theta-length                     | geometry.thetaLength                   | 360           |
| theta-start                      | geometry.thetaStart                    | 0             |
| width                            | material.width                         | 512           |
| wireframe                        | material.wireframe                     | false         |
| wireframe-linewidth              | material.wireframeLinewidth            | 2             |

## Parallelizing to the Ground

To make a circle parallel to the ground, rotate it around the X-axis:

```html
<a-circle rotation="-90 0 0"></a-circle>
```

[geometry]: ../components/geometry.md
