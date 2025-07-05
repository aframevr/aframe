---
title: obj-model
type: components
layout: docs
parent_section: components
source_code: src/components/obj-model.js
examples:
 - title: Modifying Material of Model
   src: https://aframe.io/aframe/examples/test/gltf-model/modify-materials.html
---

The obj-model component loads a 3D model and material using a
[Wavefront][wavefront-wiki] (.OBJ) file and a .MTL file.

## Example

We can load an .OBJ model by pointing to assets that specify the path to an .OBJ and .MTL file.

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree-obj" src="/path/to/tree.obj"></a-asset-item>
    <a-asset-item id="tree-mtl" src="/path/to/tree.mtl"></a-asset-item>
  </a-assets>

  <a-entity obj-model="obj: #tree-obj; mtl: #tree-mtl"></a-entity>
</a-scene>
```

## Properties

| Property   | Description                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------                                                                       |
| obj        | Selector to an `<a-asset-item>` pointing to a .OBJ file or an inline path to a .OBJ file.                                                                         |
| mtl        | Selector to an `<a-asset-item>` pointing to a .MTL file or an inline path to a .MTL file. Optional if you wish to use the [material component][material] instead. |

## Events

| Event Name   | Description                                                                                 |
| ----------   | ------------------------------------------------------------------------------------------- |
| model-loaded | .OBJ model has been loaded into the scene.                                                  |

## Loading Inline

We can also load assets by specifying the path directly within `url()`. Note this is less performant than going through the asset management system.

```html
<a-entity obj-model="obj: url(/path/to/tree.obj); mtl: url(/path/to/tree.mtl)"></a-entity>
```

## Troubleshooting

See [Introduction → 3D Models → Troubleshooting](../introduction/models.md#troubleshooting).

## Additional Resources

We can find and download models on the web to drop into our scenes:

- [Sketchup's 3D Warehouse][sketchup] - Repository of models.
- [Clara.io][clara] - Repository of models.
- [Blender][blender] - A free open-source 3D modeling program with plenty of existing learning resources to create models.

[blender]: https://www.blender.org/
[clara]: https://clara.io
[material]: ./material.md
[sketchup]: https://3dwarehouse.sketchup.com
[wavefront-wiki]: https://en.wikipedia.org/wiki/Wavefront_.obj_file
