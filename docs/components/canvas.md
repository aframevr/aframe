---
title: canvas
type: components
layout: docs
parent_section: components
---

The canvas component allows us to specify our own canvas or the size of the injected canvas. The canvas component applies only to the [`<a-scene>` element][scene].

## Example

We can specify our own canvas.

```html
<a-scene canvas="canvas: #mycanvas"></a-scene>
```

Or specify the width and height in percent of the injected canvas.

```html
<a-scene canvas="height: 50; width: 50"></a-scene>
```

## Properties

| Property | Description                                           | Default Value |
|----------|-------------------------------------------------------|---------------|
| canvas   | Selector to a canvas element that exists on the page. | null          |
| height   | Height of the injected canvas, in percentage.         | 100           |
| width    | Width of the injected canvas, in percentage.          | 100           |

[scene]: ../core/scene.md
