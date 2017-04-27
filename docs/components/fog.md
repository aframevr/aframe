---
title: fog
type: components
layout: docs
parent_section: components
---

The fog component obscures entities in fog given distance from the camera. The
fog component applies only to the [`<a-scene>` element][scene].

## Example

```html
<a-scene fog="type: linear; color: #AAA"></a-scene>
```

## Properties

Given the fog distribution type, different properties will apply.

| Property | Description                                                                          | Default Value |
|----------|--------------------------------------------------------------------------------------|---------------|
| type     | Type of fog distribution. Can be `linear` or `exponential`.                          | linear        |
| color    | Color of fog. For example, if set to black, far away objects will be rendered black. | #000          |

### Linear Fog

Linear fog grows linearly denser with distance.

| Property | Description                                                                                | Default Value |
|----------|--------------------------------------------------------------------------------------------|---------------|
| near     | Minimum distance to start applying fog. Objects closer than this won't be affected by fog. | 1             |
| far      | Maximum distance to stop applying fog. Objects farther than this won't be affected by fog. | 1000          |

### Exponential Fog

Exponential fog grows exponentially denser with distance.

| Property | Description                      | Default Value |
|----------|----------------------------------|---------------|
| density  | How quickly the fog grows dense. | 0.00025       |

## Excluding a Material from Fog

To not apply fog to certain entities, we can disable fog for certain materials.

```html
<a-entity material="fog: false"></a-entity>
```

[scene]: ../core/scene.md
