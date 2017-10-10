---
title: <a-torus>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/meshPrimitives.js
---

[geometry]: ../components/geometry.md

The torus primitive creates donut or tube shapes using the [geometry][geometry]
component with the type set to `torus`.

## Example

```html
<a-torus color="#43A367" arc="270" radius="5" radius-tubular="0.1"></a-torus>
```

## Attributes

| Attribute                        | Component Mapping                      | Default Value |
| --------                         | -----------------                      | ------------- |
| ambient-occlusion-map            | material.ambientOcclusionMap           | None          |
| ambient-occlusion-map-intensity  | material.ambientOcclusionMapIntensity  | 1             |
| ambient-occlusion-texture-offset | material.ambientOcclusionTextureOffset | 0 0           |
| ambient-occlusion-texture-repeat | material.ambientOcclusionTextureRepeat | 1 1           |
| arc                              | geometry.arc                           | 360           |
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
| radius-tubular                   | geometry.radiusTubular                 | 0.2           |
| repeat                           | material.repeat                        | 1 1           |
| roughness                        | material.roughness                     | 0.5           |
| segments-radial                  | geometry.segmentsRadial                | 36            |
| segments-tubular                 | geometry.segmentsTubular               | 32            |
| spherical-env-map                | material.sphericalEnvMap               | None          |
| src                              | material.src                           | None          |
| width                            | material.width                         | 512           |
| wireframe                        | material.wireframe                     | false         |
| wireframe-linewidth              | material.wireframeLinewidth            | 2             |
