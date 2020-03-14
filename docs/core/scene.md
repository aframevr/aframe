---
title: Scene
type: core
layout: docs
parent_section: core
order: 5
source_code: src/core/scene/a-scene.js
examples: []
---

[entity]: ./entity.md

A scene is represented by the `<a-scene>` element. The scene is the global root
object, and all [entities][entity] are contained within the scene.

The scene inherits from the [`Entity`][entity] class so it inherits all of its
properties, its methods, the ability to attach components, and the behavior to
wait for all of its child nodes (e.g., `<a-assets>` and `<a-entity>`) to load
before kicking off the render loop.

`<a-scene>` handles all of the three.js and WebVR/WebXR boilerplate for us:

- Set up canvas, renderer, render loop
- Default camera and lights
- Set up webvr-polyfill, VREffect
- Add UI to Enter VR that calls WebVR API
- Configure WebXR devices through the [`webxr`](../components/webxr.md) system

<!--toc-->

## Example

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box src="#texture"></a-box>
</a-scene>
```

## Properties

[scene]: http://threejs.org/docs/#Reference/Scenes/Scene
[systems]: ../core/systems.md

| Name          | Description                                                               |
|---------------|---------------------------------------------------------------------------|
| behaviors     | Array of components with tick methods that will be run on every frame.    |
| camera        | Active three.js camera.                                                   |
| canvas        | Reference to the canvas element.                                          |
| isMobile      | Whether or not environment is detected to be mobile.                      |
| object3D      | [`THREE.Scene`][scene] object.                                            |
| renderer      | Active `THREE.WebGLRenderer`.                                             |
| renderStarted | Whether scene is rendering.                                               |
| effect        | Renderer for VR created by passing active renderer into `THREE.VREffect`. |
| systems       | Instantiated [systems][systems].                                          |
| time          | Global uptime of scene in seconds.                                        |

## States

| Name    | Description                                                                                                            |
|---------|------------------------------------------------------------------------------------------------------------------------|
| vr-mode | Added and removed when entering and exiting VR, respectively. Check with `sceneEl.is('vr-mode')`. |

## Methods

| Name    | Description                                                                                                            |
|---------|------------------------------------------------------------------------------------------------------------------------|
| enterVR | Switch to stereo render and push content to the headset. Needs to be called within a user-generated event handler like `click`. the first time a page enters VR. |
| exitVR  | Switch to mono renderer and stops presenting content on the headset.                                                                           |

## Events

| Name         | Description                         |
|--------------|-------------------------------------|
| enter-vr     | User has entered VR and headset started presenting content. |
| exit-vr      | User has exited VR and headset stopped presenting content.  |
| loaded       | All nodes have loaded.                             |
| renderstart | Render loop has started.            |

## Scene Components

Components can be attached to the scene as well as entities:

```html
<a-scene fog stats>
```

[embedded]: ../components/embedded.md
[fog]: ../components/fog.md
[keyboard-shortcuts]: ../components/keyboard-shortcuts.md
[inspector]: ../introduction/visual-inspector-and-dev-tools.md
[stats]: ../components/stats.md
[vr-mode-ui]: ../components/vr-mode-ui.md

A-Frame ships with a few components to configure the scene:

- [embedded][embedded] - Remove fullscreen styles from the canvas.
- [fog][fog] - Add fog.
- [keyboard-shortcuts][keyboard-shortcuts] - Toggle keyboard shortcuts.
- [inspector][inspector] - Inject the A-Frame Inspector.
- [stats][stats] - Toggle performance stats.
- [vr-mode-ui][vr-mode-ui] - Toggle UI for entering and exiting VR.

## Running Content Scripts on the Scene

The recommended way is to write a component, and attach it to the scene element. The scene and its children will be initialized before this component.

```js
AFRAME.registerComponent('do-something', {
  init: function () {
    var sceneEl = this.el;
  }
});
```

```html
<a-scene do-something></a-scene>
```

If for some particular reason you prefer not to write a dedicated component you need to wait for the scene to finish initializing and attaching:

```js
var scene = document.querySelector('a-scene');

if (scene.hasLoaded) {
  run();
} else {
  scene.addEventListener('loaded', run);
}

function run () {
  var entity = scene.querySelector('a-entity');
  entity.setAttribute('material', 'color', 'red');
}
```
