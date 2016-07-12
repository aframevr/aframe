---
title: <a-torus-knot>
type: primitives
layout: docs
parent_section: primitives
---

The torus knot primitive creates pretzel shapes using the [geometry][geometry]
component with the type set to `torusKnot`.

## Example

```html
<a-torus-knot color="#B84A39" arc="180" p="2" q="7" radius="5" radius-tubular="0.1"></a-torus-knot>
```

## Attributes

| Attribute        | Component Mapping        | Default Value |
| --------         | -----------------        | ------------- |
| color            | material.color           | #FFF          |
| metalness        | material.metalness       | 0             |
| opacity          | material.opacity         | 1             |
| p                | geometry.p               | 2             |
| q                | geometry.q               | 3             |
| radius           | geometry.radius          | 1             |
| radius-tubular   | geometry.radiusTubular   | 0.2           |
| repeat           | material.repeat          | None          |
| roughness        | material.roughness       | 0.5           |
| segments-radial  | geometry.segmentsRadial  | 36            |
| segments-tubular | geometry.segmentsTubular | 100           |
| shader           | material.shader          | standard      |
| side             | material.side            | front         |
| src              | material.src             | None          |
| transparent      | material.transparent     | false         |

[geometry]: ../components/geometry.md
