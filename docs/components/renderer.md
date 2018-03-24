---
title: renderer
type: components
layout: docs
parent_section: components
source_code: src/components/renderer.js
examples: []
---

The `renderer` component configures a scene's
[THREE.WebGLRenderer](https://threejs.org/docs/#api/renderers/WebGLRenderer) instance.

## Example

```html
<a-scene renderer="antialias: true;
                   gammaOutput: true;
                   sortObjects: true;
                   physicallyCorrectLights: true;"></a-scene>
```

## Properties

| Property                | Description                                                                     | Default Value |
|-------------------------|---------------------------------------------------------------------------------|---------------|
| antialias               | Whether to perform antialiasing. If `auto`, antialiasing is disabled on mobile. | auto          |
| gammaOutput             | Whether to pre-multiply gamma on textures and colors before rendering.          | false         |
| sortObjects             | Whether to sort objects before rendering.                                       | false         |
| physicallyCorrectLights | Whether to use physically-correct light attenuation.                            | false         |

### antialias

When enabled, smooths jagged edges on curved lines and diagonals at moderate performance cost.
By default, antialiasing is disabled on mobile devices.

> **NOTE:** Once the scene is initialized, `antialias` may no longer be
> changed.

### gammaOutput

Typically, textures are converted to linear colorspace in the renderer for lighting calculations.
Unless post-processing used after the initial render,
[gamma correction](https://en.wikipedia.org/wiki/Gamma_correction) should be applied with
`renderer="gammaOutput: true;"` for best color reproduction. By default, gamma correction is off
in order to preserve backward-compatibility. When changed, adjustments to lighting may be needed.

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
