---
title: reflection
type: components
layout: docs
parent_section: components
source_code: src/components/reflection.js
examples: []
---

The reflection component generates a default environment cube map for all
materials, this is useful in case you find GLB models end up too dark or reflective
materials don't look right because they are not reflecting the environment this
will provide a default reflective environment.

![Left hand side has objects with no reflection, the objects on the right reflect the environment](https://user-images.githubusercontent.com/4225330/151032019-1f14a079-604a-4c5f-b377-ea30a4e2b098.png)

## Scene Lighting and Lighting Estimation

The reflection component will generate an environment map from your surroundings using WebXR
Lighting estimation in Augmented Reality if it is available.

During this it will also take control of your scene's main directional light to ensure it's direction and color matches that of the rest of the environment. This works really well for your scene's shadows.
It will also create a probe light to match the lighting of the real world.
So you should turn off any additional global scene lights, such as other directional lights, hemisphere lights or ambient lights, when the user enters AR. You can do this with the `hide-on-enter-ar` component.

Once the user leaves AR this light may have a different color, intensity and position than when they entered AR as it has been altered by the lighting estimation.

## Example

The example below sets the reflection color to red and use lighting estimation for AR.

```html
<a-scene reflection="directionalLight:a-light#dirlight;">
	<a-light id="dirlight" intensity="1" light="castShadow:true;type:directional" position="1 1 1"></a-light>
</a-scene>
```

## Properties

| Property                   | Description                                               | Default Value   |
|----------------------------|-----------------------------------------------------------|-----------------|
| directionalLight           | Light to control during WebXR Lighting Estimation         |                 |
