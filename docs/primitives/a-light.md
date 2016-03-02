---
title: <a-light>
type: primitives
layout: docs
parent_section: primitives
order: 11
---

The light primitive adjusts the lighting setup of the scene. It is an entity that maps attributes to properties of the [light component](../components/light.html).

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

| Attribute    | Default Value | Component Mapping |
| ------------ | ------------- | ----------------- |
| angle        | 60            | light.angle       |
| color        | #fff          | light.color       |
| decay        | 1             | light.decay       |
| distance     | 0.0           | light.distance    |
| exponent     | 10.0          | light.exponent    |
| ground-color | #fff          | light.groundColor |
| intensity    | 1.0           | light.intensity   |
| type         | directional   | light.type        |

## Differences with the Default Lighting

When we add a light, A-Frame will remove the default lighting setup (i.e., one directional light from the top-left, and one small ambient light).
