---
title: obj-model
type: components
layout: docs
parent_section: components
order: 12
---

The `obj-model` component loads a 3D model and material using a [Wavefront](https://en.wikipedia.org/wiki/Wavefront) (.OBJ) file and a .MTL file.

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

| Property | Description                                                                               |
|----------|-------------------------------------------------------------------------------------------|
| obj      | Selector to an `<a-asset-item>` pointing to a .OBJ file or an inline path to a .OBJ file. |
| mtl      | Selector to an `<a-asset-item>` pointing to a .MTL file or an inline path to a .MTL file. |

### Loading Inline

We can also load assets by specifying the path directly within `url()`. Note this is less performant than going through the asset management system.

```html
<a-entity obj-model="obj: url(/path/to/tree.obj); mtl: url(/path/to/tree.mtl)"></a-entity>
```

## Downloading Models

We can find and download models on the web to drop into our scenes:

- [Sketchup's 3D Warehouse](https://3dwarehouse.sketchup.com)
- [Clara.io](https://clara.io)

## Creating Models

We can create models using [Blender](https://www.blender.org/), a free open-source 3D modeling program with plenty of existing learning resources.

## Downloading Models

We can find and download models on the web to drop into our scenes:

- [Sketchup's 3D Warehouse](https://3dwarehouse.sketchup.com)
- [Clara.io](https://clara.io)

## Creating Models

We can create models using [Blender](https://www.blender.org/), a free open-source 3D modeling program with plenty of existing learning resources.
