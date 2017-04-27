---
title: <a-sphere>
type: primitives
layout: docs
parent_section: primitives
---

The sphere primitive creates a spherical or polyhedron shapes. It wraps an entity that prescribes the [geometry component](../components/geometry.md) with its geometric primitive set to `sphere`.

## Example

```html
<a-sphere color="yellow" radius="5"></a-sphere>
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
| phi-length                       | geometry.phiLength                     | 360           |
| phi-start                        | geometry.phiStart                      | 0             |
| radius                           | geometry.radius                        | 1             |
| repeat                           | material.repeat                        | 1 1           |
| roughness                        | material.roughness                     | 0.5           |
| segments-height                  | geometry.segmentsHeight                | 18            |
| segments-width                   | geometry.segmentsWidth                 | 36            |
| spherical-env-map                | material.sphericalEnvMap               | None          |
| src                              | material.src                           | None          |
| theta-length                     | geometry.thetaLength                   | 180           |
| theta-start                      | geometry.thetaStart                    | 0             |
| width                            | material.width                         | 512           |
| wireframe                        | material.wireframe                     | false         |
| wireframe-linewidth              | material.wireframeLinewidth            | 2             |
