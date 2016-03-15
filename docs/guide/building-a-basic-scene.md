---
title: Building a Basic Scene
type: guide
layout: docs
parent_section: guide
order: 3
show_guide: true
---

Let's first start building a scene using [primitives][primitives], the basic building blocks of A-Frame with familiar HTML syntax. Under the hood, primitives are aliases [entities][entity] that proxy HTML attribute values to component property values. A-Frame is bundled with a handful of primitives for common use cases such as backgrounds, images, meshes, models, images, and videos.

## Adding a Box

The simplest scene would be a scene containing a box primitive:

```html
<a-scene>
  <a-box color="#6173F4" width="4" height="10" depth="2"></a-box>
</a-scene>
```

Just like with regular HTML elements, each attribute of the entity maps to one value. We can define a color, width, height, and depth of `<a-box>`. To see more attributes that `<a-box>` and other geometric primitives can accept, check out the [common mesh attributes][mesh].

Once we open up our scene, the default control setup allows us to look and walk around. To look around, we can drag the mouse or just look around with a mobile device or a Rift. To walk around, we can use the WASD keys. Then to [enter VR][mozvr], click on the Enter VR button.

## Transforming the Box

A-Frame uses a right-handed coordinate system which can be roughly thought of:

- Positive X-axis as "right"
- Positive Y-axis as "up"
- Positive Z-axis as going out of the screen towards us.

The basic distance unit in is defined in meters. When designing a scene for virtual reality, it is important to consider the real world scale of the objects we create. A box with `height="100"` may look ordinary on our computer screens, but in virtual reality it will look like a massive 100-meter tall monolith.

And the basic rotational unit is defined in degrees. To determine the positive direction of rotation, we can point our thumbs down the direction of a positive axis, and the direction which our fingers curl is the positive direction of rotation.

To translate, rotate, and scale the box, we can plug in the [position][position], [rotation][rotation], and [scale][scale] [components][component]. The example below (assuming we are positioned on the origin looking down the negative Z-axis) will translate the box left/up/back, rotate the box to the right, stretches the box left-and-right and back-and-front, and shrinks the box up-and-down:

```html
<a-scene>
  <a-box color="#6173F4" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"></a-box>
</a-scene>
```

## Applying a Texture to the Box

The box doesn't have to be just a flat color. We can wrap a texture around the box with an image or video using `src`. To make sure the color does not mix with the texture, we set the color to white:

```html
<a-scene>
  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="texture.png"></a-box>
</a-scene>
```

To cache the texture and have the scene wait for it to load before rendering, we can move the texture into the [asset management system][asset]. We define it as an `<img>` tag, give it an ID, and point to it using a selector:

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

We can add an animation to the box using the built-in [animation system][animation]. An animation is defined by placing an `<a-animation>` tag as a child of the entity to animate. Let's have the box rotate indefinitely to get some motion into our scene:

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

To interact with the box via clicking or gazing, we can use a cursor which we place as a child of the camera such that it is fixed to the screen. When we don't define a camera, the scene will inject a default camera, but in this case to add a cursor, we will need to define one. Then what we can do is to tell the animation only to start when the cursor clicks the box, by having the box emit the `click` event, using the animation's `begin` attribute which takes an event name:

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
    <a-cursor color="#2E3A87">
  </a-camera>
</a-scene>
```

Alternatively, we could just use vanilla JavaScript to manually register an event listener and visually change the box when we look at it:

```js
var box = document.querySelector('a-box');
box.addEventListener('mouseenter', function () {
  box.setAttribute('scale', {
    x: 4,
    y: 1,
    z: 6
  });
});
```

Or alternatively, we can use [<a-event>][events] helper element to declaratively register an event handler:

```html
<a-scene>
  <a-assets>
    <img id="texture" src="texture.png">
  </a-assets>

  <a-box color="#FFF" width="4" height="10" depth="2"
         position="-10 2 -5" rotation="0 0 45" scale="2 0.5 3"
         src="#texture">
    <a-animation attribute="rotation" begin="click" repeat="indefinite" to="0 360 0"></a-animation>
    <!-- The box will change scale when it emits the mouseenter event. -->
    <a-event name="mouseenter" scale="4 1 6"></a-event>
  </a-box>

  <a-camera position="0 1.8 0">
    <a-cursor color="#2E3A87">
  </a-camera>
</a-scene>
```

## Lighting the Box

We can change how the scene is lit using the [light primitive][light], `<a-light>`. By default, the scene will inject an ambient light and a directional light (like the sun). Let's adjust the lighting conditions of the scene adding different kinds of light:

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

  <a-camera position="0 1.8 0">
    <a-cursor color="#2E3A87">
  </a-camera>
</a-scene>
```

## Adding a Background to the Scene

Finally, we can add a background to the scene using the [sky primitive][sky], `<a-sky>`. The background can be a color or even a 360-degree image or video. But let's just keep it simple and use a color:

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

  <a-sky color="#73F7DD"></a-sky>

  <a-camera position="0 1.8 0">
    <a-cursor color="#2E3A87">
  </a-camera>
</a-scene>
```

And that wraps up our basic scene. Once we get past the novelty of placing static objects in a 3D space in HTML, we want to be able to add complex appearance, behavior, and functionality. We can do so by [using and writing components][next].

[animation]: ../core/animation.md
[asset]: ../core/asset-management-system.md
[component]: ../core/component.md
[entity]: ../core/entity.md
[events]: ../extras/declarative-events.md
[light]: ../primitives/light.md
[mesh]: ../primitives/mesh-attributes.md
[mozvr]: https://mozvr.com#start
[next]: ./using-and-writing-components.md
[position]: ../components/position.md
[primitives]: ../primitives/
[rotation]: ../components/rotation.md
[scale]: ../components/scale.md
[sky]: ../primitives/sky.md
[threejs]: http://threejs.org
