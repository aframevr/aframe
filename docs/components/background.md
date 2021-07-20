---
title: background
type: components
layout: docs
parent_section: components
source_code: src/components/background.js
examples: []
---

The background component sets a basic color background of a scene that is more
performant than `a-sky` since geometry is not created. There are no undesired
frustum culling issues when `a-sky` is further than the far plane of the
camera. There are no unexpected occlusions either with far objects that might
be behind of the sphere geometry of `a-sky`.

The background component will ensure that the environment is generate using WebXR
Lighting estimation in Augmented Reality. It will turn off the scene lights when AR
is entered and will restore them when AR is exited.

The background component can also generate a default environment cube map for all
materials, if you find GLB models end up too dark or reflective materials don't
reflect the environment this will provide a default reflective environment.

## Example

The example below sets the background color to red.

```html
<a-scene background="color: red"></a-scene>
```

## Properties

| Property                   | Description                                               | Default Value   |
|----------------------------|-----------------------------------------------------------|-----------------|
| color                      | Color of the scene background.                            | black           |
| transparent                | Background is transparent. The color property is ignored. | false           |
| generateEnvironment        | Whether to generate a default environment.                | true            |
| environmentUpdateFrequency | How often to update the environment in seconds, 0 is off. | 0               |
| sceneLights                | Query Selector for the lights to turn off when AR starts. | a-light,[light] |
