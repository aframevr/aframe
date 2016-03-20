---
title: Scene
type: core
layout: docs
parent_section: core
order: 4
---

A scene is represented by the `<a-scene>` element. The scene is the global root object, and all [entities][entity] are contained within the scene.

The scene inherits from the [`Entity`][entity] class so it inherits all of its properties, its methods, the ability to attach components, and the behavior to wait for all of its child nodes (e.g., `<a-assets>` and `<a-entity>`) to load before kicking off the render loop.

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

| Name           | Description                                                                  |
|----------------|------------------------------------------------------------------------------|
| behaviors      | Array of components with tick methods that will be run on every frame.       |
| canvas         | Reference to the canvas element.                                             |
| isMobile       | Whether or not environment is detected to be mobile.                         |
| monoRenderer   | Instance of `THREE.WebGlRenderer`.                                           |
| object3D       | [`THREE.Scene`][scene] object.                                               |
| renderer       | Active renderer, one of `monoRenderer` or `stereoRenderer`.                  |
| stereoRenderer | Renderer for VR created by passing the `monoRenderer` into `THREE.VREffect`. |
| time           | Global uptime of scene in seconds.                                           |

## Methods

| Name    | Description                                                                                                            |
|---------|------------------------------------------------------------------------------------------------------------------------|
| enterVR | Switch to stereo renderer and enter fullscreen. Needs to be called within a user-generated event handler like `click`. |
| exitVR  | Switch to mono renderer and exit fullscreen.                                                                           |
| reload  | Revert the scene to its original state.                                                                                |

## Events

| Name         | Description                         |
|--------------|-------------------------------------|
| enter-vr     | User has entered VR and fullscreen. |
| exit-vr      | User has exited VR and fullscreen.  |
| loaded       | All nodes have loaded.              |
| render-start | Render loop has started.            |

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
[vr-mode-ui]: ../components/vr-mode-ui.md
