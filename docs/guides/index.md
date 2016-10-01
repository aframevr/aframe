---
title: Building with Basic HTML
section_title: Guides
type: guides
layout: docs
parent_section: docs
order: 1
section_order: 2
---

[primitives]: ../primitives/

Let's build a scene using A-Frame's basic [primitive][primitives] HTML
building blocks!

<!--toc-->

## Adding a Box

This sample *Hello World* scene starts with a box:

```html
<a-scene>
  <a-box color="#6173F4" width="4" height="10" depth="2"></a-box>
</a-scene>
```

[box]: ../primitives/a-box.md

Just like with regular HTML elements, we can configure the element by setting
HTML attributes. Here, we define the color, width, height, depth of `<a-box>`.
See the [`<a-box>`][box] documentation to see the available attributes.

[mozvr]: http://mozvr.com/#start

For flat displays, the default control scheme lets us look around by
click-dragging the mouse and move with the `WASD` keys. Upon
[entering VR][mozvr], the default control scheme lets us look around with a VR
headset and, if room scale is possible, literally *walk* around.

## Transforming the Box

A-Frame uses a right-handed coordinate system:

- Positive X-axis is "right"
- Positive Y-axis is "up"
- Positive Z-axis is pointing out of the screen towards us

The basic distance unit is defined in meters. When designing a scene for VR, it
is important to consider the real world scale of the objects we create. A box
with `height="100"` may look normal on our computer screens, but in VR the
box will appear massive.

The basic rotational unit is defined in degrees. To determine the positive
direction of rotation, use the right-hand rule. Point our thumbs down the
direction of a positive axis, and the direction which our fingers curl around
the positive direction of rotation.

[component]: ../core/component.md
[position]: ../components/position.md
[rotation]: ../components/rotation.md
[scale]: ../components/scale.md

To translate, rotate, and scale the box, we can configure the
[position][position], [rotation][rotation], and [scale][scale]
[components][component]:

```html
<a-scene>
  <a-box color="#6173F4" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"></a-box>
</a-scene>
```

The example above (assuming we are positioned on the origin looking down the
negative Z-axis) will translate the box left/up/back, rotate the box to the
right, stretch the box left-and-right and back-and-front, and shrink the box
up-and-down:

## Applying a Texture to the Box

We can apply an image texture to the box with an image or video using the `src`
attribute. To make sure the color does not mix with the texture, we set the
background color to white:

```html
<a-scene>
  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="texture.png"></a-box>
</a-scene>
```

[asset]: ../core/asset-management-system.md

It is best to cache the texture and block the scene from rendering until
the texture has loaded.  To do so we must move the texture into the [asset management
system][asset] by:

- Defining the asset as an `<img>`
- Giving it an ID (`id="texture"`)
- Referring to the asset using the ID in selector format (`#texture`)

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="#texture"></a-box>
</a-scene>
```

## Animating the Box

[animation]: ../core/animation.md

We can add an animation to the box using the built-in [animation
system][animation]. We can place an `<a-animation>` element as a child of the
entity to interpolate values. Let's have the box rotate indefinitely to add
some motion to the scene:

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="#texture">
    <a-animation attribute="rotation" repeat="indefinite" to="0 360 0"></a-animation>
  </a-box>
</a-scene>
```

## Interacting with the Box

To interact with the box via clicking or gazing, we can use a cursor which we
place as a child of the camera such that it is fixed to the screen. When we
don't define a camera, the scene will inject a default camera, but in this case
to add a cursor, we will need to explicitly define a camera.

Next we direct the animation to start when the cursor clicks the
box, using the animation's `begin` attribute. The cursor will emit the
`click` event on the box, and the animation will listen for it:

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="#texture">
    <!-- Animation will only play when the box is clicked. -->
    <a-animation attribute="rotation" begin="click" repeat="indefinite" to="0 360 0"></a-animation>
  </a-box>

  <a-camera position="0 1.8 0">
    <a-cursor color="#2E3A87"></a-cursor>
  </a-camera>
</a-scene>
```

As an aside, a more advanced method would be to write a component that listens
to an event and does whatever we want it to do:

```js
AFRAME.registerComponent('scale-on-click', {
  schema: {
    to: {default: '2 2 2'}
  },

  init: function () {
    var data = this.data;
    this.el.addEventListener('click', function () {
      this.setAttribute('scale', data.to);
    });
  }
});
```

We can then attach the component to the `<a-box>` primitive:

```html
<a-box color="#FFF" width="4" height="10" depth="2"
       position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
       src="#texture" scale-on-click="to: 3 3 3">
  <!-- Animation will only play when the box is clicked. -->
  <a-animation attribute="rotation" begin="click" repeat="indefinite" to="0 360 0"></a-animation>
</a-box>
```

## Lighting the Box

[light]: ../primitives/a-light.md

We can change how the scene is lit with [`<a-light>`][light]. By default the
scene will inject an ambient light and a directional light (which acts like the
sun). Once we add lights of our own, however, the default lighting setup is removed:

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="#texture">
    <!-- Animation will only play when the box is clicked. -->
    <a-animation attribute="rotation" begin="click" repeat="indefinite" to="0 360 0"></a-animation>
  </a-box>

  <!-- New lights. -->
  <a-light type="spot" color="#333" position="-20 0 0" look-at="a-box"></a-light>
  <a-light type="point" color="#AAA" position="0 5 0"></a-light>

  <a-camera position="0 1.8 0">
    <a-cursor color="#2E3A87">
  </a-camera>
</a-scene>
```

## Adding a Background to the Scene

[sky]: ../primitives/a-sky.md

Lastly, we can add a background to the scene using [`<a-sky>`][sky]. The
background can be a color, a 360&deg; image, or even a 360&deg; video:

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="#texture">
    <!-- Animation will only play when the box is clicked. -->
    <a-animation attribute="rotation" begin="click" repeat="indefinite" to="0 360 0"></a-animation>
    <a-event name="mouseenter" scale="4 1 6"></a-event>
  </a-box>

  <!-- New lights. -->
  <a-light type="spot" color="#333" position="-20 0 0" look-at="a-box"></a-light>
  <a-light type="point" color="#AAA" position="0 5 0"></a-light>

  <!-- Background. -->
  <a-sky color="#73F7DD"></a-sky>

  <a-camera position="0 1.8 0">
    <a-cursor color="#2E3A87">
  </a-camera>
</a-scene>
```

[next]: ./build-with-components.md

That is all it takes to create a very basic scene which places static objects in a 3D space using
HTML. A good VR experience requires rich interaction and dynamic behavior. With
the help of A-Frame components, we can [build a more advanced
scene][next].
