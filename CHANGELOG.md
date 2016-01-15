## dev

* `aframe-core` merged with `aframe`. `window.AFRAME` exposes what `aframe-core` was exposing previously (e.g., `AFRAME.registerComponent` vs.  `AFRAME.aframeCore.registerComponent`). (#368)
* npm points to pre-built bundle of `dist/aframe.js`.
* Fixed Android shader bugs. (ceb5fa9)
* Entities, including the scene, wait for their children to load before emitting the `loaded` event. (a8a4f06)
* Scene `canvas` elements are now appended to the scene by default rather than to the document body. The scene can specify the canvas to render to. (c0aa360)
* Component property types. Property types define how a component property is parsed and stringified. Custom property types can be registered or defined inline with the property in the schema. Built-in property types include `boolean`, `int`, `number`, `selector`, `string`, `vec3`. (d35e56e)
* Single-property components. A component can define itself as consisting of only one property by specifying a type and/or a default value in the schema. (d35e56e)
* Play/pause methods on entities and play/pause handlers on components. (9238861)
* Tick method on components to register a function called on each scene tick (#823).
* Entities emit `child-attach` when children are attached.

## v0.1.0 (December 16, 2015)

* Initial public release
