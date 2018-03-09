---
title: Building with MagicaVoxel
type: guides
layout: docs
parent_section: guides
order: 7
examples: []
---

[magicavoxel]: https://ephtracy.github.io/

[MagicaVoxel][magicavoxel] is a free and user-friendly tool for building
3D scenes and models using *voxels* (i.e., blocks). MagicaVoxel makes modeling super
easy, similar to building in Minecraft.

![magicavoxel](https://i.imgur.com/XYYXjIn.jpg)

<!--toc-->

## Installation

MagicaVoxel works on Windows and OS X. On the [MagicaVoxel
homepage][magicavoxel], click the *Download* button and install the application:

![magicavoxel install](https://i.imgur.com/GmgdyHs.jpg)

On macOS, open the MagicVoxel app file by clicking on it in Finder. Initially,
you will see a message noting that you cannot open applications from
unidentified developers. After dismissing that message, open the
*Security & Privacy* settings pane and click "Open Anyway" on the MagicVoxel app:

![osx security](http://i.imgur.com/DAsjv4F.png)

Alternatively, you can find the MagicVoxel app file in Finder, right click on it,
and then choose "Open" from the shortcut menu. In the subsequent dialogue
click "Open" again. For more information, visit [Apple's documentation](https://support.apple.com/kb/PH25088?locale=en_US) on unidentified developers.

## Tutorial

The official tutorial video serves as a good introduction to using MagicaVoxel.
The author quickly runs through many basic features in 10 minutes:

<iframe width="560" height="315" src="https://www.youtube.com/embed/PPu7SJ1_bwc" frameborder="0" allowfullscreen></iframe>

The best way to learn the MagicaVoxel UI is to click around, play with application controls,
and pay attention to the tooltips on hover. Many developers are able to create their first
scene within a half hour!  Given the absence of official tutorials, however,
the following serves as a quick guide to navigating the UI.

### Viewport

The center panel hosts the viewport where we build our model. We can change the
viewport our mouse/trackpad or the `wasd` keys:

- **Pan**: Hold `<space> + <right-click>` and move the mouse or trackpad, or
  hold `<space>` and press one of the `<a>` or `<d>` keys.
- **Rotate**: Hold `<right-click>` and move the mouse or trackpad, or press one
  of the `<a>` or `<d>` keys.
- **Zoom**: Scroll up and down with the mouse or trackpad, or press one of the
  `<w>` or `<s>` keys.

![magicavoxel viewport](http://imgur.com/vq34Mkk.jpg)

The top right corner of the viewport allows you to change the bounding dimensions
of the model. Note that in MagicaVoxel, the XY plane is horizontal and the Z
axis points up.

### Color Palette

The left panel is the color palette. You can use the default palettes,
modify them, create your own, and save them. The palette is tied to the scene
so if you change from the palette a color that a voxel is using, the voxel will
update its color. At the bottom, there are tools to define your own color with
sliders or via copying and pasting hex or rgb values:

![magicavoxel color palette](https://i.imgur.com/vq34Mkk.jpg)

### Brushes

The brushes panel is to the right of the color palette. Brushes add, erase, or
paint voxels in various shapes, sizes, and patterns. With a brush selected,
simply click in the viewport on your model to use it:

![magicavoxel brushes](https://i.imgur.com/pqrUAFT.gif)

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

![magicavoxel actions](https://i.imgur.com/uLQcQrT.gif)

Below the actions are three color picking tools to pick, remove, and place
color. It is useful to know the `<alt> + <click>` shortcut to select a color by
clicking on a voxel.

## Exporting to A-Frame

After creating your model, you can export it to an A-Frame scene for the world
to see! We recommend exporting to either the `.PLY` or `.OBJ` formats.

### `.PLY` (with Baked Shadows)

![magicavoxel ply](https://i.imgur.com/OIdqrSH.jpg)

[ply]: https://wikipedia.org/wiki/PLY_(file_format)

The [PLY][ply] format produces a large file size but includes *baked
shadows*, meaning the rendered shadow colors are stored in the file. The
A-Frame scenes shown above produce a ~5MB file size with baked shadows.
It depends on your desired constraints whether or not file sizes on this order
is tolerable, but exporting with baked shadows will look visually great in
A-Frame.

[aframe-extras]: https://github.com/donmccurdy/aframe-extras/

To see the `.PLY` model in A-Frame, use the `ply-model` component found
in Don McCurdy's [aframe-extras][aframe-extras]. Currently the model must be
rotated by `-90 0 0` to display properly:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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
also produce a `.MTL` for the colors and textures. You will need to include both
and put them in the same directory as each other.

To render a `.OBJ` in A-Frame with HTML:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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
