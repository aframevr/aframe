---
title: material
type: components
layout: docs
parent_section: components
---

[fog]: ./fog.md
[geometry]: ./geometry.md

The material component gives appearance to an entity. We can define properties
such as color, opacity, or texture. This is often paired with the [geometry
component][geometry] which provides shape.

We can register custom materials to extend the material component to provide a
wide range of visual effects.

<!--toc-->

## Example

Defining a red material using the default standard material:

```html
<a-entity geometry="primitive: box" material="color: red"></a-entity>
```

Here is an example of using a different material:

```html
<a-entity geometry="primitive: box" material="shader: flat; color: red"></a-entity>
```

Here is an example of using an example custom material:

```html
<a-entity geometry="primitive: plane"
          material="shader: ocean; color: blue; wave-height: 10"></a-entity>
```

## Properties

[flat]: #flat
[standard]: #standard

The material component has some base properties. More properties are available
depending on the material type applied.

| Property    | Description                                                                                                                                       | Default Value |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| depthTest   | Whether depth testing is enabled when rendering the material.                                                                                     | true          |
| flatShading | Use `THREE.FlatShading` rather than `THREE.StandardShading`.                                                                                      | false          |
| opacity     | Extent of transparency. If the `transparent` property is not `true`, then the material will remain opaque and `opacity` will only affect color.   | 1.0           |
| transparent | Whether material is transparent. Transparent entities are rendered after non-transparent entities.                                                | false         |
| shader      | Which material to use. Defaults to the [standard material][standard]. Can be set to the [flat material][flat] or to a registered custom material. | standard      |
| side        | Which sides of the mesh to render. Can be one of `front`, `back`, or `double`.                                                                    | front         |
| visible | Whether material is visible. Raycasters will ignore invisible materials. | true |
| offset | Texture offset to be used. | {x: 0, y: 0} |
| repeat | Texture repeat to be used. | {x: 1, y: 1} |
| npot | Use settings for non-power-of-two (NPOT) texture. | false |

## Events

| Event Name              | Description                                                                                |
|-------------------------|--------------------------------------------------------------------------------------------|
| materialtextureloaded   | Texture loaded onto material.                                                              |
| materialvideoloadeddata | Video data loaded and is going to play.                                                    |
| materialvideoended      | For video textures, emitted when the video has reached its end (may not work with `loop`). |

## Built-in Materials

A-Frame ships with a couple of built-in materials.

### `standard`

[threestandardmaterial]: http://threejs.org/docs/#Reference/Materials/MeshStandardMaterial

The `standard` material is the default material. It uses the physically-based
[THREE.MeshStandardMaterial][threestandardmaterial].

#### Properties

These properties are available on top of the base material properties.

| Property                      | Description                                                                                                                                     | Default Value |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| ambientOcclusionMap           | Ambient occlusion map. Used to add shadows to the mesh. Can either be a selector to an `<img>` an inline URL.                                   | None          |
| ambientOcclusionMapIntensity  | The intensity of the ambient occlusion map, a number between 0 and 1.                                                                           | 1             |
| ambientOcclusionTextureRepeat | How many times the ambient occlusion texture repeats in the X and Y direction.                                                                  | 1 1           |
| ambientOcclusionTextureOffset | How the ambient occlusion texture is offset in the x y direction.                                                                               | 0 0           |
| color                         | Base diffuse color.                                                                                                                             | #fff          |
| displacementMap               | Displacement map. Used to distort a mesh. Can either be a selector to an `<img>` an inline URL.                                                 | None          |
| displacementScale             | The intensity of the displacement map effect                                                                                                    | 1             |
| displacementBias              | The zero point of the displacement map.                                                                                                         | 0.5           |
| displacementTextureRepeat     | How many times the displacement texture repeats in the X and Y direction.                                                                       | 1 1           |
| displacementTextureOffset     | How the displacement texture is offset in the x y direction.                                                                                    | 0 0           |
| height                        | Height of video (in pixels), if defining a video texture.                                                                                       | 360           |
| envMap                        | Environment cubemap texture for reflections. Can be a selector to <a-cubemap> or a comma-separated list of URLs.                                | None          |
| fog                           | Whether or not material is affected by [fog][fog].                                                                                              | true          |
| metalness                     | How metallic the material is from `0` to `1`.                                                                                                   | 0.5           |
| normalMap                     | Normal map. Used to add the illusion of complex detail. Can either be a selector to an `<img>` an inline URL.                                   | None          |
| normalScale                   | Scale of the effect of the normal map in the X and Y directions.                                                                                | 1 1           |
| normalTextureRepeat           | How many times the normal texture repeats in the X and Y direction.                                                                             | 1 1           |
| normalTextureOffset           | How the normal texture is offset in the x y direction.                                                                                          | 0 0           |
| repeat                        | How many times a texture (defined by `src`) repeats in the X and Y direction.                                                                   | 1 1           |
| roughness                     | How rough the material is from `0` to `1`. A rougher material will scatter reflected light in more directions than a smooth material.           | 0.5           |
| sphericalEnvMap               | Environment spherical texture for reflections. Can either be a selector to an `<img>`, or an inline URL.                                        | None          |
| width                         | Width of video (in pixels), if defining a video texture.                                                                                        | 640           |
| wireframe                     | Whether to render just the geometry edges.                                                                                                      | false         |
| wireframeLinewidth            | Width in px of the rendered line.                                                                                                               | 2             |
| src                           | Image or video texture map. Can either be a selector to an `<img>` or `<video>`, or an inline URL.                                              | None          |

#### Physically-Based Shading

Physically-based shading is a shading model that aims to make materials behave
realistically to lighting conditions. Appearance is a result of the interaction
between the incoming light and the properties of the material.

To achieve realism, the diffuse `color`, `metalness`, `roughness` properties of
the material must be accurately controlled, often based on real-world material
studies. Some people have compiled charts of realistic values for different
kinds of materials that we can use as a starting point.

For example, for a tree bark material, as an estimation, we might set:

```html
<a-entity geometry="primitive: cylinder"
          material="src: treebark.png; color: #696969; roughness: 1; metalness: 0">
</a-entity>
```

#### Distortion Maps

There are three properties which give the illusion of complex geometry:

- **Ambient occlusion maps** - Applies a texture to the image which add shadows.
- **Displacement maps** - Distorts a simpler model at a high resolution
  allowing more detail. This will affect the mesh's silhouette but can be
  expensive.
- **Normal maps** - Defines the angle of the surface at that point. Giving the
  appearance of complex geometry without distorting the model. This does not
  change the geometry but normal maps are cheaper.

#### Environment Maps

The `envMap` and `sphericalEnvMap` properties define what environment
the material reflects. The clarity of the environment reflection depends
on the `metalness`, and `roughness` properties.

The `sphericalEnvMap` property takes a single spherical mapped
texture. Of the kind you would assign to a `<a-sky>`.

Unlike textures, the `envMap` property takes a cubemap, six images put together
to form a cube. The cubemap wraps around the mesh and applied as a texture.

For example:

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

### `flat`

[basic]: http://threejs.org/docs/#Reference/Materials/MeshBasicMaterial

The `flat` material uses the [THREE.MeshBasicMaterial][basic]. Flat materials
are not affected by the scene's lighting conditions. This is useful for things
such as images or videos. Set `shader` to `flat`:

```html
<a-entity geometry="primitive: plane" material="shader: flat; src: #cat-image"></a-entity>
```

#### Properties

| Property             | Description                                                                                                                          | Default Value |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| color                | Base diffuse color.                                                                                                                  | #fff          |
| fog                  | Whether or not material is affected by [fog][fog].                                                                                   | true          |
| height               | Height of video (in pixels), if defining a video texture.                                                                            | 360           |
| repeat               | How many times a texture (defined by `src`) repeats in the X and Y direction.                                                        | 1 1           |
| src                  | Image or video texture map. Can either be a selector to an `<img>` or `<video>`, or an inline URL.                                   | None          |
| width                | Width of video (in pixels), if defining a video texture.                                                                             | 640           |
| wireframe            | Whether to render just the geometry edges.                                                                                           | false         |
| wireframeLinewidth   | Width in px of the rendered line.                                                                                                    | 2             |

## Textures

[asm]: ../core/asset-management-system.md

To set a texture using one of the built-in materials, specify the `src`
property. `src` can be a selector to either an `<img>` or `<video>` element in the
[asset management system][asm]:

```html
<a-scene>
  <a-assets>
    <img id="my-texture" src="texture.png">
  </a-assets>

  <a-entity geometry="primitive: box" material="src: #my-texture"></a-entity>
</a-scene>
```

`src` can also be an inline URL. Note that we do not get browser caching or
preloading through this method.

```html
<a-scene>
  <a-entity geometry="primitive: box" material="src: url(texture.png)"></a-entity>
</a-scene>
```

Most of the other properties works together with textures. For example, the
`color` property will act as the base color and multiplies per pixel with the
texture. Set it to `#fff` to maintain the original colors of the texture.

A-Frame caches textures are to not push redundant textures to the GPU.

### Video Textures

Whether the video texture loops or autoplays depends on the video element used
to create the texture. If we simply pass a URL instead of creating and passing
a video element, then the texture will loop and autoplay by default. To specify
otherwise, create a video element in the asset management system, and pass a
selector for the `id` attribute (e.g., `#my-video`):

```html
<a-scene>
  <a-assets>
    <!-- No loop. -->
    <video id="my-video" src="video.mp4" autoplay="true">
  </a-assets>

  <a-entity geometry="primitive: box" material="src: #my-video"></a-entity>
</a-scene>
```

#### Controlling Video Textures

[mediaplayback]: https://developer.mozilla.org/docs/Web/Guide/HTML/Using_HTML5_audio_and_video#Controlling_media_playback

To control the video playback such as pausing or seeking, we can use the video
element to [control media playback][mediaplayback]. For example:

```js
var videoEl = document.querySelector('#my-video');
videoEl.currentTime = 122;  // Seek to 122 seconds.
videoEl.pause();
```

This doesn't work as well if you are passing an inline URL, in which case
A-Frame creates a video element internally. To get a handle on the video
element, we should define one in `<a-assets>`.

## Canvas Textures

We can use a `<canvas>` as a texture source. The texture will automatically
refresh itself as the canvas changes.

```html
<script>
  AFRAME.registerComponent('draw-canvas', {
    schema: {default: ''},

    init: function () {
      this.canvas = document.getElementById(this.data);
      this.ctx = this.canvas.getContext('2d');

      // Draw on canvas...
    }
  });
</script>

<a-assets>
  <canvas id="my-canvas" crossorigin="anonymous"></canvas>
</a-assets>

<a-entity geometry="primitive: plane" material="src: #my-canvas"
          draw-canvas="my-canvas"></a-entity>
```

### Repeating Textures

We might want to tile textures rather than having them stretch. The `repeat`
property can repeat textures.

```html
<a-entity geometry="primitive: plane; width: 100"
          material="src: carpet.png; repeat: 100 20"></a-entity>
```

## Transparency Issues

Transparency and alpha channels are tricky in 3D graphics. If you are having
issues where transparent materials in the foreground do not composite correctly
over materials in the background, the issues are probably due to underlying
design of the OpenGL compositor (which WebGL is an API for).

In an ideal scenario, transparency in A-Frame would "just work", regardless of
where the developer places an entity in 3D space, or in which order they define
the elements in markup. We can often run into scenarios where foreground
entities occlude background entities. This creates confusion and unwanted
visual defects.

To work around this issue, try changing the order of the entities in the HTML.

## Register a Custom Material

We can register custom materials for appearances and effects using `AFRAME.registerShader`.

### `registerShader`

Like components, custom materials have schema and lifecycle handlers.

| Property | Description                                                                                                                 |
|----------|-----------------------------------------------------------------------------------------------------------------------------|
| schema   | Defines properties, uniforms, attributes that the shader will use to extend the material component.                         |
| init     | Lifecycle handler called once during shader initialization. Used to create the material.                                    |
| update   | Lifecycle handler called once during shader initialization and when data is updated. Used to update the material or shader. |

### Schema

We can define material properties just as we would with component properties.
The data will act as the data we use to create our material:

```js
AFRAME.registerShader('custom', {
  schema: {
    emissive: {default: '#000'},
    wireframe: {default: false}
  }
});
```

### Example

[line-dashed]: http://threejs.org/docs/index.html#Reference/Materials/LineDashedMaterial

To create a custom material, we have the `init` and `update` handlers set and
update `this.material` to the desired material. Here is an example of
registering a [`THREE.LinedDashedMaterial`][line-dashed]:

```js
AFRAME.registerShader('line-dashed', {
  schema: {
    dashSize: {default: 3},
    lineWidth: {default: 1}
  },

  /**
   * `init` used to initialize material. Called once.
   */
  init: function (data) {
    this.material = new THREE.LineDashedMaterial(data);
    this.update(data);  // `update()` currently not called after `init`. (#1834)
  },

  /**
   * `update` used to update the material. Called on initialization and when data updates.
   */
  update: function (data) {
    this.material.dashsize = data.dashsize;
    this.material.linewidth = data.linewidth;
  }
});
```
