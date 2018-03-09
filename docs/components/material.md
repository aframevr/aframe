---
title: material
type: components
layout: docs
parent_section: components
source_code: src/components/material.js
examples:
  - title: Displacement Shader
    src: https://glitch.com/edit/#!/aframe-displacement-shader?path=client/index.js:1:0
  - title: Shader Walkthrough
    src: https://codepen.io/machenmusik/pen/WZyQNj
  - title: Grid Shader
    src: https://glitch.com/edit/#!/aframe-simpler-shader?path=public/index.html
  - title: Real-Time Vertex Displacement Shader
    src: https://glitch.com/edit/#!/aframe-displacement-registershader?path=public/index.html
  - title: Real-Time Vertex Displacement with Offset
    src: https://glitch.com/edit/#!/aframe-displacement-offset-registershader?path=public/index.html
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

| Property     | Description                                                                                                                                       | Default Value |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| alphaTest    | Alpha test threshold for transparency.                                                                                                            | 0             |
| depthTest    | Whether depth testing is enabled when rendering the material.                                                                                     | true          |
| flatShading  | Use `THREE.FlatShading` rather than `THREE.StandardShading`.                                                                                      | false         |
| npot         | Use settings for non-power-of-two (NPOT) texture.                                                                                                 | false         |
| offset       | Texture offset to be used.                                                                                                                        | {x: 0, y: 0}  |
| opacity      | Extent of transparency. If the `transparent` property is not `true`, then the material will remain opaque and `opacity` will only affect color.   | 1.0           |
| repeat       | Texture repeat to be used.                                                                                                                        | {x: 1, y: 1}  |
| shader       | Which material to use. Defaults to the [standard material][standard]. Can be set to the [flat material][flat] or to a registered custom shader material. | standard      |
| side         | Which sides of the mesh to render. Can be one of `front`, `back`, or `double`.                                                                    | front         |
| transparent  | Whether material is transparent. Transparent entities are rendered after non-transparent entities.                                                | false         |
| vertexColors | Whether to use vertex or face colors to shade the material. Can be one of `none`, `vertex`, or `face`.                                            | none          |
| visible      | Whether material is visible. Raycasters will ignore invisible materials.                                                                          | true          |

## Events

| Event Name              | Description                                                                                |
|-------------------------|--------------------------------------------------------------------------------------------|
| materialtextureloaded   | Texture loaded onto material.                                                              |
| materialvideoloadeddata | Video data loaded and is going to play.                                                    |
| materialvideoended      | For video textures, emitted when the video has reached its end (may not work with `loop`). |

## Built-in Materials

A-Frame ships with a couple of built-in materials.

### `standard`

[threestandardmaterial]: https://threejs.org/docs/#api/materials/MeshStandardMaterial

The `standard` material is the default material. It uses the physically-based
[THREE.MeshStandardMaterial][threestandardmaterial].

#### Properties

These properties are available on top of the base material properties.

| Property                      | Description                                                                                                                                     | Default Value |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| ambientOcclusionMap           | Ambient occlusion map. Used to add shadows to the mesh. Can either be a selector to an `<img>`, or an inline URL. Requires 2nd set of UVs (see below). | None          |
| ambientOcclusionMapIntensity  | The intensity of the ambient occlusion map, a number between 0 and 1.                                                                           | 1             |
| ambientOcclusionTextureRepeat | How many times the ambient occlusion texture repeats in the X and Y direction.                                                                  | 1 1           |
| ambientOcclusionTextureOffset | How the ambient occlusion texture is offset in the x y direction.                                                                               | 0 0           |
| color                         | Base diffuse color.                                                                                                                             | #fff          |
| displacementMap               | Displacement map. Used to distort a mesh. Can either be a selector to an `<img>`, or an inline URL.                                             | None          |
| displacementScale             | The intensity of the displacement map effect                                                                                                    | 1             |
| displacementBias              | The zero point of the displacement map.                                                                                                         | 0.5           |
| displacementTextureRepeat     | How many times the displacement texture repeats in the X and Y direction.                                                                       | 1 1           |
| displacementTextureOffset     | How the displacement texture is offset in the x y direction.                                                                                    | 0 0           |
| emissive                      | The color of the emissive lighting component. Used to make objects produce light even without other lighting in the scene.                      | #000          |
| emissiveIntensity             | Intensity of the emissive lighting component.                                                                                                   | 1             |
| height                        | Height of video (in pixels), if defining a video texture.                                                                                       | 360           |
| envMap                        | Environment cubemap texture for reflections. Can be a selector to <a-cubemap> or a comma-separated list of URLs.                                | None          |
| fog                           | Whether or not material is affected by [fog][fog].                                                                                              | true          |
| metalness                     | How metallic the material is from `0` to `1`.                                                                                                   | 0.5           |
| normalMap                     | Normal map. Used to add the illusion of complex detail. Can either be a selector to an `<img>`, or an inline URL.                               | None          |
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

- **Ambient occlusion maps** - Applies subtle shadows in areas that receive less
  ambient light. Direct (point, directional) lights do not affect ambient occlusion
  maps. Baked ambient occlusion requires a 2nd set of UVs, which may be added to
  the mesh in modeling software or using JavaScript.
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

[basic]: https://threejs.org/docs/#api/materials/MeshBasicMaterial

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

When using PNG images as cutouts or masks (where part of the image should be
fully transparent, and the rest fully opaque), try setting `transparent: false`
and like `alphaTest: 0.5` to solve transparency issues. Play around with the alpha
test value.

## Register a Custom Shader Material

We can register custom shader materials for appearances and effects using
`AFRAME.registerShader`.

[example]: https://codepen.io/machenmusik/pen/WZyQNj

Let's walk through an [example CodePen][example] with step-by-step commentary.
As always, we need to include the A-Frame script.

```js
<script src="https://aframe.io/releases/0.7.0/aframe.min.js"></script>
```

Next, we define any components and shaders we need after the A-Frame
script but before the scene declaration. Here, we begin our `my-custom` shader.
The schema declares any parameters for the shader.

```js
<script>
AFRAME.registerShader('my-custom', {
  schema: {
    // ...
  }
});
</script>
```

We usually want to support the `color` and `opacity` properties.  `is:
'uniform'` tells A-Frame this property should appear as uniform value in the
shaders:

```js
<script>
AFRAME.registerShader('my-custom', {
  schema: {
    color: {type: 'color', is: 'uniform', default: 'red'},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  }
});
</script>
```

[rawshader]: https://threejs.org/docs/api/materials/RawShaderMaterial.html
[shadermaterial]: https://threejs.org/docs/api/materials/ShaderMaterial.html

Setting `raw` to `true` uses [THREE.RawShaderMaterial][rawshader] instead of
[ShaderMaterial][shadermaterial] so built-in uniforms and attributes are not
automatically added to your shader code. Here we want to include the usual
prefixes with GLSL constants and such, so leave it `false`.

```js
  raw: false,
```

We're going to use the default vertex shader by omitting `vertexShader`.  Note
that if our fragment shader cares about texture coordinates, our vertex shader
should set `varying` values to use in the fragment shader.

Since almost every WebVR-capable browser supports ES6, we define our fragment
shader as a multi-line string:

```js
  fragmentShader:
`
  // Use medium precision.
  precision mediump float;

  // This receives the color value from the schema, which becomes a vec3 in the shader.
  uniform vec3 color;

  // This receives the opacity value from the schema, which becomes a number.
  uniform float opacity;

  // This is the shader program.
  // A fragment shader can set the color via gl_FragColor,
  // or decline to draw anything via discard.
  void main () {
    // Note that this shader doesn't use texture coordinates.
    // Set the RGB portion to our color,
    // and the alpha portion to our opacity.
    gl_FragColor = vec4(color, opacity);
  }
`
});
</script>
```

And using our shader from the `material` component:

```
<!-- A box using our shader, not fully opaque and blue. -->
<a-box material="shader: my-custom; color: blue; opacity: 0.7; transparent: true" position="0 0 -2"></a-box>
```

### `registerShader`

Like components, custom materials have schema and lifecycle handlers.

| Property       | Description                                                                                                                          |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------|
| fragmentShader | Optional string containing the fragment shader. If omitted, a simple default is used.                                                |
| init           | Optional lifecycle handler called once during shader initialization. Used to create the material.                                    |
| raw            | Optional. If true, uses THREE.RawShaderMaterial to accept shaders verbatim. If false (default), uses THREE.ShaderMaterial.           |
| schema         | Defines properties, uniforms, attributes that the shader will use to extend the material component.                                  |
| update         | Optional lifecycle handler called once during shader initialization and when data is updated. Used to update the material or shader. |
| vertexShader   | Optional string containing the vertex shader. If omitted, a simple default is used.                                                  |

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

To pass data values into the shader(s) as uniform values, include `is:
'uniform'` in the definition:

```js
AFRAME.registerShader('my-custom', {
  schema: {
    color: {type:'color', is:'uniform', default:'red'},
    opacity: {type:'number', is:'uniform', default:1.0}
  },
  ...
```

## Supported Uniform Types

The uniform types supported by A-Frame are summarized in the table below.  Note
that `time` can eliminate the need for a `tick()` handler in many cases.

| A-Frame Type | THREE Type | GLSL Shader Type     |
|--------------|------------|----------------------|
| array        | v3         | vec3                 |
| color        | v3         | vec3                 |
| int          | i          | int                  |
| number       | f          | float                |
| map          | t          | map                  |
| time         | f          | float (milliseconds) |
| vec2         | v2         | vec2                 |
| vec3         | v3         | vec3                 |
| vec4         | v4         | vec4                 |

### Example - GLSL and Shaders

For more customized visual effects, we can write GLSL shaders and apply them to
A-Frame entities.

> NOTE: GLSL, the syntax used to write shaders, may seem a bit scary at first.
> For a gentle (and free!) introduction, we recommend [The Book of
> Shaders](http://thebookofshaders.com/).

Here are the vertex and fragment shaders we'll use:

```glsl
// vertex.glsl

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
```

```glsl
// fragment.glsl

varying vec2 vUv;
uniform vec3 color;
uniform float timeMsec; // A-Frame time in milliseconds.

void main() {
  float time = timeMsec / 1000.0; // Convert from A-Frame milliseconds to typical time in seconds.
  // Use sin(time), which curves between 0 and 1 over time,
  // to determine the mix of two colors:
  //    (a) Dynamic color where 'R' and 'B' channels come
  //        from a modulus of the UV coordinates.
  //    (b) Base color.
  //
  // The color itself is a vec4 containing RGBA values 0-1.
  gl_FragColor = mix(
    vec4(mod(vUv , 0.05) * 20.0, 1.0, 1.0),
    vec4(color, 1.0),
    sin(time)
  );
}
```

To use these vertex and fragment shaders, after reading them into strings
`vertexShader` and `fragmentShader`, we register our custom shader with
A-Frame:

```js
// shader-grid-glitch.js

AFRAME.registerShader('grid-glitch', {
  schema: {
    color: {type: 'color', is: 'uniform'},
    timeMsec: {type: 'time', is: 'uniform'}
  },

  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});
```

And using from HTML markup:

```html
<a-sphere material="shader:grid-glitch; color: blue;" radius="0.5" position="0 1.5 -2"></a-sphere>
```

* [Live demo](https://aframe-simpler-shader.glitch.me/)
* [Remix this on Glitch](https://glitch.com/edit/#!/aframe-simpler-shader)

![5093034e-97f2-40dc-8cb9-28ca75bfd75b-8043-00000dbc2e00268d](https://cloud.githubusercontent.com/assets/1848368/24825516/abb98abe-1bd4-11e7-8262-93d3efb6056f.gif)

***

For a more advanced example, [try Real-Time Vertex Displacement](https://glitch.com/edit/#!/aframe-displacement-registershader).

![b19320eb-802a-462a-afcd-3d0dd9480aee-861-000004c2a8504498](https://cloud.githubusercontent.com/assets/1848368/24825518/b52e5bf6-1bd4-11e7-8eb2-9a9c1ff82ce9.gif)

## Using a Custom Shader and Component Together

Let's take the real-time vertex displacement shader example above, and add the
capability to apply an offset based upon the camera's position. We declare
that offset as a uniform vec3 value `myOffset`:

```js
AFRAME.registerShader('displacement-offset', {
  schema: {
    timeMsec: {type: 'time', is: 'uniform'},
    myOffset: {type: 'vec3', is: 'uniform'}
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});
```

[vertexshaderglitch]: https://glitch.com/edit/#!/aframe-displacement-offset-registershader?path=displacement-offset-shader.js:1:0

Used by [this vertex shader][vertexshaderglitch]. So how do we update
`myOffset` to be the camera position from A-Frame such that the vertex shader
behaves correctly? The typical method to do this in A-Frame is to create a
component with the desired functionality, and attach it to the appropriate
entity.

Note that the shader property is exposed via the `material` component, so we
modify the single property of interest using a form of `setAttribute()`. As
best practice to avoid creating garbage for performance reasons:

- Do not use the form of `setAttribute` that takes an object as second argument.
- Create a component property to hold the offset, to avoid creating a new `THREE.Vector3` every tick.

```js
AFRAME.registerComponent('myoffset-updater', {
  init: function () {
    this.offset = new THREE.Vector3();
  },

  tick: function (t, dt) {
    this.offset.copy(this.el.sceneEl.camera.el.getAttribute('position'));
    this.offset.y = 0;
    this.el.setAttribute('material', 'myOffset', this.offset);
  }
});
```

We then apply the component to the entity with the custom shader:

```
<a-scene>
  <a-sphere material="shader:displacement-offset"
            myoffset-updater
            scale="1 1 1"
            radius="0.2"
            position="0 1.5 -2"
            segments-height="128"
            segments-width="128">
    <a-animation attribute="scale" direction="alternate-reverse" dur="5000" from="1 1 1" to="4 4 4" repeat="indefinite"></a-animation>
  </a-sphere>
  <a-box color="#CCC" width="3" depth="3" height="0.1" position="0 0 -2"></a-box>
</a-scene>
```

Voila!

- [Live demo](https://aframe-displacement-offset-registershader.glitch.me/)
- [Remix this on Glitch](https://glitch.com/edit/#!/aframe-displacement-offset-registershader)

Another good example of using a component to set shader values is the [A-Frame
Shaders example](https://aframe.io/aframe/examples/test/shaders/).  This
component reacts to `rotation` updates to the element with id `orbit` by
computing the `sunPosition` vector to use in the sky shader:

```js
AFRAME.registerComponent('sun-position-setter', {
  init: function () {
    var skyEl = this.el;
    var orbitEl = this.el.sceneEl.querySelector('#orbit');

    orbitEl.addEventListener('componentchanged', function changeSun (evt) {
      var sunPosition;
      var phi;
      var theta;

      if (evt.detail.name !== 'rotation') { return; }

      sunPosition = orbitEl.getAttribute('rotation');

      if(sunPosition === null) { return; }

      theta = Math.PI * (- 0.5);
      phi = 2 * Math.PI * (sunPosition.y / 360 - 0.5);
      skyEl.setAttribute('material', 'sunPosition', {
        x: Math.cos(phi),
        y: Math.sin(phi) * Math.sin(theta),
        z: -1
      });
    });
  }
});
```

[shadertoy]: https://shadertoy.com
[shaderfrog]: https://github.com/chenzlabs/aframe-import-shaderfrog

In addition, there are components developed by the A-Frame developer community
that allow the use of existing shaders from repositories such as
[ShaderToy][shadertoy] and [ShaderFrog][shaderfrog].

Note however that these shaders can be quite demanding in terms of
computational and graphics power, and some more complex shaders may not
function well on lower-performance devices such as smartphones.

## Creating a Material from a Component

For those cases where the `registerShader` API lacks needed functionality
(e.g., no `tick` handler, some missing uniform types), we recommend creating a
custom material by creating three.js materials (e.g., `RawShaderMaterial`,
`ShaderMaterial`) within a component:

```js
AFRAME.registerComponent('custom-material', {
  schema: {
    // Add properties.
  },

  init: function () {
    this.material = this.el.getOrCreateObject3D('mesh').material = new THREE.ShaderMaterial({
      // ...
    });
  },

  update: function () {
    // Update `this.material`.
  }
});
```
