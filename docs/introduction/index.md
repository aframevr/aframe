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

[mozilla]: https://mozilla.org
[three.js]: https://threejs.org
[webvr]: https://iswebvrready.com

## Getting Started

[glitch]: http://glitch.com/~aframe

A-Frame can be developed from a plain HTML file without having to install
anything. A great way to try out A-Frame is to **[remix the starter example on
Glitch][glitch]**, an online code editor that instantly hosts and deploys for
free. Alternatively, create an `.html` file and include A-Frame in the `<head>`:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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
To get started learning A-Frame, check out [A-Frame School][school] for
visual step-by-step lessons to complement the documentation.

## What is A-Frame?

[github]: https://github.com/aframevr/
[community]: https://aframe.io/community/

![A-Frame](https://cloud.githubusercontent.com/assets/674727/25392020/6f011d10-298c-11e7-845e-c3c5baebd14d.jpg)

:a:-Frame is a web framework for building virtual reality (VR) experiences.
Originally from [Mozilla][mozilla], A-Frame was developed to be an easy but
powerful way to develop VR content. As an [independent open source
project][github], A-Frame has grown to be one of the [largest and most
welcoming VR communities][community].

A-Frame is based on top of HTML, making it simple to get started. But A-Frame
is not just a 3D scene graph or a markup language; the core is a powerful
entity-component framework that provides a declarative, extensible, and
composable structure to [three.js].

A-Frame supports most VR headsets such as Vive, Rift, Windows Mixed Reality, Daydream, GearVR,
Cardboard, and can even be used for augmented reality. Although A-Frame
supports the whole spectrum, A-Frame aims to define fully immersive
interactive VR experiences that go beyond basic 360&deg; content, making
full use of positional tracking and controllers.

<div class="docs-introduction-examples">
  <a href="https://aframe.io/a-painter/?url=https://ucarecdn.com/962b242b-87a9-422c-b730-febdc470f203/">
    <img alt="A-Painter" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531388/acfc3dda-156d-11e7-8563-5bd75252f70f.gif" height="190" width="32%">
  </a>
  <a href="https://aframe.io/a-blast/">
    <img alt="A-Blast" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531440/0336e66e-156e-11e7-95c2-f2e6ebc0393d.gif" height="190" width="32%">
  </a>
  <a href="https://aframe.io/a-saturday-night/">
    <img alt="A-Saturday-Night" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531477/44272daa-156e-11e7-8ef9-d750ed430f3a.gif" height="190" width="32%">
  </a>
  <a href="https://ngokevin.github.io/kframe/scenes/aincraft/">
    <img alt="Aincraft" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531777/25b8ff5e-1570-11e7-896c-3446d1419eb8.gif" height="190" width="32%">
  </a>
  <a href="https://github.com/googlecreativelab/webvr-musicalforest">
    <img alt="Musical Forest by @googlecreativelab" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/25109861/b8e9ec48-2394-11e7-8f2d-ea1cd9df69c8.gif" height="190" width="32%">
  </a>
  <a href="https://aframe-gallery.glitch.me">
    <img alt="360 Image Gallery" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24572552/72f81bec-162e-11e7-9851-037d0280abdb.gif" height="190" width="32%">
  </a>
</div>

## Features

:eyeglasses: **VR Made Simple**: Just drop in a `<script>` tag and `<a-scene>`.
A-Frame will handle 3D boilerplate, VR setup, and default controls. Nothing to
install, no build steps.

:heart: **Declarative HTML**: HTML is easy to read, understand, and
copy-and-paste. Being based on top of HTML, A-Frame is accessible to everyone:
web developers, VR enthusiasts, artists, designers, educators, makers, kids.

:globe_with_meridians: **Cross-Platform VR**: Build VR applications for Vive,
Rift, Windows Mixed Reality, Daydream, GearVR, and Cardboard with support for all respective
controllers. Don't have a headset or controllers? No problem! A-Frame still
works on standard desktop and smartphones.

[ecs]: ./entity-component-system.md

:electric_plug: **Entity-Component Architecture**: A-Frame is a powerful
[three.js] framework, providing a declarative, composable, reusable
[entity-component structure][ecs]. HTML is just the tip of the iceberg;
developers have unlimited access to JavaScript, DOM APIs, three.js, WebVR, and
WebGL.

[A-Painter]: https://github.com/aframevr/a-painter
[Tilt Brush]: https://www.tiltbrush.com/

:zap: **Performance**: A-Frame is optimized from the ground up for WebVR. While
A-Frame uses the DOM, its elements don't touch the browser layout engine. 3D
object updates are all done in memory with little overhead under a single
`requestAnimationFrame` call. For reference, see [A-Painter], a [Tilt Brush]
clone built in A-Frame that runs like native (90+ FPS).

[React]: https://github.com/aframevr/aframe-react/
[Preact]: https://github.com/aframevr/aframe-react#using-with-preact
[Vue.js]: https://vuejs.org/
[Angular]: https://angularjs.org/
[d3.js]: http://blockbuilder.org/search#text=aframe
[Ember.js]: https://www.emberjs.com/
[jQuery]: http://jquery.com/download/

:hammer: **Tool Agnostic**: Since the Web was built on the notion of HTML,
A-Frame is compatible with most libraries, frameworks, and tools including
[React], [Preact], [Vue.js], [d3.js], [Ember.js], [jQuery].

[inspector]: ./visual-inspector-and-dev-tools.md

:mag: **Visual Inspector**: A-Frame provides a handy built-in [visual 3D
inspector][inspector]. Open up *any* A-Frame scene, hit `<ctrl> + <alt> + i`,
and fly around to peek under the hood!

![Inspector](https://cloud.githubusercontent.com/assets/674727/25377018/27be9cce-295b-11e7-9098-3e85ac1fe172.gif)

[augmented reality]: https://github.com/jeromeetienne/AR.js#augmented-reality-for-the-web-in-less-than-10-lines-of-html
[motion capture]: https://github.com/dmarcos/aframe-motion-capture
[mountains]: https://github.com/ngokevin/kframe/tree/master/components/mountain/
[multiuser]: https://github.com/haydenjameslee/networked-aframe
[oceans]: https://github.com/donmccurdy/aframe-extras/tree/master/src/primitives
[particle systems]: https://github.com/IdeaSpaceVR/aframe-particle-system-component
[physics]: https://github.com/donmccurdy/aframe-physics-system
[speech recognition]: https://github.com/lmalave/aframe-speech-command-component
[super hands]: https://github.com/wmurphyrd/aframe-super-hands-component
[teleportation]: https://github.com/fernandojsg/aframe-teleport-controls

:runner: **Components**: Hit the ground running with A-Frame's core components
such as geometries, materials, lights, animations, models, raycasters, shadows,
positional audio, text, and Vive / Touch / Windows Motion / Daydream / GearVR / Cardboard
controls. Get even further with community components such as [particle systems],
[physics], [multiuser], [oceans], [mountains], [speech recognition], [motion capture],
[teleportation], [super hands], and [augmented reality].

## Off You Go!

If it's your first time here, here's a plan for success for getting into
A-Frame:

1. For inspiration, check out what other people have built with A-Frame on the
[Weekly Blog](https://aframe.io/blog/). Users of A-Frame have included The
Washington Post, Amnesty International, Google, Al Jazeera, NPR, Shopify,
iStaging, IDEO, and [Supermedium](https://supermedium.com).

2. Read through the basic documentation and guides to get a grasp.

3. Run through [A-Frame School](https://aframe.io/school/), a brief
step-by-step visual tutorial.

4. [Join us on Slack](https://aframevr-slack.herokuapp.com) and if you have any
questions, [search and ask on
StackOverflow](http://stackoverflow.com/questions/ask/?tags=aframe), and
someone will get right to you!

5. When you build something, share your project online and we'll feature it on
[*A Week of A-Frame*](https://aframe.io/blog/)!

Have fun!
