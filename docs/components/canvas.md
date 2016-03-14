---
title: canvas
type: components
layout: docs
parent_section: components
order: 2
---

The `canvas` component allows us to specify our own canvas or the size of the injected canvas. The canvas component applies only to the [`<a-scene>` element](../core/scene.html).

## Example

```html
<a-scene canvas="canvas: #mycanvas"></a-scene>
```

## Properties

Given the type of fog distribution, different properties will apply.

| Property | Description                                           | Default Value |
|----------|-------------------------------------------------------|---------------|
| canvas   | Selector to a canvas element that exists on the page. | null          |
| height   | Height of the injected canvas, in percentage.         | 100           |
| Width    | Width of the injected canvas, in percentage.          | 100           |
