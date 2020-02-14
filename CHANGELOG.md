### 1.0.4 (Feb 5, 2020)

Bug fixes

### Fixes

* Reset `referenceSpace` and controllers list when entering / exiting VR (#4406) @AG-LucidWeb @Artyom17 @dmarcos
* Fix WebXR buttons mapping for Oculus Go controller @dmarcos
* Properly remove `selectstart` / `selectend` event listeners when XR session ends @DougReeder
* Apply handedness orientation directly to the hands model (#4388) @dbradleyfl @dala00 @dmarcos
* Set tracked-controls `armModel` default to false (#4405) @dmarcos
* Set camera entity `matrixAutoupdate` to false only for the WebXR case (#4383) @liewol @dmarcos
* Check if headset is connected when ignoring `mousedown` events (#4380) @AG-LucidWeb @dmarcos
* Get rid of invalid character in TRHEE build (#4428) @kennardconsulting @dmarcos

### Enhancements

* Add dithering property in materials component (#4433) @Firepal
* Add Magic Leap Controller Support @atarng-magicleap
* New high poly, low poly and toon styles for `hand-controls` @arturitu
* Listens to WebXR `selectstart` / `selectstart` and reemits as mousedown / mouseup. Simple screen input for AR experiences (fix #4407) @dmarcos
* Use full hash in dependencies to comply with pnpm @pleku
* Add color property to `hand-controls` @arturitu
* Docs improvements @d2s @ChicagoDev @dirkk0 @omgitsraven @dmarcos
* Add API to set WebXR far and near camera planes (#4387) @DougReeder


### 1.0.3 (Dec 30, 2019)

Bug fixes

### Fixes

* Add support for Gear VR controller over WebXR (@Artyom17, @dmarcos)
* Add support for Oculus Go controller over WebXR (@Artyom17, @arpu, @dmarcos)
* Fallback to a generic controller when a WebXR gamepad is not recognized (#4376) (@Artyom17, @dmarcos)
* Match physical and virtual position of Quest and Rift S controllers (fix #4374) (@Artyom17, @dmarcos)
* Consider initial device orientation for magic window tracking. Fix problem when experience loads in landscape orientation on Android devices (@dmarcos)
* Listen to DOMContentLoaded if scene is not defined before updating the enter VR UI (#4373) (@mkungla, @dmarcos)

### 1.0.2 (Dec 23, 2019)

Bug fixes

### Fixes

* Track DeviceMotionControls yaw delta instead of absolute value to honor initial camera orientation (fix #4368) (@dmarcos)
* Disable touchmove / mousemove tracking in VR mode. Pose is preserved when exiting VR (@dmarcos)
* Hide Device Motion permission dialog on desktop requests from mobile devices. Only the alert about requesting mobile page is shown (fix #4369) (@dmarcos)
* Reset camera rotation to 0 when entering VR to prevent collision between magic window and WebXR poses (fix #4371) (@karanganesan, @dmarcos)
* Check if headset is connected before disabling mouse controls (fix #4370) (@KrisMerckx, @dmarcos)

### 1.0.1 (Dec 20, 2019)

Post 1.0.0 release bug fixes.

### Fixes

* Reintroduce a-asset-item logic to assign response type to `glTF` models automatically. It now ignores query parameters that made it fail before. (#4219) (@dmarcos)
* Prevent zoom on enter `VR / AR buttons` when double tapping on touch screens (@dmarcos)
* Apply style to reset the enter `AR / VR buttons` background on mouseleave. CSS Hover is sticky on mobile devices (@dmarcos)
* Fix `magic window mode` in Daydream / ARCore Android devices. Use DeviceOrientationControls for tracking. (#4355) (@mako-lw, @dmarcos)
* Honor model property in `laser-controls` (#4354) (@dala00, @dmarcos)
* Reduce `video-sphere / photo-sphere` radius to prevent far plane clipping in VR mode on Android devices (#4365) (@AntoineLucidWeb, @dmarcos)

### Enhancements

* Improve visual design of `modal dialogs` (#4359) (@thedart76, @dmarcos)
* Reinstate `WebXR` as the default code path for Oculus Browser. Oculus Browser 7.1 now ships the gamepad module (#4360) (@dmarcos)
* Show `alert dialog` if the site is served over HTTP (#4357) (@brendanciccone, @thedart76, @mkungla, @dmarcos)
* Improve text of desktop mode in mobile device `dialog`. Change Ok button text to Close (@dmarcos)

## 1.0.0 (Dec 13, 2019)

WebXR final spec support!

[Subscribe to the newsletter](https://aframe.io/subscribe/) for continuing updates.

### Major Changes
- `WebXR` spec support (@klausw, @Artyom17, @dmarcos)
- Support `WebXR gamepads` module (#4322) (@dmarcos, @arpu)
    - HTC Vive (@dmarcos)
    - Daydream (@arpu)
    - Oculus Rift (@DigiTec, @dmarcos)
    - Oculus Rift S (@DigiTec, @dmarcos)
     - Oculus Go (@arpu)
     - Oculus Quest (@dmarcos, @Knochi)
     - Microsoft Mixed Reality (@arpu)
     - Vive Focus (@IvoJager, @dmarcos)
- Support  experimental `WebXR AR` mode (#4281) (@klausw)
- New enter VR and AR icons (#4326) (@klausw, @brendanciccone, @ngokevin, @thedart76 and all members of the community that provided feedback)
- `Quest` controller support (#4073) (@DigiTec, @dmarcos)
- Set `72Hz mode` by default on Oculus Browser for Quest (#4232) (@dmarcos)
- Fallback to WebVR on Oculus Browser until WebXR gamepad module ships (#4342) (@dmarcos)
- Permission dialog to request access to `DeviceOrientation` events due to iOS 13 new policy (#4303) (@KevinEverywhere, @dmarcos)
- Update to THREE r111

### Fixes
- Fix resolution drop on exiting VR mode (#4246) (@tomegz)
- Don't emit synthetic `vrdisplaypresentchange` event unless there's native WebVR implementation (#4301)  (@dmarcos)
- Set `xrSession` to undefined after exiting VR mode (#4321) (@klausw, @dmarcos)
- Emit cursor `mouseup` if `mousedown` if it's only originated on scene (#4249) (@edsilv, @dmarcos)
- Fix `IE 11` fullscreen mode (#4243) (@AlexandraWins)
- Bump `animejs` fork to fix flattenArray (#4158) (@ngokevin)
- Replace undefined check to prevent ReferenceError in `JavaScriptCore` (#4318) (@nuel, @dmarcos)
- Fix component.events singleton, events being overridden by components of the same type (#4250) (@ngokevin)
- Honor `embedded mode` on loading screen (#4245) (@dmarcos)
- Fix incorrect response type inference for glb/gltf files (#4219) (@Ely-S)
- Fix WebVR deep-linking / navigation (#4199) (@Artyom17)
- Restore render target to canvas to prevent freezes (@dmarcos)
- Adjust `three-bmfont-text` to THREE r111 API changes (#4331) (@dmarcos)
- Don't consider Firefox Reality and Oculus Browser mobile / phone browsers (#4338) (@dmarcos)
- `DracoLoader` Path set for THREE v108 (#4272) (@arpu)
- Use glTF header to determine a-asset-item response type (#4228) (@Ely-S)
- Remove `setTimeout` call in tick if not raycaster.showLine (#4192) (@ngokevin)
- isMobileVR differentiates Samsung Internet for Gear VR from Samsung Internet for Android (#4188) (@DougReeder)
- Apply handedness to Oculus Go controller (#4162) (@dmarcos)
- Fix button mapping for Vive Focus (fix #4344) (@dmarcos, @IvoJager)
### Deprecations
- Deprecate `checkHasPositionalTracking` (#4255) (@dirkk0)

## 0.9.2 (May 6, 2019)

Follow-up fix to 0.9.1 for fixing `vrdisplayactivate` and link traversal flow.

### Fixes

- Move `vrdisplayactivate` handler back earlier to fix auto entering VR in many cases (#4155).
- Fix `vrdisplayactivate` and link traversal due to last build having outdated version our three.js fork.
- Fix `Entity.destroy` not catching if entity is not attached to scenegraph (#4140).
- Fix exiting fullscreen on Chrome m71+ (#4136).
- Fix URL bar not hiding in iOS Safari in fullscreen (#4146).
- Fix wrong sized canvas in iOS VR by preventing multiple `requestPresent` calls if already presenting (#4148).

## 0.9.1 (April 17, 2019)

Follow-up fixes and improvements to 0.9.0.

Released Hot Module Replacement loader for A-Frame: https://github.com/supermedium/aframe-super-hot-loader

### Major Changes

- Detaching entity from scene will preserve component data. Add
  `Entity.destroy()` method to clear components and return their memory to the
  pool (#4121).
- Use controller index to determine left / right controllers which may impact
  cases like Vive Trackers. Will look to make this more robust soon (#4013).

### Deprecations

- Deprecate `utils.device.isOculusGo` in favor of `utils.device.isMobileVR` (#4032).

### Fixes

- Updated documentation guides for 0.9.0.
- Fix text antialiasing from distance (#4039).
- Improve `vrdisplayactivate` path for more robust navigation (#4093, 3c2f68e).
- Clean up object requested from pool by component to prevent pollution of old keys from other schemas (#4016).
- Fix initial camera position, rotation, scale potentially not getting applied (#4020).
- Fix `utils.coordinates.stringify` for zeroed vectors (#4017).
- Handle if both WebVR and both WebXR APIs are available (#4022).
- Handle null device from WebXR (#4030).
- Catch `navigator.xr.requestDevice` error (#4035).
- Fix animation for custom vec3 properties (#4051).
- Fix sound `onEnded` not setting `isPlaying` to false (#4061, #4097, #4101).
- Fix new materials not getting applied to `obj-model` recursively (#4062).
- Fix boolean values in `.flushToDOM` (#4069).
- Hide navigation buttons on Android (#4090).
- Fix Chrome gamepads by checking `getGamepads` on every tick for Chrome (#4116).

### Enhancements

- Add `Component.events` API to define event handlers that are automatically attached and detached depending on entity lifecycle (#4114).
- Improve animation error message when passing invalid `animation.property` (#4122).
- Have `Entity.remove` detach entity to match HTML element behavior (#4082).
- Migrate `hand-controls` model to glTF (#3932).
- Add `shadow.enabled` property to shadow system (#4040).
- Add `renderer.alpha` property to renderer system (#4040).
- Add `AFRAME.coreComponents` for a list of the core components (#4064).

### Performance

- Use a fork of anime.js that has memory improvements from Kevin (#4028).

## 0.9.0 (February 7, 2019)

Performance improvements, WebXR support, Inspector updates!

We continued to battle test A-Frame to produce native-like VR experiences and
continue to add large performance gains.  We have also introduced initial WebXR
support! Although the spec is heavily in flux and yet to have feature parity
with WebVR 1.1, we had A-Frame get a head start to help test it out and smooth
out the changes.

### Major Changes

- Bump to three.js r101 on a branch with a few extra patches for WebXR support (f9f314).
- WebXR support (#3875).
- Remove `<a-animation>` in favor of new animation component (#3678).
- Remove `collada-model` component (#3866).
- Add `renderer.colorManagement` property (disabled by default) to accurately match colors against modeling tools, but may changes in scene colors when flipped on. `renderer.gammaFactor` will be set to 2.2. Call `scene.renderer.systems.applyColorCorrection` on `THREE.Color`s and `THREE.Texture`s to normalize changes (#3757).
- Have raycasters only intersect against objects defined via `.setObject3D`. `raycaster.objects` should be specified (e.g., `objects: [data-raycastable] or objects: .raycastable`) because raycasting is expensive. `raycaster.recursive` property removed (#3980) but will default to be recursive only under objects defined via `.setObject3D` (#3652).
- Add `renderer` component (#3757).
- `antialias` attribute moved to `renderer.antialias`.
- Raycaster events such as `raycaster-intersected` no longer directly contain intersection data. Use `.getIntersection` function supplied in event detail or `el.components.raycaster.getIntersection(el)` to retrieve intersection data. Done to reduce garbage (a87e3b).
- Disable link portal appearance by default (`link.visualAspectEnabled`), link component defaults to purely to listening to an event to trigger navigation (#3743).

### Fixes

- Frame-independent easing for `wasd-controls` to prevent judders during framedrops (#3830).
- Enable matrix auto updates for `tracked-controls` to fix children of camera and controllers not following parent (#3867).
- Fix removing mixins not removing components (#3982).
- Fix timing issues with mixins on still-initializing entities (#3859).
- setPoseTarget to underlying object3D to fix issues with entities as child of camera (#3820).
- Don't disable `matrixAutoUpdate` for tracked-controls outside VR (643fdc).
- Render spectator view after VR submit frame (#3577).
- Fix mouse cursor events not being re-enabled on resume (#3904).
- Allow components to write to camera Z rotation when look-controls enabled (9a78a)
- Clear raycaster intersections when toggling disabled (#3594).
- Postpone renderer until scene is appended to DOM (#3574).
- Fix canvas textures (b47f20).
- Fix faces and vertices numbers on stats panel (#3573).
- Fix magic window mode on Chrome (aaa3bf).
- Fix audio asset preloading (2a899c).
- Fix raycaster flatten to only include objects part of `el.object3DMap` versus arbitrary children (8809e7).
- Fix canvas getting squished on orientation change on mobile (64ed3d).
- Update position, rotation, scale components when calling `.setAttribute` on them (#3738).
- Update canvas bounds for mouse cursor on renderer resize (a4cf08).
- Fix controller reconnecting on Oculus Go and GearVR (dc8662).
- Fix playing sound on event with `sound.on` (#3844).
- Fix Chrome WebView (#3852).
- Fix raycaster not grabbing all entities when `raycaster.objects` is not set. But you should always set it (#3840).
- Fix WebVR polyfill buffer scale override (#3863).
- Fix text when used with other geometry types (#3909).
- Fix `daydream-controls` trigger not working with cursor by default (#3916).
- Fix accessing Inspector in pointer lock mode (#3947).
- Fix mouse cursor not emitting click when fuse is set (#4000).
- Fix screenshots (#3998).
- Fix camera offset getting applied when entering 2D fullscreen (#3902).

### Enhancements

- Add `oculus-go-controls`, thanks Oculus! (cbbe75)
- Add `vive-focus-controls` (#3876).
- Add `loading-screen` component (#3760).
- Add `?inspector={selector}` and `Entity.inspect()` to automatically launch Inspector and focus on entity (#3894).
- Add `renderer.highRefreshRate` to enable 72hz mode on Oculus Browser (#3967).
- Add `tracked-controls.autoHide` property to configure whether controllers automatically hide when connected or disconnected (#3912).
- Enable multiple raycasters on an entity (fc18cd).
- Support custom enter VR buttons through vr-mode-ui (#3606).
- Add `material.blending` property (#3543).
- Add `light.shadowRadius` property (21b38).
- Add ability to cap canvas size to pixel value (92b2f9).
- Reduce npm bundle (53f58f).
- Allow double underscores in component IDs (e.g., `animation__foo__bar`) (030023).
- Add `renderer.logarithmicDepthBuffer` option (d210a2).
- Add `look-controls.reverseTouchDrag` property (#3761).
- Switch to jsdelivr with rawgit going away.
- Support preprocessing of sound in `sound.playSound()` (2b2819).
- Consolidate fullscreen styles under single CSS class (`html.a-fullscreen`) (#3828).
- Emit `displayconnected` event when headset connected (#3918).
- Enable antialias by default on Oculus Go (#3942).
- Update to webvr-polyfill v0.10.10 (#3993).

### Performance

- Large refactor of core component update path, reducing memory allocation and using object pooling (#3772).
- Skip `buildData` if updating component directly. 2x speed boost on `.setAttribute` (#3835).
- Remove spamming `navigator.getGamepad` calls in tracked-controls (#3816).
- Optimize coordinates / vector utilities (#3908).
- Remove object allocation in `.setAttribute(component, propertyName, value)` (#3812).
- Simplify text shader hacks and make text alpha look prettier (#3557).
- Remove garbage and bubbling from tracked-controls (#3589).
- Remove redundant matrix world update in raycaster (ae7eba).
- Replace Oculus OBJ model with a glTF one (#3539).
- Optimize coordinate parse (bf66ba).
- Simply wasd-controls tick (#3763).
- Optimize text component (#3768).
- Remove memory allocations in material code (#3789).
- Remove garbage in sound component (2b2819).
- Improve grabbing class cursor performance in 2D look-controls (#3790).
- Remove unused and redundant mixin observers (#3831).
- Add warning to developers to specify `raycaster.objects` (#3839).
- Cache asset property type regex (#3854).

### Inspector

Kevin spent some time getting the Inspector into ship shape.

#### Major Changes

[A-Frame Watcher]: https://supermedium.com/aframe-watcher/

- Introducing the [A-Frame Watcher] to sync updates of entities with IDs from Inspector to HTML files.
- Remove HTML exporter.
- Remove old A-Frame Registry code.
- Remove broken Uploadcare uploader.
- Remove motion capture tools.

#### Enhancements

- Orthographic cameras.
- Improve raycasting to picking entities.
- Syntax highlighting of entities.
- Highlight and describe entities on viewport bar when hovering.
- Added `?inspector={selector}` to automatically launch Inspector and focus on entity.
- Show bounding box of selected entities.
- Show with icon what entities contain text in scenegraph.
- Sort component properties alphabetically.
- Display class names on entity panel.
- Only show camera and light helpers when respective entity is selected.
- Improve position when focusing on entity.
- Polish components panel.
- Center editor controls to the scene camera position.
- Support arrow keys for number widgets.
- .glb export.
- Add `o` shortcut to toggle transform widget.
- Add `esc` shortcut to unselect entity.
- Refactor most everything (modularize, data flow, Stylus, Prettier).
- Tweak grid colors.
- Bigger checkboxes.
- Fix color picker in components panel.
- Fix display of mixins.

#### Performance

- Don't load 50 images when opening the Inspector.
- Optimize and fix helpers for position, rotation, scale.
- Speed up scene graph search.
- Remove global mutation observer.

## 0.8.2 (April 15, 2018)

Bug fixes after 0.8.0 release.

### Bug Fixes

- Place touch model to match real physical position of the controller. Apply correctly the pivot offset for Oculus Touch Controls. (#3537)
- Remove unused rotationOffset attribute in favor of orientationOffset. (#3537)
- Use both touchpad and trigger events in laser-controls to fire click events on GearVR. (#3530) (fix #3519)
4879f0601 Fix reverse mouse drag for look-controls. (#3482) (fix #3459)
- Use most recent intersection from raycaster when entity is intersected. (#3475) (fix #3467, #3485, #3445)
- Fix minification issues due to ES6 features. Use forEach instead of for...of (#3495) (fix #3449)
- Stop click event from propagation in vr-mode-ui. Prevent taps on the screen to propagate to the scene on Cardboard v2. (#3527)
- Init position/rotation/scale first if defined on the entity (#3517) (fix #3516)
- Change default value of vec4 component property type to match THREE.Vector4 default value.
- Deprecate antialias component in favor of renderer component. (#3424)
- Fix post processing. Use scene.onAfterRender() for tock. (#3468)
- Fix ignored controller events if several button preses happen on same tick. (#3472)
- Fix animations triggered by state change. (#3470) (fix #3436)
- Delay setting pose target for VRManager until camera is ready to prevent vrdisplayactivate trigger vr mode prematurely. (#3448)
- Fix video sphere not rendering due to missing back material flag. (fix #3444)
- Fixes pointerlock mode camera movement jank. (#3434)

### Performance

- Remove default components to 4 component initializations per entity. (#3490)
- Save one array initialization per tick and raycaster. (#3438) (fix #3437)
- Use Object3D directly to save/restore pose in look-controls skipping radToDeg. (#3439)

### Enhancements

- Add component to a-scene to configure renderer. (#3424) (fix #666)
- Add component reference to sound-loaded and sound-ended (#3514) (fix #3505)
- Improve testing coverage for controllers (#3474)

## 0.8.0 (March 9, 2018)

Performance improvements.

### Major Changes

- Updated to three.js r90.
- Ability to update three.js Object3D position, rotation, scale, and visible directly while being in sync with A-Frame. (#3245)
- Bubble `object3dset` and `object3dremove` events no longer bubble. (#3220)
- Raycaster intersection and cleared events now emitted once per event, not on every frame. (#3126)
- Remove VREffect / VRControls for three.js WebGLRenderer API. VR camera pose is managed by three.js. (#3152, #3327)
- Removed geometry.mergeTo. (#3191)
- Removed state mixins. addState and removeState event detail modified to be the state name, not object. (#3171)
- Removed Scene.reload() (#2239)

### Deprecations

- Entity.getOrCreateObject3D. (#3222)

### Fixes

- Clone object type properties into oldData to fix update method not called on referenced objects. (#3409)
- Fix matrix composition when updating pose for controllers. (#3407)
- Fix component update getting overridden by mixin due to not passing in the whole attrValue into buildData. (#3302)
- Remove a-canvas z-index. (#3391)
- Fix parameters passed to the onButtonEvent function for Windows MR. (#3372)
- Fix black texture issue with a-sky and a-videosphere components with three r89. (#3370)
- Fix material array handling in shadow component. (#3348)
- Postpone the resize operation in iOS to ensure that the window size matches the viewport on orientation changes. (fix #3282) (#3306)
- Fix utils.entity.getComponentPropertyPath if defaultLightsEnabled not defined
- Look-controls don't read HMD position if no headset connected. (#3286)
- Fix raycaster direction. (#3239)
- Fix raycaster line update that wasn't triggered anymore. (#3124)
- Fix data from dom not parsed if skipTypeChecking. (#3153)
- Clone default array property type. (#3095)
- Fix Gear VR buttons highlighting. (#3103)
- Do not resize the canvas while presenting on mobile (#3080)
- Flipped the sign on sampleUV.x in the portal shader used by the link component (#3079)

### Enhancements

- Add spectator camera mode and spectator scene component. (#3280)
- Support Pointer Lock API. (#3341)
- Allow mixin composition. (#3305)
- Add a background component for better performant plain color backgrounds than `<a-sky>`. (#2908)
- Use MutationObserver and object3dset and object3dremove events to refresh raycaster list. (#3070)
- Allow specify container for pool component. (#3392)
- Expose raycaster.intersections array. (#3289)
- Remove cameraRig on setupDefaultCamera. (#3364)
- Add metalnessMap and roughnessMap. (#2722)
- Add spectator camera mode to the camera component and spectator scene component. (#3280)
- Add transparent flag to be able to define transparent backgrounds. (#3320)
- Improve function names in debugger call stacks. (#3310)
- Allow removal of mixed-in components. (#3275)
- Add xOffset option to allow text padding. (#3269)
- Allow disable shadow map auto update, fix shadow system init. (#3214)
- Use component event handlers insted of bound a-scene methods. (#3213)
- Support sources in video. (#3176)
- Make camera system aware of mixins. (#3196)
- Remove everGotGamepadEvent flag and gamepadconnected / gamepaddisconnected. (#3189)
- Register cursor event listeners on canvas, not window. (#3179)
- Do not update style.width and style.height on renderer resize to not override styles applied externally. (#3184)
- Factor out onButtonEvent method from controllers. (#3169)
- Add raycaster.enabled property to toggle tick handler. (#3148)
- Have camera call enter VR handler if scene already entered VR with display activate. (#3149)
- String-trim primitive attribute values. (#3145)
- Add customizeable colors to link portal and title. (#3106)
- Adapt cursor onMouseMove to also accept touchmove events. (#3143)

### Performance

- Save array creations on each raycaster update. (#3317)
- Optimize event emit. (#3308)
- Throttle updateControllerList while keeping getGamepads call. (#3112)
- Get rid of some string split operations. (#3316)
- Default the raycaster interval/throttle to 0. (#3293)
- Have getAttribute(visible) return object3D.visible directly. (#3283)
- Optimize aframe.utils.diff. (#3271)
- Raycaster fixes and performance improvements. (#3250)
- Remove garbage for addBehavior/removeBehavior. (#3217)
- Reduce garbage in axismove in tracked-controls. (#3185)
- Prevent component leakage in updateComponents (#3212)
- Cache font image textures for text component (#3158)
- Remove two array allocations per deepEqual call (#3115)
- Reduce Object.keys usage in core/schema (#3117)
- Save object allocation on look-controls.calculateDeltaRotation (#3116)

## 0.7.1 (Oct 18, 2017)

This release contains the same functionality as 0.7.0. This is a version bump
to fix the npm package that shipped by mistake with an outdated THREE r86
version. (#3177)

## 0.7.0 (Sept 12, 2017)

This release features:

- Support for Windows Mixed Reality Headsets and Microsoft Edge.
- Support for glTF 2.0.
- Performance improvements to reduce garbage collection cycles.

### Major Changes

- Add support for Windows Mixed Reality motion controllers. (#3013)
- Add glTF 2.0 support through upgrading three.js. glTF 1.0 is no longer supported. (#2986)
- Bump THREE to r87. (#2994)

### Fixes

- Do not resize the canvas in VR which leads to resolution drop (#3031).
- Fix component build data when `previousData` is object and a property has a `null` default value. (#3021)
- Fix calculating mouse position for embedded scenes. (#2942)
- Fix missing detail property in a-scene onVRPresentChange. (#2920)
- Fix updates for the line component. (#2906)

### Enhancements

- Handle `vrdisplayconnect` and `vrdisplaydisconnect` events in VREffect and VRControls. (#3019)
- Allow text component to take a number value. (6cbdac)
- Handle `vrdisplaypointerrestricted` event in `a-scene`. (#3014)
- Allow decoupling of touch events in look-contols. (#3012)
- Add support for VR headsets that do not provide `stageParameters`. (#3000)
- Moves canvas initialization logic from a component to the scene. (#2985)
- Listen to `vrdisplayconnect` and `vrdisplaydisconnect` to enter and exit VR when headset is plugged or unplugged. (#2900)
- Add title info to Enter VR button. (#2905)
- Cursor example improvements. (#2916)
- Add `vertexColors` property to base material component. (#2901)
- Add `emissive` and `emissiveIntensity` properties to base material component. (#2896)

### Performance

- Optimize tracked controls tick, discovery, and utilities. (#2943)
- Do not clone `attrValue` attributes into data anymore to reduce cloning. (#2939)
- Optimize a-entity code. (#2959)
- Optimize wasd-controls with early returns and skipping of type checking. (#2945)
- Optimize vec3 parse utility. (#2947)
- Optimize component change/initialize events. (#2950)
- Optimize look-controls by reducing object allocations and skipping of type checking. (#2944)
- Optimize emit method by removing split/map/callback calls and allocations. (#2941)
- Save a couple of function callbacks and array creations on each frame. (#2937)
- Remove inline functions for critical code paths in tracked-controls/raycaster/component for garbage collection. (#2936)
- Do not update component when data not changed even if skipping type checking. (#2917)

## 0.6.1 (July 18, 2017)

Bug fixes, support for Firefox on Android, mouse-based cursor, enable motion
capture developer tools in the Inspector.

### Enhancements

- Add a mouse-based cursor / raycaster, apply to the link traversal example. (#2861)
- Replace BlendCharacter dependency with ObjectLoader for hand-controls component. (#2876)

### Bug Fixes

- Fix component updates when reusing same object by storing oldData after building component data. Pass undefined as oldData on component initialization for single-prop components. (#2840, #2871)
- More reliable entity loading order by checking against list of registered elements. (#2873)
- Bump polyfill that fixes Firefox for Android tracking issue. (#2865)
- Use attribute for animation color as `from` if `from` is not defined. (#2855)
- Re-add controller events after unpausing scene. (#2879)
- Fix line component being applied in raycaster when disabled.

## 0.6.0 (June 29, 2017)

- Link traversal for navigating from page to page while staying in VR. Support
- for VR controllers across the board with the addition of Daydream and GearVR
- controller components as well as laser interactions. Large performance
- improvements around `.getAttribute` and `.setAttribute`.

### Major Changes

- Bumped three.js to r84. (#2456)
- Updated WebVR polyfill to 0.9.35. (#2700, #2818)
- Removed auto-enter-vr component previously for Carmel debugging. (#2784)

### Deprecations

- Renamed `AFRAME.utils.coordinates.isCoordinate` to `AFRAME.utils.coordinates.isCoordinates`. (af3f89)
- Removed reset sensor keyboard shortcut due to being removed from WebVR API. (#2531)

### Enhancements

- Added support for link traversal. (#1575)
- Added link component with default portal appearance. (#1575)
- Added link-controls component in the examples. (#1575)
- Daydream controller support with daydream-controls, 3DoF support to tracked-controls with head/arm model. (#2538)
- GearVR controller support with gearvr-controls. (#2545)
- laser-controls component for responsive controls across 6DoF and 3DoF. (#2678)
- Added support for cursor component to draw a visible ray or project a mesh onto the intersection point. (#2678)
- Added `origin` and `direction` properties to configure raycaster component. (#2678)
- Shadow support via shadow component and light properties. (#2350)
- Implement `thumbstickmoved` and `axismoved` for oculus-touch-controls. (#2513)
- Implement system `.update` handler. (#2548, #2613)
- Added `controllerconnected` and `controllerdisconnected` events. (#2505)
- Handle `onvrdisplaypresentchange` events to enter and exit VR. (#2751)
- Exposed `material.alphaTest` and `material.depthWrite` properties. (#2516)
- Exposed glTF animations. (#2417)
- Implemented `Component.tock` handler called after scene render for future post-processing support. (#1564)
- Added support for A-Frame being required in a Node environment. (#2476, #2477, #2484, #2492, #2498)
- Implemented `trackpadmoved` event for vive-controls component. (#2415)
- Added `response-type` attribute to `<a-asset-item>` to support array buffer responses. (#2442)
- Automatically set glTF response types to array buffer. (63d2f8)
- Apply `camera.userHeight` to controller when no stage parameters (e.g., Daydream). (#2448)
- Allow unsetting of mixin with `.setAttribute('mixin', '')` and `.removeAttribute('mixin')`. (a173509)
- Allow default lights to be disabled with `<a-scene light="defaultLightsEnabled: false">`. (#2376)
- Added panner properties to sound component. (#2374)
- Added non-positional audio support to sound component. (#2490)
- Refactored and unit test tracked-controls component. (#2396)
- Added triangle geometry. (#2573)
- Cleaned up cursor component when removed. (#2391)
- Normalized default component values to proper types rather than strings. (#2411)
- Removed unnecessary touching of `THREE.Cache` for asset responses. (#2435)
- Throw error for developer if HTML is opened with `file://` protocol. (#2540)
- Set `System.el` to the scene element. (#2566)
- Use `isControllerPresent` utility rather than checking `navigator.getGamepads` in order to fake oculus-touch-controls for motion capture. (#2604)
- Check WebVR API rather than using a dolly to check for positional tracking capabilities. (#2602)
- Made default cone geometry look like a cone. (#2506)
- Show error message when loading Inspector. (#2525)
- Added validation warnings for schema default values. (#2511)
- Removed timestamps from debug and console messages to reduce noise. (#2550)
- Use `getElementById` vs. `querySelector` for asset property types to be more strict. (#2578)
- Added developer warnings for primitive mapping names. (#2631)
- Anti-alias by default on 2D desktop. (#2455)
- Added support for iOS 10 HLS video streaming. (#2597)

### Performance

- Skipped schema type checking when object is passed through `.setAttribute` more than once to consider it a validated object. (#2679)
- Made `.getAttribute` not clone component data object. Now returns raw reference to component data (#2689)
- Disposed of unused texture objects from memory when no longer used by material component. (#2686)
- Throttled emitting of `componentchanged` event on each update to every 200ms. We recommend polling if more critical updates are needed. (#2683)
- Avoided `string.split()` in `.setAttribute()` to reduce memory in array instantiations. (#2674)
- Removed duplicate asset requests by passing down `<img>` from `<a-assets>` and by using `crossorigin` from the start. (#2544)
- Changed selector property types to support `getElementById`. (#2820)
- Reduced default `<a-cursor>` segments. (#2821)

### Fixes

- Fixed hand-controls blend-character animations between hand poses. (#2568)
- Fixed infinite loop when component `.init` handler calls `.setAttribute` on itself. (#2454)
- Fixed unreliable `requestAnimationFrame` timestamps by using `THREE.Clock` in the render loop. (#2471)
- Fixed error when entity detached while trying to load and then trying to initialize. (#2521)
- Fixed updating of `material.side` component. (#2528)
- Fixed components sharing default array reference. (#2615)
- Fixed non-recursive raycasters. (#2331)
- Fixed various issues with sound component. (#2490)
- Fixed `AFRAME.utils.device.checkHeadsetConnected` to check `VRDisplay.isConnected` (for Windows Mixed Reality Headsets). (#2427)
- Fixed video materials not respecting autoplay and controls attributes, set `playsinline`. (#2610)
- Fixed cursor component `mouseup` event not being emitted if entity no longer intersecting. (#2678)
- Fixed resetting material texture to null. (#2388)
- Fixed sound not playing when changing sound source. (#2457)
- Fixed `AFRAME.utils.deepEqual` recursion when comparing object with itself. (#2406)
- Fixed `AFRAME.utils.deepEqual` when comparing non-Object objects like HTML elements (#2502)
- Fixed loading of glTF files that did not include a default scene. (#2462)
- Fixed camera height when re-entering VR. (#2394)
- Fixed CSS cursor stuck to grabbing in Firefox. (#2684)
- Fixed tablets not being considered mobile devices in `AFRAME.utils.isMobile`. (#2309)
- Fixed `AFRAME.utils.coordinates.isCoordinate` with scientific notation. (#2475)
- Fixed pool component initializing twice. (#2407)
- Fixed error when injecting Inspector. (#2380)
- Fixed plane geometry segments. (#2499)
- Fixed grab CSS being applied when look-controls disabled. (#2642)
- Fixed look-controls enabling and disabling. (#2467)
- Fixed light targets. (#2715)
- Fixed `setAttribute` wiping out DOM-defined data on init. (#2727)
- Fixed primitives mapping to non-default components. (#2767)
- Fixed vive-controls component button colors. (#2772)
- Fixed error if removing component before initialized. (#2713)
- Fixed booleans when updating component. (#2796)
- Fixed cursor component not waiting for canvas to load. (#2813)
- Fixed text component not updating text while font is loading. (#2814)
- Fixed WebVR polyfill being applied and user height not applied to GearVR browsers. (#2819)
- Fixed single-property mixins not working with primitives. (#2810)

## 0.5.0 (February 09, 2017)

0.5.0 contains text, glTF support, patches to enable WebVR record-and-replay
tools, WebVR polyfill updates, enhancements, and bug fixes.

### Major Changes

- Bumped three.js to r83. (#2214)

### Deprecations

- N/A.

### Enhancements

- Added `text` component for SDF and MSDF text. (#2289)
- Added `gltf-model` component for loading glTF 3D models. (#2333)
- Added new hand poses for Oculus Touch controls. (#2191)
- Attach `tracked-controls` event listeners even if no physical controllers are
  present. (#2314)
- Made `Entity.removeAttribute(component, property)` reset a property value to its default. (#2353)
- Added `AFRAME.utils.throttleTick` and `AFRAME.utils.throttle` utils. (#2189)
- Changed `hand-controls` to check for "not Oculus Touch" rather than "is Vive"
  to make `hand-controls` be compatible with community control components
  (e.g., GearVR). (#2192)
- Don't cache geometry if merging. (#2255)
- Allow unsetting of mixins with `setAttribute(mixinId, '')`. (#2291)
- Allow access to the `screenshot` component canvas (#2316).
- Made `stats` component UI more readable. (#2313)
- Added warning of registered components contain uppercase characters. (#2233)
- Added warning if entity is appended outside of a scene. (#2240)
- Added warning if geometry merge target is not an entity. (#2243)
- Removed unneeded object equality check getting called on component initialization. (#2322)
- Updated `VREffect` to allow player scaling. (#2328)
- Added guides to documentation for *Using JavaScript and DOM APIs*, *Using
  with three.js*, and *Writing a Component* (58555a, 982f66, 09a606).

### Fixes

- Fixed low iOS resolution and blur issues. (#2352)
- Fixed mobile resolution and canvas sizing issues by using WebVR polyfill with
  updated device database. (#2345)
- Fixed potential Vive controller issues across browsers by loosening the
  Gamepad ID check to only check for prefix. (#2370)
- Fixed `raycaster.interval` not being applied. (#2363)
- Fixed system initialization affecting component updates. (#2367)
- Fixed unstable version of Inspector being injected on shortcut. (#2364)
- Fixed `vive-controls` not tracking. (#2194)
- Fixed component updates getting called even if data did not change. (#2322)
- Fixed `envify` causing issues when installing from npm with a bundler. (c62690)
- Fixed component updates with `setAttribute` using `data` instead of `attrValue`. (#2184)
- Fixed coordinate parser when passed `null` and when trying to override. (#2209)
- Fixed error when `vr-mode-ui` is disabled and `embedded` is enabled. (4607e2)
- Fixed array property type updates through `AFRAME.utils.deepEqual`. (#2229)
- Fixed `init` and `update` handlers being called when doing `flushToDOM` on
  non-loaded entity. (#2250).
- Fixed disabling of `fog`. (#2251)
- Fixed texture offset and repeats. (#2253)
- Fixed fullscreen not exiting when exiting VR. (#2264)
- Fixed component `pause` and `remove` handlers not getting called on scene detach. (#2302)
- Fixed multiple `look-controls` instances colliding. (#2335)
- Fixed several component properties missing property types. (#2357)

## 0.4.0 (December 16, 2016)

0.4.0 contains Oculus Touch controller support, integration with the Registry
by means of the Inspector, API polish, and bug fixes.

### Major Changes

- `getAttribute` returns full computed rather than just defined component data set. (#1925)
- `setAttribute` when passed an object (i.e., `setAttribute('material', {color: 'red'})`) no longer clobbers existing component data, it will instead *extend* existing component data. Pass a `true` flag as the third argument to clobber existing data.
- Asset property type will directly pass the video element to a component if the value is a selector. (#2129)
- Refactored primitives to fix component dependencies and initialization ordering. (#2106)
- Removed `transforms` feature from the `registerPrimitive` API. (#2045)
- Removed deprecated `look-at` component. (#1913)
- Removed deprecated Declarative Events API (`<a-event>`). (#1914)

### Deprecations

- `getComputedAttribute` deprecated in favor of `getAttribute`. `getDOMAttribute` does what `getAttribute` used to do. (#1925)
- `src` schema property type deprecated in favor of `asset`, `audio`, `map`, `model` schema property types. (#2003)
- `AFRAME.utils.isMobile`, `AFRAME.utils.isGearVR`, `AFRAME.utils.checkHeadsetConnected`, and `AFRAME.utils.isIOS` have all moved to the `AFRAME.utils.device` namespace.

### Enhancements

- Bumped three.js to r82. (#2081)
- Oculus Touch controller support and controller refactor. (#2132)
- Inspector is pulled from `unpkg.com` CDN to be able to reference a fuzzy version. (e664fe6)
- Added `reverseDrag` property to `look-controls` component to reverse mouse drag (ideal for static 360&deg; content). (#2024)
- `auto-enter-vr` component for Carmel browser support, may be replaced once link traversal lands. (ae69e1d)
- Added standard material map properties for ambient occlusion, displacements, normals, and spherical environments. (#1826, #2078)
- Asset parser no longer strictly demands URLs be wrapped with `url()`. (#2045)
- Added ability to take equirectangular and projection screenshots with a keyboard shortcut. (#1984)
- Added `asset`, `map`, `model`, `audio` schema property types. (#2054)
- Added wireframe properties to the standard and flat materials. (#1971)
- Have `raycaster` component refresh its list of intersection targets when entities are attached or detached from the scene. (#1887)
- Added `pool` component for performant object pooling and reuse. (#1954)
- Added support for `tracked-controls` component to change its origin position (e.g., for teleportation). (#2002)
- Added pooling to the `sound` component. (#1924)
- Added intersection data to `cursor` component events. (#1920)
- Added events to entity `setObject3D` and `removeObject3D`. (#2075)
- Added `pauseSound()` method to the `sound` component. (#1996)
- Added loading feedback while A-Frame Inspector is being injected over the network. (#2006)
- Added console warning message if A-Frame script tag is included in the `<body>`. (#2000)
- Added support for non-QWERTY keyboard layouts in `wasd-controls` component. (#1832)
- Automatically set `playsinline` and `webkit-playsinline` on video elements in asset system. (#2076)
- Used slightly faster function binding. (#1782)
- Made `stats` component alert text more readable. (#1885)
- Allowed `inspector` component to be opened via `postMessage`. (#1997)
- Allowed `stats` component to be disabled via querystring. (#1836)
- Exposed component prototype. (#2062)
- Exposed `XHRLoader` in `<a-assets>`. (#2023)
- Added local Markdown documentation server `npm run docs`. (48ff50)
- Added documentation test and lint script for checking links, fix links. (#2080)

### Fixes

- Fixed component dependencies where bugs manifested in the `obj-model` and `raycaster` components. (#2036)
- Fixed `int` property type with empty data being turned to `NaN`. (#2063)
- Fixed GearVR VR mode height by only removing `camera.userHeight` if positional tracking exists and the device is not a GearVR or smartphone. (#2044)
- Fixed mixins not working with multiple-instanced components. (#1699)
- Fixed default components (i.e., `position`, `rotation`, `scale`, `visible`) not being flushed to DOM in debug mode. (#2064)
- Fixed `cursor` `mouseleave` event not being reliable with multiple close objects. (#1882)
- Fixed `cursor` component intersecting itself. (#1936)
- Fixed entity not being able to re-attach after being detached. (#1928)
- Fixed typos for `requestFullscreen` calls. (#1963)
- Fixed `tracked-controls` component if a mesh was not applied. (#1875)
- Fixed `raycaster` component passing its actual intersection objects through events. (#1978)
- Fixed `stats` component for Safari. (#1865)
- Normalized Git-tracked files to Unix-style line feeds. (#1825)
- Fixed stringifying default `null` values for object property types. (#2138)
- Fixed material update referencing `sceneEl` when the scene has not yet loaded. (#2137)
- Fixed default values of a schema property getting changed to weird values. (#2140)

### Known Issues

- A regression in the October 29th version of Chromium passes microsecond-based
  timestamp into `requestAnimationFrame` instead of milliseconds, breaking
  animations.

### 0.3.2 (October 12, 2016)

- WebVR 1.1 API support (#1931)

### 0.3.1 (August 25, 2016)

- Fixed requiring A-Frame with Browserify from npm. (#1824)

## 0.3.0 (August 17, 2016)

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

## 0.2.0 (March 25, 2016)

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
