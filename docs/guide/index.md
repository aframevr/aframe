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

## What is A-Frame?

A-Frame is an open-source WebVR framework for creating virtual reality (VR)
experiences with HTML. We can build VR scenes that work across smartphones,
desktop, the Oculus Rift, and the room-scale HTC Vive.

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.2.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box color="#6173F4" opacity="0.8" depth="2"></a-box>
      <a-sphere radius="2" src="texture.png" position="1 1 0"></a-sphere>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

### Entity-Component-System

Diving deeper, A-Frame is a [three.js][three] framework that brings the
[entity-component-system][ecs] pattern to the DOM; everything in a scene is an
**entity** which we compose and attach **components** to add any appearance,
behavior, and functionality. Under the hood, `<a-box>` actually looks like:

```html
<a-entity geometry="primitive: box; depth: 2"
          material="color: #6173F4; opacity: 0.8"></a-entity>
```

`<a-entity>` represents an entity, attributes represent components, and
attribute values represent component properties. Components can do anything. Say
someone publishes a `physics` component and someone else publishes an `explode`
component. We can compose them together and attach them to the entity to add
the behavior of exploding on collision.

```html
<a-entity geometry="primitive: box; depth: 2"
          material="color: #6173F4; opacity: 0.8"
          physics="mass: 5; boundingBox: 1 1 2"
          explode="on: physics-collide; intensity: 3"></a-entity>
```

## Why A-Frame?

A-Frame was built by the [Mozilla VR team][mozvr] to make it **quicker** and
**easier** to build 3D/VR scenes in order for them to prototype faster and to
bridge the web development community into the WebVR ecosystem. For WebVR to
succeed, it needs content.  There are only a handful of WebGL developers in the
world, but there are *millions* of web developers, designers, and artists.
A-Frame puts 3D/VR content creation into the hands of everyone.

### A-Frame Reduces Boilerplate

Without A-Frame, starting a proper WebVR project is a lot of effort. You need
to know what you are doing and repeat the same tedious work for every scene:

Import the WebVR polyfill, look through the three.js repository examples for
`VREffect`, declare a canvas, create a camera, set up lights, instantiate a
render loop, wire everything together, build UI to enter VR, etc.

Would toy sites like [zombo.com](https://zombo.com) exist if simply getting
started required this much work? WebVR should thrive with long tail bite-sized
experiences, but boilerplate is a strong barrier to motivation.

In A-Frame, all boilerplate is reduced to one line of HTML: **`<a-scene>`**

<video autoplay loop src="/videos/boilerplate.mp4"></video>

All pieces of work in general are greatly reduced.  Rather than creating a
mesh, creating a geometry, creating a material, and appending to scene...we can
just add one of HTML.

### A-Frame is Tailored for Web Developers

HTML is arguably the easiest interface in all of computing, and it is
universally understood amongst web developers and even non-developers. With
A-Frame based on the DOM, we can manipulate scenes like we would with other web
application: `getAttribute`, `setAttribute`, `querySelector`, etc., it's all
there.

This also means that most JavaScript frameworks and libraries integrate with
A-Frame out-of-the-box. d3, React, Vue.js, Meteor, jQuery all work like a
charm.

A-Frame was built by front-end web developers *for* front-end web developers.
Do you like using npm, GitHub, and the shiniest JavaScript frameworks? So do
we.

### A-Frame Provides Structure to three.js

> "A-Frame is like when MVC landed in traditional front-end work...[where]
three.js is like jQuery." &mdash; @wizgrav

[three.js][three] is amazing. It has provided mere mortals that ability to work
with 3D WebGL. Though like jQuery, three.js code is very loosely structured.
This makes most three.js code hard to reuse and hard to copy-and-paste.

**A-Frame is a declarative entity-component-system framework for three.js.**

Developers can bundle three.js and JavaScript code within A-Frame components.
These components can be reused and composed. If published and shared, these
components can be used by other developers via the HTML abstraction layer.

## Have Fun

Many believe WebVR will become the platform for the open Metaverse. Though
these are the early days, and it will be a long journey to get there. There is
much to do, territory to explore, things to discover. Being involved today is
like being a pioneer. It's a chance to make our marks.

It is recommended to read through the *Guide* and *Core* sections of the
documentation. If you have any questions, join the other hundreds of developers
on [Slack][slack]! Welcome to the future of the web!

[awesome]: https://github.com/aframevr/awesome-aframe
[component]: ../core/component.md
[custom]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
[ecs]: ../core/index.md
[entity]: ../core/entity.md
[mozvr]: http://mozvr.com
[slack]: https://aframevr-slack.herokuapp.com/
[three]: http://threejs.org/
[webvr]: http://mozvr.com/#start
