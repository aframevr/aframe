---
title: Introduction
section_title: Introduction
type: introduction
layout: docs
order: 1
parent_section: docs
section_order: 1
---

## What is A-Frame?

A-Frame is an open-source WebVR framework for creating virtual reality (VR)
experiences with HTML. We can build VR scenes that work across smartphones,
desktop, the Oculus Rift, and the room-scale HTC Vive.

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.3.0/aframe.min.js"></script>
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

[ecs]: ../core/index.md
[three]: http://threejs.org/

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

[mozvr]: http://mozvr.com

A-Frame was built by the [Mozilla VR team][mozvr] to make it **quicker** and
**easier** to build 3D/VR scenes in order for them to prototype faster and to
bridge the web development community into the WebVR ecosystem. For WebVR to
succeed, it needs content. There are only a handful of WebGL developers in the
world, but there are *millions* of web developers, designers, and artists.
A-Frame puts 3D/VR content creation into the hands of everyone.

### A-Frame Reduces Boilerplate

Without A-Frame, starting a proper WebVR project is a lot of effort. You need
to know what you are doing and repeat the same tedious work for every scene:

<video autoplay loop src="/videos/boilerplate.mp4"></video>

WebVR should thrive with long-tail, bite-sized experiences, but boilerplate is
a strong barrier to motivation of wanting to build. In A-Frame, all boilerplate
is reduced to a single line of HTML: **`<a-scene>`**.

And rather than creating a mesh, creating a geometry, creating a material, then
appending to scene, that is all also reduced to a single line of HTML.

### A-Frame is Tailored for Web Developers

With A-Frame based on the DOM, we can manipulate scenes as we would with other
web application: `getAttribute`, `setAttribute`, `querySelector`, etc.  Most
JavaScript frameworks and libraries integrate with A-Frame out of the box.  d3,
React, Vue.js, Meteor, jQuery all work like a charm. A-Frame was built by web
developers for web developers.

### A-Frame Provides Structure to three.js

> "A-Frame is like when MVC landed in traditional front-end work...[where]
three.js is like jQuery." &mdash; @wizgrav

[three.js][three] has made it very accessible to develop 3D WebGL, but three.js
code is often loosely structured. A-Frame provides a way to structure three.js
code.

**A-Frame is a declarative entity-component-system framework for three.js.**

Developers can modularize three.js and JavaScript code within A-Frame
components. These components can be composed with one another. If published and
shared, these components can be used by other developers via HTML.

## Have Fun!

[guides]: ../guides
[core]: ../core/index.md
[slack]: https://aframevr-slack.herokuapp.com/

It is recommended to read through the [Guides][guides] and the [Core][core]
sections of the documentation. If you have any questions, join the other
hundreds of developers on [Slack][slack]!
