---
title: collada-model
type: components
layout: docs
parent_section: components
---

The collada-model component loads a 3D model using a [COLLADA][wiki-collada] (.DAE) file.

## Example

We can load a COLLADA model by pointing to an asset that specifies the `src` to a COLLADA file.

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree" src="/path/to/tree.dae"></a-asset-item>
  </a-assets>

  <a-entity collada-model="#tree"></a-entity>
</a-scene>
```

## Values

| Type     | Description                             |
|----------|-----------------------------------------|
| selector | Selector to an `<a-asset-item>`         |
| string   | `url()`-enclosed path to a COLLADA file |

## Events

| Event Name   | Description                                                                                 |
| ----------   | ------------------------------------------------------------------------------------------- |
| model-loaded | COLLADA model has been loaded into the scene.                                               |

## Loading Inline

We can also load a COLLADA model by specifying the path directly within `url()`. Note this is less performant than going through the asset management system.

```html
<a-entity collada-model="url(/path/to/tree.dae)"></a-entity>
```

## More Resources

We can find and download models on the web to drop into our scenes:

- [Sketchup's 3D Warehouse][sketchup] - Repository of models.
- [Clara.io][clara] - Repository of models.
- [Blender][blender] - A free open-source 3D modeling program with plenty of existing learning resources to create models.

[blender]: https://www.blender.org/
[clara]: https://clara.io
[sketchup]: https://3dwarehouse.sketchup.com
[wiki-collada]: https://en.wikipedia.org/wiki/COLLADA
