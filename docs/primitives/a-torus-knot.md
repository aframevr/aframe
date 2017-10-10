---
title: <a-torus-knot>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/meshPrimitives.js
---

[geometry]: ../components/geometry.md

The torus knot primitive creates pretzel shapes using the [geometry][geometry]
component with the type set to `torusKnot`.

## Example

```html
<a-torus-knot color="#B84A39" arc="180" p="2" q="7" radius="5" radius-tubular="0.1"></a-torus-knot>
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
| p                                | geometry.p                             | 2             |
| q                                | geometry.q                             | 3             |
| radius                           | geometry.radius                        | 1             |
| radius-tubular                   | geometry.radiusTubular                 | 0.2           |
| repeat                           | material.repeat                        | 1 1           |
| roughness                        | material.roughness                     | 0.5           |
| segments-radial                  | geometry.segmentsRadial                | 8             |
| segments-tubular                 | geometry.segmentsTubular               | 100           |
| spherical-env-map                | material.sphericalEnvMap               | None          |
| src                              | material.src                           | None          |
| width                            | material.width                         | 512           |
| wireframe                        | material.wireframe                     | false         |
| wireframe-linewidth              | material.wireframeLinewidth            | 2             |
