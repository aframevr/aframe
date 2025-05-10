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

| Attribute                        | Component Mapping                      | Default Value        |
| --------                         | -----------------                      | -------------        |
| alpha-test                       | material.alphaTest                     | 0                    |
| ambient-occlusion-map            | material.ambientOcclusionMap           | None                 |
| ambient-occlusion-map-intensity  | material.ambientOcclusionMapIntensity  | 1                    |
| ambient-occlusion-texture-offset | material.ambientOcclusionTextureOffset | 0 0                  |
| ambient-occlusion-texture-repeat | material.ambientOcclusionTextureRepeat | 1 1                  |
| anisotropy                       | material.anisotropy                    | 0                    |
| blending                         | material.blending                      | normal               |
| color                            | material.color                         | #FFF                 |
| depth-test                       | material.depthTest                     | true                 |
| depth-write                      | material.depthWrite                    | true                 |
| displacement-bias                | material.displacementBias              | 0.5                  |
| displacement-map                 | material.displacementMap               | None                 |
| displacement-scale               | material.displacementScale             | 1                    |
| displacement-texture-offset      | material.displacementTextureOffset     | 0 0                  |
| displacement-texture-repeat      | material.displacementTextureRepeat     | 1 1                  |
| dithering                        | material.dithering                     | true                 |
| emissive                         | material.emissive                      | #000                 |
| emissive-intensity               | material.emissiveIntensity             | 1                    |
| env-map                          | material.envMap                        | None                 |
| flat-shading                     | material.flatShading                   | false                |
| height                           | geometry.height                        | 1                    |
| mag-filter                       | material.magFilter                     | linear               |
| material-fog                     | material.fog                           | true                 |
| material-visible                 | material.visible                       | true                 |
| metalness                        | material.metalness                     | 0                    |
| metalness-map                    | material.metalnessMap                  | None                 |
| metalness-texture-offset         | material.metalnessTextureOffset        | 0 0                  |
| metalness-texture-repeat         | material.metalnessTextureRepeat        | 1 1                  |
| min-filter                       | material.minFilter                     | linear-mipmap-linear |
| normal-map                       | material.normalMap                     | None                 |
| normal-scale                     | material.normalScale                   | 1 1                  |
| normal-texture-offset            | material.normalTextureOffset           | 0 0                  |
| normal-texture-repeat            | material.normalTextureRepeat           | 1 1                  |
| offset                           | material.offset                        | 0 0                  |
| opacity                          | material.opacity                       | 1                    |
| open-ended                       | geometry.openEnded                     | false                |
| radius                           | geometry.radius                        | 1                    |
| repeat                           | material.repeat                        | 1 1                  |
| roughness                        | material.roughness                     | 0.5                  |
| roughness-map                    | material.roughnessMap                  | None                 |
| roughness-texture-offset         | material.roughnessTextureOffset        | 0 0                  |
| roughness-texture-repeat         | material.roughnessTextureRepeat        | 1 1                  |
| segments-height                  | geometry.segmentsHeight                | 18                   |
| segments-radial                  | geometry.segmentsRadial                | 36                   |
| shader                           | material.shader                        | standard             |
| side                             | material.side                          | front                |
| spherical-env-map                | material.sphericalEnvMap               | None                 |
| src                              | material.src                           | None                 |
| theta-length                     | geometry.thetaLength                   | 360                  |
| theta-start                      | geometry.thetaStart                    | 0                    |
| transparent                      | material.transparent                   | false                |
| vertex-colors-enabled            | material.vertexColorsEnabled           | false                |
| wireframe                        | material.wireframe                     | false                |
| wireframe-linewidth              | material.wireframeLinewidth            | 2                    |
