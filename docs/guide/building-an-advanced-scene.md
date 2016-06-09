---
title: Building an Advanced Scene
type: guide
layout: docs
parent_section: guide
order: 4
---

> Fork the [360&deg; Image Viewer Boilerplate on GitHub](https://github.com/aframevr/360-image-browser-boilerplate).

Let's go through an example building a scene using an
[entity-component-system][ecs] workflow. This guide will introduce three concepts:

1. Using the standard [components][components] that ship with A-Frame
2. Using third-party components from the ecosystem
3. Writing custom components to accomplish whatever we want

The scene we will build is a **360&deg; image viewer**. There will be three
panels which the user can click on. Once clicked, the background will fade and
swap the 360&deg; images.

<!--toc-->

## Skeleton

Here will be the starting point for our scene:

```html
<a-scene>
  <a-assets>
    <!-- Images. -->
    <img id="city" src="img/city.jpg">
    <img id="city-thumb" src="img/thumb-city.png">
    <img id="cubes" src="img/cubes.jpg">
    <img id="cubes-thumb" src="img/thumb-cubes.png">
    <img id="sechelt" src="img/sechelt.jpg">
    <img id="sechelt-thumb" src="img/thumb-sechelt.png">
  </a-assets>

  <!-- 360-degree image. -->
  <a-sky id="image-360" radius="10" src="#city"></a-sky>

  <!-- Link. -->
  <a-plane class="link" height="1" width="1"></a-plane>

  <!-- Camera + Cursor. -->
  <a-camera>
    <a-cursor id="cursor">
      <a-animation begin="cursor-click" easing="ease-in" attribute="scale"
                   fill="backwards" from="0.1 0.1 0.1" to="1 1 1" dur="150"></a-animation>
      <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
                   from="1 1 1" to="0.1 0.1 0.1" dur="1500"></a-animation>
    </a-cursor>
  </a-camera>
</a-scene>
```

We have predefined:

- Several images to choose from in the [Asset Management System][ams] within `a-assets`.
- Our 360&deg; image placeholder with [`a-sky`][a-sky].
- A [cursor][cursor] with visual feedback using evented [animations][animation], fixed to the [camera][camera].

## 1. Using Standard Components

Standard components are components that ship with A-Frame, like a standard
library. What we want to do is add an image texture to the link using the
`material` component.

The `material` component is a [multi-property]

## Writing Components

Developers that are comfortable with JavaScript and three.js can write
components to add appearance, behavior, and functionality to the experience.

As
we've seen these components can then be reused and shared with the community.
Though not all components have to be shared; they can be ad-hoc or one-off.

Since A-Frame is based on an [entity-component-system pattern][ecs], most logic
should be implemented within components. The development workflow within
A-Frame should try to revolve around components. The [component
documentation][components] goes into much more detail on what a component looks
like and how to write one.

[a-sky]: ../primitives/a-sky.md
[ams]: ../core/asset-management-system.md
[animation]: ../core/animation.md
[awesome]: https://github.com/aframevr/awesome-aframe#components
[basic]: ./building-a-basic-scene.md
[boilerplate]: https://github.com/ngokevin/aframe-component-boilerplate
[camera]: ../primitives/camera.md
[codepen]: http://codepen.io/team/mozvr/pen/PNoWEz/?editors=1000
[components]: ../core/component.md
[cursor]: ../components/cursor.md
[ecs]: ../core/index.md
[github]: https://github.com/ngokevin/aframe-fps-example
[layout]: https://github.com/ngokevin/aframe-layout-component
[mixin]: ../core/mixins.md
[multiproperty]: ../core/component.md#multi-property
[raycaster]: http://threejs.org/docs/index.html#Reference/Core/Raycaster
[template]: https://github.com/ngokevin/aframe-template-component
[three]: http://threejs.org
[webcomponents]: http://webcomponents.org/

```
<a-scene>
  <a-assets>
    <img id="city" src="img/city.jpg">
    <img id="city-thumb" src="img/thumb-city.png">
    <img id="cubes" src="img/cubes.jpg">
    <img id="cubes-thumb" src="img/thumb-cubes.png">
    <img id="sechelt" src="img/sechelt.jpg">
    <img id="sechelt-thumb" src="img/thumb-sechelt.png">

    <script id="link" type="text/nunjucks">
      <a-plane class="link" height="1" width="1"
               material="shader: flat; src: {{ thumb }}"
               event-set="_event: cursor-mousedown; height: 1.0; width: 1.0,
                          _event: cursor-mouseup; height: 1.2; width: 1.2,
                          _event: cursor-mouseenter; height: 1.2; width: 1.2,
                          _event: cursor-mouseleave; height: 1; width: 1"
               set-image="on: cursor-click; target: #image-360; src: {{ src }}"
               sound="on: cursor-click; src: audio/click.ogg"
               update-raycaster="#cursor">
      </a-plane>
    </script>
  </a-assets>

  <!-- 360-degree image. -->
  <a-sky id="image-360" radius="10" src="#city"></a-sky>

  <!-- Image links. -->
  <a-entity id="links" layout="margin: .75" position="-3 -1 -4">
    <a-entity template="src: #link" data-src="#cubes"
              data-thumb="#cubes-thumb"></a-entity>
    <a-entity template="src: #link" data-src="#city"
              data-thumb="#city-thumb"></a-entity>
    <a-entity template="src: #link" data-src="#sechelt"
              data-thumb="#sechelt-thumb"></a-entity>
  </a-entity>

  <!-- Camera + cursor. -->
  <a-camera>
    <a-cursor id="cursor"
              event-set="_event: cursor-mouseenter; color: springgreen,
                         _event: cursor-mouseleave; color: black"
              raycaster="objects: .link">
      <a-animation begin="cursor-click" easing="ease-in" attribute="scale"
                   fill="backwards" from="0.1 0.1 0.1" to="1 1 1" dur="150"></a-animation>
      <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
                   from="1 1 1" to="0.1 0.1 0.1" dur="1500"></a-animation>
    </a-cursor>
  </a-camera>
</a-scene>
```
