---
title: <a-sphere>
type: primitives
layout: docs
parent_section: primitives
order: 16
---

The sphere primitive creates a spherical or polyhedron shapes. It wraps an entity that prescribes the [geometry component](../components/geometry.html) with its geometric primitive set to `sphere`.

## Example

```html
<a-sphere color="yellow" radius="5"></a-sphere>
```

## Attributes

Note that the sphere primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute       | Component Mapping | Default Value           |
|-----------------+-------------------+-------------------------|
| radius          | 0.85              | geometry.radius         |
| segments-height | 18                | geometry.segmentsHeight |
| segments-width  | 36                | geometry.segmentsWidth  |
