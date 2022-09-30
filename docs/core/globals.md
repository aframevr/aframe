---
title: Globals
type: core
layout: docs
parent_section: core
order: 10
source_code: src/index.js
---

A-Frame exposes its public interface through the `window.AFRAME` browser
global. This same interface is also exposed if requiring with CommonJS
(`require('aframe')`).

## `AFRAME` Properties

[component]: ./component.md
[componentregister]: ./component.md#register-a-component
[entity]: ./entity.md
[geometryregister]: ../components/geometry.md#register-a-custom-geometry
[materialregister]: ../components/material.md#register-a-custom-shader-material
[primitiveregister]: ../introduction/html-and-primitives.md#registering-a-primitive
[scene]: ./scene.md
[three.js]: http://threejs.org
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
| utils                 | A-Frame [utility modules][utils].                                                                                                                                                                                                      |
| version               | Version of A-Frame build.                                                                                                                                                                                                              |

## `window` Properties

| Property                     | Description                                  |
| ----------                   | -------------                                |
| AFRAME                       | The object described above.                  |
| hasNativeWebVRImplementation | Whether the client has native WebVR support. |

## Requiring `AFRAME` in a Node.js Environment

It is possible to run A-Frame in [Node.js](https://nodejs.org/en/about) to get access to its globals. The only catch is we need to supply a browser `window` mock since Node.js lacks a `window` object. A-Frame is tested with [jsdom](https://github.com/jsdom/jsdom), although any JavaScript-based browser implementation should work.

```js
const jsdom = require("jsdom");
global.window = new jsdom.JSDOM().window;
var aframe = require('aframe/src');
console.log(aframe.version);
```

Although A-Frame can load in Node.js, A-Frame isn't (yet) able to run any simulations at run time.
