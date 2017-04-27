---
title: Building a 360&deg; Image Gallery
type: guides
layout: docs
parent_section: guides
order: 3
---

> Remix the [360&deg; Image Gallery on
> Glitch](https://glitch.com/~aframe-gallery). Or Fork the [360&deg; Image
> Gallery Boilerplate on
> GitHub](https://github.com/aframevr/360-image-gallery-boilerplate).

![360&deg; Image Viewer](/images/docs/360-image-viewer.png)

[components]: ../core/component.md
[ecs]: ../core/index.md
[registry]: https://aframe.io/registry/

Let's create an example of building a scene using an
[entity-component-system][ecs] workflow. This guide will introduce three
concepts:

1. Using the standard [components][components] that ship with A-Frame.
2. Using community components from the ecosystem.
3. Writing custom components to accomplish whatever we want.

The scene we will build is a **360&deg; image gallery**. There will be three
panels which the user can click on. Once clicked, the background will fade and
swap the 360&deg; images.

<!--toc-->

## Skeleton

This is the starting point for our scene:

```html
<a-scene>
  <a-assets>
    <audio id="click-sound" src="audio/click.ogg"></audio>

    <!-- Images. -->
    <img id="city" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg">
    <img id="city-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-city.jpg">
    <img id="cubes" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/cubes.jpg">
    <img id="cubes-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-cubes.jpg">
    <img id="sechelt" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/sechelt.jpg">
    <img id="sechelt-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-sechelt.jpg">
  </a-assets>

  <!-- 360-degree image. -->
  <a-sky id="image-360" radius="10" src="#city"></a-sky>

  <!-- Link we will build. -->
  <a-entity class="link"></a-entity>

  <!-- Camera + Cursor. -->
  <a-camera>
    <a-cursor id="cursor">
      <a-animation begin="click" easing="ease-in" attribute="scale"
                   fill="backwards" from="0.1 0.1 0.1" to="1 1 1" dur="150"></a-animation>
      <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
                   from="1 1 1" to="0.1 0.1 0.1" dur="1500"></a-animation>
    </a-cursor>
  </a-camera>
</a-scene>
```

[a-sky]: ../primitives/a-sky.md
[ams]: ../core/asset-management-system.md
[animation-begin]: ../core/animations.md#begin
[camera]: ../primitives/a-camera.md
[cursor]: ../components/cursor.md

We have predefined:

- Several images to choose from in the [Asset Management System][ams] within `<a-assets>`.
- Our 360&deg; image placeholder with [`<a-sky>`][a-sky].
- A [cursor][cursor] with visual feedback using event-driven
[animations][animation-begin], fixed to the [camera][camera].

## Using Standard Components

Standard components are components that ship with A-Frame, like any standard
library. We'll go over how to attach these components to entities and configure
them from HTML.

We want to build a textured plane to act as a link that when clicked, will
change the 360&deg; image. We start with an empty entity. Without any
components, any empty entity does nothing and renders nothing:

```html
<a-entity class="link"></a-entity>
```

[geometry]: ../components/geometry.md

To give our entity shape, we can attach the [geometry component][geometry],
configured to a plane shape. We specify the component data using a syntax that
resembles that of inline CSS styles:

```html
<a-entity class="link"
  geometry="primitive: plane; height: 1; width: 1"></a-entity>
```

[material]: ../components/material.md

Then to give our entity appearance, we can attach the [material
component][material].  We set `shader` to `flat` so the image isn't affected
negatively by lighting. And we set `src` to `#cubes-thumb`, a selector to one
of the images defined in the [Asset Management System][ams].

```html
<a-entity class="link"
  geometry="primitive: plane; height: 1; width: 1"
  material="shader: flat; src: #cubes-thumb"></a-entity>
```

[sound]: ../components/sound.md

We can continue adding features to our entity by plugging in more components.
Let's attach one more standard component, the [sound component][sound]. We want
to make it such that when we click (via gazing) on the link, it plays a click
sound. The syntax is the same as before, but instead we are now using the sound
component's properties. We set `on` to `click` so the sound is played on click.
And we set `src` to `#click-sound`, a selector to our `<audio>` element.

```html
<a-entity class="link"
  geometry="primitive: plane; height: 1; width: 1"
  material="shader: flat; src: #cubes-thumb"
  sound="on: click; src: #click-sound"></a-entity>
```

Now we have a textured plane that plays a click sound when clicked.

## Using Community Components

[awesome]: https://github.com/aframevr/awesome-aframe#components

A-Frame comes with a small core of standard components, but the magic is in the
large number of open source community components in the A-Frame ecosystem. We
can find community components from places such as the [A-Frame
Registry][registry] or the [awesome-aframe repo][awesome]. We can drop them
into our scene and use them straight in our HTML. Components can do anything.
By using components that other people have developed, we gain power without
needing to write our own code.

We'll go through using three community components:

- [template](https://ngokevin.github.io/kframe/components/template/)
- [layout](https://ngokevin.github.io/kframe/components/layout/)
- [event-set](https://ngokevin.github.io/kframe/components/event-set/)

Community components are generally available through both GitHub and published
on npm. An easy way to include components is to use the [unpkg.com
CDN](http://unpkg.com/), which lets us include components hosted on npm as a
script tag, even with support for specifying fuzzy versions. We usually just
need to know the component's npm package name and the path:

```html
<html>
  <head>
    <title>360° Image Browser</title>
    <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-template-component@3.x.x/dist/aframe-template-component.min.js"></script>
    <script src="https://unpkg.com/aframe-layout-component@3.x.x/dist/aframe-layout-component.min.js"></script>
    <script src="https://unpkg.com/aframe-event-set-component@3.x.x/dist/aframe-event-set-component.min.js"></script>
  </head>
  <body>
    <a-scene>
      <!-- ... -->
    </a-scene>
  </body>
</html>
```

[angle]: https://www.npmjs.com/package/angle

Community components are curated to [the A-Frame Registry][registry].  If a
component is on the Registry, there is a way to include it without having to
know which version of the component is compatible with your A-Frame version and
without having to know the path. [angle][angle] is a command-line tool for
A-Frame that has a command to install components straight to our HTML files.

```sh
npm install -g angle
angle install layout
angle install template
angle install event-set
```

### Template Component

Currently, we have one link. We want to create three of them, one for each of
our 360&deg; images.

[template]: https://github.com/ngokevin/aframe-template-component

The [template component][template] integrates templating engines into A-Frame.
This lets us do things such as encapsulate groups of entities, passing data to
generate entities, or iteration. Since we want to turn one link into three,
without copy-and-pasting HTML, we can use the template component.

If we read the [template component's documentation][template], we see one way
to define a template is via a script tag in `<a-assets>`. Let's make our link a
template and give it a name using an `id`:

```html
<a-assets>
  <!-- ... -->
  <script id="plane" type="text/html">
    <a-entity class="link"
      geometry="primitive: plane; height: 1; width: 1"
      material="shader: flat; src: #cubes-thumb"
      sound="on: click; src: #click-sound"></a-entity>
  </script>
</a-assets>
```

Then we can use the template to create multiple planes without much work:

```html
<a-entity template="src: #plane"></a-entity>
<a-entity template="src: #plane"></a-entity>
<a-entity template="src: #plane"></a-entity>
```

[templateliteral]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals

But then they'll all be displaying the same image texture and look the same.
Here is where we'll need a template engine with variable substitution. The
template component comes with simple [ES6 string
interpolation][templateliteral] (i.e., `${var}` format). Though the template
component supports many popular templating engines such as Nunjucks, Jade,
Handlebars, or Mustache.

[data]: https://developer.mozilla.org/docs/Web/Guide/HTML/Using_data_attributes

To allow each instance of the template to be customizable, we define a
`${thumb}` variable in the template, which we can pass using [data
attributes][data]:

```html
<a-assets>
  <!-- ... -->
  <script id="plane" type="text/html">
    <a-entity class="link"
      geometry="primitive: plane; height: 1; width: 1"
      material="shader: flat; src: ${thumb}"
      sound="on: click; src: #click-sound"></a-entity>
  </script>
</a-assets>

<!-- ... -->

<!-- Pass image sources to the template. -->
<a-entity template="src: #plane" data-thumb="#city-thumb"></a-entity>
<a-entity template="src: #plane" data-thumb="#cubes-thumb"></a-entity>
<a-entity template="src: #plane" data-thumb="#sechelt-thumb"></a-entity>
```

The template component has allowed us to not have to repeat a lot of HTML,
keeping our scene very readable.

### Layout Component

[layout]: https://www.npmjs.com/package/aframe-layout-component

Because the default position of an entity is `0 0 0`, the entities will
overlap. While we could manually position each link, we could instead use the
[layout component][layout] to do it for us. The layout component will
automatically position its children to the specified layout.

We create a wrapper entity around our links and attach the layout component
using the `line` layout:

```html
<a-entity id="links" layout="layout: line; margin: 1.5" position="-3 -1 -4">
  <a-entity template="src: #plane" data-thumb="#city-thumb"></a-entity>
  <a-entity template="src: #plane" data-thumb="#cubes-thumb"></a-entity>
  <a-entity template="src: #plane" data-thumb="#sechelt-thumb"></a-entity>
</a-entity>
```

Now our links are no longer overlapping without us having to calculate and
fiddle with positions. The layout component supports other layouts including
grid, circle, and dodecahedron.

### Event-Set Component

[cursor-events]: ../components/cursor.md#events
[event-set]: https://www.npmjs.com/package/aframe-event-set-component
[scale]: ../components/scale.md

Lastly, we'll add some visual feedback to our links. We want them to scale up
and scale back when they are hovered or clicked. This involves writing an event
listener to do `setAttribute`s on the [scale component][scale] in response to
[cursor events][cursor-events]. This is a fairly common pattern so there is an
[event-set component][event-set] that does `setAttribute` in response to
events.

[multiple]: ../core/component.md#multiple-instancing

Let's attach event listeners on our links to scale them up when they are gazed
over, scale them down as they are being clicked, and scale them back when they
are no longer gazed upon. We are mimicking CSS `:hover` states. We can specify
event names with `_event` properties, and the rest of the properties define the
`setAttribute` calls. Notice that the event-set component can have [multiple
instances][multiple]:

```html
<a-assets>
  <!-- ... -->
  <script id="link" type="text/nunjucks">
    <a-entity class="link"
      geometry="primitive: plane; height: 1; width: 1"
      material="shader: flat; src: ${thumb}"
      sound="on: click; src: #click-sound"
      event-set__1="_event: mousedown; scale: 1 1 1"
      event-set__2="_event: mouseup; scale: 1.2 1.2 1"
      event-set__3="_event: mouseenter; scale: 1.2 1.2 1"
      event-set__4="_event: mouseleave; scale: 1 1 1"></a-entity>
  </script>
</a-assets>
```

Wielding components, we were able to do a lot with surprisingly little HTML.
Though the ecosystem has a lot to offer, non-trivial VR applications will
require us to write application-specific components.

## Writing an Application-Specific Component

> View the full [`set-image` component on GitHub](https://github.com/aframevr/360-image-viewer-boilerplate/blob/master/components/set-image.js).

We want to write the component that fades the sky into a new 360&deg; image
once one of the links are clicked. We'll call it `set-image`. The [component
API documentation][components] provides a detailed reference for writing a
component. A basic component skeleton might look like:

Here is the skeleton for our set-image component.

```js
AFRAME.registerComponent('set-image', {
  schema: {
    // ...
  },

  init: function () {
    // ...
  }
});
```

Now we decide what the API for our image-setting component will be. We need:

- An event name to listen to.
- Which entity to change the texture of.
- The image texture.
- An animation fade duration.

So we translate those properties to the schema:

```js
AFRAME.registerComponent('set-image', {
  schema: {
    on: {type: 'string'},
    target: {type: 'selector'},
    src: {type: 'string'},
    dur: {type: 'number', default: 300}
  },

  init: function () {
    // ...
  },

  setupFadeAnimation: function () {
    // Appends an <a-animation> that fades to black.
  }
});
```

Now we set up the event listener to change the image while the texture has
faded to black. Whenever the event is emitted (in our case, a click), then the
component will trigger the animation (which is listening for `set-image-fade`),
wait the appropriate amount of time, and swap the image:

```js
  //...

  init: function () {
    var data = this.data;
    var el = this.el;

    this.setupFadeAnimation();

    el.addEventListener(data.on, function () {
      // Fade out image.
      data.target.emit('set-image-fade');
      // Wait for fade to complete.
      setTimeout(function () {
        // Set image.
        data.target.setAttribute('material', 'src', data.src);
      }, data.dur);
    });
  }

  //...
```

And that concludes our 360&deg; image gallery.

> **[Try it out!](https://aframe.io/360-image-gallery-boilerplate/)**
