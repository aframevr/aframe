---
title: embedded
type: components
layout: docs
parent_section: components
source_code: src/components/scene/embedded.js
examples: []
---

The embedded component removes fullscreen CSS styles from A-Frame's
`<canvas>` element, making it easier to embed within the layout of an
existing webpage.  Embedding removes the default fixed positioning from
the canvas and makes the Enter VR button smaller.

## Example

Add the `embedded` component, then style the `<a-scene>` element with CSS as if
it were an empty `<div>`. Within `<a-scene>` is the `<canvas>` element.

```html
a-scene {
  height: 300px;
  width: 600px;
}

<body>
  <div id="myEmbeddedScene">
    <a-scene embedded>
      <!-- ... -->
    </a-scene>
  </div>
</body>
```

An inline example of an embedded scene:

<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>

<style>
  #myEmbeddedScene {
    width:100%;
    height:200px;
  }
</style>

<div id="myEmbeddedScene">
  <a-scene background="color: #ECECEC" embedded>
    <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" shadow></a-box>
    <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E" shadow></a-sphere>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D" shadow></a-cylinder>
    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4" shadow></a-plane>
  </a-scene>
</div>

## Integration with the 2D Page

Embedded scenes can be visually integrated and can interact with the rest of
the 2D page. Some things we could do:

- Use CSS `z-index` to put an HTML element above or under the scene
- Use a transparent `<a-sky>` or no background to overlay `<a-scene>` on top of the page, with underlying HTML elements visible
- Use interaction with HTML elements (e.g., buttons, forms) to affect the scene

## Using I-Frames

Only one `<a-scene>` can exist on a page. Alternatively, we can use an
`<iframe>` with `allowfullscreen="yes"` and `allowvr="yes"` to display multiple
scenes. For now, if the I-Frame is not on the same origin as the page, the
WebVR polyfill for mobile won't work and there won't be any tracked rotation of
the device.
