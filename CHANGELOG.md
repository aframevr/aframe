## dev

0.2.0 strengthens the extensibility of A-Frame. The component API has been
greatly enhanced with the introduction of single-property schemas, property
types, and more lifecycle methods. Custom shaders and systems have also been
introduced.

### Major Changes

* `aframe-core` merged with `aframe`. `window.AFRAME` exposes what `aframe-core` was exposing previously (e.g., `AFRAME.registerComponent` vs.  `AFRAME.aframeCore.registerComponent`). (#368)
* npm points to a prebuilt bundle of `dist/aframe.js`.
* Entities, including the scene, wait for their children to load before emitting the `loaded` event. (a8a4f06)
* Scene `canvas` elements are now appended to the scene by default rather than to the document body. The scene can specify the canvas to render to. (c0aa360)
* Helper primitives such as `<a-sphere>` directly extend `<a-entity>` rather than template them. (#883)
* `<a-template>` and HTML imports logic have been removed. (#883)
* `<a-camera>` no longer creates a cursor. Use `<a-cursor>` instead. (#883)

### Deprecations

* `loader` component deprecated in favor of `collada-model` and `obj-model`. (#913)
* `<a-model>` deprecated in favor of `<a-collada-model>` and `<a-obj-model>`. (#883)
* `<a-EVENTNAME>` elements such as `<a-mouseenter>` deprecated in favor of `<a-event name="EVENTNAME">`. (#883)
* `<a-cube>` deprecated in favor of `<a-box>`. (#883)
* `<a-assets>` should be declared within `<a-scene>`. (#910)

### Enhancements

* Custom shader support (#861).
* Introduce *systems* (of the entity-component-system pattern) to manage components. (#924)
* Component property types. Property types define how a component property is parsed and stringified. Custom property types can be registered or defined inline with the property in the schema. Built-in property types include `boolean`, `int`, `number`, `selector`, `string`, `vec3`. (d35e56e)
* Single-property components. A component can define itself as consisting of only one property by specifying a type and/or a default value in the schema. (d35e56e)
* Play/pause methods on entities and play/pause handlers on components. (9238861)
* Tick method on components to register a function called on each scene tick. (#823)
* Entities emit `child-attach` when children are attached.
* Lot of `<a-scene>` logic moved to more configurable components. (#776)

### v0.1.2 (Februrary 18, 2016)

* Fixed Android shader bugs for devices like Motorola and OnePlus (ceb5fa).

## v0.1.0 (December 16, 2015)

* Initial public release
