---
title: Building with Components
type: guides
layout: docs
parent_section: guides
order: 2
---

> Fork the [360&deg; Image Gallery Boilerplate on GitHub](https://github.com/aframevr/360-image-gallery-boilerplate).

![360&deg; Image Viewer](/images/docs/360-image-viewer.png)

Let's create an example of building a scene using an
[entity-component-system][ecs] workflow. This guide will introduce three
concepts:

1. Using the standard [components][components] that ship with A-Frame.
2. Using third-party components from the ecosystem.
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
      <a-animation begin="click" easing="ease-in" attribute="scale"
                   fill="backwards" from="0.1 0.1 0.1" to="1 1 1" dur="150"></a-animation>
      <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
                   from="1 1 1" to="0.1 0.1 0.1" dur="1500"></a-animation>
    </a-cursor>
  </a-camera>
</a-scene>
```

We have predefined:

- Several images to choose from in the [Asset Management System][ams] within `<a-assets>`.
- Our 360&deg; image placeholder with [`<a-sky>`][a-sky].
- A [cursor][cursor] with visual feedback using event-driven
[animations][animation-begin], fixed to the [camera][camera].

## Using Standard Components

Standard components are components that ship with A-Frame, like any standard
library. We'll go over how to attach these components to entities and configure
them from HTML.

We want to add an image texture to `<a-plane>` link using the [material
component][material].

The material component is a [multi-property component][multi-property]. To
attach the material component to the plane, we set the component name as an
HTML attribute:

```html
<a-plane class="link" height="1" width="1"
         material></a-plane>
```

Then we the specify the component data using a syntax that resembles that of
inline CSS styles. We set `shader` to `flat` so the image isn't affected
negatively by lighting. And we set `src` to `#cubes-thumb`, a selector to one
of the images defined in the [Asset Management System][ams].

```html
<a-plane class="link" height="1" width="1"
         material="shader: flat; src: #cubes-thumb"></a-plane>
```

Let's attach one more standard component, the [sound component][sound]. We want
to make it such that when we click (via gazing) on the link, it plays a click
sound. The syntax is the same as before, but instead we are now using the sound
component's properties. We set `on` to `click` so the sound is played on click.
And we set `src` to `#click-sound`, a selector to our `<audio>` element.

```html
<a-plane class="link" height="1" width="1"
         material="shader: flat; src: #cubes-thumb"
         sound="on: click; src: #click-sound"></a-plane>
```

Now we have a textured plane that plays a click sound when clicked.

## Using Third-Party Components

We can grab third-party components from the [ecosystem][awesome], drop them into our
scene, and use them in our HTML. Components can do anything. By using components
that other people have developed, we gain tons of power without needing to
write our own code.

We'll go through using three such third-party components: template, layout, and
event-set. First, we have to include them. [K-Frame][kframe] is a component
pack by [Kevin Ngo][ngokevin], an A-Frame core developer, that conveniently
includes all three of these components in one bundle.

To drop in K-Frame, download [`k-frame.min.js`](kmin) from the project's
[`dist` folder][kdist] and include it in the `<head>` *after* A-Frame:

```html
<html>
  <head>
    <title>360° Image Browser</title>
    <script src="lib/aframe.min.js"></script>
    <script src="lib/k-frame.min.js"></script>
  </head>
  <body>
    <a-scene>
      <!-- ... -->
    </a-scene>
  </body>
</html>
```

### Template Component

Currently, we have one link. We want to create three of them, one for each of
our 360&deg; images.

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
  <script id="plane">
    <a-plane class="link" height="1" width="1"
             material="shader: flat; src: #cubes-thumb"
             sound="on: click; src: #click-sound"></a-plane>
  </script>
</a-assets>
```

Then we can use the template to create multiple planes without much work:

```html
<a-entity template="src: #plane"></a-entity>
<a-entity template="src: #plane"></a-entity>
<a-entity template="src: #plane"></a-entity>
```

But then they'll all be displaying the same image texture and look the same.
Here is where we'll need a template engine with variable
substitution/interpolation.

Let's tell the template component to use the popular [Nunjucks][nunjucks]
engine by specifying `<script type="text/nunjucks">`. The component will
lazy-load the template engine for us. And with Nunjucks, we define a `{{ thumb
}}` variable in the template, which we can pass using the [data attributes][data]:

```html
<a-assets>
  <!-- ... -->
  <!-- Specify Nunjucks. -->
  <script id="plane" type="text/nunjucks">
    <a-plane class="link" height="1" width="1"
             material="shader: flat; src: {{ thumb }}"
             sound="on: click; src: #click-sound"></a-plane>
  </script>
</a-assets>

<!-- ... -->

<!-- Pass image sources to the template. -->
<a-entity template="src: #plane" data-thumb="#city-thumb"></a-entity>
<a-entity template="src: #plane" data-thumb="#cubes-thumb"></a-entity>
<a-entity template="src: #plane" data-thumb="#sechelt-thumb"></a-entity>
```

The template component allows us to keep our scene clean by not having to
repeat verbose code.

### Layout Component

Because the default position of an entity is `0 0 0`, the entities will
overlap. While we could manually position each link, we could instead use the
[layout component][layout] to do it for us. The layout component will
automatically position its children to the specified layout.

We create a wrapper entity around our links and attach the layout component
using the `line` layout:

```html
<a-entity id="links" layout="layout: line; margin: .75" position="-3 -1 -4">
  <a-entity template="src: #plane" data-thumb="#city-thumb"></a-entity>
  <a-entity template="src: #plane" data-thumb="#cubes-thumb"></a-entity>
  <a-entity template="src: #plane" data-thumb="#sechelt-thumb"></a-entity>
</a-entity>
```

Now our links are no longer overlapping without us having to calculate and
fiddle with positions.

### Event-Set Component

Lastly, we'll add some visual feedback to our links. We want them to scale up
and scale back when they are hovered or clicked. This involves writing an event
listener to do `setAttribute`s on the [scale component][scale] in response to
[cursor events][cursor-events]. This is a fairly common pattern so there is an
[event-set component][event-set] that does `setAttribute` in response to
events.

Let's attach event listeners on our links to scale them up when they are gazed
over, scale them down as they are being clicked, and scale them back when they
are no longer gazed upon. We are mimicking CSS `:hover` states. We can specify
event names with `_event` properties, and the rest of the properties define the
`setAttibute` calls. Notice that the event-set component can have [multiple
instances][multiple]:

```html
<a-assets>
  <!-- ... -->
  <script id="link" type="text/nunjucks">
    <a-plane class="link" height="1" width="1"
             material="shader: flat; src: {{ thumb }}"
             sound="on: click; src: #click-sound"
             event-set__1="_event: mousedown; scale: 1 1 1"
             event-set__2="_event: mouseup; scale: 1.2 1.2 1"
             event-set__3="_event: mouseenter; scale: 1.2 1.2 1"
             event-set__4="_event: mouseleave; scale: 1 1 1"></a-plane>
  </script>
</a-assets>
```

Wielding components, we were able to do a lot with just a few more lines of
HTML. Though the ecosystem has a lot to offer, your scenes will often require
writing your own simple components.

## Writing Components

The [component documentation][components] has detailed information on writing a
component. The most basic component takes the form of:

```js
AFRAME.registerComponent('component-name', {
  // Define component properties.
  schema: {},

  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    // Do stuff using `this.el` and `this.data`.
  }
});
```

### Update Raycaster Component

First, let us whitelist the entities that the cursor's raycaster is checking
for intersections against. That way, the cursor will only click if something
can be clicked, and it is also better for performance. The cursor is built on
top of the [raycaster component][raycaster], and we can configure the
raycaster. We update the raycaster component's `objects` property which takes a
selector:

```html
<a-cursor id="cursor" raycaster="objects: .link">
```

This list will be populated once the raycaster component attaches.
Unfortunately since the links are templated, they won't be found at that time.
What we can do is write a component that refreshes our raycaster when the link
attaches. Here is the skeleton of our component:

```js
AFRAME.registerComponent('update-raycaster', {
  schema: {
    // ...
  },

  init: function () {
    // ...
  }
});
```

First, we fill out the [`schema`][schema] so that we can pass in which raycaster to
update. We make it a single-property schema that takes a selector such that we can
simply do `update-raycaster="#cursor"`:

```js
AFRAME.registerComponent('update-raycaster', {
  schema: {
    type: 'selector'
  },

  init: function () {
    // ...
  }
});
```

Then we use that data to actually update the raycaster in the `init` lifecycle
method, which is called when the component is attached to the entity. We grab
the raycaster and update it:

```js
AFRAME.registerComponent('update-raycaster', {
  schema: {
    type: 'selector'
  },

  init: function () {
    var raycasterEl = this.data;
    this.data.components.raycaster.refreshObjects();
  }
});
```

### Set-Image Component

> View the full [`set-image` component on GitHub](https://github.com/aframevr/360-image-viewer-boilerplate/blob/master/components/set-image.js).

Finally, we write the component that fades the sky into a new 360&deg; image
once one of the links are clicked. Here is the skeleton for our set-image
component.

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

[a-sky]: ../primitives/a-sky.md
[ams]: ../core/asset-management-system.md
[animation]: ../core/animations.md
[animation-begin]: ../core/animations.md#begin
[awesome]: https://github.com/aframevr/awesome-aframe#components
[basic]: ./building-a-basic-scene.md
[boilerplate]: https://github.com/ngokevin/aframe-component-boilerplate
[camera]: ../primitives/camera.md
[codepen]: http://codepen.io/team/mozvr/pen/PNoWEz/?editors=1000
[components]: ../core/component.md
[cursor]: ../components/cursor.md
[cursor-events]: ../components/cursor.md#events
[data]: https://developer.mozilla.org/docs/Web/Guide/HTML/Using_data_attributes
[ecs]: ../core/index.md
[event-set]: https://github.com/ngokevin/aframe-event-set-component
[github]: https://github.com/ngokevin/aframe-fps-example
[kdist]: https://github.com/ngokevin/kframe/tree/master/dist
[kframe]: https://github.com/ngokevin/kframe/
[kmin]: https://raw.githubusercontent.com/ngokevin/kframe/master/dist/kframe.min.js
[layout]: https://github.com/ngokevin/aframe-layout-component
[material]: ../components/material.md
[mixin]: ../core/mixins.md
[multi-property]: ../core/component.md#multi-property-component
[multiple]: ../core/component.md#multiple-instances
[ngokevin]: https://github.com/ngokevin
[nunjucks]: https://mozilla.github.io/nunjucks/
[raycaster]: http://threejs.org/docs/index.html#Reference/Core/Raycaster
[raycaster-component]: ../components/raycaster.md
[scale]: ../components/scale.md
[schema]: ../components/components.md#schema
[sound]: ../components/sound.md
[template]: https://github.com/ngokevin/aframe-template-component
[three]: http://threejs.org
[webcomponents]: http://webcomponents.org/
