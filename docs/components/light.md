title: "Light"
category: component
---

The light component defines the entity as a source of light. Light affects all
materials that have not specified a flat shading model with `shader: flat`.
Note that lights are computationally expensive and that we should limit the
number of lights in the scene.

```html
<a-entity light="color: #AFA; intensity: 1.5" position="-1 1 0"></a-entity>
```

By default, A-Frame scenes inject default lighting, an ambient light and a
directional light. These default lights are visible in the DOM with the
`data-aframe-default-light` attribute. However, whenever any lights are added,
the default lights are removed from the scene.

We will go through the different types of lights and their respective
attributes one-by-one.

| Attribute | Description                                                     | Default Value |
|-----------|-----------------------------------------------------------------|---------------|
| type      | One of `ambient`, `directional`, `hemisphere`, `point`, `spot`. | directional   |
| color     | Light color.                                                    | #fff          |

## Ambient

Ambient lights are applied to all entities in the scene globally. They are
defined only by the `color` attribute. And position, rotation, scale have no
effect on ambient lights.

It is recommended to have some form of ambient light such that shadowed areas
are not completely black and to mimic indirect lighting.

```html
<a-entity light="type: ambient; color: #CCC"></a-entity>
```

## Directional

Directional lights can be thought of as a light source infinitely far away, but
shining from a specific direction, like the sun. Thus, absolute position do not
have an effect on the intensity of the light on an entity. We can specify the
direction using the `position` component.

The example below creates a light source shining from the upper-left at a
45-degree angle. Note that because only the vector matters, `position="-100 100
0"` and `position="-1 1 0"` are equivalent.

```html
<a-entity light="type: directional; color: #EEE; intensity: 0.5" position="-1 1 0"></a-entity>
```

| Attribute | Description     | Default Value |
|-----------|-----------------|---------------|
| intensity | Light strength. | 1.0           |

## Hemisphere

Hemisphere lights can be thought of as an ambient light, but with two colors of
light, one from above (`color`) and one from below (`groundColor`). This can be
useful for scenes with two distnct lighting colors (e.g., a grassy field under
a gray sky).

```html
<a-entity light="type: hemisphere; color: #33C; groundColor: #3C3; intensity: 2"></a-entity>
```

| Attribute   | Description             | Default Value |
|-------------|-------------------------|---------------|
| groundColor | Light color from below. | #fff          |
| intensity   | Light strength.         | 1.0           |

## Point

Point lights, unlike directional lights, are omni-directional and affect
materials depending on its position and distance. They can be thought of as a
light bulb. The closer the light bulb gets to an object, the greater the object
is lit.

```html
<a-entity light="type: point; intensity: 0.75; distance: 50; decay: 2"
          position="0 10 10"></a-entity>
```

| Attribute   | Description                                                                                                | Default Value |
|-------------|------------------------------------------------------------------------------------------------------------|---------------|
| decay       | Amount the light dims along the distance of the light.                                                     | 1.0           |
| distance    | Distance where intensity becomes 0. If `distance` is 0, then the point light does not decay with distance. | 0.0           |
| intensity   | Light strength.                                                                                            | 1.0           |

## Spot

Spot lights are like point lights in the sense that they affect materials
depending on its position and distance, but spot lights are not
omni-directional. They mainly cast light in one direction, like the Bat-Signal.

```html
<a-entity light="type: spot; angle: 45"></a-entity>
```

| Attribute   | Description                                                                                                | Default Value |
|-------------|------------------------------------------------------------------------------------------------------------|---------------|
| angle       | Maximum extent of spot light from its direction, in degrees.                                               | 60            |
| decay       | Amount the light dims along the distance of the light.                                                     | 1.0           |
| distance    | Distance where intensity becomes 0. If `distance` is 0, then the point light does not decay with distance. | 0.0           |
| exponent    | Rapidity of falloff of light from its target direction.                                                    | 10.0          |
| intensity   | Light strength.                                                                                            | 1.0           |
