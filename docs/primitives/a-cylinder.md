---
title: <a-cylinder>
type: primitives
layout: docs
parent_section: primitives
---

The cylinder primitive is an entity that prescribes the [geometry](../components/geometry.md) with its geometric primitive set to `cylinder`. It can be used to create tubes and curved surfaces.

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

| Attribute       | Component Mapping       | Default Value |
| --------        | -----------------       | ------------- |
| color           | material.color          | #FFF          |
| height          | geometry.height         | 1             |
| metalness       | material.metalness      | 0             |
| opacity         | material.opacity        | 1             |
| open-ended      | geometry.openEnded      | false         |
| radius          | geometry.radius         | 1             |
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
