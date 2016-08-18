## 0.3.0

0.3.0 improves performance, adds support for the WebVR 1.0 API, and adds
tracked controllers (using experimental Gamepad APIs).

### Major Changes

- WebVR 1.0 API support. (#1423)
- Default camera is now positioned at `0, 1.6, 0` rather than `0, 1.8, -4`. In VR mode, the `1.6m` height offset as defined by `camera.userHeight` is removed. (#1474, #1718)
- Components no longer serialize stringified data to the DOM for performance. Introduced debug mode and flush-to-DOM methods. (#1323)
- No longer able to provide own `<canvas>` element. (#1474)
- Geometries default to be [BufferGeometry](http://threejs.org/docs/#Reference/Core/BufferGeometry)s, saving memory at the cost of being more difficult to manually manipulate. Use `geometry="buffer: false"` to disable. (#633) -- Geometry data is preserved in `geometry.metadata`. (#1557).
- Removed deprecated declarative events, loader component, and `<a-cube>`. (29446e0)
- Abstract raycasting-related properties out of the cursor component into the raycaster component. (#1196)
- Have shaders handle applying texture objects to material objects rather than material system. (2cee9eb)
- Removed geometry component's `translate` property, added a `pivot` component in `extras/`. (#1339)
- Renamed `defaultAttributes` to `defaultComponents` in `registerPrimitive` API. (#1460)
- Default lighting setup tweaked. (#1478)
- Made `sound.src` use the `src` property type. Sound URLs must now either be wrapped in `url()` or a selector to an `<audio>` element. (#1629)
- Added A-Frame Code of Conduct. (#954)
- Reduced webvr-polyfill `BUFFER_SCALE` to `1 / window.devicePixelRatio` only for iOS versions under 10 as a workaround to a Webkit bug. This will cause decrease resolutions on iPhone VR mode temporarily. It can be overridden in `window.WebVRConfig.BUFFER_SCALE`, but will cause canvas sizing issues upon entering stereo causing people to have to rotate their phones back and forth. (#1803)

### Deprecations

- Declarative Events deprecated in favor of [ngokevin/aframe-event-set-component](https://github.com/ngokevin/aframe-event-set-component). (#1634)
- `look-at` component deprecated and moved to [ngokevin/aframe-look-at-component](https://github.com/ngokevin/aframe-look-at-component). (#1447)
- `<a-model>` primitive deprecated in favor of `<a-collada-model>` and `<a-obj-model>`. (#1525)

### Enhancements

- Added `tracked-controls`, `vive-controls`, and `hand-controls` components. (#1584)
- Added API for multiple components of the same type (e.g., `sound__1`, `sound__2`). (#1596)
- Added schemas to systems. (#1589)
- `<a-asset-item>`s now truly cached and only fetched once. (#1700)
- Added better support for embedded scenes with `<a-scene embedded>`. (#1474)
- Can now enter fullscreen if headset is not connected. (#1474)
- Added `AFRAME.registerGeometry` API such that each geometry type has its own distinct schema. (#1162)
- Bumped `webvr-polyfill` to 0.9.15. (#1618)
- Dispose `THREE.Geometry` and `THREE.Material` objects when no longer in use to save memory. (#1287)
- Moved texture caching to material system. (#1315)
- Reduced default `<a-sky>`, `<a-videosphere>` segments. (#1319, #1532)
- Added geometry caching system to save memory. (#1347)
- Improved GearVR support. (#1336)
- Removed unnecessary object diffing calls. (1c924b6)
- Added geometry merging API to reduce number of draw calls for geometries that share the same material. (bd0dbcb)
- Added support for animation of color property types. (#1302)
- Added icosahedron, dodecahedron, octahedron, tetrahedron geometries. (#1413, #1493)
- Better NPM v3 support. (#1430)
- Added more properties to the raycaster component. (#1196)
- Added more properties to the sphere component. (#1454)
- Added `light.intensity`, `light.target` properties. (#1270, #1728)
- Added `camera.zoom` property. (#1453)
- Added `<a-sound>`, `<a-torus-knot>` primitives. (#1455, #1456)
- Added `componentremoved` event for entities. (#1434)
- Remove injected A-Frame favicon. (#1415)
- Added `end` attribute for animations to stop on events. (#1481)
- Added separate `delay` attribute for animations. (#1508)
- Added `material.flatShading`, `material.visible` properties. (#1503, #1690)
- Defaulted `geometry.primitive` to `box`. (#1523)
- Versioned the A-Frame documentation.
- Custom materials lifecycle methods only require to set `this.material` rather than return. (#1549)
- Added support for `<canvas>` to be a source of texture for materials. (#1567)
- Added utility functions for getting and setting properties of multi-prop components. (#1595)
- `selectorAll` property type now converts `NodeList` to `Array`. (#1642)
- Changed default stats UI background color to gray. (#1644)
- Exposed list of registered primitives. (#1643)
- Removed instances of hard-coded `<a-scene>`, done to support an independent augmented reality (AR) initiative. (#1665)
- Added cursor grabbing styles to look-controls component. (#1680)
- Added support for mixins being attached at runtime, done to support a third-party CSS syntax for components. (#1610)
- Added `<ctrl> + <alt> + i` shortcut to inject the A-Frame Inspector tool. (#1599)
- Removed a `Function.prototype.bind` call on each frame render (#1808)

## Fixes

- Fixed deep-seated prototype callback order invocation bug in `document.registerElement` wrapper. (#1689)
- Fixed look-controls component when dragging mouse off of canvas. (#1474)
- Fixed primitives not correctly merging properties with defined components. (#1324)
- Fixed being able to provide size to custom canvas. (#1322)
- Fixed merging of mapped properties and component properties for primitives. (#1332)
- Fixed not being able to disable video autoplay. (#1353)
- Fixed dynamically attached entities not playing. (#1415)
- Fixed primitives overriding defined attributes. (#1448)
- Fixed raycasting on loaded models. (#1497)
- Fixed having multiple COLLADA models in a scene. (#1511)
- Fixed components not being initialized before playing. (#1565)
- Fixed `material.repeat` not being able to be a float. (#1568)
- Fixed single-property components with a default truthy value not obeying truthiness if defined in HTML without a value. (#1631)
- Fixed spotlight angles. (#1728)

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
