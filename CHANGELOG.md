## 0.3.0 Milestone

0.3.0 improves performance and adds support for the WebVR 1.0 API.

### Major Changes

- Components no longer serialize stringified data to the DOM for performance. Introduced debug mode and flush-to-DOM methods. (#1323)
- Geometries default to be [BufferGeometry](http://threejs.org/docs/#Reference/Core/BufferGeometry)s, saving memory at the cost of being more difficult to manually manipulate. Use `geometry="buffer: false"` to disable. (#633)
- Removed geometry component's `translate` property, added a `pivot` component in `extras/`. (#1339)
- Removed deprecated declarative events, `loader` component, and `<a-cube>`. (29446e0)
- Have shaders handle applying texture objects to material objects rather than material system. (2cee9eb)

### Enhancements

- Added `AFRAME.registerGeometry` API such that each geometry type has its own distinct schema. (#1162)
- Added `intensity` property for ambient type for light component. (#1270)
- Dispose `THREE.Geometry` and `THREE.Material` objects when no longer in use to save memory. (#1287)
- Moved texture caching to material system. (#1315)
- Reduced default `<a-sky>` radius. (#1319)
- Added geometry caching system to save memory. (#1347)
- Improved GearVR support. (#1336)
- Removed unnecessary object diffing calls. (1c924b6)
- Added geometry merging API to reduce number of draw calls for geometries that share the same material. (bd0dbcb)
- Added support for animation of color property types. (29446e0)
- Added icosahedron geometry. (#1413)
- Better NPM v3 support. (#1430)

## Fixes

- Fixed primitives not correctly merging properties with defined components. (#1324)
- Fixed being able to provide size to custom canvas. (#1322)
- Fixed merging of mapped properties and component properties for primitives. (#1332)
- Fixed not being able to disable video autoplay. (#1353)

## 0.2.0

0.2.0 improves extensibility:

- Component API has been greatly enhanced with more lifecycle methods, schema options, and property types.
- Components can be applied to primitives (e.g., `<a-box>`).
- Custom GLSL shaders can be shared and registered to provide more visual effects.

### Major Changes

- `aframe-core` merged with `aframe`. `window.AFRAME` exposes what `aframe-core` was exposing previously (e.g., `AFRAME.registerComponent` vs.  `AFRAME.aframeCore.registerComponent`). (#368)
- `<a-assets>` must be declared within `<a-scene>`. (#910)
- `<a-entity>.object3D` is now a `THREE.Group`. Use `<a-entity>.setObject3D` API to add new 3D objects from components. (#847)
- Bumped three.js to r74 stable. (#1006)
- npm points to a prebuilt bundle of `dist/aframe.js`.
- Scene `<canvas>` elements are now appended to the scene by default rather than to the document body. The scene can specify which `<canvas>` to render to. (c0aa360)
- Primitives such as `<a-sphere>` directly extend `<a-entity>` rather than template them. They can be registered with `AFRAME.registerPrimitive`. (#883)
- `<a-template>` and HTML Imports logic have been removed. Use https://github.com/ngokevin/aframe-template-component in the meantime. (#883)
- `<a-camera>` no longer creates a cursor on its own. Do `<a-camera><a-cursor></a-cursor></a-camera>` instead. (#883)
- Default geometry `depth`, `height`, `width` property values changed from `2` to `1`. (#1245)
- Default color of primitive elements such as `<a-box>` changed to `#FFF` to not interfere with textures. (#1245)

### Deprecations

- `loader` component deprecated in favor of `collada-model` and `obj-model`. (#913)
- `<a-model>` deprecated in favor of `<a-collada-model>` and `<a-obj-model>`. (#883)
- `<a-EVENTNAME>` elements such as `<a-mouseenter>` deprecated in favor of `<a-event name="EVENTNAME">` (unstable). (#883)
- `<a-cube>` deprecated in favor of `<a-box>`. (#883)

### Enhancements

- Introduced *shaders* to extend the material component and to register custom GLSL shaders. (#861)
- Component *property types*. Property types define how a component property is parsed and stringified. Custom property types can be registered or defined inline with the property in the schema. Built-in property types include `array`, `boolean`, `color`, `int`, `number`, `selector`, `selectorAll`, `string`, `vec2`, `vec3`, `vec4`. (d35e56e)
- *Single-property components*. A component can define itself as consisting of only one property by specifying a type and/or a default value in the schema. (d35e56e)
- *Asset management system* that blocks scene render.
- *Play/pause* methods on entities and play/pause handlers on components. (9238861)
- *Tick* method on components to register a function called on each scene tick. (#823)
- Support for loading *`.OBJ`* and `.MTL` assets. (#788)
- *Texture caching* for better performance when reusing textures. (#1116)
- Components can be attached to primitives (e.g., `<a-sphere>`). (#883)
- Introduce *systems* API (unstable) to provide global scope and services for components. They can be registered wtih `AFRAME.registerSystem`. (#924)
- Entities, including the scene, wait for their children to load before emitting the `loaded` event. (a8a4f06)
- Entities emit `child-attach` when children are attached.
- Most `<a-scene>` logic moved to configurable components and systems. (#776)
- Support for *multiple cameras* in a scene and switching between them. (#745)
- Added more events for scene VR mode, material component, model components, and sound component.
- Default geometry `segments*` property values increased for smoother meshes. (#1245)
- Added more meta tags for mobile web-app capabilities, automatically set properties to video elements for inline video playback on iOS. (#316)
- Added three.js stats to the stats component. (#1223)
- Added `<a-torus>` primitive. (#1184)

## Fixes

- Stop `<a-animation>` when detached. (#727)
- Fixed `<a-animation>` `begin` attribute. (#885)
- Keyboard shortcuts no longer trigger when used alongside modifier keys. (#1211)
- Fixed viewport issues in Twitter webview on IOS. (#1174)
- Raycaster and cursor components can now intersect with loaded models. (#1166)

### v0.1.3 (Februrary 18, 2016)

- Improved positional tracking. (#1157)

### v0.1.2 (Februrary 18, 2016)

- Fixed Android shader bugs for devices like Motorola and OnePlus. (ceb5fa)

## v0.1.0 (December 16, 2015)

- Initial public release
