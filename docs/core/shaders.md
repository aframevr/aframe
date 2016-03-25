---
title: Shaders
type: core
layout: docs
parent_section: core
order: 7
---

Shaders (in A-Frame) are responsible for creating the material for the base [material component][material]. A-Frame ships with a couple of built-in shading models: `standard` and `flat`.

We can register custom shaders to implement different visual effects and materials. We have available the materials provided by three.js, including [THREE.ShaderMaterial][shader-material]. With THREE.ShaderMaterial, we can provide our own [GLSL][glsl] vertex and fragment shaders (small programs that run on the GPU), and we can define a schema for their uniforms and attributes just as we would with [component schemas][component-schema]. The shader's schema will extend the base material component's schema, and as a result we can pass values from markup directly to the shader.

## Built-in Shading Models

A-Frame ships with a couple of built-in shading models.

### Standard Shading Model

The standard shading model is the default shader for the material component. It is a physically-based shading model that uses [THREE.MeshStandardMaterial][standard] under the hood. The standard shading model can be explicitly specified by setting the `shader` to be `standard` in the material component (i.e., `material="shader: standard"`).

#### Properties

| Property  | Description                                                                                                                                     | Default Value |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| color     | Base diffuse color.                                                                                                                             | #fff          |
| height    | Height of video (in pixels), if defining a video texture.                                                                                       | 360           |
| envMap    | Environment cubemap texture for reflections. Can be a selector to <a-cubemap> or a comma-separated list of URLs.                                | None          |
| fog       | Whether or not material is affected by [fog][fog].                                                                                              | true          |
| metalness | How metallic the material is from `0` to `1`.                                                                                                   | 0.5           |
| repeat    | How many times a texture (defined by `src`) repeats in the X and Y direction.                                                                   | 1 1           |
| roughness | How rough the material is from `0` to `1`. A rougher material will scatter reflected light in more directions than a smooth material.           | 0.5           |
| width     | Width of video (in pixels), if defining a video texture.                                                                                        | 640           |
| src       | Image or video texture map. Can either be a selector to an `<img>` or `<video>`, or an inline URL.                                              | None          |

#### Physically-Based Shading

Physically based shading is a recent trend in rendering systems where materials behave realistically to lighting conditions. Appearance is a result of the interaction between the incoming light and the properties of the material.

To achieve realism, the diffuse `color` (can be supplied through the base material component), `metalness`, `roughness` properties of the material must accurately be controlled, often based on real-world material studies. Some people have compiled charts of realistic values for different kinds of materials that can be used as a starting point.

For example, for a tree bark material, as an estimation, we might set:

```html
<a-entity geometry="primitive: cylinder"
          material="src: treebark.png; color: #696969; roughness: 1; metalness: 0">
</a-entity>
```

For basic scenes, physically based materials are generally not needed. In that case, we want to specify flat shading for better performance.

#### Environment Maps

The `envMap` property defines what environment the material reflects. This also works together with plain textures. Though unlike regular texture maps, the `envMap` property takes a cubemap, six images put together to form a cube. The cubemap is wrapped around the entity and applied as a texture. Note that cubemaps can not yet be defined for regular textures.

If shader is set to `standard`, which it is by default, the clarity of the reflection depends on the `metalness`, and `roughness` properties.

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

### Flat Shading Model

Since materials default to physically based shading, materials will factor in light when we might not want them to. To specify flat shading, useful for displaying media like images or videos, we can define the `shader` property to be `flat`. The flat shading model can be specified by setting the `shader` to be `flat` in the material component:

```html
<a-entity geometry="primitive: plane" material="src: #cat-image; shader: flat">
</a-entity>
```

#### Properties

| Property  | Description                                                                                                                                     | Default Value |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| color     | Base diffuse color.                                                                                                                             | #fff          |
| fog       | Whether or not material is affected by [fog][fog].                                                                                              | true          |
| height    | Height of video (in pixels), if defining a video texture.                                                                                       | 360           |
| repeat    | How many times a texture (defined by `src`) repeats in the X and Y direction.                                                                   | 1 1           |
| src       | Image or video texture map. Can either be a selector to an `<img>` or `<video>`, or an inline URL.                                              | None          |
| width     | Width of video (in pixels), if defining a video texture.                                                                                        | 640           |

## Registering a Custom Shader

We register a shader with `AFRAME.registerShader`, passing in a schema. We can then either pass vertex and fragment shaders for use with THREE.ShaderMaterial, or we can override the A-Frame shader initialization and pass in our own material.

### Schema

Shader schemas are similar to [component schemas][component-schema]. The schema will extend the base material component schema. If we are creating a custom shader by passing in vertex and fragment shaders, we can specify uniforms and attributes:

```js
AFRAME.registerShader('hello-world-shader', {
  schema: {
    sunPosition: { type: 'vec3', is: 'uniform' },
    time: { type: 'time', is: 'uniform' }
  }
});
```

#### Shader Uniform and Attribute Types

| Type     | Description                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| color    | Built-in convenience (vec3) uniform type. Will take colors in multiple formats and automatically convert them to vec3 format (e.g., 'red' -> `THREE.Vector3(1, 0, 0)`)   |
| number   | Maps to GLSL `float`.                                                                                                                                                    |
| time     | Built-in convenience (float) uniform type. If specified, the material component will continuously update the shader with the global scene time.                          |
| vec2     | Maps to GLSL `vec2`.                                                                                                                                                     |
| vec3     | Maps to GLSL `vec3`.                                                                                                                                                     |
| vec4     | Maps to GLSL `vec4`.                                                                                                                                                     |

#### Standard Component Properties

If we just want to create a custom material [THREE.Material][threematerial], we can define component properties as usual:

```js
AFRAME.registerShader('custom-material', {
  schema: {
    emissive: { default: '#000' },
    wireframe: { default: false }
  }
});
```

### Creating a Custom Shader

Under the hood, custom shaders use [THREE.ShaderMaterial][shader-material]. We register a shader with `AFRAME.registerShader` while defining a schema, a vertex shader, and a fragment shader:

```js
AFRAME.registerShader('hello-world-shader', {
  schema: {
    color: { type: 'vec3', default: '0.5 0.5 0.5', is: 'uniform' }
  },

  vertexShader: [
    'void main() {',
    '  gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Vertex;',
    '}'
  ].join('\n'),

  fragmentShader: [
    'uniform vec3 color;'
    'void main() {'
    '  gl_FragColor = vec4(color, 1.0);',
    '}'
  ].join('\n')
});
```

To use the shader, we set the material component's `shader` property to the name of a registered shader. Then we pass the define shader uniforms and attributes as properties:

```html
<a-entity geometry="primitive: box"
          material="shader: hello-world-shader; color: 0.3 0.3 0.3"></a-entity>
```

### Creating a Custom Material

By default, shaders will try to create a THREE.ShaderMaterial. We can override the `init` and `update` handlers of the shader and setting `this.material` to work with our own custom material:

```js
AFRAME.registerShader('line-dashed', {
  schema: {
    dashSize: { default: 3 },
    lineWidth: { default: 1 }
  },

  /**
   * `init` used to initialize material. Called once.
   */
  init: function (data) {
    this.material = new THREE.LineDashedMaterial(data);
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

## Shader API Reference

Like components, shaders have a schema and lifecycle handlers.

| Property | Description                                                                                                                 |
|----------|-----------------------------------------------------------------------------------------------------------------------------|
| schema   | Defines properties, uniforms, attributes that the shader will use to extend the material component.                         |
| init     | Lifecycle handler called once during shader initialization. Used to create the material.                                    |
| update   | Lifecycle handler called once during shader initialization and when data is updated. Used to update the material or shader. |

## Additional Resources

- [A-Frame Shader Example][shaderex]
- [ShaderToy][shadertoy]

[basic]: http://threejs.org/docs/#Reference/Materials/MeshBasicMaterial
[built-in]: #built-in_shading_models
[component-schema]: ../core/component.md#schema
[fog]: ../components/fog.md
[glsl]: https://en.wikipedia.org/wiki/OpenGL_Shading_Language
[material]: ../components/material.md
[register-custom-shaders]: #registering_a_custom_shader
[shader-material]: http://threejs.org/docs/#Reference/Materials/ShaderMaterial
[shaderex]: https://github.com/aframevr/aframe/tree/50a07cac9cd2f764b9ff4cd0a5bb20e408f8f4d6/examples/test-shaders
[shadertoy]: https://www.shadertoy.com
[standard]: http://threejs.org/docs/#Reference/Materials/MeshStandardMaterial
[threematerial]: http://threejs.org/docs/#Reference/Materials/Material
