---
title: Best Practices
type: introduction
layout: docs
parent_section: introduction
order: 11
---

## A-Frame

[ecs]: ./entity-component-system.md
[mixins]: ../core/mixins.md
[template]: https://github.com/ngokevin/kframe/tree/master/components/template/

Some best practices for the framework:

- The core structure of A-Frame is [entity-component (ECS)][ecs]. Place and
  structure application code within purely A-Frame components for reusability,
  modularity, composability, decoupling, encapsulation, declarativeness, and
  testability. It's okay to start out at first using content scripts
  (`<script>`), but look to move towards components.
- [Mixins][mixins] and [templating][template] are useful to reuse and reduce
  repeated HTML.

## Performance

[asm]: ../core/asset-management-system.md
[hardware]: ./vr-headsets-and-webvr-browsers.md
[merge]: ../components/geometry.md#mergeto
[stats]: ../components/stats.md
[background]: ../components/background.md

Performance is critical in VR. A high framerate must be maintained in order for
people to feel comfortable. Here are some ways to help improve performance of
an A-Frame scene:

- Use [recommended hardware specifications][hardware].
- Use the **[stats component][stats]** to keep an eye on various metrics (FPS,
  vertex and face count, geometry and material count, draw calls, number of entities). We
  want to maximize FPS and minimize everything else.
- Make use of the **[asset management system][asm]** to benefit from browser
  caching and preloading. Trying to fetch assets while rendering is slower than
  fetching all assets before rendering.
- If using models, look to bake your lights into textures rather than relying
  on real-time lighting and shadows.
- Generally, the fewer number of entities and lights in the scene, the better.
- Make sure your textures' resolutions are sized to powers of two (e.g.,
  256x256, 512x1024) in order to avoid the renderer having to resize the
  texture during runtime.
- Limit the number of faces and vertices on models.
- Some further techniques (not yet documented) include geometry instancing,
  geometry merging, level of detail (LOD).
- When using raycasters or colliders, select which entities are to be raycasted
  against rather than raycasting against every object in the scene.
- When adding continuously running behaviors, use A-Frame component `tick`
  handlers to hook into the global render loop. Use utilities such as
  `AFRAME.utils.throttleTick` to limit the number of times the `tick` handler
  is run if appropriate.
- Use the **[background component][background]** instead of `a-sky` to define a
  solid color as the scene background. This prevents the creation of
  unnecessary geometry.
- Update `position`, `rotation`, `scale`, and `visible` using at the three.js
  level (`el.object3D.position`, `el.object3D.position`, `el.object3D.scale`,
  `el.object3D.visible`) to avoid overhead on `.setAttribute`.

### GPU Texture Preloading

Until non-blocking texture uploads to the GPU are available, try to draw all
materials and textures up front. When materials and textures are drawn for the
first time, the browser will hang and block while uploading to the GPU. We can
manually preload textures by calling:

```js
document.querySelector('a-scene').renderer.setTexture2D(ourTexture, 0);
```

We will try to come with a convenient API in A-Frame to do this automatically.

[360]: https://aframe-360-gallery.glitch.me

For example, this is apparent in the [360&deg; image gallery][360]. If we look at
the browser performance tools, there will be frame drops when switching to a
new image for the first time, but smooth transitions when switching back to
images for the second time.

Reuse materials and textures as much as possible, aiming for a small number
of unique materials. Texture atlases provide one efficient way to reuse
materials while giving the impression of more variety. Simpler three.js
materials such as MeshLambertMaterial or MeshBasicMaterial perform better and
are often sufficient for low-poly scenes. In particular, pre-baked lighting on
an unlit (Basic) material can significantly improve performance. A-Frame's
default PBR-based (Standard) material is more physically realistic, but also
more expensive and often unnecessary in simple scenes.

#### Tools

[webglinsights]: https://chrome.google.com/webstore/detail/webgl-insight/djdcbmfacaaocoomokenoalbomllhnko?hl=en-US

There are browser add-ons available to look into what's being sent to the GPU:

- [WebGL Insights extension for Chrome][webglinsights]

### JavaScript

[firefox-alloc]: https://developer.mozilla.org/en-US/docs/Tools/Performance/Allocations
[chrome-alloc]: https://developers.google.com/web/tools/chrome-devtools/memory-problems/#spot_frequent_garbage_collections

Avoid creating garbage and instantiating new JavaScript objects, arrays,
strings, and functions as much as possible. In the 2D web, it is not as big of
a deal to create a lot of JavaScript objects since there is a lot of idle time
for the garbage collector to run. For VR, garbage collection may cause dropped
frames. Learn more about detecting allocations and garbage collection in
[Firefox][firefox-alloc] and [Chrome][chrome-alloc] performance tools.

Try to avoid patterns such as `Object.keys(obj).forEach(function () { });`,
which create new arrays, functions, and callbacks versus using `for (key in
obj)`. Or for array iteration, avoid `.forEach` and use a simple `for` loop
instead. Avoid unnecessary copying of objects, using methods like
`utils.extend(target, source)` instead of `utils.clone` or `.slice`.

If emitting an event, try to reuse the same object for event details:

```js
AFRAME.registerComponent('foo', {
  init: function () {
    this.someData = [];
    this.evtDetail = {someData: this.someData};
  },

  tick: function (time) {
    this.someData.push(time);
    this.el.emit('bar', this.evtDetail);
  }
});
```

All of the suggestions above are _especially_ important in `tick()` handlers,
where they will be running on every frame.

### `tick` Handlers

In component tick handlers, be frugal on creating new objects. Try to reuse
objects. A pattern to create private reusable auxiliary variables is with a
closure. Below we create a helper vector and quaternion and reuse them between
frames, rather than creating new ones on each frame. Be careful that these
variables do not hold state because they will be shared between all instances
of the component. Doing this will reduce memory usage and garbage collection:

```js
AFRAME.registerComponent('foo', {
  tick: function () {
    this.doSomething();
  },

  doSomething: (function () {
    var helperVector = new THREE.Vector3();
    var helperQuaternion = new THREE.Quaternion();

    return function () {
      helperVector.copy(this.el.object3D.position);
      helperQuaternion.copy(this.el.object3D.quaternion);
    };
  })()
});
```

Also if we continuously modify a component in the tick, make sure we pass the
same object for updating properties. A-Frame will keep track of the latest
passed object and disable type checking on subsequent calls for an extra speed
boost. Here is an example of a recommended tick function that modifies the
rotation on every tick:

```js
AFRAME.registerComponent('foo', {
  tick: function () {
    var el = this.el;
    var rotationTmp = this.rotationTmp = this.rotationTmp || {x: 0, y: 0, z: 0};
    var rotation = el.getAttribute('rotation');
    rotationTmp.x = rotation.x + 0.1;
    rotationTmp.y = rotation.y + 0.1;
    rotationTmp.z = rotation.z + 0.1;
    el.setAttribute('rotation', rotationTmp);
  }
});
```

## VR Design

[leapmotion]: https://developer.leapmotion.com/assets/Leap%20Motion%20VR%20Best%20Practices%20Guidelines.pdf
[oculus]: https://developer.oculus.com/documentation/intro-vr/latest/concepts/bp_intro/

Designing for VR is different than designing for flat experiences. As a new
medium, there are new sets of best practices to follow, especially to maintain
user comfort and presence. This has been thoroughly written about so we defer
to these guides. Note that VR interaction design is fairly new, and nothing is
absolute:

- [Oculus Best Practices (for VR)][oculus]
- [Leap Motion VR Best Practices Guidelines][leapmotion]

Some things to note:

- The common golden rule is to never unexpectedly take control of the camera
  away from users.
- Units (such as for position) should be considered meters. This is because the
  WebVR API returns pose in meters which is fed into most camera controls. By
  considering units as meters, we achieve expected scale.
