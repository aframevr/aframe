---
title: stats
type: components
layout: docs
parent_section: components
source_code: src/components/scene/stats.js
---

[scene]: ../core/scene.md

The stats component displays a UI with performance-related metrics of your Aframe Project. The stats component applies only to the [`<a-scene>`][scene] element.

## Example

```html
<a-scene stats></a-scene>
```
It can also be written as `stats="true"` which will activate the UI and `stats="false"` to hide the UI. This version can be useful during development as it allows you to keep the component within your code for easy access. 

## Metrics

- **fps**: frames per second, framerate. Aim for stable 90 fps with the WebVR 1.0 API.
- **requestAnimationFrame** (raf): Latency.

Three.js -- **Memory**
- **Textures**: number of three.js textures in the scene. A lower count means
  the scene is using less memory and sending less data to the GPU.
- **Programs**: number of GLSL shaders in the scene.
- **Geometries**: number of three.js geometries in the scene. A lower count
  means the scene is using less memory.
  
Three.js -- **Render**
- **Points**: number of points (vertices) in the scene.
- **Triangles**: number of triangles (faces) in the scene.
- **Calls**: number of draw calls on each frame.

A-Frame
- **Load Time**: how long it took for the scene to start rendering, in ms.
- **Entities**: number of A-Frame entities.

## Toggling UI

Click or tap on the headings to collapse groups of metrics. If you tap
"Framerate", then `fps` and `raf` will collapse.
