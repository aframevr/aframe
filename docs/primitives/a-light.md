---
title: <a-light>
type: primitives
layout: docs
parent_section: primitives
order: 7
---

The light primitive wraps an entity that contains a light component. There are several types of lights available, each with unique properties. To dig into the options consult the documentation for the [light component](../components/light.html).

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

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-light.html)

## Replacing the default scene lights

When we manually add a light primitive to our scene, A-Frame does not create the [default scene lights](../guide/cameras-and-lights.html).

## Examples

Red directional light shining from the top left:

```html
<a-light color="red" position="-1 1 0"></a-light>
```

Blue point light, 5 meters in the air:

```html
<a-light color="blue" position="0 5 0" type="point"></a-light>
```
