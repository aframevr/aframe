---
title: stats
type: components
layout: docs
parent_section: components
source_code: src/components/stats.js
---

[scene]: ../core/scene.md

The stats component displays a UI with performance-related metrics. The stats
component applies only to the [`<a-scene>` element][scene].

## Example

```html
<a-scene stats></a-scene>
```

## Properties

| Property | Description                                           | Default Value |
|----------|-------------------------------------------------------|---------------|
| enabled  | Whether stats are enabled.                            | true          |
| hideInVR | Whether to hide stats panel on 2D monitor when in VR. | true          |

## Metrics

- **fps**: frames per second, framerate. Aim for stable 90 fps with the WebVR 1.0 API.
- **requestAnimationFrame** (raf): Latency.
- **Textures**: number of three.js textures in the scene. A lower count means
  the scene is using less memory and sending less data to the GPU.
- **Programs**: number of GLSL shaders in the scene.
- **Geometries**: number of three.js geometries in the scene. A lower count
  means the scene is using less memory.
- **Vertices**: number of vertices in the scene.
- **Faces**: number of faces in the scene.
- **Calls**: number of draw calls on each frame.
- **Load Time**: how long it took for the scene to start rendering, in ms.
- **Entities**: number of A-Frame entities.

## Toggling UI

Click or tap on the headings to collapse groups of metrics. If you tap
"Framerate", then `fps` and `raf` will collapse.
