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

The background component can also generate a default environment cube map for all
materials, this is useful in case you find GLB models end up too dark or reflective
materials don't look right because they are not reflecting the environment this
will provide a default reflective environment.

## Scene Lighting and Lighting Estimation

The background component will ensure that an environment map is generated from your surroundings using WebXR
Lighting estimation in Augmented Reality if it is available.

It will also create lights to match the lighting of the real world. So you should turn off any scene lights when the user enters AR using the `hide-on-enter-ar` component.

These lights are a `directional` and a `probe` light. If your scene makes use of shadows
from a directional light you can provide this as the `directionalLight` property and it
will control that light instead of making it's own one. Once the user leaves AR this
light may have a different color, intensity and position than when they entered AR as it has been
altered by the lighting estimation.

## Example

The example below sets the background color to red and use lighting estimation for AR.

```html
<a-scene webxr="optionalFeatures: light-estimation;" background="color: red"></a-scene>
```

## Properties

| Property                   | Description                                               | Default Value   |
|----------------------------|-----------------------------------------------------------|-----------------|
| color                      | Color of the scene background.                            | black           |
| transparent                | Background is transparent. The color property is ignored. | false           |
| generateEnvironment        | Whether to generate a default environment.                | true            |
| environmentUpdateFrequency | How often to update the environment in seconds, 0 is off. | 0               |
| directionalLight           | Use an existing light for the AR lighting                 | null            |
