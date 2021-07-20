---
title: <a-light>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-light.js
---

A light changes the lighting and shading of the scene.

## Examples

```html
<!-- Red directional light shining from the top left. -->
<a-light color="red" position="-1 1 0"></a-light>

<!-- Blue point light, 5 meters in the air. -->
<a-light type="point" color="blue" position="0 5 0"></a-light>

<!-- Dim ambient lighting. -->
<a-light type="ambient" color="#222"></a-light>

<!-- Probe light using the #pisa environment map -->
<a-assets>
	<a-cubemap id="pisa">
	<img src="https://threejs.org/examples/textures/cube/pisa/px.png">
	<img src="https://threejs.org/examples/textures/cube/pisa/nx.png">
	<img src="https://threejs.org/examples/textures/cube/pisa/py.png">
	<img src="https://threejs.org/examples/textures/cube/pisa/ny.png">
	<img src="https://threejs.org/examples/textures/cube/pisa/pz.png">
	<img src="https://threejs.org/examples/textures/cube/pisa/nz.png">
	</a-cubemap>
</a-assets>

<a-light type="probe" envMap="#pisa"></a-light>
```

## Attributes

| Attribute    | Component Mapping | Default Value |
| ------------ | ----------------- | ------------- |
| angle        | light.angle       | 60            |
| color        | light.color       | #fff          |
| decay        | light.decay       | 1             |
| distance     | light.distance    | 0.0           |
| envmap       | light.envMap      | null          |
| ground-color | light.groundColor | #fff          |
| intensity    | light.intensity   | 1.0           |
| penumbra     | light.penumbra    | 0.0           |
| type         | light.type        | directional   |
| target       | light.target      | null          |

## Differences with the Default Lighting

When we add a light, A-Frame will remove the default lighting setup (i.e., one
directional light from the top-left, and one small ambient light).
