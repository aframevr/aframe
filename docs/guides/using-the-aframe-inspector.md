---
title: Using the A-Frame Inspector
type: guides
layout: docs
parent_section: guides
order: 2
---

[github]: https://github.com/aframevr/aframe-inspector

The [A-Frame Inspector][github] is a
visual tool for inspecting and tweaking scenes. With the Inspector, we can:

- Drag, rotate, and scale entities using handles and helpers
- Tweak an entity's components and their properties using widgets
- Immediately see results from changing values without having to go back and
  forth between code and the browser

The Inspector is similar to the browser's DOM inspector but tailored for 3D and
A-Frame. We can toggle the Inspector to open up any A-Frame scene in the wild
Let's view source!

![Inspector Preview](https://cloud.githubusercontent.com/assets/674727/17754515/b5596eb6-6489-11e6-9485-4cb10fa5b100.png)

## Opening the Inspector

The easiest way to use is to press the **`<ctrl> + <alt> + i`** shortcut on
your keyboard. This will fetch the Inspector code via CDN and open up our scene
in the Inspector. The same shortcut toggles the Inspector closed.

Not only can we open our local scenes inside the Inspector, we can open any
A-Frame scene in the wild using the Inspector (as long as the author has not
explicitly disabled it).

See the [Inspector README][github] for details on serving local, development,
or custom builds of the Inspector.

## Using the Inspector

### Scene Graph

The Inspector's scene graph is a tree-based representation of the scene.  We
can use the scene graph to *select, search, delete, clone, and add entities* or
exporting HTML.

![Inspector Scene Graph](https://cloud.githubusercontent.com/assets/674727/18565455/ae082fea-7b44-11e6-856f-2b9ca0e60bed.gif)

The scene graph lists A-Frame entities rather than internal three.js objects.
Given HTML is also a representation of the scene graph, the Inspector's scene
graph mirrors the underlying HTML closely. Entities are displayed using their
HTML ID or HTML tag name.

### Viewport

The viewport displays the scene from the Inspector's point of the view. We can
rotate, pan, or zoom the viewport to change the view of the scene:

- **Rotate:** hold down left mouse button (or one finger down on a trackpad) and drag
- **Pan:** hold down right mouse button (or two fingers down on a trackpad) and drag
- **Zoom:** scroll up and down (or two-finger scroll on a trackpad)

From the viewport, we can also select entities and transform them:

- **Select**: left-click on an entity
- **Transform**: select a helper tool on the upper-right corner of the
  viewport, drag the red/blue/green helpers surrounding an entity to transform
  it

![Inspector Viewport](https://cloud.githubusercontent.com/assets/674727/18565454/ad047c84-7b44-11e6-8c4a-0f1fe55c6682.gif)

### Components Panel

The components panel displays the selected entity's components and properties.
We can modify values of common components (e.g., position, rotation, scale),
modify values of attached components, add and remove mixins, and add and remove
components.

The type of widget for each property depends on the property type. For example,
booleans use a checkbox, numbers use a value slide, and colors use a color
picker.

We can copy the HTML output of individual components. This is useful for
visually tweaking and finding the desired value of a component and then syncing
it back to source code.

![Inspector Components](https://cloud.githubusercontent.com/assets/674727/18565449/aa63a7b6-7b44-11e6-999c-450c88812293.gif)

### Shortcuts

You can press **`h`** key to see a list of all the shortcuts available.
