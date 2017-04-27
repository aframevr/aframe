---
title: AFRAME Globals
type: core
layout: docs
parent_section: core
order: 10
---

A-Frame exposes its public interface through the `window.AFRAME` browser
global. This same interface is also exposed if requiring with CommonJS
(`require('aframe')`).

## `AFRAME` Properties

[component]: ./component.md
[componentregister]: ./component.md#register-a-component
[entity]: ./entity.md
[geometryregister]: ../components/geometry.md#register-a-custom-geometry
[materialregister]: ../components/material.md#register-a-custom-material
[primitiveregister]: ../primitives/index.md#register-a-primitive
[scene]: ./scene.md
[three.js]: http://threejs.org
[tween.js]: https://github.com/tweenjs/tween.js
[utils]: ./utils.md

| Property              | Description                                                                                                                                                                                                                            |
| ----------            | -------------                                                                                                                                                                                                                          |
| AComponent | [Component][component] prototype.                                                                                                                                                                                                            |
| AEntity               | [Entity][entity] prototype.                                                                                                                                                                                                            |
| ANode                 | Base node prototype that A-Frame elements inherit from.                                                                                                                                                                                |
| AScene                | [Scene][scene] prototype.                                                                                                                                                                                                              |
| components            | Object of registered components.                                                                                                                                                                                                       |
| geometries            | Object of registered geometries .                                                                                                                                                                                                      |
| primitives.primitives | Object of registered primitives.                                                                                                                                                                                                       |
| registerComponent     | Function to [register a component][componentregister].                                                                                                                                                                                 |
| registerElement       | A flavor of `document.registerElement` for A-Frame nodes calls parent prototype handlers before child ones. The base class of A-Frame elements. Also see `registerPrimitive` for registering an A-Frame elements similar to `<a-box>`. |
| registerGeometry      | Function to [register a geometry][geometryregister].                                                                                                                                                                                   |
| registerPrimitive     | Function to [register a primitive][primitiveregister].                                                                                                                                                                                 |
| registerShader        | Function to [register a material][materialregister] or shader.                                                                                                                                                                         |
| schema                | Schema-related utilities.                                                                                                                                                                                                              |
| shaders               | Object of registered shaders.                                                                                                                                                                                                          |
| systems               | Object of registered systems.                                                                                                                                                                                                          |
| THREE                 | Global [three.js][three.js] object.                                                                                                                                                                                                    |
| TWEEN                 | Global [tween.js][tween.js] object.                                                                                                                                                                                                    |
| utils                 | A-Frame [utility modules][utils].                                                                                                                                                                                                      |
| version               | Version of A-Frame build.                                                                                                                                                                                                              |

## `window` Properties

| Property                     | Description                                  |
| ----------                   | -------------                                |
| AFRAME                       | The object described above.                  |
| hasNativeWebVRImplementation | Whether the client has native WebVR support. |
