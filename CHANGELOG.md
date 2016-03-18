## 0.2.0

0.2.0 strengthens the extensibility of A-Frame:

- Component API has been greatly enhanced with more lifecycle methods, schema options, and property types.
- Components can be applied to primitives (e.g., `<a-box>`).
- Custom GLSL shaders can be shared and registered to provide more visual effects.

### Major Changes

* `aframe-core` merged with `aframe`. `window.AFRAME` exposes what `aframe-core` was exposing previously (e.g., `AFRAME.registerComponent` vs.  `AFRAME.aframeCore.registerComponent`). (#368)
* `<a-assets>` must be declared within `<a-scene>`. (#910)
* `<a-entity>.object3D` is now a `THREE.Group`. Use `<a-entity>.setObject3D` API to add new 3D objects from components. (#847)
* Bumped three.js to r74 stable. (#1006)
* npm points to a prebuilt bundle of `dist/aframe.js`.
* Scene `canvas` elements are now appended to the scene by default rather than to the document body. The scene can specify the canvas to render to. (c0aa360)
* Primitives such as `<a-sphere>` directly extend `<a-entity>` rather than template them. (#883)
* `<a-template>` and HTML imports logic have been removed. (#883)
* `<a-camera>` no longer creates a cursor. Use `<a-cursor>` instead. (#883)

### Deprecations

* `loader` component deprecated in favor of `collada-model` and `obj-model`. (#913)
* `<a-model>` deprecated in favor of `<a-collada-model>` and `<a-obj-model>`. (#883)
* `<a-EVENTNAME>` elements such as `<a-mouseenter>` deprecated in favor of `<a-event name="EVENTNAME">` (unstable). (#883)
* `<a-cube>` deprecated in favor of `<a-box>`. (#883)

### Enhancements

* Introduce *shaders* to extend the material component and to register custom GLSL shaders. (#861)
* Component *property types*. Property types define how a component property is parsed and stringified. Custom property types can be registered or defined inline with the property in the schema. Built-in property types include `array`, `boolean`, `int`, `number`, `selector`, `selectorAll`, `string`, `vec2`, `vec3`, `vec4`. (d35e56e)
* *Single-property components*. A component can define itself as consisting of only one property by specifying a type and/or a default value in the schema. (d35e56e)
* *Asset management system* that blocks scene render
* *Play/pause* methods on entities and play/pause handlers on components. (9238861)
* *Tick* method on components to register a function called on each scene tick. (#823)
* Support for loading *.OBJ* and .MTL assets. (#788)
* *Texture caching* for better performance when reusing textures. (#1116)
* Components can be attached to primitives (e.g., `<a-sphere>`). (#883)
* Introduce *systems* API (unstable) to provide global scope and services for components. (#924)
* Entities, including the scene, wait for their children to load before emitting the `loaded` event. (a8a4f06)
* Entities emit `child-attach` when children are attached.
* Lot of `<a-scene>` logic moved to configurable components. (#776)
* Support for *multiple cameras* in a scene and switching between them. (#745)
* Added more events for scene VR mode, material component, model components, sound component.

## Fixes

* Stop `<a-animation>` when detached. (#727)
* Fix `<a-animation>` begin attribute. (#885)

### v0.1.2 (Februrary 18, 2016)

* Fixed Android shader bugs for devices like Motorola and OnePlus. (ceb5fa)

## v0.1.0 (December 16, 2015)

* Initial public release
