---
title: <a-ring>
type: primitives
layout: docs
parent_section: primitives
order: 14
---

The ring primitive creates a ring or disc shape. It is an entity that prescribes the [geometry](../components/geometry.html) with its geometric primitive set to `ring`.

## Example

```html
<a-assets>
  <img id="texture" src="texture.png">
</a-assets>

<!-- Basic ring. -->
<a-ring color="teal" radius-inner="1" radius-outer="2"></a-ring>

<!-- Textured ring. -->
<a-ring src="#texture"></a-ring>
```

## Attributes

Note that the ring primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute      | Component Mapping      |
|----------------|------------------------+
| radius-inner   | geometry.radiusInner   |
| radius-outer   | geometry.radiusOuter   |
| segments-phi   | geometry.segmentsPhi   |
| segments-theta | geometry.segmentsTheta |
| theta-length   | geometry.thetaLength   |
| theta-start    | geometry.thetaStart    |
