---
title: <a-ring>
type: primitives
layout: docs
parent_section: primitives
---

The ring primitive creates a ring or disc shape. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `ring`.

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

| Attribute      | Component Mapping      | Default Value |
| --------       | -----------------      | ------------- |
| color          | material.color         | #FFF          |
| metalness      | material.metalness     | None          |
| opacity        | material.opacity       | 1             |
| radius-inner   | geometry.radiusInner   | 0.8           |
| radius-outer   | geometry.radiusOuter   | 1.2           |
| repeat         | material.repeat        | None          |
| roughness      | material.roughness     | 0.5           |
| segments-phi   | geometry.segmentsPhi   | 10            |
| segments-theta | geometry.segmentsTheta | 32            |
| shader         | material.shader        | standard      |
| side           | material.side          | front         |
| src            | material.src           | None          |
| theta-length   | geometry.thetaLength   | 360           |
| theta-start    | geometry.thetaStart    | 0             |
| transparent    | material.transparent   | None          |
