---
title: gltf-model
type: components
layout: docs
parent_section: components
source_code: src/components/gltf-model.js
examples:
 - title: Modifying Material of Model
   src: https://glitch.com/edit/#!/aframe-modify-model-material?path=index.html:1:0
---

[about-gltf]: https://www.khronos.org/gltf

[glTF][about-gltf] (GL Transmission Format) is an open project by Khronos
providing a common, extensible format for 3D assets that is both efficient and
highly interoperable with modern web technologies.

The `gltf-model` component loads a 3D model using a glTF (`.gltf` or `.glb`)
file.

[threejsgltf]: https://threejs.org/docs/#examples/loaders/GLTFLoader

Note that glTF is a fairly new specification and adoption is still growing.
Work on the [three.js glTF loader][threejsgltf] and converters are still
active.

> **NOTE:** A-Frame supports glTF 2.0. For models using older versions of the
> glTF format, use `gltf-model-legacy` from [donmccurdy/aframe-extras][extras].

[extras]: https://github.com/donmccurdy/aframe-extras/tree/master/src/loaders

<!--toc-->

## Why use glTF?

[obj-model]: ./obj-model.md

In comparison to the older [OBJ][obj-model] format, which supports only
vertices, normals, texture coordinates, and basic materials, glTF provides a
more powerful set of features. In addition to all of the above, glTF offers:

- Hierarchical objects
- Scene information (light sources, cameras)
- Skeletal structure and animation
- More robust materials and shaders

For simple models with no animation, OBJ is nevertheless a common and reliable
choice.

In comparison to COLLADA or FBX, the supported features are very
similar. However, because glTF focuses on providing a "transmission format"
rather than an editor format, it is more interoperable with web technologies.
By analogy, the .PSD (Adobe Photoshop) format is helpful for editing 2D images,
but images are converted to .JPG for use on the web. In the same way, glTF is a
simpler way of transmitting 3D assets while rendering the same result.

In short, expect glTF models to work with A-Frame more reliably than other
formats.

## Example

Load a glTF model by pointing to an asset that specifies the `src` for a glTF
file.

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree" src="/path/to/tree.gltf"></a-asset-item>
  </a-assets>

  <a-entity gltf-model="#tree"></a-entity>
</a-scene>
```

## Values

| Type     | Description                          |
|----------|--------------------------------------|
| selector | Selector to an `<a-asset-item>`      |
| string   | `url()`-enclosed path to a glTF file |

## Events

| Event Name   | Description                                |
|--------------|--------------------------------------------|
| model-loaded | glTF model has been loaded into the scene. |
| model-error  | glTF model could not be loaded.            |

## Loading Inline

Alternatively, load a glTF model by specifying the path directly within
`url()`. However, the scene won't wait for the resource to load before
rendering.

```html
<a-entity gltf-model="url(/path/to/tree.gltf)"></a-entity>
```

## Using animations

If you want to use the animations from your glTF model, you can use the [animation-mixer](https://github.com/donmccurdy/aframe-extras/tree/master/src/loaders#animation) component from [aframe-extras](https://github.com/donmccurdy/aframe-extras). By default all animations are played in a loop.

```html
<a-entity gltf-model="#monster" animation-mixer></a-entity>
```

## Geometry compression with Draco

[draco]: https://google.github.io/draco/
[gltf-pipeline]: https://github.com/AnalyticalGraphicsInc/gltf-pipeline

Geometry in a glTF model may be compressed using the [Draco library][draco].
For models containing primarily geometry, with simple untextured materials or
vertex colors, compression can often reduce file size by 90–95%. When the model
contains other large data — like textures or animation, which Draco does not
affect — file size savings will be less significant.

The tradeoff with any form of compression will be decoding time. Compressed
models take less time to download and use less bandwidth, but cannot be rendered
until they're decompressed. To avoid dropping frames in VR, delay the beginning
of the experience until models are downloaded and decompressed.

To apply Draco compression to an existing glTF model, use
[glTF-Pipeline][gltf-pipeline]. You'll also need to host the Draco decoder
library with your scene and configure scene properties as explained below.

## Scene properties

[draco-decoders]: https://github.com/mrdoob/three.js/tree/master/examples/js/libs/draco/gltf

When using glTF models compressed with Draco, you must host the Draco decoder
library with your scene and configure the path to the decoder:

```html
<a-scene gltf-model="dracoDecoderPath: path/to/decoder/;">
  <a-entity gltf-model="url(pony.glb)"></a-entity>
</a-scene>
```

| Property         | Description                                                                                                                                                                                           | Default Value                       |
|------------------|--------------------------------------|----|
| dracoDecoderPath | Path to the Draco decoder libraries. | '' |

The decoder folder must contain three files:

* `draco_decoder.js` — Emscripten-compiled decoder, compatible with any modern browser.
* `draco_decoder.wasm` — WebAssembly decoder, compatible with newer browsers and devices.
* `draco_wasm_wrapper.js` — JavaScript wrapper for the WASM decoder.

All files are available from the three.js repository, under
[examples/js/libs/draco/gltf][draco-decoders]. The `gltf-model` component will
automatically choose whether to use a WASM or JavaScript decoder, so both should
be included.

## More Resources

[sketchfab]: https://sketchfab.com/models?features=downloadable&sort_by=-likeCount
[blender]: https://www.blender.org/
[obj-converter]: https://github.com/AnalyticalGraphicsInc/obj2gltf
[fbx-converter]: https://github.com/facebookincubator/FBX2glTF
[collada-converter]: http://cesiumjs.org/convertmodel.html

Over 100,000 glTF models are free for download on [Sketchfab][sketchfab], and
various exporters and converters converters are available:

- [Blender 2.80+][blender]
- [OBJ &rarr; glTF][obj-converter]
- [FBX &rarr; glTF][fbx-converter]
- [COLLADA &rarr; glTF][collada-converter]
- [glTF Workflow for A Saturday Night](https://blog.mozvr.com/a-saturday-night-gltf-workflow/)

[spec]: https://github.com/KhronosGroup/glTF

See the [official glTF specification][spec] for available features, community
resources, and ways to contribute.
