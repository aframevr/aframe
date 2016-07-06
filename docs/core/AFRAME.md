---
title: AFRAME Globals
type: core
layout: docs
parent_section: core
order: 10
---

A-Frame exposes its public interface through the `window.AFRAME` browser
global. This same interface is exposed if requiring with Node
(`require('aframe')`). `AFRAME` can be used to register new things and extend
AFRAME's capabilities.

## `AFRAME` Properties

| Property          | Description                                             |
| ----------        | -------------                                           |
| AEntity           | [Entity][entity] prototype.                             |
| ANode             | Base node prototype that A-Frame elements inherit from. |
| AScene            | [Scene][scene] prototype.                               |
| components        | Object of registered components.                        |
| registerComponent | Function to register a [component][component].          |
| registerPrimitive | Function to register a [primitive][primitive].          |
| registerShader    | Function to register a [shader][shader].                |
| shaders           | Object of registered shaders.                           |
| systems           | Object of registered systems.                           |
| THREE             | Global [three.js][three.js] object.                     |
| TWEEN             | Global [tween.js][tween.js] object.                     |
| utils             | A-Frame utility modules.                                |
| version           | Version of A-Frame build.                               |

## `window` Properties

| Property                     | Description                                  |
| ----------                   | -------------                                |
| AFRAME                       | The object described above.                  |
| hasNativeWebVRImplementation | Whether the client has native WebVR support. |

## `document` Properties

| Property        | Description                          |
| ----------      | -------------                        |
| registerElement | Modified `registerElement` polyfill. |

[component]: ./component.md
[entity]: ./entity.md
[primitive]: ../primitives/index.md
[scene]: ./scene.md
[shader]: ./shaders.md
[three.js]: http://threejs.org
[tween.js]: https://github.com/tweenjs/tween.js
