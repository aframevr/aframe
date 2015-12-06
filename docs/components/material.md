title: "Material"
category: component
---

The material component defines the appearance of an entity. It can define
attributes such as color, opacity, or texture. A geometry component is usually
defined alongside the material component.

Here is an example defining a red material on a box geometry, creating a red
cube.

```html
<a-entity geometry="primitive: box" material="color: red"></a-entity>
```

| Attribute    | Description                                                                                                                                    | Default Value |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| color        | Base color of the geometry.                                                                                                                    | #fff          |
| envMap       | Environment cubemap texture for reflections. Can be a selector to <a-cubemap> or a comma-separated list of URLs.                               | None          |
| height       | Height of video if defining a video texture.                                                                                                   | 360           |
| metalness    | How metallic the material is from 0 to 1. Does not apply if `shader` is set to `flat`.                                                         | 0.5           |
| opacity      | Extent of transparency. If the `transparent` attribute is not true, then the material will remain opaque and `opacity` will only affect color. | 1.0           |
| reflectivity | How reflective the material is from 0 to 1 if the `envMap` attribute is set.                                                                   | 1.0           |
| repeat       | How many times a texture (defined by `src`) repeats in the X and Y direction.                                                                  | 1 1           |
| roughness    | How rough the material is from 0 to 1. A rougher material will scatter reflected light in more directions than a smooth material. Does not apply if `shader` is set to `flat` | 0.5 |
| transparent  | Whether material is transparent. Transparent entities are rendered after non-transparent entities.                                             | false         |
| shader       | Shading model. Defaults to physically-based shading but can also be set to `flat` shading.                                                     | standard      |
| src          | Image or video texture map. Can either be a selector to an <img> or <video>, or an inline URL.                                                 | None          |
| width        | Width of video if defining a video texture.                                                                                                    | 640           |

## Defining Textures

To set a texture on the material, specify the `src` attribute. `src` can either
be a selector to an ```<img>``` or ```<video>``` element:

```html
<a-assets>
  <img id="my-texture" src="texture.png">
</a-assets>

<a-scene>
  <a-entity geometry="primitive: box" material="src: #my-texture"></a-entity>
</a-scene>
```

`src` can also be an inline URL:

```html
<a-scene>
  <a-entity geometry="primitive: box" material="src: texture.png"></a-entity>
</a-scene>
```

Most of the other attributes works together with texutres. For example, the
`color` attribute will act as the base color and be multiplied per-pixel with
the texture. Set it to `#fff` to maintain the original colors of the texture.

### Repeating Textures

Often, we want to tile textures rather than having them stretch. The `repeat`
attribute can be used to repeat textures.

```html
<a-entity geometry="geometry: plane; width: 100"
          material="src: carpet.png; repeat: 100 20"></a-entity>
```

### Environment Maps

The `envMap` attribute defines what environment the material reflects. This
also works together with plain textures. Though unlike regular texture maps,
the `envMap` attribute takes a cubemap, six images put together to form a cube.
The cubemap is wrapped around the entity and applied as a texture.

If shader is set to `standard`, which it is by default, the clarity of the reflection
depends on the `metalness`, `roughness`, and `reflectivity` attributes.

```html
<a-assets>
  <a-cubemap id="sky">
    <img src="right.png">
    <img src="left.png">
    <img src="top.png">
    <img src="bottom.png">
    <img src="front.png">
    <img src="back.png">
  </a-cubemap>
</a-assets>

<a-scene>
  <a-entity geometry="primitive: box" material="envMap: #sky; roughness: 0"></a-entity>
</a-scene>
```

## Physically-Based Shading

By default, A-Frame materials default to a physically-based shading model,
where the `shader` attribute is `standard`. Physically-based shading is a
recent trend in rendering systems where materials behave realistically to
lighting conditions. Appearance is a result of the interaction between the
incoming light and the attributes of the material.

To achieve realism, the diffuse color, metalness, reflectivity, and roughness
attributes of the material must accurately be controled, often based on
real-world material studies. Some people have compiled charts of realistic
values for different kinds of materials that can be used as a starting point.

For example, for a tree bark material, as an estimation, we might set:

```html
<a-entity geometry="primitive: cylinder"
          material="src: treebark.png; color: #696969; roughness: 1; metalness: 0">
</a-entity>
```

For basic scenes, however, physically-based materials are not a large cocern.

## Specifying Flat Shading

Since materials default to physically-based shading, materials will reflect
light when we might not want them to. To specify flat shading, such as in the
case for displaying plain images or videos, we can define the `shader` attribute
to be `flat`.

```html
<a-entity geometry="primitive: plane" material="src: #cat-image; shader: flat">
</a-entity>
```
