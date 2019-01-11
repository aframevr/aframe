---
title: renderer
type: components
layout: docs
parent_section: components
source_code: src/components/renderer.js
examples: []
---

The `renderer` system configures a scene's
[THREE.WebGLRenderer](https://threejs.org/docs/#api/renderers/WebGLRenderer) instance.

## Example

```html
<a-scene renderer="antialias: true;
                   colorManagement: true;
                   sortObjects: true;
                   physicallyCorrectLights: true;
                   maxCanvasWidth: 1920;
                   maxCanvasHeight: 1920;"></a-scene>
```

## Properties

| Property                | Description                                                                     | Default Value |
|-------------------------|---------------------------------------------------------------------------------|---------------|
| antialias               | Whether to perform antialiasing. If `auto`, antialiasing is disabled on mobile. | auto          |
| colorManagement         | Whether to use a color-managed linear workflow.                                 | false         |
| sortObjects             | Whether to sort objects before rendering.                                       | false         |
| physicallyCorrectLights | Whether to use physically-correct light attenuation.                            | false         |
| maxCanvasWidth          | Maximum canvas width. Uses the size multiplied by device pixel ratio. Does not limit canvas width if set to -1.                                | 1920            |
| maxCanvasHeight         | Maximum canvas height. Behaves the same as maxCanvasWidth.                      | 1920          |
| logarithmicDepthBuffer  | Whether to use a logarithmic depth buffer.                                      | auto          |

> **NOTE:** Once the scene is initialized, these properties may no longer be changed.

### antialias

When enabled, smooths jagged edges on curved lines and diagonals at moderate performance cost.
By default, antialiasing is disabled on mobile devices.

### colorManagement

Color management provides more accurate rendering and reduces the likelihood that scenes
will appear overlit or "washed out." Enabling color management is recommended for precisely
matching colors from texturing and modeling tools, but unofficial components may not always
respond to color management properly at this time.

Managed and unmanaged color modes are similar to linear and gamma workflows, respectively, in
other engines and tools.

> **NOTE:** In three.js, and previous versions of A-Frame, a `gammaOutput: true` property was
> available. This is applied automatically when color management is enabled.

### sortObjects

Sorting is used to attempt to properly render objects that have some degree of transparency.
Due to various limitations, proper transparency often requires some amount of careful setup.
By default, objects are not sorted, and the order of elements in the DOM determines order of
rendering. Re-ordering DOM elements provides one way of forcing a consistent behavior, whereas
use of `renderer="sortObjects: true"` may cause unwanted changes as the camera moves.

### physicallyCorrectLights

By default, point and spot lights attenuate (or, appear dimmer as they become farther away)
according to a model that is classically common, but physically inaccurate. For more realistic
light attenuation, set `renderer="physicallyCorrectLights: true"`. Light intensities may need to
be adjusted when making this change. Performance is not significantly affected in either mode.

> **NOTE:** When glTF models contain lights, use the physically-correct lighting mode to match
> the results in the original modeling tool.

### logarithmicDepthBuffer

A logarithmic depth buffer may provide better sorting and rendering in scenes containing very
large differences of scale and distance.
