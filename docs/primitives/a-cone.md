---
title: <a-cone>
type: primitives
layout: docs
parent_section: primitives
---

The cone primitive creates a cone shape. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `cone`.

## Example

```html
<a-assets>
  <img id="texture" src="texture.png">
</a-assets>

<!-- Basic cone. -->
<a-cone color="tomato" radius-bottom="2" radius-top="0.5"></a-cone>

<!-- Textured box. -->
<a-cone src="#texture"></a-cone>
```

## Attributes

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| height          | geometry.height         | 1             |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| open-ended      | geometry.openEnded      | false         |
| radius-bottom   | geometry.radiusBottom   | 1             |
| radius-top      | geometry.radiusTop      | 0.8           |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-height | geometry.segmentsHeight | 18            |
| segments-radial | geometry.segmentsRadial | 36            |
| shader          | material.shader         | standard      |
| side            | material.side           | front         |
| src             | material.src            | None          |
| theta-length    | geometry.thetaLength    | 360           |
| theta-start     | geometry.thetaStart     | 0             |
| transparent     | material.transparent    | false         |
