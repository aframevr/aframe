---
title: <a-box>
type: primitives
layout: docs
parent_section: primitives
---

The box primitive, formerly called `<a-cube>`, creates shapes such as boxes, cubes, or walls. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `box`.

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

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| depth           | geometry.depth          | 1             |
| height          | geometry.height         | 1             |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-depth  | geometry.segmentsDepth  | 1             |
| segments-height | geometry.segmentsHeight | 1             |
| segments-width  | geometry.segmentsWidth  | 1             |
| shader          | material.shader         | standard      |
| side            | material.side           | front         |
| src             | material.src            | None          |
| transparent     | material.transparent    | false         |
| width           | geometry.width          | 1             |
