---
title: gltf-model
type: components
layout: docs
parent_section: components
---

[glTF][about-gltf] is an open project by Khronos providing a common, extensible format for 3D assets that is both efficient and highly interoperable with modern web technologies.

The gltf-model component loads a 3D model using a glTF (.gltf or .glb) file.

## Example

We can load a glTF model by pointing to an asset that specifies the `src` to a glTF file.

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree" src="/path/to/tree.gltf"></a-asset-item>
  </a-assets>

  <a-entity collada-model="#tree"></a-entity>
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

We can also load a glTF model by specifying the path directly within `url()`. Note this is less performant than going through the asset management system.

```html
<a-entity gltf-model="url(/path/to/tree.gltf)"></a-entity>
```

## More Resources

Converters:

- [FBX → glTF][fbx-converter] - coming soon.
- [COLLADA → glTF][collada-converter].
- [OBJ → glTF][obj-converter].

See the [official glTF specification][spec] for available features, community resources, and ways to contribute.

[fbx-converter]: http://gltf.autodesk.io/
[collada-converter]: http://cesiumjs.org/convertmodel.html
[obj-converter]: https://github.com/AnalyticalGraphicsInc/obj2gltf
[spec]: https://github.com/KhronosGroup/glTF
[about-gltf]: https://www.khronos.org/gltf
