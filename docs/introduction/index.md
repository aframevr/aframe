---
title: Introduction
section_title: Introduction
type: introduction
layout: docs
order: 1
parent_section: docs
section_order: 1
---

[mozvr]: https://mozvr.com
[webvr]: https://iswebvrready.com
[vrjump]: http://vrjump.de

A-Frame is a web framework for building virtual reality experiences. It was
started by [Mozilla VR][mozvr] to make [WebVR][webvr] content creation easier,
faster, and more accessible.

A-Frame lets you build scenes with just **HTML** while having unlimited access
to JavaScript, [three.js](https://threejs.org), and all existing Web APIs.
A-Frame uses an **entity-component-system** pattern that promotes composition
and extensibility. It is free and open source with a welcoming community and a
thriving **ecosystem of tools and components**.

### HTML

HTML is one of the easiest languages to understand, and many of us are already
familiar with it. There are no build steps or boilerplate required nor anything
to install; all we need is an HTML file:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
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

`<a-scene>` contains all of the objects in our 3D scene. It also handles all of
the setup that is traditionally required for 3D: setting up WebGL, the canvas,
camera, lights, renderer, render loop as well as out of the box VR support on
platforms such as HTC Vive, Oculus Rift, Samsung GearVR, and smartphones
(Google Cardboard). Tons of repeated code eliminated with one clean line of
HTML.

[asceneimage]: https://cloud.githubusercontent.com/assets/674727/20290104/e155c380-aa92-11e6-9507-f19403783a7b.jpg
![<a-scene>][asceneimage]
<small class="image-caption"><i>Image by Ruben Mueller from [The VR Jump][vrjump].</i></small>

Then we can place objects within our scene using assorted primitive elements
that come with A-Frame such as `<a-box>` or `<a-sphere>`. This is extremely
readable, and we could **copy and paste** this HTML to any other scene and it
would behave the same. And we can use the browser's DOM Inspector just as we
would with for any other web site.

### JavaScript

We can use traditional JavaScript DOM APIs to manipulate A-Frame scenes to add
logic, behavior, and functionality:

[jsimage]: https://cloud.githubusercontent.com/assets/674727/20290105/e1573210-aa92-11e6-8f1a-8a31fb6dad52.jpg
![With JavaScript][jsimage]
<small class="image-caption"><i>Image by Ruben Mueller from [The VR Jump][vrjump].</i></small>

```js
var box = document.querySelector('a-box');
box.getAttribute('position');
box.addEventListener('click', function () {
  box.setAttribute('color', 'red');
});
```

And being based on the DOM, most existing libraries and frameworks work
beautifully on top of A-Frame such as React, Vue.js, d3.js, jQuery, or Angular.
The existing web ecosystem of tools were built on top of the notion of
manipulating plain HTML and are thus compatible with A-Frame.

[integrationimage]: https://cloud.githubusercontent.com/assets/674727/20290346/5f3f10b6-aa94-11e6-9d71-94c3e4350d08.png
![Works with Everything][integrationimage]

### Entity-Component-System

[ecs]: http://www.gamedev.net/resources/_/technical/game-programming/understanding-component-entity-systems-r3013

A-Frame at its core is an **entity-component-system framework**.
[Entity-component-system][ecs] (ECS) is a pattern popular in game development
and is prominent in game engines like Unity. ECS favors composition over
inheritance. Every single object in the scene is an entity. An **entity** is an
empty placeholder object that by itself does nothing. We plug in reusable
**components** to attach appearance, behavior, functionality. And we can
mix-and-match different components and configure them in order to define
different types of objects.

[ecsimage]: https://cloud.githubusercontent.com/assets/674727/20289898/71f7fea0-aa91-11e6-8307-d8dc68dff285.png
![Entity-Component Minecraft Analogy][ecsimage]

Object-oriented and hierarchical patterns have well-suited the 2D web, where we
lay out elements and components that have fixed behavior on a web page. 3D and
VR is different; there are infinite types of objects with endless complexity.
We need an easy way to build up different kinds of objects without having to
create a special class for each one.

In A-Frame, an entity is simply:

```html
<a-entity></a-entity>
```

A-Frame components (not to be confused with Web Components) are reusable
modules that can be plugged into any entity. They are allowed to do *anything*
and have full access to JavaScript, three.js, and Web APIs. The structure of a
basic component may look like:

```js
AFRAME.registerComponent('foo', {
  schema: {
    bar: {type: 'number'},
    baz: {type: 'string'}
  },

  init: function () {
    // Do something when component is plugged in.
  },

  update: function () {
    // Do something when component's data is updated.
  }
});
```

Then once defined, we can plug this bundle of appearance, behavior, or
functionality into an entity straight from an HTML attribute.

```html
<a-entity foo="bar: 5; baz: qux"></a-entity>
```

### Component Ecosystem

A-Frame ships with several components, but since A-Frame is fully extensible at
its core, the community has filled the ecosystem with tons of components such
as physics, particle systems, audio visualizations, and Leap Motion controls. This
ecosystem is the lifeblood of A-Frame. A developer can build a component and
publish it, and then someone else can take that component and use it straight
from HTML without even having to know any JavaScript.

[registry]: https://aframe.io/aframe-registry

These components are curated and collected into the **[A-Frame
Registry][registry]**. This is similar to the collection of components and
modules on the Unity Asset Store, but free and open source. We make sure they
work well and from there they are easily searchable and installable through
multiple channels. One of which is through the A-Frame Inspector.

[aframeregistryimage]: https://cloud.githubusercontent.com/assets/674727/20289850/13a4b42e-aa91-11e6-84bc-c5aa8ea6fe6c.png
![A-Frame Registry][aframeregistryimage]

### A-Frame Inspector

The A-Frame Inspector is a visual tool for inspecting and editing A-Frame
scenes. Similar to the browser's DOM Inspector, you can go to any A-Frame
scene, local or on the Web, and hit `<ctrl> + <alt> + i` on your keyboard.

This will open the visual Inspector where you can make changes and return to
the scene with the reflected changes. You can visually move and place objects,
poke around with properties of the components, or pan the camera around to see
a different view of the scene. It's like viewing the source in an interactive
way.

[inspectorimage]: https://cloud.githubusercontent.com/assets/674727/18565454/ad047c84-7b44-11e6-8c4a-0f1fe55c6682.gif
![A-Frame Inspector][inspectorimage]

The A-Frame Inspector is integrated with the A-Frame Registry. From the
Inspector, you can install components from the Registry and attach them to
objects in the scene with a couple of clicks.

### A-Painter

[painter]: https://aframe.io/a-painter

A-Frame is powerful and performant enough to create compelling experiences.
The Mozilla VR team built [A-Painter][painter], a room scale Vive experience
where you can paint with both of your hands right within the browser. It was
built on the order of weeks and runs well at over 90 frames per second.

[apainterimage]: https://cloud.githubusercontent.com/assets/674727/20289823/ce653262-aa90-11e6-83a5-89c25cbb42ee.gif
![A-Painter][apainterimage]

### Community

In the manner of other open source projects such as Rust and Servo, while it is
primarily maintained by Mozilla, A-Frame is an open-source community project.
We work together to realize the vision of an open, connected, and immersive
WebVR platform and ecosystem not owned by any one corporation.

[scenesimage]: https://cloud.githubusercontent.com/assets/674727/20292171/4f960d0c-aaa0-11e6-99c2-6e89ec83d37e.jpg
![Community Scenes][scenesimage]

[blog]: /blog/
[slack]: https://aframevr-slack.herokuapp.com
[stackoverflow]: https://stackoverflow.com/questions/ask/?tags=aframe
[twitter]: https://twitter.com/aframevr

Join us on [Slack][slack] to hang out or share projects. Check out recent
projects that people have been working on in the weekly [A-Frame Blog][blog].
Ask questions and seek help on [Stack Overflow][stackoverflow]. And if you have
something to share, just tweet it [@aframevr][twitter], and we'll try to share
it. Now let's get started!
