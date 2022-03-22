---
title: light
type: components
layout: docs
parent_section: components
source_code: src/components/light.js
examples:
  - title: Animated Lights
    src: https://glitch.com/edit/#!/aframe-animated-lights?path=index.html
---

The light component defines the entity as a source of light. Light affects all
materials that have not specified a flat shading model with `shader: flat`.
Note that lights are computationally expensive we should limit number of lights
in a scene.

```html
<a-entity light="color: #AFA; intensity: 1.5" position="-1 1 0"></a-entity>
```

By default, A-Frame scenes inject default lighting, an ambient light and a
directional light. These default lights are visible in the DOM with the
`data-aframe-default-light` attribute. Whenever we add any lights, A-Frame
removes the default lights from the scene.

```html
<!-- Default lighting injected by A-Frame. -->
<a-entity light="type: ambient; color: #BBB"></a-entity>
<a-entity light="type: directional; color: #FFF; intensity: 0.6" position="-0.5 1 1"></a-entity>
```

To manually disable the defaults, without adding other lights:

```html
<a-scene light="defaultLightsEnabled: false">
  <!-- ... -->
</a-scene>
```

<!--toc-->

## Properties

All light types support a few basic properties:

| Property  | Description                                                              | Default Value |
|-----------|--------------------------------------------------------------------------|---------------|
| type      | One of `ambient`, `directional`, `hemisphere`, `point`, `spot`, `probe`. | directional   |
| color     | Light color.                                                             | #fff          |
| intensity | Light strength.                                                          | 1.0           |

## Light Types

Different types of lights include unique properties. We will go through each
type, including its properties and when it may be the right choice.

### Ambient

Ambient lights globally affect all entities in the scene. The `color` and
`intensity` properties define ambient lights. Additionally, `position`,
`rotation`, and `scale` have no effect on ambient lights.

We recommend to have some form of ambient light such that shadowed areas are
not fully black and to mimic indirect lighting.

```html
<a-entity light="type: ambient; color: #CCC"></a-entity>
```

### Directional

Directional lights are like a light source that is infinitely far away, but shining
from a specific direction, like the sun. Thus, absolute position do not have an
effect on the intensity of the light on an entity. We can specify the direction
using the `position` component.

The example below creates a light source shining from the upper-left at a
45-degree angle. Note that because only the vector matters, `position="-100 100
0"` and `position="-1 1 0"` are the same.

```html
<a-entity light="type: directional; color: #EEE; intensity: 0.5" position="-1 1 0"></a-entity>
```

We can specify the direction of the directional light with its orientation by
creating a child entity it targets. For example, pointing down its -Z axis:

```html
<a-light type="directional" position="0 0 0" rotation="-90 0 0" target="#directionaltarget">
  <a-entity id="directionaltarget" position="0 0 -1"></a-entity>
</a-light>
```

Directional lights are the most efficient type for adding realtime shadows to a scene. You can use shadows like so:

```html
<a-light type="directional" light="castShadow:true;" position="1 1 1" intensity="0.5" shdadow-camera-automatic="#objects"></a-light>
```

The `shdadow-camera-automatic` configuration maps to `light.shadowCameraAutomatic` which tells the light to automatically update the shadow camera to be the minimum size and position to encompass the target elements. 

### Hemisphere

Hemisphere lights are like an ambient light, but with two different colors, one
from above (`color`) and one from below (`groundColor`). This can be useful for
scenes with two distinct lighting colors (e.g., a grassy field under a gray
sky).

```html
<a-entity light="type: hemisphere; color: #33C; groundColor: #3C3; intensity: 2"></a-entity>
```

| Property    | Description             | Default Value |
|-------------|-------------------------|---------------|
| color       | Light color from above. | #fff          |
| groundColor | Light color from below. | #fff          |

### Point

Point lights, unlike directional lights, are omni-directional and affect
materials depending on their position and distance. Point lights are like light
bulb. The closer the light bulb gets to an object, the greater the object is
lit.

```html
<a-entity light="type: point; intensity: 0.75; distance: 50; decay: 2"
          position="0 10 10"></a-entity>
```

| Property    | Description                                                                                                | Default Value |
|-------------|------------------------------------------------------------------------------------------------------------|---------------|
| decay       | Amount the light dims along the distance of the light.                                                     | 1.0           |
| distance    | Distance where intensity becomes 0. If `distance` is `0`, then the point light does not decay with distance. | 0.0           |

### Spot

Spot lights are like point lights in the sense that they affect materials
depending on its position and distance, but spot lights are not
omni-directional. They mainly cast light in one direction, like the
[Bat-Signal](https://en.wikipedia.org/wiki/Bat-Signal).

```html
<a-entity light="type: spot; angle: 45"></a-entity>
```

| Property    | Description                                                                                                    | Default Value |
|-------------|----------------------------------------------------------------------------------------------------------------|---------------|
| angle       | Maximum extent of spot light from its direction (in degrees).                                                  | 60            |
| decay       | Amount the light dims along the distance of the light.                                                         | 1.0           |
| distance    | Distance where intensity becomes 0. If `distance` is `0`, then the point light does not decay with distance.   | 0.0           |
| penumbra    | Percent of the spotlight cone that is attenuated due to penumbra.                                              | 0.0           |
| target      | element the spot should point to. set to null to transform spotlight by orientation, pointing to it's -Z axis. | null          |

### Probe

Probe lights are kind of like ambient lighting in that they don't have a particular source or direction and light everything equally.

Where they differ though is that they will color each angle differently based upon a spherical harmonic. This spherical harmonic is generated by analyzing a cube map. The cube map you provide doesn't need to be high resolution since it's only used to generate the spherical harmonics.

| Property    | Description              | Default Value |
|-------------|--------------------------|---------------|
| intensity   | Amount of light provided | 1             |
| envMap      | Cube Map to load         | null          |

Example:

```html
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

## Configuring Shadows

[inspector]: ../introduction/visual-inspector-and-dev-tools.md

A-Frame includes support for realtime shadow rendering. With proper
configuration, objects (both moving or stationary) will cast shadows adding
depth and realism to a scene. Since shadows come with many properties, it
is very helpful to **[use the A-Frame Inspector to configure shadows][inspector]**

Light types that support shadows (`point`, `spot`, and `directional`) include
additional properties:

| Property              | Light type      | Description                                                                                                                                | Default Value |
|-----------------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| castShadow            |                 | Whether this light casts shadows on the scene.                                                                                             | false         |
| shadowBias            |                 | Offset depth when deciding whether a surface is in shadow. Tiny adjustments here (in the order of +/-0.0001) may reduce artifacts in shadows. | 0             |
| shadowCameraAutomatic | `directional`   | Automatically configure the Bottom, Top, Left, Right and Near of a directional light's shadow map, from an element                         |               |
| shadowCameraBottom    | `directional`   | Bottom plane of shadow camera frustum.                                                                                                     | -5            |
| shadowCameraFar       |                 | Far plane of shadow camera frustum.                                                                                                        | 500           |
| shadowCameraFov       | `point`, `spot` | Shadow camera's FOV.                                                                                                                       | 50            |
| shadowCameraLeft      | `directional`   | Left plane of shadow camera frustum.                                                                                                       | -5            |
| shadowCameraNear      |                 | Near plane of shadow camera frustum.                                                                                                       | 0.5           |
| shadowCameraRight     | `directional`   | Right plane of shadow camera frustum.                                                                                                      | 5             |
| shadowCameraTop       | `directional`   | Top plane of shadow camera frustum.                                                                                                        | 5             |
| shadowCameraVisible   |                 | Displays a visual aid showing the shadow camera's position and frustum. This is the light's view of the scene, used to project shadows.    | false         |
| shadowMapHeight       |                 | Shadow map's vertical resolution. Larger shadow maps display more crisp shadows, at the cost of performance.                               | 512           |
| shadowMapWidth        |                 | Shadow map's horizontal resolution.                                                                                                        | 512           |

### Adding Real-Time Shadows

[light-baking]: #todo

> NOTE: Real-time shadows add performance overhead. When objects in a scene are
> stationary, or especially when optimizing for mobile devices, be aware of
> other techniques for realistic shadows, such as [baking light and shadow
> information into a texture][light-baking] before importing assets into
> A-Frame.

- **1. Create at least one light** with `castShadow: true`. Three light types
  support shadows (`point`, `spot`, and `directional`). Of the three,
  `directional` lights will have the best performance. Combining an ambient
  light (without shadows) and a directional light (with shadows) is a good
  place to start.

```html
<a-scene>
  <a-entity light="type: ambient; intensity: 0.5;"></a-entity>
  <a-entity light="type: directional;
                   castShadow: true;
                   intensity: 0.4;
                   shadowCameraVisible: true;"
            position="-5 3 1.5"></a-entity>
</a-scene>
```

In the example above, the directional light has lower intensity than the
ambient light, for slightly softer shadows. Adding `shadowCameraVisible: true`
creates a visual aid for debugging: objects outside the camera's view cannot
cast or receive shadows.

- **2. Add the shadow component** to objects in the scene that should cast or
  receive shadows.

```html
<a-gltf-model src="tree.gltf" shadow="cast: true"></a-gltf-model>
<a-circle id="ground" radius="10" rotation="-90 0 0" shadow="receive: true"></a-circle>
```

- **3. Adjust the shadow camera** position and frustum (`shadowCameraTop`,
  `shadowCameraRight`, ...) of the directional light, until it envelops the
  scene tightly. If the frustum is too small, shadows will be missing or
  partially clipped. If the frustum is too large, shadows will appear coarse or
  pixelated. The size of the shadow map (`shadowMapHeight: 512`, `shadowMapWidth:
  512`) determines the resolution at which shadows are computed, so tightly
  sizing the shadow camera around your scene will make the best use of this
  resolution and device performance.

- **4. Refine** shadow appearance. Scene-wide options, affecting all lights,
  may be configured on the scene's shadow system.

## Shadow System Properties

These global options affect the entire scene, and are set using the `shadow`
system on the `<a-scene>` root element.

```html
<a-scene shadow="type: pcfsoft">
  <!-- ... -->
</a-scene>
```

| Property           | Description                                                                                                   | Default Value |
|--------------------|---------------------------------------------------------------------------------------------------------------|---------------|
| type               | Defines shadow map type (`basic`, `pcf`, `pcfsoft`) with varying appearance and performance characteristics.   | `pcf`         |
