---
title: <a-light>
type: primitives
layout: docs
parent_section: primitives
---

The light primitive adjusts the lighting setup of the scene. It is an entity that maps attributes to properties of the [light component](../components/light.md).

## Examples


```html
<!-- Red directional light shining from the top left. -->
<a-light color="red" position="-1 1 0"></a-light>

<!-- Blue point light, 5 meters in the air. -->
<a-light type="point" color="blue" position="0 5 0"></a-light>

<!-- Dim ambient lighting. -->
<a-light type="ambient" color="#222"></a-light>
```

## Attributes

| Attribute    | Component Mapping | Default Value |
| ------------ | ----------------- | ------------- |
| angle        | light.angle       | 60            |
| color        | light.color       | #fff          |
| decay        | light.decay       | 1             |
| distance     | light.distance    | 0.0           |
| ground-color | light.groundColor | #fff          |
| intensity    | light.intensity   | 1.0           |
| penumbra     | light.penumbra    | 0.0           |
| type         | light.type        | directional   |
| target       | light.target      | null          |

## Differences with the Default Lighting

When we add a light, A-Frame will remove the default lighting setup (i.e., one directional light from the top-left, and one small ambient light).
