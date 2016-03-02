---
title: <a-box>
type: primitives
layout: docs
parent_section: primitives
order: 3
---

The box primitive, formerly called `<a-cube>`, creates shapes such as boxes, cubes, or walls. It is an entity that prescribes the [geometry](../components/geometry.html) with its geometric primitive set to `box`.

## Example

```html
<a-assets>
  <img id="texture" src="texture.png">
</a-assets>

<!-- Basic box. -->
<a-box color="tomato" depth="2" height="4" width="0.5"></a-box>

<!-- Textured box. -->
<a-box src="#texture"></a-box>
```

## Attributes

Note that the box primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute | Component Mapping | Default Value |
|-----------+-------------------+---------------|
| depth     | geometry.depth    | 2             |
| height    | geometry.height   | 2             |
| width     | geometry.width    | 2             |
