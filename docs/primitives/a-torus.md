---
title: <a-torus>
type: primitives
layout: docs
parent_section: primitives
---

The torus primitive creates donut or tube shapes using the [geometry][geometry]
component with the type set to `torus`.

## Example

```html
<a-torus color="#43A367" arc="270" radius="5" radius-tubular="0.1"></a-torus>
```

## Attributes

| Attribute        | Component Mapping        | Default Value |
| --------         | -----------------        | ------------- |
| arc              | geometry.arc             | 360           |
| color            | material.color           | #FFF          |
| metalness        | material.metalness       | 0             |
| opacity          | material.opacity         | 1             |
| radius           | geometry.radius          | 1             |
| radius-tubular   | geometry.radiusTubular   | 0.2           |
| repeat           | material.repeat          | None          |
| roughness        | material.roughness       | 0.5           |
| segments-radial  | geometry.segmentsRadial  | 0             |
| segments-tubular | geometry.segmentsTubular | 32            |
| shader           | material.shader          | standard      |
| side             | material.side            | front         |
| src              | material.src             | None          |
| transparent      | material.transparent     | false         |

[geometry]: ../components/geometry.md
