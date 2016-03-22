---
title: <a-torus>
type: primitives
layout: docs
parent_section: primitives
order: 19
---

The torus primitive creates a donut or circular tube shape. It is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `torus`.

## Example

```html
<a-torus color="blue" position="0 0 0" segments-radial="50" segments-tubular="200" radius="5"
         radius-tubular="0.1"></a-torus>
```

## Attributes

Note that the torus primitive inherits common [mesh attributes](./mesh-attributes.md).

| Attribute         | Component Mapping        | Default Value |
|-------------------|--------------------------|---------------|
| arc               | geometry.arc             | 360           |
| radius            | geometry.radius          | 1             |
| radius-tubular    | geometry.radiusTubular   | 0.2           |
| segments-radial   | geometry.segmentsRadial  | 36            |
| segments-tubular  | geometry.segmentsTubular | 8             |
