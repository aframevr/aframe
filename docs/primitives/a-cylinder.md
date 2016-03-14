---
title: <a-cylinder>
type: primitives
layout: docs
parent_section: primitives
order: 9
---

The cylinder primitive is an entity that prescribes the [geometry](../components/geometry.html) with its geometric primitive set to `cylinder`. It can be used to create tubes and curved surfaces.

## Examples

The cylinder primitive is versatile and can actually be used to create various shapes:

```html
<!-- Basic cylinder. -->
<a-cylinder color="crimson" height="3" radius="1.5"></a-cylinder>

<!-- Hexagon. -->
<a-cylinder color="cyan" segments-radial="8"></a-cylinder>

<!-- Pac-man. -->
<a-cylinder color="yellow" theta-start="50" theta-length="280" side="double"></a-cylinder>

<!-- Green pipe. -->
<a-cylinder color="green" open-ended="true"></a-cylinder>
```

## Attributes

Note that the cylinder primitive inherits common [mesh attributes](./mesh-attributes.html).

| Attribute       | Component Mapping       | Default Value |
|-----------------|-------------------------|---------------|
| height          | geometry.height         | 1.5           |
| open-ended      | geometry.openEnded      | false         |
| radius          | geometry.radius         | 0.75          |
| segments-height | geometry.segmentsHeight | 1             |
| segments-radial | geometry.segmentsRadial | 36            |
| theta-length    | geometry.thetaLength    | 360           |
| theta-start     | geometry.thetaStart     | 0             |
