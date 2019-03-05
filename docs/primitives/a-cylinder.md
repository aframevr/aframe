---
title: <a-cylinder>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/meshPrimitives.js
---

The cylinder primitive is used to create tubes and curved surfaces.

## Examples

The cylinder primitive is versatile and can be used to create different kinds of shapes:

```html
<!-- Basic cylinder. -->
<a-cylinder color="crimson" height="3" radius="1.5"></a-cylinder>

<!-- Hexagon. -->
<a-cylinder color="cyan" segments-radial="6"></a-cylinder>

<!-- Pac-man. -->
<a-cylinder color="yellow" theta-start="50" theta-length="280" side="double"></a-cylinder>

<!-- Green pipe. -->
<a-cylinder color="green" open-ended="true"></a-cylinder>
```

In degrees, `thetaStart` defines where to start the arc and `thetaLength` defines where the arc ends. 

Also, we can create a tube by making the cylinder open-ended, which removes the top and bottom surfaces of the cylinder such that the inside is visible. Then, we need a double-sided material to render properly:

```html
<a-cylinder color="cyan" material="side: double" open-ended="true" rotation="90 0 0"></a-cylinder>
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
| height                           | geometry.height                        | 1             |
| metalness                        | material.metalness                     | 0             |
| normal-map                       | material.normalMap                     | None          |
| normal-scale                     | material.normalScale                   | 1 1           |
| normal-texture-offset            | material.normalTextureOffset           | 0 0           |
| normal-texture-repeat            | material.normalTextureRepeat           | 1 1           |
| open-ended                       | geometry.openEnded                     | false         |
| radius-bottom                    | geometry.radiusBottom                  | 1             |
| radius-top                       | geometry.radiusTop                     | 0.8           |
| repeat                           | material.repeat                        | 1 1           |
| roughness                        | material.roughness                     | 0.5           |
| segments-height                  | geometry.segmentsHeight                | 18            |
| segments-radial                  | geometry.segmentsRadial                | 36            |
| spherical-env-map                | material.sphericalEnvMap               | None          |
| src                              | material.src                           | None          |
| theta-length                     | geometry.thetaLength                   | 360           |
| theta-start                      | geometry.thetaStart                    | 0             |
| width                            | material.width                         | 512           |
| wireframe                        | material.wireframe                     | false         |
| wireframe-linewidth              | material.wireframeLinewidth            | 2             |
