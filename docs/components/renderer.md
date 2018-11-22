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
                   workflow: linear;
                   sortObjects: true;
                   physicallyCorrectLights: true;
                   maxCanvasWidth: 1920;
                   maxCanvasHeight: 1920;"></a-scene>
```

## Properties

| Property                | Description                                                                     | Default Value |
|-------------------------|---------------------------------------------------------------------------------|---------------|
| antialias               | Whether to perform antialiasing. If `auto`, antialiasing is disabled on mobile. | auto          |
| gammaOutput             | Whether to pre-multiply gamma on textures and colors before rendering.          | false         |
| sortObjects             | Whether to sort objects before rendering.                                       | false         |
| physicallyCorrectLights | Whether to use physically-correct light attenuation.                            | false         |
| maxCanvasWidth          | Maximum canvas width. Uses the size multiplied by device pixel ratio. Does not limit canvas width if set to -1.                                | 1920            |
| maxCanvasHeight         | Maximum canvas height. Behaves the same as maxCanvasWidth.              | 1920            |

> **NOTE:** Once the scene is initialized, these properties may no longer be changed.

### antialias

When enabled, smooths jagged edges on curved lines and diagonals at moderate performance cost.
By default, antialiasing is disabled on mobile devices.

### workflow

Two workflows — `gamma` and `linear` — are available for rendering. The `linear` workflow gives
more accurate rendering, and reduces the likelihood that scenes will appear overlit or "washed
out." The `gamma` workflow is provided for backwards compatibility. When changing the workflow
for an existing scene, you may need to adjust colors or lights.

> **NOTE:** In three.js, and previous versions of A-Frame, a `gammaOutput: true` property was
> available. This is applied automatically in the `linear` workflow.

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
