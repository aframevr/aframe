---
title: "Fog"
type: components
layout: docs
parent_section: components
order: 3
---

The `fog` component defines how entities get obscured in fog given distance from the camera. Note that the `fog` component is a global component that applies only to the [`<a-scene>` element](../core/scene.html).

```html
<a-scene fog="type: linear; color: #AAA"></a-scene>
```

Given the type of fog distribution, different properties will apply.

| Property  | Description                                                                          | Default Value  |
|-----------|--------------------------------------------------------------------------------------|----------------|
| type      | Type of fog distribution. Can be `linear` or `exponential`.                          | linear         |
| color     | Color of fog. For example, if set to black, far away objects will be rendered black. | #000           |

## Linear Fog

Linear fog grows linearly denser with distance.

| Property  | Description                                                                                | Default Value  |
|-----------|--------------------------------------------------------------------------------------------|----------------|
| near      | Minimum distance to start applying fog. Objects closer than this won't be affected by fog. | 1              |
| far       | Maximum distance to stop applying fog. Objects farther than this won't be affected by fog. | 1000           |

## Exponential Fog

Exponential fog grows exponentially denser with distance.

| Property  | Description                                                                                | Default Value  |
|-----------|--------------------------------------------------------------------------------------------|----------------|
| density   | How quickly the fog grows dense.                                                           | 0.00025        |
