---
title: material
type: components
layout: docs
parent_section: components
order: 11
---

The material component defines the appearance of an entity. The built-in shaders allow us to define properties such as color, opacity, or textures. [Custom shaders][shaders] can be registered to extend the material component to allow for a wide range of visual effects. The [geometry component][geometry] can be defined alongside to provide a shape alongside the appearance to create a complete mesh.

The material component is coupled to [shaders][shaders]. Some of the built-in shading models will provide properties like color or texture to the material component.

## Example

Here is an example defining a red material using the default standard shading model:

```html
<a-entity geometry="primitive: box" material="color: red"></a-entity>
```

Here is an example of using a different built-in shading model:

```html
<a-entity geometry="primitive: box" material="shader: flat; color: red"></a-entity>
```

Here is an example of using perhaps a custom shader:

```html
<a-entity geometry="primitive: plane" material="shader: ocean; color: blue; wave-height: 10"></a-entity>
```

## Properties

The material component has only a few base properties, but more properties will be available to set uniforms and attributes depending on the schema of the shader applied:

| Property    | Description                                                                                                                                     | Default Value |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| depthTest   | Whether depth testing is enabled when rendering the material.                                                                                   | true          |
| opacity     | Extent of transparency. If the `transparent` property is not `true`, then the material will remain opaque and `opacity` will only affect color. | 1.0           |
| transparent | Whether material is transparent. Transparent entities are rendered after non-transparent entities.                                              | false         |
| shader      | Which shader or shading model to use. Defaults to the [built-in standard shading model][standard]. Can be set to the [built-in flat shading model][flat] or to a [registered custom shader][customshader] | standard      |
| side        | Which sides of the mesh to render. Can be one of `front`, `back`, or `double`.                                                                  | front         |

## Events

| Event Name              | Description                                                                                |
|-------------------------|--------------------------------------------------------------------------------------------|
| materialtextureloaded | Texture loaded onto material. Or when the first frame is playing for video textures.       |
| materialvideoended    | For video textures, emitted when the video has reached its end (may not work with `loop`). |

## Textures

To set a texture using one of the built-in shading models, specify the `src` property. `src` can be a selector to either an `<img>` or `<video>` element:

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

Most of the other properties works together with textures. For example, the `color` property will act as the base color and be multiplied per pixel with the texture. Set it to `#fff` to maintain the original colors of the texture.

Video and image textures are cached on the A-Frame layer in order not to push redundant textures to the GPU.

### Video Textures

Whether the video texture loops or autoplays depends on the video element used to create the texture. If we simply pass a URL instead of creating and passing a video element, then the texture will loop and autoplay by default. To specify otherwise, create a video element in the asset management system, and pass a selector for the `id` attribute (e.g., `#my-video`):

```html
<a-scene>
  <a-assets>
    <!-- No loop. -->
    <video id="my-video" src="video.mp4" autoplay="true">
  </a-assets>

  <a-entity geometry="primitive: box" material="src: #my-video"></a-entity>
</a-scene>
```

#### Controlling the Video

To control the video playback such as pausing or seeking, we can use the video element to [control media playback][mediaplayback]. For example:

```js
var videoEl = document.querySelector('#my-video');
videoEl.currentTime = 122;  // Seek to 122 seconds.
videoEl.pause();
```

This doesn't work as well if you are passing an inline URL, in which case a video element will be created internally. To get a handle on the video element, we should define one in `<a-assets>`.

### Repeating Textures

We might want to tile textures rather than having them stretch. The `repeat` property can be used to repeat textures in one of the built-in shading models.

```html
<a-entity geometry="primitive: plane; width: 100"
          material="src: carpet.png; repeat: 100 20"></a-entity>
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

To play with an example of communicating with the material component, check out the [Cross-Component Changes example on CodePen][cross-component-changes].

## Caveats

Transparency and alpha channels are tricky in 3D graphics. If you are having issues where transparent materials in the foreground do not composite correctly over materials in the background, it is probably due to underlying design of the OpenGL compositor (which WebGL is an API for). In an ideal scenario, transparency in A-Frame would "just work", regardless of where the developer places an image in 3D space, or in which order they define the elements in markup. In the current version of A-Frame, however, it is easy to create scenarios where foreground images occlude background images. This creates confusion and unwanted visual defects. To work around, try changing the order of the entities.

[corsimage]: https://developer.mozilla.org/docs/Web/HTML/CORS_enabled_image
[cross-component-changes]: http://codepen.io/team/mozvr/pen/NxEpJe
[customshader]: ../core/shaders.md#registering_a_custom_shader
[flat]: ../core/shaders.md#flat_shading_model
[geometry]: ./geometry.md
[mediaplayback]: https://developer.mozilla.org/docs/Web/Guide/HTML/Using_HTML5_audio_and_video#Controlling_media_playback
[shaders]: ../core/shaders.md
[standard]: ../core/shaders.md#standard_shading_model
