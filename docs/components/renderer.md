---
title: renderer
type: components
layout: docs
parent_section: components
source_code: src/systems/renderer.js
examples: []
---

The `renderer` system configures a scene's
[THREE.WebGLRenderer](https://threejs.org/docs/#api/renderers/WebGLRenderer) instance.
It also configures presentation attributes when entering WebVR/WebXR.

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

[precision]: #precision

| Property                | Description                                                                     | Default Value |
|-------------------------|---------------------------------------------------------------------------------|---------------|
| antialias               | Whether to perform antialiasing. If `auto`, antialiasing is disabled on mobile. | auto          |
| colorManagement         | Whether to use a color-managed linear workflow.                                 | false         |
| highRefreshRate         | Increases frame rate from the default (for browsers that support control of frame rate). | false         |
| foveationLevel          | Amount of foveation used in VR to improve perf, from 0 (min) to 1 (max).        | 1             |
| sortObjects             | Whether to sort objects before rendering.                                       | false         |
| physicallyCorrectLights | Whether to use physically-correct light attenuation.                            | false         |
| maxCanvasWidth          | Maximum canvas width. Uses the size multiplied by device pixel ratio. Does not limit canvas width if set to -1.                                | 1920            |
| maxCanvasHeight         | Maximum canvas height. Behaves the same as maxCanvasWidth.                      | 1920          |
| logarithmicDepthBuffer  | Whether to use a logarithmic depth buffer.                                      | auto          |
| precision               | Fragment shader [precision][precision] : low, medium or high.                   | high          |
| alpha                   | Whether the canvas should contain an alpha buffer.                              | true          |
| toneMapping             | Type of toneMapping to use, one of: 'no', 'ACESFilmic', 'linear', 'reinhard', 'cineon'  | 'no'          |
| exposure                | When any toneMapping other than "no" is used this can be used to make the overall scene brighter or darker  | 1          |

> **NOTE:** Once the scene is initialized, none of these properties may no longer be changed apart from "exposure" and "toneMapping" which can be set dynamically.

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

### highRefreshRate

Switches to a higher frame rate than the default, for the given device.

This requires support for  `supportedFrameRates` and `updateTargetFrameRate` as defined in the WebXR specs.  Currently this is supported on the Oculus Browser, but is expected to be supported by other browsers in future.

Frame rates used are as follows:

| Device capabilities                                          | Default Frame Rate | High Frame Rate |
| ------------------------------------------------------------ | ------------------ | --------------- |
| Device supports 90Hz refresh rate (e.g. Quest 2, Quest Pro)  | 72 Hz              | 90 Hz           |
| Device does not support 90Hz refresh rate (e.g. Oculus Go, Quest) | 60Hz               | 72Hz            |

### foveationLevel

Controls the amount of foveation which renders fewer pixels near the edges of the user's field of view
when in stereo rendering mode on certain systems. The value should be in the range of 0 to 1, where
0 is the minimum and 1 the maximum amount of foveation. This is currently supported by the Oculus Browser.

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

### Precision

Set precision in fragment shaders. Main use is to address issues in older hardware / drivers. Adreno 300 series GPU based phones are [particularly problematic](https://github.com/mrdoob/three.js/issues/14137). You can set to `mediump` as a workaround. It will improve performance, in mobile in particular but be aware that might cause visual artifacts in shaders / textures.

### alpha

Whether the canvas should contain an alpha buffer. If this is true the renderer will have a transparent backbuffer and the canvas can be composited with the rest of the webpage. [See here for more info.](https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html)
