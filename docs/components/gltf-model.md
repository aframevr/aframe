---
title: gltf-model
type: components
layout: docs
parent_section: components
---

[about-gltf]: https://www.khronos.org/gltf

[glTF][about-gltf] (GL Transmission Format) is an open project by Khronos
providing a common, extensible format for 3D assets that is both efficient and
highly interoperable with modern web technologies.

The `gltf-model` component loads a 3D model using a glTF (`.gltf` or `.glb`)
file.

[threejsgltf]: https://threejs.org/docs/#Examples/Loaders/GLTFLoader

Note that glTF is a fairly new specification and adoption is still growing.
Work on the [three.js glTF loader][threejsgltf] and converters are still
active.

<!--toc-->

## Why use glTF?

[obj-model]: ./obj-model.md
[collada-model]: ./collada-model.md

In comparison to the older [OBJ][obj-model] format, which supports only
vertices, normals, texture coordinates, and basic materials, glTF provides a
more powerful set of features. In addition to all of the above, glTF offers:

- Hierarchical objects
- Scene information (light sources, cameras)
- Skeletal structure and animation
- More robust materials and shaders

For simple models with no animation, OBJ is nevertheless a common and reliable
choice.

In comparison to [COLLADA][collada-model], the supported features are very
similar. However, because glTF focuses on providing a "transmission format"
rather than an editor format, it is more interoperable with web technologies.
By analogy, the .PSD (Adobe Photoshop) format is helpful for editing 2D images,
but images are converted to .JPG for use on the web. In the same way, glTF is a
simpler way of transmitting 3D assets while rendering the same result.

In short, expect glTF models to work with A-Frame more reliably than COLLADA
models.

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

## Loading Inline

Alternatively, load a glTF model by specifying the path directly within
`url()`. However, the scene won't wait for the resource to load before
rendering.

```html
<a-entity gltf-model="url(/path/to/tree.gltf)"></a-entity>
```

## More Resources

The glTF format is fairly new, and few editors will export a `.gltf` file
directly. Instead, various converters are available or in progress:

[fbx-converter]: http://gltf.autodesk.io/
[collada-converter]: http://cesiumjs.org/convertmodel.html
[obj-converter]: https://github.com/AnalyticalGraphicsInc/obj2gltf

- [FBX &rarr; glTF][fbx-converter] - Coming soon.
- [COLLADA &rarr; glTF][collada-converter]
- [OBJ &rarr; glTF][obj-converter]

[spec]: https://github.com/KhronosGroup/glTF

See the [official glTF specification][spec] for available features, community
resources, and ways to contribute.
