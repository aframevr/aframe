---
title: Build with MagicaVoxel
type: guides
layout: docs
parent_section: guides
order: 3
---

[magicavoxel]: https://ephtracy.github.io/

[MagicaVoxel][magicavoxel] is a free and user-friendly tool that lets you build
3D scenes and models using *voxels* (i.e., blocks). This makes modeling super
easy, similar to building in Minecraft.

![magicavoxel](http://i.imgur.com/XYYXjIn.jpg)

<!--toc-->

## Installation

MagicaVoxel works on Windows and OS X. On the [MagicaVoxel
homepage][magicavoxel], click the *Download* button and install it:

![magicavoxel install](http://i.imgur.com/GmgdyHs.jpg)

On OS X, make sure to allow third-party applications that have not been installed
from the App Store in the *Security & Privacy* settings:

![osx security](http://i.imgur.com/iaa4pSO.jpg)

## Tutorial

A good basic introduction to using MagicaVoxel is to watch the official
tutorial video as the author quickly runs through a lot of the features in 10
minutes:

<iframe width="560" height="315" src="https://www.youtube.com/embed/PPu7SJ1_bwc" frameborder="0" allowfullscreen></iframe>

The best way to learn is to click around, play with the UI, and pay attention
to the tooltips on hover. We were able to create a scene in less than 20
minutes without having ever used the program nor watched any tutorials. But
given the absence of official tutorials, we will provide guidance on navigating
the UI.

### Viewport

In the center is the viewport where we build our model. We can change the
viewport with our mouse/trackpad or the `wasd` keys:

- **Pan**: Hold `<space> + <right-click>` and move the mouse or trackpad, or
  hold `<space>` and press one of the `<a>` or `<d>` keys.
- **Rotate**: Hold `<right-click>` and move the mouse or trackpad, or press one
  of the `<a>` or `<d>` keys.
- **Zoom**: Scroll up and down with the mouse or trackpad, or press one of the
  `<w>` or `<s>` keys.

![magicavoxel viewport](http://imgur.com/vq34Mkk.jpg)

On the top right, we can change the bounding dimensions of our model. Note, in
MagicaVoxel, the XY plane is horizontal, and the Z axis points up.

### Color Palette

On the left panel is the color palette. You can use the default palettes,
modify them, create your own, and save them. The palette is tied to the scene
so if you change from the palette a color that a voxel is using, the voxel will
update its color. At the bottom, there are tools to define your own color with
sliders or via copying and pasting hex or rgb values:

![magicavoxel color palette](http://i.imgur.com/vq34Mkk.jpg)

### Brushes

The brushes panel is on the right of the color palette. Brushes add, erase, or
paint voxels in various shapes, sizes, and patterns. With a brush selected, you
simply click in the viewport on your model to use it:

![magicavoxel brushes](http://i.imgur.com/pqrUAFT.gif)

There are six brushes:

- **V (Voxel)**: Works on individual or discrete groups of voxels.
- **F (Face)**: Works on groups of adjacent voxels that are the same shape or color.
- **B (Box)**: Works on a 2-dimensional box of voxels where we control the area
  of the box by dragging.
- **L (Line)**: Works on a 1-dimensional line of voxels where we control the
  length of the line by dragging.
- **C (Center)**: Works on a circle or square of voxels where we control the
  radius of the shape by dragging.
- **P (Pattern)**: The pattern brush lets us use other MagicaVoxel models and paste them
  into the current model. Useful for placing repeated shapes.

### Actions

There are four actions that work in conjunction with the brush type:

- **Attach (t)**: Add voxel(s).
- **Erase (r)**: Remove voxel(s).
- **Paint (g)**: Change color of existing voxel(s).
- **Move**: Moves entire model. Unfortunately, there is no way to select
  individual voxel(s) to move.

![magicavoxel actions](http://i.imgur.com/uLQcQrT.gif)

Below the actions are three color picking tools to pick, remove, and place
color. It is useful to know the `<alt> + <click>` shortcut to select a color by
clicking on a voxel.

## Exporting to A-Frame

After creating your model, we can export it to an A-Frame scene for the world
to see! We recommend exporting to either the `.PLY` or `.OBJ` formats.

### `.PLY` (with Baked Shadows)

![magicavoxel ply](http://i.imgur.com/OIdqrSH.jpg)

[ply]: https://wikipedia.org/wiki/PLY_(file_format)

The [PLY][ply] format produces a large file size, but it includes *baked
shadows*, meaning the rendered shadow colors are stored in the file. The
A-Frame scenes shown above produces about a 5MB file size with baked shadows.
It depends on your desired constraints whether or not file sizes on this order
is tolerable, but it exporting with baked shadows will look visually great in
A-Frame.

[aframe-extras]: https://github.com/donmccurdy/aframe-extras/

To see the `.PLY` model in A-Frame, we can use the `ply-model` component found
in Don McCurdy's [aframe-extras][aframe-extras]. Currently for some reason, we
must rotate the model by `-90 0 0` to have it straight:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.3.0/aframe.min.js"></script>
    <script src="https://rawgit.com/donmccurdy/aframe-extras/v2.1.1/dist/aframe-extras.loaders.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-assets>
        <a-asset-item id="myPlyModel" src="myModel.ply"></a-asset-item>
      </a-assets>

      <a-entity ply-model="src: #myPlyModel" rotation="-90 0 0"></a-entity>
    </a-scene>
  </body>
</html>
```

### `.OBJ`

The `.OBJ` format produces a much smaller file size than `.PLY`, but
MagicaVoxel does not support baked exports to `.OBJ`. Exporting to `.OBJ` will
also produce a `.MTL` for the colors and textures. We will need to include both
and put them in the same directory as each other.

To render a `.OBJ` in A-Frame with HTML:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.3.0/aframe.min.js"></script>
    <script src="https://rawgit.com/donmccurdy/aframe-extras/v2.1.1/dist/aframe-extras.loaders.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-assets>
        <a-asset-item id="myModelObj" src="myModel.obj"></a-asset-item>
        <a-asset-item id="myModelMtl" src="myModel.mtl"></a-asset-item>
      </a-assets>

      <a-entity obj-model="obj: #myModelObj; mtl: #myModelMtl"></a-entity>
    </a-scene>
  </body>
</html>
```

[blender]: https://www.blender.org/

We will later try to produce guides to baking lightmaps and shadowmaps into the
`.OBJ` using [Blender][blender].
