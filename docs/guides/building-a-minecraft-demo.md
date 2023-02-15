---
title: Building a Minecraft Demo
type: guides
layout: docs
parent_section: guides
order: 10
examples:
  - title: Aincraft
    src: https://github.com/aframevr/aframe/tree/master/examples/showcase/aincraft/ 
---

[source-code]: https://github.com/aframevr/aframe/tree/master/examples/showcase/aincraft/
[live-demo]: https://aframe.io/examples/showcase/aincraft/

> View the [source code][source-code], or try out [the demo][live-demo]

Let's build a basic Minecraft (voxel builder) demo that targets room scale VR
with controllers (e.g., Quest, Vive, Rift). The example will be minimally usable on
mobile and desktop.

<!--toc-->

## Example Skeleton

We'll start off with this skeleton HTML:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>

<body>
  <a-scene>
  </a-scene>
</body>
```

## Adding a Ground

`<a-plane>` and `<a-circle>` are basic primitives that are commonly used for
adding a ground. We'll be using `<a-cylinder>` to better work with the
raycasters our controllers will be using. The cylinder will have a radius of 30
meters to match the radius of the sky we'll add later. Note that A-Frame units
are in meters to match the real-world units returned from the WebXR API.

The texture of the ground we'll be using is hosted at
`https://cdn.aframe.io/a-painter/images/floor.jpg"`. We'll add the texture to
our assets, and create a thin cylinder entity pointing to that texture:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>

<a-scene>
  <a-cylinder id="ground" src="https://cdn.aframe.io/a-painter/images/floor.jpg" radius="32" height="0.1"></a-cylinder>
</a-scene>
```

See a live version [here](https://aframe.io/examples/showcase/aincraft/step1.html)

### Preloading Assets

[assets]: https://aframe.io/docs/1.4.0/core/asset-management-system.html

Specifying a URL via the `src` attribute will load the texture at runtime.
Since network requests can negatively impact render performance, we can
*preload* the texture such that the scene doesn't start rendering until its
assets have been fetched. We can do this using the [asset management
system][assets].

We place `<a-assets>` into our `<a-scene>`, place assets (e.g., images, videos,
models, sounds) into `<a-assets>`, and point to them from our entities via a
selector (e.g., `#myTexture`).

Let's move our ground texture to `<a-assets>` to be preloaded using an
`<img>` element:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>

<a-scene>
  <a-assets>
    <img id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
  </a-assets>

  <a-cylinder id="ground" src="#groundTexture" radius="32" height="0.1"></a-cylinder>
</a-scene>
```

See a live version [here](https://aframe.io/examples/showcase/aincraft/step2.html)

## Adding a Background

[a-sky]: https://aframe.io/docs/1.4.0/primitives/a-sky.html
[flickr]: https://www.flickr.com/groups/equirectangular/

[gradient]: https://github.com/zcanter/aframe-gradient-sky

Let's add a 360&deg; background to our `<a-scene>` with the [`<a-sky>`
element][a-sky]. `<a-sky>` is a large 3D sphere with a material mapped on the
inside. Just like a normal image, `<a-sky>` can take an image path with `src`.
This ultimately lets us do immersive 360&deg; images with one line of HTML. As
an exercise later, try using some 360&deg; images from [Flickr's
equirectangular pool][flickr].

We could add a plain color background (e.g., `<a-sky color="#333"></a-sky>`) or
[a gradient][gradient], but let's add a textured background with an image. The
image we're using is hosted at `https://cdn.aframe.io/a-painter/images/sky.jpg`.

The image texture we are using covers semi-sphere so we'll chop our sphere in
half with `theta-length="90"`, and we'll give our sphere a radius of 30 meters
to match the ground:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>

<a-scene>
  <a-assets>
    <img id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
    <img id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
  </a-assets>

  <a-cylinder id="ground" src="#groundTexture" radius="30" height="0.1"></a-cylinder>

  <a-sky id="background" src="#skyTexture" theta-length="90" radius="30"></a-sky>
</a-scene>
```

See a live version [here](https://aframe.io/examples/showcase/aincraft/step3.html)

## Adding Voxels

Voxels in our VR application will be like `<a-box>` but attached with a few
custom A-Frame components. But first let's go over the entity-component
pattern. Let's see how the easy-to-use primitives such as `<a-box>` are
composed under the hood.

This section will later do a deeper dive into the implementation of a couple
A-Frame components. In practice though, we'd often get to use components via
HTML already written by A-Frame community developers rather than building them
from scratch.

### Entity-Component Pattern

[entity]: https://aframe.io/docs/1.4.0/core/entity.html

Every single object in an A-Frame scene is [`<a-entity>`][entity], which by itself
doesn't do anything, like an empty `<div>`. We plug in components (**not to be
confused with Web or React Components**) to that entity to provide with
appearance, behavior , and logic.

[geometry]: https://aframe.io/docs/1.4.0/components/geometry.html
[material]: https://aframe.io/docs/1.4.0/components/material.html

For a box, we attach and configure A-Frame's basic [geometry] and [material]
components. Components are represented as HTML attributes, and component
properties are defined like CSS styles by default. Here's what `<a-box>` looks
like decomposed to its fundamental components. `<a-box>` wraps the components:

```html
<!-- <a-box color="red" depth="0.5" height="0.5" shader="flat" width="0.5"></a-box> -->
<a-entity geometry="primitive: box; depth: 0.5; height: 0.5; width: 0.5"
          material="color: red; shader: standard"></a-entity>
```

The benefit of components is that they are **composable**. We can mix and match
from a bunch of existing components to construct different types of objects.
In 3D development, the possible types of objects we construct are infinite in
number and complexity, and we need an easy way of defining new types of objects
rather than through traditional inheritance. Contrast this to the 2D web where
we develop with a small pool of fixed HTML elements and plop them into a
hierarchy.

### Random Color Component

Components in A-Frame are defined in JavaScript, and they have full access to
three.js and DOM APIs; they can do anything. We define all of our objects as a
bundle of components.

We'll put the pattern to action by writing an A-Frame component to set a random
color on our box. Components are registered with `AFRAME.registerComponent`. We
can define a schema, (the component's data) and lifecycle handler methods (the
component's logic). For the random color component, we won't be setting a schema
since it won't be configurable. But we will define the `init` handler, which is
called exactly once when the component is attached:

```js
AFRAME.registerComponent('random-color', {
  init: function () {
    // ...
  }
});
```

[js]: https://aframe.io/docs/1.4.0/introduction/javascript-events-dom-apis.html

For the random color component, we want to set a random color on the entity
that this component is attached to. Components have a reference to the entity
with `this.el` from the handler methods. And to change the color with
JavaScript, we change the material component's color property using
`.setAttribute()`. A-Frame enhances the behavior of several DOM APIs a bit, but
the APIs mostly mirror vanilla web development. [Read more about using JavaScript
and DOM APIs with A-Frame][js].

We'll also add the `material` component to the list of components that should
initialize before this one, just so our material isn't overwritten.

```js
AFRAME.registerComponent('random-color', {
  dependencies: ['material'],

  init: function () {
    // Set material component's color property to a random color.
    this.el.setAttribute('material', 'color', getRandomColor());
  }
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
```

After the component is registered, we can attach this component **straight from
HTML**. All code written within A-Frame's framework is extending HTML, and
those extensions can be used on other objects and in other scenes. The
beautiful thing is that a developer could write a component that adds physics
to an object, and then someone that doesn't even know JavaScript could add
physics to their scene!

Take our box entity from earlier, we attach the `random-color` HTML attribute
to plug in the `random-color` component. We'll save the component as a JS file
and include it before the scene:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="components/random-color.js"></script>

<a-scene>
  <a-assets>
    <img id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
    <img id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
  </a-assets>

  <!-- Box with random color. -->
  <a-entity geometry="primitive: box; depth: 0.5; height: 0.5; width: 0.5"
            material="shader: standard"
            position="0 0.5 -2"
            random-color></a-entity>

  <a-cylinder id="ground" src="#groundTexture" radius="30" height="0.1"></a-cylinder>

  <a-sky id="background" src="#skyTexture" theta-length="90" radius="30"></a-sky>
</a-scene>
```

See a live version [here](https://aframe.io/examples/showcase/aincraft/step4.html)

Components can be plugged into any entity without having to create or extend a
class like we'd have to in traditional inheritance. If we wanted to attach it
to say, `<a-sphere>` or `<a-obj-model>`, we could!

```html
<!-- Reusing and attaching the random color component to other entities. -->
<a-sphere random-color></a-sphere>
<a-obj-model src="model.obj" random-color></a-obj-model>
```

[directory]: https://aframe.wiki/en/#!pages/component-directory.md

if we wanted to share this component for other people to use, we could too.
There is a community-maintained [Component Directory][directory] that lists
many handy components from the ecosystem, similar to the Unity Asset Store.
If we developed our application using components, all our code is inherently
modular and reusable!

### Snap Component

[snap]: https://github.com/aframevr/aframe/tree/master/examples/showcase/aincraft/components/snap.js

We'll have a `snap` component to snap our boxes to a grid so they aren't
overlapping. We won't get into the details of how this component is
implemented, but you can check out [the snap component's source
code][snap]
(20 lines of JavaScript).

We attach the snap component to our box so that it snaps to every half meter,
also with an offset to center the box:

```html
<a-entity
   geometry="primitive: box; height: 0.5; width: 0.5; depth: 0.5"
   material="shader: standard"
   random-color
   snap="offset: 0.25 0.25 0.25; snap: 0.5 0.5 0.5"></a-entity>
```

Now we have a box entity represented as a bundle of components that can be used
to describe all the voxels in our scene.

### Mixins

[mixin]: https://aframe.io/docs/1.4.0/core/mixins.html

We can create [a mixin][mixin] to define a reusable bundle of components.
Instead of `<a-entity>`, which adds an object to the scene, we'll describe it
using `<a-mixin>` which can be reused to create voxels like a prefab:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="components/random-color.js"></script>
<script src="components/snap.js"></script>

<a-scene>
  <a-assets>
    <img id="groundTexture" src="https://cdn.aframe.io/a-painter/images/floor.jpg">
    <img id="skyTexture" src="https://cdn.aframe.io/a-painter/images/sky.jpg">
    <a-mixin id="voxel"
       geometry="primitive: box; height: 0.5; width: 0.5; depth: 0.5"
       material="shader: standard"
       random-color
       snap="offset: 0.25 0.25 0.25; snap: 0.5 0.5 0.5"></a-mixin>
  </a-assets>

  <a-cylinder id="ground" src="#groundTexture" radius="30" height="0.1"></a-cylinder>

  <a-sky id="background" src="#skyTexture" theta-length="90" radius="30"></a-sky>

  <a-entity mixin="voxel" position="-1 0 -2"></a-entity>
  <a-entity mixin="voxel" position="0 0 -2"></a-entity>
  <a-entity mixin="voxel" position="0 1 -2"
            animation="property: rotation; to: 0 360 0; loop: true"></a-entity>
  <a-entity mixin="voxel" position="1 0 -2"></a-entity>
</a-scene>
```

And we've added voxels using that mixin:

```html
<a-entity mixin="voxel" position="-1 0 -2"></a-entity>
<a-entity mixin="voxel" position="0 0 -2"></a-entity>
<a-entity mixin="voxel" position="0 1 -2"
          animation="property: rotation; to: 0 360 0; loop: true"></a-entity>
<a-entity mixin="voxel" position="1 0 -2"></a-entity>
```

See a live version [here](https://aframe.io/examples/showcase/aincraft/step5.html)

Next, we'll be creating voxels dynamically through interaction using tracked
controllers. Let's start adding our hands to the application.

## Adding Hand Controllers

Adding HTC Vive or Oculus Touch tracked controllers is easy:

```html
<!-- Vive. -->
<a-entity vive-controls="hand: left"></a-entity>
<a-entity vive-controls="hand: right"></a-entity>

<!-- Or Rift. -->
<a-entity oculus-touch-controls="hand: left"></a-entity>
<a-entity oculus-touch-controls="hand: right"></a-entity>
```

We'll be using `hand-controls` which abstracts and works with both Vive and
Rift controls, providing models of basic hand. We'll make the left hand
responsible for teleporting around and the right hand responsible for spawning
and placing blocks.

```html
<a-entity id="teleHand" hand-controls="hand: left"></a-entity>
<a-entity id="blockHand" hand-controls="hand: right"></a-entity>
```

### Adding Teleportation to the Left Hand

We'll plug in teleportation capabilities to the left hand such that we hold a
button to show an arc coming out of the controller, and let go of the button to
teleport to the end of the arc. Before, we wrote our own A-Frame components.
But we can also use open source components already made from the community
and just use them straight from HTML!

[blink-controls]: https://github.com/fernandojsg/aframe-teleport-controls/
For teleportation, there's a component called [blink-controls][blink-controls].
Following the README, we add the component via a `<script>` tag and just set
the `blink-controls` component on the controller on the entity:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/aframe-blink-controls/dist/aframe-blink-controls.min.js"></script>

<!-- ... -->

<a-entity id="teleHand" hand-controls="hand: left" teleport-controls></a-entity>
<a-entity id="blockHand" hand-controls="hand: right"></a-entity>
```

Then we'll configure the `blink-controls` component to use an arc `type` of
teleportation. By default, `blink-controls` will only teleport on the
ground, but we can specify with `collisionEntities` to teleport on the blocks
*and* the ground using selectors. These properties are part of the API that the
`blink-controls` component was created with:

```html
<a-entity id="teleHand" hand-controls="hand: left" blink-controls="collisionEntities: [mixin='voxel'], #ground"></a-entity>
```

That's it! **One script tag and one HTML attribute and we can teleport**.  For
more cool components, check out the [A-Frame Component Directory][directory].

### Adding Voxel Spawner to the Right Hand

In WebXR, the ability to click on objects isn't built-in as it is in 2D
applications. We have to provide that ourselves. Fortunately, A-Frame has many
components to handle interaction. A common method for cursor-like clicking in
VR is to use a raycaster, a laser that shoots out and returns objects that it
intersects with.  Then we implement the cursor states by listening to
interaction events and checking the raycaster for intersections.

A-Frame provides `laser-controls` component for controller laser interaction
that attaches the clicking laser to VR tracked controllers.  Like the
`blink-controls` component, we include the script tag and attach the
`laser-controls` component. This time to the right hand:

```html
<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/aframe-blink-controls/dist/aframe-blink-controls.min.js"></script>

<!-- ... -->

<a-entity id="teleHand" hand-controls="hand: left" teleport-controls="type: parabolic; collisionEntities: [mixin='voxel'], #ground"></a-entity>
<a-entity id="blockHand" hand-controls="hand: right" laser-controls></a-entity>
```


Now when we pull the trigger button on the tracked controllers,
`laser-controls` will emit a `click` event on both the controller and the
entity it is intersecting at the time. Events such as `mouseenter`,
`mouseleave` are also provided. The event contains details about the
intersection.

That provides us with the ability to click, but we'll have to wire up some code
to handle those clicks to spawn blocks. We can use an event listener and
`document.createElement`:

```js
document.querySelector('#blockHand').addEventListener(`click`, function (evt) {
  // Create a blank entity.
  var newVoxelEl = document.createElement('a-entity');

  // Use the mixin to make it a voxel.
  newVoxelEl.setAttribute('mixin', 'voxel');

  // Get normal of the face of intersection and scale it down a bit
  var normal = evt.detail.intersection.face.normal;
  normal.multiplyScalar(0.25);

  // Get the position of the intersection and add our scaled normal
  var position = evt.detail.intersection.point;
  position.add(normal);

  // Set the position using intersection point. The `snap` component above which
  // is part of the mixin will snap it to the closest half meter.
  newVoxelEl.setAttribute('position', position);

  // Add to the scene with `appendChild`.
  this.appendChild(newVoxelEl);
});
```

[intersection-spawn]: https://github.com/aframevr/aframe/tree/master/examples/showcase/aincraft/components/intersection-spawn.js

To generalize creating entities from an intersection event, we've created an
`intersection-spawn` component that can be configured with any event and list
of properties. We won't go into the detail of the implementation, but you can
[check out the simple `intersection-spawn` component source code on
GitHub][intersection-spawn]. We attach `intersection-spawn` capabilities to the
right hand:

```html
<a-entity id="blockHand" hand-controls="hand: right" laser-controls intersection-spawn="event: click; mixin: voxel"></a-entity>
```

Now when we click, we spawn voxels!

### Adding Support for Mobile and Desktop

We see how we've built a custom type of object (i.e., a tracked hand controller
with a hand model that has click capabilities and spawns blocks on click) by
mixing together components. The wonderful thing with components is that they
are reusable in other contexts. We could even attach the `intersection-spawn`
component with the gaze-based `cursor` component so that we can also spawn
blocks on mobile and desktop, without changing a thing about the component!

```html
<a-entity id="blockHand" hand-controls="hand: right" laser-controls intersection-spawn="event: click; mixin: voxel"></a-entity>

<a-camera>
  <a-cursor intersection-spawn="event: click; mixin: voxel"></a-cursor>
</a-camera>
```

## Try It Out!

> [Read the source code on GitHub][source-code].
>
> [Try out the live version][live-demo]

On desktop, we can drag to move the view and click to spawn blocks.  We can
also move using WASD.

On mobile, we can pan the device around and tap to spawn blocks. If we have
a VR headset with a [WebXR-capable browser][webxr] (e.g., Meta Quest, HTC Vive, Oculus
Rift), we can view the [demo][live-demo] in VR within the browser.

[webxr]: https://immersiveweb.dev/

