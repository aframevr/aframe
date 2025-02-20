---
title: Introduction
section_title: Introduction
type: introduction
layout: docs
order: 1
parent_section: docs
section_order: 1
installation: true
examples:
  - title: Hello, World!
    src: https://glitch.com/edit/#!/aframe?path=index.html
---

[three.js]: https://threejs.org

## Getting Started

[glitch]: http://glitch.com/~aframe

A-Frame can be developed from a plain HTML file without having to install
anything. A great way to try out A-Frame is to **[remix the starter example on
Glitch][glitch]**, an online code editor that instantly hosts and deploys for
free. Alternatively, create an `.html` file and include A-Frame in the
`<head>`:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

[Installation]: ./installation.md
[school]: https://aframe.io/school/

The [Installation] page provides more options for getting started with A-Frame.
To get started learning A-Frame, check out [A-Frame School][school] for visual
step-by-step lessons to complement the documentation.

## What is A-Frame?

[github]: https://github.com/aframevr/
[community]: https://aframe.io/community/

![A-Frame](https://cloud.githubusercontent.com/assets/674727/25392020/6f011d10-298c-11e7-845e-c3c5baebd14d.jpg)

:a:-Frame is a web framework for building virtual reality (VR) experiences.
A-Frame is based on top of HTML, making it simple to get started. But A-Frame
is not just a 3D scene graph or a markup language; the core is a powerful
entity-component framework that provides a declarative, extensible, and
composable structure to [three.js].

Originally conceived within Mozilla and now maintained by the co-creators of
A-Frame within [Supermedium](https://supermedium.com), A-Frame was developed to
be an easy yet powerful way to develop VR content. As an [independent open
source project][github], A-Frame has grown to be one of the [largest VR
communities][community].

A-Frame supports most VR and AR devices such as Meta Quest, Apple Vision Pro, PICO lineup, Lynx-R1 or Valve Index 
Although A-Frame supports the whole spectrum, A-Frame aims to define
fully immersive interactive VR experiences that go beyond basic 360&deg;
content, making full use of positional tracking and controllers.

<div class="docs-introduction-examples">
  <a href="https://supermedium.com/supercraft">
    <img alt="Supercraft" target="_blank" src="https://user-images.githubusercontent.com/674727/41085457-f5429566-69eb-11e8-92e5-3210e4c6c4a0.gif" height="190" width="32%">
  </a>
  <a href="https://aframe.io/a-painter/?url=https://ucarecdn.com/962b242b-87a9-422c-b730-febdc470f203/">
    <img alt="A-Painter" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531388/acfc3dda-156d-11e7-8563-5bd75252f70f.gif" height="190" width="32%">
  </a>
  <a href="https://supermedium.com">
    <img alt="Supermedium" target="_blank" src="https://user-images.githubusercontent.com/674727/37294616-7212cd20-25d3-11e8-9e7f-c0c61074f1e0.png" height="190" width="32%">
  </a>
  <a href="https://aframe.io/a-blast/">
    <img alt="A-Blast" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531440/0336e66e-156e-11e7-95c2-f2e6ebc0393d.gif" height="190" width="32%">
  </a>
  <a href="https://aframe.io/a-saturday-night/">
    <img alt="A-Saturday-Night" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531477/44272daa-156e-11e7-8ef9-d750ed430f3a.gif" height="190" width="32%">
  </a>
  <a href="https://github.com/googlecreativelab/webvr-musicalforest">
    <img alt="Musical Forest by @googlecreativelab" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/25109861/b8e9ec48-2394-11e7-8f2d-ea1cd9df69c8.gif" height="190" width="32%">
  </a>
</div>

## Features

:eyeglasses: **VR Made Simple**: Just drop in a `<script>` tag and `<a-scene>`.
A-Frame will handle 3D boilerplate, VR setup, and default controls. Nothing to
install, no build steps.

:heart: **Declarative HTML**: HTML is easy to read, understand, and
copy-and-paste. Being based on top of HTML, A-Frame is accessible to everyone:
web developers, VR enthusiasts, artists, designers, educators, makers, kids.

:electric_plug: **Entity-Component Architecture**: A-Frame is a powerful
[three.js] framework, providing a declarative, composable, reusable
[entity-component structure][ecs]. HTML is just the tip of the iceberg;
developers have unlimited access to JavaScript, DOM APIs, three.js, WebVR, and
WebGL.

:globe_with_meridians: **Cross-Platform VR**: Build VR applications for Vive,
Rift, Meta Quest, Windows Mixed Reality, and Apple Vision Pro with support for
all respective controllers. Don't have a headset or controllers? No problem!
A-Frame still works on standard desktop and smartphones.

[ecs]: ./entity-component-system.md

[A-Painter]: https://github.com/aframevr/a-painter
[Tilt Brush]: https://www.tiltbrush.com/

:zap: **Performance**: A-Frame is optimized from the ground up for WebVR. While
A-Frame uses the DOM, its elements don't touch the browser layout engine. 3D
object updates are all done in memory with little garbage and overhead. The most
interactive and large scale WebVR applications have been done in A-Frame
running smoothly at 90fps.

[inspector]: ./visual-inspector-and-dev-tools.md

:mag: **Visual Inspector**: A-Frame provides a handy built-in [visual 3D
inspector][inspector]. Open up *any* A-Frame scene, hit `<ctrl> + <alt> + i` or `<ctrl> + <option> + i`,
and fly around to peek under the hood!

![Inspector](https://cloud.githubusercontent.com/assets/674727/25377018/27be9cce-295b-11e7-9098-3e85ac1fe172.gif)

[augmented reality]: https://github.com/jeromeetienne/AR.js#augmented-reality-for-the-web-in-less-than-10-lines-of-html
[environment]: https://github.com/supermedium/aframe-environment-component
[multiuser]: https://github.com/networked-aframe/networked-aframe
[oceans]: https://github.com/c-frame/aframe-extras/tree/master/src/primitives
[particle systems]: https://github.com/c-frame/aframe-particle-system-component
[physics]: https://github.com/c-frame/aframe-physics-system
[state]: https://npmjs.com/package/aframe-state-component
[super hands]: https://github.com/c-frame/aframe-super-hands-component
[teleportation]: https://github.com/jure/aframe-blink-controls

:runner: **Components**: Hit the ground running with A-Frame's core components
such as geometries, materials, lights, animations, models, raycasters, shadows,
positional audio, text, and controls for most major headsets. Get even further
from the hundreds of community components including [environment], [state], [particle
systems], [physics], [multiuser], [oceans], [teleportation], [super hands], and
[augmented reality].

:earth_americas: **Proven and Scalable**: A-Frame has been used by companies
such as Google, Disney, Samsung, Toyota, Ford, Chevrolet, Amnesty
International, CERN, NPR, Al Jazeera, The Washington Post, NASA. Companies such
as Google, Microsoft, Oculus, and Samsung have made contributions to A-Frame.

## Off You Go!

[Discord]: https://supermedium.com/discord
[slack]: https://aframevr.slack.com/join/shared_invite/zt-f6rne3ly-ekVaBU~Xu~fsZHXr56jacQ

If it's your first time here, here's a plan for success for getting into
A-Frame:

1. [Subscribe to the Newsletter](https://aframe.io/subscribe/) for updates and
tips on A-Frame and to see featured community projects.

2. Read through the documentation to get a grasp.
[Glitch](https://glitch.com/~aframe) is used as a recommended coding playground
and for examples.

3. [Join us on Discord][Discord] and [Slack][slack] and if you have any
questions, [search and ask on StackOverflow](http://stackoverflow.com/questions/ask/?tags=aframe),
and someone will try to get to you!

4. When you build something, share your project online and we'll try to feature
it on the [newsletter](https://aframe.io/subscribe/) and the
[blog](https://aframe.io/blog/)!

And it really helps to have a dig into the fundamentals on JavaScript and
[three.js](https://threejs.org/). Have fun!
