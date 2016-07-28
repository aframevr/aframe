---
title: AFRAME Globals
type: core
layout: docs
parent_section: core
order: 10
---

A-Frame exposes its public interface through the `window.AFRAME` browser
global. This same interface is also exposed if requiring with Node
(`require('aframe')`).

## `AFRAME` Properties

[componentregister]: ./component.md#write-a-component
[entity]: ./entity.md
[geometryregister]: ./geometry.md#register-a-custom-geometry
[materialregister]: ./material.md#register-a-custom-material
[primitiveregister]: ../primitives/index.md#register-a-primitive
[scene]: ./scene.md
[three.js]: http://threejs.org
[tween.js]: https://github.com/tweenjs/tween.js
[utils]: ./utils.md

| Property              | Description                                                                                    |
| ----------            | -------------                                                                                  |
| AEntity               | [Entity][entity] prototype.                                                                    |
| ANode                 | Base node prototype that A-Frame elements inherit from.                                        |
| AScene                | [Scene][scene] prototype.                                                                      |
| components            | Object of registered components.                                                               |
| geometries            | Object of registered geometries .                                                              |
| primitives.primitives | Object of registered primitives.                                                               |
| registerComponent     | Function to [register a component][componentregister].                                         |
| registerElement       | A flavor of `document.registerElement` that calls parent prototype handlers before child ones. |
| registerGeometry      | Function to [register a geometry][geometryregister].                                           |
| registerPrimitive     | Function to [register a primitive][primitiveregister].                                         |
| registerShader        | Function to [register a material][materialregister] or shader.                                 |
| schema                | Schema-related utilities.                                                                      |
| shaders               | Object of registered shaders.                                                                  |
| systems               | Object of registered systems.                                                                  |
| THREE                 | Global [three.js][three.js] object.                                                            |
| TWEEN                 | Global [tween.js][tween.js] object.                                                            |
| utils                 | A-Frame [utility modules][utils].                                                              |
| version               | Version of A-Frame build.                                                                      |

## `window` Properties

| Property                     | Description                                  |
| ----------                   | -------------                                |
| AFRAME                       | The object described above.                  |
| hasNativeWebVRImplementation | Whether the client has native WebVR support. |
