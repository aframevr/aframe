---
title: Overview
section_title: Guide
type: guide
layout: docs
order: 1
parent_section: docs
section_order: 1
show_guide: true
---

A-Frame is an open-source framework for creating 3D and virtual reality experiences on the web. It was built by the [MozVR team][mozvr] to more quickly prototype [WebVR][webvr] experiences as we asked ourselves "what would the virtual reality on the web look like?". Just as today on the web, we click on links to jump from page to page, one day we will walk through portals to jump from world to world. And to have worlds to jump between, we need WebVR content. Unfortunately, there are only a handful of WebGL developers in the world, but there are *millions* of web developers, web designers, and 3D artists. A-Frame puts VR content creation into hands of everyone. A "Hello World" A-Frame scene might look like:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.2.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box color="#6173F4" width="4" height="10" depth="2"></a-box>

      <a-collada-model src="monster.dae" position="-1 0.5 1" rotation="0 45 0 "></a-collada-model>

      <a-image src="fox.png"></a-image>

      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

A-Frame allows us to create VR scenes that works across desktop, the Oculus Rift, and mobile with just HTML. We can drop in the library and have a VR scene running in just a few lines of markup. Since it based on HTML, we can manipulate scenes with JavaScript like we would with normal HTML elements, and we can continue using our favorite JavaScript libraries and frameworks (e.g., d3, React). But the key factor is that A-Frame introduces the [entity-component-system pattern][ecs], a pattern commonly used in 3D and game development, to HTML for composability, extensibility, and flexibility. If we are to bring 3D to the web, we need to adopt existing patterns from the industry. The scene in the example above actually uses convenience elements; at A-Frame's core, it translates to:

```html
<html>
  <body>
    <a-scene>
      <a-entity geometry="primitive: box; depth: 1; height: 1; width: 1"
                material="color: #4CC3D9"
                position="-1 0.5 1" rotation="0 45 0"></a-entity>

      <a-entity collada-model="monster.dae"></a-entity>

      <a-entity geometry="primitive: plane" material="src: url(fox.png)"></a-entity>

      <a-entity geometry="primitive: sphere; radius: 5000"
                material="color: #EF2D5E"
                scale="-1 1 1"></a-entity>
    </a-scene>
  </body>
</html>
```

Under the hood, A-Frame is built on top of [Custom Elements][custom] and is powered by [three.js][three]. Although A-Frame at first looks like only a handful of custom HTML elements like `<a-box>`, A-Frame at its heart is a **entity-component-system-based three.js framework with a DOM interface**. Everything in an A-Frame scene is an [entity][entity] which we plug [components][component] into in order to compose appearance, behavior, and functionality. This allows experienced developers to share reusable components that other developers can drop into their scene and use immediately. The scene above looks needlessly verbose, but we see its true power when we're able to attach and compose appearance and behavior at whim:

```html
<html>
  <body>
    <a-scene>
      <!-- Configure entity object by adding more components. -->
      <a-entity geometry="primitive: box; depth: 1; height: 1; width: 1"
                material="color: #4CC3D9"
                position="-1 0.5 1" rotation="0 45 0"
                physics="boundingBox: 1 1 1; mass: 2"
                explode="on: collide"
                template="src: butterflies.template; type: nunjucks"
                speech-controls="trigger: siri"></a-entity>

      <a-entity collada-model="monster.dae"></a-entity>

      <a-entity geometry="primitive: plane" material="src: url(fox.png)"></a-entity>

      <a-entity geometry="primitive: sphere; radius: 5000"
                material="color: #EF2D5E"
                scale="-1 1 1"></a-entity>
    </a-scene>
  </body>
</html>
```

Read through the documentation front-to-back for more details, and if you have any questions, join the other hundreds of developers on [Slack][slack]! Welcome to the future of the web.

> Check out [awesome things][awesome] that people have done with A-Frame.

[awesome]: https://github.com/aframevr/awesome-aframe
[component]: ../core/component.md
[custom]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
[ecs]: ../core/index.md
[entity]: ../core/entity.md
[mozvr]: http://mozvr.com
[slack]: https://aframevr-slack.herokuapp.com/
[three]: http://threejs.org/
[webvr]: http://mozvr.com/#start
