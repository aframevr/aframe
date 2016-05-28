---
title: <a-sphere>
type: primitives
layout: docs
parent_section: primitives
---

The sphere primitive creates a spherical or polyhedron shapes. It wraps an entity that prescribes the [geometry component](../components/geometry.md) with its geometric primitive set to `sphere`.

## Example

```html
<a-sphere color="yellow" radius="5"></a-sphere>
```

## Attributes

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| phi-length      | geometry.phiLength      | 360           |
| phi-start       | geometry.phiStart       | 0             |
| radius          | geometry.radius         | 1             |
| repeat          | material.repeat         | None          |
| roughness       | material.roughness      | 0.5           |
| segments-height | geometry.segmentsHeight | 18            |
| segments-width  | geometry.segmentsWidth  | 36            |
| shader          | material.shader         | standard      |
| side            | material.side           | front         |
| src             | material.src            | None          |
| theta-length    | geometry.thetaLength    | 180           |
| theta-start     | geometry.thetaStart     | 0             |
| transparent     | material.transparent    | false         |
