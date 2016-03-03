---
title: <a-cone>
type: primitives
layout: docs
parent_section: primitives
order: 6
---

The cone primitive creates a cone shape. It is an entity that prescribes the [geometry](../components/geometry.html) with its geometric primitive set to `cone`.

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

Note that the cone primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute       | Component Mapping       | Default Value |
|-----------------+-------------------------+---------------|
| height          | geometry.height         | 1.5           |
| open-ended      | geometry.openEnded      | false         |
| radius-bottom   | geometry.radiusBottom   | 0.75          |
| radius-top      | geometry.radiusTop      | 0.75          |
| segments-height | geometry.segmentsHeight | 1             |
| segments-radial | geometry.segmentsRadial | 36            |
| theta-length    | geometry.thetaLength    | 360           |
| theta-start     | geometry.thetaStart     | 0             |
