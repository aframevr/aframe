---
title: material
type: components
layout: docs
parent_section: components
order: 11
---

The `material` component defines the appearance of an entity. The basic shaders allow us to define properties such as color, opacity, or textures. Different shaders can be registered and applied to the material allow for a wide range of visual effects. The basic [`geometry` component](geometry.html) can be defined alongside to provide a shape alongside the appearance to create a complete mesh.

## Example

Here is an example defining a red material on a basic box geometry, creating a red box mesh.

```html
<a-entity geometry="primitive: box" material="color: red"></a-entity>
```

## Properties

| Property     | Description                                                                                                                                                                        | Default Value |
|--------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------|
| color        | Base color of the geometry.                                                                                                                                                        | #fff          |
| envMap       | Environment cubemap texture for reflections. Can be a selector to <a-cubemap> or a comma-separated list of URLs.                                                                   | None          |
| height       | Height of video (in pixels), if defining a video texture.                                                                                                                          | 360           |
| metalness    | How metallic the material is from `0` to `1`. Does not apply if `shader` is set to `flat`.                                                                                         | 0.5           |
| opacity      | Extent of transparency. If the `transparent` property is not `true`, then the material will remain opaque and `opacity` will only affect color.                                    | 1.0           |
| reflectivity | How reflective the material is from `0` to `1` if the `envMap` property is set.                                                                                                    | 1.0           |
| repeat       | How many times a texture (defined by `src`) repeats in the X and Y direction.                                                                                                      | 1 1           |
| roughness    | How rough the material is from `0` to `1`. A rougher material will scatter reflected light in more directions than a smooth material. Does not apply if `shader` is set to `flat`. | 0.5           |
| transparent  | Whether material is transparent. Transparent entities are rendered after non-transparent entities.                                                                                 | false         |
| shader       | Shading model. Defaults to physically based shading but can also be set to `flat` shading.                                                                                         | standard      |
| side         | Which sides of the mesh to render. Can be one of `front`, `back`, or `double`.                                                                                                     | front         |
| src          | Image or video texture map. Can either be a selector to an `<img>` or `<video>`, or an inline URL.                                                                                 | None          |
| width        | Width of video (in pixels), if defining a video texture.                                                                                                                           | 640           |

## Events

| Event Name              | Description                                                                                |
|-------------------------+--------------------------------------------------------------------------------------------|
| material-texture-loaded | Texture loaded onto material. Or when the first frame is playing for video textures.       |
| material-video-ended    | For video textures, emitted when the video has reached its end (may not work with `loop`). |

## Defining Textures

To set a texture on the material, specify the `src` property. `src` can either be a selector to an `<img>` or `<video>` element:

```html
<a-scene>
  <a-assets>
    <img id="my-texture" src="texture.png">
  </a-assets>

  <a-entity geometry="primitive: box" material="src: #my-texture"></a-entity>
</a-scene>
```

`src` can also be an inline URL. Note that this is less performant than going through the asset management system:

```html
<a-scene>
  <a-entity geometry="primitive: box" material="src: url(texture.png)"></a-entity>
</a-scene>
```

Most of the other properties works together with textures. For example, the `color` property will act as the base color and be multiplied per-pixel with the texture. Set it to `#fff` to maintain the original colors of the texture.

### Repeating Textures

We might want to tile textures rather than having them stretch. The `repeat` property can be used to repeat textures.

```html
<a-entity geometry="primitive: plane; width: 100"
          material="src: carpet.png; repeat: 100 20"></a-entity>
```

### Environment Maps

The `envMap` property defines what environment the material reflects. This also works together with plain textures. Though unlike regular texture maps, the `envMap` property takes a cubemap, six images put together to form a cube. The cubemap is wrapped around the entity and applied as a texture. Note that cubemaps can not yet be defined for regular textures.

If shader is set to `standard`, which it is by default, the clarity of the reflection depends on the `metalness`, `roughness`, and `reflectivity` properties.

```html
<a-scene>
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

  <a-entity geometry="primitive: box" material="envMap: #sky; roughness: 0"></a-entity>
</a-scene>
```

## Physically Based Shading

By default, A-Frame materials default to a physically based shading model, where the `shader` property is `standard`. Physically based shading is a recent trend in rendering systems where materials behave realistically to lighting conditions. Appearance is a result of the interaction between the incoming light and the properties of the material.

To achieve realism, the diffuse `color`, `metalness`, `reflectivity`, and `roughness` properties of the material must accurately be controlled, often based on real-world material studies. Some people have compiled charts of realistic
values for different kinds of materials that can be used as a starting point.

For example, for a tree bark material, as an estimation, we might set:

```html
<a-entity geometry="primitive: cylinder"
          material="src: treebark.png; color: #696969; roughness: 1; metalness: 0">
</a-entity>
```

For basic scenes, physically based materials are generally not needed. In that case, we want to specify flat shading for better performance.

## Specifying Flat Shading

Since materials default to physically based shading, materials will factor in light when we might not want them to. To specify flat shading, such as in the case for displaying plain images or videos, we can define the `shader` property to be `flat`.

```html
<a-entity geometry="primitive: plane" material="src: #cat-image; shader: flat">
</a-entity>
```

## Setting the Material from Another Component

A common operation is to set material properties from another component. To do so, we can specify the material as a dependency component, wait for the entity to load, then use `setAttribute`:

```
AFRAME.registerComponent('my-component', {
  depdendencies: ['material'],

  update: function () {
    var el = this.el;
    if (el.hasLoaded) {
      this.setMaterial();
    } else {
      el.addEventListener('loaded', this.setMaterial.bind(this));
    }
  },

  setMaterial: function () {
    this.setAttribute('material', 'color', 'red');
  }
});
```

To play with an example of communicating with the material component, check out the [Cross-Component Changes example on Codepen](http://codepen.io/team/mozvr/pen/NxEpJe).

## Caveats

Transparency and alpha channels are tricky in 3D graphics. If you are having issues where transparent materials in the foreground do not composite correctly over materials in the background, it is probably due to underlying design of the OpenGL compositor (which WebGL is an API for). In an ideal scenario, transparency in A-Frame would "just work", regardless of where the developer places an image in 3D space, or what order they define the elements in markup. In the current version of A-Frame, however, it is easy to create scenarios where foreground images occlude background images. This creates confusion and unwanted visual defects. To workaround, try changing the order of the entities.
