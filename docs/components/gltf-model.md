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

## Using compression

[draco]: https://google.github.io/draco/
[meshopt]: https://github.com/zeux/meshoptimizer
[gltf-pipeline]: https://github.com/AnalyticalGraphicsInc/gltf-pipeline
[gltf-transform]: https://gltf-transform.donmccurdy.com/
[gltfpack]: https://github.com/zeux/meshoptimizer/tree/master/gltf
[github-pages-issue]: https://github.community/t/support-for-gzip-on-glb-3d-model-files/11004#M2962

glTF file size may be reduced using [Draco][draco] or [Meshopt][meshopt] compression. Neither of these affect textures, which should be compressed or resized by other methods. Furthermore, compression does not particularly affect framerate — if the model has too many triangles or draw calls, compression will not change that, and the model should be simplified using tools like [Blender][blender] or [gltfpack][gltfpack], instead.

- **Draco:** Compression for geometry, often reducing geometry size by 90-95%. Requires some extra time to decompress on the device, but this occurs off the main thread in a Web Worker.
- **Meshopt:** Compression for geometry, morph targets, and animation. If combined with additional lossless compression (like gzip) Meshopt may have similar compression ratios to Draco, with much faster decompression. _Note: Some web servers do not support gzip with `.glb` or `.gltf` files (see: [GitHub Pages][github-pages-issue])._

To optimize an existing glTF model, use tools such as:

- [Blender][blender] for Draco compression
- [glTF-Pipeline][gltf-pipeline] for Draco compression
- [glTF-Transform][gltf-transform] for Draco or Meshopt compression
- [gltfpack][gltfpack] for Meshopt compression

You'll also need to load a decoder library by configuring scene properties as explained below.

## Scene properties

[draco-decoders]: https://github.com/mrdoob/three.js/tree/master/examples/js/libs/draco/gltf
[meshopt-decoder]: https://github.com/zeux/meshoptimizer/tree/master/js

When using glTF models compressed with Draco, KTX2 or Meshopt, you must configure the path to the necessary decoders:

```html
<a-scene gltf-model="dracoDecoderPath: path/to/decoder/;
    basisTranscoderPath: path/to/transcoder/;
    meshoptDecoderPath: path/to/meshopt_decoder.js;">
  <a-entity gltf-model="url(pony.glb)"></a-entity>
</a-scene>
```

| Property         | Description                                                                                                                                                                                           | Default Value                       |
|------------------|--------------------------------------|----|
| dracoDecoderPath | Path to the Draco decoder libraries. | 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/' |
| basisTranscoderPath | Path to the basis/KTX2 transcoder libraries. | '' |
| meshoptDecoderPath | Path to the Meshopt decoder.       | '' |

`dracoDecoderPath` path must be a folder containing three files:

* `draco_decoder.js` — Emscripten-compiled decoder, compatible with old browsers like IE11.
* `draco_decoder.wasm` — WebAssembly decoder, compatible with modern browsers.
* `draco_wasm_wrapper.js` — JavaScript wrapper for the WASM decoder.

These files are available from the three.js repository, under
[examples/js/libs/draco/gltf][draco-decoders]. The `gltf-model` component will
automatically choose whether to use a WASM or JavaScript decoder, so both should
be included.

`basisTranscoderPath` path must be a folder containing two files:

    basis_transcoder.js — JavaScript wrapper for the WebAssembly transcoder.
    basis_transcoder.wasm — WebAssembly transcoder.

These files are available from the three.js repository in [`/examples/js/libs/basis`](https://github.com/mrdoob/three.js/tree/master/examples/js/libs/basis).


`meshoptDecoderPath` path should be the complete file path (including filename) for a Meshopt decoder, typically named `meshopt_decoder.js`. Meshopt requires WebAssembly support. A CDN-hosted, versioned decoder is available at `https://unpkg.com/meshoptimizer@0.16.0/meshopt_decoder.js`, or you may download copies from the [meshoptimizer GitHub repository][meshopt-decoder].

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
