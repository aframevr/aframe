---
title: Scene
type: core
layout: docs
parent_section: core
order: 5
---

A scene is represented by the `<a-scene>` element. The scene is the global root
object, and all [entities][entity] are contained within the scene.

The scene inherits from the [`Entity`][entity] class so it inherits all of its
properties, its methods, the ability to attach components, and the behavior to
wait for all of its child nodes (e.g., `<a-assets>` and `<a-entity>`) to load
before kicking off the render loop.

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

## Methods

| Name    | Description                                                                                                            |
|---------|------------------------------------------------------------------------------------------------------------------------|
| enterVR | Switch to stereo render and push content to the headset. Needs to be called within a user-generated event handler like `click`. the first time a page enters VR. |
| exitVR  | Switch to mono renderer and stops presenting content on the headset.                                                                           |
| reload  | Revert the scene to its original state.                                                                                |

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
<a-scene canvas="canvas: #my-canvas" fog stats>
```

A-Frame ships with a few components to configure the scene:

- [canvas][canvas] - Configure which canvas to render to, or the width/height of the injected canvas.
- [fog][fog] - Scene fog.
- [keyboard-shortcuts][keyboard-shortcuts] - Toggle keyboard shortcuts.
- [stats][stats] - Toggle performance stats.
- [vr-mode-ui][vr-mode-ui] - Toggle UI for entering and exiting VR.

## Running Content Scripts on the Scene

When running JavaScript on the scene, wait for it to finish loading first:

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

[canvas]: ../components/canvas.md
[entity]: ./entity.md
[fog]: ../components/fog.md
[keyboard-shortcuts]: ../components/keyboard-shortcuts.md
[scene]: http://threejs.org/docs/#Reference/Scenes/Scene
[stats]: ../components/stats.md
[systems]: ../core/systems.md
[vr-mode-ui]: ../components/vr-mode-ui.md
